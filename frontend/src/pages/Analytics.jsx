// frontend/src/pages/Analytics.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  Calendar, 
  Zap, 
  Award,
  AlertCircle
} from 'lucide-react';
import TelemetryChart from '../components/TelemetryChart';

export default function Analytics() {
  const [selectedRange, setSelectedRange] = useState('daily');
  const [trendData, setTrendData] = useState({ labels: [], values: [] });
  const [deviceData, setDeviceData] = useState({ labels: [], values: [] });
  const [topDevice, setTopDevice] = useState({ name: 'N/A', consumption: 0 });
  const [isLoadingTrend, setIsLoadingTrend] = useState(true);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch Trend Data based on range selection
  const fetchTrendData = async () => {
    setIsLoadingTrend(true);
    try {
      const response = await axios.get(`${API_URL}/energy?range=${selectedRange}`);
      if (response.data && response.data.success) {
        const rawData = response.data.data;
        setTrendData({
          labels: rawData.map(item => item.label),
          values: rawData.map(item => item.value)
        });
        setError('');
      }
    } catch (err) {
      console.error('Error fetching trend analytics:', err);
      setError('Failed to retrieve trend data.');
    } finally {
      setIsLoadingTrend(false);
    }
  };

  // Fetch Device-wise total energy distribution
  const fetchDeviceDistribution = async () => {
    setIsLoadingDevices(true);
    try {
      const response = await axios.get(`${API_URL}/energy?range=top-devices`);
      if (response.data && response.data.success) {
        const rawData = response.data.data;
        const labels = rawData.map(item => item.label);
        const values = rawData.map(item => item.value);
        
        setDeviceData({ labels, values });

        // Calculate top device
        if (rawData.length > 0) {
          // The query sorted it in descending order, so index 0 is the highest
          setTopDevice({
            name: rawData[0].label,
            consumption: rawData[0].value
          });
        }
      }
    } catch (err) {
      console.error('Error fetching device distribution:', err);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  useEffect(() => {
    fetchTrendData();
  }, [selectedRange]);

  useEffect(() => {
    fetchDeviceDistribution();
  }, []);

  const ranges = [
    { id: 'hourly', name: '24 Hours' },
    { id: 'daily', name: '7 Days' },
    { id: 'weekly', name: '4 Weeks' },
    { id: 'monthly', name: '6 Months' },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex gap-3 items-center text-xs text-rose-400">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-azure-400" />
            Energy Analytics Hub
          </h3>
          <p className="text-xs text-slate-400">Deep-dive into energy consumption patterns and statistics</p>
        </div>

        {/* Range Selectors */}
        <div className="flex p-1 bg-slate-900/60 border border-slate-800/80 rounded-xl max-w-fit">
          {ranges.map((range) => (
            <button
              key={range.id}
              onClick={() => setSelectedRange(range.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                selectedRange === range.id
                  ? 'bg-azure-600 text-white shadow shadow-azure-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Trend Chart (Line) */}
        <div className="xl:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 bg-azure-500/10 border border-azure-500/20 rounded-lg text-azure-400">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Consumption Over Time</h4>
              <p className="text-[11px] text-slate-500">Analyze peak consumption intervals</p>
            </div>
          </div>

          <div className="min-h-[280px] flex items-center justify-center">
            {isLoadingTrend ? (
              <div className="h-8 w-8 border-2 border-azure-500 border-t-transparent rounded-full animate-spin"></div>
            ) : trendData.labels.length > 0 ? (
              <TelemetryChart 
                type="line" 
                labels={trendData.labels} 
                values={trendData.values} 
                datasetLabel="Energy (kWh)" 
              />
            ) : (
              <p className="text-xs text-slate-500">No historical logs found for the selected range.</p>
            )}
          </div>
        </div>

        {/* Side Panel: Device distribution & Top Consumer */}
        <div className="flex flex-col gap-6">
          
          {/* Top Device Highlight */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-slate-800/80">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500 to-yellow-500 opacity-5 rounded-full blur-2xl"></div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Award className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Top Consuming Appliance</span>
                <h4 className="text-xl font-extrabold text-white tracking-tight">{topDevice.name}</h4>
                <p className="text-xs text-slate-400">
                  Logged total of <span className="font-bold text-amber-400">{topDevice.consumption.toFixed(2)} kWh</span>
                </p>
              </div>
            </div>
          </div>

          {/* Device Distribution (Doughnut Chart) */}
          <div className="glass-panel p-6 rounded-2xl flex-1 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                <PieIcon className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Device-wise Share</h4>
                <p className="text-[11px] text-slate-500">Breakdown of energy consumption shares</p>
              </div>
            </div>

            <div className="min-h-[220px] flex items-center justify-center">
              {isLoadingDevices ? (
                <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              ) : deviceData.labels.length > 0 ? (
                <TelemetryChart 
                  type="doughnut" 
                  labels={deviceData.labels} 
                  values={deviceData.values} 
                  datasetLabel="Total Energy (kWh)" 
                />
              ) : (
                <p className="text-xs text-slate-500">No device data available.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
