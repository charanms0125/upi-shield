import re
from urllib.parse import urlparse, parse_qs
from typing import Dict, Any, Optional
from app.services.upi_analyzer import upi_analyzer

class QRAnalyzerService:
    def parse_upi_uri(self, payload: str) -> Dict[str, Any]:
        """Parses standard NPCI UPI URI strings: upi://pay?pa=...&pn=...&am=..."""
        clean_str = payload.strip()
        if not clean_str.lower().startswith("upi://pay"):
            # Check if raw UPI ID was passed directly
            if "@" in clean_str and " " not in clean_str:
                return {
                    "is_valid": True,
                    "pa": clean_str,
                    "pn": clean_str.split("@")[0],
                    "am": None,
                    "cu": "INR",
                    "tn": "Direct UPI Transfer"
                }
            return {"is_valid": False, "error": "Not a valid UPI payment payload"}

        try:
            # Handle query string
            parsed = urlparse(clean_str)
            qs = parse_qs(parsed.query)

            pa = qs.get("pa", [None])[0]
            pn = qs.get("pn", [None])[0]
            am_str = qs.get("am", [None])[0]
            cu = qs.get("cu", ["INR"])[0]
            tn = qs.get("tn", [None])[0] or qs.get("tr", [None])[0]

            amount = float(am_str) if am_str else None

            return {
                "is_valid": bool(pa),
                "pa": pa,
                "pn": pn,
                "am": amount,
                "cu": cu,
                "tn": tn
            }
        except Exception as e:
            return {"is_valid": False, "error": str(e)}

    def analyze(self, qr_payload: str, image_base64: Optional[str] = None) -> Dict[str, Any]:
        parsed = self.parse_upi_uri(qr_payload)

        if not parsed.get("is_valid"):
            return {
                "raw_payload": qr_payload,
                "is_valid_upi_qr": False,
                "payee_upi": None,
                "payee_name": None,
                "amount": None,
                "currency": "INR",
                "transaction_ref": None,
                "risk_score": 85.0,
                "category": "HIGH",
                "reasons": ["Invalid or non-compliant UPI QR payload structure."],
                "feature_contributions": {"Malformed QR Protocol": 85.0},
                "recommendation": "Do NOT scan or authorize payments from unrecognized QR formats.",
                "safe_to_proceed": False
            }

        payee_upi = parsed.get("pa")
        payee_name = parsed.get("pn") or (payee_upi.split("@")[0].capitalize() if payee_upi else "Unknown")
        amount = parsed.get("am")
        currency = parsed.get("cu", "INR")
        note = parsed.get("tn")

        # Analyze payee UPI ID
        upi_analysis = upi_analyzer.analyze(payee_upi)
        base_risk = upi_analysis["risk_score"]
        reasons = list(upi_analysis["suspicious_patterns"])
        contributions = dict(upi_analysis["feature_contributions"])

        # Check amount conditions
        if amount is not None:
            if amount > 10000:
                reasons.append(f"High pre-set QR amount (₹{amount:,.2f}) which is unusual for static QRs")
                contributions["High Pre-set Amount"] = 20.0
                base_risk += 20.0
            elif amount == 1.0 or amount == 10.0:
                # Often used in reverse phishing "pay Re. 1 to verify and receive Rs. 5000"
                reasons.append("Token amount (₹1 / ₹10) commonly leveraged in 'Pay Re.1 to receive refund' fraud traps")
                contributions["Token Amount Probe"] = 18.0
                base_risk += 18.0

        if upi_analysis["status"] != "SAFE":
            reasons.append(f"Recipient identifier flagged as {upi_analysis['status']} in threat database")

        risk_score = round(min(max(base_risk, 5.0), 99.0), 1)

        if risk_score >= 80:
            category = "CRITICAL"
            recommendation = "Do NOT authorize this payment. The QR destination has multiple critical fraud signals."
            safe = False
        elif risk_score >= 60:
            category = "HIGH"
            recommendation = "High risk detected. Scammers frequently manipulate QR codes to initiate debit requests instead of credits."
            safe = False
        elif risk_score >= 30:
            category = "SUSPICIOUS"
            recommendation = "Proceed with caution. Verify payee name and amount before entering your UPI PIN."
            safe = False
        else:
            category = "LOW"
            recommendation = "QR code points to a verified or low-risk recipient. Standard transaction safety applies."
            safe = True

        return {
            "raw_payload": qr_payload,
            "is_valid_upi_qr": True,
            "payee_upi": payee_upi,
            "payee_name": payee_name,
            "amount": amount,
            "currency": currency,
            "transaction_ref": note,
            "risk_score": risk_score,
            "category": category,
            "reasons": reasons if reasons else ["Standard QR payment destination"],
            "feature_contributions": contributions,
            "recommendation": recommendation,
            "safe_to_proceed": safe
        }

qr_analyzer = QRAnalyzerService()
