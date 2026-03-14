-- Goshala Management App - Supabase Database Schema

-- 1. Profiles (Staff/Users)
-- Links to Supabase Auth users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('Manager', 'Caretaker', 'Vet', 'Admin')) DEFAULT 'Caretaker',
  phone TEXT,
  assigned_shed_id UUID, -- Will link to sheds table
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access to profiles" ON profiles FOR ALL TO authenticated USING (true);

-- 2. Sheds
CREATE TABLE sheds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sheds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access to sheds" ON sheds FOR ALL TO authenticated USING (true);

-- Update profiles with shed foreign key now that sheds exist
ALTER TABLE profiles ADD CONSTRAINT fk_assigned_shed FOREIGN KEY (assigned_shed_id) REFERENCES sheds(id);

-- 3. Cows
CREATE TABLE cows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tag_number TEXT UNIQUE NOT NULL,
  name TEXT,
  breed TEXT,
  age_years INTEGER,
  age_months INTEGER,
  gender TEXT CHECK (gender IN ('Male', 'Female')) DEFAULT 'Female',
  photo_url TEXT,
  shed_id UUID REFERENCES sheds(id),
  arrival_date DATE DEFAULT CURRENT_DATE,
  source TEXT,
  status TEXT CHECK (status IN ('Lactating', 'Pregnant', 'Sick', 'Old', 'Calf', 'Healthy')) DEFAULT 'Healthy',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access to cows" ON cows FOR ALL TO authenticated USING (true);

-- 4. Health Records
CREATE TABLE health_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cow_id UUID REFERENCES cows(id) ON DELETE CASCADE,
  record_date DATE DEFAULT CURRENT_DATE,
  record_type TEXT CHECK (record_type IN ('Vaccination', 'Disease', 'Treatment', 'Observation')),
  notes TEXT,
  vet_notes TEXT,
  reported_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access to health records" ON health_records FOR ALL TO authenticated USING (true);

-- 5. Inventory (Feed & Medicine)
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Feed', 'Medicine', 'Equipment')),
  quantity DECIMAL NOT NULL DEFAULT 0,
  unit TEXT, -- e.g., 'kg', 'liters', 'units', 'bottles'
  low_stock_threshold DECIMAL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access to inventory" ON inventory FOR ALL TO authenticated USING (true);

-- 6. Tasks
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES profiles(id),
  due_date DATE DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('Pending', 'Completed', 'In Progress')) DEFAULT 'Pending',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access to tasks" ON tasks FOR ALL TO authenticated USING (true);

-- Insert Initial Mock Data for Sheds and Inventory to get started quickly
INSERT INTO sheds (name, capacity) VALUES 
('Main Shed A', 50), 
('Sick Bay (Hospital)', 10), 
('Calf Shed', 20);

INSERT INTO inventory (item_name, category, quantity, unit, low_stock_threshold) VALUES
('Green Fodder', 'Feed', 1000, 'kg', 200),
('Dry Fodder', 'Feed', 500, 'kg', 100),
('Concentrate', 'Feed', 200, 'kg', 50),
('Calcium Supplements', 'Medicine', 50, 'bottles', 10);
