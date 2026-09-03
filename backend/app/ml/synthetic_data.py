"""
UPI SHIELD - Synthetic Dataset Generator
Generates realistic, labeled datasets for:
1. Multilingual Scam Messages (English, Hindi, Kannada, Telugu, Tamil, Marathi)
2. Normal vs Anomalous UPI Transactions for Isolation Forest training
3. Fraud Ring / Mule Network Graph Data
All data is clearly marked as DEMO / SYNTHETIC DATA.
"""

import random
from typing import List, Dict, Any

# Multi-lingual scam templates with variable slots
SCAM_TEMPLATES = {
    "KYC_PHISHING": {
        "en": [
            "Dear customer, your {bank} account will be blocked today due to pending KYC. Update immediately at {url} or pay Re.1 verification fee to avoid suspension.",
            "Urgent: Your SBI Yono KYC is expired! Account will be deactivated in 24 hours. Click {url} to update Aadhaar/PAN now.",
            "Alert! Your Paytm wallet KYC is incomplete. Services suspended within 2 hours. Call customer care or send Rs.10 to {upi} to reactivate.",
            "Bank Alert: Dear user, update your KYC details immediately by clicking {url} or your UPI service will be permanently terminated.",
            "Notice: Your bank KYC has been put on hold. Pay ₹5 to verify bank account via {upi} to keep UPI active."
        ],
        "hi": [
            "प्रिय ग्राहक, आपका {bank} खाता आज बंद कर दिया जाएगा क्योंकि आपकी KYC अधूरी है। तुरंत {url} पर जाएं या खाता चालू रखने के लिए {upi} पर ₹10 सत्यापन शुल्क भेजें।",
            "चेतावनी! आपका बैंक खाता अगले 12 घंटों में ब्लॉक हो जाएगा। तत्काल पैन कार्ड अपडेट करने के लिए {url} पर क्लिक करें।",
            "अति आवश्यक सूचना: आपका YONO SBI खाता सस्पेंड हो गया है। इसे पुनः सक्रिय करने के लिए {url} पर KYC पूरा करें।"
        ],
        "kn": [
            "ಆತ್ಮೀಯ ಗ್ರಾಹಕರೇ, ನಿಮ್ಮ {bank} ಖಾತೆಯನ್ನು ಇಂದು ನಿರ್ಬಂಧಿಸಲಾಗುತ್ತದೆ. ದಯವಿಟ್ಟು ತಕ್ಷಣ KYC ಅಪ್‌ಡೇಟ್ ಮಾಡಲು {url} ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ {upi} ಗೆ ₹10 ಶುಲ್ಕ ಪಾವತಿಸಿ.",
            "ಎಚ್ಚರಿಕೆ! ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆ 24 ಗಂಟೆಗಳಲ್ಲಿ ಸ್ಥಗಿತಗೊಳ್ಳಲಿದೆ. ಕೂಡಲೇ ಆಧಾರ್ ಲಿಂಕ್ ಮಾಡಲು ಈ ಲಿಂಕ್ ಬಳಸಿ: {url}",
            "ತುರ್ತು ಸೂಚನೆ: ನಿಮ್ಮ UPI ಸೇವೆ ರದ್ದಾಗದಂತೆ ತಡೆಯಲು {upi} ಗೆ ₹5 ಪರಿಶೀಲನಾ ಮೊತ್ತ ಪಾವತಿಸಿ KYC ಮುಗಿಸಿ."
        ],
        "te": [
            "ప్రియమైన కస్టమర్, మీ {bank} ఖాతా ఈరోజు బ్లాక్ చేయబడుతుంది. వెంటనే మీ KYC అప్‌డేట్ చేయడానికి {url} లింక్ క్లిక్ చేయండి లేదా {upi} కి ₹10 చెల్లించండి.",
            "హెచ్చరిక! మీ బ్యాంక్ ఖాతా 12 గంటల్లో నిలిపివేయబడుతుంది. వెంటనే ఆధార్ వివరాలు సరిచూసుకోవడానికి {url} ని సందర్శించండి.",
            "అత్యవసరం: మీ UPI లావాదేవీలు ఆగిపోకుండా ఉండటానికి వెంటనే {upi} కి రూ.1 పంపి ధృవీకరించండి."
        ],
        "ta": [
            "அன்புள்ள வாடிக்கையாளரே, நிலுவையில் உள்ள KYC காரணமாக உங்கள் {bank} கணக்கு இன்று முடக்கப்படும். உடனே {url} வழியாக புதுப்பிக்கவும் அல்லது {upi} க்கு ₹10 செலுத்தவும்.",
            "எச்சரிக்கை! உங்கள் வங்கி கணக்கு அடுத்த 24 மணி நேரத்தில் ரத்து செய்யப்படும். உடனடியாக சரிபார்க்க {url} கிளிக் செய்யவும்."
        ],
        "mr": [
            "प्रिय ग्राहक, केवायसी (KYC) प्रलंबित असल्यामुळे तुमचे {bank} खाते आज ब्लॉक केले जाईल. ताबडतोब {url} वर अपडेट करा किंवा {upi} वर ₹10 पाठवून सक्रिय करा.",
            "तातडीची सूचना: तुमचे बँक खाते पुढील 24 तासांत बंद होईल. त्वरित पॅन कार्ड लिंक करण्यासाठी {url} वर क्लिक करा."
        ]
    },
    "ELECTRICITY_BILL": {
        "en": [
            "Dear consumer, your electricity power will be disconnected tonight at 9:30 PM because previous month bill was not updated. Please immediately contact our electricity officer at {phone} or pay via {upi}.",
            "Urgent: Electricity power disconnection notice! Bill unpaid. Contact electricity executive on {phone} or pay bill immediately at {url} to avoid black out.",
            "BESCOM / MSEDCL Alert: Bill Rs.1450 pending. Power cut scheduled today. Clear balance via UPI to {upi}."
        ],
        "hi": [
            "प्रिय उपभोक्ता, आपके बिजली बिल का भुगतान न होने के कारण आज रात 9:30 बजे बिजली काट दी जाएगी। तुरंत बिजली अधिकारी से {phone} पर संपर्क करें या {upi} पर बिल भरें।",
            "बिजली विभाग सूचना: आपका पिछला बिल अपडेट नहीं हुआ है। तुरंत {phone} पर कॉल करें या बिजली कटने से बचने के लिए {url} पर भुगतान करें।"
        ],
        "kn": [
            "ಆತ್ಮೀಯ ಗ್ರಾಹಕರೇ, ನಿಮ್ಮ ಹಿಂದಿನ ತಿಂಗಳ ವಿದ್ಯುತ್ ಬಿಲ್ ಪಾವತಿಯಾಗದ ಕಾರಣ ಇಂದು ರಾತ್ರಿ 9:30 ಕ್ಕೆ ವಿದ್ಯುತ್ ಕಡಿತಗೊಳಿಸಲಾಗುತ್ತದೆ. ತಕ್ಷಣ ನಮ್ಮ ಅಧಿಕಾರಿಗೆ {phone} ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ {upi} ಗೆ ಪಾವತಿಸಿ.",
            "ಬೆಸ್ಕಾಂ ತುರ್ತು ಎಚ್ಚರಿಕೆ: ವಿದ್ಯುತ್ ಬಿಲ್ ಬಾಕಿ ಇದೆ. ಪವರ್ ಕಟ್ ತಪ್ಪಿಸಲು ತಕ್ಷಣ ಈ ಲಿಂಕ್ ನಲ್ಲಿ ಪಾವತಿಸಿ: {url}"
        ],
        "te": [
            "ప్రియమైన వినియోగదారుడా, మీ విద్యుత్ బిల్లు చెల్లించనందున ఈ రాత్రి 9:30 గంటలకు విద్యుత్ సరఫరా నిలిపివేయబడుతుంది. వెంటనే అధికారిని {phone} లో సంప్రదించండి లేదా {upi} కి చెల్లించండి."
        ],
        "ta": [
            "மின்துறை அறிவிப்பு: உங்கள் மின் கட்டணம் செலுத்தப்படாததால் இன்று இரவு 9:30 மணிக்கு மின்சாரம் துண்டிக்கப்படும். உடனே {phone} எண்ணை அழைக்கவும் அல்லது {upi} வழியாக செலுத்தவும்."
        ],
        "mr": [
            "महावितरण सूचना: मागील महिन्याचे वीज बिल अपडेट न केल्यामुळे आज रात्री वीज पुरवठा खंडित केला जाईल. तात्काळ वीज अधिकाऱ्याशी {phone} वर संपर्क साधा."
        ]
    },
    "FAKE_REFUND": {
        "en": [
            "Congratulations! Your refund of Rs.4,850 for failed transaction is approved. To receive money into your bank, click link and enter your UPI PIN: {url}",
            "Dear user, you have received cash cashback of ₹2,999 on PhonePe/GooglePay. Scan this QR code and approve request with UPI PIN to claim money in your account.",
            "Amazon/Flipkart Order Cancelled: Refund of Rs.3,499 initiated. Accept request from {upi} and enter PIN to credit money into your bank."
        ],
        "hi": [
            "बधाई हो! आपका ₹4,850 का रिफंड स्वीकृत हो गया है। पैसे सीधे बैंक खाते में पाने के लिए इस लिंक पर क्लिक करें और अपना UPI PIN दर्ज करें: {url}",
            "Google Pay कैशबैक: आपको ₹2,500 का इनाम मिला है। पैसे प्राप्त करने के लिए QR कोड स्कैन करें और अपना UPI पिन डालें।"
        ],
        "kn": [
            "ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ₹4,850 ಮರುಪಾವತಿ (Refund) ಅನುಮೋದಿಸಲಾಗಿದೆ. ಹಣವನ್ನು ನಿಮ್ಮ ಖಾತೆಗೆ ಪಡೆಯಲು ಈ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ UPI PIN ನಮೂದಿಸಿ: {url}",
            "ಫೋನ್ ಪೇ ಕ್ಯಾಶ್ ಬ್ಯಾಕ್: ನಿಮಗೆ ₹3,000 ಬಹುಮಾನ ಬಂದಿದೆ. ಹಣ ಪಡೆಯಲು QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ PIN ಎಂಟರ್ ಮಾಡಿ."
        ],
        "te": [
            "అభినందనలు! మీ ₹4,850 రీఫండ్ మంజూరైంది. మీ బ్యాంక్ ఖాతాలో జమ కావడానికి ఈ లింక్ క్ಲಿక్ చేసి మీ UPI పిన్ ఎంటర్ చేయండి: {url}"
        ],
        "ta": [
            "வாழ்த்துகள்! உங்கள் ₹4,850 ரீஃபண்ட் அனுமதிக்கப்பட்டது. உங்கள் வங்கி கணக்கில் பெற லிங்கை கிளிக் செய்து UPI PIN ஐ உள்ளிடவும்: {url}"
        ],
        "mr": [
            "अभिनंदन! तुमचा ₹4,850 चा परतावा (Refund) मंजूर झाला आहे. पैसे खात्यात मिळवण्यासाठी लिंकवर क्लिक करून UPI PIN टाका: {url}"
        ]
    },
    "FAKE_CUSTOMER_CARE": {
        "en": [
            "Hi, this is official support from {bank}/GooglePay. For resolving your failed transaction of ₹12,000, please download AnyDesk/TeamViewer and send ₹1 to {upi}.",
            "Customer Support: We noticed unauthorized login on your account. To secure your account, share the 6-digit OTP sent to your phone or approve payment request on {upi}.",
            "BHIM UPI Customer Desk: Your pending transfer is stuck on NPCI server. Send Rs.100 test payment to {upi} to clear transaction."
        ],
        "hi": [
            "नमस्ते, हम बैंक ग्राहक सेवा से बोल रहे हैं। आपके फंसे हुए ₹10,000 ट्रांसफर को क्लियर करने के लिए कृपया अपने फोन पर AnyDesk ऐप डाउनलोड करें और हमें कोड बताएं।",
            "बैंक सुरक्षा अलर्ट: आपके खाते से संदिग्ध लेनदेन देखा गया है। खाता सुरक्षित करने के लिए अभी आया हुआ OTP बताएं।"
        ],
        "kn": [
            "ಗ್ರಾಹಕ ಸೇವೆ: ನಿಮ್ಮ ಸ್ಥಗಿತಗೊಂಡ ₹10,000 ಹಣವನ್ನು ವಾಪಸ್ ಪಡೆಯಲು ತಕ್ಷಣ AnyDesk ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು {upi} ಗೆ ₹1 ಕಳುಹಿಸಿ.",
            "ಬ್ಯಾಂಕ್ ಬೆಂಬಲ ಕೇಂದ್ರ: ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ಅನುಮಾನಾಸ್ಪದ ಚಟುವಟಿಕೆ ಕಂಡುಬಂದಿದೆ. ಖಾತೆ ರಕ್ಷಿಸಲು OTP ಹಂಚಿಕೊಳ್ಳಿ."
        ],
        "te": [
            "కస్టమర్ కేర్: మీ బ్యాంక్ లావాదేవీ సమస్యను పరిష్కరించడానికి వెంటనే AnyDesk డౌన్‌లోడ్ చేసుకోండి మరియు {upi} కి ₹5 పంపండి."
        ],
        "ta": [
            "வங்கி உதவி மையம்: உங்கள் சிக்கலை தீர்க்க உடனே AnyDesk செயலியை பதிவிறக்கம் செய்து {upi} க்கு ₹1 அனுப்பவும்."
        ],
        "mr": [
            "ग्राहक सेवा: तुमचा अडकलेला व्यवहार क्लिअर करण्यासाठी AnyDesk ॲप डाउनलोड करा आणि {upi} वर ₹1 पाठवा."
        ]
    },
    "INVESTMENT_LOTTERY": {
        "en": [
            "Work from home opportunity! Earn ₹3,000 to ₹10,000 daily by liking YouTube videos and rating hotels on Telegram. Invest just ₹500 to {upi} and get ₹2,500 guaranteed profit.",
            "KBC Jio Lucky Winner! You won Rs.25,00,000 lottery in lucky draw. To claim prize money, deposit GST fee of ₹12,500 to SBI account via {upi}.",
            "Cryptocurrency trading bot: 300% guaranteed return in 24 hours. Send minimum ₹2,000 to {upi} to start receiving daily dividends."
        ],
        "hi": [
            "घर बैठे पैसे कमाएं! यूट्यूब वीडियो लाइक करके रोजाना ₹5,000 कमाएं। शुरुआत के लिए सिर्फ ₹500 जमा करें और ₹2,000 पाएं। {upi} पर भेजें।",
            "केबीसी लॉटरी विजेता! आपने ₹25 लाख जीते हैं। अपनी राशि पाने के लिए सरकारी टैक्स ₹10,000 तुरंत {upi} पर ट्रांसफर करें।"
        ],
        "kn": [
            "ಮನೆಯಲ್ಲೇ ಕುಳಿತು ದಿನಕ್ಕೆ ₹3,000 ಸಂಪಾದಿಸಿ! ಯೂಟ್ಯೂಬ್ ಲೈಕ್ ಟಾಸ್ಕ್. ಕೇವಲ ₹500 {upi} ಗೆ ಹೂಡಿಕೆ ಮಾಡಿ ₹2,500 ಲಾಭ ಪಡೆಯಿರಿ.",
            "ಲಕ್ಕಿ ಡ್ರಾ ವಿಜೇತರು: ನೀವು ₹25 ಲಕ್ಷ ಬಹುಮಾನ ಗೆದ್ದಿದ್ದೀರಿ! ಜಿಎಸ್‌ಟಿ ಶುಲ್ಕ ₹5,000 ಅನ್ನು ತಕ್ಷಣ {upi} ಗೆ ಪಾವತಿಸಿ ಬಹುಮಾನ ಪಡೆಯಿರಿ."
        ],
        "te": [
            "వర్క్ ఫ్రమ్ హోమ్ ద్వారా రోజూ ₹3,000 సంపాదించండి. కేవలం ₹500 డిపాజిట్ చేసి ₹2,000 పొందండి. {upi} కి పంపండి."
        ],
        "ta": [
            "வீட்டிலிருந்தே தினமும் ₹3,000 சம்பாதிக்கலாம்! ₹500 மட்டும் முதலீடு செய்து ₹2,500 லாபம் பெறுங்கள்: {upi}"
        ],
        "mr": [
            "घरबसल्या दररोज ₹3,000 कमवा! फक्त ₹500 गुंतवून ₹2,500 नफा मिळवा. {upi} वर त्वरित पाठवा."
        ]
    },
    "POLICE_LEGAL": {
        "en": [
            "Cyber Crime Police HQ: An arrest warrant has been issued against you for money laundering and illegal parcel. Transfer bail bond fee ₹25,000 to government verified nodal account {upi} within 30 minutes to avoid arrest.",
            "Delhi Police Notice: Your phone number and Aadhaar are linked to cyber fraud. Contact CBI Officer on WhatsApp or pay verification fee to {upi} immediately."
        ],
        "hi": [
            "साइबर क्राइम पुलिस मुख्यालय: आपके नाम पर गैरकानूनी पार्सल और मनी लॉन्ड्रिंग का मामला दर्ज है। गिरफ्तारी से बचने के लिए जमानत राशि ₹25,000 तुरंत {upi} पर जमा करें।",
            "सीबीआई सूचना: आपके आधार का दुरुपयोग हुआ है। तुरंत मामले के निपटारे के लिए अधिकारी से संपर्क करें।"
        ],
        "kn": [
            "ಸೈಬರ್ ಕ್ರೈಮ್ ಪೊಲೀಸ್ ಪ್ರಧಾನ ಕಚೇರಿ: ಅಕ್ರಮ ಪಾರ್ಸೆಲ್ ಮತ್ತು ಮನಿ ಲಾಂಡರಿಂಗ್ ಪ್ರಕರಣದಲ್ಲಿ ನಿಮ್ಮ ವಿರುದ್ಧ ವಾರಂಟ್ ಹೊರಡಿಸಲಾಗಿದೆ. ತಕ್ಷಣ ₹20,000 ಠೇವಣಿಯನ್ನು {upi} ಗೆ ಪಾವತಿಸಿ."
        ],
        "te": [
            "సైబర్ క్రైమ్ విభాగం: మీ పేరు మీద అరెస్ట్ వారెంట్ జారీ చేయబడింది. అరెస్టు కాకుండా ఉండటానికి వెంటనే ₹20,000 {upi} కి బదిలీ చేయండి."
        ],
        "ta": [
            "சைபர் கிரைம் காவல்துறை: உங்களுக்கு எதிராக பிடிவாரண்ட் பிறப்பிக்கப்பட்டுள்ளது. கைதை தவிர்க்க உடனடியாக ₹20,000 ஐ {upi} க்கு செலுத்தவும்."
        ],
        "mr": [
            "सायबर गुन्हे शाखा: तुमच्या नावावर मनी लाँडरिंगचा गुन्हा दाखल आहे. अटक टाळण्यासाठी तातडीने ₹20,000 सरकारी खात्यावर {upi} जमा करा."
        ]
    }
}

