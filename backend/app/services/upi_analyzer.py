import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.database.models import UPIIdentifier, FraudReport

VALID_HANDLES = {
    "okaxis", "oksbi", "okhdfcbank", "okicici", "ybl", "ibl", "axl",
    "paytm", "apl", "barodampay", "federal", "indus", "kotak", "upi"
}

SUSPICIOUS_UPI_KEYWORDS = [
    "support", "helpdesk", "nodal", "refund", "kyc", "officer", "verification",
    "customercare", "reward", "prize", "cbi", "police", "claim", "bill", "urgent",
    "headquarters", "dept", "executive", "admin", "agent", "service", "tollfree"
]

KNOWN_DEMO_REPORTS: Dict[str, Dict[str, Any]] = {
    "sbi.helpline.nodal@ybl": {"reports": 18, "connected": 8, "risk": 94.0, "status": "HIGH_RISK"},
    "hdfc.kyc.verification@oksbi": {"reports": 14, "connected": 6, "risk": 91.0, "status": "HIGH_RISK"},
    "electricity.bill.desk99@paytm": {"reports": 11, "connected": 5, "risk": 89.0, "status": "HIGH_RISK"},
    "refund.desk.officer@okaxis": {"reports": 15, "connected": 7, "risk": 92.0, "status": "HIGH_RISK"},
    "cbi.cyber.fine.settlement@axl": {"reports": 9, "connected": 4, "risk": 95.0, "status": "HIGH_RISK"},
    "telegram.earn.money77@ybl": {"reports": 8, "connected": 4, "risk": 87.0, "status": "SUSPICIOUS"},
    "support-example123@upi": {"reports": 14, "connected": 8, "risk": 87.0, "status": "SUSPICIOUS"},
    "rajesh123@upi": {"reports": 6, "connected": 4, "risk": 78.0, "status": "SUSPICIOUS"},
    "vikram@okhdfcbank": {"reports": 0, "connected": 1, "risk": 8.0, "status": "SAFE"},
    "swiggy@icici": {"reports": 0, "connected": 1, "risk": 2.0, "status": "SAFE"},
    "dmart.retail@hdfcbank": {"reports": 0, "connected": 1, "risk": 2.0, "status": "SAFE"}
}

class UPIAnalyzerService:
    def analyze(self, upi_id: str, db: Session = None) -> Dict[str, Any]:
        normalized = upi_id.strip().lower()
        patterns: List[str] = []
        feature_contributions: Dict[str, float] = {}
        risk_score = 10.0

        # Syntax check
        if "@" not in normalized:
            return {
                "upi_id": upi_id,
                "handle": "invalid",
                "display_name": None,
                "risk_score": 85.0,
                "category": "HIGH",
                "status": "HIGH_RISK",
                "report_count": 0,
                "connected_entities_count": 0,
                "is_verified_merchant": False,
                "suspicious_patterns": ["Malformed UPI ID format (Missing '@' separator)"],
                "feature_contributions": {"Invalid Format": 85.0},
                "recommendation": "Invalid UPI ID. Never proceed with payment to malformed identifiers."
            }

        username, handle = normalized.split("@", 1)

        # 1. Handle validation
        if handle not in VALID_HANDLES:
            patterns.append(f"Uncommon or non-standard PSP handle '@{handle}'")
            feature_contributions["Non-Standard PSP Handle"] = 15.0
            risk_score += 15.0

        # 2. Suspicious keywords in username
        matched_keywords = [kw for kw in SUSPICIOUS_UPI_KEYWORDS if kw in username]
        if matched_keywords:
            patterns.append(f"Social engineering keywords in UPI username: {', '.join(matched_keywords)}")
            weight = min(len(matched_keywords) * 20.0, 45.0)
            feature_contributions["Deceptive Keywords"] = weight
            risk_score += weight

        # 3. Excessive digits/noise
        digits_count = sum(c.isdigit() for c in username)
        if digits_count >= 5:
            patterns.append("Excessive numeric characters indicating auto-generated/disposable UPI ID")
            feature_contributions["Disposable VPA Pattern"] = 15.0
            risk_score += 15.0

        # 4. Check synthetic database or demo report cache
        report_count = 0
        connected_entities = 0
        is_verified = False

        if db is not None:
            try:
                record = db.query(UPIIdentifier).filter(UPIIdentifier.upi_id == normalized).first()
                if record:
                    report_count = record.report_count
                    connected_entities = record.connected_entities_count
                    is_verified = record.verified_merchant
                    if record.risk_score > risk_score:
                        risk_score = record.risk_score
            except Exception as e:
                print(f"[UPIAnalyzer] DB lookup error: {e}")

        # Fallback to demo report cache if DB didn't match
        if report_count == 0 and normalized in KNOWN_DEMO_REPORTS:
            known = KNOWN_DEMO_REPORTS[normalized]
            report_count = known["reports"]
            connected_entities = known["connected"]
            risk_score = max(risk_score, known["risk"])

        if report_count > 0:
            patterns.append(f"Reported {report_count} times by users in synthetic fraud intelligence database")
            feature_contributions["Community Fraud Reports"] = min(report_count * 4.0, 35.0)
            risk_score += min(report_count * 4.0, 35.0)

        if connected_entities >= 3:
            patterns.append(f"Linked to {connected_entities} connected entities in synthetic fraud graph")
            feature_contributions["Graph Connections"] = min(connected_entities * 3.0, 20.0)
            risk_score += min(connected_entities * 3.0, 20.0)

        # Verified merchant override
        if is_verified or normalized in ["swiggy@icici", "dmart.retail@hdfcbank"]:
            risk_score = 2.0
            patterns = ["Verified official merchant VPA"]
            feature_contributions = {"Verified Merchant": -50.0}

        risk_score = round(min(max(risk_score, 5.0), 99.0), 1)

        # Category and status
        if risk_score >= 80:
            category = "CRITICAL"
            status = "HIGH_RISK"
            recommendation = (
                "Potentially suspicious based on available signals. "
                "Multiple reports and deceptive keywords identified. We strongly advise against transferring funds."
            )
        elif risk_score >= 60:
            category = "HIGH"
            status = "SUSPICIOUS"
            recommendation = "Potentially suspicious based on available signals. Verify recipient identity before proceeding."
        elif risk_score >= 30:
            category = "SUSPICIOUS"
            status = "SUSPICIOUS"
            recommendation = "New or unverified payee. Double check payee details with the recipient."
        else:
            category = "LOW"
            status = "SAFE"
            recommendation = "No adverse signals found for this UPI ID in synthetic intelligence."

        return {
            "upi_id": upi_id,
            "handle": handle,
            "display_name": username.replace(".", " ").title(),
            "risk_score": risk_score,
            "category": category,
            "status": status,
            "report_count": report_count,
            "connected_entities_count": connected_entities,
            "is_verified_merchant": is_verified,
            "suspicious_patterns": patterns if patterns else ["Standard UPI address format"],
            "feature_contributions": feature_contributions if feature_contributions else {"Normal Profile": 5.0},
            "recommendation": recommendation
        }

upi_analyzer = UPIAnalyzerService()
