import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/supabase';
import {
  BedDouble,
  Receipt,
  MessageSquareWarning,
  UtensilsCrossed,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Send,
  Loader2,
  DollarSign,
  Sparkles,
  MapPin,
  ShieldCheck,
  User,
  ArrowRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [allocation, setAllocation] = useState(null);
  const [fees, setFees] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [messMenu, setMessMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Complaint Form state
  const [category, setCategory] = useState('plumbing');
  const [description, setDescription] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // Selected Day for Mess Menu
  const [selectedDay, setSelectedDay] = useState('Monday');

  const studentId = user?.student_id || 1;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allocData, feesData, complaintsData, menuData] = await Promise.all([
        db.getStudentAllocation(studentId),
        db.getFees(studentId),
        db.getComplaints(studentId),
        db.getMessMenu()
      ]);
      setAllocation(allocData);
      setFees(feesData);
      setComplaints(complaintsData);
      setMessMenu(menuData);
    } catch (e) {
      console.error(e);
      showToast('Error loading student records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const handleRaiseComplaint = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('Please provide a complaint description', 'error');
      return;
    }

    setSubmittingComplaint(true);
    try {
      await db.createComplaint(studentId, category, description);
      showToast('Complaint submitted successfully to Warden!', 'success');
      setDescription('');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to submit complaint', 'error');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handlePayFee = async (fee_id) => {
    try {
      await db.markFeePaid(fee_id);
      showToast('Fee payment recorded as PAID successfully!', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to record payment', 'error');
    }
  };

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'शुभ प्रभात • Good morning';
    if (hour < 17) return 'शुभ दोपहर • Good afternoon';
    return 'शुभ संध्या • Good evening';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> {status.toUpperCase()}
          </span>
        );
      case 'unpaid':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> {status.toUpperCase()}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
            <Clock className="w-3.5 h-3.5 text-orange-600" /> IN PROGRESS
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" /> {status.toUpperCase()}
          </span>
        );
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">{status}</span>;
    }
  };

  // Fee calculation metrics
  const totalFeeAmount = fees.reduce((acc, f) => acc + Number(f.amount || 0), 0);
  const paidFeeAmount = fees.filter(f => f.status === 'paid').reduce((acc, f) => acc + Number(f.amount || 0), 0);
  const pendingFeeAmount = totalFeeAmount - paidFeeAmount;
  const feePercent = totalFeeAmount > 0 ? Math.round((paidFeeAmount / totalFeeAmount) * 100) : 100;

  // Today's thali day
  const todayWeekday = dayOrder[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const todayMeals = messMenu.filter(m => m.day_of_week === todayWeekday);

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50/30 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-stone-600 gap-4">
          <div className="p-4 rounded-3xl bg-white border border-orange-200/80 shadow-warm flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
            <span className="font-bold text-sm text-stone-800">विद्यार्थी रिकॉर्ड लोड हो रहे हैं • Fetching Student Records...</span>
          </div>
        </div>
      </div>
    );
  }

  const activeDayMeals = messMenu.filter(m => m.day_of_week === selectedDay);

  return (
    <div className="min-h-screen bg-orange-50/30 text-stone-900 flex flex-col">
      <Navbar currentTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24 sm:pb-8">
        
        {/* Creative Personal Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-orange-200/80 bg-gradient-to-r from-red-800 via-orange-700 to-red-800 text-white p-6 sm:p-8 shadow-warm-lg">
          {/* Subtle Jaali / Dotted Traditional Background Pattern */}
          <div className="absolute inset-0 bg-jaali opacity-10 pointer-events-none" />
          <div className="absolute -right-16 -top-16 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20 text-orange-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{getGreeting()}</span>
                <span>•</span>
                <span className="font-['Noto_Sans_Devanagari',sans-serif]">सत्र 2026–27</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                नमस्ते, <span className="text-amber-300 font-['Noto_Sans_Devanagari',sans-serif]">{user?.name || 'Rahul'}</span> 🙏
              </h1>
              <p className="text-xs sm:text-sm text-orange-100 max-w-xl font-normal leading-relaxed">
                Welcome to your resident dashboard. Check room allotment, track dues in ₹, raise issues to the warden, and view weekly mess meals.
              </p>
            </div>

            {/* Quick Summary Pill Badges */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center min-w-[110px]">
                <span className="text-[10px] uppercase font-bold text-orange-200 block">Room Number</span>
                <span className="text-lg font-black text-white">
                  {allocation ? `Room ${allocation.rooms?.room_number || allocation.room_id}` : 'Unallotted'}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center min-w-[110px]">
                <span className="text-[10px] uppercase font-bold text-orange-200 block">Pending Dues</span>
                <span className="text-lg font-black text-amber-300">
                  ₹{pendingFeeAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Pills Bar */}
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-orange-100 shadow-warm-sm gap-3 overflow-x-auto">
          <span className="text-xs font-extrabold text-stone-500 uppercase tracking-wider px-2 flex items-center gap-1.5 shrink-0">
            <span className="text-orange-600">⚡</span> Quick Actions:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('complaints')}
              className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-orange-600" /> Raise Complaint
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Pay Fees
            </button>
            <button
              onClick={() => setActiveTab('mess')}
              className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" /> Today's Thali
            </button>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: OVERVIEW & ROOM DETAILS
           ========================================================================= */}
        {(activeTab === 'overview' || activeTab === 'room') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            
            {/* 1. ROOM "ID CARD" STYLE CARD */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-orange-200/80 shadow-warm p-6 space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-stone-900 tracking-tight">Hostel Resident ID Card</h2>
                    <p className="text-[11px] text-stone-500">Official Block & Room Allocation Record</p>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Allotted
                </span>
              </div>

              {allocation ? (
                <div className="space-y-4">
                  {/* Resident ID Strip */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-600 to-red-700 text-white font-black text-base flex items-center justify-center shadow-warm-sm">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'RS'}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-stone-900">{user?.name || 'Rahul Sharma'}</h3>
                        <p className="text-xs text-stone-600 font-medium">{user?.course || 'B.Tech CSE'} • Year {user?.year || 2}</p>
                        <span className="text-[10px] font-mono font-bold text-orange-700">Resident ID #{studentId}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">Hostel Block</span>
                      <span className="text-base font-black text-stone-900">Block B (Boys)</span>
                    </div>
                  </div>

                  {/* Room Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-center">
                      <span className="text-stone-400 font-bold text-[10px] uppercase block">Room</span>
                      <span className="text-base font-black text-stone-900">{allocation.rooms?.room_number || '101'}</span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-center">
                      <span className="text-stone-400 font-bold text-[10px] uppercase block">Floor</span>
                      <span className="text-base font-black text-stone-900">Floor #{allocation.rooms?.floor || 1}</span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-center">
                      <span className="text-stone-400 font-bold text-[10px] uppercase block">Sharing</span>
                      <span className="text-base font-black text-stone-900 capitalize">{allocation.rooms?.type || 'Double'}</span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-center">
                      <span className="text-stone-400 font-bold text-[10px] uppercase block">Allocated</span>
                      <span className="text-xs font-extrabold text-stone-800">{allocation.alloc_date || '2026-07-15'}</span>
                    </div>
                  </div>

                  {/* Roommates Avatar Circles */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">Roommates in {allocation.rooms?.room_number || '101'}</h4>
                      <p className="text-[11px] text-stone-500">2 Beds allocated out of {allocation.rooms?.capacity || 2}</p>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs" title="Rahul Sharma (You)">
                        RS
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs" title="Amit Patel (Roommate)">
                        AP
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-stone-500 text-xs">
                  <p className="text-lg mb-1">🏡</p>
                  No active room allocation found. Please contact the hostel warden.
                </div>
              )}
            </div>

            {/* 2. FEE PROGRESS & PAYMENT SUMMARY */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-orange-200/80 shadow-warm p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-stone-900 tracking-tight">Hostel Fee Progress</h2>
                    <p className="text-[11px] text-stone-500">Semester dues & payment completion status</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('fees')}
                  className="text-xs font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress Bar & Amount Ring */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Paid</span>
                    <div className="text-xl font-black text-emerald-700">₹{paidFeeAmount.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Billed</span>
                    <div className="text-base font-extrabold text-stone-800">₹{totalFeeAmount.toLocaleString()}</div>
                  </div>
                </div>

                {/* Styled Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                      style={{ width: `${Math.min(feePercent, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-stone-500">
                    <span>{feePercent}% Cleared</span>
                    <span className={pendingFeeAmount > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                      {pendingFeeAmount > 0 ? `₹${pendingFeeAmount.toLocaleString()} Pending` : 'All Dues Paid 🎉'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fee Cards List */}
              <div className="space-y-2.5">
                {fees.slice(0, 2).map((fee) => (
                  <div key={fee.fee_id} className="p-3.5 bg-white rounded-2xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-stone-900">{fee.semester}</span>
                      <span className="text-[11px] text-stone-500 block">Due Date: {fee.due_date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-stone-900">₹{Number(fee.amount).toLocaleString()}</span>
                      {getStatusBadge(fee.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: FEES PAGE
           ========================================================================= */}
        {(activeTab === 'fees' || activeTab === 'overview') && (
          <div className="bg-white rounded-3xl border border-orange-200/80 shadow-warm p-6 space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-stone-900 tracking-tight">Hostel & Mess Fee Records</h2>
                  <p className="text-xs text-stone-500">Track semester-wise payments, dues in ₹, and instant online receipt clearing</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-600 uppercase text-[10px] font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4">Semester</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Paid Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {fees.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-stone-400">
                        <span className="text-xl block mb-1">🧾</span>
                        Koi fee record nahi mila • No fee records found.
                      </td>
                    </tr>
                  ) : (
                    fees.map((fee) => (
                      <tr key={fee.fee_id} className="hover:bg-orange-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-stone-900">{fee.semester}</td>
                        <td className="py-3.5 px-4 font-black text-orange-700">₹{Number(fee.amount).toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-stone-600 font-medium">{fee.due_date}</td>
                        <td className="py-3.5 px-4 text-stone-600 font-medium">{fee.paid_date || '—'}</td>
                        <td className="py-3.5 px-4">{getStatusBadge(fee.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          {fee.status !== 'paid' ? (
                            <button
                              onClick={() => handlePayFee(fee.fee_id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs rounded-xl shadow-warm-sm transition-all inline-flex items-center gap-1 hover:scale-[1.02]"
                            >
                              <DollarSign className="w-3.5 h-3.5" /> Pay Online
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              Paid ✓
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: COMPLAINTS PAGE & TIMELINE STEPPER
           ========================================================================= */}
        {(activeTab === 'complaints' || activeTab === 'overview') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* Complaint Form */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-orange-200/80 shadow-warm p-6 space-y-5">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                  <MessageSquareWarning className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-stone-900 tracking-tight">Raise New Complaint</h2>
                  <p className="text-xs text-stone-500">Report plumbing, Wi-Fi or electricity issues</p>
                </div>
              </div>

              <form onSubmit={handleRaiseComplaint} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full py-2.5 px-3 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-orange-600 focus:bg-white capitalize font-semibold"
                  >
                    <option value="plumbing">🚰 Plumbing</option>
                    <option value="electricity">⚡ Electricity</option>
                    <option value="cleanliness">🧹 Cleanliness</option>
                    <option value="furniture">🪑 Furniture Repair</option>
                    <option value="internet">📶 Internet / Wi-Fi</option>
                    <option value="other">📌 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Description</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Describe the issue in detail (e.g. Water leaking from bathroom tap in room 101)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-orange-600 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingComplaint}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white font-bold text-xs rounded-xl shadow-warm-sm transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  {submittingComplaint ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Submit Complaint to Warden</span>
                </button>
              </form>
            </div>

            {/* Complaint History with Timeline Steppers */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-orange-200/80 shadow-warm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h2 className="text-base font-black text-stone-900 tracking-tight">Complaint History & Timeline</h2>
                  <p className="text-xs text-stone-500">Live 3-step resolution progress</p>
                </div>
                <span className="text-xs text-stone-500 font-bold bg-stone-100 px-3 py-1 rounded-full">
                  {complaints.length} Total Complaints
                </span>
              </div>

              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {complaints.length === 0 ? (
                  <div className="text-center py-12 text-stone-400 text-xs">
                    <span className="text-3xl block mb-2">🎉</span>
                    <p className="font-bold text-stone-700 text-sm">Koi complaint nahi! Sab badhiya hai 🎉</p>
                    <p className="text-stone-400 mt-0.5">You have no active maintenance issues.</p>
                  </div>
                ) : (
                  complaints.map((c) => {
                    const isRaised = true;
                    const isInProgress = c.status === 'in_progress' || c.status === 'resolved';
                    const isResolved = c.status === 'resolved';

                    return (
                      <div key={c.complaint_id} className="p-4 bg-stone-50/70 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-orange-800 px-2.5 py-0.5 rounded-full bg-orange-100 border border-orange-200">
                            {c.category}
                          </span>
                          <div>{getStatusBadge(c.status)}</div>
                        </div>

                        <p className="text-xs text-stone-800 leading-relaxed font-semibold">{c.description}</p>

                        {/* 3-Step Timeline Stepper: Raised -> In Progress -> Resolved */}
                        <div className="pt-2 border-t border-stone-200/70">
                          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                            <div className="flex flex-col items-center gap-1">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${isRaised ? 'bg-orange-600' : 'bg-stone-300'}`}>
                                ✓
                              </div>
                              <span className={isRaised ? 'text-orange-700' : 'text-stone-400'}>Raised</span>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${isInProgress ? 'bg-amber-500' : 'bg-stone-300'}`}>
                                {isInProgress ? '✓' : '2'}
                              </div>
                              <span className={isInProgress ? 'text-amber-700' : 'text-stone-400'}>In Progress</span>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${isResolved ? 'bg-emerald-600' : 'bg-stone-300'}`}>
                                {isResolved ? '✓' : '3'}
                              </div>
                              <span className={isResolved ? 'text-emerald-700' : 'text-stone-400'}>Resolved</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                          <span>Raised: {new Date(c.raised_date).toLocaleDateString()}</span>
                          {c.resolved_date && (
                            <span className="text-emerald-700 font-bold">Resolved: {new Date(c.resolved_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: MESS MENU - "TODAY'S THALI" & 7-DAY SCHEDULE
           ========================================================================= */}
        {(activeTab === 'mess' || activeTab === 'overview') && (
          <div className="bg-white rounded-3xl border border-orange-200/80 shadow-warm p-6 space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-stone-900 tracking-tight">Hostel Mess Menu</h2>
                  <p className="text-xs text-stone-500">Homely breakfast, lunch & dinner prepared fresh daily</p>
                </div>
              </div>

              {/* Day selector pills */}
              <div className="flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 overflow-x-auto">
                {dayOrder.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedDay === day
                        ? 'bg-gradient-to-r from-orange-600 to-red-700 text-white shadow-warm-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Today's Special Thali Highlight Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="text-3xl">🍛</span>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                    Today's Thali • {todayWeekday}
                  </span>
                  <h3 className="text-sm font-black text-stone-900 mt-0.5">Ghar Jaisa Khana</h3>
                </div>
              </div>
              <p className="text-xs text-stone-600 max-w-md font-medium text-center md:text-right">
                All meals follow FSSAI hygiene standards. Pure vegetarian & special non-veg days as per hostel calendar.
              </p>
            </div>

            {/* Meals Grid for Selected Day */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['breakfast', 'lunch', 'dinner'].map((mType) => {
                const mealItem = activeDayMeals.find((m) => m.meal_type === mType);
                const config = {
                  breakfast: { emoji: '🌅', label: 'Breakfast', time: '7:30 – 9:30 AM', color: 'text-orange-700 bg-orange-50' },
                  lunch: { emoji: '☀️', label: 'Lunch', time: '12:30 – 2:30 PM', color: 'text-amber-800 bg-amber-50' },
                  dinner: { emoji: '🌙', label: 'Dinner', time: '7:30 – 9:30 PM', color: 'text-red-800 bg-red-50' },
                }[mType];

                return (
                  <div key={mType} className="p-5 bg-stone-50/70 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{config.emoji}</span>
                        <h4 className="text-xs font-black uppercase text-stone-900">{config.label}</h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.color}`}>
                        {config.time}
                      </span>
                    </div>
                    <p className="text-xs text-stone-800 font-medium leading-relaxed bg-white p-3 rounded-xl border border-stone-200/80">
                      {mealItem?.items || 'Poha, Chai, Paratha Special'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
