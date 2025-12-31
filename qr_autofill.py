#!/usr/bin/env python3
"""
QR code detection and name extraction from QR code screenshots.
Used to autofill host display name when uploading QR screenshots.

Usage:
    python qr_autofill.py <input_image> <output_crop_image>

Requirements:
    pip install opencv-python pyzbar pillow pytesseract numpy

System dependencies:
    - Tesseract OCR (brew install tesseract on Mac, apt-get install tesseract-ocr on Ubuntu)
    - ZBar (usually comes with pyzbar, but may need libzbar0: sudo apt-get install libzbar0)
"""

from __future__ import annotations

import re
import json
import sys
from dataclasses import dataclass, asdict
from typing import Optional, Tuple, Dict, Any

try:
    import cv2
    import numpy as np
    import pytesseract
    from pyzbar.pyzbar import decode as zbar_decode
except ImportError as e:
    print(
        f"Error: Missing required package. Install with: pip install opencv-python pyzbar pillow pytesseract numpy",
        file=sys.stderr
    )
    sys.exit(1)


@dataclass
class QRAutofillResult:
    ok: bool
    full_name: Optional[str]
    qr_payload: Optional[str]
    qr_crop_path: Optional[str]
    debug: Dict[str, Any]


def _read_image(path: str) -> np.ndarray:
    img = cv2.imread(path)
    if img is None:
        raise ValueError(f"Could not read image at: {path}")
    return img


def _detect_qr_bbox(img_bgr: np.ndarray) -> Tuple[Optional[Tuple[int, int, int, int]], Optional[str]]:
    """
    Returns (x,y,w,h) bbox of QR and decoded payload (if available).
    Uses pyzbar first (gives bbox even when payload sometimes fails).
    """
    decoded = zbar_decode(img_bgr)
    if not decoded:
        return None, None

    # take the biggest QR-like symbol
    best = max(decoded, key=lambda d: d.rect.width * d.rect.height)
    x, y, w, h = best.rect.left, best.rect.top, best.rect.width, best.rect.height
    payload = None
    try:
        payload = best.data.decode("utf-8", errors="ignore") or None
    except Exception:
        payload = None
    return (x, y, w, h), payload


def _safe_expand_bbox(
    bbox: Tuple[int, int, int, int],
    img_shape: Tuple[int, int, int],
    pad_ratio: float = 0.18
) -> Tuple[int, int, int, int]:
    x, y, w, h = bbox
    H, W = img_shape[:2]
    pad = int(max(w, h) * pad_ratio)

    x0 = max(0, x - pad)
    y0 = max(0, y - pad)
    x1 = min(W, x + w + pad)
    y1 = min(H, y + h + pad)
    return x0, y0, x1, y1


def _crop_and_enhance_qr(img_bgr: np.ndarray, bbox: Tuple[int, int, int, int]) -> np.ndarray:
    """
    Crop QR with padding and upscale + sharpen for better preview.
    """
    x0, y0, x1, y1 = _safe_expand_bbox(bbox, img_bgr.shape, pad_ratio=0.22)
    crop = img_bgr[y0:y1, x0:x1].copy()

    # Upscale to make QR look crisp in UI
    scale = 2.0 if max(crop.shape[:2]) < 800 else 1.5
    crop = cv2.resize(crop, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

    # Mild sharpening
    kernel = np.array([[0, -1, 0],
                       [-1,  5, -1],
                       [0, -1, 0]])
    crop = cv2.filter2D(crop, -1, kernel)
    return crop


def _extract_name_region(img_bgr: np.ndarray) -> np.ndarray:
    """
    For common QR screenshot layouts like your example:
    - Name is near the top-center above QR.
    We OCR only the top ~35% area to avoid noise.
    """
    H, W = img_bgr.shape[:2]
    y0 = int(H * 0.10)
    y1 = int(H * 0.40)
    x0 = int(W * 0.10)
    x1 = int(W * 0.90)
    return img_bgr[y0:y1, x0:x1].copy()


def _clean_name(text: str) -> Optional[str]:
    # normalize
    t = re.sub(r"\s+", " ", text).strip()

    # Remove common noisy lines / words that appear in these screens
    blacklist = [
        "touch 'n go", "ewallet", "malaysia national qr", "scan with any",
        "banking apps", "transfer money", "pay", "duitnow", "qr"
    ]
    low = t.lower()
    for b in blacklist:
        low = low.replace(b, "")

    # Keep mostly letters/spaces
    candidate = re.sub(r"[^A-Za-z\s'.-]", "", low).strip()
    candidate = re.sub(r"\s+", " ", candidate).strip()

    # Heuristic: name is usually ALL CAPS and >= 5 chars
    if len(candidate) < 5:
        return None

    # Title-case but keep certain formatting
    return candidate.upper()


def _ocr_full_name(img_bgr: np.ndarray) -> Optional[str]:
    region = _extract_name_region(img_bgr)
    gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    thr = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                cv2.THRESH_BINARY, 31, 2)

    config = "--oem 3 --psm 6"
    text = pytesseract.image_to_string(thr, config=config)
    return _clean_name(text)


def process_qr_screenshot(
    input_path: str,
    output_crop_path: str,
) -> QRAutofillResult:
    """
    Main entrypoint:
    - Detect QR bbox, crop, enhance, save to output path
    - OCR name from top region
    - Return payload + name
    """
    img = _read_image(input_path)

    bbox, payload = _detect_qr_bbox(img)
    if bbox is None:
        return QRAutofillResult(
            ok=False,
            full_name=_ocr_full_name(img),
            qr_payload=None,
            qr_crop_path=None,
            debug={"reason": "QR not detected via pyzbar"}
        )

    qr_crop = _crop_and_enhance_qr(img, bbox)
    cv2.imwrite(output_crop_path, qr_crop)

    full_name = _ocr_full_name(img)

    return QRAutofillResult(
        ok=True,
        full_name=full_name,
        qr_payload=payload,
        qr_crop_path=output_crop_path,
        debug={"bbox": bbox, "payload_present": bool(payload)}
    )


if __name__ == "__main__":
    # Example usage
    if len(sys.argv) < 3:
        print("Usage: python qr_autofill.py <input_image> <output_crop_image>", file=sys.stderr)
        sys.exit(1)

    try:
        res = process_qr_screenshot(sys.argv[1], sys.argv[2])
        # Output as JSON for easy parsing
        print(json.dumps(asdict(res), indent=2))
    except Exception as e:
        print(json.dumps({
            "ok": False,
            "full_name": None,
            "qr_payload": None,
            "qr_crop_path": None,
            "debug": {"error": str(e)}
        }), file=sys.stderr)
        sys.exit(1)

