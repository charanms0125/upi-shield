from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.database.models import RiskAssessment
from app.schemas.analysis import (
    MessageAnalysisRequest, MessageAnalysisResponse,
    URLAnalysisRequest, URLAnalysisResponse,
    UPIAnalysisRequest, UPIAnalysisResponse,
    QRAnalysisRequest, QRAnalysisResponse,
    TransactionAnalysisRequest, TransactionAnalysisResponse,
    UnifiedRiskRequest, UnifiedRiskResponse
)
from app.services.message_analyzer import message_analyzer
from app.services.url_analyzer import url_analyzer
from app.services.upi_analyzer import upi_analyzer
from app.services.qr_analyzer import qr_analyzer
from app.services.anomaly_detector import transaction_anomaly_service
from app.services.risk_engine import fraud_risk_engine

router = APIRouter(prefix="/analyze", tags=["Risk Analysis Engine"])

@router.post("/message", response_model=MessageAnalysisResponse)
def analyze_message(payload: MessageAnalysisRequest, db: Session = Depends(get_db)):
    try:
        res = message_analyzer.analyze(payload.message, payload.language_hint)
        # Log to DB
        assessment = RiskAssessment(
            scan_type="MESSAGE",
            input_preview=payload.message[:250],
            risk_score=res["risk_score"],
            risk_category=res["category"],
            confidence=res["confidence"],
            scam_type=res["scam_type"],
            indicators=res["indicators"],
            feature_contributions=res["feature_contributions"],
            recommended_action=res["recommendation"]
        )
        db.add(assessment)
        db.commit()
        return res
    except Exception as e:
        print(f"[AnalyzeMessage Error] {e}")
        raise HTTPException(status_code=500, detail="Unable to analyze this message. Please try again.")

@router.post("/url", response_model=URLAnalysisResponse)
def analyze_url(payload: URLAnalysisRequest, db: Session = Depends(get_db)):
    try:
        res = url_analyzer.analyze(payload.url)
        assessment = RiskAssessment(
            scan_type="URL",
            input_preview=payload.url[:250],
            risk_score=res["risk_score"],
            risk_category=res["category"],
            confidence=res["confidence"],
            scam_type="PHISHING_URL" if res["risk_score"] > 50 else "BENIGN_URL",
            indicators=res["warnings"],
            feature_contributions=res["feature_contributions"],
            recommended_action=res["recommendation"]
        )
        db.add(assessment)
        db.commit()
        return res
    except Exception as e:
        print(f"[AnalyzeURL Error] {e}")
        raise HTTPException(status_code=500, detail="Unable to analyze this URL. Please try again.")

@router.post("/upi", response_model=UPIAnalysisResponse)
def analyze_upi(payload: UPIAnalysisRequest, db: Session = Depends(get_db)):
    try:
        res = upi_analyzer.analyze(payload.upi_id, db=db)
        assessment = RiskAssessment(
            scan_type="UPI",
            input_preview=payload.upi_id,
            risk_score=res["risk_score"],
            risk_category=res["category"],
            confidence=0.88,
            scam_type="SUSPICIOUS_UPI_ID" if res["risk_score"] > 50 else "CLEAN_UPI_ID",
            indicators=res["suspicious_patterns"],
            feature_contributions=res["feature_contributions"],
            recommended_action=res["recommendation"]
        )
        db.add(assessment)
        db.commit()
        return res
    except Exception as e:
        print(f"[AnalyzeUPI Error] {e}")
        raise HTTPException(status_code=500, detail="Unable to analyze this UPI ID. Please try again.")

@router.post("/qr", response_model=QRAnalysisResponse)
def analyze_qr(payload: QRAnalysisRequest, db: Session = Depends(get_db)):
    try:
        target_payload = payload.qr_data or ""
        res = qr_analyzer.analyze(target_payload, payload.image_base64)
        assessment = RiskAssessment(
            scan_type="QR",
            input_preview=target_payload[:250],
            risk_score=res["risk_score"],
            risk_category=res["category"],
            confidence=0.90,
            scam_type="MALICIOUS_QR" if res["risk_score"] > 50 else "BENIGN_QR",
            indicators=res["reasons"],
            feature_contributions=res["feature_contributions"],
            recommended_action=res["recommendation"]
        )
        db.add(assessment)
        db.commit()
        return res
    except Exception as e:
        print(f"[AnalyzeQR Error] {e}")
        raise HTTPException(status_code=500, detail="Unable to analyze this QR code. Please try again.")

@router.post("/transaction", response_model=TransactionAnalysisResponse)
def analyze_transaction(payload: TransactionAnalysisRequest, db: Session = Depends(get_db)):
    try:
        # Determine hour from time_str if provided (e.g. "03:15" -> 3)
        hour = payload.hour or 14
        if payload.time_str and ":" in payload.time_str:
            try:
                hour = int(payload.time_str.split(":")[0])
            except Exception:
                pass

        res = transaction_anomaly_service.analyze(
            amount=payload.amount,
            hour=hour,
            is_new_recipient=payload.is_new_recipient,
            location=payload.location,
            device_id=payload.device_id,
            device_changed=payload.device_changed,
            frequency_today=payload.transaction_frequency_today
        )

        assessment = RiskAssessment(
            scan_type="TRANSACTION",
            input_preview=f"₹{payload.amount:,.2f} to {payload.recipient_upi} at {payload.time_str}",
            risk_score=res["risk_score"],
            risk_category=res["category"],
            confidence=res["confidence"],
            scam_type="TRANSACTION_ANOMALY" if res["risk_score"] > 50 else "NORMAL_TRANSACTION",
            indicators=res["indicators"],
            feature_contributions=res["feature_contributions"],
            recommended_action=res["recommendation"]
        )
        db.add(assessment)
        db.commit()
        return res
    except Exception as e:
        print(f"[AnalyzeTransaction Error] {e}")
        raise HTTPException(status_code=500, detail="Unable to analyze this transaction. Please try again.")

@router.post("/unified", response_model=UnifiedRiskResponse)
def analyze_unified(payload: UnifiedRiskRequest, db: Session = Depends(get_db)):
    try:
        res = fraud_risk_engine.evaluate_unified(
            message=payload.message,
            url=payload.url,
            upi_id=payload.upi_id,
            qr_data=payload.qr_data,
            amount=payload.amount,
            transaction_data=payload.transaction_data
        )
        return res
    except Exception as e:
        print(f"[AnalyzeUnified Error] {e}")
        raise HTTPException(status_code=500, detail="Unable to complete unified analysis. Please try again.")
