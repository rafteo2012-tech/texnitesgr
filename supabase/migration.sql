-- =============================================================
-- TexnitesGR Database Schema Migration
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)
-- =============================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- 1. PROFILES
-- =============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'technician', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Sync profile full_name from user_metadata on email confirmation
CREATE OR REPLACE FUNCTION sync_profile_on_confirm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET full_name = COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User')
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION sync_profile_on_confirm();

-- =============================================================
-- 2. TECHNICIANS
-- =============================================================
CREATE TABLE technicians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  bio TEXT,
  city TEXT NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  hourly_rate DECIMAL(10,2),
  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  photos TEXT[] DEFAULT '{}',
  subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'premium')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_technicians_user_id ON technicians(user_id);
CREATE INDEX idx_technicians_city ON technicians(city);
CREATE INDEX idx_technicians_categories ON technicians USING GIN(categories);
CREATE INDEX idx_technicians_active ON technicians(is_active) WHERE is_active = TRUE;

-- =============================================================
-- 3. BOOKINGS
-- =============================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_technician ON bookings(technician_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- =============================================================
-- 4. SERVICE REQUESTS (guest / general requests)
-- =============================================================
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  preferred_date TIMESTAMPTZ,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- 5. REVIEWS
-- =============================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(booking_id)
);

CREATE INDEX idx_reviews_technician ON reviews(technician_id);

-- Auto-update technician avg_rating and total_reviews
CREATE OR REPLACE FUNCTION update_technician_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.technicians
  SET
    avg_rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE technician_id = NEW.technician_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE technician_id = NEW.technician_id)
  WHERE id = NEW.technician_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_added
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_rating();

-- =============================================================
-- 6. ROW LEVEL SECURITY
-- =============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

-- TECHNICIANS
CREATE POLICY "Technicians are viewable by everyone"
  ON technicians FOR SELECT USING (true);

CREATE POLICY "Technicians can update own profile"
  ON technicians FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Anyone can create a technician profile"
  ON technicians FOR INSERT WITH CHECK (user_id = auth.uid());

-- BOOKINGS
CREATE POLICY "Customers can view own bookings"
  ON bookings FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Technicians can view assigned bookings"
  ON bookings FOR SELECT
  USING (technician_id IN (SELECT id FROM public.technicians WHERE user_id = auth.uid()));

CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Technicians can update assigned bookings"
  ON bookings FOR UPDATE
  USING (technician_id IN (SELECT id FROM public.technicians WHERE user_id = auth.uid()));

-- SERVICE REQUESTS
CREATE POLICY "Anyone can create service requests"
  ON service_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view service requests"
  ON service_requests FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- REVIEWS
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews"
  ON reviews FOR INSERT WITH CHECK (customer_id = auth.uid());

-- =============================================================
-- 7. ADMIN USER (run once to set first admin)
-- =============================================================
-- After creating your account, run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
