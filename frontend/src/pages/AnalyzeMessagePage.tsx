import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageSquareWarning, Sparkles, Send, Globe, AlertCircle,
  CheckCircle2, RefreshCw, FileText
} from 'lucide-react';
import { analysisApi } from '../services/api';
import { MessageAnalysisResponse } from '../types';
import { RiskMeter } from '../components/RiskMeter';
import { ExplainabilityCard } from '../components/ExplainabilityCard';

const MULTILINGUAL_PRESETS = [
  {
    lang: 'English',
    flag: '🇬🇧',
    code: 'en',
    title: 'SBI KYC Phishing (English)',
    text: 'Dear customer, your SBI account will be blocked today due to pending KYC. Update immediately at http://sbi-kyc-verification.top/update or pay Re.1 verification fee to avoid suspension.'
  },
  {
    lang: 'Hindi',
    flag: '🇮🇳',
    code: 'hi',
    title: 'SBI खाता ब्लॉक चेतावनी (हिंदी)',
    text: 'प्रिय ग्राहक, आपका SBI Yono खाता आज बंद कर दिया जाएगा क्योंकि आपकी KYC अधूरी है। तुरंत http://sbi-kyc-verification.top/update पर जाएं या खाता चालू रखने के लिए sbi.helpline.nodal@ybl पर ₹10 सत्यापन शुल्क भेजें।'
  },
  {
    lang: 'Kannada',
    flag: '🇮🇳',
    code: 'kn',
    title: 'ಬೆಸ್ಕಾಂ ವಿದ್ಯುತ್ ಬಿಲ್ ಎಚ್ಚರಿಕೆ (ಕನ್ನಡ)',
    text: 'ಆತ್ಮೀಯ ಗ್ರಾಹಕರೇ, ನಿಮ್ಮ ಹಿಂದಿನ ತಿಂಗಳ ವಿದ್ಯುತ್ ಬಿಲ್ ಪಾವತಿಯಾಗದ ಕಾರಣ ಇಂದು ರಾತ್ರಿ 9:30 ಕ್ಕೆ ವಿದ್ಯುತ್ ಕಡಿತಗೊಳಿಸಲಾಗುತ್ತದೆ. ತಕ್ಷಣ ನಮ್ಮ ಅಧಿಕಾರಿಗೆ +91 9876543210 ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ electricity.bill.desk99@paytm ಗೆ ₹10 ಪಾವತಿಸಿ.'
  },
  {
    lang: 'Telugu',
    flag: '🇮🇳',
    code: 'te',
    title: 'రీఫండ్ క్యాష్‌బ్యాక్ మోసం (తెలుగు)',
    text: 'అభినందనలు! మీ ₹4,850 రీఫండ్ మంజూరైంది. మీ బ్యాంక్ ఖాతాలో జమ కావడానికి ఈ లింక్ క్లిక్ చేసి మీ 6-అంకెల UPI పిన్ ఎంటర్ చేయండి: http://free-cashback-gpay.online/claim'
  },
  {
    lang: 'Tamil',
    flag: '🇮🇳',
    code: 'ta',
    title: 'வங்கி கணக்கு ரத்து அறிவிப்பு (தமிழ்)',
    text: 'அன்புள்ள வாடிக்கையாளரே, நிலுவையில் உள்ள KYC காரணமாக உங்கள் வங்கி கணக்கு இன்று முடக்கப்படும். உடனடியாக புதுப்பிக்க sbi.helpline.nodal@ybl க்கு ₹10 சரிபார்ப்பு கட்டணம் செலுத்தவும்.'
  },
  {
    lang: 'Marathi',
    flag: '🇮🇳',
    code: 'mr',
    title: 'वीज बिल तातडीची सूचना (मराठी)',
    text: 'महावितरण सूचना: मागील महिन्याचे वीज बिल अपडेट न केल्यामुळे आज रात्री वीज पुरवठा खंडित केला जाईल. तात्काळ वीज अधिकाऱ्याशी संपर्क साधा किंवा electricity.bill.desk99@paytm वर बिल भरा.'
  },
  {
    lang: 'Legitimate',
    flag: '🟢',
    code: 'en',
    title: 'Normal Bank Credit SMS',
    text: 'Your SBI A/C ending 4821 is credited by INR 1,500.00 on 03-Sep-26 by UPI/P2A/Ref 6245108492. Balance: INR 24,180.50.'
  }
];

