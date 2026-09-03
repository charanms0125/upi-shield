import re
import math
from urllib.parse import urlparse
from typing import Dict, Any, List

KNOWN_BRANDS = [
    ("sbi", ["sbi.co.in", "onlinesbi.sbi", "sbiyono.sbi"]),
    ("yono", ["onlinesbi.sbi", "sbiyono.sbi"]),
    ("hdfc", ["hdfcbank.com"]),
    ("icici", ["icicibank.com"]),
    ("axis", ["axisbank.com"]),
    ("paytm", ["paytm.com"]),
    ("phonepe", ["phonepe.com"]),
    ("googlepay", ["pay.google.com", "google.com"]),
    ("gpay", ["pay.google.com", "google.com"]),
    ("bhim", ["bhimupi.org.in", "npci.org.in"]),
    ("bescom", ["bescom.karnataka.gov.in"]),
    ("amazon", ["amazon.in", "amazon.com"]),
    ("flipkart", ["flipkart.com"])
]

SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".click", ".link", ".online", ".site", ".cc", ".tk", ".cf",
    ".gq", ".ml", ".info", ".bid", ".vip", ".club", ".icu", ".work", ".buzz"
}

SUSPICIOUS_PATH_KEYWORDS = [
    "kyc", "verify", "update", "login", "bank", "pin", "otp", "claim",
    "reward", "refund", "cashback", "lottery", "security", "free", "gift"
]

def calculate_entropy(text: str) -> float:
    """Calculates Shannon entropy of domain string to detect generated/random domains."""
    if not text:
        return 0.0
    prob = [float(text.count(c)) / len(text) for c in dict.fromkeys(list(text))]
    entropy = -sum([p * math.log(p) / math.log(2.0) for p in prob])
    return entropy

class URLAnalyzerService:
    def analyze(self, url: str) -> Dict[str, Any]:
        normalized = url.strip()
        if not normalized.startswith("http://") and not normalized.startswith("https://"):
            normalized = "http://" + normalized

        try:
            parsed = urlparse(normalized)
            domain = parsed.netloc.lower()
            path = parsed.path.lower()
        except Exception:
            domain = normalized
            path = ""

        warnings: List[str] = []
        feature_contributions: Dict[str, float] = {}
        risk_score = 10.0  # baseline

        # 1. Check if IP address host
        is_ip = bool(re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$", domain))
        if is_ip:
            warnings.append("⚠️ IP-based URL detected (legitimate financial portals always use domain names)")
            feature_contributions["IP-Host"] = 30.0
            risk_score += 30.0

        # 2. Check HTTPS
        is_https = normalized.startswith("https://")
        if not is_https:
            warnings.append("⚠️ Insecure connection (Missing HTTPS/SSL)")
            feature_contributions["Missing HTTPS"] = 20.0
            risk_score += 20.0

        # 3. Suspicious TLD
        found_tld = None
        for tld in SUSPICIOUS_TLDS:
            if domain.endswith(tld):
                found_tld = tld
                warnings.append(f"⚠️ High-risk TLD detected ({tld}) commonly leveraged in phishing campaigns")
                feature_contributions[f"Suspicious TLD ({tld})"] = 25.0
                risk_score += 25.0
                break

        # 4. Brand Impersonation check
        impersonated_brand = None
        for brand, legitimate_domains in KNOWN_BRANDS:
            if brand in domain:
                # Check if it is actually the legitimate domain
                is_legit = any(domain == legit or domain.endswith("." + legit) for legit in legitimate_domains)
                if not is_legit:
                    impersonated_brand = brand.upper()
                    warnings.append(f"⚠️ Possible brand impersonation detected for '{brand.upper()}' on unofficial domain")
                    feature_contributions["Brand Impersonation"] = 35.0
                    risk_score += 35.0
                    break

        # 5. Suspicious keywords in URL path or subdomain
        matched_keywords = [kw for kw in SUSPICIOUS_PATH_KEYWORDS if kw in domain or kw in path]
        if matched_keywords:
            warnings.append(f"⚠️ Phishing / credential harvesting keywords found in URL: {', '.join(matched_keywords)}")
            weight = min(len(matched_keywords) * 8.0, 24.0)
            feature_contributions["Lure Keywords"] = weight
            risk_score += weight

        # 6. Domain Entropy / Randomness
        entropy = calculate_entropy(domain)
        if entropy > 3.8 and len(domain) > 15:
            warnings.append("⚠️ High domain entropy / random character pattern detected")
            feature_contributions["High Entropy"] = 12.0
            risk_score += 12.0

        # 7. URL Length
        if len(normalized) > 75:
            warnings.append("⚠️ Abnormally long URL often used to obscure true destination")
            feature_contributions["Abnormal URL Length"] = 10.0
            risk_score += 10.0

        # Cap score between 0 and 100
        risk_score = round(min(max(risk_score, 5.0), 99.0), 1)

        # Category
        if risk_score >= 80:
            category = "CRITICAL"
            recommendation = "Do NOT visit this link or input bank/card credentials. This page exhibits strong phishing characteristics."
        elif risk_score >= 60:
            category = "HIGH"
            recommendation = "Potentially dangerous domain. Do not submit OTP, UPI PIN, or passwords."
        elif risk_score >= 30:
            category = "SUSPICIOUS"
            recommendation = "Verify the exact URL domain against the organization's official website."
        else:
            category = "LOW"
            recommendation = "No prominent phishing or impersonation indicators found on this domain."

        return {
            "url": url,
            "domain": domain,
            "is_https": is_https,
            "risk_score": risk_score,
            "category": category,
            "confidence": 0.90 if warnings else 0.80,
            "warnings": warnings if warnings else ["No heuristic phishing triggers detected."],
            "brand_impersonation": impersonated_brand,
            "feature_contributions": feature_contributions if feature_contributions else {"Standard Domain Heuristics": 5.0},
            "recommendation": recommendation
        }

url_analyzer = URLAnalyzerService()
