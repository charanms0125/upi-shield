# UPI SHIELD — System Architecture

## 1. Executive Summary
**UPI SHIELD** is an AI-powered, multi-signal scam detection, prevention, and fraud intelligence platform designed to protect Indian consumers and digital merchants from UPI-related social engineering attacks, malicious QR codes, phishing links, and unauthorized account drains.

---

## 2. Multi-Signal Defense Architecture

UPI SHIELD does not rely on a single ML model or monolithic rule-engine. Instead, it aggregates seven distinct fraud vectors into a weighted, explainable threat score from **0 to 100**.

```
                           ┌──────────────────────────────────────────────┐
                           │          Incoming Interaction / Event        │
                           │ (SMS, WhatsApp, QR, Web Link, Txn Request)   │
                           └──────────────────────┬───────────────────────┘
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 │                                │                                │
                 ▼                                ▼                                ▼
       ┌───────────────────┐            ┌───────────────────┐            ┌───────────────────┐
       │   NLP Scam Text   │            │   URL & Domain    │            │     QR Protocol   │
       │     Classifier    │            │     Heuristics    │            │       Parser      │
       │ (Indic Multiling) │            │ (Spoof, Entropy)  │            │  (UPI URI, Token) │
       └─────────┬─────────┘            └─────────┬─────────┘            └─────────┬─────────┘
                 │                                │                                │
                 │        ┌───────────────────────┼───────────────────────┐        │
                 │        │                                               │        │
                 ▼        ▼                                               ▼        ▼
       ┌───────────────────┐                                     ┌───────────────────┐
       │   UPI VPA Risk    │                                     │  Isolation Forest │
       │     Profiler      │                                     │    Txn Anomaly    │
       │ (Handle, Reports) │                                     │ (Nocturnal, Spike)│
       └─────────┬─────────┘                                     └─────────┬─────────┘
                 │                                                         │
                 │        ┌───────────────────────────────────────┐        │
                 │        │                                       │        │
                 ▼        ▼                                       ▼        ▼
       ┌───────────────────┐                             ┌───────────────────┐
       │  NetworkX Graph   │                             │  User Habitual    │
       │  Community Rings  │                             │  Behavior Profile │
       │  (Mule Chains)    │                             │  (Normal vs Spike)│
       └─────────┬─────────┘                             └─────────┬─────────┘
                 │                                                 │
                 └────────────────────────┬────────────────────────┘
                                          │
                                          ▼
                       ┌─────────────────────────────────────┐
                       │           FraudRiskEngine           │
                       │    Multi-Signal Weighted Fusion     │
                       │   Message: 20%  |  URL: 15%         │
                       │   UPI VPA: 15%  |  Txn Anomaly: 20% │
                       │   Behaviour: 15%|  Graph: 15%       │
                       └──────────────────┬──────────────────┘
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
       ┌───────────────────────────┐             ┌───────────────────────────┐
       │     Explainable AI        │             │  Pre-Payment Guardrail    │
       │    (Feature Weights)      │             │     & 1930 Incident       │
       │ Urgency +22 | Payment +27 │             │  Official Cybercrime Form │
       └───────────────────────────┘             └───────────────────────────┘
```

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (Dark Cyber/Fintech Design System, Glassmorphism)
- **Icons & Visuals**: Lucide React, Canvas Confetti
- **Telemetry Charts**: Recharts (Area, Bar, Donut)
- **Routing & Networking**: React Router DOM v6, Axios

### Backend
- **Core Framework**: Python 3.10+, FastAPI (Asynchronous REST)
- **Data Validation & Schemas**: Pydantic v2
- **ORM & Database**: SQLAlchemy (SQLite for local zero-friction run, PostgreSQL ready)
- **Security & Cryptography**: PBKDF2 HMAC-SHA256, Python-Jose (JWT Bearer Tokens)

### Machine Learning & Graph Analysis
- **NLP Vectorization & Classification**: Scikit-Learn TF-IDF (1-3 character & word n-grams) + Calibrated Logistic Regression
- **Transaction Anomaly Detection**: Scikit-Learn Isolation Forest (unsupervised outlier isolation)
- **Graph Topology & Ring Discovery**: NetworkX (DiGraph, degree centrality, connected components)

---

## 4. Risk Categories & Thresholds

| Risk Score | Risk Category | Color Code | Action Protocol |
|---|---|---|---|
| **0 – 29** | 🟢 **LOW RISK** | Emerald `#10B981` | Safe to proceed. Standard transaction diligence. |
| **30 – 59** | 🟡 **SUSPICIOUS** | Amber `#F59E0B` | Warning: Potential anomaly or unknown entity. Verify before PIN entry. |
| **60 – 79** | 🟠 **HIGH RISK** | Orange `#F97316` | High fraud probability. Scammer techniques detected. |
| **80 – 100** | 🔴 **CRITICAL RISK** | Red `#EF4444` | Automatic pre-payment block. Mandatory reporting advised. |

---

## 5. Compliance & Ethics Statement
All transaction records, account details, and fraud networks represent **synthetic demo data**. UPI SHIELD does NOT connect to live banking core systems and does NOT process real currency. Risk scores are AI-assisted analytical indicators, not legal determinations.
