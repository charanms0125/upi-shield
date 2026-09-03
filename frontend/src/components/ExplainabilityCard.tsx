import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, ArrowRight, Activity, HelpCircle } from 'lucide-react';
import { RiskCategory } from '../types';

interface ExplainabilityCardProps {
  indicators: string[];
  featureContributions: Record<string, number>;
  recommendation: string;
  category: RiskCategory;
  scamType?: string;
}

export const ExplainabilityCard: React.FC<ExplainabilityCardProps> = ({
  indicators,
  featureContributions,
  recommendation,
  category,
  scamType,
}) => {
  const isDangerous = category === 'CRITICAL' || category === 'HIGH';

  return (
    <div className="cyber-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white tracking-wide text-base">
            EXPLAINABLE AI (XAI) BREAKDOWN
          </h3>
        </div>
        {scamType && (
          <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700">
            {scamType}
          </span>
        )}
      </div>

      {/* Why this was flagged */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span>WHY THIS WAS FLAGGED</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {indicators.map((indicator, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 p-3 rounded-lg text-xs leading-relaxed border ${
                isDangerous
                  ? 'bg-red-950/20 border-red-900/30 text-red-200'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-300'
              }`}
            >
              {isDangerous ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <span className="font-medium">{indicator}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Contributions Bars */}
      {Object.keys(featureContributions).length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>RISK SCORE CONTRIBUTION</span>
            <span className="text-[11px] text-slate-500 font-mono">Weighted Impact</span>
          </h4>
          <div className="space-y-2">
            {Object.entries(featureContributions).map(([feature, weight], idx) => {
              const absVal = Math.abs(weight);
              const maxVal = 40;
              const barPct = Math.min(Math.round((absVal / maxVal) * 100), 100);
              const isPositive = weight > 0;

              return (
                <div key={idx} className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
                  <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                    <span className="text-slate-300 font-sans">{feature}</span>
                    <span className={`font-mono font-semibold ${isPositive ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isPositive ? `+${weight.toFixed(0)}` : `${weight.toFixed(0)}`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isPositive ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended Action */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3.5 ${
          isDangerous
            ? 'bg-red-500/10 border-red-500/30 text-red-200'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
        }`}
      >
        <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${isDangerous ? 'text-red-400' : 'text-emerald-400'}`} />
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider">
            {isDangerous ? 'RECOMMENDED ACTION: DO NOT PROCEED' : 'VERIFIED SAFE GUIDANCE'}
          </div>
          <p className="text-xs leading-relaxed opacity-90 font-normal">
            {recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};
