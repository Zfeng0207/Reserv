# Dockerfile for QR Autofill Service
# Deploy to Render, Railway, Fly.io, or Google Cloud Run

FROM python:3.11-slim

# Install system dependencies for OpenCV, Tesseract, and ZBar
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libzbar0 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY api/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY api/qr_service.py .
COPY qr_autofill.py .

# Expose port (Render/Railway use PORT env var)
EXPOSE 5000

# Run Flask app
# For Render/Railway: PORT is set automatically
# For local: defaults to 5000
CMD python qr_service.py

