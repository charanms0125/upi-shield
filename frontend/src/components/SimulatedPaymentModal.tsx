import React, { useState } from 'react';
import { X, ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { analysisApi } from '../services/api';
import { TransactionAnalysisResponse } from '../types';

interface SimulatedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipient?: string;
  defaultUpiId?: string;
  defaultAmount?: number;
}

export const SimulatedPaymentModal: React.FC<SimulatedPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultRecipient = 'Rajesh Kumar',
  defaultUpiId = 'rajesh123@upi',
  defaultAmount = 25000,
}) => {
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [upiId, setUpiId] = useState(defaultUpiId);
  const [amount, setAmount] = useState(defaultAmount);
  const [step, setStep] = useState<'INPUT' | 'CHECKING' | 'WARNING' | 'SUCCESS' | 'CANCELLED'>('INPUT');
  const [analysis, setAnalysis] = useState<TransactionAnalysisResponse | null>(null);

  if (!isOpen) return null;

  const handleInitiatePayment = async () => {
    setStep('CHECKING');
    try {
      const res = await analysisApi.analyzeTransaction({
        amount: Number(amount),
        time_str: '03:15',
        hour: 3,
        recipient_upi: upiId,
        recipient_name: recipient,
        is_new_recipient: true,
        location: 'Kolkata, IN',
        device_id: 'Unknown_Device_X9',
        device_changed: true,
        transaction_frequency_today: 6
      });
      setAnalysis(res);
      if (res.risk_score >= 60) {
        setStep('WARNING');
      } else {
        triggerSuccess();
      }
    } catch (e) {
      // Fallback
      setStep('WARNING');
    }
  };

  const triggerSuccess = () => {
    setStep('SUCCESS');
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        {/* Top Header Mockup */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-white text-sm">UPI SafePay Simulator</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="bg-cyan-950/40 border-b border-cyan-500/20 px-4 py-1.5 text-[11px] text-cyan-300 flex items-center justify-center gap-1.5">
          <span className="font-bold">SIMULATED / DEMO PAYMENT ENVIRONMENT</span>
          <span>(No real money involved)</span>
        </div>

        <div className="p-6">
          {/* STEP 1: PAYMENT INPUT FORM */}
          {step === 'INPUT' && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 mx-auto flex items-center justify-center text-xl font-bold text-white mb-2 shadow-lg shadow-cyan-500/20">
                  {recipient.charAt(0)}
                </div>
                <h3 className="font-semibold text-white text-base">{recipient}</h3>
                <p className="text-xs font-mono text-slate-400">{upiId}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Transaction Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-2xl font-bold font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Tip: Amounts above ₹10,000 trigger strict behavioral validation.</p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Debited from:</span>
                  <span className="font-medium text-slate-300">SBI Savings A/C ...4821</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Simulated Time:</span>
                  <span className="font-mono text-amber-400">03:15 AM (Nocturnal)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Beneficiary Status:</span>
                  <span className="text-orange-400 font-medium">First-time recipient</span>
                </div>
              </div>

              <button
                onClick={handleInitiatePayment}
                className="w-full cyber-button-primary py-3.5 text-sm font-semibold mt-2"
              >
                <span>TEST DEMO PAYMENT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: RUNNING AI CHECK */}
          {step === 'CHECKING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
              <div>
                <h4 className="font-semibold text-white text-base">Running UPI SHIELD Guardrails...</h4>
                <p className="text-xs text-slate-400 mt-1">Analyzing behavioural deviation & fraud network signals</p>
              </div>
            </div>
          )}

          {/* STEP 3: HIGH-RISK INTERCEPT WARNING */}
          {step === 'WARNING' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-red-400 text-lg tracking-wide">
                  🚨 PAYMENT SAFETY WARNING
                </h4>
                <p className="text-xs text-red-200/90 font-medium">
                  UPI SHIELD AI intercepted this transaction due to high fraud risk indicators.
                </p>
              </div>

              {/* Risk details */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Calculated Threat Score:</span>
                  <span className="text-sm font-mono font-bold text-red-400">
                    {analysis?.risk_score || 91} / 100 🔴 CRITICAL
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-300">Flagged Risk Reasons:</div>
                <ul className="text-xs space-y-1.5 text-slate-300">
                  <li className="flex items-center gap-2 text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>First-time recipient ({upiId})</span>
                  </li>
                  <li className="flex items-center gap-2 text-red-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span>Unusual high amount (₹{amount.toLocaleString('en-IN')})</span>
                  </li>
                  <li className="flex items-center gap-2 text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Nocturnal transaction time (03:15 AM)</span>
                  </li>
                  <li className="flex items-center gap-2 text-red-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span>Behavioural anomaly detected by Isolation Forest</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setStep('CANCELLED')}
                  className="w-full cyber-button-danger py-3 text-sm font-bold"
                >
                  [CANCEL PAYMENT] (Recommended)
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      window.location.href = '/transaction-analysis';
                    }}
                    className="cyber-button-secondary py-2 text-xs"
                  >
                    [REVIEW RISK]
                  </button>
                  <button
                    onClick={triggerSuccess}
                    className="cyber-button-secondary py-2 text-xs text-slate-400 hover:text-white"
                  >
                    [CONTINUE DEMO]
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="py-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Simulated Payment Completed</h4>
                <p className="text-xs text-slate-400 mt-1">₹{amount.toLocaleString('en-IN')} successfully sent to {recipient}</p>
                <p className="text-[11px] font-mono text-emerald-400 mt-2">Ref: UPI-SIM-{Math.floor(100000 + Math.random() * 900000)}</p>
              </div>
              <button onClick={onClose} className="cyber-button-primary px-8 mx-auto">
                Done
              </button>
            </div>
          )}

          {/* STEP 5: CANCELLED */}
          {step === 'CANCELLED' && (
            <div className="py-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-400 text-lg">Potential Fraud Prevented!</h4>
                <p className="text-xs text-slate-300 mt-1">You safely aborted a transaction with critical risk indicators.</p>
                <p className="text-xs text-slate-400 mt-1">Your ₹{amount.toLocaleString('en-IN')} remains secure in your account.</p>
              </div>
              <button onClick={onClose} className="cyber-button-primary px-8 mx-auto">
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
