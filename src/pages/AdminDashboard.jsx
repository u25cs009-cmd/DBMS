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
  DollarSign
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-600 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="font-medium">Fetching Administrative Control Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar currentTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Admin Header Banner */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <span>👑 Super Admin Governance</span>
              <span>•</span>
              <span>Full Access</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              System Administration Control Panel
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Full governance over Students, Room Allocations, Fee Billing, and Mess Operations
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Students</span>
              <span className="text-lg font-black text-slate-900">{students.length}</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Available Rooms</span>
              <span className="text-lg font-black text-emerald-600">{availableRooms.length} / {rooms.length}</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Revenue Collected</span>
              <span className="text-lg font-black text-indigo-600">
                ₹{fees.filter(f => f.status === 'paid').reduce((acc, f) => acc + Number(f.amount), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Quick Action Shortcuts Bar */}
        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center gap-1.5 shrink-0">
            ⚡ Administrative Shortcuts:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-bold transition-all"
            >
              + Register Student
            </button>
            <button
              onClick={() => setIsAllocateOpen(true)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-all"
            >
              + Allocate Room
            </button>
            <button
              onClick={() => setIsAddFeeOpen(true)}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-all"
            >
              + Generate Fee Invoice
            </button>
            <button
              onClick={() => {
                setMenuForm({ menu_id: null, day_of_week: 'Monday', meal_type: 'breakfast', items: '' });
                setIsEditMenuOpen(true);
              }}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold transition-all"
            >
              + Add Mess Item
            </button>
          </div>
        </div>

          {/* TAB 1: STUDENTS DIRECTORY */}
          {(activeTab === 'overview' || activeTab === 'students') && (
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Student Directory</h2>
                    <p className="text-xs text-slate-500">Register, edit, and delete student accounts</p>
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
                      className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>

                  <button
                    onClick={() => setIsAddStudentOpen(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Student
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Course & Year</th>
                      <th className="py-3 px-4">Meal Pref</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {filteredStudents.map((s) => (
                      <tr key={s.student_id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-500">#{s.student_id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                        <td className="py-3 px-4 text-slate-600">{s.email}</td>
                        <td className="py-3 px-4 text-slate-600">{s.phone || 'N/A'}</td>
                        <td className="py-3 px-4 text-slate-700">{s.course} (Yr {s.year})</td>
                        <td className="py-3 px-4 capitalize">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.meal_pref === 'veg' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            {s.meal_pref}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteStudent(s.student_id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ROOM ALLOCATIONS */}
          {(activeTab === 'overview' || activeTab === 'allocations') && (
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Student Room Allocations</h2>
                    <p className="text-xs text-slate-500">Assign available rooms to students or process room vacates</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAllocateOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Allocate Room
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Room Number</th>
                      <th className="py-3 px-4">Floor & Type</th>
                      <th className="py-3 px-4">Allocated Date</th>
                      <th className="py-3 px-4">Vacate Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {allocations.map((alloc) => (
                      <tr key={alloc.allocation_id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {alloc.students?.name || `Student #${alloc.student_id}`}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-indigo-600">
                          Room {alloc.rooms?.room_number || alloc.room_id}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          Floor #{alloc.rooms?.floor || 1} • {alloc.rooms?.type || 'Standard'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{alloc.alloc_date}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {alloc.vacate_date ? (
                            <span className="text-rose-600 font-semibold">{alloc.vacate_date}</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">Active</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!alloc.vacate_date && (
                            <button
                              onClick={() => handleVacateRoom(alloc.allocation_id)}
                              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-rose-600 font-semibold text-xs rounded-lg transition-colors"
                            >
                              Vacate Room
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

          {/* TAB 3: FEES BILLING & MANAGEMENT */}
          {(activeTab === 'overview' || activeTab === 'fees') && (
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Fee Records & Collections</h2>
                    <p className="text-xs text-slate-500">Generate fee invoices per student and mark payments as paid</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddFeeOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Generate Fee Record
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Semester</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Paid Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {fees.map((fee) => (
                      <tr key={fee.fee_id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{fee.students?.name || `Student #${fee.student_id}`}</td>
                        <td className="py-3 px-4 text-slate-800 font-semibold">{fee.semester}</td>
                        <td className="py-3 px-4 font-extrabold text-indigo-700">₹{Number(fee.amount).toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-600">{fee.due_date}</td>
                        <td className="py-3 px-4 text-slate-600">{fee.paid_date || '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            fee.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            fee.status === 'overdue' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {fee.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {fee.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkFeePaid(fee.fee_id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow"
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

          {/* TAB 4: MESS MENU MANAGEMENT */}
          {(activeTab === 'overview' || activeTab === 'mess') && (
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Mess Menu Manager</h2>
                    <p className="text-xs text-slate-500">Configure weekly breakfast, lunch, and dinner items</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMenuForm({ menu_id: null, day_of_week: 'Monday', meal_type: 'breakfast', items: '' });
                    setIsEditMenuOpen(true);
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Menu Item
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {messMenu.slice(0, 6).map((m) => (
                  <div key={m.menu_id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700">{m.day_of_week}</span>
                      <span className="text-[10px] font-bold uppercase text-purple-700 px-2 py-0.5 rounded bg-purple-50 border border-purple-200">
                        {m.meal_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium">{m.items}</p>
                    <button
                      onClick={() => {
                        setMenuForm({ menu_id: m.menu_id, day_of_week: m.day_of_week, meal_type: m.meal_type, items: m.items });
                        setIsEditMenuOpen(true);
                      }}
                      className="text-[11px] text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1 pt-1"
                    >
                      <Edit className="w-3 h-3" /> Edit Item
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

      {/* MODAL 1: ADD STUDENT */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Student</h3>
              <button onClick={() => setIsAddStudentOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                  <select
                    value={studentForm.year}
                    onChange={(e) => setStudentForm({ ...studentForm, year: Number(e.target.value) })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none capitalize"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meal Pref</label>
                  <select
                    value={studentForm.meal_pref}
                    onChange={(e) => setStudentForm({ ...studentForm, meal_pref: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none capitalize"
                  >
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white rounded-xl shadow"
              >
                Create Student Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ALLOCATE ROOM */}
      {isAllocateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Allocate Room to Student</h3>
              <button onClick={() => setIsAllocateOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAllocateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
                <select
                  value={allocForm.student_id}
                  onChange={(e) => setAllocForm({ ...allocForm, student_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                >
                  {students.map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Available Room</label>
                <select
                  value={allocForm.room_id}
                  onChange={(e) => setAllocForm({ ...allocForm, room_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
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
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white rounded-xl shadow disabled:opacity-50"
              >
                Confirm Allocation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: GENERATE FEE RECORD */}
      {isAddFeeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Generate Fee Record</h3>
              <button onClick={() => setIsAddFeeOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateFee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student</label>
                <select
                  value={feeForm.student_id}
                  onChange={(e) => setFeeForm({ ...feeForm, student_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                >
                  {students.map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.name} ({s.course})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Semester Name</label>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={feeForm.amount}
                    onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
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
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl shadow"
              >
                Generate Fee Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD/EDIT MESS MENU */}
      {isEditMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">{menuForm.menu_id ? 'Edit Mess Menu Item' : 'Add Mess Menu Item'}</h3>
              <button onClick={() => setIsEditMenuOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveMessMenu} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={menuForm.day_of_week}
                    onChange={(e) => setMenuForm({ ...menuForm, day_of_week: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meal Type</label>
                  <select
                    value={menuForm.meal_type}
                    onChange={(e) => setMenuForm({ ...menuForm, meal_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none capitalize"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Menu Items</label>
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
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 font-bold text-xs text-white rounded-xl shadow"
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
