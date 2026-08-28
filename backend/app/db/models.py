from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Text
from datetime import datetime
import uuid
from app.db.database import Base

class ImageAnalysis(Base):
    __tablename__ = "image_analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    original_image_url = Column(String(512), nullable=False)
    heatmap_image_url = Column(String(512), nullable=True)
    
    file_size_bytes = Column(Integer, nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)

    quality_score = Column(Integer, nullable=False)
    quality_label = Column(String(50), nullable=False)

    issues = Column(JSON, nullable=False)
    cv_metrics = Column(JSON, nullable=False)
    explainability = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
