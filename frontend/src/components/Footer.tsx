import React from 'react';
import { ShieldCheck, PhoneCall, Globe, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#080C14] border-t border-slate-800/80 text-slate-400 text-xs py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* National Helpline Banner */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">
                Victim of Digital Financial Cyber Fraud? Call 1930
              </div>
              <p className="text-[11px] text-slate-400">
                National Cyber Crime Reporting Portal operated by Indian Cyber Crime Coordination Centre (I4C), MHA.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-button-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>cybercrime.gov.in</span>
            </a>
            <a
              href="tel:1930"
              className="cyber-button-danger py-1.5 px-3 text-xs font-bold"
            >
              Dial 1930
            </a>
          </div>
        </div>

        {/* Regulatory & Ethical Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-950/40 border border-amber-500/20 text-[11px] leading-relaxed text-slate-400 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>IMPORTANT COMPLIANCE & RESEARCH DEMONSTRATION NOTICE</span>
          </div>
          <p>
            <strong>UPI SHIELD</strong> is an AI-powered educational and experimental cybersecurity prototype.
            All simulated transactions, bank accounts, risk scores, and graph connections are generated using
            <strong> synthetic demo data</strong>. This system does NOT connect to live banking networks or execute real UPI debit/credit transfers.
          </p>
          <p>
            Risk scores (0–100) are probabilistic AI-assisted threat indicators based on statistical heuristics, NLP analysis, and synthetic graph models.
            They do NOT constitute definitive legal determinations or financial verdicts against any individual or UPI identifier.
          </p>
        </div>

        {/* Bottom Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px] pt-2 border-t border-slate-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <span>© 2026 UPI SHIELD • AI-Powered Payment Fraud Defense Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Built for Hackathon Prototype Demonstration</span>
            <span>•</span>
            <span>Zero Real Financial Integration</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
