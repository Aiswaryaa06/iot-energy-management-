// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Zap, 
  BatteryCharging, 
  IndianRupee, 
  Cpu, 
  AlertTriangle, 
  Info, 
  Settings, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import TelemetryChart from '../components/TelemetryChart';

export default function Dashboard() {
  const [stats, setStats] = useState({
    currentPower: 0,
    todayEnergy: 0,
    activeDevices: 0,
    tariff: 8,
    todayBill: 0,
    estimatedMonthlyBill: 0,
    recentAlerts: []
  });
  const [chartData, setChartData] = useState({ labels: [], values: [] });
  const [tariffInput, setTariffInput] = useState('8');
  const [isUpdatingTariff, setIsUpdatingTariff] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch Dashboard Stats and Hourly Chart data
  const fetchData = async () => {
    try {
      // 1. Fetch dashboard numbers
      const statsRes = await axios.get(`${API_URL}/dashboard`);
      if (statsRes.data && statsRes.data.success) {
        setStats(statsRes.data.data);
        setTariffInput(statsRes.data.data.tariff.toString());
      }

      // 2. Fetch hourly consumption for the chart
      const chartRes = await axios.get(`${API_URL}/energy?range=hourly`);
      if (chartRes.data && chartRes.data.success) {
        const rawData = chartRes.data.data;
        // Map labels and values
        const labels = rawData.map(item => item.label);
        const values = rawData.map(item => item.value);
        setChartData({ labels, values });
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Could not connect to API server. Verify backend is running.');
    }
  };

  useEffect(() => {
    fetchData();
    // Poll dashboard data every 5 seconds to match simulator rate
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTariffSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingTariff(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/settings/tariff`, {
        tariff: parseFloat(tariffInput)
      });
      if (response.data && response.data.success) {
        // Trigger data update
        fetchData();
      }
    } catch (err) {
      console.error('Error updating tariff:', err);
      setError('Failed to update tariff settings.');
    } finally {
      setIsUpdatingTariff(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      case 'Warning':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
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
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex gap-3 items-center text-xs text-rose-400">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <DashboardCard
          title="Current Power Draw"
          value={`${stats.currentPower.toFixed(0)} W`}
          subtext="Sum of active devices"
          icon={Zap}
          colorClass="from-amber-500 to-yellow-500"
        />
        <DashboardCard
          title="Today's Consumption"
          value={`${stats.todayEnergy.toFixed(3)} kWh`}
          subtext="Cumulative logged today"
          icon={BatteryCharging}
          colorClass="from-emerald-500 to-cyan-500"
        />
        <DashboardCard
          title="Estimated Bill"
          value={`₹${stats.todayBill.toFixed(2)}`}
          subtext={`Est. Monthly: ₹${stats.estimatedMonthlyBill.toFixed(0)}`}
          icon={IndianRupee}
          colorClass="from-azure-500 to-purple-500"
        />
        <DashboardCard
          title="Active Devices"
          value={`${stats.activeDevices} / 5`}
          subtext="Appliances currently ON"
          icon={Cpu}
          colorClass="from-cyan-500 to-teal-500"
        />
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Real-time Hourly Chart */}
        <div className="xl:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-azure-400" />
                Hourly Energy Usage
              </h3>
              <p className="text-xs text-slate-400">Aggregated consumption over the last 24 hours</p>
            </div>
            <span className="text-[10px] bg-slate-800 text-azure-400 border border-slate-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              Live (5s Poll)
            </span>
          </div>

          <div className="min-h-[250px] flex items-center justify-center">
            {chartData.labels.length > 0 ? (
              <TelemetryChart 
                type="line" 
                labels={chartData.labels} 
                values={chartData.values} 
                datasetLabel="Energy (kWh)" 
              />
            ) : (
              <div className="text-center space-y-2">
                <div className="h-6 w-6 border-2 border-azure-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-500">Awaiting telemetry logs...</p>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel: Tariff Config & Alerts */}
        <div className="space-y-6">
          
          {/* Tariff Settings Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-1.5">
              <Settings className="h-4.5 w-4.5 text-slate-400" />
              Electricity Tariff Settings
            </h3>
            <p className="text-xs text-slate-500 mb-4">Enter local utility rates to calculate real-time bill projections</p>

            <form onSubmit={handleTariffSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm font-semibold">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={tariffInput}
                  onChange={(e) => setTariffInput(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-azure-500/50 focus:border-azure-500 transition-all"
                  placeholder="e.g. 8"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingTariff}
                className="px-4 py-2 bg-azure-600 hover:bg-azure-500 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {isUpdatingTariff ? 'Updating...' : 'Apply'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {/* Recent Alerts List */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
                Recent System Alerts
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">Last 5</span>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {stats.recentAlerts && stats.recentAlerts.length > 0 ? (
                stats.recentAlerts.map((alert) => {
                  const SeverityIcon = getSeverityIcon(alert.severity);
                  return (
                    <div 
                      key={alert.id} 
                      className={`p-3 rounded-xl border flex gap-3 items-start text-xs transition-colors ${getSeverityColor(alert.severity)}`}
                    >
                      <SeverityIcon className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-medium text-slate-200 leading-normal">{alert.message}</p>
                        <span className="text-[9px] text-slate-500 block font-semibold">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  <Info className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  No recent alerts. System operating normally.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
