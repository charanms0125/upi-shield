import {
  MessageAnalysisResponse, URLAnalysisResponse, UPIAnalysisResponse,
  QRAnalysisResponse, TransactionAnalysisResponse, UnifiedRiskResponse,
  FraudNetworkData, Alert, AdminStats, ModelPerformance, FraudIncidentSummary,
  RiskCategory
} from '../types';

// Multi-language Script Detection
export function detectLanguage(text: string): { code: string; display: string } {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x0C80 && code <= 0x0CFF) return { code: 'kn', display: 'Kannada 🇮🇳' };
    if (code >= 0x0C00 && code <= 0x0C7F) return { code: 'te', display: 'Telugu 🇮🇳' };
    if (code >= 0x0B80 && code <= 0x0BFF) return { code: 'ta', display: 'Tamil 🇮🇳' };
    if (code >= 0x0900 && code <= 0x097F) {
      if (text.includes('आहे') || text.includes('करा') || text.includes('झाले') || text.includes('खाते')) {
        return { code: 'mr', display: 'Marathi 🇮🇳' };
      }
      return { code: 'hi', display: 'Hindi 🇮🇳' };
    }
  }
  return { code: 'en', display: 'English 🇬🇧' };
}

const INDICATORS_DEF: Array<{
  name: string;
  weight: number;
  patterns: RegExp[];
}> = [
  {
    name: 'Urgency language',
    weight: 22.0,
    patterns: [
      /urgently?/i, /immediately/i, /today/i, /within\s+\d+\s*(hours?|hrs?|minutes?|mins?)/i,
      /24\s*hours?/i, /blocked\s+today/i, /expire[ds]?/i, /deactivate[ds]?/i,
      /तुरंत/i, /तत्काल/i, /आज\s*ही/i, /तातडीने/i, /ತಕ್ಷಣ/i, /ಕೂಡಲೇ/i, /ಇಂದೇ/i,
      /వెంటనే/i, /ఈరోజే/i, /உடனடியாக/i, /இன்றே/i
    ]
  },
  {
    name: 'Threat/Fear language',
    weight: 24.0,
    patterns: [
      /blocked/i, /suspended/i, /terminated/i, /arrest/i, /police/i, /warrant/i,
      /power\s+cut/i, /disconnected/i, /black\s*out/i, /de-activated/i,
      /बंद\s*कर/i, /सस्पेंड/i, /गिरफ्तारी/i, /कारवाई/i, /ಸ್ಥಗಿತ/i, /ರದ್ದು/i,
      /నిలిపివే/i, /అరెస్ట్/i, /முடக்கப்படும்/i, /கைது/i
    ]
  },
  {
    name: 'Payment request',
    weight: 26.0,
    patterns: [
      /\bpay\b/i, /send\s+(rs\.?|inr|₹)/i, /transfer/i, /deposit/i, /re\.?\s*1/i,
      /verification\s+fee/i, /gst\s+fee/i, /clear\s+balance/i, /bail\s+bond/i,
      /शुल्क/i, /पैसे\s*भेजें/i, /भुगतान/i, /ಪಾವತಿಸಿ/i, /ಹಣ\s*ಕಳುಹಿಸಿ/i,
      /చెల్లించండి/i, /డబ్బు\s*పంపండి/i, /செலுத்தவும்/i, /பணம்\s*அனுப்பவும்/i
    ]
  },
  {
    name: 'Credential / PIN request',
    weight: 28.0,
    patterns: [
      /upi\s*pin/i, /\bpin\b/i, /\botp\b/i, /one\s*time\s*password/i, /password/i,
      /cvv/i, /card\s*number/i, /enter\s*pin\s*to\s*receive/i,
      /पिन/i, /ओटीपी/i, /ಪಾಸ್‌ವರ್ಡ್/i, /పిన్/i, /ரகசிய\s*எண்/i
    ]
  },
  {
    name: 'Organization Impersonation',
    weight: 18.0,
    patterns: [
      /\bsbi\b/i, /yono/i, /hdfc/i, /icici/i, /axis\s*bank/i, /paytm/i, /phonepe/i,
      /google\s*pay/i, /gpay/i, /bhim/i, /bescom/i, /msedcl/i, /cbi/i,
      /cyber\s*crime/i, /delhi\s*police/i, /npci/i, /rbi/i
    ]
  },
  {
    name: 'Suspicious Link / Portal',
    weight: 19.0,
    patterns: [
      /https?:\/\/[^\s]+/i, /bit\.ly/i, /tinyurl/i, /\.xyz/i, /\.top/i, /\.click/i,
      /\.online/i, /\.cc/i, /\.site/i, /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/
    ]
  },
  {
    name: 'KYC / Verification Hook',
    weight: 20.0,
    patterns: [
      /\bkyc\b/i, /aadhaar/i, /pan\s*card/i, /verify\s+your\s+account/i,
      /update\s+kyc/i, /केवायसी/i, /आधार/i, /ಪರಿಶೀಲನೆ/i, /ధృవీకరణ/i, /சரிபார்ப்பு/i
    ]
  },
  {
    name: 'Refund / Lottery Lure',
    weight: 21.0,
    patterns: [
      /refund/i, /cashback/i, /lottery/i, /\bwon\b/i, /lucky\s*draw/i, /winner/i,
      /claim\s*prize/i, /earn\s*money/i, /work\s*from\s*home/i,
      /रिफंड/i, /इनाम/i, /ಲಾಟರಿ/i, /ಬಹುಮಾನ/i, /రీఫండ్/i, /பரிசு/i, /परतावा/i
    ]
  },
  {
    name: 'Remote Access Tool Solicitation',
    weight: 30.0,
    patterns: [
      /anydesk/i, /teamviewer/i, /quicksupport/i, /rustdesk/i, /screen\s*share/i
    ]
  }
];