NORMAL_MESSAGES = [
    "Your SBI A/C ending 4821 is credited by INR 1,500.00 on 03-Sep-26 by UPI/P2A/Ref 6245108492. Balance: INR 24,180.50.",
    "HDFC Bank: Rs.450.00 debited from a/c **9124 on 02-Sep-26 towards Swiggy Order 8921. Avl bal: Rs 18,290.00.",
    "ICICI Bank OTP: 489123 is your one-time password for authentication at merchant portal. Do not share OTP with anyone.",
    "Your monthly electricity bill of Rs 820 is due on 15-Sep. Pay using your authorized bank app or visit official portal bescom.karnataka.gov.in.",
    "Airtel recharge of Rs 299 successful for mobile 9845012345. Unlimited calls + 1.5GB/day valid for 28 days.",
    "Axis Bank: Sent Rs.120 to Chai Point via UPI ref 4920194819. Clear balance Rs 8,300.",
    "PhonePe: Paid ₹65.00 to Nandini Milk Parlour. UPI Transaction ID T240903112233.",
    "Google Pay: ₹200.00 sent to Rajesh Kumar for dinner split. Transaction successful.",
    "Dear customer, thank you for shopping at D-Mart. Your bill amount is Rs 1,480. Points earned: 28.",
    "Uber Trip Receipt: Total ₹340.00 charged to your UPI account for trip to Indiranagar.",
    "Zomato delivery partner Mohan is on the way with your order. Track on app.",
    "Netflix: Your monthly subscription of ₹649 was successfully auto-debited from your registered account."
]

