// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';

function AppContent({ user, onLogout }) {
  const location = useLocation();
  
  // Map paths to navbar titles
  const getNavbarTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Energy Control Dashboard';
      case '/devices':
        return 'Smart Appliances Center';
      case '/analytics':
        return 'Advanced Consumption Analytics';
      case '/alerts':
        return 'Safety & Operational Logs';
      default:
        return 'Azure IoT Smart Home';
    }
  };

  const isLoginPage = location.pathname === '/login';

  // Protect routes: Redirect to login if user session does not exist
  if (!user) {
    return isLoginPage ? (
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={(u) => {
          localStorage.setItem('azure_iot_user', JSON.stringify(u));
          window.location.href = '/dashboard';
        }} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    ) : (
      <Navigate to="/login" replace />
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] flex">
      {/* Sidebar Navigation */}
      {!isLoginPage && <Sidebar user={user} onLogout={onLogout} />}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${!isLoginPage ? 'pl-64' : ''}`}>
        
        {/* Top Navigation status bar */}
        {!isLoginPage && <Navbar title={getNavbarTitle(location.pathname)} />}

        {/* Page Content Layout */}
        <main className={`p-8 flex-1 overflow-y-auto`}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check if session exists on load
    const savedUser = localStorage.getItem('azure_iot_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user credentials');
        localStorage.removeItem('azure_iot_user');
      }
    }
    setIsInitializing(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('azure_iot_user');
    setUser(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-azure-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent user={user} onLogout={handleLogout} />
    </Router>
  );
}
