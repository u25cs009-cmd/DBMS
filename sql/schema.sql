-- =======================================================
-- HOSTEL MANAGEMENT SYSTEM - SUPABASE POSTGRESQL SCHEMA
-- =======================================================

-- 1. Create Tables

-- Students Table
CREATE TABLE IF NOT EXISTS students (
  student_id  SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  phone       VARCHAR(15),
  course      VARCHAR(50),
  year        INT CHECK (year BETWEEN 1 AND 4),
  gender      VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  meal_pref   VARCHAR(10) DEFAULT 'veg' CHECK (meal_pref IN ('veg', 'non-veg')),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  room_id     SERIAL PRIMARY KEY,
  room_number VARCHAR(10) UNIQUE NOT NULL,
  floor       INT NOT NULL,
  type        VARCHAR(10) CHECK (type IN ('single', 'double', 'triple')),
  capacity    INT NOT NULL,
  status      VARCHAR(15) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance'))
);

-- Allocations Table
CREATE TABLE IF NOT EXISTS allocations (
  allocation_id SERIAL PRIMARY KEY,
  student_id    INT REFERENCES students(student_id) ON DELETE CASCADE,
  room_id       INT REFERENCES rooms(room_id) ON DELETE SET NULL,
  alloc_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  vacate_date   DATE
);

-- Fees Table
CREATE TABLE IF NOT EXISTS fees (
  fee_id      SERIAL PRIMARY KEY,
  student_id  INT REFERENCES students(student_id) ON DELETE CASCADE,
  amount      DECIMAL(10,2) NOT NULL,
  semester    VARCHAR(20) NOT NULL,
  due_date    DATE NOT NULL,
  paid_date   DATE,
  status      VARCHAR(10) DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'overdue'))
);

-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  complaint_id  SERIAL PRIMARY KEY,
  student_id    INT REFERENCES students(student_id) ON DELETE CASCADE,
  category      VARCHAR(30) CHECK (category IN ('plumbing', 'electricity', 'cleanliness', 'furniture', 'internet', 'other')),
  description   TEXT NOT NULL,
  raised_date   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status        VARCHAR(15) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  resolved_date TIMESTAMP WITH TIME ZONE
);

-- Mess Menu Table
CREATE TABLE IF NOT EXISTS mess_menu (
  menu_id     SERIAL PRIMARY KEY,
  day_of_week VARCHAR(10) CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  meal_type   VARCHAR(15) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  items       TEXT NOT NULL
);

-- =======================================================
-- 2. Create Indexes (Required Optimization)
-- =======================================================
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_fees_student ON fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(status);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- =======================================================
-- 3. Row Level Security (RLS) Permissive Policies
-- (Ensures INSERT/UPDATE/DELETE are allowed without RLS block errors)
-- =======================================================
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE allocations DISABLE ROW LEVEL SECURITY;
ALTER TABLE fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;
ALTER TABLE mess_menu DISABLE ROW LEVEL SECURITY;

-- Fallback policies in case RLS is forcefully enabled in Supabase UI
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE mess_menu ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access to students" ON students;
CREATE POLICY "Public full access to students" ON students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to rooms" ON rooms;
CREATE POLICY "Public full access to rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to allocations" ON allocations;
CREATE POLICY "Public full access to allocations" ON allocations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to fees" ON fees;
CREATE POLICY "Public full access to fees" ON fees FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to complaints" ON complaints;
CREATE POLICY "Public full access to complaints" ON complaints FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to mess_menu" ON mess_menu;
CREATE POLICY "Public full access to mess_menu" ON mess_menu FOR ALL USING (true) WITH CHECK (true);

-- =======================================================
-- 4. Seed Sample Data for Testing
-- =======================================================

-- Rooms
INSERT INTO rooms (room_number, floor, type, capacity, status) VALUES
('101', 1, 'single', 1, 'occupied'),
('102', 1, 'double', 2, 'occupied'),
('103', 1, 'double', 2, 'available'),
('201', 2, 'triple', 3, 'available'),
('202', 2, 'single', 1, 'maintenance'),
('203', 2, 'double', 2, 'available'),
('301', 3, 'triple', 3, 'available')
ON CONFLICT (room_number) DO NOTHING;

