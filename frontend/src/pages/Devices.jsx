// frontend/src/pages/Devices.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cpu, HelpCircle, AlertCircle } from 'lucide-react';
import DeviceCard from '../components/DeviceCard';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [togglingId, setTogglingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch devices
  const fetchDevices = async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/devices`);
      if (response.data && response.data.success) {
        setDevices(response.data.data);
        setError('');
      }
    } catch (err) {
      console.error('Error loading devices:', err);
      setError('Could not connect to API server. Please check your backend connection.');
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch with loader
    fetchDevices(true);

    // Poll devices list every 5 seconds to get updated power/energy readings
    const interval = setInterval(() => fetchDevices(false), 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle device toggle switch
  const handleToggle = async (deviceId) => {
    setTogglingId(deviceId);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/devices/${deviceId}/toggle`);
      if (response.data && response.data.success) {
        // Update the toggled device in state immediately
        setDevices(prevDevices => 
          prevDevices.map(device => 
            device.id === deviceId ? response.data.data : device
          )
        );
      }
    } catch (err) {
      console.error('Error toggling device status:', err);
      setError('Failed to toggle device power status. Please try again.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="h-5 w-5 text-azure-400" />
            Home Appliances Management
          </h3>
          <p className="text-xs text-slate-400">Monitor live wattage, daily energy totals, and switch appliance states</p>
        </div>
        
        {/* Help Tip */}
        <div className="flex items-center gap-2 text-xs bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 rounded-xl text-slate-400">
          <HelpCircle className="h-4.5 w-4.5 text-azure-400 shrink-0" />
          <span>Turning devices <b>ON</b> will trigger simulated IoT telemetry every 5s.</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex gap-3 items-center text-xs text-rose-400">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Appliance Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl h-64 animate-pulse flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-1/2">
                  <div className="h-2 bg-slate-800 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                </div>
                <div className="h-6 bg-slate-800 rounded w-12"></div>
              </div>
              <div className="h-16 w-16 bg-slate-800 rounded-full mx-auto my-4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-3 bg-slate-800 rounded"></div>
                <div className="h-3 bg-slate-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onToggle={handleToggle}
              isToggling={togglingId === device.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
