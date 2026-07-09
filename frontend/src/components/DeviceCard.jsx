// frontend/src/components/DeviceCard.jsx
import React from 'react';
import { 
  Snowflake, 
  Fan, 
  Tv, 
  Refrigerator, 
  WashingMachine, 
  Power,
  MapPin,
  Zap,
  Gauge
} from 'lucide-react';

export default function DeviceCard({ device, onToggle, isToggling }) {
  // Map device names to corresponding Lucide icons
  const getDeviceIcon = (name) => {
    switch (name) {
      case 'Air Conditioner':
        return Snowflake;
      case 'Fan':
        return Fan;
      case 'Television':
        return Tv;
      case 'Refrigerator':
        return Refrigerator;
      case 'Washing Machine':
        return WashingMachine;
      default:
        return Zap;
    }
  };

  const IconComponent = getDeviceIcon(device.name);
  const isOn = device.status === 'ON';

  return (
    <div className={`glass-card p-6 rounded-2xl relative overflow-hidden transition-all duration-300 ${
      isOn 
        ? 'border-azure-500/30 bg-slate-900/40' 
        : 'border-slate-800/80 bg-slate-950/20'
    }`}>
      {/* Decorative Glow if Active */}
      {isOn && (
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl"></div>
      )}

      {/* Top Details */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <MapPin className="h-3 w-3 text-slate-500" />
            {device.location}
          </span>
          <h4 className="text-lg font-bold text-white tracking-tight">{device.name}</h4>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => !isToggling && onToggle(device.id)}
          disabled={isToggling}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isOn ? 'bg-emerald-500' : 'bg-slate-700'
          } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="sr-only">Toggle {device.name}</span>
          <span
            pointerEvents="none"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isOn ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Device Icon Circle */}
      <div className="my-6 flex justify-center">
        <div className={`p-5 rounded-full border transition-all duration-300 ${
          isOn 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 status-glow-on' 
            : 'bg-slate-800/40 border-slate-700/40 text-slate-500'
        }`}>
          <IconComponent className={`h-8 w-8 ${isOn && device.name === 'Fan' ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
        </div>
      </div>

      {/* Statistics / Telemetry readout */}
      <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-4">
        {/* Power usage */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-500" />
            Power
          </span>
          <p className="text-sm font-semibold text-slate-200">
            {isOn ? `${device.power_consumption.toFixed(0)} W` : '0 W'}
          </p>
        </div>

        {/* Accumulated Energy */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Gauge className="h-3 w-3 text-cyan-400" />
            Today
          </span>
          <p className="text-sm font-semibold text-slate-200">
            {device.today_energy.toFixed(3)} kWh
          </p>
        </div>
      </div>

      {/* Connection Indicator Bar */}
      <div className="mt-4 flex items-center justify-between text-[10px] font-medium text-slate-600">
        <span>Signal Strength</span>
        <div className="flex gap-0.5">
          <span className={`w-1 h-2 rounded-full ${isOn ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>
          <span className={`w-1 h-3 rounded-full ${isOn ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>
          <span className={`w-1 h-4 rounded-full ${isOn ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>
          <span className={`w-1 h-5 rounded-full ${isOn ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>
        </div>
      </div>
    </div>
  );
}
