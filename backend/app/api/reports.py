import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.database.models import FraudReport, Alert
from app.schemas.fraud import FraudReportCreate, FraudIncidentSummary, FraudReportOut
from app.services.upi_analyzer import upi_analyzer

router = APIRouter(prefix="/reports", tags=["Fraud Incident Response"])

@router.post("", response_model=FraudIncidentSummary)
def submit_fraud_report(payload: FraudReportCreate, db: Session = Depends(get_db)):
    # Generate unique formal incident ID e.g. UPI-2026-000123
    random_num = random.randint(100000, 999999)
    incident_id = f"UPI-2026-{random_num}"

    # Analyze reported UPI for risk categorization
    analysis = upi_analyzer.analyze(payload.reported_upi, db=db)
    risk_cat = "CRITICAL" if payload.amount_lost > 5000 or analysis["risk_score"] > 70 else "HIGH"

    report = FraudReport(
        incident_id=incident_id,
        reported_upi=payload.reported_upi,
        reported_phone=payload.reported_phone,
        transaction_ref=payload.transaction_ref or f"REF-{random_num}",
        amount_lost=payload.amount_lost,
        scam_type=payload.scam_type,
        description=payload.description,
        evidence_filename=payload.screenshot_name,
        status="REPORTED",
        cybercrime_portal_advised=True,
        helpline_1930_advised=True
    )
    db.add(report)

    # Also log an alert for high-value reports
    if payload.amount_lost > 5000:
        alert = Alert(
            severity="CRITICAL",
            title=f"New Fraud Incident Logged ({incident_id})",
            description=f"User reported ₹{payload.amount_lost:,.2f} lost to {payload.reported_upi} via {payload.scam_type}.",
            related_entity=payload.reported_upi
        )
        db.add(alert)

    db.commit()
    db.refresh(report)

    return {
        "incident_id": incident_id,
        "amount_lost": payload.amount_lost,
        "reported_upi": payload.reported_upi,
        "reported_phone": payload.reported_phone,
        "transaction_ref": report.transaction_ref,
        "scam_type": payload.scam_type,
        "risk_category": risk_cat,
        "description": payload.description,
        "created_at": report.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "official_1930_advisory": (
            "Dial 1930 immediately (National Cyber Crime Reporting Helpline operated by I4C, Ministry of Home Affairs). "
            "Reporting within the golden hour (first 2-3 hours) exponentially increases chances of freezing funds at the destination bank."
        ),
        "cybercrime_portal_link": "https://cybercrime.gov.in",
        "recommended_immediate_steps": [
            "1. Immediately call 1930 National Cyber Crime Reporting Helpline.",
            "2. Contact your bank's 24x7 fraud helpline to block your UPI and freeze outgoing transactions.",
            "3. File a formal complaint on https://cybercrime.gov.in with this Incident ID and transaction reference.",
            "4. Preserve all chat messages, SMS, call logs, and payment screenshots without deleting them.",
            "5. Change your UPI PIN, banking passwords, and revoke unfamiliar apps on your device."
        ]
    }

@router.get("", response_model=List[FraudReportOut])
def get_fraud_reports(db: Session = Depends(get_db)):
    reports = db.query(FraudReport).order_by(FraudReport.created_at.desc()).limit(20).all()
    if not reports:
        # Provide sample demo report
        return [
            FraudReportOut(
                id=1,
                incident_id="UPI-2026-000123",
                reported_upi="sbi.helpline.nodal@ybl",
                reported_phone="+91 9876543210",
                transaction_ref="TXN-4920194819",
                amount_lost=25000.0,
                scam_type="KYC Phishing",
                description="Received SMS that bank account will be blocked. Transferred Rs 25,000 under fake nodal verification.",
                status="VERIFIED",
                created_at=datetime.utcnow()
            )
        ]
    return reports
