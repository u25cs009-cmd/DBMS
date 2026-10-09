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
    student: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    warden: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    admin: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
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
      {/* Fixed Sticky Header Container that stays at the top during scroll */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        {/* Top Header Row */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-2">
                Hostel<span className="text-indigo-600">Connect</span>
              </span>
              <span className="text-[10px] text-slate-500 block -mt-1 font-medium hidden sm:block">
                DBMS Hostel Operations Platform
              </span>
            </div>
          </div>

          {/* Right Controls */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Active User Pill */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user?.name}</p>
                </div>
              </div>

              {/* Database Status Button */}
              <button
                onClick={() => setIsConfigOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 border border-slate-200 hover:bg-slate-200/80 transition-all text-slate-700"
                title="Click to configure Supabase DB"
              >
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">{isConnected ? 'Supabase DB' : 'Local Mock DB'}</span>
              </button>

              {!isConnected && (
                <button
                  onClick={handleResetData}
                  className="p-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                  title="Reset mock data to default seed"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Role Switcher Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border uppercase tracking-wider transition-all ${roleColors[role] || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{role}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-fade-in space-y-1">
                    <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-semibold uppercase text-slate-400">
                      Switch Active Role
                    </div>
                    <button
                      onClick={() => handleRoleSwitch('student')}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${role === 'student' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'}`}
                    >
                      <span>Student Dashboard</span>
                      {role === 'student' && <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('warden')}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${role === 'warden' ? 'text-amber-700 font-bold bg-amber-50/50' : 'text-slate-700'}`}
                    >
                      <span>Warden Dashboard</span>
                      {role === 'warden' && <UserCheck className="w-3.5 h-3.5 text-amber-600" />}
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${role === 'admin' ? 'text-indigo-700 font-bold bg-indigo-50/50' : 'text-slate-700'}`}
                    >
                      <span>Admin Dashboard</span>
                      {role === 'admin' && <UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Navigation Tabs Bar (Sticky Top Navigation) */}
        {user && navLinks.length > 0 && onTabChange && (
          <div className="border-t border-slate-100 bg-slate-50/70 backdrop-blur-md px-4 md:px-6">
            <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onTabChange(link.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <SupabaseConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </>
  );
}
