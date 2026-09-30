import os
from typing import Optional, Dict, Any
from datetime import datetime
import pymongo
from pymongo import MongoClient
from pymongo.database import Database
from app.core.config import settings

class MongoDBManager:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
        self.is_connected: bool = False

    def connect(self) -> bool:
        """Connect to MongoDB server and initialize database instance."""
        if not settings.MONGODB_ENABLED:
            print("[MongoDB] Disabled in configuration.")
            return False

        try:
            print(f"[MongoDB] Connecting to {settings.MONGODB_URL} (Database: {settings.MONGODB_DB_NAME})...")
            self.client = MongoClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=3000,
                connectTimeoutMS=3000,
                maxPoolSize=50
            )
            # Ping to verify active connection
            self.client.admin.command('ping')
            self.db = self.client[settings.MONGODB_DB_NAME]
            self.is_connected = True
            print(f"[MongoDB] Connected successfully to database '{settings.MONGODB_DB_NAME}'.")

            # Setup indexes
            self._init_indexes()
            return True
        except Exception as e:
            print(f"[MongoDB] Connection warning: {e}")
            self.is_connected = False
            self.db = None
            return False

    def _init_indexes(self):
        """Create high-performance indexes for core collections."""
        if self.db is None:
            return
        try:
            self.db.users.create_index("email", unique=True)
            self.db.transactions.create_index("transaction_ref", unique=True)
            self.db.transactions.create_index([("timestamp", pymongo.DESCENDING)])
            self.db.upi_identifiers.create_index("upi_id", unique=True)
            self.db.fraud_reports.create_index("incident_id", unique=True)
            self.db.risk_assessments.create_index([("created_at", pymongo.DESCENDING)])
            self.db.alerts.create_index([("created_at", pymongo.DESCENDING)])
        except Exception as e:
            print(f"[MongoDB] Index creation note: {e}")

    def close(self):
        """Close connection cleanly."""
        if self.client:
            self.client.close()
            self.is_connected = False
            print("[MongoDB] Connection closed.")

    def get_stats(self) -> Dict[str, Any]:
        """Return connectivity details and document counts."""
        if not self.is_connected or self.db is None:
            return {
                "status": "disconnected",
                "url": settings.MONGODB_URL,
                "database": settings.MONGODB_DB_NAME,
                "collections": {}
            }

        collection_names = self.db.list_collection_names()
        counts = {}
        for coll in collection_names:
            try:
                counts[coll] = self.db[coll].count_documents({})
            except Exception:
                pass

        return {
            "status": "connected",
            "url": settings.MONGODB_URL,
            "database": settings.MONGODB_DB_NAME,
            "collections": counts,
            "total_documents": sum(counts.values())
        }

    def sync_from_sqlite(self, db_session):
        """Sync all relational SQLite tables into MongoDB collections if empty or upon launch."""
        if not self.is_connected or self.db is None:
            return

        try:
            from app.database.models import (
                User, Transaction, UPIIdentifier, FraudReport,
                ScamMessage, Alert, DeviceProfile, FraudRelationship, RiskAssessment
            )

            # Check if users already synced
            user_count = self.db.users.count_documents({})
            if user_count > 0:
                print(f"[MongoDB] Collections already populated ({user_count} users). Skipping full re-sync.")
                return

            print("[MongoDB] Syncing SQLite data into MongoDB collections...")

            # 1. Users
            users = db_session.query(User).all()
            if users:
                user_docs = []
                for u in users:
                    user_docs.append({
                        "id": u.id,
                        "email": u.email,
                        "full_name": u.full_name,
                        "phone_number": u.phone_number,
                        "hashed_password": u.hashed_password,
                        "role": u.role,
                        "is_active": u.is_active,
                        "created_at": u.created_at,
                        "updated_at": u.updated_at
                    })
                self.db.users.insert_many(user_docs, ordered=False)
                print(f"[MongoDB] Synced {len(user_docs)} users.")

            # 2. UPI Identifiers
            upis = db_session.query(UPIIdentifier).all()
            if upis:
                upi_docs = []
                for upi in upis:
                    upi_docs.append({
                        "id": upi.id,
                        "upi_id": upi.upi_id,
                        "display_name": upi.display_name,
                        "handle": upi.handle,
                        "risk_score": upi.risk_score,
                        "risk_status": upi.risk_status,
                        "report_count": upi.report_count,
                        "connected_entities_count": upi.connected_entities_count,
                        "verified_merchant": upi.verified_merchant,
                        "notes": upi.notes,
                        "created_at": upi.created_at
                    })
                self.db.upi_identifiers.insert_many(upi_docs, ordered=False)
                print(f"[MongoDB] Synced {len(upi_docs)} UPI identifiers.")

            # 3. Transactions
            txns = db_session.query(Transaction).all()
            if txns:
                txn_docs = []
                for t in txns:
                    txn_docs.append({
                        "id": t.id,
                        "transaction_ref": t.transaction_ref,
                        "user_id": t.user_id,
                        "sender_upi": t.sender_upi,
                        "recipient_upi": t.recipient_upi,
                        "recipient_name": t.recipient_name,
                        "amount": t.amount,
                        "currency": t.currency,
                        "timestamp": t.timestamp,
                        "location": t.location,
                        "device_id": t.device_id,
                        "ip_address": t.ip_address,
                        "is_flagged": t.is_flagged,
                        "risk_score": t.risk_score,
                        "risk_category": t.risk_category,
                        "anomaly_indicators": t.anomaly_indicators,
                        "status": t.status,
                        "created_at": t.created_at
                    })
                self.db.transactions.insert_many(txn_docs, ordered=False)
                print(f"[MongoDB] Synced {len(txn_docs)} transactions.")

            # 4. Fraud Reports
            reports = db_session.query(FraudReport).all()
            if reports:
                report_docs = []
                for r in reports:
                    report_docs.append({
                        "id": r.id,
                        "incident_id": r.incident_id,
                        "user_id": r.user_id,
                        "reported_upi": r.reported_upi,
                        "reported_phone": r.reported_phone,
                        "transaction_ref": r.transaction_ref,
                        "amount_lost": r.amount_lost,
                        "scam_type": r.scam_type,
                        "description": r.description,
                        "status": r.status,
                        "cybercrime_portal_advised": r.cybercrime_portal_advised,
                        "helpline_1930_advised": r.helpline_1930_advised,
                        "created_at": r.created_at
                    })
                self.db.fraud_reports.insert_many(report_docs, ordered=False)
                print(f"[MongoDB] Synced {len(report_docs)} fraud reports.")

            # 5. Alerts
            alerts = db_session.query(Alert).all()
            if alerts:
                alert_docs = []
                for a in alerts:
                    alert_docs.append({
                        "id": a.id,
                        "severity": a.severity,
                        "title": a.title,
                        "description": a.description,
                        "related_entity": a.related_entity,
                        "is_read": a.is_read,
                        "created_at": a.created_at
                    })
                self.db.alerts.insert_many(alert_docs, ordered=False)
                print(f"[MongoDB] Synced {len(alert_docs)} alerts.")

            # 6. Scam Messages
            messages = db_session.query(ScamMessage).all()
            if messages:
                msg_docs = []
                for m in messages:
                    msg_docs.append({
                        "id": m.id,
                        "message_text": m.message_text,
                        "language": m.language,
                        "scam_type": m.scam_type,
                        "is_scam": m.is_scam,
                        "confidence": m.confidence,
                        "indicators": m.indicators,
                        "created_at": m.created_at
                    })
                self.db.scam_messages.insert_many(msg_docs, ordered=False)
                print(f"[MongoDB] Synced {len(msg_docs)} scam messages.")

            # 7. Device Profiles
            profiles = db_session.query(DeviceProfile).all()
            if profiles:
                dp_docs = []
                for dp in profiles:
                    dp_docs.append({
                        "id": dp.id,
                        "user_id": dp.user_id,
                        "device_fingerprint": dp.device_fingerprint,
                        "avg_transaction_amount": dp.avg_transaction_amount,
                        "typical_start_hour": dp.typical_start_hour,
                        "typical_end_hour": dp.typical_end_hour,
                        "typical_recipients": dp.typical_recipients,
                        "typical_locations": dp.typical_locations,
                        "created_at": dp.created_at
                    })
                self.db.device_profiles.insert_many(dp_docs, ordered=False)

            # 8. Fraud Relationships
            rels = db_session.query(FraudRelationship).all()
            if rels:
                rel_docs = []
                for rel in rels:
                    rel_docs.append({
                        "id": rel.id,
                        "source_type": rel.source_type,
                        "source_id": rel.source_id,
                        "target_type": rel.target_type,
                        "target_id": rel.target_id,
                        "relationship_type": rel.relationship_type,
                        "risk_weight": rel.risk_weight,
                        "created_at": rel.created_at
                    })
                self.db.fraud_relationships.insert_many(rel_docs, ordered=False)

            print("[MongoDB] SQLite-to-MongoDB synchronization complete!")
        except Exception as e:
            print(f"[MongoDB Sync Error] {e}")

    def record_risk_assessment(self, doc: Dict[str, Any]):
        """Persist a live risk assessment to MongoDB."""
        if self.is_connected and self.db is not None:
            try:
                data = doc.copy()
                data["created_at"] = data.get("created_at") or datetime.utcnow()
                self.db.risk_assessments.insert_one(data)
            except Exception as e:
                print(f"[MongoDB] Risk assessment logging error: {e}")

    def record_fraud_report(self, doc: Dict[str, Any]):
        """Persist a fraud report to MongoDB."""
        if self.is_connected and self.db is not None:
            try:
                data = doc.copy()
                data["created_at"] = data.get("created_at") or datetime.utcnow()
                self.db.fraud_reports.insert_one(data)
            except Exception as e:
                print(f"[MongoDB] Fraud report logging error: {e}")

    def record_alert(self, doc: Dict[str, Any]):
        """Persist an alert to MongoDB."""
        if self.is_connected and self.db is not None:
            try:
                data = doc.copy()
                data["created_at"] = data.get("created_at") or datetime.utcnow()
                self.db.alerts.insert_one(data)
            except Exception as e:
                print(f"[MongoDB] Alert logging error: {e}")

    def record_user(self, doc: Dict[str, Any]):
        """Persist a registered user to MongoDB."""
        if self.is_connected and self.db is not None:
            try:
                data = doc.copy()
                data["created_at"] = data.get("created_at") or datetime.utcnow()
                self.db.users.insert_one(data)
            except Exception as e:
                print(f"[MongoDB] User logging error: {e}")

    def record_transaction(self, doc: Dict[str, Any]):
        """Persist a transaction to MongoDB."""
        if self.is_connected and self.db is not None:
            try:
                data = doc.copy()
                data["created_at"] = data.get("created_at") or datetime.utcnow()
                self.db.transactions.insert_one(data)
            except Exception as e:
                print(f"[MongoDB] Transaction logging error: {e}")

# Global singleton
mongo_manager = MongoDBManager()

def get_mongo_db() -> Optional[Database]:
    """Dependency or helper to access MongoDB database instance."""
    return mongo_manager.db