BANKS = ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Punjab National Bank", "Kotak Mahindra Bank", "Bank of Baroda"]
SUSPICIOUS_DOMAINS = [
    "http://sbi-kyc-verification.top/update",
    "http://yono-secure-login.xyz/kyc",
    "http://paytm-kyc-support.click/verify",
    "http://192.168.1.105:8080/bank-help",
    "http://hdfc-reward-point.info/redeem",
    "http://police-nodal-verification.co/settle",
    "http://free-cashback-gpay.online/claim",
    "http://electricity-bill-clearance.cc/pay"
]
SUSPICIOUS_UPIS = [
    "sbi.helpline.nodal@ybl",
    "hdfc.kyc.verification@oksbi",
    "electricity.bill.desk99@paytm",
    "refund.desk.officer@okaxis",
    "cbi.cyber.fine.settlement@axl",
    "telegram.earn.money77@ybl",
    "lucky.winner.kbc2026@icici",
    "paytm.refund.support88@paytm"
]
PHONES = ["+91 9876543210", "+91 8765432109", "+91 7654321098", "+91 9123456780"]

def generate_synthetic_messages(count: int = 600) -> List[Dict[str, Any]]:
    """Generates synthetic message dataset with ground truth labels."""
    dataset = []
    
    # 1. Generate scam messages
    scam_count = count // 2
    for _ in range(scam_count):
        category = random.choice(list(SCAM_TEMPLATES.keys()))
        lang = random.choice(list(SCAM_TEMPLATES[category].keys()))
        template = random.choice(SCAM_TEMPLATES[category][lang])
        
        msg = template.format(
            bank=random.choice(BANKS),
            url=random.choice(SUSPICIOUS_DOMAINS),
            upi=random.choice(SUSPICIOUS_UPIS),
            phone=random.choice(PHONES)
        )
        
        dataset.append({
            "message": msg,
            "language": lang,
            "scam_type": category,
            "is_scam": 1,
            "contains_url": int("http" in msg),
            "contains_payment_request": int("pay" in msg.lower() or "शुल्क" in msg or "ಪಾವತಿಸಿ" in msg or "చెల్లించండి" in msg or "செலுத்தவும்" in msg or "पाठवून" in msg or "₹" in msg or "rs." in msg.lower()),
            "contains_urgency": int("immediately" in msg.lower() or "today" in msg.lower() or "urgent" in msg.lower() or "तुरंत" in msg or "ತಕ್ಷಣ" in msg or "వెంటనే" in msg or "உடனே" in msg or "तातडीने" in msg),
            "contains_credential_request": int("pin" in msg.lower() or "otp" in msg.lower() or "पिन" in msg or "password" in msg.lower()),
            "contains_impersonation": int("sbi" in msg.lower() or "bank" in msg.lower() or "police" in msg.lower() or "bescom" in msg.lower() or "cbi" in msg.lower())
        })
        
    # 2. Generate normal messages
    normal_count = count - scam_count
    for i in range(normal_count):
        template = random.choice(NORMAL_MESSAGES)
        # Small variations
        msg = template.replace("INR 1,500.00", f"INR {random.randint(50, 2500)}.00").replace("4821", str(random.randint(1000, 9999)))
        dataset.append({
            "message": msg,
            "language": "en",
            "scam_type": "LEGITIMATE_TRANSACTION",
            "is_scam": 0,
            "contains_url": 0,
            "contains_payment_request": 0,
            "contains_urgency": 0,
            "contains_credential_request": 0,
            "contains_impersonation": 0
        })
        
    random.shuffle(dataset)
    return dataset

