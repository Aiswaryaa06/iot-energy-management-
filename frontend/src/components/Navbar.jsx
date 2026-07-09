// frontend/src/components/Navbar.jsx
import React from 'react';
import { Cloud, CheckCircle, Database, Server, RefreshCw } from 'lucide-react';

export default function Navbar({ title, dbType = 'SQLite' }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="glass-panel h-20 border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{currentDate} | Control Center</p>
      </div>

      {/* Azure Service Badges */}
      <div className="flex items-center gap-4">
        {/* Azure SQL DB Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
          <Database className="h-3.5 w-3.5 text-azure-400" />
          <span className="text-slate-400">DB:</span>
          <span className="text-emerald-400 font-semibold">{dbType}</span>
        </div>

        {/* IoT Hub Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
          <Cloud className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-400">IoT Hub:</span>
          <span className="text-cyan-400 font-semibold">Simulated</span>
        </div>

        {/* Server Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
          <Server className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-slate-400">App Service:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            Healthy <CheckCircle className="h-3 w-3 fill-emerald-500 text-slate-900" />
          </span>
        </div>
      </div>
    </header>
  );
}
