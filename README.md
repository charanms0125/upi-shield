# 🛡️ UPI SHIELD
### AI-Powered UPI Scam Detection, Prevention & Fraud Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Project Overview & Problem Statement

### The Problem
Unified Payments Interface (UPI) processes over **14 billion transactions monthly** in India, becoming the backbone of consumer payments. However, this ubiquity has triggered an explosion in social engineering frauds:
- **Fake KYC Threats**: SMS threatening account suspension unless a "Re.1 verification fee" is sent.
- **Utility Blackout Extortion**: Midnight power disconnection notices coercing immediate UPI transfers.
- **Deceptive Debit QR Codes**: Scammers tricking sellers on OLX/marketplaces into scanning a QR and entering their UPI PIN to "receive" money, which actually debits their account.
- **Account Drains & Money Mule Rings**: Fraud syndicates rapidly layering stolen funds through daisy-chained mule accounts within minutes.

### The Solution
**UPI SHIELD** is a production-style, demo-ready hackathon platform engineered to answer the critical question:
> **“Is this UPI interaction potentially fraudulent, why is it risky, and what should the user do next?”**

It combines **7 distinct detection signals** with **Explainable AI (XAI)**, a **pre-payment safety interceptor**, an interactive **NetworkX fraud network graph**, and a dedicated **1930 National Cyber Crime helpline emergency workflow**.

---

## 2. Key Innovations

1. **Multi-Signal AI Fusion**: Integrates NLP message classification, URL phishing heuristics, UPI VPA syntax validation, QR code payload extraction, Isolation Forest transaction anomaly detection, user behavioural baseline profiling, and NetworkX graph centrality.
2. **Explainable AI (XAI)**: Does NOT simply label "Scam". Transparently displays individual risk factor contributions (e.g. `Urgency: +22`, `Payment Demand: +27`, `Unknown Recipient: +18`).
3. **Multilingual Indian Scam Coverage**: Auto-detects and analyzes scam patterns across **English, Hindi (हिंदी), Kannada (ಕನ್ನಡ), Telugu (తెలుగు), Tamil (தமிழ்), and Marathi (मराठी)**.
4. **Pre-Payment Safety Interceptor**: Realistic payment simulator (mimicking Google Pay / PhonePe) that halts dangerous transfers *before* PIN authorization.
5. **Interactive Fraud Network**: Visualizes money mule rings, burner phone links, and cashout accounts using NetworkX.
6. **Emergency 1930 Cyber Helpline Workflow**: Generates formal incident summaries (`UPI-2026-XXXXXX`) formatted for submission to the National Cyber Crime Reporting Portal (`cybercrime.gov.in`).

---

## 3. Demo Credentials (For Hackathon Judges)

| Role | Email | Password | Access Level |
|---|---|---|---|
| **SOC Admin** | `admin@upishield.demo` | `Admin@123` | Full SOC telemetry, model metrics, retraining triggers |
| **Demo User** | `user@upishield.demo` | `User@123` | Standard consumer protection, payment simulation |

*Quick-access buttons to log in as either user in 1-click are available on the [Login Page](/login).*

---

## 4. 5-Minute Judge Demo Flow

A persistent **"JUDGE DEMO MODE"** toolbar is pinned at the top of the interface with 1-click access to the 5 core judging scenarios:

1. **Scenario 1: Multilingual KYC Phishing** (Click `1. NLP Scam AI`)
   - Tests a realistic Hindi/Kannada SBI account block message.
   - Observe auto-language detection, `94/100 🔴 CRITICAL` score, and XAI feature weights.
2. **Scenario 2: Fake Refund / Cashback** (Click `2. Social Engineering`)
   - Tests a phantom ₹4,850 PhonePe refund lure prompting for UPI PIN entry.
3. **Scenario 3: Manipulated Payment QR Code** (Click `3. QR Analysis`)
   - Decodes protocol parameters (`pa`, `pn`, `am`) and flags high-risk destination VPAs.
