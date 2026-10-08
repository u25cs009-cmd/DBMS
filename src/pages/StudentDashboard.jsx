import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
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
  DollarSign
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
      case 'resolved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> {status.toUpperCase()}</span>;
      case 'unpaid':
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" /> {status.toUpperCase()}</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20"><Clock className="w-3 h-3 text-blue-400" /> IN PROGRESS</span>;
      case 'overdue':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"><AlertCircle className="w-3 h-3" /> {status.toUpperCase()}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span>Fetching Student Dashboard Data...</span>
        </div>
      </div>
    );
  }

  const activeDayMeals = messMenu.filter(m => m.day_of_week === selectedDay);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar currentTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
          {/* Header Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Welcome back, <span className="text-indigo-400">{user?.name || 'Student'}</span>! 👋
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Course: <span className="text-slate-200 font-semibold">{user?.course || 'B.Tech CSE'}</span> • Year {user?.year || 2} • Student ID: #{studentId}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Room Allocation</span>
                <span className="text-sm font-extrabold text-indigo-400">
                  {allocation ? `Room ${allocation.rooms?.room_number || allocation.room_id}` : 'Not Allocated'}
                </span>
              </div>

              <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Pending Dues</span>
                <span className="text-sm font-extrabold text-amber-400">
                  ₹{fees.filter(f => f.status !== 'paid').reduce((acc, f) => acc + Number(f.amount), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & ROOM DETAILS */}
          {(activeTab === 'overview' || activeTab === 'room') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room Card */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <BedDouble className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-bold text-white">Allocated Room Details</h2>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active Allocation
                  </span>
                </div>

                {allocation ? (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block font-medium">Room Number</span>
                      <span className="text-lg font-extrabold text-white">{allocation.rooms?.room_number || '101'}</span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block font-medium">Floor</span>
                      <span className="text-lg font-extrabold text-white">Floor #{allocation.rooms?.floor || 1}</span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block font-medium">Room Type</span>
                      <span className="text-sm font-bold text-slate-200 capitalize">{allocation.rooms?.type || 'Single'} Bed</span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block font-medium">Allocated Date</span>
                      <span className="text-sm font-bold text-slate-200">{allocation.alloc_date || '2026-07-15'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No active room allocation found. Please contact the hostel warden or administrator.
                  </div>
                )}
              </div>

              {/* Quick Fee Snapshot */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-bold text-white">Semester Fees Overview</h2>
                  </div>
                  <button onClick={() => setActiveTab('fees')} className="text-xs font-semibold text-indigo-400 hover:underline">
                    View All Dues →
                  </button>
                </div>

                <div className="space-y-3">
                  {fees.slice(0, 2).map((fee) => (
                    <div key={fee.fee_id} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white">{fee.semester}</span>
                        <span className="text-[11px] text-slate-400 block">Due Date: {fee.due_date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-white">₹{Number(fee.amount).toLocaleString()}</span>
                        {getStatusBadge(fee.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FEES PAGE */}
          {(activeTab === 'fees' || activeTab === 'overview') && (
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Hostel Fee Records</h2>
                    <p className="text-xs text-slate-400">Track semester-wise fee payments and payment status</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Semester</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Paid Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {fees.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-slate-400">No fee records found.</td>
                      </tr>
                    ) : (
                      fees.map((fee) => (
                        <tr key={fee.fee_id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">{fee.semester}</td>
                          <td className="py-3.5 px-4 font-extrabold text-indigo-300">₹{Number(fee.amount).toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-slate-400">{fee.due_date}</td>
                          <td className="py-3.5 px-4 text-slate-400">{fee.paid_date || '—'}</td>
                          <td className="py-3.5 px-4">{getStatusBadge(fee.status)}</td>
                          <td className="py-3.5 px-4 text-right">
                            {fee.status !== 'paid' ? (
                              <button
                                onClick={() => handlePayFee(fee.fee_id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all inline-flex items-center gap-1"
                              >
                                <DollarSign className="w-3.5 h-3.5" /> Pay Online
                              </button>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-400">Paid ✓</span>
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

          {/* TAB 3: COMPLAINTS PAGE */}
          {(activeTab === 'complaints' || activeTab === 'overview') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Complaint Form */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                    <MessageSquareWarning className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Raise New Complaint</h2>
                    <p className="text-xs text-slate-400">Report an issue to the hostel warden</p>
                  </div>
                </div>

                <form onSubmit={handleRaiseComplaint} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700/70 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 capitalize"
                    >
                      <option value="plumbing">Plumbing</option>
                      <option value="electricity">Electricity</option>
                      <option value="cleanliness">Cleanliness</option>
                      <option value="furniture">Furniture Repair</option>
                      <option value="internet">Internet / Wi-Fi</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                    <textarea
                      rows="4"
                      required
                      placeholder="Describe the issue in detail (e.g. Water leaking from bathroom sink in room 101)..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-700/70 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingComplaint}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/25 transition-all flex items-center justify-center gap-2"
                  >
                    {submittingComplaint ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Submit Complaint</span>
                  </button>
                </form>
              </div>

              {/* Past Complaints List */}
              <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white">Complaint History</h2>
                  <span className="text-xs text-slate-400 font-semibold">{complaints.length} Total Complaints</span>
                </div>

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {complaints.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No complaints registered yet.
                    </div>
                  ) : (
                    complaints.map((c) => (
                      <div key={c.complaint_id} className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                            {c.category}
                          </span>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(c.status)}
                          </div>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">{c.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                          <span>Raised: {new Date(c.raised_date).toLocaleDateString()}</span>
                          {c.resolved_date && <span className="text-emerald-400">Resolved: {new Date(c.resolved_date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MESS MENU */}
          {(activeTab === 'mess' || activeTab === 'overview') && (
            <div className="glass-card p-6 rounded-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Weekly Mess Menu</h2>
                    <p className="text-xs text-slate-400">Nutritious meals provided 7 days a week</p>
                  </div>
                </div>

                {/* Day selector pills */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
                  {dayOrder.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        selectedDay === day ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meals Grid for Selected Day */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['breakfast', 'lunch', 'dinner'].map((mType) => {
                  const mealItem = activeDayMeals.find(m => m.meal_type === mType);
                  const mealTitles = { breakfast: '🌅 Breakfast (7:30 - 9:30 AM)', lunch: '☀️ Lunch (12:30 - 2:30 PM)', dinner: '🌙 Dinner (7:30 - 9:30 PM)' };
                  return (
                    <div key={mType} className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                      <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wide">{mealTitles[mType]}</h3>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                        {mealItem?.items || 'Standard Mess Menu Special'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
