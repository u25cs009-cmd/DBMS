import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  KeyRound,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Shield,
  BedDouble,
  Receipt,
  UtensilsCrossed,
  Eye,
  EyeOff,
  Database,
  Zap,
  Lock
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export default function Login() {
  const { login, register, quickLogin } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [roleChoice, setRoleChoice] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (isRegister) {
      const res = await register(name, email, password, roleChoice);
      setSubmitting(false);
      if (res.success) {
        navigate(`/${roleChoice}`);
      }
    } else {
      const res = await login(email, password);
      setSubmitting(false);
      if (res.success) {
        const destRole = res.role || 'student';
        navigate(`/${destRole}`);
      }
    }
  };

  const handleQuickLogin = (role) => {
    const activeRole = quickLogin(role);
    navigate(`/${activeRole}`);
  };

  const isConnected = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Hero Brand Showcase Column */}
        <div className="lg:col-span-6 space-y-8 pr-0 lg:pr-6 text-left">
          
          {/* Top Brand Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 shadow-sm">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
            <span className="text-slate-700 font-medium">{isConnected ? 'PostgreSQL Database Live' : 'Demo & Mock Mode Ready'}</span>
            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-mono">v1.0</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/20 text-white">
                <Building2 className="w-8 h-8" />
              </div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">Hostel<span className="text-indigo-600">Connect</span></span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Next-Gen <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">Hostel Operations</span> Platform
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed font-normal max-w-lg">
              Streamline room allocations, automate fee tracking, resolve student complaints in real-time, and manage weekly mess menus — with multi-role access control for Students, Wardens, and Admins.
            </p>
          </div>

          {/* Feature Badges Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <BedDouble className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Room Allocation</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Capacity & floor occupancy</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Fee Tracking</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Semester dues & instant pay</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Warden Complaints</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Real-time status updates</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Mess Management</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">7-Day breakfast, lunch & dinner</p>
              </div>
            </div>
          </div>

          {/* Database Architecture Tag */}
          <div className="pt-2 flex items-center gap-4 text-xs text-slate-500 border-t border-slate-200">
            <span className="flex items-center gap-1.5 font-semibold text-slate-600">
              <Database className="w-3.5 h-3.5 text-indigo-600" /> PostgreSQL 3NF Schema
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-600">
              <Lock className="w-3.5 h-3.5 text-emerald-600" /> Supabase RLS
            </span>
          </div>
        </div>

        {/* Right Auth Card Column */}
        <div className="lg:col-span-6 w-full">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6 text-slate-900">
            
            {/* Header / Mode Switcher */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {isRegister ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRegister ? 'Select your role and sign up below' : 'Select a demo role or sign in with your email'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all"
              >
                {isRegister ? 'Sign In' : 'Register'}
              </button>
            </div>

            {/* Quick Role Demo Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> 1-Click Quick Demo Login
                </span>
                <span className="text-[10px] text-slate-400 font-medium">No password required</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('student')}
                  className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/80 text-left transition-all hover:scale-[1.02] group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-extrabold text-emerald-600 group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1.5">Student</div>
                  <div className="text-[10px] text-emerald-800 font-medium truncate">Rahul Sharma</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('warden')}
                  className="p-3 rounded-2xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100/80 text-left transition-all hover:scale-[1.02] group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span className="text-[10px] font-extrabold text-amber-600 group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1.5">Warden</div>
                  <div className="text-[10px] text-amber-800 font-medium truncate">Dr. V.K. Singh</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="p-3 rounded-2xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100/80 text-left transition-all hover:scale-[1.02] group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px] font-extrabold text-indigo-600 group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1.5">Admin</div>
                  <div className="text-[10px] text-indigo-800 font-medium truncate">Hostel Admin</div>
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Or Sign In with Email</span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="student@hostel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['student', 'warden', 'admin'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRoleChoice(r)}
                        className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                          roleChoice === r
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {submitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>{isRegister ? 'Create Account & Continue' : 'Sign In to Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-1 border-t border-slate-100">
              <p className="text-[11px] text-slate-400">
                Hostel Management System • DBMS Project • B.Tech CSE
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
