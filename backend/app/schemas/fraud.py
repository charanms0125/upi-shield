from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class FraudReportCreate(BaseModel):
    reported_upi: str = Field(..., min_length=3)
    reported_phone: Optional[str] = None
    transaction_ref: Optional[str] = None
    amount_lost: float = Field(0.0, ge=0)
    scam_type: str
    description: Optional[str] = None
    screenshot_name: Optional[str] = None

class FraudIncidentSummary(BaseModel):
    incident_id: str
    amount_lost: float
    reported_upi: str
    reported_phone: Optional[str] = None
    transaction_ref: Optional[str] = None
    scam_type: str
    risk_category: str
    description: Optional[str] = None
    created_at: str
    official_1930_advisory: str
    cybercrime_portal_link: str
    recommended_immediate_steps: List[str]

class FraudReportOut(BaseModel):
    id: int
    incident_id: str
    reported_upi: str
    reported_phone: Optional[str] = None
    transaction_ref: Optional[str] = None
    amount_lost: float
    scam_type: str
    description: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AlertOut(BaseModel):
    id: int
    severity: str
    title: str
    description: str
    related_entity: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class FraudNetworkNode(BaseModel):
    id: str
    label: str
    type: str  # USER, UPI, ACCOUNT, PHONE
    risk_score: float
    risk_category: str
    report_count: int
    details: Dict[str, Any] = {}

class FraudNetworkEdge(BaseModel):
    source: str
    target: str
    relation: str
    risk_weight: float

class FraudNetworkGraphResponse(BaseModel):
    nodes: List[FraudNetworkNode]
    edges: List[FraudNetworkEdge]
    total_nodes: int
    total_edges: int
    suspicious_clusters_count: int
