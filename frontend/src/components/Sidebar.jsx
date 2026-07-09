// frontend/src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cpu, 
  TrendingUp, 
  BellRing, 
  LogOut, 
  Zap,
  Activity
} from 'lucide-react';

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Devices', path: '/devices', icon: Cpu },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'Alerts', path: '/alerts', icon: BellRing },
  ];

  return (
    <aside className="w-64 glass-panel h-screen fixed left-0 top-0 flex flex-col justify-between border-r border-slate-800 z-30">
      {/* Top Brand Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-azure-600 to-cyan-400 rounded-xl shadow-lg shadow-azure-500/25">
            <Zap className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-wide">
              Azure IoT
            </h1>
            <span className="text-[10px] text-azure-400 font-semibold tracking-widest uppercase">
              Smart Home
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-azure-600/90 text-white shadow-lg shadow-azure-600/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-5 w-5 transition-transform group-hover:scale-105" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout Button */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-azure-400 font-bold">
            {user?.email ? user.email[0].toUpperCase() : 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-300 truncate">
              {user?.email || 'admin@smarthome.com'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                IoT Connected
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
