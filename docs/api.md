# UPI SHIELD — REST API Specification

Interactive Swagger UI documentation is available at:
`http://localhost:8000/docs`

---

## Base URL
`/api`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user profile with hashed password.
- **Request Body**:
```json
{
  "email": "user@example.demo",
  "password": "SecurePassword@123",
  "full_name": "Ramesh Sharma",
  "phone_number": "+91 98765 43210"
}
```
- **Response (200)**: Returns JWT bearer access token and user profile object.

### `POST /api/auth/login`
Authenticates user using OAuth2 password flow.
- **Request (Form Data)**:
  - `username`: Email address (e.g. `admin@upishield.demo` or `user@upishield.demo`)
  - `password`: Password (e.g. `Admin@123` or `User@123`)
- **Response (200)**: Returns `access_token` and user object.

### `GET /api/auth/me`
Fetches authenticated user profile from JWT Bearer token header.

---

## 2. Multi-Signal Analysis Endpoints

### `POST /api/analyze/message`
Performs NLP classification and social engineering extraction on SMS or chat messages.
- **Request Body**:
```json
{
  "message": "Dear customer, your SBI account will be blocked today due to pending KYC. Pay Rs.10 to verify.",
  "language_hint": "en"
}
```
- **Response (200)**:
```json
{
  "risk_score": 94.0,
  "category": "CRITICAL",
  "confidence": 0.95,
  "scam_type": "KYC PHISHING",
  "detected_language": "en",
  "language_display": "English 🇬🇧",
  "indicators": [
    "Urgency language",
    "Payment request",
    "KYC / Verification Hook"
  ],
  "feature_contributions": {
    "Urgency language": 22.0,
    "Payment request": 26.0,
    "KYC / Verification Hook": 20.0
  },
  "recommendation": "Do NOT click any links or make payments. Official banks never ask for token payments to complete KYC.",
  "safe_to_proceed": false
}
```

### `POST /api/analyze/url`
Inspects URLs for phishing indicators, brand typosquatting, entropy, and protocol flaws.
- **Request Body**:
```json
{
  "url": "http://sbi-kyc-verification.top/update"
}
```
- **Response (200)**: Returns `domain`, `is_https`, `brand_impersonation`, `risk_score`, `warnings`.

### `POST /api/analyze/upi`
Evaluates UPI Virtual Payment Address (VPA) syntax, keyword spoofs, and community reports.
- **Request Body**:
```json
{
  "upi_id": "sbi.helpline.nodal@ybl"
}
```
- **Response (200)**: Returns `risk_score`, `status`, `report_count`, `connected_entities_count`.

### `POST /api/analyze/qr`
Parses NPCI UPI QR payloads (`upi://pay?pa=...&pn=...&am=...`) and checks destination risk.
- **Request Body**:
```json
{
  "qr_data": "upi://pay?pa=refund.desk.officer@okaxis&pn=PhonePe+Refund&am=4850.00&cu=INR"
}
```
- **Response (200)**: Returns decoded parameters (`pa`, `pn`, `am`), `reasons`, and `risk_score`.

### `POST /api/analyze/transaction`
Runs Isolation Forest ML model and behavioral anomaly heuristics on outgoing transactions.
- **Request Body**:
```json
{
  "amount": 45000.0,
  "time_str": "03:15",
  "hour": 3,
  "recipient_upi": "rajesh123@upi",
  "is_new_recipient": true,
  "location": "Kolkata, IN",
  "device_id": "Unknown_Device_X9",
  "device_changed": true,
  "transaction_frequency_today": 8
}
```
- **Response (200)**:
```json
{
  "risk_score": 92.0,
  "category": "CRITICAL",
  "amount_anomaly_pct": 95.0,
  "time_anomaly_pct": 82.0,
  "recipient_novelty_pct": 91.0,
  "location_anomaly_pct": 76.0,
  "device_anomaly_pct": 85.0,
  "isolation_forest_score": 0.94,
  "safe_to_proceed": false
}
```

---

## 3. Operations & Graph Endpoints

### `GET /api/dashboard`
Returns live metrics, recent transaction logs, alerts feed, and chart time-series data.

### `GET /api/fraud-network`
Returns complete NetworkX-generated graph topology with nodes, edges, and risk categories.

### `GET /api/fraud-network/node/{node_id}`
Returns granular node details including degree centrality, neighbors, and report history.

### `POST /api/reports`
Accepts emergency fraud intake, generates unique incident ID (`UPI-2026-XXXXXX`), and issues official 1930 advisory.

### `GET /api/admin/statistics`
Returns macro fraud statistics, top suspicious VPAs, and geographic distribution.

### `GET /api/admin/models`
Returns ML model evaluation metrics (Accuracy, Precision, Recall, F1, Confusion Matrix).

### `POST /api/admin/retrain`
Triggers immediate retraining of both the NLP classifier and Isolation Forest models.
