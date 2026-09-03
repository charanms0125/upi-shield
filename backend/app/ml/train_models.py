"""
UPI SHIELD - Machine Learning Model Training & Evaluation
Trains:
1. Multilingual TF-IDF + Logistic Regression Message Classifier
2. Isolation Forest Transaction Anomaly Detector
Saves models to app/ml/artifacts/ and exports metrics.json.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import IsolationForest
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

from app.ml.synthetic_data import generate_synthetic_messages, generate_synthetic_transactions

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def train_message_classifier():
    print("[ML] Generating synthetic message dataset...")
    raw_data = generate_synthetic_messages(count=1200)
    df = pd.DataFrame(raw_data)

    X = df["message"]
    y = df["is_scam"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    print("[ML] Fitting TF-IDF Vectorizer...")
    # Word + char_wb vectorizer handles Indic scripts and Romanized words well
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 3),
        max_features=5000,
        sublinear_tf=True
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    print("[ML] Training Logistic Regression Classifier...")
    model = LogisticRegression(C=2.0, max_iter=1000, class_weight="balanced", random_state=42)
    model.fit(X_train_vec, y_train)

    y_pred = model.predict(X_test_vec)
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()

    print(f"[ML] Message Classifier Trained: Acc={acc:.3f}, Prec={prec:.3f}, Rec={rec:.3f}, F1={f1:.3f}")

    # Save artifacts
    joblib.dump(vectorizer, os.path.join(ARTIFACTS_DIR, "tfidf_vectorizer.joblib"))
    joblib.dump(model, os.path.join(ARTIFACTS_DIR, "message_classifier.joblib"))

    return {
        "model_name": "Multilingual NLP Scam Classifier",
        "model_type": "TF-IDF + Calibrated Logistic Regression",
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": {
            "tn": cm[0][0], "fp": cm[0][1],
            "fn": cm[1][0], "tp": cm[1][1]
        },
        "training_sample_count": len(df),
        "synthetic_disclaimer": "Performance shown is based on synthetic/demo data and does not represent production fraud-detection accuracy."
    }

def train_anomaly_detector():
    print("[ML] Generating synthetic transaction dataset...")
    raw_txns = generate_synthetic_transactions(count=5000)
    df_txns = pd.DataFrame(raw_txns)

    features = ["amount", "hour", "is_new_recipient", "location_change", "device_change", "frequency_today"]
    X = df_txns[features].values

    print("[ML] Fitting Isolation Forest...")
    iso_forest = IsolationForest(
        n_estimators=150,
        contamination=0.10,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X)

    # Save model
    joblib.dump(iso_forest, os.path.join(ARTIFACTS_DIR, "anomaly_detector.joblib"))
    print("[ML] Isolation Forest trained and saved successfully.")

def train_all():
    print("=== Training UPI SHIELD Machine Learning Models ===")
    msg_metrics = train_message_classifier()
    train_anomaly_detector()

    metrics_path = os.path.join(ARTIFACTS_DIR, "metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(msg_metrics, f, indent=2)

    print(f"[ML] All models and metrics saved to: {ARTIFACTS_DIR}")
    return msg_metrics

if __name__ == "__main__":
    train_all()
