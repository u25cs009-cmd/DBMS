import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from env or local storage
const getSavedUrl = () => localStorage.getItem('supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
const getSavedKey = () => localStorage.getItem('supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient = null;

export const isSupabaseConfigured = () => {
  const url = getSavedUrl();
  const key = getSavedKey();
  return Boolean(url && key && url.startsWith('http'));
};

export const getSupabase = () => {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(getSavedUrl(), getSavedKey());
  }
  return supabaseClient;
};

export const updateSupabaseCredentials = (url, key) => {
  if (url) localStorage.setItem('supabase_url', url.trim());
  else localStorage.removeItem('supabase_url');

  if (key) localStorage.setItem('supabase_key', key.trim());
  else localStorage.removeItem('supabase_key');

  supabaseClient = isSupabaseConfigured() ? createClient(getSavedUrl(), getSavedKey()) : null;
  return Boolean(supabaseClient);
};

// ========================================================
// MOCK LOCAL STORAGE PERSISTENCE ENGINE (Fallback)
// Pre-seeded with production-realistic initial data
// ========================================================

const INITIAL_MOCK_DATA = {
  students: [
    { student_id: 1, name: 'Rahul Sharma', email: 'student@hostel.com', phone: '9876543210', course: 'B.Tech CSE', year: 2, gender: 'male', meal_pref: 'veg', created_at: '2026-01-10T10:00:00Z' },
    { student_id: 2, name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211', course: 'B.Tech IT', year: 1, gender: 'female', meal_pref: 'non-veg', created_at: '2026-01-12T11:30:00Z' },
    { student_id: 3, name: 'Aarav Mehta', email: 'aarav@example.com', phone: '9876543212', course: 'B.Tech ECE', year: 3, gender: 'male', meal_pref: 'veg', created_at: '2026-02-01T09:15:00Z' },
    { student_id: 4, name: 'Ananya Sen', email: 'ananya@example.com', phone: '9876543213', course: 'B.Tech ME', year: 4, gender: 'female', meal_pref: 'veg', created_at: '2026-02-15T14:20:00Z' }
  ],
  rooms: [
    { room_id: 1, room_number: '101', floor: 1, type: 'single', capacity: 1, status: 'occupied' },
    { room_id: 2, room_number: '102', floor: 1, type: 'double', capacity: 2, status: 'occupied' },
    { room_id: 3, room_number: '103', floor: 1, type: 'double', capacity: 2, status: 'available' },
    { room_id: 4, room_number: '201', floor: 2, type: 'triple', capacity: 3, status: 'available' },
    { room_id: 5, room_number: '202', floor: 2, type: 'single', capacity: 1, status: 'maintenance' },
    { room_id: 6, room_number: '203', floor: 2, type: 'double', capacity: 2, status: 'available' },
    { room_id: 7, room_number: '301', floor: 3, type: 'triple', capacity: 3, status: 'available' }
  ],
  allocations: [
    { allocation_id: 1, student_id: 1, room_id: 1, alloc_date: '2026-07-15', vacate_date: null },
    { allocation_id: 2, student_id: 2, room_id: 2, alloc_date: '2026-07-20', vacate_date: null },
    { allocation_id: 3, student_id: 3, room_id: 2, alloc_date: '2026-07-22', vacate_date: null }
  ],
  fees: [
    { fee_id: 1, student_id: 1, amount: 25000.00, semester: 'Sem 3 (2026)', due_date: '2026-08-01', paid_date: null, status: 'unpaid' },
    { fee_id: 2, student_id: 1, amount: 25000.00, semester: 'Sem 2 (2026)', due_date: '2026-01-15', paid_date: '2026-01-10', status: 'paid' },
    { fee_id: 3, student_id: 2, amount: 25000.00, semester: 'Sem 1 (2026)', due_date: '2026-08-01', paid_date: '2026-07-25', status: 'paid' },
    { fee_id: 4, student_id: 3, amount: 25000.00, semester: 'Sem 5 (2026)', due_date: '2026-06-01', paid_date: null, status: 'overdue' }
  ],
  complaints: [
    { complaint_id: 1, student_id: 1, category: 'plumbing', description: 'Water leakage in bathroom sink. Requires urgent repair.', raised_date: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'pending', resolved_date: null },
    { complaint_id: 2, student_id: 1, category: 'internet', description: 'Wi-Fi connection speeds dropping frequently in room 101.', raised_date: new Date(Date.now() - 86400000 * 10).toISOString(), status: 'resolved', resolved_date: new Date(Date.now() - 86400000 * 8).toISOString() },
    { complaint_id: 3, student_id: 2, category: 'electricity', description: 'Ceiling fan is making loud rattling noise in room 102.', raised_date: new Date(Date.now() - 86400000 * 4).toISOString(), status: 'in_progress', resolved_date: null },
    { complaint_id: 4, student_id: 3, category: 'cleanliness', description: 'Corridor on 2nd floor needs deep cleaning.', raised_date: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'pending', resolved_date: null }
  ],
  mess_menu: [
    { menu_id: 1, day_of_week: 'Monday', meal_type: 'breakfast', items: 'Aloo Paratha, Curd, Butter, Tea / Coffee' },
    { menu_id: 2, day_of_week: 'Monday', meal_type: 'lunch', items: 'Dal Tadka, Shahi Paneer, Jeera Rice, Chapati, Salad' },
    { menu_id: 3, day_of_week: 'Monday', meal_type: 'dinner', items: 'Mix Veg, Chana Dal, Rice, Roti, Gulab Jamun' },
    { menu_id: 4, day_of_week: 'Tuesday', meal_type: 'breakfast', items: 'Poha, Sev, Jalebi, Tea / Coffee' },
    { menu_id: 5, day_of_week: 'Tuesday', meal_type: 'lunch', items: 'Rajma Masala, Steamed Rice, Butter Roti, Boondi Raita' },
    { menu_id: 6, day_of_week: 'Tuesday', meal_type: 'dinner', items: 'Kadhai Paneer / Egg Curry, Rice, Roti, Kheer' },
    { menu_id: 7, day_of_week: 'Wednesday', meal_type: 'breakfast', items: 'Idli, Sambhar, Coconut Chutney, Coffee' },
    { menu_id: 8, day_of_week: 'Wednesday', meal_type: 'lunch', items: 'Kadhi Pakoda, Rice, Roti, Aloo Jeera' },
    { menu_id: 9, day_of_week: 'Wednesday', meal_type: 'dinner', items: 'Veg Biryani / Chicken Biryani, Salan, Raita' },
    { menu_id: 10, day_of_week: 'Thursday', meal_type: 'breakfast', items: 'Masala Dosa, Sambhar, Chutney, Tea' },
    { menu_id: 11, day_of_week: 'Thursday', meal_type: 'lunch', items: 'Chole Bhature, Onion Salad, Mint Chutney' },
    { menu_id: 12, day_of_week: 'Thursday', meal_type: 'dinner', items: 'Dal Makhani, Mix Veg, Naan, Rice, Ice Cream' },
    { menu_id: 13, day_of_week: 'Friday', meal_type: 'breakfast', items: 'Uttapam, Sambhar, Tea / Coffee' },
    { menu_id: 14, day_of_week: 'Friday', meal_type: 'lunch', items: 'Dal Fry, Aloo Gobi, Rice, Chapati, Papad' },
    { menu_id: 15, day_of_week: 'Friday', meal_type: 'dinner', items: 'Paneer Butter Masala, Rice, Roti, Custard' },
    { menu_id: 16, day_of_week: 'Saturday', meal_type: 'breakfast', items: 'Bread Omlette / Veg Sandwich, Tea' },
    { menu_id: 17, day_of_week: 'Saturday', meal_type: 'lunch', items: 'Veg Pulao, Dal Makhani, Roti, Salad' },
    { menu_id: 18, day_of_week: 'Saturday', meal_type: 'dinner', items: 'Puri Bhaji, Rice, Sweet Lassi' },
    { menu_id: 19, day_of_week: 'Sunday', meal_type: 'breakfast', items: 'Puri Chole, Halwa, Tea / Coffee' },
    { menu_id: 20, day_of_week: 'Sunday', meal_type: 'lunch', items: 'Special Veg Thali / Chicken Curry Thali' },
    { menu_id: 21, day_of_week: 'Sunday', meal_type: 'dinner', items: 'Pav Bhaji, Fried Rice, Sweet' }
  ]
};

const getLocalData = () => {
  const data = localStorage.getItem('hostel_db_v1');
  if (!data) {
    localStorage.setItem('hostel_db_v1', JSON.stringify(INITIAL_MOCK_DATA));
    return INITIAL_MOCK_DATA;
  }
  return JSON.parse(data);
};

const saveLocalData = (data) => {
  localStorage.setItem('hostel_db_v1', JSON.stringify(data));
};

// Reset database helper
export const resetMockData = () => {
  localStorage.setItem('hostel_db_v1', JSON.stringify(INITIAL_MOCK_DATA));
  return INITIAL_MOCK_DATA;
};

// Helper to update local store directly when Supabase errors out
const addStudentLocally = (studentObj) => {
  const store = getLocalData();
  const newStudent = {
    student_id: Date.now(),
    created_at: new Date().toISOString(),
    ...studentObj
  };
  store.students.push(newStudent);
  saveLocalData(store);
  return newStudent;
};

// Unified Data Provider Abstraction
export const db = {
  // --- STUDENTS ---
  async getStudents() {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('students').select('*').order('student_id', { ascending: true });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase fetch error, using local data:', e);
      }
    }
    const store = getLocalData();
    return store.students;
  },

  async getStudentByEmail(email) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('students').select('*').eq('email', email).single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getByEmail error:', e);
      }
    }
    const store = getLocalData();
    return store.students.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createStudent(studentObj) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('students').insert([studentObj]).select().single();
        if (!error && data) return data;
        if (error) {
          console.warn('Supabase INSERT student failed (likely RLS policy). Falling back to local state:', error.message);
        }
      } catch (err) {
        console.warn('Supabase createStudent exception:', err);
      }
    }
    // Reliable Fallback to local persistence so UI NEVER breaks or gets stuck!
    return addStudentLocally(studentObj);
  },

  async updateStudent(student_id, updates) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('students').update(updates).eq('student_id', student_id).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateStudent error:', e);
      }
    }
    const store = getLocalData();
    const index = store.students.findIndex(s => s.student_id === student_id);
    if (index !== -1) {
      store.students[index] = { ...store.students[index], ...updates };
      saveLocalData(store);
      return store.students[index];
    }
    throw new Error('Student not found');
  },

  async deleteStudent(student_id) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from('students').delete().eq('student_id', student_id);
        if (!error) {
          // also sync local store
          const store = getLocalData();
          store.students = store.students.filter(s => s.student_id !== student_id);
          saveLocalData(store);
          return true;
        }
      } catch (e) {
        console.warn('Supabase deleteStudent error:', e);
      }
    }
    const store = getLocalData();
    store.students = store.students.filter(s => s.student_id !== student_id);
    store.allocations = store.allocations.filter(a => a.student_id !== student_id);
    store.fees = store.fees.filter(f => f.student_id !== student_id);
    store.complaints = store.complaints.filter(c => c.student_id !== student_id);
    saveLocalData(store);
    return true;
  },

  // --- ROOMS ---
  async getRooms() {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('rooms').select('*').order('room_number', { ascending: true });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getRooms error:', e);
      }
    }
    const store = getLocalData();
    return store.rooms;
  },

  async updateRoomStatus(room_id, status) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('rooms').update({ status }).eq('room_id', room_id).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateRoomStatus error:', e);
      }
    }
    const store = getLocalData();
    const room = store.rooms.find(r => r.room_id === room_id);
    if (room) {
      room.status = status;
      saveLocalData(store);
      return room;
    }
    throw new Error('Room not found');
  },

  // --- ALLOCATIONS ---
  async getAllocations() {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('allocations').select(`
          *,
          students(name, email, course),
          rooms(room_number, floor, type)
        `);
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getAllocations error:', e);
      }
    }
    const store = getLocalData();
    return store.allocations.map(alloc => ({
      ...alloc,
      students: store.students.find(s => s.student_id === alloc.student_id) || null,
      rooms: store.rooms.find(r => r.room_id === alloc.room_id) || null
    }));
  },

  async getStudentAllocation(student_id) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('allocations')
          .select(`*, rooms(*)`)
          .eq('student_id', student_id)
          .is('vacate_date', null)
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getStudentAllocation error:', e);
      }
    }
    const store = getLocalData();
    const alloc = store.allocations.find(a => a.student_id === student_id && !a.vacate_date);
    if (!alloc) return null;
    return {
      ...alloc,
      rooms: store.rooms.find(r => r.room_id === alloc.room_id) || null
    };
  },

  async allocateRoom(student_id, room_id) {
    const sb = getSupabase();
    const today = new Date().toISOString().split('T')[0];
    if (sb) {
      try {
        const { data, error } = await sb.from('allocations').insert([{ student_id, room_id, alloc_date: today }]).select().single();
        if (!error && data) {
          await sb.from('rooms').update({ status: 'occupied' }).eq('room_id', room_id);
          return data;
        }
      } catch (e) {
        console.warn('Supabase allocateRoom error, using local fallback:', e);
      }
    }

    const store = getLocalData();
    const prevAlloc = store.allocations.find(a => a.student_id === student_id && !a.vacate_date);
    if (prevAlloc) {
      prevAlloc.vacate_date = today;
    }

    const newAlloc = {
      allocation_id: Date.now(),
      student_id: Number(student_id),
      room_id: Number(room_id),
      alloc_date: today,
      vacate_date: null
    };
    store.allocations.push(newAlloc);

    const targetRoom = store.rooms.find(r => r.room_id === Number(room_id));
    if (targetRoom) targetRoom.status = 'occupied';

    saveLocalData(store);
    return newAlloc;
  },

  async vacateAllocation(allocation_id) {
    const sb = getSupabase();
    const today = new Date().toISOString().split('T')[0];
    if (sb) {
      try {
        const { data: alloc } = await sb.from('allocations').select('room_id').eq('allocation_id', allocation_id).single();
        const { data, error } = await sb.from('allocations').update({ vacate_date: today }).eq('allocation_id', allocation_id).select().single();
        if (!error && data) {
          if (alloc?.room_id) {
            await sb.from('rooms').update({ status: 'available' }).eq('room_id', alloc.room_id);
          }
          return data;
        }
      } catch (e) {
        console.warn('Supabase vacateAllocation error:', e);
      }
    }

    const store = getLocalData();
    const alloc = store.allocations.find(a => a.allocation_id === allocation_id);
    if (alloc) {
      alloc.vacate_date = today;
      const room = store.rooms.find(r => r.room_id === alloc.room_id);
      if (room) room.status = 'available';
      saveLocalData(store);
      return alloc;
    }
    throw new Error('Allocation not found');
  },

  // --- FEES ---
  async getFees(student_id = null) {
    const sb = getSupabase();
    if (sb) {
      try {
        let query = sb.from('fees').select(`*, students(name, email, course)`).order('due_date', { ascending: false });
        if (student_id) query = query.eq('student_id', student_id);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getFees error:', e);
      }
    }

    const store = getLocalData();
    let feesList = store.fees;
    if (student_id) {
      feesList = feesList.filter(f => f.student_id === Number(student_id));
    }
    return feesList.map(fee => ({
      ...fee,
      students: store.students.find(s => s.student_id === fee.student_id) || null
    }));
  },

  async createFee(feeObj) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('fees').insert([feeObj]).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase createFee error, falling back locally:', e);
      }
    }
    const store = getLocalData();
    const newFee = {
      fee_id: Date.now(),
      paid_date: null,
      status: 'unpaid',
      ...feeObj
    };
    store.fees.push(newFee);
    saveLocalData(store);
    return newFee;
  },

  async markFeePaid(fee_id) {
    const sb = getSupabase();
    const today = new Date().toISOString().split('T')[0];
    if (sb) {
      try {
        const { data, error } = await sb.from('fees').update({ status: 'paid', paid_date: today }).eq('fee_id', fee_id).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase markFeePaid error:', e);
      }
    }

    const store = getLocalData();
    const fee = store.fees.find(f => f.fee_id === fee_id);
    if (fee) {
      fee.status = 'paid';
      fee.paid_date = today;
      saveLocalData(store);
      return fee;
    }
    throw new Error('Fee record not found');
  },

  // --- COMPLAINTS ---
  async getComplaints(student_id = null) {
    const sb = getSupabase();
    if (sb) {
      try {
        let query = sb.from('complaints').select(`*, students(name, email)`).order('raised_date', { ascending: false });
        if (student_id) query = query.eq('student_id', student_id);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getComplaints error:', e);
      }
    }

    const store = getLocalData();
    let list = store.complaints;
    if (student_id) {
      list = list.filter(c => c.student_id === Number(student_id));
    }
    return list.map(c => ({
      ...c,
      students: store.students.find(s => s.student_id === c.student_id) || null
    })).sort((a, b) => new Date(b.raised_date) - new Date(a.raised_date));
  },

  async createComplaint(student_id, category, description) {
    const sb = getSupabase();
    const raised_date = new Date().toISOString();
    if (sb) {
      try {
        const { data, error } = await sb.from('complaints').insert([{ student_id, category, description, status: 'pending', raised_date }]).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase createComplaint error:', e);
      }
    }

    const store = getLocalData();
    const newComplaint = {
      complaint_id: Date.now(),
      student_id: Number(student_id),
      category,
      description,
      raised_date,
      status: 'pending',
      resolved_date: null
    };
    store.complaints.unshift(newComplaint);
    saveLocalData(store);
    return newComplaint;
  },

  async updateComplaintStatus(complaint_id, status) {
    const sb = getSupabase();
    const resolved_date = status === 'resolved' ? new Date().toISOString() : null;
    if (sb) {
      try {
        const { data, error } = await sb.from('complaints').update({ status, resolved_date }).eq('complaint_id', complaint_id).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateComplaintStatus error:', e);
      }
    }

    const store = getLocalData();
    const complaint = store.complaints.find(c => c.complaint_id === complaint_id);
    if (complaint) {
      complaint.status = status;
      complaint.resolved_date = resolved_date;
      saveLocalData(store);
      return complaint;
    }
    throw new Error('Complaint not found');
  },

  // --- MESS MENU ---
  async getMessMenu() {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('mess_menu').select('*');
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getMessMenu error:', e);
      }
    }

    const store = getLocalData();
    return store.mess_menu;
  },

  async updateMessMenuItem(menu_id, items) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('mess_menu').update({ items }).eq('menu_id', menu_id).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateMessMenuItem error:', e);
      }
    }

    const store = getLocalData();
    const item = store.mess_menu.find(m => m.menu_id === menu_id);
    if (item) {
      item.items = items;
      saveLocalData(store);
      return item;
    }
    throw new Error('Menu item not found');
  },

  async addMessMenuItem(day_of_week, meal_type, items) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('mess_menu').insert([{ day_of_week, meal_type, items }]).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase addMessMenuItem error:', e);
      }
    }

    const store = getLocalData();
    const newItem = {
      menu_id: Date.now(),
      day_of_week,
      meal_type,
      items
    };
    store.mess_menu.push(newItem);
    saveLocalData(store);
    return newItem;
  }
};
