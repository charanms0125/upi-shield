import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DemoProvider } from './context/DemoContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DemoModeBar } from './components/DemoModeBar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzeMessagePage } from './pages/AnalyzeMessagePage';
import { ScanQrPage } from './pages/ScanQrPage';
import { CheckUpiPage } from './pages/CheckUpiPage';
import { CheckUrlPage } from './pages/CheckUrlPage';
import { TransactionAnalysisPage } from './pages/TransactionAnalysisPage';
import { FraudNetworkPage } from './pages/FraudNetworkPage';
import { ScamSimulatorPage } from './pages/ScamSimulatorPage';
import { ReportFraudPage } from './pages/ReportFraudPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DemoProvider>
          <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-400">
            {/* Top Hackathon Demo Bar for Judges */}
            <DemoModeBar />

            {/* Global Navbar */}
            <Navbar />

            {/* Main Application Routes */}
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/analyze-message" element={<AnalyzeMessagePage />} />
                <Route path="/scan-qr" element={<ScanQrPage />} />
                <Route path="/check-upi" element={<CheckUpiPage />} />
                <Route path="/check-url" element={<CheckUrlPage />} />
                <Route path="/transaction-analysis" element={<TransactionAnalysisPage />} />
                <Route path="/fraud-network" element={<FraudNetworkPage />} />
                <Route path="/simulator" element={<ScamSimulatorPage />} />
                <Route path="/report-fraud" element={<ReportFraudPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global Compliance & 1930 Footer */}
            <Footer />
          </div>
        </DemoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
