import React, { useState } from 'react';
import { Building2, Database, LogOut, UserCheck, Shield, ChevronDown, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, resetMockData } from '../lib/supabase';
import SupabaseConfigModal from './SupabaseConfigModal';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, role, logout, quickLogin, showToast } = useAuth();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const isConnected = isSupabaseConfigured();

  const handleRoleSwitch = (newRole) => {
    const targetRole = quickLogin(newRole);
    setIsRoleDropdownOpen(false);
    navigate(`/${targetRole}`);
  };

  const handleResetData = () => {
    resetMockData();
    showToast('Mock database re-initialized to default seed data!', 'success');
    window.location.reload();
  };

  const roleColors = {
    student: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warden: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    admin: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  };

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
              Hostel<span className="text-indigo-400">Connect</span>
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1 font-medium hidden sm:block">
              DBMS Project • React + Supabase
            </span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            {/* Database Status Button */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all text-slate-300"
              title="Click to configure Supabase DB"
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">{isConnected ? 'Supabase Live DB' : 'Local Mock DB'}</span>
            </button>

            {!isConnected && (
              <button
                onClick={handleResetData}
                className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Reset mock data to default seed"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border uppercase tracking-wider transition-all ${roleColors[role] || 'bg-slate-800 text-slate-300'}`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{role}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in space-y-1">
                  <div className="px-3 py-1 border-b border-slate-800 text-[10px] font-semibold uppercase text-slate-500">
                    Switch Active Role
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('student')}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-800 transition-colors ${role === 'student' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}
                  >
                    <span>Student Dashboard</span>
                    {role === 'student' && <UserCheck className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('warden')}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-800 transition-colors ${role === 'warden' ? 'text-amber-400 font-bold' : 'text-slate-300'}`}
                  >
                    <span>Warden Dashboard</span>
                    {role === 'warden' && <UserCheck className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-800 transition-colors ${role === 'admin' ? 'text-indigo-400 font-bold' : 'text-slate-300'}`}
                  >
                    <span>Admin Dashboard</span>
                    {role === 'admin' && <UserCheck className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      <SupabaseConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </>
  );
}
