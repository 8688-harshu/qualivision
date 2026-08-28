import os
import sys
import pytest
import numpy as np
import cv2
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["ml_model_loaded"] is True

def test_model_info_endpoint():
    response = client.get("/api/v1/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "accuracy" in data
    assert "confusion_matrix" in data

def test_analyze_image_endpoint():
    img = np.zeros((300, 400, 3), dtype=np.uint8)
    cv2.circle(img, (200, 150), 50, (0, 255, 0), -1)
    _, img_bytes = cv2.imencode(".jpg", img)

    response = client.post(
        "/api/v1/analyze",
        files={"file": ("test_clean.jpg", img_bytes.tobytes(), "image/jpeg")}
    )

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert "quality_score" in data
    assert "quality_label" in data
    assert "issues" in data
    assert "cv_metrics" in data
    assert "explainability" in data
    assert data["quality_label"] in ["ACCEPTABLE", "DEGRADED", "DEFECTIVE"]

def test_list_analyses_endpoint():
    response = client.get("/api/v1/analyses")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "analyses" in data
    assert data["total"] > 0
