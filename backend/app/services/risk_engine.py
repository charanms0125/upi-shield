from typing import Dict, Any, Optional, List
from app.core.config import settings
from app.services.message_analyzer import message_analyzer
from app.services.url_analyzer import url_analyzer
from app.services.upi_analyzer import upi_analyzer
from app.services.qr_analyzer import qr_analyzer
from app.services.anomaly_detector import transaction_anomaly_service
from app.services.graph_service import fraud_graph_service

class FraudRiskEngine:
    """
    Central multi-signal fusion risk engine for UPI SHIELD.
    Aggregates NLP, URL, UPI, QR, Transaction, Behaviour, and Graph indicators.
    """

    def evaluate_unified(
        self,
        message: Optional[str] = None,
        url: Optional[str] = None,
        upi_id: Optional[str] = None,
        qr_data: Optional[str] = None,
        amount: Optional[float] = None,
        transaction_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        signals_present = []
        component_scores: Dict[str, float] = {}
        all_indicators: List[str] = []
        all_contributions: Dict[str, float] = {}
        scam_types_found: List[str] = []

        # 1. Message NLP Signal
        if message and len(message.strip()) > 3:
            msg_res = message_analyzer.analyze(message)
            component_scores["Message NLP"] = msg_res["risk_score"]
            all_indicators.extend(msg_res["indicators"])
            if msg_res["scam_type"] != "LEGITIMATE / LOW RISK":
                scam_types_found.append(msg_res["scam_type"])
            for k, v in msg_res["feature_contributions"].items():
                all_contributions[f"Message: {k}"] = v
            signals_present.append(("Message", msg_res["risk_score"], settings.WEIGHT_MESSAGE))

        # 2. URL Phishing Signal
        if url and len(url.strip()) > 3:
            url_res = url_analyzer.analyze(url)
            component_scores["URL Phishing"] = url_res["risk_score"]
            all_indicators.extend(url_res["warnings"])
            for k, v in url_res["feature_contributions"].items():
                all_contributions[f"URL: {k}"] = v
            signals_present.append(("URL", url_res["risk_score"], settings.WEIGHT_URL))

        # 3. QR Code Signal
        extracted_upi_from_qr = None
        if qr_data and len(qr_data.strip()) > 3:
            qr_res = qr_analyzer.analyze(qr_data)
            component_scores["QR Signal"] = qr_res["risk_score"]
            all_indicators.extend(qr_res["reasons"])
            for k, v in qr_res["feature_contributions"].items():
                all_contributions[f"QR: {k}"] = v
            signals_present.append(("QR Code", qr_res["risk_score"], 0.20))
            if qr_res.get("payee_upi"):
                extracted_upi_from_qr = qr_res["payee_upi"]

        # 4. UPI ID Signal
        target_upi = upi_id or extracted_upi_from_qr
        if target_upi and len(target_upi.strip()) > 3:
            upi_res = upi_analyzer.analyze(target_upi)
            component_scores["UPI Risk Profile"] = upi_res["risk_score"]
            all_indicators.extend(upi_res["suspicious_patterns"])
            for k, v in upi_res["feature_contributions"].items():
                all_contributions[f"UPI: {k}"] = v
            signals_present.append(("UPI ID", upi_res["risk_score"], settings.WEIGHT_UPI))

        # 5. Transaction Anomaly & Behaviour Signals
        txn_amount = amount or (transaction_data.get("amount") if transaction_data else None)
        if txn_amount is not None:
            t_data = transaction_data or {}
            anomaly_res = transaction_anomaly_service.analyze(
                amount=txn_amount,
                hour=t_data.get("hour", 14),
                is_new_recipient=t_data.get("is_new_recipient", False),
                location=t_data.get("location", "Bengaluru, IN"),
                device_id=t_data.get("device_id", "Demo_Device_1"),
                device_changed=t_data.get("device_changed", False),
                frequency_today=t_data.get("frequency_today", 2)
            )
            component_scores["Transaction Anomaly"] = anomaly_res["risk_score"]
            component_scores["Behaviour Deviation"] = anomaly_res["amount_anomaly_pct"]
            all_indicators.extend(anomaly_res["indicators"])
            for k, v in anomaly_res["feature_contributions"].items():
                all_contributions[f"Txn: {k}"] = v
            signals_present.append(("Transaction", anomaly_res["risk_score"], settings.WEIGHT_TRANSACTION_ANOMALY))
            signals_present.append(("Behaviour", anomaly_res["amount_anomaly_pct"], settings.WEIGHT_BEHAVIOUR))

        # 6. Graph Signal
        if target_upi:
            graph_data = fraud_graph_service.get_node_details(target_upi)
            if graph_data:
                graph_risk = float(graph_data["risk_score"])
                component_scores["Graph Centrality"] = graph_risk
                signals_present.append(("Graph", graph_risk, settings.WEIGHT_GRAPH))
                if graph_data["is_hub"]:
                    all_indicators.append(f"Entity is a high-degree hub in known fraud ring ({graph_data['connected_count']} links)")
                    all_contributions["Graph: Fraud Ring Hub"] = 25.0

        # Weighted calculation
        if not signals_present:
            # Default baseline safe response
            return {
                "overall_risk_score": 10.0,
                "category": "LOW",
                "confidence": 0.95,
                "scam_type": "NO_SIGNALS_PROVIDED",
                "component_scores": {"Baseline": 10.0},
                "feature_contributions": {"Normal Baseline": 5.0},
                "all_indicators": ["No suspicious data provided for scanning"],
                "recommended_action": "Provide a message, QR code, UPI ID, or transaction details to scan.",
                "safe_to_proceed": True
            }

        total_weight = sum(w for _, _, w in signals_present)
        weighted_score = sum(score * w for _, score, w in signals_present) / total_weight

        # Specific escalations
        max_subscore = max(score for _, score, _ in signals_present)
        if max_subscore >= 90.0:
            # High priority flag if any individual module is screaming danger
            weighted_score = max(weighted_score, max_subscore * 0.92)

        final_score = round(min(max(weighted_score, 5.0), 99.0), 1)

        # Categorization: 0–29 LOW, 30–59 SUSPICIOUS, 60–79 HIGH, 80–100 CRITICAL
        if final_score >= 80:
            category = "CRITICAL"
            recommended_action = (
                "🛑 CRITICAL THREAT DETECTED: Do NOT proceed with payment or disclose any credentials. "
                "Block the sender and report this immediately via National Cyber Crime Helpline 1930."
            )
            safe = False
        elif final_score >= 60:
            category = "HIGH"
            recommended_action = (
                "⚠️ HIGH FRAUD RISK: Multiple threat indicators identified. "
                "Do not authorize any UPI PIN entry or payment request."
            )
            safe = False
        elif final_score >= 30:
            category = "SUSPICIOUS"
            recommended_action = (
                "⚠️ SUSPICIOUS INTERACTION: Potential anomaly or unknown entity. "
                "Verify beneficiary authenticity before proceeding."
            )
            safe = False
        else:
            category = "LOW"
            recommended_action = "🟢 LOW RISK: No immediate threat signals identified. Standard caution advised."
            safe = True

        detected_scam = scam_types_found[0] if scam_types_found else ("SUSPICIOUS TRANSACTION" if final_score >= 50 else "NORMAL TRANSACTION")

        return {
            "overall_risk_score": final_score,
            "category": category,
            "confidence": 0.92,
            "scam_type": detected_scam,
            "component_scores": component_scores,
            "feature_contributions": all_contributions if all_contributions else {"Standard Activity": 5.0},
            "all_indicators": list(dict.fromkeys(all_indicators)) if all_indicators else ["Standard operational baseline"],
            "recommended_action": recommended_action,
            "safe_to_proceed": safe
        }

fraud_risk_engine = FraudRiskEngine()
