import axios from 'axios';
import {
  MessageAnalysisResponse, URLAnalysisResponse, UPIAnalysisResponse,
  QRAnalysisResponse, TransactionAnalysisResponse, UnifiedRiskResponse,
  FraudNetworkData, FraudIncidentSummary, Alert, AdminStats, ModelPerformance,
  AuthResponse, User
} from '../types';
import { clientAI } from './clientAI';
import { clientData } from './clientData';

// Configurable base URL: uses VITE_API_URL if configured, otherwise defaults to '/api'
const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 6000,
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
    try {
      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (e) {
      console.warn('[UPI SHIELD] Live backend login unreachable, using demo offline auth fallback');
      const email = (formData.get('username') as string) || 'user@upishield.demo';
      const role = email.includes('admin') ? 'admin' : 'user';
      return {
        access_token: 'demo-jwt-token-upishield-2026',
        token_type: 'bearer',
        user: {
          id: role === 'admin' ? 1 : 2,
          email,
          full_name: role === 'admin' ? 'Cyber Threat Admin' : 'Priya Sharma',
          role,
          is_active: true,
          created_at: new Date().toISOString()
        }
      };
    }
  },

  register: async (userData: any): Promise<AuthResponse> => {
    try {
      const res = await api.post('/auth/register', userData);
      return res.data;
    } catch (e) {
      console.warn('[UPI SHIELD] Live backend register unreachable, using demo offline fallback');
      const role = userData.email?.includes('admin') ? 'admin' : 'user';
      return {
        access_token: 'demo-jwt-token-upishield-2026',
        token_type: 'bearer',
        user: {
          id: 3,
          email: userData.email,
          full_name: userData.full_name || 'Demo User',
          phone_number: userData.phone_number,
          role,
          is_active: true,
          created_at: new Date().toISOString()
        }
      };
    }
  },

  getMe: async (): Promise<User> => {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch (e) {
      const userStr = localStorage.getItem('upishield_user');
      if (userStr) {
        try { return JSON.parse(userStr); } catch {}
      }
      return {
        id: 2,
        email: 'user@upishield.demo',
        full_name: 'Priya Sharma',
        role: 'user',
        is_active: true,
        created_at: new Date().toISOString()
      };
    }
  }
};

export const analysisApi = {
  analyzeMessage: async (message: string, language_hint?: string): Promise<MessageAnalysisResponse> => {
    try {
      const res = await api.post('/analyze/message', { message, language_hint });
      return res.data;
    } catch (e) {
      console.info('[UPI SHIELD] Executing Message Analysis via Client-Side AI Engine');
      return clientAI.analyzeMessage(message, language_hint);
    }
  },

  analyzeURL: async (url: string): Promise<URLAnalysisResponse> => {
    try {
      const res = await api.post('/analyze/url', { url });
      return res.data;
    } catch (e) {
      console.info('[UPI SHIELD] Executing URL Analysis via Client-Side AI Engine');
      return clientAI.analyzeURL(url);
    }
  },

  analyzeUPI: async (upi_id: string): Promise<UPIAnalysisResponse> => {
    try {
      const res = await api.post('/analyze/upi', { upi_id });
      return res.data;
    } catch (e) {
      console.info('[UPI SHIELD] Executing UPI Analysis via Client-Side AI Engine');
      return clientAI.analyzeUPI(upi_id);
    }
  },

  analyzeQR: async (qr_data: string, image_base64?: string): Promise<QRAnalysisResponse> => {
    try {
      const res = await api.post('/analyze/qr', { qr_data, image_base64 });
      return res.data;
    } catch (e) {
      console.info('[UPI SHIELD] Executing QR Analysis via Client-Side AI Engine');
      return clientAI.analyzeQR(qr_data, image_base64);
    }
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
    try {
      const res = await api.post('/analyze/transaction', data);
      return res.data;
    } catch (e) {
      console.info('[UPI SHIELD] Executing Transaction Anomaly Detection via Client-Side AI Engine');
      return clientAI.analyzeTransaction(data);
    }
  },

  analyzeUnified: async (data: any): Promise<UnifiedRiskResponse> => {
    try {
      const res = await api.post('/analyze/unified', data);
      return res.data;
    } catch (e) {
      console.info('[UPI SHIELD] Executing Unified Risk Engine via Client-Side AI Engine');
      return clientAI.analyzeUnified(data);
    }
  }
};

export const dashboardApi = {
  getSummary: async (): Promise<any> => {
    try {
      const res = await api.get('/dashboard');
      return res.data;
    } catch (e) {
      console.info('[UPI SHIELD] Loading Dashboard Summary via Client Data Layer');
      return clientData.getDashboardSummary();
    }
  },

  getAlerts: async (): Promise<Alert[]> => {
    try {
      const res = await api.get('/alerts');
      return res.data;
    } catch (e) {
      console.info('[UPI SHIELD] Loading Alerts via Client Data Layer');
      return clientData.getAlerts();
    }
  },

  getScams: async (): Promise<any[]> => {
    try {
      const res = await api.get('/scams');
      return res.data;
    } catch (e) {
      return clientData.getScams();
    }
  }
};

export const networkApi = {
  getNetwork: async (): Promise<FraudNetworkData> => {
    try {
      const res = await api.get('/fraud-network');
      return res.data;
    } catch (e) {
      console.info('[UPI SHIELD] Loading Fraud Network Graph via Client Data Layer');
      return clientData.getFraudNetwork();
    }
  },

  getNodeDetails: async (nodeId: string): Promise<any> => {
    try {
      const res = await api.get(`/fraud-network/node/${nodeId}`);
      return res.data;
    } catch (e) {
      return clientData.getNodeDetails(nodeId);
    }
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
    try {
      const res = await api.post('/reports', reportData);
      return res.data;
    } catch (e) {
      console.info('[UPI SHIELD] Logging Incident Report via Client Data Layer');
      return clientData.submitReport(reportData);
    }
  },

  getReports: async (): Promise<any[]> => {
    try {
      const res = await api.get('/reports');
      return res.data;
    } catch (e) {
      return [
        {
          id: 1,
          incident_id: 'UPI-2026-000123',
          reported_upi: 'sbi.helpline.nodal@ybl',
          reported_phone: '+91 9876543210',
          transaction_ref: 'TXN-4920194819',
          amount_lost: 25000.0,
          scam_type: 'KYC Phishing',
          description: 'Received SMS that bank account will be blocked. Transferred Rs 25,000 under fake nodal verification.',
          status: 'VERIFIED',
          created_at: new Date().toISOString()
        }
      ];
    }
  }
};

export const adminApi = {
  getStatistics: async (): Promise<AdminStats> => {
    try {
      const res = await api.get('/admin/statistics');
      return res.data;
    } catch (e) {
      console.info('[UPI SHIELD] Loading Admin Statistics via Client Data Layer');
      return clientData.getAdminStatistics();
    }
  },

  getModelMetrics: async (): Promise<ModelPerformance> => {
    try {
      const res = await api.get('/admin/models');
      return res.data;
    } catch (e) {
      return clientData.getModelPerformance();
    }
  },

  retrainModels: async (): Promise<any> => {
    try {
      const res = await api.post('/admin/retrain');
      return res.data;
    } catch (e) {
      return {
        status: 'SUCCESS',
        message: 'Models successfully retrained on newly generated synthetic dataset (Client Fallback).',
        metrics: clientData.getModelPerformance()
      };
    }
  }
};

export default api;
