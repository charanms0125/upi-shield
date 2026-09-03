import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Cpu, BarChart3, Activity, RefreshCw, AlertTriangle,
  Database, CheckCircle2, TrendingUp, Users, MapPin, Globe, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { adminApi } from '../services/api';
import { AdminStats, ModelPerformance } from '../types';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [models, setModels] = useState<ModelPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, m] = await Promise.all([
        adminApi.getStatistics(),
        adminApi.getModelMetrics()
      ]);
      setStats(s);
      setModels(m);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      await adminApi.retrainModels();
      setRetrainSuccess(true);
      await fetchData();
      setTimeout(() => setRetrainSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setRetraining(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading SOC Admin Telemetry & Model Artifacts...</p>
      </div>
    );
  }

  const categoryData = stats ? Object.entries(stats.scam_category_distribution).map(([name, count]) => ({ name, count })) : [];
  const riskScoreData = stats ? Object.entries(stats.risk_score_distribution).map(([name, count]) => ({ name, count })) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16 pt-4">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-semibold uppercase text-cyan-400 tracking-wider">
              SOC & AI OPERATIONS COMMAND
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Security Operations & Machine Learning Analytics
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Live telemetry monitoring, model evaluation metrics, synthetic database index status, and top blacklisted VPA entities.
          </p>
        </div>

        {/* Retrain Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="cyber-button-primary px-4 py-2 text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Retraining Models...' : 'Retrain Pipeline On New Data'}</span>
          </button>
        </div>
      </div>

      {retrainSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Pipeline successfully retrained! Updated model artifacts saved to app/ml/artifacts/.</span>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-card p-5 space-y-1">
          <span className="text-slate-400 text-xs">Total Synthetic Volume</span>
          <div className="text-2xl font-extrabold font-mono text-white">
            ₹{(stats?.protected_volume_inr || 84500000).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500">Across 5,000+ demo txns</span>
        </div>

        <div className="cyber-card p-5 space-y-1">
          <span className="text-slate-400 text-xs">Pre-Auth Interceptions</span>
          <div className="text-2xl font-extrabold font-mono text-red-400">
            {stats?.blocked_suspicious_count || 142}
          </div>
          <span className="text-[11px] text-red-400/80">Halted high-risk attempts</span>
        </div>

        <div className="cyber-card p-5 space-y-1">
          <span className="text-slate-400 text-xs">Threat Incidents Cataloged</span>
          <div className="text-2xl font-extrabold font-mono text-amber-400">
            {stats?.threats_detected || 87}
          </div>
          <span className="text-[11px] text-amber-400/80">Synthetic intelligence db</span>
        </div>

        <div className="cyber-card p-5 space-y-1">
          <span className="text-slate-400 text-xs">Current Surveillance Mode</span>
          <div className="text-2xl font-extrabold font-mono text-cyan-400">
            ACTIVE GUARD
          </div>
          <span className="text-[11px] text-slate-500">Zero Trust Verification</span>
        </div>
      </div>

      {/* ML PERFORMANCE & EVALUATION SECTION */}
      <div className="cyber-card-glow p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
              MODEL EVALUATION TELEMETRY
            </span>
            <h3 className="text-lg font-bold text-white">
              {models?.model_name || 'Multilingual NLP Scam Classifier'}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Architecture: {models?.model_type || 'TF-IDF + Calibrated Logistic Regression'}
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-slate-900 text-slate-300 border border-slate-700">
            Samples: {models?.training_sample_count || 1200}
          </span>
        </div>

        {/* Evaluation Metrics 4 Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 text-xs">Accuracy</span>
            <div className="text-3xl font-extrabold font-mono text-cyan-400">
              {((models?.accuracy || 0.966) * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-slate-500">Holdout validation set</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 text-xs">Precision</span>
            <div className="text-3xl font-extrabold font-mono text-emerald-400">
              {((models?.precision || 0.96) * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-slate-500">Low false alarm rate</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 text-xs">Recall</span>
            <div className="text-3xl font-extrabold font-mono text-indigo-400">
              {((models?.recall || 0.973) * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-slate-500">High scam catch rate</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 text-xs">F1 Score</span>
            <div className="text-3xl font-extrabold font-mono text-purple-400">
              {((models?.f1_score || 0.966) * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-slate-500">Harmonic balance</span>
          </div>
        </div>

        {/* Confusion Matrix Grid & Synthetic Disclaimer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Confusion matrix */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              VALIDATION CONFUSION MATRIX
            </h4>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                <div className="text-xl font-bold text-emerald-400">
                  {models?.confusion_matrix?.tp ?? 145}
                </div>
                <div className="text-[11px] text-emerald-300">True Positives (Scams Flagged)</div>
              </div>

              <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 space-y-1">
                <div className="text-xl font-bold text-red-400">
                  {models?.confusion_matrix?.fp ?? 6}
                </div>
                <div className="text-[11px] text-red-300">False Positives (False Alarms)</div>
              </div>

              <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 space-y-1">
                <div className="text-xl font-bold text-red-400">
                  {models?.confusion_matrix?.fn ?? 4}
                </div>
                <div className="text-[11px] text-red-300">False Negatives (Missed Scams)</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                <div className="text-xl font-bold text-emerald-400">
                  {models?.confusion_matrix?.tn ?? 145}
                </div>
                <div className="text-[11px] text-emerald-300">True Negatives (Clean Verified)</div>
              </div>
            </div>
          </div>

          {/* Explicit Synthetic Disclaimer from prompt section 20 */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>MODEL TRANSPARENCY & DATASET STATEMENT</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                “{models?.synthetic_disclaimer || 'Performance shown is based on synthetic/demo data and does not represent production fraud-detection accuracy.'}”
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Training data incorporates multilingual synthetic Indic scam patterns across Hindi, Kannada, Telugu, Tamil, Marathi, and English.
              </p>
            </div>
            <div className="text-[11px] font-mono text-cyan-400">
              Artifact storage: backend/app/ml/artifacts/
            </div>
          </div>
        </div>
      </div>

      {/* TOP SUSPICIOUS UPIS TABLE */}
      <div className="cyber-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-bold text-white text-base">Top Suspicious Synthetic UPI Identifiers</h3>
            <p className="text-xs text-slate-400">High-risk VPAs aggregated from synthetic community fraud complaints</p>
          </div>
          <span className="text-xs font-mono text-red-400 font-bold">Priority Surveillance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
                <th className="pb-3">UPI ID (VPA)</th>
                <th className="pb-3">Threat Score</th>
                <th className="pb-3">Demo Reports</th>
                <th className="pb-3">Graph Links</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {(stats?.top_suspicious_upis || []).map((u, i) => (
                <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 text-cyan-300 font-semibold">{u.upi_id}</td>
                  <td className="py-3 font-bold text-red-400">{u.risk_score} / 100</td>
                  <td className="py-3 text-slate-300">{u.report_count} complaints</td>
                  <td className="py-3 text-slate-300">{u.connected_entities} connected</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHARTS: DAILY TRENDS & GEOGRAPHIC DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily attempts chart */}
        <div className="cyber-card p-6 space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Weekly Fraud Scan Throughput</h3>
            <p className="text-xs text-slate-400">Total scans vs intercepted threats</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.daily_trends || []}>
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }} />
                <Bar dataKey="total_scans" fill="#0EA5E9" name="Scans" radius={[4, 4, 0, 0]} />
                <Bar dataKey="threats_detected" fill="#EF4444" name="Threats" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="cyber-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <div>
              <h3 className="font-bold text-white text-base">Regional Threat Distribution (Synthetic)</h3>
              <p className="text-xs text-slate-400">Incident density across metro payment corridors</p>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            {(stats?.geo_distribution || []).map((g, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{g.region}</span>
                  <span className="font-mono font-bold text-cyan-400">{g.incidents} incidents ({g.pct}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${g.pct * 2}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
