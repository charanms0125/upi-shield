import os
import re
import joblib
from typing import Dict, Any, List, Tuple
from app.ml.train_models import ARTIFACTS_DIR, train_all

LANGUAGE_MAP = {
    "en": "English 🇬🇧",
    "hi": "Hindi 🇮🇳",
    "kn": "Kannada 🇮🇳",
    "te": "Telugu 🇮🇳",
    "ta": "Tamil 🇮🇳",
    "mr": "Marathi 🇮🇳"
}

INDICATORS_DEF = [
    ("Urgency language", [
        r"urgently?", r"immediately", r"today", r"within\s+\d+\s*(hours?|hrs?|minutes?|mins?)",
        r"24\s*hours?", r"blocked\s+today", r"expire[ds]?", r"deactivate[ds]?",
        r"तुरंत", r"तत्काल", r"आज\s*ही", r"तातडीने", r"ತಕ್ಷಣ", r"ಕೂಡಲೇ", r"ಇಂದೇ",
        r"వెంటనే", r"ఈరోజే", r"உடனடியாக", r"இன்றே"
    ], 22.0),
    ("Threat/Fear language", [
        r"blocked", r"suspended", r"terminated", r"arrest", r"police", r"warrant",
        r"power\s+cut", r"disconnected", r"black\s*out", r"de-activated",
        r"बंद\s*कर", r"सस्पेंड", r"गिरफ्तारी", r"कारवाई", r"ಸ್ಥಗಿತ", r"ರದ್ದು",
        r"నిలిపివే", r"అరెస్ట్", r"முடக்கப்படும்", r"கைது"
    ], 24.0),
    ("Payment request", [
        r"pay\b", r"send\s+(rs\.?|inr|₹)", r"transfer", r"deposit", r"re\.?\s*1",
        r"verification\s+fee", r"gst\s+fee", r"clear\s+balance", r"bail\s+bond",
        r"शुल्क", r"पैसे\s*भेजें", r"भुगतान", r"ಪಾವತಿಸಿ", r"ಹಣ\s*ಕಳುಹಿಸಿ",
        r"చెల్లించండి", r"డబ్బు\s*పంపండి", r"செலுத்தவும்", r"பணம்\s*அனுப்பவும்"
    ], 26.0),
    ("Credential / PIN request", [
        r"upi\s*pin", r"\bpin\b", r"\botp\b", r"one\s*time\s*password", r"password",
        r"cvv", r"card\s*number", r"enter\s*pin\s*to\s*receive",
        r"पिन", r"ओटीपी", r"ಪಾಸ್‌ವರ್ಡ್", r"పిన్", r"ரகசிய\s*எண்"
    ], 28.0),
    ("Organization Impersonation", [
        r"sbi", r"yono", r"hdfc", r"icici", r"axis\s*bank", r"paytm", r"phonepe",
        r"google\s*pay", r"gpay", r"bhim", r"bescom", r"msedcl", r"cbi",
        r"cyber\s*crime\s*police", r"delhi\s*police", r"npci", r"rbi", r"amazon", r"flipkart"
    ], 18.0),
    ("Suspicious Link / Portal", [
        r"https?://[^\s]+", r"bit\.ly", r"tinyurl", r"\.xyz", r"\.top", r"\.click",
        r"\.online", r"\.cc", r"\.site", r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b"
    ], 19.0),
    ("KYC / Verification Hook", [
        r"\bkyc\b", r"aadhaar", r"pan\s*card", r"verify\s+your\s+account",
        r"update\s+kyc", r"केवायसी", r"आधार", r"ಪರಿಶೀಲನೆ", r"ధృవీకరణ", r"சரிபார்ப்பு"
    ], 20.0),
    ("Refund / Lottery Lure", [
        r"refund", r"cashback", r"lottery", r"won\b", r"lucky\s*draw", r"winner",
        r"claim\s*prize", r"earn\s*money", r"work\s*from\s*home", r"dividend",
        r"रिफंड", r"इनाम", r"ಲಾಟರಿ", r"ಬಹುಮಾನ", r"రీఫండ్", r"பரிசு", r"परतावा"
    ], 21.0),
    ("Remote Access Tool Solicitation", [
        r"anydesk", r"teamviewer", r"quicksupport", r"rustdesk", r"screen\s*share"
    ], 30.0)
]

def detect_language(text: str) -> Tuple[str, str]:
    """Detects Indian script or English using Unicode blocks."""
    for char in text:
        code = ord(char)
        if 0x0C80 <= code <= 0x0CFF:
            return "kn", LANGUAGE_MAP["kn"]
        if 0x0C00 <= code <= 0x0C7F:
            return "te", LANGUAGE_MAP["te"]
        if 0x0B80 <= code <= 0x0BFF:
            return "ta", LANGUAGE_MAP["ta"]
        if 0x0900 <= code <= 0x097F:
            # Check for Marathi specific characters if needed, default Hindi
            if "आहे" in text or "करा" in text or "झाले" in text or "खाते" in text:
                return "mr", LANGUAGE_MAP["mr"]
            return "hi", LANGUAGE_MAP["hi"]
    return "en", LANGUAGE_MAP["en"]

