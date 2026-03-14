-- DYNAMIC CONFIGURATION TABLES
-- Allows Admin to add Breeds, Statuses, and other lookup values

CREATE TABLE lookup_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- e.g., 'breed', 'cow_status', 'staff_role'
  label TEXT NOT NULL,    -- Human readable name (e.g., 'Gir', 'Sahiwal')
  value TEXT NOT NULL,    -- Value stored in DB
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, value)
);

ALTER TABLE lookup_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access to lookup_values" ON lookup_values FOR ALL TO authenticated USING (true);

-- Seed initial values
INSERT INTO lookup_values (category, label, value) VALUES
('breed', 'Desi', 'Desi'),
('breed', 'Gir', 'Gir'),
('breed', 'Sahiwal', 'Sahiwal'),
('breed', 'Tharparkar', 'Tharparkar'),
('breed', 'Holstein', 'Holstein'),
('cow_status', 'Healthy', 'Healthy'),
('cow_status', 'Sick', 'Sick'),
('cow_status', 'Pregnant', 'Pregnant'),
('cow_status', 'Lactating', 'Lactating'),
('cow_status', 'Calf', 'Calf'),
('cow_status', 'Old', 'Old'),
('staff_role', 'Manager', 'Manager'),
('staff_role', 'Caretaker', 'Caretaker'),
('staff_role', 'Vet', 'Vet'),
('staff_role', 'Admin', 'Admin');
