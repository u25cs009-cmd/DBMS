import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2, KeyRound, Mail, User, ArrowRight, Sparkles, GraduationCap, Shield,
  BedDouble, Receipt, UtensilsCrossed, Eye, EyeOff, Zap, Lock, Phone, MapPin,
  Menu, X, ChevronDown, Star, Check, Wifi, Camera, Shirt, Droplets, BookOpen,
  Clock, MessageSquareWarning, Users
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

/* ---------- Static content for the landing page ---------- */
const NAV = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Rooms & Fees', href: '#rooms' },
  { label: 'Mess Menu', href: '#mess' },
  { label: 'FAQ', href: '#faq' },
];

const FEATURES = [
  { icon: BedDouble, title: 'Room Allocation', text: 'Block, floor and bed-wise occupancy. Students see their room, roommates and warden details instantly.', tone: 'indigo' },
  { icon: Receipt, title: 'Fee Tracking', text: 'Semester-wise hostel fee, mess charges and dues in ₹ with one-tap payment status and receipts.', tone: 'emerald' },
  { icon: MessageSquareWarning, title: 'Complaints & Warden Desk', text: 'Raise water, electricity, Wi-Fi or cleaning issues and track them live until the warden resolves them.', tone: 'rose' },
  { icon: UtensilsCrossed, title: 'Mess Management', text: '7-day breakfast, lunch & dinner menu, planned by the admin and visible to every student.', tone: 'amber' },
];

const TONES = {
  indigo: 'bg-indigo-100 text-indigo-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  rose: 'bg-rose-100 text-rose-700',
  amber: 'bg-amber-100 text-amber-700',
};

const ROOMS = [
  { name: 'Triple Sharing', price: '₹ 45,000', note: 'per year • 3 students', perks: ['Study table & almirah each', 'Attached washroom on floor', 'Wi-Fi & laundry'], tag: 'Budget friendly' },
  { name: 'Double Sharing', price: '₹ 65,000', note: 'per year • 2 students', perks: ['Cot, mattress & study table', 'Cooler / fan included', 'Wi-Fi & laundry'], tag: 'Most popular', popular: true },
  { name: 'Single Room', price: '₹ 95,000', note: 'per year • 1 student', perks: ['Private room & balcony', 'Attached washroom', 'Priority mess seating'], tag: 'Premium' },
];

const AMENITIES = [
  { icon: Wifi, label: 'High-speed Wi-Fi' },
  { icon: Camera, label: '24×7 CCTV Security' },
  { icon: Shirt, label: 'Laundry Service' },
  { icon: Droplets, label: 'RO Water & Power Backup' },
  { icon: BookOpen, label: 'Reading Room' },
  { icon: Clock, label: 'Biometric Entry' },
];

const MESS = {
  Mon: { b: 'Poha, Jalebi, Tea', l: 'Dal Tadka, Jeera Rice, Roti, Mixed Veg', d: 'Paneer Butter Masala, Roti, Rice, Salad' },
  Tue: { b: 'Idli, Sambar, Coconut Chutney', l: 'Rajma, Steamed Rice, Roti, Raita', d: 'Mix Veg, Dal Fry, Roti, Desserts' },
  Wed: { b: 'Stuffed Paratha, Curd, Pickle', l: 'Kadhi Pakora, Rice, Roti, Crispy Veg', d: 'Chole, Puri, Jeera Rice, Kheer' },
  Thu: { b: 'Upma, Fresh Fruits, Tea', l: 'Chana Dal, Rice, Roti, Veg Curry', d: 'Egg Curry / Soya Chaap, Roti, Rice' },
  Fri: { b: 'Masala Dosa, Sambar', l: 'Dal Makhani, Pulao, Roti, Boondi Raita', d: 'Veg Biryani, Raita, Papad, Ice Cream' },
  Sat: { b: 'Chole Bhature, Lassi', l: 'Sev Tamatar, Dal, Rice, Roti', d: 'Pav Bhaji, Pulao, Sweet' },
  Sun: { b: 'Puri Bhaji, Halwa', l: 'Special Thali – Paneer, Dal, Rice, Roti, Sweet', d: 'Khichdi, Papad, Kadhi, Chutney' },
};

const STEPS = [
  { icon: GraduationCap, role: 'Student', text: 'Check room & roommates, pay fees, raise complaints and view the mess menu.', tone: 'emerald' },
  { icon: Shield, role: 'Warden', text: 'Resolve complaints, monitor rooms and occupancy across every block.', tone: 'amber' },
  { icon: Building2, role: 'Admin', text: 'Manage student directory, allocations, billing and the weekly mess plan.', tone: 'indigo' },
];

const TESTIMONIALS = [
  { name: 'Rahul Sharma', meta: 'B.Tech CSE, 2nd Year', text: 'Fee dues and room details are all in one place now. No more running to the hostel office.' },
  { name: 'Ananya Patel', meta: 'B.Pharm, 3rd Year', text: 'I raised a water-cooler complaint at night and it was resolved the next morning. Very transparent.' },
  { name: 'Dr. V.K. Singh', meta: 'Chief Warden', text: 'Occupancy and complaints are visible on one dashboard. It saves hours of register work every week.' },
];

