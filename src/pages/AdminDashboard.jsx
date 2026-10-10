import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/supabase';
import {
  Users,
  BedDouble,
  Receipt,
  UtensilsCrossed,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Loader2,
  DollarSign,
  Shield,
  Sparkles,
  PieChart,
  BarChart3,
  TrendingUp,
  CreditCard,
  Building,
  UserCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [fees, setFees] = useState([]);
  const [messMenu, setMessMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [isAddFeeOpen, setIsAddFeeOpen] = useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);

  // Add Student Form State
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    course: 'B.Tech CSE',
    year: 1,
    gender: 'male',
    meal_pref: 'veg'
  });

  // Room Allocation Form State
  const [allocForm, setAllocForm] = useState({
    student_id: '',
    room_id: ''
  });

  // Fee Generation Form State
  const [feeForm, setFeeForm] = useState({
    student_id: '',
    amount: '25000',
    semester: 'Sem 1 (2026)',
    due_date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
  });

  // Mess Menu Edit State
  const [menuForm, setMenuForm] = useState({
    menu_id: null,
    day_of_week: 'Monday',
    meal_type: 'breakfast',
    items: ''
  });

  // Search Filter
  const [searchStudent, setSearchStudent] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sData, rData, aData, fData, mData] = await Promise.all([
        db.getStudents(),
        db.getRooms(),
        db.getAllocations(),
        db.getFees(),
        db.getMessMenu()
      ]);
      setStudents(sData);
      setRooms(rData);
      setAllocations(aData);
      setFees(fData);
      setMessMenu(mData);

      // Pre-select first student and room for forms
      if (sData.length > 0) {
        setAllocForm(prev => ({ ...prev, student_id: sData[0].student_id }));
        setFeeForm(prev => ({ ...prev, student_id: sData[0].student_id }));
      }
      const avail = rData.filter(r => r.status === 'available');
      if (avail.length > 0) {
        setAllocForm(prev => ({ ...prev, room_id: avail[0].room_id }));
      }
    } catch (e) {
      console.error(e);
      showToast('Error loading Admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await db.createStudent(studentForm);
      showToast('New student record created successfully!', 'success');
      setIsAddStudentOpen(false);
      setStudentForm({ name: '', email: '', phone: '', course: 'B.Tech CSE', year: 1, gender: 'male', meal_pref: 'veg' });
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to create student', 'error');
    }
  };

  const handleDeleteStudent = async (student_id) => {
    if (!window.confirm('Are you sure you want to remove this student? All allocations and fees will be removed.')) return;
    try {
      await db.deleteStudent(student_id);
      showToast('Student deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to delete student', 'error');
    }
  };

  const handleAllocateRoom = async (e) => {
    e.preventDefault();
    if (!allocForm.student_id || !allocForm.room_id) {
      showToast('Please select both a student and an available room', 'error');
      return;
    }
    try {
      await db.allocateRoom(Number(allocForm.student_id), Number(allocForm.room_id));
      showToast('Room allocated to student successfully!', 'success');
      setIsAllocateOpen(false);
      fetchData();
    } catch (err) {
      showToast('Failed to allocate room', 'error');
    }
  };

  const handleVacateRoom = async (allocation_id) => {
    try {
      await db.vacateAllocation(allocation_id);
      showToast('Room vacated and marked available!', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to vacate allocation', 'error');
    }
  };

  const handleCreateFee = async (e) => {
    e.preventDefault();
    if (!feeForm.student_id || !feeForm.amount) {
      showToast('Please enter valid fee details', 'error');
      return;
    }
    try {
      await db.createFee({
        student_id: Number(feeForm.student_id),
        amount: Number(feeForm.amount),
        semester: feeForm.semester,
        due_date: feeForm.due_date
      });
      showToast('Fee record generated for student!', 'success');
      setIsAddFeeOpen(false);
      fetchData();
    } catch (err) {
      showToast('Failed to generate fee record', 'error');
    }
  };

  const handleMarkFeePaid = async (fee_id) => {
    try {
      await db.markFeePaid(fee_id);
      showToast('Fee marked as PAID!', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to update fee status', 'error');
    }
  };

  const handleSaveMessMenu = async (e) => {
    e.preventDefault();
    if (!menuForm.items.trim()) {
      showToast('Please enter menu items', 'error');
      return;
    }
    try {
      if (menuForm.menu_id) {
        await db.updateMessMenuItem(menuForm.menu_id, menuForm.items);
      } else {
        await db.addMessMenuItem(menuForm.day_of_week, menuForm.meal_type, menuForm.items);
      }
      showToast('Mess menu item saved successfully!', 'success');
      setIsEditMenuOpen(false);
      fetchData();
    } catch (err) {
      showToast('Failed to save menu item', 'error');
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.email.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.course.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const availableRooms = rooms.filter(r => r.status === 'available');
  const occupiedRooms = rooms.filter(r => r.status === 'occupied');
  const totalRevenueCollected = fees.filter(f => f.status === 'paid').reduce((acc, f) => acc + Number(f.amount), 0);
  const totalPendingDues = fees.filter(f => f.status !== 'paid').reduce((acc, f) => acc + Number(f.amount), 0);
  const totalFeesBilled = totalRevenueCollected + totalPendingDues;
  const collectionPercentage = totalFeesBilled > 0 ? Math.round((totalRevenueCollected / totalFeesBilled) * 100) : 100;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Occupancy per floor
  const floorData = [1, 2, 3].map(fl => {
    const flRooms = rooms.filter(r => r.floor === fl);
    const flOcc = flRooms.filter(r => r.status === 'occupied').length;
    const rate = flRooms.length > 0 ? Math.round((flOcc / flRooms.length) * 100) : 0;
    return { floor: fl, total: flRooms.length, occupied: flOcc, rate };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-4">
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-warm flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="font-bold text-sm text-slate-800">Loading Admin Control Panel...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar currentTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24 sm:pb-8">
        
        {/* Creative Personal Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 shadow-warm-lg">
          <div className="absolute inset-0 bg-jaali opacity-10 pointer-events-none" />
          <div className="absolute -right-16 -top-16 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20 text-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{getGreeting()}</span>
                <span>•</span>
                <span>Main Administration Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                Welcome, <span className="text-amber-300 font-bold">{user?.name || 'Chief Admin'}</span> 👑
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 max-w-xl font-normal leading-relaxed">
                Full administrative governance over Student Registrations, Room Allocations, Fee Billing, and Mess Operations.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center min-w-[105px]">
                <span className="text-[10px] uppercase font-bold text-indigo-200 block">Students</span>
                <span className="text-xl font-black text-white">{students.length}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center min-w-[105px]">
                <span className="text-[10px] uppercase font-bold text-emerald-200 block">Available Beds</span>
                <span className="text-xl font-black text-emerald-300">{availableRooms.length}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center min-w-[125px]">
                <span className="text-[10px] uppercase font-bold text-amber-200 block">Revenue (₹)</span>
                <span className="text-lg font-black text-amber-300">₹{totalRevenueCollected.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shortcuts Bar */}
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-warm-sm gap-3 overflow-x-auto">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-2 flex items-center gap-1.5 shrink-0">
            <span className="text-indigo-600">⚡</span> Admin Shortcuts:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" /> Register Student
            </button>
            <button
              onClick={() => setIsAllocateOpen(true)}
              className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" /> Allocate Room
            </button>
            <button
              onClick={() => setIsAddFeeOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" /> Generate Fee Invoice
            </button>
            <button
              onClick={() => {
                setMenuForm({ menu_id: null, day_of_week: 'Monday', meal_type: 'breakfast', items: '' });
                setIsEditMenuOpen(true);
              }}
              className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-teal-600" /> Add Mess Item
            </button>
          </div>
        </div>

        {/* =========================================================================
            ADMIN OVERVIEW CHARTS: SVG & Bar Charts
           ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            
            {/* Chart 1: Fee Collection SVG Donut Chart */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-warm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Fee Collection Ratio</h3>
                    <p className="text-xs text-slate-500">Collected vs Pending semester dues</p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {collectionPercentage}% Collected
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
                {/* SVG Donut */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="14" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#2563eb"
                      strokeWidth="14"
                      strokeDasharray={`${(collectionPercentage / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-black text-slate-900">{collectionPercentage}%</span>
                    <span className="text-[9px] uppercase font-bold text-slate-400">Paid</span>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="space-y-3 w-full sm:w-auto">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between sm:gap-6">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-600" />
                      <span className="text-xs font-bold text-slate-700">Collected</span>
                    </div>
                    <span className="text-sm font-black text-indigo-700">₹{totalRevenueCollected.toLocaleString()}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between sm:gap-6">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-300" />
                      <span className="text-xs font-bold text-slate-700">Pending Dues</span>
                    </div>
                    <span className="text-sm font-black text-amber-700">₹{totalPendingDues.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Block / Floor Occupancy Progress Chart */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-warm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Hostel Floor Capacity</h3>
                    <p className="text-xs text-slate-500">Occupancy load across floors</p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-full">
                  {occupiedRooms.length} / {rooms.length} Beds
                </span>
              </div>

              <div className="space-y-3.5 pt-2">
                {floorData.map(({ floor, total, occupied, rate }) => (
                  <div key={floor} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">Floor #{floor}</span>
                      <span className="text-indigo-700 font-black">{occupied} / {total} Rooms ({rate}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-teal-600 transition-all duration-500"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 1: STUDENTS DIRECTORY
           ========================================================================= */}
        {(activeTab === 'overview' || activeTab === 'students') && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-warm p-6 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">Students Directory</h2>
                  <p className="text-xs text-slate-500">Register new students, view course profiles, and manage resident accounts</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-warm-sm transition-all flex items-center gap-1.5 hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" /> Add Student
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Course & Year</th>
                    <th className="py-3.5 px-4">Meal Pref</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-400">
                        <span className="text-xl block mb-1">🔍</span>
                        No matching student records found.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.student_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                              {s.name ? s.name.substring(0, 2).toUpperCase() : 'ST'}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 block">{s.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">ID #{s.student_id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="block text-slate-800 font-medium">{s.email}</span>
                          <span className="text-[11px] text-slate-500">{s.phone || 'N/A'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 font-semibold">
                          {s.course} (Yr {s.year})
                        </td>
                        <td className="py-3.5 px-4 capitalize">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              s.meal_pref === 'veg'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {s.meal_pref === 'veg' ? '🥗 Veg' : '🍗 Non-Veg'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteStudent(s.student_id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
            TAB 2: ROOM ALLOCATIONS
           ========================================================================= */}
        {(activeTab === 'overview' || activeTab === 'allocations') && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">Student Room Allocations</h2>
                  <p className="text-xs text-slate-500">Assign vacant beds or process resident vacates</p>
                </div>
              </div>

              <button
                onClick={() => setIsAllocateOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" /> Allocate Room
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Room Number</th>
                    <th className="py-3.5 px-4">Floor & Type</th>
                    <th className="py-3.5 px-4">Allocated Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allocations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400">
                        No room allocations yet.
                      </td>
                    </tr>
                  ) : (
                    allocations.map((alloc) => (
                      <tr key={alloc.allocation_id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {alloc.students?.name || `Student #${alloc.student_id}`}
                        </td>
                        <td className="py-3.5 px-4 font-black text-indigo-700">
                          Room {alloc.rooms?.room_number || alloc.room_id}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          Floor #{alloc.rooms?.floor || 1} • {alloc.rooms?.type || 'Standard'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{alloc.alloc_date}</td>
                        <td className="py-3.5 px-4">
                          {alloc.vacate_date ? (
                            <span className="text-rose-700 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 text-[10px]">
                              Vacated: {alloc.vacate_date}
                            </span>
                          ) : (
                            <span className="text-teal-700 font-bold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 text-[10px]">
                              Active Allocation
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {!alloc.vacate_date && (
                            <button
                              onClick={() => handleVacateRoom(alloc.allocation_id)}
                              className="px-3 py-1 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-rose-600 font-bold text-xs rounded-xl transition-colors shadow-2xs"
                            >
                              Vacate Bed
                            </button>
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
            TAB 3: FEES BILLING & MANAGEMENT
           ========================================================================= */}
        {(activeTab === 'overview' || activeTab === 'fees') && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">Fee Billing & Dues Tracker</h2>
                  <p className="text-xs text-slate-500">Generate semester fee invoices and mark cash / offline receipts</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddFeeOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" /> Generate Fee Invoice
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Semester</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Paid Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fees.map((fee) => (
                    <tr key={fee.fee_id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{fee.students?.name || `Student #${fee.student_id}`}</td>
                      <td className="py-3.5 px-4 text-slate-800 font-semibold">{fee.semester}</td>
                      <td className="py-3.5 px-4 font-black text-teal-700">₹{Number(fee.amount).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{fee.due_date}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{fee.paid_date || '—'}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            fee.status === 'paid'
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : fee.status === 'overdue'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {fee.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {fee.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkFeePaid(fee.fee_id)}
                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                          >
                            Mark Paid ✓
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: MESS MENU MANAGER AS MON-SUN EDITABLE CARD GRID
           ========================================================================= */}
        {(activeTab === 'overview' || activeTab === 'mess') && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">Mess Menu Manager (Mon–Sun)</h2>
                  <p className="text-xs text-slate-500">Configure weekly breakfast, lunch, and dinner items for students</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMenuForm({ menu_id: null, day_of_week: 'Monday', meal_type: 'breakfast', items: '' });
                  setIsEditMenuOpen(true);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" /> Add Menu Item
              </button>
            </div>

            {/* Editable Mon-Sun Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {messMenu.map((m) => (
                <div
                  key={m.menu_id}
                  className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{m.day_of_week}</span>
                    <span className="text-[10px] font-bold uppercase text-indigo-800 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200">
                      {m.meal_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
                    {m.items}
                  </p>
                  <button
                    onClick={() => {
                      setMenuForm({ menu_id: m.menu_id, day_of_week: m.day_of_week, meal_type: m.meal_type, items: m.items });
                      setIsEditMenuOpen(true);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 pt-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Item
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL 1: ADD STUDENT (Modern sheet style)
         ========================================================================= */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎓</span>
                <h3 className="text-base font-black text-slate-900">Add New Student</h3>
              </div>
              <button onClick={() => setIsAddStudentOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course</label>
                  <input
                    type="text"
                    placeholder="B.Tech CSE"
                    value={studentForm.course}
                    onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                  <select
                    value={studentForm.year}
                    onChange={(e) => setStudentForm({ ...studentForm, year: Number(e.target.value) })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none font-bold"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none capitalize font-bold"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meal Pref</label>
                  <select
                    value={studentForm.meal_pref}
                    onChange={(e) => setStudentForm({ ...studentForm, meal_pref: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none capitalize font-bold"
                  >
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 font-bold text-xs text-white rounded-xl shadow-md transition-all"
              >
                Create Student Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ALLOCATE ROOM
         ========================================================================= */}
      {isAllocateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛏️</span>
                <h3 className="text-base font-black text-slate-900">Allocate Room to Student</h3>
              </div>
              <button onClick={() => setIsAllocateOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAllocateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Student</label>
                <select
                  value={allocForm.student_id}
                  onChange={(e) => setAllocForm({ ...allocForm, student_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Available Room</label>
                <select
                  value={allocForm.room_id}
                  onChange={(e) => setAllocForm({ ...allocForm, room_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none font-semibold"
                >
                  {availableRooms.length === 0 ? (
                    <option value="">No available rooms</option>
                  ) : (
                    availableRooms.map((r) => (
                      <option key={r.room_id} value={r.room_id}>
                        Room {r.room_number} (Floor {r.floor}, {r.type})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={availableRooms.length === 0}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 font-bold text-xs text-white rounded-xl shadow-md disabled:opacity-50 transition-all"
              >
                Confirm Allocation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: GENERATE FEE RECORD
         ========================================================================= */}
      {isAddFeeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧾</span>
                <h3 className="text-base font-black text-slate-900">Generate Fee Invoice</h3>
              </div>
              <button onClick={() => setIsAddFeeOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student</label>
                <select
                  value={feeForm.student_id}
                  onChange={(e) => setFeeForm({ ...feeForm, student_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.name} ({s.course})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Semester Name</label>
                <input
                  type="text"
                  required
                  placeholder="Sem 3 (2026)"
                  value={feeForm.semester}
                  onChange={(e) => setFeeForm({ ...feeForm, semester: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={feeForm.amount}
                    onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none font-black text-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={feeForm.due_date}
                    onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 font-bold text-xs text-white rounded-xl shadow-md transition-all"
              >
                Generate Fee Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: ADD/EDIT MESS MENU
         ========================================================================= */}
      {isEditMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍛</span>
                <h3 className="text-base font-black text-slate-900">
                  {menuForm.menu_id ? 'Edit Mess Menu Item' : 'Add Mess Menu Item'}
                </h3>
              </div>
              <button onClick={() => setIsEditMenuOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMessMenu} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={menuForm.day_of_week}
                    onChange={(e) => setMenuForm({ ...menuForm, day_of_week: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none font-bold"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meal Type</label>
                  <select
                    value={menuForm.meal_type}
                    onChange={(e) => setMenuForm({ ...menuForm, meal_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none capitalize font-bold"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Menu Items</label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Paneer Butter Masala, Dal Makhani, Rice, Roti, Gulab Jamun"
                  value={menuForm.items}
                  onChange={(e) => setMenuForm({ ...menuForm, items: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 font-bold text-xs text-white rounded-xl shadow-md transition-all"
              >
                Save Menu Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
