import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.database.mongodb import mongo_manager
from app.api import auth, analyze, dashboard, network, reports, admin
from scripts.seed_database import seed_database
from app.ml.train_models import ARTIFACTS_DIR, train_all

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist and seed demo data
    print("[UPI SHIELD] Starting service... initializing database...")
    Base.metadata.create_all(bind=engine)
    
    # Check if ML model artifacts exist, otherwise train them
    msg_model = os.path.join(ARTIFACTS_DIR, "message_classifier.joblib")
    if not os.path.exists(msg_model):
        print("[UPI SHIELD] Training ML models for message classification & anomaly detection...")
        try:
            train_all()
        except Exception as e:
            print(f"[UPI SHIELD] ML training error: {e}")

    # Seed demo data
    try:
        seed_database()
    except Exception as e:
        print(f"[UPI SHIELD] Database auto-seed note: {e}")

    # Connect to MongoDB and synchronize collections
    try:
        if mongo_manager.connect():
            with SessionLocal() as session:
                mongo_manager.sync_from_sqlite(session)
    except Exception as e:
        print(f"[UPI SHIELD] MongoDB initialization note: {e}")

    yield
    print("[UPI SHIELD] Shutting down service.")
    mongo_manager.close()

app = FastAPI(
    title="🛡️ UPI SHIELD API",
    description="""
AI-Powered UPI Scam Detection, Prevention & Fraud Intelligence Platform.
Engineered to detect multilingual social engineering, malicious URLs, deceptive QR codes,
suspicious UPI VPAs, and transactional anomalies before payment execution.
    """,
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(analyze.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(network.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
def health_check():
    mongo_stats = mongo_manager.get_stats()
    return {
        "status": "healthy",
        "service": "UPI SHIELD Backend",
        "version": "1.0.0",
        "mode": "DEMO / SYNTHETIC ENVIRONMENT",
        "database": {
            "engine": "MongoDB (Primary) + SQLite (Cache)" if mongo_manager.is_connected else "SQLite",
            "mongodb": mongo_stats
        },
        "active_modules": [
            "MongoDB Database Cluster / Local Engine",
            "NLP Multilingual Scam Detector",
            "URL Phishing Heuristics",
            "UPI VPA Risk Engine",
            "QR Payload Parser",
            "Isolation Forest Anomaly Model",
            "NetworkX Fraud Graph Engine",
            "1930 Cyber Helpline Guidance"
        ]
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to 🛡️ UPI SHIELD API. Access interactive documentation at /docs",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