def generate_synthetic_transactions(count: int = 5000) -> List[Dict[str, Any]]:
    """Generates synthetic transaction logs for Isolation Forest anomaly detection."""
    data = []
    
    # 90% normal transactions
    normal_count = int(count * 0.90)
    for i in range(normal_count):
        # Normal profile: avg Rs 450, daytime 8am to 10pm, known recipient, local location
        amount = float(random.choice([
            random.randint(30, 800),
            random.randint(100, 1500),
            random.randint(500, 3000)
        ]))
        hour = random.choice([random.randint(8, 22), random.randint(9, 21), random.randint(10, 20)])
        is_new = 0 if random.random() > 0.15 else 1
        location_change = 0 if random.random() > 0.08 else 1
        device_change = 0 if random.random() > 0.05 else 1
        freq = random.randint(1, 5)
        
        data.append({
            "amount": amount,
            "hour": hour,
            "is_new_recipient": is_new,
            "location_change": location_change,
            "device_change": device_change,
            "frequency_today": freq,
            "is_anomaly": 0
        })
        
    # 10% anomalous transactions
    anomaly_count = count - normal_count
    for i in range(anomaly_count):
        # Anomalous: High amount (Rs 20,000 - 95,000), odd hours (1 AM - 4 AM), new recipient, location change
        amount = float(random.randint(25000, 95000))
        hour = random.choice([1, 2, 3, 4, 5, 23])
        is_new = 1
        location_change = 1 if random.random() > 0.3 else 0
        device_change = 1 if random.random() > 0.4 else 0
        freq = random.randint(6, 20)
        
        data.append({
            "amount": amount,
            "hour": hour,
            "is_new_recipient": is_new,
            "location_change": location_change,
            "device_change": device_change,
            "frequency_today": freq,
            "is_anomaly": 1
        })
        
    random.shuffle(data)
    return data

