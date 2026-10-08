import React, { useState } from 'react';
import { Database, Key, CheckCircle, AlertTriangle, X, Code, ExternalLink } from 'lucide-react';
import { updateSupabaseCredentials, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function SupabaseConfigModal({ isOpen, onClose }) {
  const { showToast } = useAuth();
  const [url, setUrl] = useState(localStorage.getItem('supabase_url') || import.meta.env.VITE_SUPABASE_URL || '');
  const [key, setKey] = useState(localStorage.getItem('supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [activeTab, setActiveTab] = useState('credentials'); // 'credentials' | 'sql'

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const isOk = updateSupabaseCredentials(url, key);
    if (isOk) {
      showToast('Supabase credentials saved successfully! Connected to PostgreSQL database.', 'success');
    } else {
      showToast('Credentials cleared or invalid. Reverted to Local Storage Mock DB.', 'info');
    }
    onClose();
    window.location.reload();
  };

  const isConnected = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Supabase PostgreSQL Connection</h3>
              <p className="text-xs text-slate-400">Configure your live database credentials or view SQL scripts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'credentials' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            API Credentials
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'sql' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Code className="w-4 h-4" /> SQL Schema & Seed
          </button>
        </div>

        {activeTab === 'credentials' ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${isConnected ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-amber-950/30 border-amber-500/30 text-amber-300'}`}>
              {isConnected ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
              <div className="text-xs leading-relaxed">
                <span className="font-bold">{isConnected ? 'Status: Connected to Supabase' : 'Status: Using Local Mock Persistence Engine'}</span>
                <p className="mt-1 opacity-90">
                  {isConnected
                    ? 'All operations (Students, Rooms, Fees, Complaints, Mess) directly query your Supabase PostgreSQL database!'
                    : 'No API credentials detected. The app is running smoothly using browser local storage mock DB pre-seeded with sample data. Enter your Supabase URL & Key below to switch to real Supabase!'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Supabase Project URL</label>
              <div className="relative">
                <Database className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="https://your-project-id.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/70 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Supabase Anon Public Key</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/70 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                Open Supabase Dashboard <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUrl('');
                    setKey('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Save Credentials
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Copy and execute the entire SQL script from <code className="text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">sql/schema.sql</code> into your Supabase SQL Editor to instantly create all tables, indexes, and sample seed data!
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-60 overflow-y-auto text-xs text-emerald-400 font-mono">
              <pre>{`-- Tables included in sql/schema.sql:
-- 1. students (student_id, name, email, phone, course, year, gender, meal_pref, created_at)
-- 2. rooms (room_id, room_number, floor, type, capacity, status)
-- 3. allocations (allocation_id, student_id, room_id, alloc_date, vacate_date)
-- 4. fees (fee_id, student_id, amount, semester, due_date, paid_date, status)
-- 5. complaints (complaint_id, student_id, category, description, raised_date, status, resolved_date)
-- 6. mess_menu (menu_id, day_of_week, meal_type, items)

-- Indexes included:
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_fees_student ON fees(student_id);
CREATE INDEX idx_fees_status ON fees(status);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_rooms_status ON rooms(status);`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