-- Students
INSERT INTO students (name, email, phone, course, year, gender, meal_pref) VALUES
('Rahul Sharma', 'student@hostel.com', '9876543210', 'B.Tech CSE', 2, 'male', 'veg'),
('Priya Patel', 'priya@example.com', '9876543211', 'B.Tech IT', 1, 'female', 'non-veg'),
('Aarav Mehta', 'aarav@example.com', '9876543212', 'B.Tech ECE', 3, 'male', 'veg'),
('Ananya Sen', 'ananya@example.com', '9876543213', 'B.Tech ME', 4, 'female', 'veg')
ON CONFLICT (email) DO NOTHING;

-- Allocations
INSERT INTO allocations (student_id, room_id, alloc_date) VALUES
(1, 1, '2026-07-15'),
(2, 2, '2026-07-20'),
(3, 2, '2026-07-22')
ON CONFLICT DO NOTHING;

-- Fees
INSERT INTO fees (student_id, amount, semester, due_date, paid_date, status) VALUES
(1, 25000.00, 'Sem 3 (2026)', '2026-08-01', NULL, 'unpaid'),
(1, 25000.00, 'Sem 2 (2026)', '2026-01-15', '2026-01-10', 'paid'),
(2, 25000.00, 'Sem 1 (2026)', '2026-08-01', '2026-07-25', 'paid'),
(3, 25000.00, 'Sem 5 (2026)', '2026-06-01', NULL, 'overdue')
ON CONFLICT DO NOTHING;

-- Complaints
INSERT INTO complaints (student_id, category, description, status, raised_date) VALUES
(1, 'plumbing', 'Water leakage in bathroom sink. Requires urgent repair.', 'pending', NOW() - INTERVAL '2 days'),
(1, 'internet', 'Wi-Fi connection speeds are dropping frequently in room 101.', 'resolved', NOW() - INTERVAL '10 days'),
(2, 'electricity', 'Ceiling fan is making loud rattling noise in room 102.', 'in_progress', NOW() - INTERVAL '4 days'),
(3, 'cleanliness', 'Corridor on 2nd floor needs deep cleaning.', 'pending', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Mess Menu
INSERT INTO mess_menu (day_of_week, meal_type, items) VALUES
('Monday', 'breakfast', 'Aloo Paratha, Curd, Butter, Tea / Coffee'),
('Monday', 'lunch', 'Dal Tadka, Shahi Paneer, Jeera Rice, Chapati, Salad'),
('Monday', 'dinner', 'Mix Veg, Chana Dal, Rice, Roti, Gulab Jamun'),
('Tuesday', 'breakfast', 'Poha, Sev, Jalebi, Tea / Coffee'),
('Tuesday', 'lunch', 'Rajma Masala, Steamed Rice, Butter Roti, Boondi Raita'),
('Tuesday', 'dinner', 'Kadhai Paneer / Egg Curry, Rice, Roti, Kheer'),
('Wednesday', 'breakfast', 'Idli, Sambhar, Coconut Chutney, Coffee'),
('Wednesday', 'lunch', 'Kadhi Pakoda, Rice, Roti, Aloo Jeera'),
('Wednesday', 'dinner', 'Veg Biryani / Chicken Biryani, Mirchi Ka Salan, Raita'),
('Thursday', 'breakfast', 'Masala Dosa, Sambhar, Chutney, Tea'),
('Thursday', 'lunch', 'Chole Bhature, Onion Salad, Mint Chutney, Lassi'),
('Thursday', 'dinner', 'Dal Makhani, Mix Veg, Naan, Rice, Ice Cream'),
('Friday', 'breakfast', 'Uttapam, Sambhar, Tea / Coffee'),
('Friday', 'lunch', 'Dal Fry, Aloo Gobi, Rice, Chapati, Papad'),
('Friday', 'dinner', 'Paneer Butter Masala, Rice, Roti, Fruit Custard'),
('Saturday', 'breakfast', 'Bread Omlette / Veg Sandwich, Tea / Juice'),
('Saturday', 'lunch', 'Veg Pulao, Dal Makhani, Roti, Salad'),
('Saturday', 'dinner', 'Puri Bhaji, Rice, Sweet Lassi'),
('Sunday', 'breakfast', 'Puri Chole, Halwa, Tea / Coffee'),
('Sunday', 'lunch', 'Special Veg Thali / Chicken Curry Thali'),
('Sunday', 'dinner', 'Pav Bhaji, Fried Rice, Sweet')
ON CONFLICT DO NOTHING;