def generate_fraud_graph_data() -> Dict[str, Any]:
    """Generates a synthetic multi-entity fraud ring network."""
    nodes = [
        # Suspicious Cluster 1: KYC Phishing Syndicate
        {"id": "USER_MULE_1", "label": "Ramesh Kumar (Mule)", "type": "USER", "risk_score": 88, "risk_category": "CRITICAL", "report_count": 9},
        {"id": "UPI_SCAM_1", "label": "sbi.kyc.update@oksbi", "type": "UPI", "risk_score": 94, "risk_category": "CRITICAL", "report_count": 16},
        {"id": "BANK_ACC_1", "label": "SBI A/C ...9842 (Mule A)", "type": "ACCOUNT", "risk_score": 92, "risk_category": "CRITICAL", "report_count": 14},
        {"id": "PHONE_1", "label": "+91 98765 43210 (Spoofed)", "type": "PHONE", "risk_score": 85, "risk_category": "HIGH", "report_count": 8},
        {"id": "UPI_SCAM_2", "label": "quick.refund.desk@ybl", "type": "UPI", "risk_score": 91, "risk_category": "CRITICAL", "report_count": 12},
        {"id": "BANK_ACC_2", "label": "HDFC A/C ...1102 (Cashout)", "type": "ACCOUNT", "risk_score": 96, "risk_category": "CRITICAL", "report_count": 22},
        
        # Victims connecting to Syndicate
        {"id": "USER_VICTIM_1", "label": "Aarav Sharma (Victim)", "type": "USER", "risk_score": 15, "risk_category": "LOW", "report_count": 0},
        {"id": "USER_VICTIM_2", "label": "Pooja Patel (Victim)", "type": "USER", "risk_score": 18, "risk_category": "LOW", "report_count": 0},
        {"id": "USER_VICTIM_3", "label": "Kiran Hegde (Victim)", "type": "USER", "risk_score": 22, "risk_category": "LOW", "report_count": 0},

        # Suspicious Cluster 2: Electricity Bill Scam Ring
        {"id": "UPI_SCAM_3", "label": "bescom.nodal.officer@paytm", "type": "UPI", "risk_score": 89, "risk_category": "CRITICAL", "report_count": 11},
        {"id": "PHONE_2", "label": "+91 87654 32109 (Fake Officer)", "type": "PHONE", "risk_score": 87, "risk_category": "HIGH", "report_count": 7},
        {"id": "BANK_ACC_3", "label": "Axis A/C ...4450", "type": "ACCOUNT", "risk_score": 84, "risk_category": "HIGH", "report_count": 6},
        {"id": "USER_MULE_2", "label": "Sunil Verma (Aggregator)", "type": "USER", "risk_score": 82, "risk_category": "HIGH", "report_count": 5},

        # Legitimate Network (Baseline Comparison)
        {"id": "USER_CLEAN_1", "label": "Vikram Rao (Verified)", "type": "USER", "risk_score": 5, "risk_category": "LOW", "report_count": 0},
        {"id": "UPI_CLEAN_1", "label": "vikram@okhdfcbank", "type": "UPI", "risk_score": 8, "risk_category": "LOW", "report_count": 0},
        {"id": "UPI_MERCHANT_1", "label": "swiggy@icici (Verified Merchant)", "type": "UPI", "risk_score": 2, "risk_category": "LOW", "report_count": 0},
        {"id": "UPI_MERCHANT_2", "label": "dmart.retail@hdfcbank", "type": "UPI", "risk_score": 2, "risk_category": "LOW", "report_count": 0}
    ]

    edges = [
        # Syndicate 1 flow: Victims -> Phishing UPI -> Mule Account -> Master Cashout
        {"source": "USER_VICTIM_1", "target": "UPI_SCAM_1", "relation": "TRANSFERS_TO (₹15,000)", "risk_weight": 0.9},
        {"source": "USER_VICTIM_2", "target": "UPI_SCAM_1", "relation": "TRANSFERS_TO (₹25,000)", "risk_weight": 0.95},
        {"source": "USER_VICTIM_3", "target": "UPI_SCAM_2", "relation": "TRANSFERS_TO (₹4,850)", "risk_weight": 0.85},
        {"source": "UPI_SCAM_1", "target": "BANK_ACC_1", "relation": "DEPOSITS_INTO", "risk_weight": 0.95},
        {"source": "PHONE_1", "target": "UPI_SCAM_1", "relation": "REGISTERED_PHONE", "risk_weight": 0.9},
        {"source": "BANK_ACC_1", "target": "USER_MULE_1", "relation": "BENEFICIARY", "risk_weight": 0.92},
        {"source": "USER_MULE_1", "target": "BANK_ACC_2", "relation": "RAPID_DRAIN (₹40,000)", "risk_weight": 0.98},
        {"source": "UPI_SCAM_2", "target": "BANK_ACC_2", "relation": "LAYERED_TRANSFER", "risk_weight": 0.88},

        # Syndicate 2 flow
        {"source": "PHONE_2", "target": "UPI_SCAM_3", "relation": "WHATSAPP_SOLICITATION", "risk_weight": 0.85},
        {"source": "UPI_SCAM_3", "target": "BANK_ACC_3", "relation": "SETTLEMENT", "risk_weight": 0.88},
        {"source": "BANK_ACC_3", "target": "USER_MULE_2", "relation": "ACCOUNT_HOLDER", "risk_weight": 0.82},
        {"source": "USER_MULE_2", "target": "BANK_ACC_2", "relation": "CROSS_RING_TRANSFER", "risk_weight": 0.91},

        # Clean transactions
        {"source": "USER_CLEAN_1", "target": "UPI_CLEAN_1", "relation": "PRIMARY_VPA", "risk_weight": 0.05},
        {"source": "USER_CLEAN_1", "target": "UPI_MERCHANT_1", "relation": "FOOD_PURCHASE (₹340)", "risk_weight": 0.02},
        {"source": "USER_CLEAN_1", "target": "UPI_MERCHANT_2", "relation": "GROCERY (₹1,200)", "risk_weight": 0.02}
    ]

    return {"nodes": nodes, "edges": edges}
