// frontend/src/pages/Alerts.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BellRing, 
  Trash2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Clock, 
  MapPin, 
  Zap,
  CheckCircle
} from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchAlerts = async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/alerts`);
      if (response.data && response.data.success) {
        setAlerts(response.data.data);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Could not retrieve alerts from the server.');
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts(true);
    // Poll for new alerts every 5 seconds
    const interval = setInterval(() => fetchAlerts(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all alert history?')) return;
    
    setIsClearing(true);
    setError('');
    
    try {
      const response = await axios.delete(`${API_URL}/alerts/clear`);
      if (response.data && response.data.success) {
        setAlerts([]);
        setMessage('Alert history cleared successfully.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error clearing alerts:', err);
      setError('Failed to clear alert history.');
    } finally {
      setIsClearing(false);
    }
  };

  const getBadgeStyle = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      case 'Warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default:
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Critical':
        return AlertCircle;
      case 'Warning':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BellRing className="h-5 w-5 text-azure-400" />
            Alert Management Logs
          </h3>
          <p className="text-xs text-slate-400">View real-time safety thresholds and grid overload indicators</p>
        </div>

        {/* Clear History Button */}
        {alerts.length > 0 && (
          <button
            onClick={handleClear}
            disabled={isClearing}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold border border-rose-500/20 transition-all disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {isClearing ? 'Clearing...' : 'Clear Log History'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex gap-3 items-center text-xs text-rose-400 animate-fade-in">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex gap-3 items-center text-xs text-emerald-400 animate-fade-in">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Alerts Table/Container */}
      {isLoading ? (
        <div className="glass-panel p-6 rounded-2xl animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-800 rounded-xl w-full"></div>
          ))}
        </div>
      ) : alerts.length > 0 ? (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/35 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Source Device</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Trigger Warning</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {alerts.map((alert) => {
                  const Icon = getSeverityIcon(alert.severity);
                  return (
                    <tr key={alert.id} className="text-xs hover:bg-slate-900/25 transition-colors">
                      {/* Severity Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold tracking-wide uppercase ${getBadgeStyle(alert.severity)}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {alert.severity}
                        </span>
                      </td>

                      {/* Device Name */}
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-200">
                        {alert.device_name || 'System / Grid'}
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {alert.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-500" />
                            {alert.location}
                          </span>
                        ) : (
                          <span className="text-slate-600 font-semibold italic">—</span>
                        )}
                      </td>

                      {/* Alert Message */}
                      <td className="px-6 py-4 text-slate-300 max-w-sm">
                        <div className="flex items-center gap-1.5 font-medium leading-relaxed">
                          <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          {alert.message}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-650" />
                          {new Date(alert.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800/80 text-center text-slate-500">
          <BellRing className="h-12 w-12 text-slate-700 mx-auto mb-4 animate-bounce" style={{ animationDuration: '4s' }} />
          <h4 className="text-base font-bold text-slate-350 mb-1">No Alerts Logged</h4>
          <p className="text-xs text-slate-500 max-w-[280px] mx-auto">
            The safety checks are monitoring. Live telemetry will generate warnings here if appliance power loads exceed 1500W.
          </p>
        </div>
      )}
    </div>
  );
}
