#!/usr/bin/env python3
"""
OCR script to extract bank details from payment proof images.

Usage:
    python ocr_scan.py /path/to/image.png

Requirements:
    pip install pillow pytesseract opencv-python numpy

System dependencies:
    - Tesseract OCR (sudo apt-get install tesseract-ocr)
"""

from __future__ import annotations
import re
import json
import sys
from dataclasses import dataclass
from typing import Optional, Dict, Any, List

try:
    import numpy as np
    import cv2
    from PIL import Image
    import pytesseract
except ImportError as e:
    print(f"Error: Missing required package. Install with: pip install pillow pytesseract opencv-python numpy", file=sys.stderr)
    sys.exit(1)


@dataclass
class ScanResult:
    bank_name: Optional[str]
    account_number: Optional[str]
    account_name: Optional[str]
    raw_text: str
    confidence_notes: List[str]


BANK_KEYWORDS = [
    "maybank", "cimb", "public bank", "hong leong", "rhb", "ambank", "hsbc",
    "uob", "ocbc", "bank islam", "bank rakyat", "affin", "alliance", "standard chartered"
]

# Common labels on receipts/screenshots
NAME_LABELS = ["account name", "name", "beneficiary", "recipient", "to", "payee"]
ACC_LABELS  = ["account number", "acc no", "acct no", "a/c no", "no akaun", "akaun", "account no", "acc number"]
BANK_LABELS = ["bank", "bank name"]


def _preprocess_image(img_bgr: np.ndarray) -> np.ndarray:
    """Improve OCR quality: grayscale + denoise + threshold."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    # Adaptive threshold helps screenshots with gradients
    thr = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                cv2.THRESH_BINARY, 31, 2)
    return thr


def _ocr_text(img_path: str) -> str:
    img = cv2.imread(img_path)
    if img is None:
        raise ValueError(f"Could not read image: {img_path}")
    proc = _preprocess_image(img)
    # PSM 6 works well for receipts/screens
    config = "--oem 3 --psm 6"
    text = pytesseract.image_to_string(proc, config=config)
    return text


def _normalize(text: str) -> str:
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def _find_bank(text: str) -> Optional[str]:
    t = text.lower()
    # First: explicit "Bank: X"
    bank_line = _find_value_after_labels(text, BANK_LABELS)
    if bank_line:
        return bank_line

    # Second: keyword match
    for kw in BANK_KEYWORDS:
        if kw in t:
            # Return a nicely cased version
            return kw.title()
    return None


def _find_account_number(text: str) -> Optional[str]:
    # Prefer label-based
    val = _find_value_after_labels(text, ACC_LABELS)
    if val:
        digits = re.sub(r"\D", "", val)
        if 8 <= len(digits) <= 20:
            return digits

    # Fallback: find digit groups that look like acct nos
    # Many MY bank acc nos are 10-14 digits, but we allow wider.
    candidates = re.findall(r"\b\d{8,20}\b", text.replace(" ", ""))
    if candidates:
        # Choose the longest
        candidates.sort(key=len, reverse=True)
        return candidates[0]
    return None


def _find_account_name(text: str) -> Optional[str]:
    val = _find_value_after_labels(text, NAME_LABELS)
    if val:
        # Clean weird OCR artifacts
        val = re.sub(r"[^A-Za-z0-9 @&.'-]", "", val).strip()
        # Avoid returning label itself
        if len(val) >= 3:
            return val

    # Fallback heuristic: look for a line with many letters and few digits
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    best = None
    best_score = 0
    for ln in lines:
        letters = sum(ch.isalpha() for ch in ln)
        digits = sum(ch.isdigit() for ch in ln)
        if letters >= 6 and digits <= 2:
            score = letters - digits
            if score > best_score:
                best_score = score
                best = ln
    return best


def _find_value_after_labels(text: str, labels: List[str]) -> Optional[str]:
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    labels_lower = [l.lower() for l in labels]

    for i, ln in enumerate(lines):
        low = ln.lower()
        for lab in labels_lower:
            # match patterns like "Account Number: 123" or "Account No 123"
            if lab in low:
                # try split by colon
                parts = re.split(r"[:\-]", ln, maxsplit=1)
                if len(parts) == 2 and parts[1].strip():
                    return parts[1].strip()
                # else try next line as value
                if i + 1 < len(lines):
                    nxt = lines[i + 1].strip()
                    if nxt and nxt.lower() not in labels_lower:
                        return nxt
    return None


def scan_payment_proof(image_path: str) -> Dict[str, Any]:
    """Main function to scan payment proof and extract bank details."""
    raw = _ocr_text(image_path)
    text = _normalize(raw)

    notes: List[str] = []
    bank = _find_bank(text)
    if not bank:
        notes.append("Bank not confidently detected.")

    acc_no = _find_account_number(text)
    if not acc_no:
        notes.append("Account number not confidently detected.")

    acc_name = _find_account_name(text)
    if not acc_name:
        notes.append("Account name not confidently detected.")

    result = ScanResult(
        bank_name=bank,
        account_number=acc_no,
        account_name=acc_name,
        raw_text=text,
        confidence_notes=notes
    )
    
    return result.__dict__


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ocr_scan.py /path/to/image.png", file=sys.stderr)
        sys.exit(1)

    try:
        result = scan_payment_proof(sys.argv[1])
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "bank_name": None,
            "account_number": None,
            "account_name": None,
            "raw_text": "",
            "confidence_notes": ["OCR scan failed"]
        }), file=sys.stderr)
        sys.exit(1)

