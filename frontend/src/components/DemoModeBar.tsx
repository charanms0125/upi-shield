import React from 'react';
import { Play, Sparkles, X, ChevronRight } from 'lucide-react';
import { useDemo, DEMO_SCENARIOS } from '../context/DemoContext';

export const DemoModeBar: React.FC = () => {
  const { isDemoActive, activeScenario, activateScenario, clearDemo } = useDemo();

  return (
    <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 border-b border-cyan-500/30 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Judge Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>JUDGE DEMO MODE</span>
          </div>
          <span className="text-slate-400 hidden lg:inline">
            5-Minute Evaluation Quick-Run:
          </span>
        </div>

        {/* Center: 5 Scenarios */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {DEMO_SCENARIOS.map((sc, idx) => {
            const isSelected = activeScenario?.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => activateScenario(sc.id)}
                className={`px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-semibold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/70 hover:bg-slate-700 hover:text-white'
                }`}
                title={sc.description}
              >
                <span className="text-[10px] opacity-75">{idx + 1}.</span>
                <span>{sc.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Active Notice / Clear */}
        <div className="flex items-center gap-2 shrink-0">
          {isDemoActive ? (
            <button
              onClick={clearDemo}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px] px-2 py-0.5 rounded hover:bg-slate-800"
            >
              <X className="w-3 h-3" />
              <span>Reset Demo</span>
            </button>
          ) : (
            <span className="text-[11px] text-cyan-400/80 font-mono hidden sm:inline">
              Click any scenario to test
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
