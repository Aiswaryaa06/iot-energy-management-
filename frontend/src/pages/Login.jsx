// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Zap, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data && response.data.success) {
        onLoginSuccess(response.data.user);
      } else {
        setError(response.data.message || 'Login failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Could not connect to authentication server. Please check that backend is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#070b13] px-4">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-azure-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Glow Border Wrap */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-azure-600 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        
        <div className="relative bg-[#0d1527]/90 border border-slate-800/80 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
          {/* Logo & Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex p-3 bg-gradient-to-tr from-azure-600 to-cyan-400 rounded-2xl shadow-lg shadow-azure-600/35 mb-2">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-400 max-w-[280px] mx-auto">
              Access the Smart Home Energy Management System Dashboard
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex gap-3 items-start text-xs text-rose-400">
              <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error:</span> {error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="admin@smarthome.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-azure-500/50 focus:border-azure-500 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <span className="text-[10px] text-azure-400 font-semibold cursor-help hover:underline">
                  Hint: admin123
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-azure-500/50 focus:border-azure-500 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-azure-600 to-cyan-500 hover:from-azure-500 hover:to-cyan-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-azure-500/20 hover:shadow-azure-500/35 transition-all focus:outline-none disabled:opacity-55 disabled:cursor-not-allowed group/btn"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Footer Credit */}
        <p className="text-center text-[10px] text-slate-600 mt-6 tracking-wide uppercase font-semibold">
          Microsoft Azure Course Project • AZ-900 Demo App
        </p>
      </div>
    </div>
  );
}
