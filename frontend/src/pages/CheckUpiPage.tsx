import React, { useState } from 'react';
import {
  Search, ShieldAlert, ShieldCheck, AlertTriangle, Network,
  Users, CheckCircle2, RefreshCw, Info, ExternalLink
} from 'lucide-react';
import { analysisApi } from '../services/api';
import { UPIAnalysisResponse } from '../types';
import { RiskMeter } from '../components/RiskMeter';
import { ExplainabilityCard } from '../components/ExplainabilityCard';

const SAMPLE_UPIS = [
  { upi: 'sbi.helpline.nodal@ybl', label: 'Fake SBI Nodal Desk (Phishing)', risk: 'HIGH' },
  { upi: 'refund.desk.officer@okaxis', label: 'Fake Refund Officer (Spoof)', risk: 'HIGH' },
  { upi: 'support-example123@upi', label: 'Prompt Example VPA (Suspicious)', risk: 'SUSPICIOUS' },
  { upi: 'telegram.earn.money77@ybl', label: 'Work-From-Home Task (Laundering)', risk: 'SUSPICIOUS' },
  { upi: 'swiggy@icici', label: 'Swiggy Official (Verified Merchant)', risk: 'SAFE' },
  { upi: 'dmart.retail@hdfcbank', label: 'DMart Retail (Verified Merchant)', risk: 'SAFE' },
];

export const CheckUpiPage: React.FC = () => {
  const [upiInput, setUpiInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UPIAnalysisResponse | null>(null);

  const runUpiCheck = async (idToCheck: string) => {
    if (!idToCheck.trim()) return;
    setLoading(true);
    try {
      const res = await analysisApi.analyzeUPI(idToCheck.trim());
      setResult(res);
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
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono font-semibold uppercase text-amber-400 tracking-wider">
            UPI IDENTIFIER RISK ANALYZER
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          UPI ID (VPA) Threat Profile & Synthetic Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Evaluates virtual payment addresses against known synthetic fraud rings, deceptive keyword spoofs,
          disposable VPA patterns, and community complaint telemetry.
        </p>
      </div>

      {/* Preset UPIs */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          TEST KNOWN SYNTHETIC IDENTIFIERS
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SAMPLE_UPIS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUpiInput(s.upi);
                runUpiCheck(s.upi);
              }}
              className="text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition-all text-xs flex items-center justify-between group"
            >
              <div>
                <div className="font-mono font-bold text-slate-200 group-hover:text-amber-400">{s.upi}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{s.label}</div>
              </div>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                s.risk === 'HIGH' ? 'bg-red-500/20 text-red-400' : (s.risk === 'SUSPICIOUS' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400')
              }`}>
                {s.risk}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Form & Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="cyber-card p-6 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              ENTER UPI ID (VPA) TO VERIFY
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={upiInput}
                onChange={(e) => setUpiInput(e.target.value)}
                placeholder="e.g. support-example123@upi or merchant@oksbi"
                className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => runUpiCheck(upiInput)}
                disabled={loading || !upiInput.trim()}
                className="cyber-button-primary px-6 py-3 text-xs font-bold shrink-0"
              >
                {loading ? 'Checking...' : 'CHECK UPI ID'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              * UPI handles analyzed against authentic NPCI PSP registrar mappings.
            </p>
          </div>

          {result && (
            <ExplainabilityCard
              indicators={result.suspicious_patterns}
              featureContributions={result.feature_contributions}
              recommendation={result.recommendation}
              category={result.category}
              scamType={result.status}
            />
          )}
        </div>

        {/* Right: Risk Profile Card */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="cyber-card p-6 space-y-6 animate-fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                UPI RISK PROFILE
              </h3>

              <RiskMeter
                score={result.risk_score}
                category={result.category}
                size="lg"
              />

              {/* Threat Status Badge */}
              <div className="text-center">
                <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-xs border ${
                  result.status === 'HIGH_RISK'
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : (result.status === 'SUSPICIOUS' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40')
                }`}>
                  <span>{result.status === 'HIGH_RISK' ? '🔴 HIGH RISK' : (result.status === 'SUSPICIOUS' ? '⚠️ SUSPICIOUS' : '🟢 VERIFIED SAFE')}</span>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>Demo Reports</span>
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-white">
                    {result.report_count}
                  </div>
                  <span className="text-[10px] text-slate-500">In synthetic DB</span>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Network className="w-3.5 h-3.5" />
                    <span>Connected Nodes</span>
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-white">
                    {result.connected_entities_count}
                  </div>
                  <span className="text-[10px] text-slate-500">In fraud graph</span>
                </div>
              </div>

              {/* Compliance Guidance Notice */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p>
                  <strong>Disclaimer:</strong> {result.recommendation} Risk scores are AI-assisted indicators and do not definitively brand any entity as fraudulent.
                </p>
              </div>
            </div>
          ) : (
            <div className="cyber-card p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[350px]">
              <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 border border-slate-800">
                <Search className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-300 text-sm">Awaiting UPI Input</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Enter a UPI address on the left to inspect its risk score, connected entities, and spoof patterns.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