export const AnalyzeMessagePage: React.FC = () => {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [languageHint, setLanguageHint] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MessageAnalysisResponse | null>(null);

  // Auto-populate from demo scenario if passed
  useEffect(() => {
    if (location.state?.demoPayload?.message) {
      setMessage(location.state.demoPayload.message);
      setLanguageHint(location.state.demoPayload.language_hint);
      // Auto run
      runAnalysis(location.state.demoPayload.message, location.state.demoPayload.language_hint);
    }
  }, [location.state]);

  const runAnalysis = async (textToAnalyze: string, langHint?: string) => {
    if (!textToAnalyze.trim()) return;
    setLoading(true);
    try {
      const res = await analysisApi.analyzeMessage(textToAnalyze, langHint);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (preset: typeof MULTILINGUAL_PRESETS[0]) => {
    setMessage(preset.text);
    setLanguageHint(preset.code);
    runAnalysis(preset.text, preset.code);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16 pt-4">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <MessageSquareWarning className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono font-semibold uppercase text-cyan-400 tracking-wider">
            NLP SCAM DETECTOR
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Multilingual Message Scam & Social Engineering Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Deep NLP inspection of suspicious SMS, WhatsApp, and Telegram messages in 6 Indian languages.
          Detects artificial urgency, impersonation, fear tactics, and deceptive payment/PIN requests.
        </p>
      </div>

      {/* Multilingual Presets Bar */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>TRY REALISTIC INDIAN SCAM PRESETS (MULTILINGUAL)</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {MULTILINGUAL_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetSelect(preset)}
              className="text-left p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition-all text-xs group"
            >
              <div className="flex items-center justify-between font-medium text-slate-300 group-hover:text-white">
                <span className="truncate">{preset.title}</span>
                <span className="text-sm shrink-0 ml-1">{preset.flag}</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">{preset.lang}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Analysis Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Text Box */}
        <div className="lg:col-span-7 space-y-4">
          <div className="cyber-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                PASTE MESSAGE TO ANALYZE
              </label>
              {result && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 text-xs font-mono border border-slate-700">
                  <span>Detected Language:</span>
                  <span className="font-bold">{result.language_display}</span>
                </div>
              )}
            </div>

            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste SMS, WhatsApp message, or payment notification here..."
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 font-mono">
                {message.length} characters
              </span>
              <button
                onClick={() => runAnalysis(message, languageHint)}
                disabled={loading || message.trim().length < 3}
                className="cyber-button-primary px-6 py-2.5 text-xs font-bold disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>ANALYZE WITH AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Explainability Breakdown Card */}
          {result && (
            <ExplainabilityCard
              indicators={result.indicators}
              featureContributions={result.feature_contributions}
              recommendation={result.recommendation}
              category={result.category}
              scamType={result.scam_type}
            />
          )}
        </div>

        {/* Right: Circular Meter & Threat Summary */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="cyber-card p-6 space-y-6 animate-fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                AI THREAT ASSESSMENT
              </h3>

              {/* Circular Risk Meter */}
              <RiskMeter
                score={result.risk_score}
                category={result.category}
                confidence={result.confidence}
                size="lg"
              />

              {/* Categorization Card */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Scam Classification:</span>
                  <span className="font-bold text-white font-mono">{result.scam_type}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Detected Language:</span>
                  <span className="font-semibold text-cyan-300">{result.language_display}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Model Confidence:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Authorization Safety:</span>
                  <span className={`font-bold font-mono ${result.safe_to_proceed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.safe_to_proceed ? 'SAFE TO PROCEED' : 'DO NOT AUTHORIZE'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="cyber-card p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[350px]">
              <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 border border-slate-800">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-300 text-sm">Awaiting Input Message</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Paste any suspicious payment message on the left or select a multilingual preset to evaluate.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
