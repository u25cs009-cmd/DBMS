import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
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
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Home
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

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const filteredRooms = rooms.filter((r) => {
    return roomFloorFilter === 'all' || r.floor === Number(roomFloorFilter);
  });

  const pendingCount = complaints.filter((c) => c.status === 'pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Block & Floor Occupancy Calculations
  const floors = [1, 2, 3];
  const floorStats = floors.map((fl) => {
    const flRooms = rooms.filter((r) => r.floor === fl);
    const flOccupied = flRooms.filter((r) => r.status === 'occupied').length;
    const percent = flRooms.length > 0 ? Math.round((flOccupied / flRooms.length) * 100) : 0;
    return { floor: fl, total: flRooms.length, occupied: flOccupied, percent };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-4">
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-warm flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="font-bold text-sm text-slate-800">Loading Warden Control Panel...</span>
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
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                <span>{getGreeting()}</span>
                <span>•</span>
                <span>Chief Warden Office</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                Welcome, <span className="text-amber-300 font-bold">{user?.name || 'Dr. V.K. Singh'}</span> 👋
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 max-w-xl font-normal leading-relaxed">
                Hostel Warden Portal. Review student maintenance complaints, monitor block-wise room occupancy, and set maintenance flags.
              </p>
            </div>

            {/* Quick Metrics Counter Cards */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center min-w-[105px]">
                <span className="text-[10px] uppercase font-bold text-amber-200 block">Pending Issues</span>
                <span className="text-xl font-black text-amber-300">{pendingCount}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center min-w-[105px]">
                <span className="text-[10px] uppercase font-bold text-indigo-200 block">In Progress</span>
                <span className="text-xl font-black text-white">{inProgressCount}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center min-w-[105px]">
                <span className="text-[10px] uppercase font-bold text-emerald-200 block">Occupied</span>
                <span className="text-xl font-black text-emerald-300">
                  {occupiedRooms}/{rooms.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BLOCK & FLOOR OCCUPANCY BARS
           ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-warm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">Block & Floor-Wise Occupancy</h2>
                <p className="text-xs text-slate-500">Real-time bed fill rates across hostel floors</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &lt;70% Low
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 70-90% Moderate
              </span>
              <span className="flex items-center gap-1.5 text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> &gt;90% High
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {floorStats.map(({ floor, total, occupied, percent }) => {
              const colorClass =
                percent > 90
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                  : percent >= 70
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600';

              const badgeColor =
                percent > 90
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : percent >= 70
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200';

              return (
                <div key={floor} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Floor #{floor}</h3>
                      <p className="text-[11px] text-slate-500">{occupied} of {total} rooms occupied</p>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                      {percent}% Full
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            TAB 1: COMPLAINTS MANAGEMENT WITH FILTER CHIPS & STATUS CONTROLS
           ========================================================================= */}
        {(activeTab === 'overview' || activeTab === 'complaints') && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-warm p-6 space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                  <MessageSquareWarning className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">Student Complaints Resolution</h2>
                  <p className="text-xs text-slate-500">Update maintenance tickets from Pending to In Progress and Resolved</p>
                </div>
              </div>

              {/* Filter Chips & Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Filter Chips for Status */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'in_progress', label: 'In Progress' },
                    { id: 'resolved', label: 'Resolved' },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => setStatusFilter(chip.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        statusFilter === chip.id
                          ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-warm-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Category Dropdown */}
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-xl border border-slate-300">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-transparent text-xs text-slate-800 font-bold focus:outline-none py-1 px-1 capitalize cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="plumbing">🚰 Plumbing</option>
                    <option value="electricity">⚡ Electricity</option>
                    <option value="cleanliness">🧹 Cleanliness</option>
                    <option value="furniture">🪑 Furniture</option>
                    <option value="internet">📶 Internet</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Complaints List Cards */}
            <div className="space-y-3.5">
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <span className="text-3xl block mb-2">🎉</span>
                  <p className="font-bold text-slate-700 text-sm">No Pending Complaints 🎉</p>
                  <p className="text-slate-400 mt-0.5">No complaints matching the selected filter criteria.</p>
                </div>
              ) : (
                filteredComplaints.map((c) => {
                  const priorityConfig = {
                    electricity: { label: 'Urgent', color: 'bg-rose-100 text-rose-800 border-rose-200' },
                    plumbing: { label: 'High', color: 'bg-amber-100 text-amber-800 border-amber-200' },
                    cleanliness: { label: 'Normal', color: 'bg-slate-100 text-slate-700 border-slate-200' },
                    furniture: { label: 'Medium', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
                    internet: { label: 'Medium', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                  }[c.category] || { label: 'Normal', color: 'bg-slate-100 text-slate-700 border-slate-200' };

                  return (
                    <div
                      key={c.complaint_id}
                      className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-warm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 px-2.5 py-0.5 rounded-full bg-indigo-100 border border-indigo-200">
                            {c.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityConfig.color}`}>
                            {priorityConfig.label} Priority
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            Student: {c.students?.name || `ID #${c.student_id}`}
                          </span>
                          <span className="text-[11px] text-slate-500">({c.students?.email || 'N/A'})</span>
                        </div>
                        <p className="text-xs text-slate-800 font-semibold leading-relaxed">{c.description}</p>
                        <span className="text-[10px] text-slate-400 block">
                          Raised on: {new Date(c.raised_date).toLocaleString()}
                        </span>
                      </div>

                      {/* Interactive Status Switch Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleUpdateStatus(c.complaint_id, 'pending')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            c.status === 'pending'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-warm-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(c.complaint_id, 'in_progress')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            c.status === 'in_progress'
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-warm-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(c.complaint_id, 'resolved')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            c.status === 'resolved'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-warm-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Resolved ✓
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: ROOMS & VISUAL TILE GRID WITH HOVER TOOLTIP
           ========================================================================= */}
        {(activeTab === 'overview' || activeTab === 'rooms') && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-warm p-6 space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">Hostel Rooms & Occupancy Grid</h2>
                  <p className="text-xs text-slate-500">Visual occupancy tiles with quick status toggles</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Floor Filter */}
                <select
                  value={roomFloorFilter}
                  onChange={(e) => setRoomFloorFilter(e.target.value)}
                  className="bg-slate-50 text-xs text-slate-800 font-bold border border-slate-300 rounded-xl py-1.5 px-3 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Floors</option>
                  <option value="1">Floor 1</option>
                  <option value="2">Floor 2</option>
                  <option value="3">Floor 3</option>
                </select>
              </div>
            </div>

            {/* Visual Colored Room Tiles */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Visual Room Map (Click tile or toggle to update status):
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                {filteredRooms.map((room) => {
                  const tileBg =
                    room.status === 'occupied'
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-900'
                      : room.status === 'maintenance'
                      ? 'bg-rose-100 border-rose-300 text-rose-900'
                      : 'bg-emerald-100 border-emerald-300 text-emerald-900';

                  return (
                    <button
                      key={room.room_id}
                      onClick={() => handleToggleRoomStatus(room.room_id, room.status)}
                      title={`Room ${room.room_number} • Floor #${room.floor} • ${room.type} (${room.capacity} beds) • Status: ${room.status}`}
                      className={`p-2 rounded-xl border text-center transition-all hover:scale-105 shadow-2xs group relative ${tileBg}`}
                    >
                      <span className="text-[10px] font-black block font-mono">{room.room_number}</span>
                      <span className="text-[8px] font-bold uppercase block opacity-80">{room.status.substring(0, 3)}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500 mt-3 pt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md bg-emerald-300 border border-emerald-400" /> Available ({availableRooms})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md bg-indigo-300 border border-indigo-400" /> Occupied ({occupiedRooms})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md bg-rose-300 border border-rose-400" /> Maintenance ({maintenanceRooms})
                </span>
              </div>
            </div>

            {/* Room Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
              {filteredRooms.map((room) => {
                const statusColors = {
                  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  occupied: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                  maintenance: 'bg-rose-50 text-rose-700 border-rose-200'
                };

                return (
                  <div key={room.room_id} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-slate-900">Room {room.room_number}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${statusColors[room.status]}`}>
                        {room.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div>Floor: <span className="font-bold text-slate-800">Floor #{room.floor}</span></div>
                      <div>Type: <span className="font-bold text-slate-800 capitalize">{room.type}</span></div>
                      <div>Capacity: <span className="font-bold text-slate-800">{room.capacity} Bed(s)</span></div>
                    </div>

                    <button
                      onClick={() => handleToggleRoomStatus(room.room_id, room.status)}
                      className="w-full py-2 px-3 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 font-bold text-[11px] rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Wrench className="w-3.5 h-3.5 text-indigo-600" />
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
  );
}
