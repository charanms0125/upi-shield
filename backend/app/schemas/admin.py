from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class SuspiciousUPIItem(BaseModel):
    upi_id: str
    risk_score: float
    report_count: int
    connected_entities: int
    status: str

class DailyFraudTrend(BaseModel):
    date: str
    total_scans: int
    threats_detected: int
    blocked_count: int

class AdminStatisticsOut(BaseModel):
    total_transactions_protected: int
    scans_performed: int
    threats_detected: int
    blocked_suspicious_count: int
    protected_volume_inr: float
    active_risk_level: str
    scam_category_distribution: Dict[str, int]
    risk_score_distribution: Dict[str, int]
    daily_trends: List[DailyFraudTrend]
    top_suspicious_upis: List[SuspiciousUPIItem]
    geo_distribution: List[Dict[str, Any]]

class ModelPerformanceOut(BaseModel):
    model_name: str
    model_type: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: Dict[str, Any]
    training_sample_count: int
    synthetic_disclaimer: str
