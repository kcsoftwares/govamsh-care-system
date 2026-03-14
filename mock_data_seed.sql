-- MOCK DATA FOR GOSHALA DASHBOARD TESTING
-- Run this in your Supabase SQL Editor AFTER the tables have been created

-- 1. Ensure we have sheds
INSERT INTO sheds (name, capacity) 
VALUES 
  ('Gopala Shed (Milking)', 40),
  ('Nandi Shed (Bulls)', 20),
  ('Krishna Calf Nursery', 30),
  ('Dhanvantari Clinic (Sick Bay)', 15)
ON CONFLICT DO NOTHING;

-- Get the shed IDs for our cows
DO $$ 
DECLARE
  milking_shed_id UUID;
  nursery_shed_id UUID;
  sick_shed_id UUID;
  manager_id UUID;
BEGIN
  -- Get Shed IDs
  SELECT id INTO milking_shed_id FROM sheds WHERE name = 'Gopala Shed (Milking)' LIMIT 1;
  SELECT id INTO nursery_shed_id FROM sheds WHERE name = 'Krishna Calf Nursery' LIMIT 1;
  SELECT id INTO sick_shed_id FROM sheds WHERE name = 'Dhanvantari Clinic (Sick Bay)' LIMIT 1;

  -- 2. Insert Mock Cows
  -- Healthy/Lactating Cow
  INSERT INTO cows (tag_number, name, breed, age_years, age_months, gender, shed_id, status)
  VALUES ('TAG-001', 'Ganga', 'Gir', 4, 2, 'Female', milking_shed_id, 'Lactating')
  ON CONFLICT (tag_number) DO NOTHING;

  -- Pregnant Cow
  INSERT INTO cows (tag_number, name, breed, age_years, age_months, gender, shed_id, status)
  VALUES ('TAG-002', 'Yamuna', 'Sahiwal', 5, 0, 'Female', milking_shed_id, 'Pregnant')
  ON CONFLICT (tag_number) DO NOTHING;

  -- Another Pregnant Cow
  INSERT INTO cows (tag_number, name, breed, age_years, age_months, gender, shed_id, status)
  VALUES ('TAG-003', 'Saraswati', 'Tharparkar', 3, 6, 'Female', milking_shed_id, 'Pregnant')
  ON CONFLICT (tag_number) DO NOTHING;

  -- Sick Cow
  INSERT INTO cows (tag_number, name, breed, age_years, age_months, gender, shed_id, status)
  VALUES ('TAG-004', 'Kaveri', 'Gir', 7, 1, 'Female', sick_shed_id, 'Sick')
  ON CONFLICT (tag_number) DO NOTHING;

  -- Calf
  INSERT INTO cows (tag_number, name, breed, age_years, age_months, gender, shed_id, status)
  VALUES ('TAG-005', 'Nandini', 'Gir', 0, 5, 'Female', nursery_shed_id, 'Calf')
  ON CONFLICT (tag_number) DO NOTHING;

  -- Old Cow
  INSERT INTO cows (tag_number, name, breed, age_years, age_months, gender, shed_id, status)
  VALUES ('TAG-006', 'Godavari', 'Desi', 14, 0, 'Female', sick_shed_id, 'Old')
  ON CONFLICT (tag_number) DO NOTHING;

  -- 3. Securely Insert Mock Tasks
  -- Try to find the user testing the app (the one you just made)
  SELECT id INTO manager_id FROM auth.users LIMIT 1;

  IF manager_id IS NOT NULL THEN
    -- Ensure the user exists in the profiles table (required for foreign key constraints!)
    INSERT INTO profiles (id, name, role)
    VALUES (manager_id, 'App Admin', 'Manager')
    ON CONFLICT (id) DO NOTHING;

    -- Now safely insert tasks assigned to this profile
    INSERT INTO tasks (title, description, assigned_to, due_date, status, created_by)
    VALUES 
      ('Morning Feed Distribution', 'Mix 300kg green fodder for Main Shed', manager_id, CURRENT_DATE, 'Completed', manager_id),
      ('Medical Checkup: Kaveri (#TAG-004)', 'Administer antibiotics and dress wound', manager_id, CURRENT_DATE, 'Pending', manager_id),
      ('Shed Sanitization', 'Deep clean and wash Calf Shed area', manager_id, CURRENT_DATE, 'In Progress', manager_id),
      ('Record Milk Output', 'Log evening milk yield from Gopala Shed', manager_id, CURRENT_DATE, 'Pending', manager_id);
  END IF;

END $$;
