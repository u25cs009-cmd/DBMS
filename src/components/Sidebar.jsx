import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  Receipt,
  MessageSquareWarning,
  UtensilsCrossed,
  Users,
  Building,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentTab, onTabChange }) {
  const { user, role } = useAuth();

  const getLinks = () => {
    if (role === 'student') {
      return [
        { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
        { id: 'room', label: 'My Room Details', icon: BedDouble },
        { id: 'fees', label: 'Fee Records', icon: Receipt },
        { id: 'complaints', label: 'My Complaints', icon: MessageSquareWarning },
        { id: 'mess', label: 'Mess Menu', icon: UtensilsCrossed },
      ];
    }

    if (role === 'warden') {
      return [
        { id: 'overview', label: 'Warden Overview', icon: LayoutDashboard },
        { id: 'complaints', label: 'Manage Complaints', icon: MessageSquareWarning },
        { id: 'rooms', label: 'Rooms & Occupancy', icon: Building },
      ];
    }

    if (role === 'admin') {
      return [
        { id: 'overview', label: 'Admin Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Students Directory', icon: Users },
        { id: 'allocations', label: 'Room Allocations', icon: BedDouble },
        { id: 'fees', label: 'Fees & Payments', icon: Receipt },
        { id: 'mess', label: 'Manage Mess Menu', icon: UtensilsCrossed },
      ];
    }

    return [];
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* User Info Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'User Account'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {role} Role
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="p-3 space-y-1 flex-1">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          {role} Navigation
        </p>

        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onTabChange(link.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>System Version v1.0.0</span>
        <span className="text-emerald-400 font-semibold">PostgreSQL</span>
      </div>
    </aside>
  );
}
