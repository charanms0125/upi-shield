import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "NLP Multilingual Scam Detector" in data["active_modules"]

def test_analyze_message_scam():
    # KYC Scam message in Hindi
    payload = {
        "message": "प्रिय ग्राहक, आपका SBI खाता आज बंद कर दिया जाएगा। तुरंत http://sbi-kyc-verification.top/update पर जाएं या खाता चालू रखने के लिए sbi.helpline.nodal@ybl पर ₹10 सत्यापन शुल्क भेजें।"
    }
    response = client.post("/api/analyze/message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] >= 80.0
    assert data["category"] == "CRITICAL"
    assert data["detected_language"] == "hi"
    assert data["safe_to_proceed"] is False
    assert len(data["indicators"]) > 0

def test_analyze_message_legitimate():
    payload = {
        "message": "Your SBI A/C ending 4821 is credited by INR 1,500.00 on 03-Sep-26 by UPI/P2A/Ref 6245108492. Balance: INR 24,180.50."
    }
    response = client.post("/api/analyze/message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] < 35.0
    assert data["safe_to_proceed"] is True

def test_analyze_url_phishing():
    payload = {
        "url": "http://sbi-yono-kyc-verification.top/update-pan"
    }
    response = client.post("/api/analyze/url", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] >= 60.0
    assert data["brand_impersonation"] == "SBI"
    assert len(data["warnings"]) > 0

def test_analyze_upi_id():
    # Known suspicious handle
    payload = {"upi_id": "sbi.helpline.nodal@ybl"}
    response = client.post("/api/analyze/upi", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] >= 80.0
    assert data["status"] in ["HIGH_RISK", "SUSPICIOUS"]
    assert data["report_count"] > 0

def test_analyze_qr():
    payload = {
        "qr_data": "upi://pay?pa=refund.desk.officer@okaxis&pn=Refund+Desk&am=10.00&cu=INR&tn=Verification+Token"
    }
    response = client.post("/api/analyze/qr", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid_upi_qr"] is True
    assert data["payee_upi"] == "refund.desk.officer@okaxis"
    assert data["amount"] == 10.0
    assert data["risk_score"] >= 60.0

def test_transaction_anomaly_detection():
    # Nocturnal ₹45,000 transaction anomaly
    payload = {
        "amount": 45000.0,
        "time_str": "03:15",
        "hour": 3,
        "location": "Kolkata, IN",
        "recipient_upi": "rajesh123@upi",
        "is_new_recipient": True,
        "device_id": "Unknown_Device_X9",
        "device_changed": True,
        "transaction_frequency_today": 8
    }
    response = client.post("/api/analyze/transaction", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] >= 80.0
    assert data["category"] == "CRITICAL"
    assert data["amount_anomaly_pct"] >= 80.0
    assert data["time_anomaly_pct"] >= 75.0
    assert data["safe_to_proceed"] is False

def test_fraud_report_creation():
    payload = {
        "reported_upi": "electricity.bill.desk99@paytm",
        "reported_phone": "+91 9876543210",
        "amount_lost": 25000.0,
        "scam_type": "Electricity Bill Scam",
        "description": "Scammer threatened immediate disconnection unless Rs 25,000 was transferred."
    }
    response = client.post("/api/reports", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["incident_id"].startswith("UPI-2026-")
    assert "1930" in data["official_1930_advisory"]
    assert len(data["recommended_immediate_steps"]) >= 4

def test_fraud_network_graph():
    response = client.get("/api/fraud-network")
    assert response.status_code == 200
    data = response.json()
    assert len(data["nodes"]) > 0
    assert len(data["edges"]) > 0
    assert data["suspicious_clusters_count"] >= 1

def test_admin_statistics():
    response = client.get("/api/admin/statistics")
    assert response.status_code == 200
    data = response.json()
    assert data["total_transactions_protected"] > 1000
    assert len(data["top_suspicious_upis"]) > 0