export const clientAI = {
  analyzeMessage: (message: string, languageHint?: string): MessageAnalysisResponse => {
    const langInfo = languageHint ? { code: languageHint, display: languageHint.toUpperCase() } : detectLanguage(message);
    const matchedIndicators: string[] = [];
    const featureContributions: Record<string, number> = {};
    let totalScore = 5.0;

    for (const indicator of INDICATORS_DEF) {
      const isMatched = indicator.patterns.some(pattern => pattern.test(message));
      if (isMatched) {
        matchedIndicators.push(indicator.name);
        featureContributions[indicator.name] = indicator.weight;
        totalScore += indicator.weight;
      }
    }

    // Check for legitimate credit message
    if (/credited\s+by/i.test(message) && /balance/i.test(message) && matchedIndicators.length <= 1) {
      totalScore = 6.0;
      matchedIndicators.length = 0;
      featureContributions['Normal Transaction Credit'] = 6.0;
    }

    const finalScore = Math.min(Math.max(Math.round(totalScore * 10) / 10, 5.0), 98.5);

    let category: RiskCategory = 'LOW';
    let scamType = 'LEGITIMATE / LOW RISK';
    let recommendation = 'No immediate scam signals detected. Standard precautions apply.';
    let safeToProceed = true;

    if (finalScore >= 80) {
      category = 'CRITICAL';
      safeToProceed = false;
      if (matchedIndicators.includes('KYC / Verification Hook')) scamType = 'KYC PHISHING';
      else if (matchedIndicators.includes('Threat/Fear language')) scamType = 'EXTORTION / SERVICE DISCONNECTION';
      else if (matchedIndicators.includes('Refund / Lottery Lure')) scamType = 'FAKE CASHBACK / REWARD FRAUD';
      else if (matchedIndicators.includes('Credential / PIN request')) scamType = 'CREDENTIAL THEFT';
      else scamType = 'SOCIAL ENGINEERING ATTACK';

      recommendation = 'Do NOT click any links, enter your UPI PIN, or transfer any money. Official banks or government agencies never demand immediate payments or ask for PIN/OTP to verify accounts.';
    } else if (finalScore >= 60) {
      category = 'HIGH';
      safeToProceed = false;
      scamType = 'SUSPICIOUS SOCIAL ENGINEERING';
      recommendation = 'Potentially deceptive communication. Contact the official customer care directly from their verified website before taking any action.';
    } else if (finalScore >= 30) {
      category = 'SUSPICIOUS';
      safeToProceed = false;
      scamType = 'UNVERIFIED COMMUNICATION';
      recommendation = 'Exercise caution. Verify sender credentials before following instructions.';
    }

    return {
      risk_score: finalScore,
      category,
      confidence: matchedIndicators.length > 0 ? 0.94 : 0.88,
      scam_type: scamType,
      detected_language: langInfo.code,
      language_display: langInfo.display,
      indicators: matchedIndicators.length > 0 ? matchedIndicators : ['No social engineering triggers found'],
      feature_contributions: Object.keys(featureContributions).length > 0 ? featureContributions : { 'Baseline Neutral': 5.0 },
      recommendation,
      safe_to_proceed: safeToProceed
    };
  },

  analyzeURL: (rawUrl: string): URLAnalysisResponse => {
    let domain = rawUrl;
    let isHttps = false;
    try {
      const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      domain = parsed.hostname;
      isHttps = parsed.protocol === 'https:';
    } catch {
      domain = rawUrl.replace(/^https?:\/\//, '').split('/')[0];
    }

    const warnings: string[] = [];
    const featureContributions: Record<string, number> = {};
    let score = 10.0;

    // Check trusted authentic domains
    const trustedDomains = ['onlinesbi.sbi', 'paytm.com', 'google.com', 'phonepe.com', 'npci.org.in'];
    if (trustedDomains.some(d => domain.endsWith(d))) {
      return {
        url: rawUrl,
        domain,
        is_https: true,
        risk_score: 5.0,
        category: 'LOW',
        confidence: 0.98,
        warnings: ['Verified authentic domain registrar'],
        feature_contributions: { 'Verified Official Domain': -40.0 },
        recommendation: 'Domain belongs to an authentic banking or payment organization.'
      };
    }

    // Heuristics
    if (/\.(top|xyz|click|online|cc|site|live|pw|buzz)$/i.test(domain)) {
      warnings.push(`High-risk top-level domain (.${domain.split('.').pop()}) frequently abused in phishing`);
      featureContributions['Suspicious TLD'] = 30.0;
      score += 30.0;
    }

    if (/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(domain)) {
      warnings.push('URL points directly to raw IP address instead of registered domain name');
      featureContributions['Raw IP Host'] = 35.0;
      score += 35.0;
    }

    if (/(sbi|yono|hdfc|icici|axis|paytm|phonepe|gpay|bescom|msedcl)/i.test(domain)) {
      warnings.push('Domain contains brand keywords commonly used in typosquatting');
      featureContributions['Brand Impersonation'] = 28.0;
      score += 28.0;
    }

    if (/(kyc|verification|login|update|secure|claim|reward|cashback)/i.test(rawUrl)) {
      warnings.push('URL path contains deceptive phishing keywords');
      featureContributions['Deceptive Path Keywords'] = 22.0;
      score += 22.0;
    }

    if ((domain.match(/-/g) || []).length >= 2) {
      warnings.push('Excessive hyphens in domain name (typosquatting indicator)');
      featureContributions['Excessive Hyphens'] = 15.0;
      score += 15.0;
    }

    const finalScore = Math.min(Math.max(Math.round(score * 10) / 10, 5.0), 97.0);
    const category: RiskCategory = finalScore >= 75 ? 'CRITICAL' : finalScore >= 50 ? 'HIGH' : finalScore >= 25 ? 'SUSPICIOUS' : 'LOW';

    return {
      url: rawUrl,
      domain,
      is_https: isHttps,
      risk_score: finalScore,
      category,
      confidence: 0.91,
      warnings: warnings.length > 0 ? warnings : ['Standard domain format'],
      brand_impersonation: warnings.some(w => w.includes('brand')) ? 'Financial Institution Spoof' : undefined,
      feature_contributions: Object.keys(featureContributions).length > 0 ? featureContributions : { 'Standard Domain': 5.0 },
      recommendation: finalScore >= 50 ? 'Do NOT enter any personal details, passwords, or banking information on this site.' : 'No major red flags detected. Verify SSL certificate before making payments.'
    };
  },

  analyzeUPI: (upi_id: string): UPIAnalysisResponse => {
    const normalized = upi_id.trim().toLowerCase();
    const [username = '', handle = ''] = normalized.split('@');

    const knownHighRisk: Record<string, { reports: number; connected: number; score: number }> = {
      'sbi.helpline.nodal@ybl': { reports: 18, connected: 8, score: 94.0 },
      'refund.desk.officer@okaxis': { reports: 15, connected: 7, score: 92.0 },
      'hdfc.kyc.verification@oksbi': { reports: 14, connected: 6, score: 91.0 },
      'electricity.bill.desk99@paytm': { reports: 11, connected: 5, score: 89.0 },
      'cbi.cyber.fine.settlement@axl': { reports: 9, connected: 4, score: 95.0 },
      'telegram.earn.money77@ybl': { reports: 8, connected: 4, score: 87.0 },
      'support-example123@upi': { reports: 14, connected: 8, score: 87.0 },
      'rajesh123@upi': { reports: 6, connected: 4, score: 78.0 },
    };

    if (normalized === 'swiggy@icici' || normalized === 'dmart.retail@hdfcbank') {
      return {
        upi_id,
        handle,
        display_name: normalized.includes('swiggy') ? 'Swiggy Official' : 'DMart Retail',
        risk_score: 2.0,
        category: 'LOW',
        status: 'SAFE',
        report_count: 0,
        connected_entities_count: 1,
        is_verified_merchant: true,
        suspicious_patterns: ['Verified official merchant VPA'],
        feature_contributions: { 'Verified Merchant': -50.0 },
        recommendation: 'Verified official merchant payment address. Safe to transact.'
      };
    }

    if (knownHighRisk[normalized]) {
      const known = knownHighRisk[normalized];
      return {
        upi_id,
        handle,
        display_name: username.replace(/\./g, ' ').toUpperCase(),
        risk_score: known.score,
        category: known.score >= 80 ? 'CRITICAL' : 'HIGH',
        status: 'HIGH_RISK',
        report_count: known.reports,
        connected_entities_count: known.connected,
        is_verified_merchant: false,
        suspicious_patterns: [
          `Reported ${known.reports} times in synthetic fraud intelligence database`,
          `Linked to ${known.connected} entities in synthetic money mule graph`,
          'Social engineering keywords in VPA username'
        ],
        feature_contributions: {
          'Community Fraud Reports': 35.0,
          'Graph Syndicate Connections': 25.0,
          'Deceptive Keywords': 20.0
        },
        recommendation: 'High risk virtual payment address. Multiple reports and deceptive keywords detected. Do NOT authorize transfer.'
      };
    }

    const patterns: string[] = [];
    const featureContributions: Record<string, number> = {};
    let score = 15.0;

    const deceptiveKeywords = ['nodal', 'support', 'refund', 'kyc', 'officer', 'verification', 'customercare', 'cbi', 'police', 'bill'];
    const matched = deceptiveKeywords.filter(kw => username.includes(kw));
    if (matched.length > 0) {
      patterns.push(`Deceptive keywords in username: ${matched.join(', ')}`);
      featureContributions['Deceptive Keywords'] = 35.0;
      score += 35.0;
    }

    const digits = (username.match(/\d/g) || []).length;
    if (digits >= 5) {
      patterns.push('High concentration of digits indicating disposable/temporary VPA');
      featureContributions['Disposable Pattern'] = 15.0;
      score += 15.0;
    }

    const finalScore = Math.min(Math.max(Math.round(score * 10) / 10, 5.0), 95.0);
    const category: RiskCategory = finalScore >= 75 ? 'CRITICAL' : finalScore >= 50 ? 'HIGH' : finalScore >= 25 ? 'SUSPICIOUS' : 'LOW';

    return {
      upi_id,
      handle,
      display_name: username.replace(/\./g, ' '),
      risk_score: finalScore,
      category,
      status: finalScore >= 60 ? 'HIGH_RISK' : finalScore >= 30 ? 'SUSPICIOUS' : 'SAFE',
      report_count: 0,
      connected_entities_count: 0,
      is_verified_merchant: false,
      suspicious_patterns: patterns.length > 0 ? patterns : ['Standard UPI format'],
      feature_contributions: Object.keys(featureContributions).length > 0 ? featureContributions : { 'Normal Account': 5.0 },
      recommendation: finalScore >= 50 ? 'Verify beneficiary identity before proceeding.' : 'No adverse signals found in synthetic database.'
    };
  },

  analyzeQR: (qr_data: string, _imageBase64?: string): QRAnalysisResponse => {
    let payeeUpi = '';
    let payeeName = '';
    let amount: number | undefined = undefined;
    let transactionRef = '';

    const reasons: string[] = [];
    const featureContributions: Record<string, number> = {};
    let score = 10.0;

    if (qr_data.startsWith('upi://pay')) {
      try {
        const queryPart = qr_data.split('?')[1] || '';
        const params = new URLSearchParams(queryPart);
        payeeUpi = params.get('pa') || '';
        payeeName = params.get('pn') || '';
        const amStr = params.get('am');
        if (amStr) amount = parseFloat(amStr);
        transactionRef = params.get('tr') || params.get('tn') || '';
      } catch {
        payeeUpi = qr_data;
      }
    } else {
      payeeUpi = qr_data;
      reasons.push('QR payload does not follow standard NPCI upi://pay specification');
      featureContributions['Non-Standard Format'] = 25.0;
      score += 25.0;
    }

    if (payeeUpi) {
      const upiAnalysis = clientAI.analyzeUPI(payeeUpi);
      score += (upiAnalysis.risk_score * 0.7);
      if (upiAnalysis.risk_score >= 60) {
        reasons.push(`Destination UPI ID (${payeeUpi}) is flagged as ${upiAnalysis.category}`);
        featureContributions['Destination VPA Risk'] = 45.0;
      }
    }

    if (qr_data.toLowerCase().includes('receive') || qr_data.toLowerCase().includes('pin')) {
      reasons.push('Deceptive QR payload prompting user to scan/enter PIN to "receive" money');
      featureContributions['Deceptive Debit Payload'] = 40.0;
      score += 40.0;
    }

    const finalScore = Math.min(Math.max(Math.round(score * 10) / 10, 5.0), 98.0);
    const category: RiskCategory = finalScore >= 75 ? 'CRITICAL' : finalScore >= 50 ? 'HIGH' : finalScore >= 25 ? 'SUSPICIOUS' : 'LOW';

    return {
      raw_payload: qr_data,
      is_valid_upi_qr: qr_data.startsWith('upi://pay'),
      payee_upi: payeeUpi,
      payee_name: payeeName,
      amount,
      currency: 'INR',
      transaction_ref: transactionRef,
      risk_score: finalScore,
      category,
      reasons: reasons.length > 0 ? reasons : ['Legitimate payment QR format'],
      feature_contributions: Object.keys(featureContributions).length > 0 ? featureContributions : { 'Normal QR': 5.0 },
      recommendation: finalScore >= 60 ? 'Do NOT scan this QR code or authorize payment. Scanning a QR only debits your account; never enter your PIN to receive money.' : 'QR format is valid. Verify recipient name on your payment app before entering PIN.',
      safe_to_proceed: finalScore < 60
    };
  },

  analyzeTransaction: (data: {
    amount: number;
    time_str?: string;
    hour?: number;
    location?: string;
    recipient_upi: string;
    recipient_name?: string;
    is_new_recipient?: boolean;
    device_id?: string;
    device_changed?: boolean;
    transaction_frequency_today?: number;
  }): TransactionAnalysisResponse => {
    let hour = data.hour !== undefined ? data.hour : 14;
    if (data.time_str && data.time_str.includes(':')) {
      const parsedHour = parseInt(data.time_str.split(':')[0], 10);
      if (!isNaN(parsedHour)) hour = parsedHour;
    }

    const indicators: string[] = [];
    const featureContributions: Record<string, number> = {};
    let score = 10.0;

    let timeAnomalyPct = 5.0;
    if (hour >= 23 || hour <= 4) {
      timeAnomalyPct = 85.0;
      indicators.push(`Nocturnal transaction timing (${data.time_str || `${hour}:00`} AM) outside usual activity baseline`);
      featureContributions['Nocturnal Timing'] = 25.0;
      score += 25.0;
    }

    let amountAnomalyPct = 10.0;
    if (data.amount >= 30000) {
      amountAnomalyPct = 95.0;
      indicators.push(`Unusually high amount (₹${data.amount.toLocaleString()}) exceeding 10x typical profile`);
      featureContributions['Amount Outlier'] = 30.0;
      score += 30.0;
    } else if (data.amount >= 10000) {
      amountAnomalyPct = 65.0;
      indicators.push(`Elevated transfer amount (₹${data.amount.toLocaleString()})`);
      featureContributions['Elevated Amount'] = 15.0;
      score += 15.0;
    }

    let recipientNoveltyPct = 10.0;
    if (data.is_new_recipient) {
      recipientNoveltyPct = 80.0;
      indicators.push('First-time transfer to an unverified recipient VPA');
      featureContributions['New Payee'] = 18.0;
      score += 18.0;
    }

    let locationAnomalyPct = 5.0;
    if (data.location && (data.location.includes('Kolkata') || data.location.includes('Unknown') || data.location.includes('Jammu'))) {
      locationAnomalyPct = 78.0;
      indicators.push(`Geographical IP anomaly: Transfer originated from unexpected location (${data.location})`);
      featureContributions['Geographic Anomaly'] = 18.0;
      score += 18.0;
    }

    let deviceAnomalyPct = 5.0;
    if (data.device_changed) {
      deviceAnomalyPct = 82.0;
      indicators.push('New or unrecognized hardware device fingerprint');
      featureContributions['Unrecognized Device'] = 16.0;
      score += 16.0;
    }

    const finalScore = Math.min(Math.max(Math.round(score * 10) / 10, 5.0), 96.0);
    const category: RiskCategory = finalScore >= 75 ? 'CRITICAL' : finalScore >= 50 ? 'HIGH' : finalScore >= 25 ? 'SUSPICIOUS' : 'LOW';

    return {
      risk_score: finalScore,
      category,
      confidence: 0.93,
      amount_anomaly_pct: amountAnomalyPct,
      time_anomaly_pct: timeAnomalyPct,
      recipient_novelty_pct: recipientNoveltyPct,
      location_anomaly_pct: locationAnomalyPct,
      device_anomaly_pct: deviceAnomalyPct,
      isolation_forest_score: Math.round((finalScore / 100) * 100) / 100,
      indicators: indicators.length > 0 ? indicators : ['Transaction parameters conform with baseline spending profile'],
      feature_contributions: Object.keys(featureContributions).length > 0 ? featureContributions : { 'Profile Baseline Match': 5.0 },
      recommendation: finalScore >= 60 ? 'Stepping up security: Cancel or require biometric 2FA before proceeding with this transfer.' : 'Parameters within expected user profile.',
      safe_to_proceed: finalScore < 60
    };
  },

  analyzeUnified: (data: any): UnifiedRiskResponse => {
    let messageScore = 0;
    let upiScore = 0;
    let txnScore = 0;
    const allIndicators: string[] = [];
    const componentScores: Record<string, number> = {};

    if (data.message) {
      const res = clientAI.analyzeMessage(data.message);
      messageScore = res.risk_score;
      componentScores['Message NLP'] = messageScore;
      allIndicators.push(...res.indicators);
    }
    if (data.upi_id) {
      const res = clientAI.analyzeUPI(data.upi_id);
      upiScore = res.risk_score;
      componentScores['UPI Identifier'] = upiScore;
      allIndicators.push(...res.suspicious_patterns);
    }
    if (data.amount || data.transaction_data) {
      const res = clientAI.analyzeTransaction({
        amount: data.amount || 25000,
        recipient_upi: data.upi_id || 'rajesh123@upi',
        ...data.transaction_data
      });
      txnScore = res.risk_score;
      componentScores['Transaction Anomaly'] = txnScore;
      allIndicators.push(...res.indicators);
    }

    const overall = Math.round(Math.max(messageScore, upiScore, txnScore) * 10) / 10 || 15.0;
    const category: RiskCategory = overall >= 75 ? 'CRITICAL' : overall >= 50 ? 'HIGH' : overall >= 25 ? 'SUSPICIOUS' : 'LOW';

    return {
      overall_risk_score: overall,
      category,
      confidence: 0.92,
      scam_type: overall >= 60 ? 'UNIFIED FRAUD DETECTED' : 'NORMAL ACTIVITY',
      component_scores: componentScores,
      feature_contributions: componentScores,
      all_indicators: allIndicators,
      recommended_action: overall >= 60 ? 'Halt interaction. High probability of multi-vector social engineering fraud.' : 'Transaction seems normal.',
      safe_to_proceed: overall < 60
    };
  }
};
