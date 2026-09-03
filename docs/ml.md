# UPI SHIELD — Machine Learning Pipeline

## 1. Overview
UPI SHIELD implements an explainable, multi-model AI architecture designed for low-latency local inference during live hackathon demonstrations.

The pipeline comprises:
1. **Multilingual NLP Scam Classifier** (TF-IDF + Calibrated Logistic Regression)
2. **Transaction Outlier Detector** (Isolation Forest)
3. **Graph Clustering & Propagation** (NetworkX)

---

## 2. Model 1: Multilingual Scam Classifier

### Dataset & Preprocessing
- **Synthetic Corpus**: 1,200+ balanced samples across 10 scam archetypes and legitimate bank notifications.
- **Language Coverage**: English (`en`), Hindi (`hi`), Kannada (`kn`), Telugu (`te`), Tamil (`ta`), Marathi (`mr`).
- **Feature Extraction**:
  - `TfidfVectorizer` configured with sublinear term-frequency scaling and character n-gram boundaries `(1, 3)` to robustly capture root words and agglutinative affixes in Indic scripts.

### Model Specification
- **Algorithm**: `LogisticRegression(C=2.0, class_weight='balanced', max_iter=1000)`
- **Evaluation Methodology**: 75/25 stratified train-test split.
- **Evaluation Results**:
  - **Accuracy**: 96.7%
  - **Precision**: 96.0%
  - **Recall**: 97.3%
  - **F1 Score**: 96.6%

### Artifacts Generated
- `backend/app/ml/artifacts/tfidf_vectorizer.joblib`
- `backend/app/ml/artifacts/message_classifier.joblib`
- `backend/app/ml/artifacts/metrics.json`

---

## 3. Model 2: Transaction Anomaly Detector

### Objective
Identify unauthorized transfers and account drains (e.g. nocturnal large transactions to newly created beneficiaries) without requiring prior fraud labels.

### Model Specification
- **Algorithm**: `IsolationForest(n_estimators=150, contamination=0.10, random_state=42)`
- **Feature Vector**:
  - `amount`: Transaction amount in INR
  - `hour`: Time of day (0–23)
  - `is_new_recipient`: Binary flag (0 = known payee, 1 = first-time payee)
  - `location_change`: Binary flag (0 = home city, 1 = novel location)
  - `device_change`: Binary flag (0 = trusted hardware signature, 1 = unfamiliar device)
  - `frequency_today`: Total velocity count of transfers executed on that day

### Decision Function
- Computes the average path length required to isolate a given transaction in random decision trees. Anomalous instances (e.g. ₹45,000 at 03:15 AM) have significantly shorter path lengths and yield high anomaly percentiles (>90%).

---

## 4. Retraining & Continuous Updates
To regenerate the synthetic training dataset and retrain both models from the command line:

```bash
cd backend
venv\Scripts\python.exe -m app.ml.train_models
```

Or via the Admin UI at `/admin` using the **"Retrain Pipeline On New Data"** button.

---

## 5. Synthetic Performance Disclaimer
> **Notice**: All model metrics and evaluation matrices displayed in UPI SHIELD are calculated using synthetically generated datasets designed to simulate real-world fraud distributions. They demonstrate algorithmic capability and architecture, and do not represent production performance against live commercial banking databases.
