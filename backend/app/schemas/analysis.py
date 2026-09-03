from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class MessageAnalysisRequest(BaseModel):
    message: str = Field(..., min_length=3, description="UPI/Bank SMS or chat text to analyze")
    language_hint: Optional[str] = None

class MessageAnalysisResponse(BaseModel):
    risk_score: float = Field(..., ge=0, le=100)
    category: str  # LOW, SUSPICIOUS, HIGH, CRITICAL
    confidence: float
    scam_type: str
    detected_language: str
    language_display: str
    indicators: List[str]
    feature_contributions: Dict[str, float]
    recommendation: str
    safe_to_proceed: bool

class URLAnalysisRequest(BaseModel):
    url: str = Field(..., min_length=3, description="URL or link to check for phishing")

class URLAnalysisResponse(BaseModel):
    url: str
    domain: str
    is_https: bool
    risk_score: float
    category: str
    confidence: float
    warnings: List[str]
    brand_impersonation: Optional[str] = None
    feature_contributions: Dict[str, float]
    recommendation: str

class UPIAnalysisRequest(BaseModel):
    upi_id: str = Field(..., min_length=3, description="VPA / UPI ID to check (e.g. user@okhdfcbank)")

class UPIAnalysisResponse(BaseModel):
    upi_id: str
    handle: str
    display_name: Optional[str] = None
    risk_score: float
    category: str
    status: str  # SAFE, SUSPICIOUS, HIGH_RISK
    report_count: int
    connected_entities_count: int
    is_verified_merchant: bool
    suspicious_patterns: List[str]
    feature_contributions: Dict[str, float]
    recommendation: str

class QRAnalysisRequest(BaseModel):
    qr_data: Optional[str] = None
    image_base64: Optional[str] = None

class QRAnalysisResponse(BaseModel):
    raw_payload: str
    is_valid_upi_qr: bool
    payee_upi: Optional[str] = None
    payee_name: Optional[str] = None
    amount: Optional[float] = None
    currency: str = "INR"
    transaction_ref: Optional[str] = None
    risk_score: float
    category: str
    reasons: List[str]
    feature_contributions: Dict[str, float]
    recommendation: str
    safe_to_proceed: bool

class TransactionAnalysisRequest(BaseModel):
    amount: float = Field(..., gt=0)
    time_str: Optional[str] = "14:30"
    hour: Optional[int] = 14
    location: str = "Bengaluru, IN"
    recipient_upi: str
    recipient_name: Optional[str] = "Demo Payee"
    is_new_recipient: bool = False
    device_id: str = "Demo_Device_1"
    device_changed: bool = False
    transaction_frequency_today: int = 2

class TransactionAnalysisResponse(BaseModel):
    risk_score: float
    category: str
    confidence: float
    amount_anomaly_pct: float
    time_anomaly_pct: float
    recipient_novelty_pct: float
    location_anomaly_pct: float
    device_anomaly_pct: float
    isolation_forest_score: float
    indicators: List[str]
    feature_contributions: Dict[str, float]
    recommendation: str
    safe_to_proceed: bool

class UnifiedRiskRequest(BaseModel):
    message: Optional[str] = None
    url: Optional[str] = None
    upi_id: Optional[str] = None
    qr_data: Optional[str] = None
    amount: Optional[float] = None
    transaction_data: Optional[Dict[str, Any]] = None

class UnifiedRiskResponse(BaseModel):
    overall_risk_score: float
    category: str
    confidence: float
    scam_type: str
    component_scores: Dict[str, float]
    feature_contributions: Dict[str, float]
    all_indicators: List[str]
    recommended_action: str
    safe_to_proceed: bool
