// frontend/src/components/DashboardCard.jsx
import React from 'react';

export default function DashboardCard({ title, value, subtext, icon: Icon, colorClass = 'from-azure-500 to-cyan-500' }) {
  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
      {/* Decorative Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-[0.03] blur-3xl group-hover:opacity-[0.08] transition-opacity duration-300`}></div>
      
      {/* Accent Top Border */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClass}`}></div>

      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-400 tracking-wide uppercase">{title}</p>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
          {subtext && (
            <p className="text-xs text-slate-500 font-medium">
              {subtext}
            </p>
          )}
        </div>
        
        <div className={`p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/50 text-slate-300 group-hover:text-white transition-colors duration-200`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
