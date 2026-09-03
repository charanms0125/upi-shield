import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Activity, Sliders, AlertTriangle, ShieldAlert, ShieldCheck,
  Clock, MapPin, Smartphone, UserPlus, RefreshCw, Cpu
} from 'lucide-react';
import { analysisApi } from '../services/api';
import { TransactionAnalysisResponse } from '../types';
import { RiskMeter } from '../components/RiskMeter';
import { ExplainabilityCard } from '../components/ExplainabilityCard';

export const TransactionAnalysisPage: React.FC = () => {
  const location = useLocation();

  // Inputs
  const [amount, setAmount] = useState(45000);
  const [timeStr, setTimeStr] = useState('03:15');
  const [recipientUpi, setRecipientUpi] = useState('rajesh123@upi');
  const [isNewRecipient, setIsNewRecipient] = useState(true);
  const [locationStr, setLocationStr] = useState('Kolkata, IN');
  const [deviceChanged, setDeviceChanged] = useState(true);
  const [frequencyToday, setFrequencyToday] = useState(8);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransactionAnalysisResponse | null>(null);

  useEffect(() => {
    if (location.state?.demoPayload) {
      const p = location.state.demoPayload;
      setAmount(p.amount || 45000);
      setTimeStr(p.time_str || '03:15');
      setRecipientUpi(p.recipient_upi || 'rajesh123@upi');
      setIsNewRecipient(p.is_new_recipient ?? true);
      setLocationStr(p.location || 'Kolkata, IN');
      setDeviceChanged(p.device_changed ?? true);
      setFrequencyToday(p.transaction_frequency_today || 8);
      runAnalysisWithValues({
        amount: p.amount || 45000,
        time_str: p.time_str || '03:15',
        recipient_upi: p.recipient_upi || 'rajesh123@upi',
        is_new_recipient: p.is_new_recipient ?? true,
        location: p.location || 'Kolkata, IN',
        device_changed: p.device_changed ?? true,
        transaction_frequency_today: p.transaction_frequency_today || 8
      });
    }
  }, [location.state]);

  const runAnalysisWithValues = async (params: any) => {
    setLoading(true);
    try {
      const res = await analysisApi.analyzeTransaction(params);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = () => {
    runAnalysisWithValues({
      amount: Number(amount),
      time_str: timeStr,
      recipient_upi: recipientUpi,
      is_new_recipient: isNewRecipient,
      location: locationStr,
      device_changed: deviceChanged,
      transaction_frequency_today: Number(frequencyToday)
    });
  };

  // Preset Buttons
  const setAnomalousScenario = () => {
    setAmount(45000);
    setTimeStr('03:15');
    setRecipientUpi('rajesh123@upi');
    setIsNewRecipient(true);
    setLocationStr('Kolkata, IN');
    setDeviceChanged(true);
    setFrequencyToday(8);
  };

  const setNormalScenario = () => {
    setAmount(450);
    setTimeStr('14:30');
    setRecipientUpi('swiggy@icici');
    setIsNewRecipient(false);
    setLocationStr('Bengaluru, IN');
    setDeviceChanged(false);
    setFrequencyToday(2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16 pt-4">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono font-semibold uppercase text-purple-400 tracking-wider">
            BEHAVIOURAL RISK ENGINE
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Transaction Anomaly Detector (Isolation Forest ML)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Compares live transfer parameters against habitual user baseline profiles.
          Detects value spikes, nocturnal transactions, recipient novelty, and anomalous device handshakes.
        </p>
      </div>

      {/* Preset Scenario Switcher */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          SIMULATION PRESETS:
        </span>
        <button
          onClick={setAnomalousScenario}
          className="cyber-button-danger px-3.5 py-1.5 text-xs font-semibold"
        >
          🚨 Load ₹45,000 Nocturnal Anomaly
        </button>
        <button
          onClick={setNormalScenario}
          className="cyber-button-secondary px-3.5 py-1.5 text-xs font-semibold"
        >
          🟢 Load Habitual ₹450 Daytime Baseline
        </button>
      </div>

      {/* Simulator Inputs & Dimensional Meters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="cyber-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>SIMULATED TRANSACTION PARAMETERS</span>
              </h3>
              <span className="text-xs font-mono text-cyan-400">User: Priya Sharma</span>
            </div>

            <div className="space-y-4">
              {/* Amount */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Transaction Amount (₹)</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">₹{amount.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="80000"
                  step="50"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>Habitual Avg: ₹450</span>
                  <span>Normal Limit: ₹3,000</span>
                  <span>Critical Spike: ₹45,000+</span>
                </div>
              </div>

              {/* Grid 2-col inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Time */}
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Time of Day</span>
                  </label>
                  <input
                    type="time"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-500">Normal profile: 08:00 to 22:00</span>
                </div>

                {/* Recipient */}
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                    <span>Recipient UPI VPA</span>
                  </label>
                  <input
                    type="text"
                    value={recipientUpi}
                    onChange={(e) => setRecipientUpi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Location</span>
                  </label>
                  <input
                    type="text"
                    value={locationStr}
                    onChange={(e) => setLocationStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-500">Habitual Home: Bengaluru, IN</span>
                </div>

                {/* Frequency Today */}
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1">
                    Daily Transactions Count
                  </label>
                  <input
                    type="number"
                    value={frequencyToday}
                    onChange={(e) => setFrequencyToday(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={isNewRecipient}
                    onChange={(e) => setIsNewRecipient(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-medium">First-Time Beneficiary</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={deviceChanged}
                    onChange={(e) => setDeviceChanged(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-medium">New / Unfamiliar Device</span>
                </label>
              </div>

              <button
                onClick={handleRun}
                disabled={loading}
                className="w-full cyber-button-primary py-3 text-xs font-bold mt-2"
              >
                {loading ? 'Evaluating Model...' : 'EVALUATE TRANSACTION RISK'}
              </button>
            </div>
          </div>

          {result && (
            <ExplainabilityCard
              indicators={result.indicators}
              featureContributions={result.feature_contributions}
              recommendation={result.recommendation}
              category={result.category}
              scamType="ISOLATION FOREST ANOMALY"
            />
          )}
        </div>

        {/* Right: Anomaly Dimensions Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="cyber-card p-6 space-y-6 animate-fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                OVERALL ANOMALY SCORE
              </h3>

              <RiskMeter
                score={result.risk_score}
                category={result.category}
                confidence={result.confidence}
                size="lg"
              />

              {/* Dimensional Anomaly Breakdown as in section 11 */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>DIMENSIONAL ANOMALY PROFILE</span>
                  <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    Isolation Forest
                  </span>
                </h4>

                <div className="space-y-2 text-xs">
                  {/* Amount anomaly */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Amount Anomaly:</span>
                      <span className="font-mono font-bold text-red-400">{result.amount_anomaly_pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${result.amount_anomaly_pct}%` }} />
                    </div>
                  </div>

                  {/* Time anomaly */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Time Anomaly:</span>
                      <span className="font-mono font-bold text-amber-400">{result.time_anomaly_pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${result.time_anomaly_pct}%` }} />
                    </div>
                  </div>

                  {/* New recipient novelty */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">New Recipient Novelty:</span>
                      <span className="font-mono font-bold text-orange-400">{result.recipient_novelty_pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${result.recipient_novelty_pct}%` }} />
                    </div>
                  </div>

                  {/* Location anomaly */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Location Anomaly:</span>
                      <span className="font-mono font-bold text-sky-400">{result.location_anomaly_pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${result.location_anomaly_pct}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="cyber-card p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[350px]">
              <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 border border-slate-800">
                <Activity className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-300 text-sm">Ready to Simulate</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Adjust amount or time on the left and click "Evaluate Transaction Risk" to trigger the Isolation Forest model.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
