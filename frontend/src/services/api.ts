import axios from 'axios';
import {
  MessageAnalysisResponse, URLAnalysisResponse, UPIAnalysisResponse,
  QRAnalysisResponse, TransactionAnalysisResponse, UnifiedRiskResponse,
  FraudNetworkData, FraudIncidentSummary, Alert, AdminStats, ModelPerformance,
  AuthResponse, User
} from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('upishield_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (formData: FormData): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  register: async (userData: any): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export const analysisApi = {
  analyzeMessage: async (message: string, language_hint?: string): Promise<MessageAnalysisResponse> => {
    const res = await api.post('/analyze/message', { message, language_hint });
    return res.data;
  },
  analyzeURL: async (url: string): Promise<URLAnalysisResponse> => {
    const res = await api.post('/analyze/url', { url });
    return res.data;
  },
  analyzeUPI: async (upi_id: string): Promise<UPIAnalysisResponse> => {
    const res = await api.post('/analyze/upi', { upi_id });
    return res.data;
  },
  analyzeQR: async (qr_data: string, image_base64?: string): Promise<QRAnalysisResponse> => {
    const res = await api.post('/analyze/qr', { qr_data, image_base64 });
    return res.data;
  },
  analyzeTransaction: async (data: {
    amount: number;
    time_str?: string;
    hour?: number;
    location?: string;
    recipient_upi: string;
    recipient_name?: string;
    is_new_recipient?: boolean;
    device_id?: string;
    device_changed?: boolean;
    transaction_frequency_today?: number;
  }): Promise<TransactionAnalysisResponse> => {
    const res = await api.post('/analyze/transaction', data);
    return res.data;
  },
  analyzeUnified: async (data: any): Promise<UnifiedRiskResponse> => {
    const res = await api.post('/analyze/unified', data);
    return res.data;
  }
};

export const dashboardApi = {
  getSummary: async (): Promise<any> => {
    const res = await api.get('/dashboard');
    return res.data;
  },
  getAlerts: async (): Promise<Alert[]> => {
    const res = await api.get('/alerts');
    return res.data;
  },
  getScams: async (): Promise<any[]> => {
    const res = await api.get('/scams');
    return res.data;
  }
};

export const networkApi = {
  getNetwork: async (): Promise<FraudNetworkData> => {
    const res = await api.get('/fraud-network');
    return res.data;
  },
  getNodeDetails: async (nodeId: string): Promise<any> => {
    const res = await api.get(`/fraud-network/node/${nodeId}`);
    return res.data;
  }
};

export const reportsApi = {
  submitReport: async (reportData: {
    reported_upi: string;
    reported_phone?: string;
    transaction_ref?: string;
    amount_lost: number;
    scam_type: string;
    description?: string;
    screenshot_name?: string;
  }): Promise<FraudIncidentSummary> => {
    const res = await api.post('/reports', reportData);
    return res.data;
  },
  getReports: async (): Promise<any[]> => {
    const res = await api.get('/reports');
    return res.data;
  }
};

export const adminApi = {
  getStatistics: async (): Promise<AdminStats> => {
    const res = await api.get('/admin/statistics');
    return res.data;
  },
  getModelMetrics: async (): Promise<ModelPerformance> => {
    const res = await api.get('/admin/models');
    return res.data;
  },
  retrainModels: async (): Promise<any> => {
    const res = await api.post('/admin/retrain');
    return res.data;
  }
};

export default api;