4. **Scenario 4: Nocturnal Transaction Anomaly** (Click `4. Isolation Forest ML`)
   - Simulates an abnormal ₹45,000 transfer attempted at 03:15 AM to a new recipient.
   - Isolation Forest identifies amount anomaly (95%) and time anomaly (82%).
5. **Scenario 5: Connected Fraud Network** (Click `5. NetworkX Graph`)
   - Explores the interactive syndicate graph showing laundering links from victims to mule accounts.
6. **Pre-Payment Interceptor Test**:
   - Click the **"Simulate Payment"** button in the top navigation bar.
   - Enter ₹25,000 to `rajesh123@upi` at 3:15 AM to see the live safety warning dialog with `[CANCEL PAYMENT]` guidance.
7. **Emergency 1930 Incident Response**:
   - Click **"🚨 I Lost Money"** to test the intake flow and generate an official printable incident brief.

---

## 5. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Canvas Confetti, React Router DOM, Axios
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy, Uvicorn
- **AI / ML**: Scikit-Learn (TF-IDF + Logistic Regression, Isolation Forest), NetworkX
- **Database**: MongoDB (Atlas & local cluster ready) / SQLite (zero-friction local run) / PostgreSQL
- **Containerization**: Docker, Docker Compose

---

## 6. Project Structure

```
upi-shield/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (auth, analyze, dashboard, network, reports, admin)
│   │   ├── core/            # Config, JWT authentication, PBKDF2 cryptography
│   │   ├── database/        # SQLAlchemy session, ORM models & MongoDB connection manager
│   │   ├── ml/              # Model training pipelines, synthetic datasets, saved artifacts
│   │   ├── schemas/         # Pydantic v2 request/response schemas
│   │   ├── services/        # Message, URL, UPI, QR, Anomaly, Graph, and Unified Risk Engine
│   │   └── main.py          # FastAPI application entry point with lifespan events
│   ├── scripts/
│   │   └── seed_database.py # Database seeder (1000+ users, 5000+ txns, 200+ VPAs)
│   ├── tests/
│   │   └── test_api.py      # Automated pytest suite (10 unit/integration tests)
│   ├── requirements.txt
│   └── upi_shield.db        # Seeded local SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/      # RiskMeter, ExplainabilityCard, DemoModeBar, SimulatedPaymentModal
│   │   ├── context/         # AuthContext, DemoContext
│   │   ├── pages/           # 13 complete feature pages
│   │   ├── services/        # Axios API client
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── docs/
│   ├── architecture.md      # Full architectural blueprint
│   ├── api.md               # REST API documentation
│   └── ml.md                # Machine learning details & metrics
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 7. Installation & Local Setup

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
venv\Scripts\Activate.ps1
# On Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train ML models & seed database (auto-executes on first startup if missing)
python -m app.ml.train_models
python -m scripts.seed_database

# Start FastAPI backend server
uvicorn app.main:app --reload --port 8000
```
Backend API will be running at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend web application will be accessible at `http://localhost:5173`.

---

## 8. Running Automated Tests

Run the full backend test suite verifying authentication, multilingual NLP, URL heuristics, UPI VPA checks, transaction anomaly models, and fraud report generation:

```bash
cd backend
python -m pytest tests/test_api.py -v
```
*(All 10 tests pass in ~3-4 seconds)*.

---

## 9. Docker Deployment

To launch the full-stack containerized platform (FastAPI + Nginx frontend SPA):

```bash
# From project root
docker-compose up --build
```
- Web Application: `http://localhost`
- Backend API Docs: `http://localhost:8000/docs`

---

## 10. Compliance & Safety Notice

> **Important**:
> - All transactions, accounts, phone numbers, and fraud relationships are **synthetic demo data**.
> - UPI SHIELD does NOT connect to real bank accounts and does NOT execute real UPI transactions.
> - Clearly labeled simulated transactions as `DEMO / SIMULATED`.
> - Risk scores are AI-assisted indicators, not legal determinations.
> - For real-world financial fraud, contact your bank immediately and dial the National Cyber Crime Helpline at **1930** or file at **cybercrime.gov.in**.
