import React, { useState } from 'react';
import {
  PhoneCall, ShieldAlert, AlertTriangle, FileText, CheckCircle2,
  Printer, Download, ArrowRight, ExternalLink, Info, Copy, Check
} from 'lucide-react';
import { reportsApi } from '../services/api';
import { FraudIncidentSummary } from '../types';

export const ReportFraudPage: React.FC = () => {
  const [lostMoney, setLostMoney] = useState<boolean | null>(true);

  // Form Fields
  const [reportedUpi, setReportedUpi] = useState('sbi.helpline.nodal@ybl');
  const [amountLost, setAmountLost] = useState(25000);
  const [transactionRef, setTransactionRef] = useState('TXN-4920194819');
  const [reportedPhone, setReportedPhone] = useState('+91 98765 43210');
  const [scamType, setScamType] = useState('KYC Phishing');
  const [description, setDescription] = useState('Received fake SMS threatening account suspension within 24h. Followed instructions to verify KYC and authorized transfer.');
  const [screenshotName, setScreenshotName] = useState('screenshot_evidence.png');

  const [loading, setLoading] = useState(false);
  const [incidentSummary, setIncidentSummary] = useState<FraudIncidentSummary | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const summary = await reportsApi.submitReport({
        reported_upi: reportedUpi,
        reported_phone: reportedPhone,
        transaction_ref: transactionRef,
        amount_lost: Number(amountLost),
        scam_type: scamType,
        description: description,
        screenshot_name: screenshotName
      });
      setIncidentSummary(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!incidentSummary) return;
    const text = `FRAUD INCIDENT SUMMARY
Incident ID: ${incidentSummary.incident_id}
Amount Lost: ₹${incidentSummary.amount_lost.toLocaleString('en-IN')}
Reported UPI: ${incidentSummary.reported_upi}
Transaction Ref: ${incidentSummary.transaction_ref}
Scam Type: ${incidentSummary.scam_type}
Date: ${incidentSummary.created_at}
Helpline: Call 1930 immediately
Portal: https://cybercrime.gov.in`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16 pt-4">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
            <PhoneCall className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono font-semibold uppercase text-red-400 tracking-wider">
            1930 EMERGENCY RESPONSE WORKFLOW
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Financial Cyber Fraud Emergency Response & Incident Intake
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          National Cyber Crime Reporting guidance. Rapid incident summary generator formatted for official
          complaints to banks, NPCI, and the Ministry of Home Affairs 1930 cyber-fraud helpline.
        </p>
      </div>

      {/* Initial Filter Question */}
      <div className="cyber-card p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          CRITICAL TRIAGE QUESTION:
        </h2>
        <p className="text-base font-medium text-slate-200">
          Have you already authorized a transaction or lost money to a suspected scammer?
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={() => { setLostMoney(true); setIncidentSummary(null); }}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              lostMoney === true
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>YES — Money Has Been Debited</span>
          </button>
          <button
            onClick={() => { setLostMoney(false); setIncidentSummary(null); }}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              lostMoney === false
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>NO — I Suspended / Blocked It In Time</span>
          </button>
        </div>
      </div>

      {/* IF NO MONEY LOST */}
      {lostMoney === false && (
        <div className="cyber-card p-6 space-y-4 animate-fade-in border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Great job avoiding financial loss!</h3>
              <p className="text-xs text-slate-400">Follow these proactive prevention protocols to stay secure:</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200">1. Block & Report Contact</span>
              <p className="text-slate-400 text-[11px]">Block the sender's phone number and report spam on WhatsApp or your SMS client.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200">2. Rotate UPI PIN</span>
              <p className="text-slate-400 text-[11px]">If you entered your UPI PIN on any third-party link or form, change it immediately in your official bank app.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200">3. Check App Permissions</span>
              <p className="text-slate-400 text-[11px]">Ensure no remote desktop applications (e.g. AnyDesk, TeamViewer) were installed on your smartphone.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200">4. Report Suspicious VPA</span>
              <p className="text-slate-400 text-[11px]">Use our "Check UPI" scanner to contribute this identifier to community threat telemetry.</p>
            </div>
          </div>
        </div>
      )}

      {/* IF MONEY LOST: EMERGENCY INTAKE FORM */}
      {lostMoney === true && !incidentSummary && (
        <form onSubmit={handleSubmit} className="cyber-card p-6 sm:p-8 space-y-6 animate-fade-in">
          {/* Urgent Banner */}
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <span className="font-bold text-red-300 text-sm">GOLDEN HOUR IMMEDIATE ACTION: CALL 1930</span>
                <p className="text-red-200/80 text-[11px] mt-0.5">
                  Reporting within 2-3 hours enables law enforcement to freeze funds across downstream bank accounts.
                </p>
              </div>
            </div>
            <a href="tel:1930" className="cyber-button-danger py-2 px-4 text-xs font-bold shrink-0">
              Call 1930 Now
            </a>
          </div>

          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
            LOG FRAUD INCIDENT DETAILS (SYNTHETIC DEMO)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium mb-1 block">Fraudulent / Recipient UPI ID</label>
              <input
                type="text"
                value={reportedUpi}
                onChange={(e) => setReportedUpi(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 font-mono text-white focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium mb-1 block">Amount Defrauded (₹)</label>
              <input
                type="number"
                value={amountLost}
                onChange={(e) => setAmountLost(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 font-mono font-bold text-white focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium mb-1 block">Transaction Reference / UTR Number</label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 font-mono text-white focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium mb-1 block">Scammer Phone / WhatsApp Number</label>
              <input
                type="text"
                value={reportedPhone}
                onChange={(e) => setReportedPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 font-mono text-white focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium mb-1 block">Scam Modus Operandi / Category</label>
              <select
                value={scamType}
                onChange={(e) => setScamType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:border-red-500"
              >
                <option value="KYC Phishing">KYC Phishing / Bank Account Closure Threat</option>
                <option value="Electricity Bill Scam">Electricity Bill Disconnection Threat</option>
                <option value="Fake Refund / Reward">Fake Refund / Reverse Payment Request</option>
                <option value="AnyDesk / Customer Care">Customer Care Remote Access (AnyDesk/TeamViewer)</option>
                <option value="Work From Home / Task">Work From Home / Telegram Task Scam</option>
                <option value="Police / Digital Arrest">Police / CBI Digital Arrest Extortion</option>
                <option value="Malicious QR Code">Deceptive Merchant QR Payment Code</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-medium mb-1 block">Screenshot Evidence Filename</label>
              <input
                type="text"
                value={screenshotName}
                onChange={(e) => setScreenshotName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-xs font-medium mb-1 block">Incident Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-red-500 leading-relaxed font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cyber-button-danger py-3.5 text-sm font-bold shadow-lg shadow-red-600/30"
          >
            {loading ? 'Compiling Incident Dossier...' : 'GENERATE FRAUD INCIDENT SUMMARY & 1930 BRIEF'}
          </button>
        </form>
      )}

      {/* GENERATED FRAUD INCIDENT SUMMARY */}
      {incidentSummary && (
        <div className="cyber-card p-6 sm:p-8 space-y-6 animate-fade-in border-red-500/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-red-400 font-bold tracking-wider uppercase">
                OFFICIAL INCIDENT DOSSIER
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Incident ID: {incidentSummary.incident_id}
              </h2>
              <p className="text-xs text-slate-400">Generated on {incidentSummary.created_at}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="cyber-button-secondary py-1.5 px-3 text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Brief'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="cyber-button-secondary py-1.5 px-3 text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dossier</span>
              </button>
            </div>
          </div>

          {/* Key Facts Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[11px] uppercase font-mono">Amount Defrauded</span>
              <div className="text-lg font-bold font-mono text-red-400">
                ₹{incidentSummary.amount_lost.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[11px] uppercase font-mono">Reported Beneficiary</span>
              <div className="font-bold font-mono text-cyan-400 truncate">
                {incidentSummary.reported_upi}
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[11px] uppercase font-mono">Modus Operandi</span>
              <div className="font-bold text-white truncate">
                {incidentSummary.scam_type}
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[11px] uppercase font-mono">Threat Severity</span>
              <div className="font-bold text-red-400 font-mono">
                🔴 {incidentSummary.risk_category}
              </div>
            </div>
          </div>

          {/* Official 1930 Advisory Card */}
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-xs space-y-2">
            <div className="font-bold text-red-300 flex items-center gap-1.5 text-sm">
              <PhoneCall className="w-4 h-4 text-red-400" />
              <span>OFFICIAL NATIONAL CYBERCRIME HELPLINE (1930) ADVISORY</span>
            </div>
            <p className="text-red-200/90 leading-relaxed font-normal">
              {incidentSummary.official_1930_advisory}
            </p>
          </div>

          {/* Recommended Immediate Steps Checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              MANDATORY IMMEDIATE PROTOCOLS
            </h4>
            <div className="space-y-2 text-xs">
              {incidentSummary.recommended_immediate_steps.map((step, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Portal Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-button-primary flex-1 py-3 text-xs font-bold"
            >
              <span>Submit Formally on cybercrime.gov.in</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => { setIncidentSummary(null); }}
              className="cyber-button-secondary py-3 px-6 text-xs font-semibold"
            >
              File Another Demo Incident
            </button>
          </div>

          <div className="text-[11px] text-slate-500 text-center font-mono">
            * UPI SHIELD prepares official summaries. In accordance with safety standards, complaints are not automatically submitted to government databases without authorized police API integration.
          </div>
        </div>
      )}
    </div>
  );
};
