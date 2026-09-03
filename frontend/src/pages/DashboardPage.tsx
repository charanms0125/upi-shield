import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, MessageSquareWarning,
  QrCode, Search, Link2, Activity, PhoneCall, ArrowUpRight,
  TrendingUp, CheckCircle2, ShieldX, Clock, Filter
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { dashboardApi } from '../services/api';
import { RiskMeter } from '../components/RiskMeter';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dash, alertFeed] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getAlerts()
        ]);
        setData(dash);
        setAlerts(alertFeed);
      } catch (e) {
        console.error("Dashboard data load error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Security Operations Center telemetry...</p>
      </div>
    );
  }

  const quickActions = [
    { to: '/analyze-message', label: 'Analyze Message', icon: MessageSquareWarning, color: 'text-cyan-400', bg: 'hover:border-cyan-500/50' },
    { to: '/scan-qr', label: 'Scan QR', icon: QrCode, color: 'text-indigo-400', bg: 'hover:border-indigo-500/50' },
    { to: '/check-upi', label: 'Check UPI ID', icon: Search, color: 'text-amber-400', bg: 'hover:border-amber-500/50' },
    { to: '/check-url', label: 'Check URL', icon: Link2, color: 'text-sky-400', bg: 'hover:border-sky-500/50' },
    { to: '/transaction-analysis', label: 'Analyze Transaction', icon: Activity, color: 'text-purple-400', bg: 'hover:border-purple-500/50' },
    { to: '/report-fraud', label: 'I Lost Money', icon: PhoneCall, color: 'text-red-400', bg: 'hover:border-red-500/50', emergency: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-12 pt-4">
      {/* Header Banner */}
      <div className="cyber-card-glow p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM SHIELD ACTIVE
            </span>
            <span className="text-xs text-slate-400 font-mono">DEMO TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            UPI SHIELD Security Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            AI-powered protection against digital payment fraud across messaging, web, QR, and transaction layers.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 shrink-0">
          <RiskMeter score={data?.system_risk_score || 14.5} size="sm" showLabel={false} />
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Active System Threat</span>
            <div className="font-extrabold text-lg text-emerald-400">LOW THREAT LEVEL</div>
            <span className="text-[11px] text-slate-500 font-mono">AI Guardrails Operating Normal</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
          <span>RAPID THREAT SCANNERS</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.to}
                to={act.to}
                className={`cyber-card p-4 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.02] ${act.bg} ${
                  act.emergency ? 'bg-red-950/20 border-red-900/40' : ''
                }`}
              >
                <div className={`p-2.5 rounded-xl bg-slate-900/90 ${act.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-semibold ${act.emergency ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                  {act.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4 KEY METRICS STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-card p-5 space-y-2">
          <span className="text-xs font-medium text-slate-400">Transactions Protected</span>
          <div className="text-3xl font-extrabold font-mono text-white">
            {data?.protected_transactions?.toLocaleString('en-IN') || '1,284'}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>+12% volume today</span>
          </div>
        </div>

        <div className="cyber-card p-5 space-y-2">
          <span className="text-xs font-medium text-slate-400">Threats Detected</span>
          <div className="text-3xl font-extrabold font-mono text-amber-400">
            {data?.threats_detected || '47'}
          </div>
          <div className="text-[11px] text-slate-500">
            Flagged across 12 fraud patterns
          </div>
        </div>

        <div className="cyber-card p-5 space-y-2">
          <span className="text-xs font-medium text-slate-400">Blocked / Suspicious</span>
          <div className="text-3xl font-extrabold font-mono text-red-400">
            {data?.blocked_suspicious || '18'}
          </div>
          <div className="text-[11px] text-red-400/80 font-medium">
            Pre-payment interceptions
          </div>
        </div>

        <div className="cyber-card p-5 space-y-2">
          <span className="text-xs font-medium text-slate-400">Scans Performed</span>
          <div className="text-3xl font-extrabold font-mono text-cyan-400">
            {data?.scans_performed || '538'}
          </div>
          <div className="text-[11px] text-slate-500">
            Across messages, QR & URLs
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Fraud Telemetry Over Time */}
        <div className="cyber-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Fraud Scans & Threat Volume</h3>
              <p className="text-xs text-slate-400">Daily synthetic scan throughput vs detected threat surges</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">Last 7 Days</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.charts?.fraud_over_time || []}>
                <defs>
                  <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="scans" stroke="#0EA5E9" fillOpacity={1} fill="url(#scansGrad)" name="Total Scans" />
                <Area type="monotone" dataKey="threats" stroke="#EF4444" fillOpacity={1} fill="url(#threatGrad)" name="Threats Flagged" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Scam Category Breakdown */}
        <div className="cyber-card p-6 space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Scam Categories</h3>
            <p className="text-xs text-slate-400">Distribution of detected fraud schemes</p>
          </div>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.charts?.scam_categories || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(data?.charts?.scam_categories || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                  itemStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-xs">
            {(data?.charts?.scam_categories || []).map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span>{c.name}</span>
                </div>
                <span className="font-mono font-medium">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TWO COLUMNS: LIVE ALERT FEED & RECENT SIMULATED TXNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Alerts */}
        <div className="cyber-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Live Threat Telemetry Feed</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Real-Time Alerts</span>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 4).map((alert: any) => {
              const severityStyles = {
                CRITICAL: 'bg-red-950/25 border-red-900/40 text-red-300',
                HIGH: 'bg-orange-950/25 border-orange-900/40 text-orange-300',
                MEDIUM: 'bg-amber-950/25 border-amber-900/40 text-amber-300',
                LOW: 'bg-emerald-950/25 border-emerald-900/40 text-emerald-300',
              }[alert.severity as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'] || 'bg-slate-900 border-slate-800 text-slate-300';

              return (
                <div key={alert.id} className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${severityStyles}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{alert.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="opacity-90 leading-relaxed">{alert.description}</p>
                  {alert.related_entity && (
                    <div className="text-[11px] font-mono opacity-75">
                      Entity: {alert.related_entity}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Simulated Transactions */}
        <div className="cyber-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Recent Simulated Transactions</h3>
            </div>
            <Link to="/transaction-analysis" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              <span>Simulator</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {(data?.recent_transactions || []).map((t: any, idx: number) => {
              const isDanger = t.status === 'BLOCKED' || t.status === 'FLAGGED';
              return (
                <div
                  key={idx}
                  className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-mono font-medium text-slate-300 flex items-center gap-2">
                      <span>{t.recipient}</span>
                      {isDanger && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-semibold border border-red-500/30">
                          ANOMALY
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {t.time} • {t.ref}
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="font-mono font-bold text-white">
                      ₹{t.amount?.toLocaleString('en-IN')}
                    </div>
                    <div className={`font-mono text-[11px] font-semibold ${isDanger ? 'text-red-400' : 'text-emerald-400'}`}>
                      {t.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
