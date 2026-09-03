import React, { useState } from 'react';
import {
  Link2, ShieldAlert, ShieldCheck, AlertTriangle, Globe,
  Lock, Unlock, ExternalLink, RefreshCw
} from 'lucide-react';
import { analysisApi } from '../services/api';
import { URLAnalysisResponse } from '../types';
import { RiskMeter } from '../components/RiskMeter';
import { ExplainabilityCard } from '../components/ExplainabilityCard';

const SAMPLE_URLS = [
  { url: 'http://sbi-kyc-verification.top/update', label: 'SBI KYC Phishing (.top TLD)', risk: 'CRITICAL' },
  { url: 'http://free-cashback-gpay.online/claim', label: 'Fake GPay Cashback (.online)', risk: 'CRITICAL' },
  { url: 'http://192.168.1.105:8080/bank-help', label: 'IP-Host Based Portal (No Domain)', risk: 'CRITICAL' },
  { url: 'https://onlinesbi.sbi', label: 'SBI Official NetBanking (Authentic)', risk: 'SAFE' },
  { url: 'https://paytm.com', label: 'Paytm Official Portal (Authentic)', risk: 'SAFE' },
];

export const CheckUrlPage: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<URLAnalysisResponse | null>(null);

  const runUrlAnalysis = async (urlToCheck: string) => {
    if (!urlToCheck.trim()) return;
    setLoading(true);
    try {
      const res = await analysisApi.analyzeURL(urlToCheck.trim());
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
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Link2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono font-semibold uppercase text-sky-400 tracking-wider">
            PHISHING URL HEURISTICS
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Deceptive Financial Website & Phishing Link Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Static heuristics inspection evaluates brand spoofing, high-risk TLDs, domain entropy, and missing SSL certs
          without executing malicious scripts or initiating outbound requests to suspect hosts.
        </p>
      </div>

      {/* Preset Links */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          TEST SUSPICIOUS LINKS
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SAMPLE_URLS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUrlInput(s.url);
                runUrlAnalysis(s.url);
              }}
              className="text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 transition-all text-xs flex items-center justify-between group"
            >
              <div>
                <div className="font-mono font-semibold text-slate-200 group-hover:text-sky-400 truncate max-w-[200px]">{s.url}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{s.label}</div>
              </div>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                s.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {s.risk}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="cyber-card p-6 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              ENTER URL OR DOMAIN TO INSPECT
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g. http://sbi-kyc-update.xyz or payment portal link"
                className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={() => runUrlAnalysis(urlInput)}
                disabled={loading || !urlInput.trim()}
                className="cyber-button-primary px-6 py-3 text-xs font-bold shrink-0"
              >
                {loading ? 'Analyzing...' : 'CHECK URL'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              * Safe sandbox: Backend analyzes syntax, registrar domains, and entropy safely without fetching dangerous remote web content.
            </p>
          </div>

          {result && (
            <ExplainabilityCard
              indicators={result.warnings}
              featureContributions={result.feature_contributions}
              recommendation={result.recommendation}
              category={result.category}
              scamType={result.brand_impersonation ? `${result.brand_impersonation} SPOOFING` : undefined}
            />
          )}
        </div>

        {/* Right Column: Risk Gauge */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="cyber-card p-6 space-y-6 animate-fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                PHISHING THREAT LEVEL
              </h3>

              <RiskMeter
                score={result.risk_score}
                category={result.category}
                size="lg"
              />

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Target Host / Domain:</span>
                  <span className="font-mono font-bold text-white">{result.domain}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Transport Security:</span>
                  <div className="flex items-center gap-1.5">
                    {result.is_https ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold font-mono">HTTPS (Valid)</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-red-400 font-semibold font-mono">INSECURE (HTTP)</span>
                      </>
                    )}
                  </div>
                </div>
                {result.brand_impersonation && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Impersonated Brand:</span>
                    <span className="font-mono font-bold text-red-400">{result.brand_impersonation}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Browsing Recommendation:</span>
                  <span className={`font-bold font-mono ${result.risk_score >= 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {result.risk_score >= 60 ? 'DO NOT VISIT' : 'SAFE DOMAIN'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="cyber-card p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[350px]">
              <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 border border-slate-800">
                <Link2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-300 text-sm">Awaiting URL Input</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Enter a website link on the left to analyze for domain typosquatting, deceptive brand claims, and SSL flaws.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
