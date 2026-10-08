import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase, db, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export const DEMO_USERS = {
  student: {
    id: 'demo-student-1',
    email: 'student@hostel.com',
    role: 'student',
    name: 'Rahul Sharma',
    student_id: 1,
    course: 'B.Tech CSE',
    year: 2
  },
  warden: {
    id: 'demo-warden-1',
    email: 'warden@hostel.com',
    role: 'warden',
    name: 'Dr. V.K. Singh (Warden)',
    assigned_floor: 1
  },
  admin: {
    id: 'demo-admin-1',
    email: 'admin@hostel.com',
    role: 'admin',
    name: 'Chief Hostel Admin',
    department: 'Hostel Administration'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
  };

  const removeToast = () => setToast(null);

  useEffect(() => {
    // Check saved session in local storage first
    const savedUser = localStorage.getItem('hostel_active_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setRole(parsed.role);
      } catch (e) {
        localStorage.removeItem('hostel_active_user');
      }
    }

    // Check Supabase session if configured
    const sb = getSupabase();
    if (sb) {
      sb.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          await handleSupabaseUser(session.user);
        }
        setLoading(false);
      });

      const { data: { subscription } } = sb.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await handleSupabaseUser(session.user);
        } else if (!localStorage.getItem('hostel_active_user')) {
          setUser(null);
          setRole(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const handleSupabaseUser = async (sbUser) => {
    const userEmail = sbUser.email;
    let detectedRole = sbUser.user_metadata?.role || 'student';
    let studentData = null;

    if (userEmail === 'warden@hostel.com' || userEmail.includes('warden')) {
      detectedRole = 'warden';
    } else if (userEmail === 'admin@hostel.com' || userEmail.includes('admin')) {
      detectedRole = 'admin';
    } else {
      detectedRole = 'student';
      // Find matching student record from DB
      studentData = await db.getStudentByEmail(userEmail);
    }

    const userData = {
      id: sbUser.id,
      email: sbUser.email,
      role: detectedRole,
      name: studentData?.name || sbUser.user_metadata?.full_name || sbUser.email.split('@')[0],
      student_id: studentData?.student_id || 1,
      course: studentData?.course || 'B.Tech',
      year: studentData?.year || 1
    };

    setUser(userData);
    setRole(detectedRole);
    localStorage.setItem('hostel_active_user', JSON.stringify(userData));
  };

  const login = async (email, password) => {
    setLoading(true);
    const sb = getSupabase();

    if (sb) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        setLoading(false);
        // Fallback to local email check if Supabase auth fails or isn't set up with users
        return attemptDemoFallbackLogin(email);
      }
      await handleSupabaseUser(data.user);
      setLoading(false);
      showToast(`Welcome back! Logged in as ${data.user.email}`, 'success');
      return { success: true };
    }

    // Local mode login fallback
    setLoading(false);
    return attemptDemoFallbackLogin(email);
  };

  const attemptDemoFallbackLogin = (email) => {
    const cleanEmail = email.trim().toLowerCase();
    let selectedDemo = null;

    if (cleanEmail.includes('admin')) {
      selectedDemo = DEMO_USERS.admin;
    } else if (cleanEmail.includes('warden')) {
      selectedDemo = DEMO_USERS.warden;
    } else {
      selectedDemo = {
        ...DEMO_USERS.student,
        email: cleanEmail,
        name: cleanEmail.split('@')[0].toUpperCase()
      };
    }

    setUser(selectedDemo);
    setRole(selectedDemo.role);
    localStorage.setItem('hostel_active_user', JSON.stringify(selectedDemo));
    showToast(`Logged in successfully as ${selectedDemo.name} (${selectedDemo.role.toUpperCase()})`, 'success');
    return { success: true, role: selectedDemo.role };
  };

  const quickLogin = (selectedRole) => {
    const demoUser = DEMO_USERS[selectedRole] || DEMO_USERS.student;
    setUser(demoUser);
    setRole(demoUser.role);
    localStorage.setItem('hostel_active_user', JSON.stringify(demoUser));
    showToast(`Switched role to ${selectedRole.toUpperCase()}`, 'success');
    return demoUser.role;
  };

  const register = async (name, email, password, roleChoice = 'student') => {
    setLoading(true);
    const sb = getSupabase();

    if (sb) {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, role: roleChoice } }
      });

      if (error) {
        setLoading(false);
        showToast(error.message, 'error');
        return { success: false, error: error.message };
      }

      if (roleChoice === 'student') {
        try {
          await db.createStudent({
            name,
            email,
            phone: '9876543210',
            course: 'B.Tech CSE',
            year: 1,
            gender: 'male',
            meal_pref: 'veg'
          });
        } catch (e) {
          console.warn('Student creation warning:', e);
        }
      }

      if (data.user) {
        await handleSupabaseUser(data.user);
      }
      setLoading(false);
      showToast('Registration successful!', 'success');
      return { success: true };
    }

    // Local registration fallback
    if (roleChoice === 'student') {
      await db.createStudent({
        name,
        email,
        phone: '9876543210',
        course: 'B.Tech CSE',
        year: 1,
        gender: 'male',
        meal_pref: 'veg'
      });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: roleChoice,
      student_id: Date.now()
    };

    setUser(newUser);
    setRole(roleChoice);
    localStorage.setItem('hostel_active_user', JSON.stringify(newUser));
    setLoading(false);
    showToast(`Account created as ${roleChoice.toUpperCase()}`, 'success');
    return { success: true };
  };

  const logout = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout notice:', e);
      }
    }
    setUser(null);
    setRole(null);
    localStorage.removeItem('hostel_active_user');
    showToast('Logged out successfully', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, quickLogin, register, logout, toast, showToast, removeToast }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
