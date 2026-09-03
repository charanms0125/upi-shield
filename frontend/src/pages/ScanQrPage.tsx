import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  QrCode, Camera, Upload, AlertTriangle, ArrowRight, RefreshCw,
  CreditCard, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { analysisApi } from '../services/api';
import { QRAnalysisResponse } from '../types';
import { RiskMeter } from '../components/RiskMeter';
import { ExplainabilityCard } from '../components/ExplainabilityCard';
import { SimulatedPaymentModal } from '../components/SimulatedPaymentModal';

const SAMPLE_QRS = [
  {
    title: 'Phishing KYC Nodal QR (High Risk)',
    payload: 'upi://pay?pa=sbi.helpline.nodal@ybl&pn=SBI+Verification+Officer&am=10.00&cu=INR&tn=KYC+Reactivation+Fee',
    badge: 'Phishing QR'
  },
  {
    title: 'Fake Electricity Disconnection QR',
    payload: 'upi://pay?pa=electricity.bill.desk99@paytm&pn=BESCOM+Executive&am=1450.00&cu=INR&tn=Immediate+Power+Bill',
    badge: 'Bill Threat'
  },
  {
    title: 'Fake Refund Cashout QR',
    payload: 'upi://pay?pa=refund.desk.officer@okaxis&pn=PhonePe+Refund+Desk&am=4850.00&cu=INR&tn=Cashback+Disbursement',
    badge: 'Refund Trap'
  },
  {
    title: 'Swiggy Food Order QR (Verified Clean)',
    payload: 'upi://pay?pa=swiggy@icici&pn=Swiggy+Delivery&am=340.00&cu=INR&tn=Order+Split',
    badge: 'Verified Clean'
  }
];

export const ScanQrPage: React.FC = () => {
  const location = useLocation();
  const [qrInput, setQrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QRAnalysisResponse | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (location.state?.demoPayload?.qr_data) {
      setQrInput(location.state.demoPayload.qr_data);
      runQrAnalysis(location.state.demoPayload.qr_data);
    }
  }, [location.state]);

  const runQrAnalysis = async (payload: string) => {
    if (!payload.trim()) return;
    setLoading(true);
    try {
      const res = await analysisApi.analyzeQR(payload);
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
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono font-semibold uppercase text-indigo-400 tracking-wider">
            QR PAYLOAD INSPECTOR
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Deceptive UPI QR Code Scanner & Destination Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Extracts protocol parameters (<code className="text-cyan-400 font-mono">pa</code>, <code className="text-cyan-400 font-mono">pn</code>, <code className="text-cyan-400 font-mono">am</code>) from static and dynamic UPI QR codes.
          Prevents debit-request traps disguised as incoming refunds or cashback credits.
        </p>
      </div>

      {/* Preset Demo QRs */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          SAMPLE TEST QR PAYLOADS
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_QRS.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQrInput(sq.payload);
                runQrAnalysis(sq.payload);
              }}
              className="text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 transition-all text-xs group"
            >
              <div className="flex items-center justify-between font-semibold text-slate-200 group-hover:text-white">
                <span className="truncate">{sq.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                  {sq.badge}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 truncate mt-1">{sq.payload}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: QR Payload Input & Decoded fields */}
        <div className="lg:col-span-7 space-y-6">
          <div className="cyber-card p-6 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              UPI QR PAYLOAD OR URI STRING
            </label>

            <textarea
              rows={3}
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Paste UPI URI: upi://pay?pa=recipient@bank&pn=Merchant&am=500"
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Camera className="w-4 h-4 text-slate-500" />
                <span>Camera scan & upload simulated in demo mode</span>
              </div>
              <button
                onClick={() => runQrAnalysis(qrInput)}
                disabled={loading || !qrInput.trim()}
                className="cyber-button-primary px-6 py-2.5 text-xs font-bold w-full sm:w-auto"
              >
                {loading ? 'Decoding...' : 'DECODE & ANALYZE QR'}
              </button>
            </div>
          </div>

          {/* Decoded Parameters Card */}
          {result && result.is_valid_upi_qr && (
            <div className="cyber-card p-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-semibold text-white text-sm">DECODED PROTOCOL PARAMETERS</h3>
                <span className="text-xs font-mono text-emerald-400 font-medium">Valid UPI Payload</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-500 text-[11px] uppercase">Beneficiary Name (pn)</span>
                  <div className="font-bold text-slate-200">{result.payee_name || 'N/A'}</div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-500 text-[11px] uppercase">Destination VPA (pa)</span>
                  <div className="font-mono font-bold text-cyan-400">{result.payee_upi || 'N/A'}</div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-500 text-[11px] uppercase">Pre-set Amount (am)</span>
                  <div className="font-mono font-bold text-white text-base">
                    {result.amount !== null && result.amount !== undefined ? `₹${result.amount.toLocaleString('en-IN')}` : 'Open (Payer enters amount)'}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-500 text-[11px] uppercase">Transaction Note (tn / tr)</span>
                  <div className="font-medium text-slate-300">{result.transaction_ref || 'None'}</div>
                </div>
              </div>

              {/* Explainability reasons */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  IDENTIFIED DESTINATION SIGNALS
                </span>
                <div className="space-y-1.5">
                  {result.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Risk Assessment & Safe Payment Button */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="cyber-card p-6 space-y-6 animate-fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                DESTINATION RISK VERDICT
              </h3>

              <RiskMeter
                score={result.risk_score}
                category={result.category}
                size="lg"
              />

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                <div className="font-bold text-slate-200">SAFETY RECOMMENDATION</div>
                <p className="text-slate-400 leading-relaxed">{result.recommendation}</p>
              </div>

              <button
                onClick={() => setPaymentModalOpen(true)}
                className="w-full cyber-button-primary py-3 text-xs font-bold"
              >
                <CreditCard className="w-4 h-4" />
                <span>TEST IN PAYMENT SIMULATOR</span>
              </button>
            </div>
          ) : (
            <div className="cyber-card p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[350px]">
              <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 border border-slate-800">
                <QrCode className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-300 text-sm">No QR Loaded</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Paste a UPI QR payload on the left or select one of the presets to test.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulator Modal */}
      {result && (
        <SimulatedPaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          defaultRecipient={result.payee_name || 'Unknown Payee'}
          defaultUpiId={result.payee_upi || 'unknown@upi'}
          defaultAmount={result.amount || 500}
        />
      )}
    </div>
  );
};