class MessageAnalyzerService:
    def __init__(self):
        self.vectorizer = None
        self.model = None
        self._load_or_train_models()

    def _load_or_train_models(self):
        vec_path = os.path.join(ARTIFACTS_DIR, "tfidf_vectorizer.joblib")
        model_path = os.path.join(ARTIFACTS_DIR, "message_classifier.joblib")

        if os.path.exists(vec_path) and os.path.exists(model_path):
            try:
                self.vectorizer = joblib.load(vec_path)
                self.model = joblib.load(model_path)
                return
            except Exception as e:
                print(f"[MessageAnalyzer] Error loading cached models: {e}")

        # Train models if missing
        print("[MessageAnalyzer] Training models on startup...")
        train_all()
        try:
            self.vectorizer = joblib.load(vec_path)
            self.model = joblib.load(model_path)
        except Exception as e:
            print(f"[MessageAnalyzer] Fallback: running heuristic rule engine. ({e})")

    def analyze(self, message: str, language_hint: str = None) -> Dict[str, Any]:
        lang_code, lang_display = detect_language(message)
        if language_hint and language_hint in LANGUAGE_MAP:
            lang_code = language_hint
            lang_display = LANGUAGE_MAP[language_hint]

        msg_lower = message.lower()
        matched_indicators = []
        feature_contributions = {}
        heuristic_score = 0.0

        for name, patterns, weight in INDICATORS_DEF:
            matched = False
            for pattern in patterns:
                if re.search(pattern, msg_lower if lang_code == "en" else message, re.IGNORECASE):
                    matched = True
                    break
            if matched:
                matched_indicators.append(name)
                feature_contributions[name] = round(weight, 1)
                heuristic_score += weight

        # ML Model prediction
        ml_prob = 0.0
        if self.model and self.vectorizer:
            try:
                vec = self.vectorizer.transform([message])
                probs = self.model.predict_proba(vec)[0]
                # Class 1 is scam
                ml_prob = float(probs[1]) if len(probs) > 1 else 0.5
            except Exception as e:
                print(f"[ML Inference Error] {e}")
                ml_prob = min(heuristic_score / 100.0, 0.95)
        else:
            ml_prob = min(heuristic_score / 100.0, 0.95)

        # Combine ML model probability (60%) and heuristic indicator signals (40%)
        combined_prob = (ml_prob * 0.60) + (min(heuristic_score / 100.0, 1.0) * 0.40)
        risk_score = round(min(max(combined_prob * 100.0, 5.0), 99.0), 1)

        # Specific high-risk triggers
        if "Credential / PIN request" in matched_indicators and "Payment request" in matched_indicators:
            risk_score = max(risk_score, 92.0)
        elif "Remote Access Tool Solicitation" in matched_indicators:
            risk_score = max(risk_score, 95.0)
        elif "KYC / Verification Hook" in matched_indicators and "Urgency language" in matched_indicators:
            risk_score = max(risk_score, 88.0)

        # Detect Scam Type
        scam_type = "SUSPICIOUS_COMMUNICATION"
        if "KYC / Verification Hook" in matched_indicators:
            scam_type = "KYC PHISHING"
        elif "Refund / Lottery Lure" in matched_indicators:
            scam_type = "FAKE REFUND / LOTTERY SCAM"
        elif "Threat/Fear language" in matched_indicators and ("arrest" in msg_lower or "police" in msg_lower or "cbi" in msg_lower):
            scam_type = "POLICE / LEGAL IMPERSONATION"
        elif re.search(r"power\s+cut", msg_lower) or "electricity" in msg_lower or "ವಿದ್ಯುತ್" in message or "बिजली" in message:
            scam_type = "ELECTRICITY BILL SCAM"
        elif "Remote Access Tool Solicitation" in matched_indicators:
            scam_type = "TECH SUPPORT / ANYDESK SCAM"
        elif len(matched_indicators) == 0 and risk_score < 30:
            scam_type = "LEGITIMATE / LOW RISK"

        # Determine Category
        if risk_score >= 80:
            category = "CRITICAL"
        elif risk_score >= 60:
            category = "HIGH"
        elif risk_score >= 30:
            category = "SUSPICIOUS"
        else:
            category = "LOW"

        # Recommendation
        if category in ["CRITICAL", "HIGH"]:
            recommendation = (
                "Do NOT click any links, enter your UPI PIN, or transfer any money. "
                "Official banks or government agencies never demand immediate payments or ask for PIN/OTP to verify accounts."
            )
            safe_to_proceed = False
        elif category == "SUSPICIOUS":
            recommendation = (
                "Proceed with caution. Verify this communication directly with your official banking app "
                "or call the official customer care number found on the back of your debit card."
            )
            safe_to_proceed = False
        else:
            recommendation = "No prominent social engineering or scam patterns detected. Standard safe interaction."
            safe_to_proceed = True

        return {
            "risk_score": risk_score,
            "category": category,
            "confidence": round(max(ml_prob, 0.75), 2),
            "scam_type": scam_type,
            "detected_language": lang_code,
            "language_display": lang_display,
            "indicators": matched_indicators if matched_indicators else ["No suspicious indicators identified"],
            "feature_contributions": feature_contributions if feature_contributions else {"Baseline": 5.0},
            "recommendation": recommendation,
            "safe_to_proceed": safe_to_proceed
        }

message_analyzer = MessageAnalyzerService()
