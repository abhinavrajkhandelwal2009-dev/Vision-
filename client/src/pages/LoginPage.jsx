import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scan, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Account Auto-Fill & Login
  const quickDemoLogin = async (roleName, demoEmail, demoPass) => {
    setError('');
    setLoading(true);
    try {
      try {
        await login(demoEmail, demoPass);
      } catch (loginErr) {
        // If demo user does not exist in db yet, auto-register them
        await register(demoEmail, demoPass, `${roleName} User`, roleName.toLowerCase());
      }
      navigate('/dashboard');
    } catch (err) {
      setError('Unable to authenticate demo account: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-brand-500/10 blur-[120px] pointer-events-none rounded-full"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-2xl shadow-brand-500/30">
            <Scan className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Vision<span className="text-brand-400">Intelligence</span> AI
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400 font-mono">
          ENTERPRISE COMPUTER VISION PLATFORM
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl">
          
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 focus:outline-none shadow-lg shadow-brand-500/20 hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Role-Based Presets */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              One-Click Role Demonstration
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickDemoLogin('Operator', 'operator@vision.ai', 'Password123!')}
                className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-brand-300 transition-colors text-center"
              >
                <div className="font-bold text-[11px] text-sky-400">OPERATOR</div>
                <div className="text-[10px] text-slate-500">Live Ingest</div>
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('Inspector', 'inspector@vision.ai', 'Password123!')}
                className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-amber-300 transition-colors text-center"
              >
                <div className="font-bold text-[11px] text-amber-400">INSPECTOR</div>
                <div className="text-[10px] text-slate-500">Audit & Sign</div>
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('Admin', 'admin@vision.ai', 'Password123!')}
                className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-purple-300 transition-colors text-center"
              >
                <div className="font-bold text-[11px] text-purple-400">ADMIN</div>
                <div className="text-[10px] text-slate-500">Full Access</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Need a new enterprise account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-2">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

