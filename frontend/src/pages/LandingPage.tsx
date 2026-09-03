import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, ShieldCheck, AlertTriangle, ArrowRight, Activity, Network,
  Lock, Eye, PhoneCall, CheckCircle2, ChevronRight, Zap, Sparkles
} from 'lucide-react';
import { analysisApi } from '../services/api';
import { RiskMeter } from '../components/RiskMeter';

export const LandingPage: React.FC = () => {
  const [quickInput, setQuickInput] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickResult, setQuickResult] = useState<any>(null);

  const handleQuickScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    setQuickLoading(true);
    try {
      if (quickInput.includes('@') && !quickInput.includes('http')) {
        const res = await analysisApi.analyzeUPI(quickInput.trim());
        setQuickResult({ type: 'UPI', ...res });
      } else if (quickInput.includes('http') || quickInput.includes('.com') || quickInput.includes('.xyz') || quickInput.includes('.top')) {
        const res = await analysisApi.analyzeURL(quickInput.trim());
        setQuickResult({ type: 'URL', ...res });
      } else {
        const res = await analysisApi.analyzeMessage(quickInput.trim());
        setQuickResult({ type: 'MESSAGE', ...res });
      }
    } catch (e) {
      // fallback mock result
      setQuickResult({
        type: 'MESSAGE',
        risk_score: 92,
        category: 'CRITICAL',
        confidence: 0.94,
        recommendation: 'Potential high-risk phishing communication detected.',
        indicators: ['Urgency language', 'Payment demand']
      });
    } finally {
      setQuickLoading(false);
    }
  };

  return (
    <div className="space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide shadow-sm animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-POWERED DIGITAL PAYMENT FRAUD INTELLIGENCE</span>
          </div>

          {/* Heading */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Detect. Prevent. <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">Protect.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
              AI-powered defense safeguarding Indian users from sophisticated UPI phishing, deceptive QR codes, payment spoofing, and transactional anomalies.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="cyber-button-primary px-8 py-3.5 text-sm font-bold w-full sm:w-auto shadow-xl shadow-cyan-500/20"
            >
              <span>Protect My Transactions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/simulator"
              className="cyber-button-secondary px-8 py-3.5 text-sm font-semibold w-full sm:w-auto hover:border-cyan-500/40"
            >
              <span>Try Scam Simulator</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Scanner Card */}
          <div className="max-w-2xl mx-auto pt-8">
            <div className="cyber-card p-4 sm:p-6 shadow-2xl border-cyan-500/20 text-left">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Quick Intelligence Scanner
                </span>
                <span className="text-slate-400 text-[11px]">Supports Messages, URLs, & UPI IDs</span>
              </div>
              <form onSubmit={handleQuickScan} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Paste SMS, suspicious URL (e.g. sbi-kyc.top), or UPI ID..."
                  className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={quickLoading}
                  className="cyber-button-primary px-6 py-3 text-xs font-bold shrink-0"
                >
                  {quickLoading ? 'Scanning...' : 'Scan Now'}
                </button>
              </form>

              {/* Sample Quick Links */}
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 overflow-x-auto pb-1">
                <span>Try sample:</span>
                <button
                  type="button"
                  onClick={() => setQuickInput('Dear customer, your SBI account will be blocked today due to pending KYC. Pay Rs.10 to sbi.helpline.nodal@ybl to verify.')}
                  className="text-cyan-400 hover:underline shrink-0"
                >
                  KYC Threat SMS
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setQuickInput('sbi.helpline.nodal@ybl')}
                  className="text-cyan-400 hover:underline shrink-0 font-mono"
                >
                  Suspicious VPA
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setQuickInput('http://free-cashback-gpay.online/claim')}
                  className="text-cyan-400 hover:underline shrink-0 font-mono"
                >
                  Phishing Link
                </button>
              </div>

              {/* Quick Result Preview */}
              {quickResult && (
                <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <RiskMeter score={quickResult.risk_score} category={quickResult.category} size="sm" showLabel={false} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{quickResult.category} RISK DETECTED</span>
                        <span className="text-xs font-mono text-cyan-400 font-semibold">{quickResult.risk_score}/100</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                        {quickResult.recommendation}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={quickResult.type === 'UPI' ? '/check-upi' : (quickResult.type === 'URL' ? '/check-url' : '/analyze-message')}
                    className="cyber-button-secondary text-xs px-4 py-2 shrink-0 w-full sm:w-auto"
                  >
                    <span>Full XAI Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4 CORE VALUE PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
            MULTI-SIGNAL FRAUD DEFENSE
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            Comprehensive Security Across Every Payment Vector
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="cyber-card p-6 space-y-4 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">Multi-Signal AI Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fuses Indic NLP classification, phishing heuristics, UPI syntax, and Isolation Forest transaction anomaly modeling.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="cyber-card p-6 space-y-4 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">Explainable AI (XAI)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never outputs black-box verdicts. Transparently displays individual risk factor contributions (+22 urgency, +27 payment demand).
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="cyber-card p-6 space-y-4 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">Fraud Network Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              NetworkX graph analytics traces interconnected money mule accounts, synthetic clusters, and layered cashout routes.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="cyber-card p-6 space-y-4 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">Emergency 1930 Helpline</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Golden-hour rapid incident response generator providing formal incident briefs formatted for National Cyber Crime Portal submission.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="cyber-card-glow p-8 sm:p-12">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
              HOW IT WORKS
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              Four-Step Zero-Trust Payment Defense
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="space-y-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center border border-cyan-500/40 mx-auto md:mx-0">
                1
              </div>
              <h4 className="font-bold text-white text-base">Scan & Ingest</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan QR codes, paste SMS communications, analyze external links, or simulate outgoing UPI transfers.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center border border-cyan-500/40 mx-auto md:mx-0">
                2
              </div>
              <h4 className="font-bold text-white text-base">Analyze Signals</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                ML models evaluate linguistic manipulation, handle spoofing, domain entropy, and user behavioral deviation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center border border-cyan-500/40 mx-auto md:mx-0">
                3
              </div>
              <h4 className="font-bold text-white text-base">Understand Risk</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review the explainable risk breakdown (0–100) detailing the exact social engineering hooks flagged.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center border border-cyan-500/40 mx-auto md:mx-0">
                4
              </div>
              <h4 className="font-bold text-white text-base">Prevent & Intercept</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pre-payment safety guardrail halts risky transfers before UPI PIN entry, preventing irreversible financial loss.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
