import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield, MessageSquareWarning, QrCode, Search, Link2, Activity,
  Network, AlertOctagon, PhoneCall, LayoutDashboard, UserCheck,
  CreditCard, LogOut, ChevronDown, Menu, X, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SimulatedPaymentModal } from './SimulatedPaymentModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, loginAsDemoAdmin, loginAsDemoUser } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/analyze-message', label: 'Analyze Message', icon: MessageSquareWarning },
    { to: '/scan-qr', label: 'Scan QR', icon: QrCode },
    { to: '/check-upi', label: 'Check UPI', icon: Search },
    { to: '/check-url', label: 'Check URL', icon: Link2 },
    { to: '/transaction-analysis', label: 'Txn Risk', icon: Activity },
    { to: '/fraud-network', label: 'Fraud Network', icon: Network },
    { to: '/simulator', label: 'Scam Simulator', icon: AlertOctagon },
  ];

  return (
    <>
      <nav className="bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-extrabold text-white text-lg tracking-tight">
                    <span>UPI SHIELD</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      AI 2.0
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                    AI Scam Detection & Prevention
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Action Controls */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Payment Simulator Trigger */}
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="cyber-button bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 text-xs"
              >
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulate Payment</span>
              </button>

              {/* Emergency 1930 / Report */}
              <Link
                to="/report-fraud"
                className="cyber-button-danger px-3 py-1.5 text-xs font-semibold animate-pulse"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>🚨 I Lost Money</span>
              </Link>

              {/* Admin Link */}
              <Link
                to="/admin"
                className="cyber-button-secondary px-3 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                <span>Admin</span>
              </Link>

              {/* Auth / Account Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="cyber-button-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate max-w-[90px]">
                    {user ? user.full_name || user.email.split('@')[0] : 'Demo User'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 text-xs space-y-1 animate-fade-in">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-slate-400 text-[11px]">Logged in as:</p>
                      <p className="text-white font-medium truncate">{user?.email || 'Demo Mode'}</p>
                      <span className="text-[10px] font-mono uppercase text-cyan-400">{user?.role || 'user'}</span>
                    </div>

                    <button
                      onClick={async () => {
                        await loginAsDemoAdmin();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                    >
                      <span>Switch to Demo Admin</span>
                      <span className="text-[10px] text-cyan-400 font-mono">admin@</span>
                    </button>

                    <button
                      onClick={async () => {
                        await loginAsDemoUser();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                    >
                      <span>Switch to Demo User</span>
                      <span className="text-[10px] text-emerald-400 font-mono">user@</span>
                    </button>

                    {isAuthenticated && (
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 flex items-center gap-2 border-t border-slate-800 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="cyber-button-secondary p-2 text-xs"
                title="Simulate Payment"
              >
                <CreditCard className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800/80"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[#0B0F19] px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/report-fraud"
                onClick={() => setMobileMenuOpen(false)}
                className="cyber-button-danger py-2.5 text-xs font-bold text-center"
              >
                🚨 I Lost Money (1930 Emergency)
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="cyber-button-secondary py-2 text-xs text-center"
              >
                Admin Intelligence Dashboard
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Simulated Payment Modal */}
      <SimulatedPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </>
  );
};
