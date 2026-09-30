import {
  Alert, FraudNetworkData, AdminStats, ModelPerformance, FraudIncidentSummary
} from '../types';

export const clientData = {
  getDashboardSummary: () => ({
    status: 'SECURED',
    risk_level: 'LOW',
    system_risk_score: 14.5,
    protected_transactions: 5000,
    threats_detected: 87,
    blocked_suspicious: 142,
    scans_performed: 1890,
    protected_volume_inr: 84500000.0,
    charts: {
      fraud_over_time: [
        { date: '25 Sep', scans: 74, threats: 8, blocked: 3 },
        { date: '26 Sep', scans: 92, threats: 12, blocked: 5 },
        { date: '27 Sep', scans: 88, threats: 9, blocked: 4 },
        { date: '28 Sep', scans: 115, threats: 15, blocked: 6 },
        { date: '29 Sep', scans: 130, threats: 19, blocked: 8 },
        { date: '30 Sep', scans: 142, threats: 22, blocked: 9 },
        { date: '01 Oct', scans: 98, threats: 14, blocked: 5 },
      ],
      scam_categories: [
        { name: 'KYC Phishing', value: 38, color: '#EF4444' },
        { name: 'Electricity Bill', value: 22, color: '#F97316' },
        { name: 'Fake Refund', value: 18, color: '#F59E0B' },
        { name: 'Police Impersonation', value: 12, color: '#8B5CF6' },
        { name: 'Telegram / Job', value: 10, color: '#3B82F6' },
      ],
      risk_distribution: [
        { level: 'Low (0-29)', count: 412, color: '#10B981' },
        { level: 'Suspicious (30-59)', count: 79, color: '#F59E0B' },
        { level: 'High (60-79)', count: 31, color: '#F97316' },
        { level: 'Critical (80-100)', count: 16, color: '#EF4444' }
      ]
    },
    recent_transactions: [
      { ref: 'UPI-TXN-849201', sender: 'user@upishield.demo', recipient: 'rajesh123@upi', amount: 25000.0, time: '03:15 AM', status: 'FLAGGED', risk_score: 91.0, category: 'CRITICAL' },
      { ref: 'UPI-TXN-849202', sender: 'user@upishield.demo', recipient: 'swiggy@icici', amount: 340.0, time: '08:45 PM', status: 'COMPLETED', risk_score: 5.0, category: 'LOW' },
      { ref: 'UPI-TXN-849203', sender: 'user@upishield.demo', recipient: 'sbi.helpline.nodal@ybl', amount: 10.0, time: '11:20 AM', status: 'BLOCKED', risk_score: 94.0, category: 'CRITICAL' },
      { ref: 'UPI-TXN-849204', sender: 'user@upishield.demo', recipient: 'dmart.retail@hdfcbank', amount: 1280.0, time: '04:10 PM', status: 'COMPLETED', risk_score: 8.0, category: 'LOW' },
      { ref: 'UPI-TXN-849205', sender: 'user@upishield.demo', recipient: 'quick.refund.desk@ybl', amount: 4850.0, time: '02:40 PM', status: 'BLOCKED', risk_score: 88.0, category: 'CRITICAL' },
    ]
  }),

  getAlerts: (): Alert[] => [
    {
      id: 1,
      severity: 'CRITICAL',
      title: 'Fake KYC Phishing Surge',
      description: 'High frequency of SMS targeting SBI YONO users requesting ₹10 verification fee.',
      related_entity: 'sbi.helpline.nodal@ybl',
      timestamp: new Date(Date.now() - 14 * 60000).toISOString()
    },
    {
      id: 2,
      severity: 'HIGH',
      title: 'Suspicious VPA Active in Electricity Scams',
      description: 'Identified fake BESCOM/MSEDCL officer demanding urgent UPI settlement under threat of power cutoff.',
      related_entity: 'electricity.bill.desk99@paytm',
      timestamp: new Date(Date.now() - 60 * 60000).toISOString()
    },
    {
      id: 3,
      severity: 'MEDIUM',
      title: 'Unknown Recipient Nocturnal Transaction Intercepted',
      description: '₹45,000 transfer attempted at 03:15 AM flagged for stepping-up biometric verification.',
      related_entity: 'rajesh123@upi',
      timestamp: new Date(Date.now() - 180 * 60000).toISOString()
    },
    {
      id: 4,
      severity: 'LOW',
      title: 'Legitimate Merchant Whitelist Updated',
      description: 'Added verified status for 14 leading retail merchant payment gateways.',
      related_entity: 'NPCI-Gateway',
      timestamp: new Date(Date.now() - 480 * 60000).toISOString()
    }
  ],

  getScams: () => [
    { id: 'kyc', title: 'KYC Phishing', severity: 'CRITICAL', description: 'Messages claiming bank account closure unless KYC is completed with immediate token payment.' },
    { id: 'refund', title: 'Fake Refund / Cashback', severity: 'HIGH', description: 'Lures user with reward/cashback link prompting to enter UPI PIN to receive money.' },
    { id: 'electricity', title: 'Electricity Bill Threat', severity: 'HIGH', description: 'Threatens immediate power disconnect at 9:30 PM unless a contact person is paid via UPI.' },
    { id: 'support', title: 'Fake Customer Care / AnyDesk', severity: 'CRITICAL', description: 'Fraudsters impersonating bank/GPay support asking to install remote control apps.' },
    { id: 'investment', title: 'Telegram / Part-Time Job', severity: 'HIGH', description: 'Promises high daily earnings for rating videos or crypto bots after paying initial deposit.' },
    { id: 'police', title: 'Police / Legal Impersonation', severity: 'CRITICAL', description: 'Fake arrest warrants or illegal parcel claims demanding bail transfer to avoid detention.' },
    { id: 'qr', title: 'Malicious QR Code', severity: 'HIGH', description: 'Deceptive QR codes programmed to request debit transfers instead of receiving money.' }
  ],

  getFraudNetwork: (): FraudNetworkData => ({
    total_nodes: 12,
    total_edges: 18,
    suspicious_clusters_count: 3,
    nodes: [
      { id: 'VICTIM-101', label: 'Victim A (Priya S.)', type: 'USER', risk_score: 15.0, risk_category: 'LOW', report_count: 1 },
      { id: 'VICTIM-102', label: 'Victim B (Ramesh K.)', type: 'USER', risk_score: 18.0, risk_category: 'LOW', report_count: 1 },
      { id: 'VICTIM-103', label: 'Victim C (Anjali N.)', type: 'USER', risk_score: 20.0, risk_category: 'LOW', report_count: 1 },
      { id: 'sbi.helpline.nodal@ybl', label: 'Mule VPA 1 (SBI Phish)', type: 'UPI', risk_score: 94.0, risk_category: 'CRITICAL', report_count: 18 },
      { id: 'refund.desk.officer@okaxis', label: 'Mule VPA 2 (PhonePe Phish)', type: 'UPI', risk_score: 92.0, risk_category: 'CRITICAL', report_count: 15 },
      { id: 'electricity.bill.desk99@paytm', label: 'Mule VPA 3 (BESCOM Phish)', type: 'UPI', risk_score: 89.0, risk_category: 'CRITICAL', report_count: 11 },
      { id: 'telegram.earn.money77@ybl', label: 'Mule VPA 4 (Task Scam)', type: 'UPI', risk_score: 87.0, risk_category: 'HIGH', report_count: 8 },
      { id: 'ACC-MULE-491', label: 'Primary Mule Account', type: 'ACCOUNT', risk_score: 96.0, risk_category: 'CRITICAL', report_count: 24 },
      { id: 'ACC-MULE-824', label: 'Secondary Mule Account', type: 'ACCOUNT', risk_score: 93.0, risk_category: 'CRITICAL', report_count: 16 },
      { id: 'ACC-CASHOUT-99', label: 'Offshore Cashout Node', type: 'ACCOUNT', risk_score: 99.0, risk_category: 'CRITICAL', report_count: 38 },
      { id: '+919876543210', label: 'Burner SIM 1 (Caller)', type: 'PHONE', risk_score: 91.0, risk_category: 'CRITICAL', report_count: 12 },
      { id: '+919988776655', label: 'Burner SIM 2 (SMS Spoofer)', type: 'PHONE', risk_score: 88.0, risk_category: 'HIGH', report_count: 9 }
    ],
    edges: [
      { source: 'VICTIM-101', target: 'sbi.helpline.nodal@ybl', relation: 'TRANSFERRED_₹25000', risk_weight: 0.95 },
      { source: 'VICTIM-102', target: 'refund.desk.officer@okaxis', relation: 'TRANSFERRED_₹4850', risk_weight: 0.92 },
      { source: 'VICTIM-103', target: 'electricity.bill.desk99@paytm', relation: 'TRANSFERRED_₹1450', risk_weight: 0.89 },
      { source: 'sbi.helpline.nodal@ybl', target: 'ACC-MULE-491', relation: 'LAYERED_FUNDS', risk_weight: 0.98 },
      { source: 'refund.desk.officer@okaxis', target: 'ACC-MULE-491', relation: 'LAYERED_FUNDS', risk_weight: 0.96 },
      { source: 'electricity.bill.desk99@paytm', target: 'ACC-MULE-824', relation: 'LAYERED_FUNDS', risk_weight: 0.94 },
      { source: 'telegram.earn.money77@ybl', target: 'ACC-MULE-824', relation: 'LAYERED_FUNDS', risk_weight: 0.91 },
      { source: 'ACC-MULE-491', target: 'ACC-CASHOUT-99', relation: 'RAPID_CASHOUT', risk_weight: 0.99 },
      { source: 'ACC-MULE-824', target: 'ACC-CASHOUT-99', relation: 'RAPID_CASHOUT', risk_weight: 0.99 },
      { source: '+919876543210', target: 'electricity.bill.desk99@paytm', relation: 'LINKED_CONTACT', risk_weight: 0.88 },
      { source: '+919988776655', target: 'sbi.helpline.nodal@ybl', relation: 'LINKED_CONTACT', risk_weight: 0.89 }
    ]
  }),

  getNodeDetails: (nodeId: string) => {
    return {
      node_id: nodeId,
      centrality_score: 0.88,
      pagerank_score: 0.142,
      risk_label: 'HIGH_RISK_SYNDICATE_MEMBER',
      risk_score: 94.0,
      report_count: 18,
      total_inflow_inr: 845000.0,
      total_outflow_inr: 832000.0,
      connected_entities: [
        { id: 'ACC-MULE-491', type: 'ACCOUNT', relation: 'LAYERED_FUNDS' },
        { id: '+919988776655', type: 'PHONE', relation: 'LINKED_CONTACT' },
        { id: 'VICTIM-101', type: 'USER', relation: 'EXTORTION_TARGET' }
      ]
    };
  },

  getAdminStatistics: (): AdminStats => ({
    total_transactions_protected: 5280,
    scans_performed: 1890,
    threats_detected: 87,
    blocked_suspicious_count: 142,
    protected_volume_inr: 84500000.0,
    active_risk_level: 'MONITORED (ELEVATED)',
    scam_category_distribution: {
      'KYC Phishing': 44,
      'Electricity Threat': 26,
      'Fake Refund': 22,
      'Police Impersonation': 15,
      'Job/Telegram Scam': 12,
      'QR Scam': 9
    },
    risk_score_distribution: {
      'Low (0-29)': 1420,
      'Suspicious (30-59)': 280,
      'High (60-79)': 124,
      'Critical (80-100)': 66
    },
    daily_trends: [
      { date: 'Mon', total_scans: 120, threats_detected: 16, blocked_count: 6 },
      { date: 'Tue', total_scans: 145, threats_detected: 22, blocked_count: 8 },
      { date: 'Wed', total_scans: 180, threats_detected: 28, blocked_count: 11 },
      { date: 'Thu', total_scans: 190, threats_detected: 31, blocked_count: 14 },
      { date: 'Fri', total_scans: 230, threats_detected: 39, blocked_count: 17 },
      { date: 'Sat', total_scans: 210, threats_detected: 34, blocked_count: 15 },
      { date: 'Sun', total_scans: 175, threats_detected: 25, blocked_count: 9 }
    ],
    top_suspicious_upis: [
      { upi_id: 'sbi.helpline.nodal@ybl', risk_score: 94.0, report_count: 18, connected_entities: 8, status: 'HIGH_RISK' },
      { upi_id: 'refund.desk.officer@okaxis', risk_score: 92.0, report_count: 15, connected_entities: 7, status: 'HIGH_RISK' },
      { upi_id: 'hdfc.kyc.verification@oksbi', risk_score: 91.0, report_count: 14, connected_entities: 6, status: 'HIGH_RISK' },
      { upi_id: 'electricity.bill.desk99@paytm', risk_score: 89.0, report_count: 11, connected_entities: 5, status: 'HIGH_RISK' },
      { upi_id: 'support-example123@upi', risk_score: 87.0, report_count: 14, connected_entities: 8, status: 'SUSPICIOUS' },
      { upi_id: 'telegram.earn.money77@ybl', risk_score: 87.0, report_count: 8, connected_entities: 4, status: 'SUSPICIOUS' },
      { upi_id: 'cbi.cyber.fine.settlement@axl', risk_score: 95.0, report_count: 9, connected_entities: 4, status: 'HIGH_RISK' }
    ],
    geo_distribution: [
      { region: 'Maharashtra (Mumbai/Pune)', incidents: 42, pct: 28 },
      { region: 'Karnataka (Bengaluru)', incidents: 36, pct: 24 },
      { region: 'Delhi NCR', incidents: 29, pct: 19 },
      { region: 'Telangana (Hyderabad)', incidents: 21, pct: 14 },
      { region: 'Tamil Nadu (Chennai)', incidents: 14, pct: 9 },
      { region: 'Other Regions', incidents: 9, pct: 6 }
    ]
  }),

  getModelPerformance: (): ModelPerformance => ({
    model_name: 'Indic & English Multilingual Scam NLP Classifier',
    model_type: 'TF-IDF (1-3 ngrams) + Calibrated Logistic Regression',
    accuracy: 0.9667,
    precision: 0.9600,
    recall: 0.9730,
    f1_score: 0.9664,
    confusion_matrix: {
      tn: 145,
      fp: 6,
      fn: 4,
      tp: 145
    },
    training_sample_count: 1200,
    synthetic_disclaimer: 'Performance shown is based on synthetic/demo data and does not represent production fraud-detection accuracy.'
  }),

  submitReport: (reportData: any): FraudIncidentSummary => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const incident_id = `UPI-2026-${randomNum}`;
    const risk_cat = reportData.amount_lost > 5000 ? 'CRITICAL' : 'HIGH';

    return {
      incident_id,
      amount_lost: reportData.amount_lost,
      reported_upi: reportData.reported_upi,
      reported_phone: reportData.reported_phone,
      transaction_ref: reportData.transaction_ref || `REF-${randomNum}`,
      scam_type: reportData.scam_type,
      risk_category: risk_cat,
      description: reportData.description,
      created_at: new Date().toISOString(),
      official_1930_advisory: 'Dial 1930 immediately (National Cyber Crime Reporting Helpline operated by I4C, Ministry of Home Affairs). Reporting within the golden hour (first 2-3 hours) exponentially increases chances of freezing funds at the destination bank.',
      cybercrime_portal_link: 'https://cybercrime.gov.in',
      recommended_immediate_steps: [
        '1. Immediately call 1930 National Cyber Crime Reporting Helpline.',
        '2. Contact your bank\'s 24x7 fraud helpline to block your UPI and freeze outgoing transactions.',
        '3. File a formal complaint on https://cybercrime.gov.in with this Incident ID and transaction reference.',
        '4. Preserve all chat messages, SMS, call logs, and payment screenshots without deleting them.',
        '5. Change your UPI PIN, banking passwords, and revoke unfamiliar apps on your device.'
      ]
    };
  }
};
