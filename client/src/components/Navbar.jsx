import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Scan, 
  Activity, 
  User, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axios.get('/api/health');
        setBackendHealthy(res.data.status === 'healthy');
      } catch (e) {
        setBackendHealthy(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-900/60 text-purple-300 border-purple-700/50';
      case 'inspector':
        return 'bg-amber-900/60 text-amber-300 border-amber-700/50';
      default:
        return 'bg-sky-900/60 text-sky-300 border-sky-700/50';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link to="/dashboard" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                Vision<span className="text-brand-400">Intelligence</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">COMPUTER VISION CORE</p>
            </div>
          </Link>
        </div>

        {/* Center / Status */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700">
            <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className="text-slate-300">{backendHealthy ? 'ENGINE ACTIVE' : 'ENGINE DISCONNECTED'}</span>
            <span className="text-slate-500">•</span>
            <span className="text-brand-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Gemini 2.5 Vision
            </span>
          </div>
        </div>

        {/* User Dropdown / Nav CTA */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 font-semibold text-sm">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-slate-200">{user.fullName || 'Operator'}</div>
                <div className="text-xs text-slate-400 font-mono">{user.email}</div>
              </div>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${getRoleBadge(user.role)}`}>
                {user.role}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-medium text-slate-200 truncate">{user.email}</p>
                </div>

                <Link
                  to="/settings"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Profile & Permissions</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white px-4 py-1.5 rounded-lg shadow-md transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}

      </div>
    </header>
  );
}