const FAQS = [
  { q: 'How do I get my room allotted?', a: 'Register as a student, and the hostel admin allocates your block, floor and bed. You can see the details under "My Room Details" once allotted.' },
  { q: 'How can I pay hostel and mess fees?', a: 'Open "Fee Records" in your dashboard to see semester dues and mark/pay them. Paid and pending amounts are shown in ₹.' },
  { q: 'Whom do I contact for repairs or issues?', a: 'Raise a complaint from your dashboard. The warden gets notified and updates the status from Pending to Resolved.' },
  { q: 'Can I try the portal without registering?', a: 'Yes! Use the 1-click Quick Demo Login on this page to explore the Student, Warden or Admin dashboard.' },
];

/* ---------- Page ---------- */
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [day, setDay] = useState('Mon');
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (isRegister) {
      const res = await register(name, email, password, roleChoice);
      setSubmitting(false);
      if (res.success) navigate(`/${roleChoice}`);
    } else {
      const res = await login(email, password);
      setSubmitting(false);
      if (res.success) navigate(`/${res.role || 'student'}`);
    }
  };

  const handleQuickLogin = (role) => {
    const activeRole = quickLogin(role);
    navigate(`/${activeRole}`);
  };

  const isConnected = isSupabaseConfigured();
  const input = 'w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors';

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 scroll-smooth">
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-slate-100 text-[11px] sm:text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <span className="font-semibold">🎉 Hostel admissions open for 2026–27 • Limited beds available</span>
          <a href="tel:+911234567890" className="hidden sm:flex items-center gap-1.5 font-semibold hover:underline">
            <Phone className="w-3 h-3" /> Helpline: +91 12345 67890
          </a>
        </div>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-600 text-white shadow-md shadow-indigo-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <span className="block font-extrabold text-lg text-slate-900">Hostel<span className="text-indigo-600">Connect</span></span>
              <span className="block text-[10px] text-slate-500 font-medium">Hostel Management Portal</span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="hover:text-indigo-600 transition-colors">{n.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href="#login" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/25 transition-colors">
              Login / Register <ArrowRight className="w-4 h-4" />
            </a>
            <button className="lg:hidden p-2 rounded-lg border border-slate-200" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
            {[...NAV, { label: 'Login / Register', href: '#login' }].map((n) => (
              <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-indigo-50">{n.label}</a>
            ))}
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1.2px, transparent 1.2px)', backgroundSize: '22px 22px' }} />
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-indigo-200/30 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-sky-200/30 rounded-full blur-[110px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold shadow-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
              {isConnected ? 'Live database connected' : 'Demo mode ready — try it instantly'}
            </div>

            <p className="text-indigo-600 font-bold text-lg">Welcome to HostelConnect! ✨</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900">
              Modern Hostel Living,<br />
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">Simplified & Connected.</span>
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl leading-relaxed">
              Safe rooms, healthy mess food and a smart portal for room allotment, fee tracking, complaints and mess menu — built for Students, Wardens and Admins.
            </p>

            <div className="flex flex-wrap gap-3">
              <a href="#login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]">
                Get Started <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#rooms" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors">
                View Rooms & Fees
              </a>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-slate-600 font-medium">
              {['Veg & Non-veg mess', 'Separate Boys / Girls blocks', '24×7 warden support'].map((t) => (
                <span key={t} className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" />{t}</span>
              ))}
            </div>
          </div>

          {/* Auth card */}
          <div id="login" className="lg:col-span-5 scroll-mt-24">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-indigo-950/10 p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{isRegister ? 'Select your role and sign up' : 'Sign in or try a demo role'}</p>
                </div>
                <button type="button" onClick={() => setIsRegister(!isRegister)} className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all">
                  {isRegister ? 'Sign In' : 'Register'}
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> 1-Click Demo Login
                  </span>
                  <span className="text-[10px] text-slate-400">No password required</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { r: 'student', Icon: GraduationCap, who: 'Rahul Sharma', c: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700' },
                    { r: 'warden', Icon: Shield, who: 'Dr. V.K. Singh', c: 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700' },
                    { r: 'admin', Icon: Building2, who: 'Hostel Admin', c: 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700' },
                  ].map(({ r, Icon, who, c }) => (
                    <button key={r} type="button" onClick={() => handleQuickLogin(r)} className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.03] ${c}`}>
                      <Icon className="w-4 h-4" />
                      <div className="text-xs font-bold text-slate-900 mt-1.5 capitalize">{r}</div>
                      <div className="text-[10px] font-medium truncate">{who}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Or with email</span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input type="text" required placeholder="Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} className={input} />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input type="email" required placeholder="student@hostel.com" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={`${input} pr-10`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isRegister && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Role</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['student', 'warden', 'admin'].map((r) => (
                        <button key={r} type="button" onClick={() => setRoleChoice(r)}
                          className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${roleChoice === r ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button type="submit" disabled={submitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                  {submitting ? 'Processing...' : (<><span>{isRegister ? 'Create Account & Continue' : 'Sign In to Dashboard'}</span><ArrowRight className="w-4 h-4" /></>)}
                </button>
              </form>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Lock className="w-3 h-3" /> Secure login • Role-based access control
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['500+', 'Students Housed'], ['180', 'Rooms'], ['4', 'Boys & Girls Blocks'], ['24×7', 'Warden Support']].map(([n, l]) => (
            <div key={l}>
              <div className="text-3xl font-black">{n}</div>
              <div className="text-xs sm:text-sm text-indigo-200 font-medium">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-20">
        <SectionTitle eyebrow="Everything in one portal" title="Hostel life, made simple" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {FEATURES.map(({ icon: Icon, title, text, tone }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${TONES[tone]}`}><Icon className="w-6 h-6" /></div>
              <h3 className="mt-4 font-extrabold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {STEPS.map(({ icon: Icon, role, text, tone }) => (
            <div key={role} className="flex gap-4 bg-white/70 rounded-2xl border border-slate-200 p-5">
              <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${TONES[tone]}`}><Icon className="w-5 h-5" /></div>
              <div>
                <h4 className="font-bold text-slate-900">For {role}s</h4>
                <p className="text-sm text-slate-600 mt-1">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rooms & fees */}
      <section id="rooms" className="bg-white border-y border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <SectionTitle eyebrow="Rooms & Fees" title="Pick a room that fits your budget" />
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {ROOMS.map((r) => (
              <div key={r.name} className={`relative rounded-3xl p-7 border ${r.popular ? 'border-indigo-500 shadow-2xl shadow-indigo-500/15 bg-gradient-to-b from-indigo-50/50 to-white' : 'border-slate-200 bg-white shadow-sm'}`}>
                <span className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-[11px] font-bold ${r.popular ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{r.tag}</span>
                <h3 className="text-lg font-extrabold text-slate-900">{r.name}</h3>
                <div className="mt-3 text-4xl font-black text-indigo-600">{r.price}</div>
                <p className="text-xs text-slate-500 mt-1">{r.note}</p>
                <ul className="mt-5 space-y-2.5">
                  {r.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-600 shrink-0" />{p}</li>
                  ))}
                </ul>
                <a href="#login" className={`mt-6 block text-center py-2.5 rounded-xl font-bold text-sm transition-colors ${r.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}>Apply Now</a>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">* Sample rates for demonstration. Final fees are shown in your Fee Records.</p>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-12">
            {AMENITIES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <Icon className="w-6 h-6 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mess menu */}
      <section id="mess" className="max-w-5xl mx-auto px-4 py-16 scroll-mt-20">
        <SectionTitle eyebrow="Mess Management" title="Fresh & Healthy Daily Meals" />
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {Object.keys(MESS).map((d) => (
            <button key={d} onClick={() => setDay(d)}
              className={`px-5 py-2 rounded-full text-sm font-bold border transition-all ${day === d ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
              {d}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-6">
          {[['🌅 Breakfast', MESS[day].b, '7:30 – 9:00 AM'], ['☀️ Lunch', MESS[day].l, '12:30 – 2:30 PM'], ['🌙 Dinner', MESS[day].d, '7:30 – 9:30 PM']].map(([t, items, time]) => (
            <div key={t} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900">{t}</h4>
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full">{time}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{items}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">* Sample menu. The live menu is managed by the admin inside the portal.</p>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <SectionTitle eyebrow="Voices from the hostel" title="Loved by students & wardens" />
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex gap-0.5 text-amber-500">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">“{t.text}”</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-teal-600 text-white font-bold flex items-center justify-center text-sm">{t.name[0]}</div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 py-16 scroll-mt-20">
        <SectionTitle eyebrow="FAQ" title="Frequently Asked Questions" />
        <div className="mt-8 space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="font-bold text-slate-900 text-sm sm:text-base">{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-indigo-600 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-teal-950 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black">Ready to move in?</h3>
            <p className="text-indigo-200 mt-1">Create your account in a minute or explore the demo dashboards.</p>
          </div>
          <a href="#login" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-indigo-700 font-bold hover:bg-indigo-50 transition-colors">
            Login / Register <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <Building2 className="w-5 h-5 text-indigo-400" /> Hostel<span className="text-indigo-400">Connect</span>
            </div>
            <p className="text-sm mt-3 text-slate-400 max-w-xs">A simple, transparent hostel management platform for modern campuses.</p>
          </div>
          <div className="text-sm space-y-2">
            <h5 className="text-white font-bold mb-3">Quick Links</h5>
            {NAV.map((n) => <a key={n.label} href={n.href} className="block hover:text-indigo-400">{n.label}</a>)}
          </div>
          <div className="text-sm space-y-3">
            <h5 className="text-white font-bold mb-3">Contact</h5>
            <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-indigo-400" /> University Campus, Surat, Gujarat – 395007</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-indigo-400" /> +91 12345 67890</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-400" /> hostel@campus.edu.in</p>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
          © 2026 HostelConnect • DBMS Project • B.Tech CSE
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div className="text-center">
      <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600">{eyebrow}</span>
      <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
      <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-indigo-600 to-teal-600" />
    </div>
  );
}
