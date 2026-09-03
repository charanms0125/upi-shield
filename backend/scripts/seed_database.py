"""
UPI SHIELD - Database Seeder
Seeds the database with:
- Demo accounts: admin@upishield.demo, user@upishield.demo
- 1000+ synthetic users
- 5000+ synthetic transactions
- 200+ synthetic UPI IDs
- 500+ scam messages
- 100+ fraud relationships
All clearly marked as SYNTHETIC DEMO DATA.
"""

import random
from datetime import datetime, timedelta
from app.database.session import SessionLocal, engine, Base
from app.database.models import (
    User, Transaction, UPIIdentifier, FraudReport,
    ScamMessage, Alert, DeviceProfile, FraudRelationship
)
from app.core.security import get_password_hash
from app.ml.synthetic_data import (
    generate_synthetic_messages, generate_synthetic_transactions,
    SUSPICIOUS_UPIS, generate_fraud_graph_data
)

def seed_database():
    print("=== Initializing UPI SHIELD Database Tables ===")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    existing_user = db.query(User).filter(User.email == "admin@upishield.demo").first()
    if existing_user:
        print("[DB] Database already seeded. Skipping duplicate seeding.")
        db.close()
        return

    print("[DB] Seeding Core Demo Accounts...")
    # 1. Demo Admin
    admin = User(
        email="admin@upishield.demo",
        full_name="Cyber Threat Admin",
        phone_number="+91 99000 00001",
        hashed_password=get_password_hash("Admin@123"),
        role="admin",
        is_active=True
    )
    # 2. Demo User
    user = User(
        email="user@upishield.demo",
        full_name="Priya Sharma",
        phone_number="+91 99000 00002",
        hashed_password=get_password_hash("User@123"),
        role="user",
        is_active=True
    )
    db.add(admin)
    db.add(user)
    db.commit()
    db.refresh(user)

    # 3. User Device Profile
    profile = DeviceProfile(
        user_id=user.id,
        device_fingerprint="Pixel_7_Pro_Trusted",
        avg_transaction_amount=450.0,
        typical_start_hour=8,
        typical_end_hour=22,
        typical_recipients=["swiggy@icici", "dmart.retail@hdfcbank", "milk@okaxis", "friend@upi"],
        typical_locations=["Bengaluru, IN", "Indiranagar, Bengaluru"]
    )
    db.add(profile)

    # 4. Generate 1000+ Synthetic Users
    print("[DB] Seeding 1,000 Synthetic Users...")
    synthetic_users = []
    first_names = ["Aarav", "Vihaan", "Aditya", "Sai", "Reyansh", "Ananya", "Diya", "Isha", "Saanvi", "Myra", "Rohan", "Sneha", "Kavya", "Rahul", "Naveen", "Pooja"]
    last_names = ["Sharma", "Verma", "Patel", "Reddy", "Iyer", "Nair", "Rao", "Hegde", "Deshmukh", "Kulkarni", "Singh", "Gupta"]
    
    for i in range(1, 1001):
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        email = f"{fn.lower()}.{ln.lower()}{i}@example.demo"
        synthetic_users.append(
            User(
                email=email,
                full_name=f"{fn} {ln}",
                phone_number=f"+91 98{random.randint(10000000, 99999999)}",
                hashed_password=get_password_hash("DemoUser@123"),
                role="user",
                is_active=True
            )
        )
    db.bulk_save_objects(synthetic_users)
    db.commit()

    # 5. Generate 200+ Synthetic UPI IDs
    print("[DB] Seeding 200+ Synthetic UPI Identifiers...")
    upis = []
    # Add known suspicious ones
    for s_upi in SUSPICIOUS_UPIS:
        upis.append(UPIIdentifier(
            upi_id=s_upi,
            display_name=s_upi.split("@")[0].replace(".", " ").title(),
            handle=s_upi.split("@")[1],
            risk_score=random.uniform(85.0, 96.0),
            risk_status="HIGH_RISK",
            report_count=random.randint(8, 22),
            connected_entities_count=random.randint(4, 10),
            verified_merchant=False,
            notes="SYNTHETIC DEMO: Flagged in community phishing and payment spoof reports."
        ))

    # Add safe merchant VPAs
    safe_merchants = [
        ("swiggy@icici", "Swiggy Delivery", "icici", 2.0, "SAFE", True),
        ("zomato@hdfcbank", "Zomato Online", "hdfcbank", 2.0, "SAFE", True),
        ("dmart.retail@hdfcbank", "DMart Supermarket", "hdfcbank", 2.0, "SAFE", True),
        ("amazon.pay@apl", "Amazon Pay India", "apl", 3.0, "SAFE", True),
        ("flipkart.payments@axis", "Flipkart Internet", "axis", 3.0, "SAFE", True),
        ("ola.cabs@icici", "Ola Cabs Mobility", "icici", 2.0, "SAFE", True),
        ("uber.india@okaxis", "Uber Rides India", "okaxis", 2.0, "SAFE", True)
    ]
    for m_upi, name, h, r, st, ver in safe_merchants:
        upis.append(UPIIdentifier(
            upi_id=m_upi,
            display_name=name,
            handle=h,
            risk_score=r,
            risk_status=st,
            report_count=0,
            connected_entities_count=1,
            verified_merchant=ver,
            notes="SYNTHETIC DEMO: Verified official merchant VPA."
        ))

    # Add general user VPAs to reach 200+
    for i in range(1, 190):
        handle = random.choice(["okhdfcbank", "okaxis", "oksbi", "ybl", "paytm"])
        u_name = f"user_{i}_{random.randint(10,99)}"
        is_risky = random.random() < 0.15
        r_score = random.uniform(65.0, 92.0) if is_risky else random.uniform(2.0, 25.0)
        upis.append(UPIIdentifier(
            upi_id=f"{u_name}@{handle}",
            display_name=u_name.replace("_", " ").title(),
            handle=handle,
            risk_score=round(r_score, 1),
            risk_status="HIGH_RISK" if r_score > 75 else ("SUSPICIOUS" if r_score > 30 else "SAFE"),
            report_count=random.randint(3, 12) if is_risky else 0,
            connected_entities_count=random.randint(2, 6) if is_risky else 1,
            verified_merchant=False,
            notes="SYNTHETIC DEMO DATA."
        ))
    db.bulk_save_objects(upis)
    db.commit()

    # 6. Generate 500+ Labeled Scam Messages
    print("[DB] Seeding 500+ Labeled Multilingual Scam Messages...")
    raw_msgs = generate_synthetic_messages(count=550)
    messages = []
    for m in raw_msgs:
        messages.append(ScamMessage(
            message_text=m["message"],
            language=m["language"],
            scam_type=m["scam_type"],
            is_scam=bool(m["is_scam"]),
            confidence=0.95 if m["is_scam"] else 0.99,
            indicators=["Urgency", "Payment Request"] if m["is_scam"] else ["Legitimate Transaction"]
        ))
    db.bulk_save_objects(messages)
    db.commit()

    # 7. Generate 5000+ Synthetic Transactions
    print("[DB] Seeding 5,000 Synthetic Transactions...")
    now = datetime.utcnow()
    txns = []
    recipients_pool = [u.upi_id for u in upis[:30]]
    for i in range(1, 5001):
        is_anom = random.random() < 0.08
        amount = float(random.randint(25000, 85000)) if is_anom else float(random.choice([random.randint(40, 800), random.randint(200, 2500)]))
        hour = random.choice([1, 2, 3, 4]) if is_anom else random.randint(8, 22)
        days_ago = random.randint(0, 30)
        t_time = now - timedelta(days=days_ago, hours=now.hour - hour, minutes=random.randint(0, 59))
        recip = random.choice(recipients_pool)
        r_score = random.uniform(75.0, 96.0) if is_anom else random.uniform(2.0, 20.0)

        txns.append(Transaction(
            transaction_ref=f"UPI-SIM-{100000 + i}",
            user_id=user.id,
            sender_upi="user@upishield.demo",
            recipient_upi=recip,
            recipient_name=recip.split("@")[0].title(),
            amount=amount,
            currency="INR",
            timestamp=t_time,
            location="Kolkata, IN" if is_anom else "Bengaluru, IN",
            device_id="Unknown_Device_X9" if is_anom else "Pixel_7_Pro_Trusted",
            is_flagged=is_anom,
            risk_score=round(r_score, 1),
            risk_category="CRITICAL" if r_score >= 80 else ("HIGH" if r_score >= 60 else "LOW"),
            anomaly_indicators=["High Amount", "Nocturnal Window", "New Recipient"] if is_anom else [],
            status="FLAGGED" if is_anom else "COMPLETED"
        ))

    db.bulk_save_objects(txns)
    db.commit()

    # 8. Generate 100+ Fraud Relationships
    print("[DB] Seeding 100+ Fraud Network Relationships...")
    graph_data = generate_fraud_graph_data()
    relationships = []
    # Seed core edges
    for edge in graph_data["edges"]:
        relationships.append(FraudRelationship(
            source_type="NODE",
            source_id=edge["source"],
            target_type="NODE",
            target_id=edge["target"],
            relationship_type=edge["relation"],
            risk_weight=edge["risk_weight"]
        ))
    # Seed additional edges to surpass 100+
    for i in range(1, 95):
        s = random.choice(graph_data["nodes"])["id"]
        t = random.choice(graph_data["nodes"])["id"]
        if s != t:
            relationships.append(FraudRelationship(
                source_type="NODE",
                source_id=s,
                target_type="NODE",
                target_id=t,
                relationship_type=random.choice(["TRANSFERS_TO", "SHARED_IP", "LINKED_DEVICE", "CO_REPORTED"]),
                risk_weight=round(random.uniform(0.3, 0.9), 2)
            ))
    db.bulk_save_objects(relationships)
    db.commit()

    # 9. Seed Initial Alerts
    alerts = [
        Alert(severity="CRITICAL", title="Fake KYC Phishing Surge", description="High frequency of SMS targeting SBI YONO users requesting ₹10 verification fee.", related_entity="sbi.helpline.nodal@ybl"),
        Alert(severity="HIGH", title="Suspicious VPA Active in Electricity Scams", description="Identified fake BESCOM officer demanding urgent UPI settlement under threat of power cutoff.", related_entity="electricity.bill.desk99@paytm"),
        Alert(severity="MEDIUM", title="Unknown Recipient Nocturnal Transaction Intercepted", description="₹45,000 transfer attempted at 03:15 AM flagged for stepping-up biometric verification.", related_entity="rajesh123@upi"),
        Alert(severity="LOW", title="Legitimate Merchant Whitelist Updated", description="Added verified status for 14 leading retail merchant payment gateways.", related_entity="NPCI-Gateway")
    ]
    db.bulk_save_objects(alerts)
    db.commit()

    db.close()
    print("=== Database Seeding Complete! Demo accounts: admin@upishield.demo & user@upishield.demo ===")

if __name__ == "__main__":
    seed_database()
