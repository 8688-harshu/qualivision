from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class QualityIssue(BaseModel):
    type: str = Field(...)
    severity: str = Field(...)
    confidence: float = Field(...)
    description: Optional[str] = None

class AnalysisResultResponse(BaseModel):
    id: str
    filename: str
    original_image_url: str
    heatmap_image_url: Optional[str] = None
    file_size_bytes: int
    width: int
    height: int
    quality_score: int
    quality_label: str
    issues: List[QualityIssue]
    cv_metrics: Dict[str, Any]
    explainability: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedAnalysisResponse(BaseModel):
    total: int
    page: int
    limit: int
    analyses: List[AnalysisResultResponse]
