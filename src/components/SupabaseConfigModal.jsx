import React, { useState } from 'react';
import { Database, Key, CheckCircle, AlertTriangle, X, Code, ExternalLink, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-warm-xl space-y-5 max-h-[90vh] overflow-y-auto text-slate-900 relative">
        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-teal-600 text-white rounded-2xl shadow-md shadow-indigo-600/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Supabase PostgreSQL Connection</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">Database</span>
              </div>
              <p className="text-xs text-slate-500">Configure your live database credentials or view SQL schema</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'credentials'
                ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-warm-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            API Credentials
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'sql'
                ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-warm-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-4 h-4" /> SQL Schema & Seed
          </button>
        </div>

        {activeTab === 'credentials' ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                isConnected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              {isConnected ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">
                <span className="font-extrabold block text-sm">
                  {isConnected ? 'Status: Connected to Supabase' : 'Status: Using Local Persistence Engine'}
                </span>
                <p className="mt-1 opacity-90">
                  {isConnected
                    ? 'All operations (Students, Rooms, Fees, Complaints, Mess) query your live Supabase PostgreSQL database directly.'
                    : 'No API credentials detected. Running safely in Local mode with seed data. Enter your Supabase URL & Anon Key below to connect live PostgreSQL!'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Supabase Project URL</label>
              <div className="relative">
                <Database className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="https://your-project-id.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Supabase Anon Public Key</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold"
              >
                Open Supabase Dashboard <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUrl('');
                    setKey('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 rounded-xl shadow-warm-sm transition-all hover:scale-[1.02]"
                >
                  Save Credentials
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Copy and execute the entire SQL script from <code className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono font-semibold">sql/schema.sql</code> into your Supabase SQL Editor to instantly create all tables, indexes, and sample seed data!
            </p>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 max-h-60 overflow-y-auto text-xs text-emerald-400 font-mono">
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
