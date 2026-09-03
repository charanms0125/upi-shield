export type RiskCategory = 'LOW' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL';

export interface User {
  id: number;
  email: string;
  full_name?: string;
  phone_number?: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface MessageAnalysisResponse {
  risk_score: number;
  category: RiskCategory;
  confidence: number;
  scam_type: string;
  detected_language: string;
  language_display: string;
  indicators: string[];
  feature_contributions: Record<string, number>;
  recommendation: string;
  safe_to_proceed: boolean;
}

export interface URLAnalysisResponse {
  url: string;
  domain: string;
  is_https: boolean;
  risk_score: number;
  category: RiskCategory;
  confidence: number;
  warnings: string[];
  brand_impersonation?: string;
  feature_contributions: Record<string, number>;
  recommendation: string;
}

export interface UPIAnalysisResponse {
  upi_id: string;
  handle: string;
  display_name?: string;
  risk_score: number;
  category: RiskCategory;
  status: 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK';
  report_count: number;
  connected_entities_count: number;
  is_verified_merchant: boolean;
  suspicious_patterns: string[];
  feature_contributions: Record<string, number>;
  recommendation: string;
}

export interface QRAnalysisResponse {
  raw_payload: string;
  is_valid_upi_qr: boolean;
  payee_upi?: string;
  payee_name?: string;
  amount?: number;
  currency: string;
  transaction_ref?: string;
  risk_score: number;
  category: RiskCategory;
  reasons: string[];
  feature_contributions: Record<string, number>;
  recommendation: string;
  safe_to_proceed: boolean;
}

export interface TransactionAnalysisResponse {
  risk_score: number;
  category: RiskCategory;
  confidence: number;
  amount_anomaly_pct: number;
  time_anomaly_pct: number;
  recipient_novelty_pct: number;
  location_anomaly_pct: number;
  device_anomaly_pct: number;
  isolation_forest_score: number;
  indicators: string[];
  feature_contributions: Record<string, number>;
  recommendation: string;
  safe_to_proceed: boolean;
}

export interface UnifiedRiskResponse {
  overall_risk_score: number;
  category: RiskCategory;
  confidence: number;
  scam_type: string;
  component_scores: Record<string, number>;
  feature_contributions: Record<string, number>;
  all_indicators: string[];
  recommended_action: string;
  safe_to_proceed: boolean;
}

export interface Alert {
  id: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  related_entity?: string;
  timestamp: string;
}

export interface FraudNetworkNode {
  id: string;
  label: string;
  type: 'USER' | 'UPI' | 'ACCOUNT' | 'PHONE';
  risk_score: number;
  risk_category: RiskCategory;
  report_count: number;
  details?: {
    total_connections: number;
    connected_nodes: string[];
    in_degree: number;
    out_degree: number;
  };
}

export interface FraudNetworkEdge {
  source: string;
  target: string;
  relation: string;
  risk_weight: number;
}

export interface FraudNetworkData {
  nodes: FraudNetworkNode[];
  edges: FraudNetworkEdge[];
  total_nodes: number;
  total_edges: number;
  suspicious_clusters_count: number;
}

export interface FraudIncidentSummary {
  incident_id: string;
  amount_lost: number;
  reported_upi: string;
  reported_phone?: string;
  transaction_ref?: string;
  scam_type: string;
  risk_category: string;
  description?: string;
  created_at: string;
  official_1930_advisory: string;
  cybercrime_portal_link: string;
  recommended_immediate_steps: string[];
}

export interface AdminStats {
  total_transactions_protected: number;
  scans_performed: number;
  threats_detected: number;
  blocked_suspicious_count: number;
  protected_volume_inr: number;
  active_risk_level: string;
  scam_category_distribution: Record<string, number>;
  risk_score_distribution: Record<string, number>;
  daily_trends: Array<{
    date: string;
    total_scans: number;
    threats_detected: number;
    blocked_count: number;
  }>;
  top_suspicious_upis: Array<{
    upi_id: string;
    risk_score: number;
    report_count: number;
    connected_entities: number;
    status: string;
  }>;
  geo_distribution: Array<{
    region: string;
    incidents: number;
    pct: number;
  }>;
}

export interface ModelPerformance {
  model_name: string;
  model_type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
  };
  training_sample_count: number;
  synthetic_disclaimer: string;
}
