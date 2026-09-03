from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime, timedelta

from app.database.session import get_db
from app.database.models import Transaction, Alert, RiskAssessment, FraudReport
from app.schemas.fraud import AlertOut

router = APIRouter(tags=["Dashboard & Alerts"])

@router.get("/dashboard")
def get_dashboard_summary(db: Session = Depends(get_db)):
    # Calculate live stats or realistic fallback
    total_txns = db.query(Transaction).count() or 1284
    blocked_count = db.query(Transaction).filter(Transaction.status.in_(["BLOCKED", "FLAGGED"])).count() or 18
    threats_detected = db.query(FraudReport).count() or 47
    scans_performed = db.query(RiskAssessment).count() or 538

    # Fraud detection over time (Last 7 days)
    today = datetime.utcnow().date()
    fraud_over_time = [
        {"date": (today - timedelta(days=6)).strftime("%d %b"), "scans": 74, "threats": 8, "blocked": 3},
        {"date": (today - timedelta(days=5)).strftime("%d %b"), "scans": 92, "threats": 12, "blocked": 5},
        {"date": (today - timedelta(days=4)).strftime("%d %b"), "scans": 88, "threats": 9, "blocked": 4},
        {"date": (today - timedelta(days=3)).strftime("%d %b"), "scans": 115, "threats": 15, "blocked": 6},
        {"date": (today - timedelta(days=2)).strftime("%d %b"), "scans": 130, "threats": 19, "blocked": 8},
        {"date": (today - timedelta(days=1)).strftime("%d %b"), "scans": 142, "threats": 22, "blocked": 9},
        {"date": today.strftime("%d %b"), "scans": 98, "threats": 14, "blocked": 5},
    ]

    # Scam categories distribution
    scam_categories = [
        {"name": "KYC Phishing", "value": 38, "color": "#EF4444"},
        {"name": "Electricity Bill", "value": 22, "color": "#F97316"},
        {"name": "Fake Refund", "value": 18, "color": "#F59E0B"},
        {"name": "Police Impersonation", "value": 12, "color": "#8B5CF6"},
        {"name": "Lottery / Work From Home", "value": 10, "color": "#3B82F6"},
    ]

    # Risk distribution
    risk_distribution = [
        {"level": "Low (0-29)", "count": 412, "color": "#10B981"},
        {"level": "Suspicious (30-59)", "count": 79, "color": "#F59E0B"},
        {"level": "High (60-79)", "count": 31, "color": "#F97316"},
        {"level": "Critical (80-100)", "count": 16, "color": "#EF4444"}
    ]

    # Recent transaction anomaly feed
    recent_transactions = [
        {"ref": "UPI-TXN-849201", "sender": "user@upishield.demo", "recipient": "rajesh123@upi", "amount": 25000.0, "time": "03:15 AM", "status": "FLAGGED", "risk_score": 91.0, "category": "CRITICAL"},
        {"ref": "UPI-TXN-849202", "sender": "user@upishield.demo", "recipient": "swiggy@icici", "amount": 340.0, "time": "08:45 PM", "status": "COMPLETED", "risk_score": 5.0, "category": "LOW"},
        {"ref": "UPI-TXN-849203", "sender": "user@upishield.demo", "recipient": "sbi.helpline.nodal@ybl", "amount": 10.0, "time": "11:20 AM", "status": "BLOCKED", "risk_score": 94.0, "category": "CRITICAL"},
        {"ref": "UPI-TXN-849204", "sender": "user@upishield.demo", "recipient": "dmart.retail@hdfcbank", "amount": 1280.0, "time": "04:10 PM", "status": "COMPLETED", "risk_score": 8.0, "category": "LOW"},
        {"ref": "UPI-TXN-849205", "sender": "user@upishield.demo", "recipient": "quick.refund.desk@ybl", "amount": 4850.0, "time": "02:40 PM", "status": "BLOCKED", "risk_score": 88.0, "category": "CRITICAL"},
    ]

    return {
        "status": "SECURED",
        "risk_level": "LOW",
        "system_risk_score": 14.5,
        "protected_transactions": total_txns,
        "threats_detected": threats_detected,
        "blocked_suspicious": blocked_count,
        "scans_performed": scans_performed,
        "protected_volume_inr": 28400000.0,
        "charts": {
            "fraud_over_time": fraud_over_time,
            "scam_categories": scam_categories,
            "risk_distribution": risk_distribution
        },
        "recent_transactions": recent_transactions
    }

@router.get("/alerts", response_model=List[AlertOut])
def get_recent_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(10).all()
    if not alerts:
        # Provide realistic initial alerts
        now = datetime.utcnow()
        return [
            AlertOut(id=1, severity="CRITICAL", title="Fake KYC Phishing Surge", description="High frequency of SMS targeting SBI YONO users requesting ₹10 verification fee.", related_entity="sbi.helpline.nodal@ybl", timestamp=now - timedelta(minutes=14)),
            AlertOut(id=2, severity="HIGH", title="Suspicious VPA Active in Electricity Scams", description="Identified fake BESCOM/MSEDCL officer demanding urgent UPI settlement under threat of power cutoff.", related_entity="electricity.bill.desk99@paytm", timestamp=now - timedelta(hours=1)),
            AlertOut(id=3, severity="MEDIUM", title="Unknown Recipient Nocturnal Transaction Intercepted", description="₹45,000 transfer attempted at 03:15 AM flagged for stepping-up biometric verification.", related_entity="rajesh123@upi", timestamp=now - timedelta(hours=3)),
            AlertOut(id=4, severity="LOW", title="Legitimate Merchant Whitelist Updated", description="Added verified status for 14 leading retail merchant payment gateways.", related_entity="NPCI-Gateway", timestamp=now - timedelta(hours=8))
        ]
    return alerts

@router.get("/scams")
def get_scam_categories():
    return [
        {"id": "kyc", "title": "KYC Phishing", "severity": "CRITICAL", "description": "Messages claiming bank account closure unless KYC is completed with immediate token payment."},
        {"id": "refund", "title": "Fake Refund / Cashback", "severity": "HIGH", "description": "Lures user with reward/cashback link prompting to enter UPI PIN to receive money."},
        {"id": "electricity", "title": "Electricity Bill Threat", "severity": "HIGH", "description": "Threatens immediate power disconnect at 9:30 PM unless a contact person is paid via UPI."},
        {"id": "support", "title": "Fake Customer Care / AnyDesk", "severity": "CRITICAL", "description": "Fraudsters impersonating bank/GPay support asking to install remote control apps."},
        {"id": "investment", "title": "Telegram / Part-Time Job", "severity": "HIGH", "description": "Promises high daily earnings for rating videos or crypto bots after paying initial deposit."},
        {"id": "police", "title": "Police / Legal Impersonation", "severity": "CRITICAL", "description": "Fake arrest warrants or illegal parcel claims demanding bail transfer to avoid detention."},
        {"id": "qr", "title": "Malicious QR Code", "severity": "HIGH", "description": "Deceptive QR codes programmed to request debit transfers instead of receiving money."}
    ]
