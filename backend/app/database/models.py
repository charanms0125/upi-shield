from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    phone_number = Column(String(50), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user")  # "user" or "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="user")
    reports = relationship("FraudReport", back_populates="user")
    device_profile = relationship("DeviceProfile", back_populates="user", uselist=False)

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_ref = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    sender_upi = Column(String(255), nullable=False)
    recipient_upi = Column(String(255), nullable=False, index=True)
    recipient_name = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    location = Column(String(255), default="Bengaluru, IN")
    device_id = Column(String(255), default="Android_Device_A1")
    ip_address = Column(String(50), default="103.21.124.50")
    is_flagged = Column(Boolean, default=False)
    risk_score = Column(Float, default=0.0)
    risk_category = Column(String(50), default="LOW")  # LOW, SUSPICIOUS, HIGH, CRITICAL
    anomaly_indicators = Column(JSON, default=list)
    status = Column(String(50), default="COMPLETED")  # COMPLETED, BLOCKED, FLAGGED, SIMULATED
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")

class UPIIdentifier(Base):
    __tablename__ = "upi_identifiers"

    id = Column(Integer, primary_key=True, index=True)
    upi_id = Column(String(255), unique=True, index=True, nullable=False)
    display_name = Column(String(255), nullable=True)
    handle = Column(String(50), nullable=True)  # e.g., okaxis, ybl, paytm
    risk_score = Column(Float, default=15.0)
    risk_status = Column(String(50), default="SAFE")  # SAFE, SUSPICIOUS, HIGH_RISK
    report_count = Column(Integer, default=0)
    connected_entities_count = Column(Integer, default=0)
    verified_merchant = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FraudReport(Base):
    __tablename__ = "fraud_reports"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reported_upi = Column(String(255), nullable=False)
    reported_phone = Column(String(50), nullable=True)
    transaction_ref = Column(String(100), nullable=True)
    amount_lost = Column(Float, default=0.0)
    scam_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    evidence_filename = Column(String(255), nullable=True)
    status = Column(String(50), default="REPORTED")  # REPORTED, INVESTIGATING, VERIFIED, RESOLVED
    cybercrime_portal_advised = Column(Boolean, default=True)
    helpline_1930_advised = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reports")

class ScamMessage(Base):
    __tablename__ = "scam_messages"

    id = Column(Integer, primary_key=True, index=True)
    message_text = Column(Text, nullable=False)
    language = Column(String(50), default="en")  # en, hi, kn, te, ta, mr
    scam_type = Column(String(100), nullable=False)
    is_scam = Column(Boolean, default=True)
    confidence = Column(Float, default=0.95)
    indicators = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    scan_type = Column(String(50), nullable=False)  # MESSAGE, URL, UPI, QR, TRANSACTION, UNIFIED
    input_preview = Column(Text, nullable=True)
    risk_score = Column(Float, nullable=False)
    risk_category = Column(String(50), nullable=False)  # LOW, SUSPICIOUS, HIGH, CRITICAL
    confidence = Column(Float, default=0.85)
    scam_type = Column(String(100), nullable=True)
    indicators = Column(JSON, default=list)
    feature_contributions = Column(JSON, default=dict)
    recommended_action = Column(Text, nullable=True)
    user_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    severity = Column(String(50), default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    related_entity = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class DeviceProfile(Base):
    __tablename__ = "device_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    device_fingerprint = Column(String(255), default="Pixel_Device_Default")
    avg_transaction_amount = Column(Float, default=450.0)
    typical_start_hour = Column(Integer, default=8)
    typical_end_hour = Column(Integer, default=22)
    typical_recipients = Column(JSON, default=list)
    typical_locations = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="device_profile")

class FraudRelationship(Base):
    __tablename__ = "fraud_relationships"

    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String(50), nullable=False)  # USER, UPI, ACCOUNT, PHONE
    source_id = Column(String(255), nullable=False)
    target_type = Column(String(50), nullable=False)  # USER, UPI, ACCOUNT, PHONE
    target_id = Column(String(255), nullable=False)
    relationship_type = Column(String(100), default="TRANSFERS_TO")  # TRANSFERS_TO, SHARED_DEVICE, LINKED_PHONE, SUSPICIOUS_CLUSTER
    risk_weight = Column(Float, default=0.5)
    created_at = Column(DateTime, default=datetime.utcnow)
