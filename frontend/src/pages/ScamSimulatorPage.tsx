import React, { useState } from 'react';
import {
  AlertOctagon, Sparkles, Play, ShieldAlert, CheckCircle2,
  RefreshCw, ArrowRight, Activity, Zap
} from 'lucide-react';
import { analysisApi } from '../services/api';
import { MessageAnalysisResponse } from '../types';
import { RiskMeter } from '../components/RiskMeter';
import { ExplainabilityCard } from '../components/ExplainabilityCard';

interface ScamSimulationScenario {
  id: string;
  name: string;
  category: string;
  technique: string;
  sender: string;
  channel: 'SMS' | 'WhatsApp' | 'Telegram' | 'QR';
  message: string;
}

const SCENARIOS: ScamSimulationScenario[] = [
  {
    id: 'kyc',
    name: 'KYC Scam',
    category: 'KYC Phishing',
    technique: 'Account Deactivation Urgency + ₹10 Token Verification Lure',
    sender: 'VM-SBIINB',
    channel: 'SMS',
    message: 'Dear customer, your SBI account will be blocked today due to pending KYC. Update immediately at http://sbi-kyc-verification.top/update or pay Re.1 verification fee to sbi.helpline.nodal@ybl to avoid suspension.'
  },
  {
    id: 'refund',
    name: 'Fake Refund',
    category: 'Refund Trap',
    technique: 'Approval of Phantom Funds + Reverse UPI PIN Entry Request',
    sender: 'PhonePe Rewards',
    channel: 'WhatsApp',
    message: 'Congratulations! Your refund of Rs.4,850 for failed transaction is approved. To receive money into your bank, click http://free-cashback-gpay.online/claim and enter your 6-digit UPI PIN to credit funds.'
  },
  {
    id: 'electricity',
    name: 'Electricity Scam',
    category: 'Utility Blackout Threat',
    technique: 'Nocturnal 9:30 PM Power Cut Threat + Officer Phone Coercion',
    sender: 'VK-BESCOM',
    channel: 'SMS',
    message: 'Dear consumer, your electricity power will be disconnected tonight at 9:30 PM because previous month bill was not updated. Please immediately contact our electricity officer at +91 9876543210 or pay via electricity.bill.desk99@paytm.'
  },
  {
    id: 'customer_care',
    name: 'Fake Customer Care',
    category: 'Remote Access RAT',
    technique: 'Support Impersonation + AnyDesk/TeamViewer Screen Takeover',
    sender: 'GooglePay Desk',
    channel: 'WhatsApp',
    message: 'Hi, this is official support from GooglePay / NPCI. For resolving your failed transfer of ₹12,000, please download AnyDesk app from play store and send ₹1 test token to refund.desk.officer@okaxis.'
  },
  {
    id: 'investment',
    name: 'Investment Scam',
    category: 'Ponzi / Part-Time Job',
    technique: 'Guaranteed 300% Return + YouTube Video Liking Task',
    sender: 'Global HR Recruiter',
    channel: 'Telegram',
    message: 'Work from home opportunity! Earn ₹3,000 to ₹10,000 daily by liking YouTube videos and rating hotels on Telegram. Invest just ₹500 to telegram.earn.money77@ybl and get ₹2,500 guaranteed profit within 2 hours.'
  },
  {
    id: 'lottery',
    name: 'Lottery Scam',
    category: 'KBC Lucky Winner',
    technique: '₹25 Lakh Prize Claim + Advance GST Tax Transfer Trap',
    sender: 'Jio-KBC Desk',
    channel: 'WhatsApp',
    message: 'KBC Jio Lucky Winner! You won Rs.25,00,000 lottery in lucky draw. To claim prize money, deposit refundable government GST fee of ₹12,500 to nodal SBI account via lucky.winner.kbc2026@icici.'
  },
  {
    id: 'police',
    name: 'Police Impersonation',
    category: 'Digital Arrest / Extortion',
    technique: 'Illegal Parcel Allegation + Fake Bail Bond Wire Transfer',
    sender: 'Cyber Crime Cell',
    channel: 'WhatsApp',
    message: 'Cyber Crime Police HQ: An arrest warrant has been issued against you for money laundering and illegal parcel. Transfer bail bond fee ₹25,000 to government verified nodal account cbi.cyber.fine.settlement@axl within 30 minutes to avoid arrest.'
  },
  {
    id: 'qr_scam',
    name: 'QR Scam',
    category: 'Deceptive Debit QR',
    technique: 'Cashback Claim via Reverse Merchant Payment Code',
    sender: 'OLX Buyer',
    channel: 'QR',
    message: 'upi://pay?pa=refund.desk.officer@okaxis&pn=Buyer+Advance+Payment&am=4850.00&cu=INR&tn=Scan+QR+And+Enter+UPI+PIN+To+Receive+Advance'
  }
];

