import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/supabase';
import {
  MessageSquareWarning,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Check,
  Wrench,
  Loader2,
  BedDouble,
  Users
} from 'lucide-react';

export default function WardenDashboard() {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [complaints, setComplaints] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'in_progress' | 'resolved'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [roomFloorFilter, setRoomFloorFilter] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cData, rData] = await Promise.all([
        db.getComplaints(),
        db.getRooms()
      ]);
      setComplaints(cData);
      setRooms(rData);
    } catch (e) {
      console.error(e);
      showToast('Error loading Warden data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (complaint_id, newStatus) => {
    try {
      await db.updateComplaintStatus(complaint_id, newStatus);
      showToast(`Complaint status updated to ${newStatus.toUpperCase()}`, 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleToggleRoomStatus = async (room_id, currentStatus) => {
    let nextStatus = 'available';
    if (currentStatus === 'available') nextStatus = 'maintenance';
    else if (currentStatus === 'maintenance') nextStatus = 'available';
    else if (currentStatus === 'occupied') nextStatus = 'maintenance';

    try {
      await db.updateRoomStatus(room_id, nextStatus);
      showToast(`Room status updated to ${nextStatus.toUpperCase()}`, 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to update room status', 'error');
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const filteredRooms = rooms.filter(r => {
    return roomFloorFilter === 'all' || r.floor === Number(roomFloorFilter);
  });

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span>Fetching Warden Control Panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar currentTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
          {/* Warden Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Hostel Warden Portal 🛡️
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Overseeing complaint resolution and hostel room occupancy
              </p>
            </div>

            {/* Quick Stat Counter Cards */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">Pending Complaints</span>
                <span className="text-lg font-extrabold text-white">{pendingCount}</span>
              </div>
              <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-blue-400 block">In Progress</span>
                <span className="text-lg font-extrabold text-white">{inProgressCount}</span>
              </div>
              <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Occupied Rooms</span>
                <span className="text-lg font-extrabold text-white">{occupiedRooms} / {rooms.length}</span>
              </div>
            </div>
          </div>

          {/* TAB 1: COMPLAINTS MANAGEMENT */}
          {(activeTab === 'overview' || activeTab === 'complaints') && (
            <div className="glass-card p-6 rounded-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                    <MessageSquareWarning className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Student Complaints Management</h2>
                    <p className="text-xs text-slate-400">Review and update progress of student maintenance requests</p>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                    <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none py-1 px-1 cursor-pointer"
                    >
                      <option value="all" className="bg-slate-900">All Statuses</option>
                      <option value="pending" className="bg-slate-900">Pending</option>
                      <option value="in_progress" className="bg-slate-900">In Progress</option>
                      <option value="resolved" className="bg-slate-900">Resolved</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none py-1 px-1 capitalize cursor-pointer"
                    >
                      <option value="all" className="bg-slate-900">All Categories</option>
                      <option value="plumbing" className="bg-slate-900">Plumbing</option>
                      <option value="electricity" className="bg-slate-900">Electricity</option>
                      <option value="cleanliness" className="bg-slate-900">Cleanliness</option>
                      <option value="furniture" className="bg-slate-900">Furniture</option>
                      <option value="internet" className="bg-slate-900">Internet</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Complaints List */}
              <div className="space-y-3">
                {filteredComplaints.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No complaints matching the selected filter criteria.
                  </div>
                ) : (
                  filteredComplaints.map((c) => (
                    <div key={c.complaint_id} className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                            {c.category}
                          </span>
                          <span className="text-xs font-bold text-white">Student: {c.students?.name || `ID #${c.student_id}`}</span>
                          <span className="text-[10px] text-slate-500">({c.students?.email || 'Student Email'})</span>
                        </div>
                        <p className="text-xs text-slate-200 font-medium leading-relaxed">{c.description}</p>
                        <span className="text-[10px] text-slate-500 block">Raised Date: {new Date(c.raised_date).toLocaleString()}</span>
                      </div>

                      {/* Interactive Status Switch Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleUpdateStatus(c.complaint_id, 'pending')}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            c.status === 'pending'
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(c.complaint_id, 'in_progress')}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            c.status === 'in_progress'
                              ? 'bg-blue-500 text-white border-blue-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(c.complaint_id, 'resolved')}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            c.status === 'resolved'
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          Resolved ✓
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ROOMS & OCCUPANCY */}
          {(activeTab === 'overview' || activeTab === 'rooms') && (
            <div className="glass-card p-6 rounded-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Hostel Rooms & Occupancy Monitor</h2>
                    <p className="text-xs text-slate-400">View room status, floor allocations, and set maintenance flags</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={roomFloorFilter}
                    onChange={(e) => setRoomFloorFilter(e.target.value)}
                    className="bg-slate-950 text-xs text-slate-200 font-semibold border border-slate-800 rounded-xl py-1.5 px-3 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Floors</option>
                    <option value="1">Floor 1</option>
                    <option value="2">Floor 2</option>
                    <option value="3">Floor 3</option>
                  </select>
                </div>
              </div>

              {/* Room Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredRooms.map((room) => {
                  const statusColors = {
                    available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                    occupied: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
                    maintenance: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  };

                  return (
                    <div key={room.room_id} className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-extrabold text-white">Room {room.room_number}</span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${statusColors[room.status]}`}>
                          {room.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1">
                        <div>Floor: <span className="font-semibold text-slate-200">Floor #{room.floor}</span></div>
                        <div>Type: <span className="font-semibold text-slate-200 capitalize">{room.type}</span></div>
                        <div>Capacity: <span className="font-semibold text-slate-200">{room.capacity} Bed(s)</span></div>
                      </div>

                      <button
                        onClick={() => handleToggleRoomStatus(room.room_id, room.status)}
                        className="w-full py-1.5 px-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-[11px] rounded-lg border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5 text-amber-400" />
                        <span>Toggle Status</span>
                      </button>
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
