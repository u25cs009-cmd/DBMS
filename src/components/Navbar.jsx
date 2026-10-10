import React, { useState } from 'react';
import {
  Building2,
  Database,
  LogOut,
  UserCheck,
  Shield,
  ChevronDown,
  RefreshCw,
  LayoutDashboard,
  BedDouble,
  Receipt,
  MessageSquareWarning,
  UtensilsCrossed,
  Users,
  Building,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, resetMockData } from '../lib/supabase';
import SupabaseConfigModal from './SupabaseConfigModal';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ currentTab, onTabChange }) {
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
    student: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    warden: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    admin: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
  };

  const roleLabels = {
    student: 'Student',
    warden: 'Warden',
    admin: 'Admin'
  };

  const getNavLinks = () => {
    if (role === 'student') {
      return [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'room', label: 'My Room Details', icon: BedDouble },
        { id: 'fees', label: 'Fee Records', icon: Receipt },
        { id: 'complaints', label: 'My Complaints', icon: MessageSquareWarning },
        { id: 'mess', label: 'Mess Menu', icon: UtensilsCrossed },
      ];
    }
    if (role === 'warden') {
      return [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'complaints', label: 'Manage Complaints', icon: MessageSquareWarning },
        { id: 'rooms', label: 'Rooms & Occupancy', icon: Building },
      ];
    }
    if (role === 'admin') {
      return [
        { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
        { id: 'students', label: 'Students Directory', icon: Users },
        { id: 'allocations', label: 'Room Allocations', icon: BedDouble },
        { id: 'fees', label: 'Fees & Billing', icon: Receipt },
        { id: 'mess', label: 'Mess Menu Manager', icon: UtensilsCrossed },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Fixed Sticky Header Container */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-warm-sm">
        {/* Top Header Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-teal-600 text-white rounded-2xl shadow-md shadow-indigo-600/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                Hostel<span className="text-indigo-600">Connect</span>
              </span>
              <span className="text-[10px] text-slate-500 -mt-1 font-semibold hidden sm:block">
                Hostel Management Portal
              </span>
            </div>
          </div>

          {/* Right Controls */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Active User Pill */}
              <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-600 text-white font-black flex items-center justify-center text-[11px] shadow-xs">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[130px]">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{roleLabels[role] || role}</p>
                </div>
              </div>

              {/* Database Status Button */}
              <button
                onClick={() => setIsConfigOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 hover:bg-slate-200/80 transition-all text-slate-700"
                title="Click to configure Supabase DB"
              >
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">{isConnected ? 'PostgreSQL Live' : 'Mock DB'}</span>
              </button>

              {!isConnected && (
                <button
                  onClick={handleResetData}
                  className="p-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-colors"
                  title="Reset mock data to default seed"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Role Switcher Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border uppercase tracking-wider transition-all shadow-xs ${roleColors[role] || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{role}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-warm-xl py-2 z-50 animate-fade-in space-y-1">
                    <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Active Role
                    </div>
                    <button
                      onClick={() => handleRoleSwitch('student')}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-emerald-50/60 transition-colors ${role === 'student' ? 'text-emerald-800 font-bold bg-emerald-50' : 'text-slate-700'}`}
                    >
                      <span>Student</span>
                      {role === 'student' && <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('warden')}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-amber-50/60 transition-colors ${role === 'warden' ? 'text-amber-800 font-bold bg-amber-50' : 'text-slate-700'}`}
                    >
                      <span>Warden</span>
                      {role === 'warden' && <UserCheck className="w-3.5 h-3.5 text-amber-600" />}
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-indigo-50/60 transition-colors ${role === 'admin' ? 'text-indigo-800 font-bold bg-indigo-50' : 'text-slate-700'}`}
                    >
                      <span>Admin</span>
                      {role === 'admin' && <UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Top Navigation Tabs Bar */}
        {user && navLinks.length > 0 && onTabChange && (
          <div className="border-t border-slate-200/80 bg-slate-50/70 backdrop-blur-md px-4 sm:px-6">
            <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onTabChange(link.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-warm-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Tab Bar for Small Screens */}
      {user && navLinks.length > 0 && onTabChange && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-warm-xl px-2 py-1.5 flex items-center justify-around">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onTabChange(link.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="truncate max-w-[64px]">{link.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      )}

      <SupabaseConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </>
  );
}
