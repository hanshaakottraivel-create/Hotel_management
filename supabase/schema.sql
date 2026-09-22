-- Supabase PostgreSQL Schema for Grand Horizon Hotel Management System
-- Generated: 2026-09-22

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. Rooms Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  floor INTEGER NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Vacant Clean',
  rate_per_night NUMERIC(10, 2) NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 2,
  bed_config TEXT NOT NULL,
  amenities TEXT[] DEFAULT '{}'::TEXT[],
  current_booking_id TEXT,
  current_guest_name TEXT,
  housekeeping_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for room operations
CREATE INDEX IF NOT EXISTS idx_rooms_floor ON public.rooms(floor);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON public.rooms(type);

-- ============================================================================
-- 2. Guests Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.guests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  vip_tier TEXT NOT NULL DEFAULT 'Standard',
  id_number TEXT,
  nationality TEXT,
  total_visits INTEGER NOT NULL DEFAULT 0,
  total_spend NUMERIC(10, 2) NOT NULL DEFAULT 0,
  preferences TEXT[] DEFAULT '{}'::TEXT[],
  notes TEXT,
  last_visit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for guest lookups
CREATE INDEX IF NOT EXISTS idx_guests_name ON public.guests(name);
CREATE INDEX IF NOT EXISTS idx_guests_email ON public.guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_vip_tier ON public.guests(vip_tier);

-- ============================================================================
-- 3. Bookings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  guest_id TEXT REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  room_id TEXT REFERENCES public.rooms(id) ON DELETE SET NULL,
  room_number TEXT NOT NULL,
  room_type TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights INTEGER NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  status TEXT NOT NULL DEFAULT 'Confirmed',
  source TEXT NOT NULL DEFAULT 'Direct',
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for bookings and reservations
CREATE INDEX IF NOT EXISTS idx_bookings_guest_name ON public.bookings(guest_name);
CREATE INDEX IF NOT EXISTS idx_bookings_room_number ON public.bookings(room_number);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_source ON public.bookings(source);

-- ============================================================================
-- 4. Staff Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  shift TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'On Duty',
  phone TEXT NOT NULL,
  active_tasks INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3, 1) NOT NULL DEFAULT 5.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for staff roster
CREATE INDEX IF NOT EXISTS idx_staff_department ON public.staff(department);
CREATE INDEX IF NOT EXISTS idx_staff_shift ON public.staff(shift);
CREATE INDEX IF NOT EXISTS idx_staff_status ON public.staff(status);

-- ============================================================================
-- 5. Hotel Tasks Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hotel_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  room_number TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  assigned_to TEXT,
  due_time TEXT NOT NULL,
  ai_priority_score INTEGER,
  ai_rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for housekeeping and work orders
CREATE INDEX IF NOT EXISTS idx_hotel_tasks_status ON public.hotel_tasks(status);
CREATE INDEX IF NOT EXISTS idx_hotel_tasks_priority ON public.hotel_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_hotel_tasks_room ON public.hotel_tasks(room_number);
CREATE INDEX IF NOT EXISTS idx_hotel_tasks_category ON public.hotel_tasks(category);

-- ============================================================================
-- 6. Payments Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  reservation_id TEXT,
  guest_name TEXT NOT NULL,
  room_number TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL,
  method TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for financial records
CREATE INDEX IF NOT EXISTS idx_payments_reservation ON public.payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(date);
CREATE INDEX IF NOT EXISTS idx_payments_method ON public.payments(method);

-- ============================================================================
-- 7. Activities Log Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  badge_color TEXT DEFAULT 'blue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for activity chronological queries
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

-- ============================================================================
-- Triggers for Automatic updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_rooms_updated_at ON public.rooms;
CREATE TRIGGER trigger_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_guests_updated_at ON public.guests;
CREATE TRIGGER trigger_guests_updated_at
BEFORE UPDATE ON public.guests
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_bookings_updated_at ON public.bookings;
CREATE TRIGGER trigger_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_staff_updated_at ON public.staff;
CREATE TRIGGER trigger_staff_updated_at
BEFORE UPDATE ON public.staff
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_hotel_tasks_updated_at ON public.hotel_tasks;
CREATE TRIGGER trigger_hotel_tasks_updated_at
BEFORE UPDATE ON public.hotel_tasks
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ============================================================================
-- Row Level Security (RLS)
-- Enables secure access via Supabase client with anon/service_role keys
-- ============================================================================
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Allow read and write policies for hotel management operations
DO $$
BEGIN
  -- Rooms policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rooms' AND policyname = 'Allow full access to rooms') THEN
    CREATE POLICY "Allow full access to rooms" ON public.rooms FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Guests policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guests' AND policyname = 'Allow full access to guests') THEN
    CREATE POLICY "Allow full access to guests" ON public.guests FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Bookings policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Allow full access to bookings') THEN
    CREATE POLICY "Allow full access to bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Staff policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff' AND policyname = 'Allow full access to staff') THEN
    CREATE POLICY "Allow full access to staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Hotel Tasks policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hotel_tasks' AND policyname = 'Allow full access to hotel_tasks') THEN
    CREATE POLICY "Allow full access to hotel_tasks" ON public.hotel_tasks FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Payments policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Allow full access to payments') THEN
    CREATE POLICY "Allow full access to payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Activities policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activities' AND policyname = 'Allow full access to activities') THEN
    CREATE POLICY "Allow full access to activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
