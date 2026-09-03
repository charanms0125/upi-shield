import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, ShieldX } from 'lucide-react';
import { RiskCategory } from '../types';

interface RiskMeterProps {
  score: number;
  category?: RiskCategory;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  category,
  confidence,
  size = 'md',
  showLabel = true,
}) => {
  // Determine color and category
  let cat: RiskCategory = category || 'LOW';
  if (!category) {
    if (score >= 80) cat = 'CRITICAL';
    else if (score >= 60) cat = 'HIGH';
    else if (score >= 30) cat = 'SUSPICIOUS';
    else cat = 'LOW';
  }

  const config = {
    LOW: {
      color: '#10B981',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      label: 'LOW RISK',
      icon: ShieldCheck,
      emoji: '🟢'
    },
    SUSPICIOUS: {
      color: '#F59E0B',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      label: 'SUSPICIOUS',
      icon: AlertTriangle,
      emoji: '🟡'
    },
    HIGH: {
      color: '#F97316',
      bgGlow: 'rgba(249, 115, 22, 0.15)',
      badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      label: 'HIGH RISK',
      icon: ShieldAlert,
      emoji: '🟠'
    },
    CRITICAL: {
      color: '#EF4444',
      bgGlow: 'rgba(239, 68, 68, 0.2)',
      badgeBg: 'bg-red-500/15 text-red-400 border-red-500/30',
      label: 'CRITICAL RISK',
      icon: ShieldX,
      emoji: '🔴'
    }
  }[cat];

  const Icon = config.icon;

  const dimensions = {
    sm: { radius: 36, stroke: 6, sizePx: 88, text: 'text-xl', badge: 'text-xs' },
    md: { radius: 64, stroke: 10, sizePx: 160, text: 'text-3xl', badge: 'text-sm' },
    lg: { radius: 88, stroke: 12, sizePx: 216, text: 'text-5xl', badge: 'text-base' },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  // Score 0 to 100 clamped
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div
        className="relative flex items-center justify-center rounded-full transition-all duration-700"
        style={{
          width: dimensions.sizePx,
          height: dimensions.sizePx,
          boxShadow: `0 0 35px ${config.bgGlow}`
        }}
      >
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox={`0 0 ${dimensions.sizePx} ${dimensions.sizePx}`}
        >
          {/* Background Track */}
          <circle
            cx={dimensions.sizePx / 2}
            cy={dimensions.sizePx / 2}
            r={dimensions.radius}
            stroke="#1F2937"
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />
          {/* Progress Ring */}
          <circle
            cx={dimensions.sizePx / 2}
            cy={dimensions.sizePx / 2}
            r={dimensions.radius}
            stroke={config.color}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className={`font-mono font-bold tracking-tight text-white ${dimensions.text}`}>
            {Math.round(score)}
          </div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            / 100
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="mt-3 flex flex-col items-center gap-1.5">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-semibold ${config.badgeBg} ${dimensions.badge}`}>
            <span>{config.emoji}</span>
            <span>{config.label}</span>
          </div>
          {confidence !== undefined && (
            <span className="text-xs text-slate-400 font-mono">
              Confidence: {Math.round(confidence * 100)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};