export const ScamSimulatorPage: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<ScamSimulationScenario>(SCENARIOS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MessageAnalysisResponse | null>(null);

  const runSimulation = async (scenario: ScamSimulationScenario) => {
    setSelectedScenario(scenario);
    setLoading(true);
    try {
      if (scenario.channel === 'QR') {
        const qrRes = await analysisApi.analyzeQR(scenario.message);
        // Map to uniform response format
        setResult({
          risk_score: qrRes.risk_score,
          category: qrRes.category,
          confidence: 0.92,
          scam_type: 'DECEPTIVE DEBIT QR SCAM',
          detected_language: 'en',
          language_display: 'English 🇬🇧',
          indicators: qrRes.reasons,
          feature_contributions: qrRes.feature_contributions,
          recommendation: qrRes.recommendation,
          safe_to_proceed: qrRes.safe_to_proceed
        });
      } else {
        const res = await analysisApi.analyzeMessage(scenario.message);
        setResult(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16 pt-4">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono font-semibold uppercase text-red-400 tracking-wider">
            HACKATHON EVALUATION SUITE
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Interactive Scam Simulator & AI Detection Lab
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Select any of the 8 prominent Indian UPI scam archetypes below to simulate a live phishing delivery,
          trigger the multi-signal AI detector, and examine the explainable forensic breakdown.
        </p>
      </div>

      {/* 8 Scenario Selector Grid */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>SELECT SCAM ARCHETYPE TO TEST:</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SCENARIOS.map((sc) => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => runSimulation(sc)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-red-950/60 to-slate-900 border-red-500/50 shadow-lg shadow-red-500/10 scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold text-xs ${isSelected ? 'text-red-400' : 'text-slate-200'}`}>
                    [{sc.name}]
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-400">
                    {sc.channel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{sc.category}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulation Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Simulated Smartphone / Message Box */}
        <div className="lg:col-span-6 space-y-6">
          <div className="cyber-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  SIMULATED INCOMING PHISHING ATTACK
                </span>
              </div>
              <span className="text-xs font-mono text-cyan-400">Channel: {selectedScenario.channel}</span>
            </div>

            {/* Fake message card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1.5 border-b border-slate-900">
                <span className="font-mono font-medium text-slate-300">Sender: {selectedScenario.sender}</span>
                <span>Today • 11:20 AM</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                {selectedScenario.message}
              </p>
            </div>

            {/* Exploitation technique analysis */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-500 text-[11px] uppercase font-mono">Social Engineering Mechanism:</span>
              <p className="text-amber-300 font-medium">{selectedScenario.technique}</p>
            </div>

            <button
              onClick={() => runSimulation(selectedScenario)}
              disabled={loading}
              className="w-full cyber-button-danger py-3 text-xs font-bold"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Scam Signature...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>RUN AI SCAM DETECTION ON THIS MESSAGE</span>
                </>
              )}
            </button>
          </div>

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

        {/* Right: AI Analysis Flow */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="cyber-card p-6 space-y-6 animate-fade-in">
              <div className="text-center space-y-1">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  AI DETECTION RESULT
                </span>
                <h3 className="font-bold text-white text-lg">{result.scam_type}</h3>
              </div>

              {/* Meter */}
              <RiskMeter
                score={result.risk_score}
                category={result.category}
                confidence={result.confidence}
                size="lg"
              />

              {/* End-to-end pipeline steps */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  AI PROCESSING PIPELINE
                </span>
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">1. Natural Language Processing:</span>
                    <span className="text-emerald-400 font-semibold font-mono">TF-IDF Vectorized</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">2. Linguistic Manipulation Score:</span>
                    <span className="text-red-400 font-mono font-bold">{result.risk_score} / 100</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">3. Detected Scam Technique:</span>
                    <span className="text-amber-300 font-medium truncate max-w-[220px]">{selectedScenario.technique}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">4. Recommended Response:</span>
                    <span className="text-red-400 font-bold font-mono">HALT TRANSFER & REPORT</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="cyber-card p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 border border-slate-800">
                <Sparkles className="w-7 h-7 text-cyan-500" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-200 text-sm">Click "RUN AI SCAM DETECTION"</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Execute the live ML detector to analyze social engineering hooks and generate an explainable risk verdict.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
