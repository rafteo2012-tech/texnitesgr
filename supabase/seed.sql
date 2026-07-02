-- =============================================================
-- TexnitesGR Seed Data
-- Run AFTER migration.sql (only in development)
-- =============================================================

-- Create a test technician user (password: test123456)
-- Note: In production, users register through the app.
-- This is for local development only.

-- First, create a test user in auth.users (requires service_role key)
-- Or use the app's registration form at /register-technician

-- Sample technician data (insert after user signs up via the app)
-- UPDATE public.profiles SET role = 'technician' WHERE email = 'tech@example.com';

-- INSERT INTO public.technicians (user_id, business_name, bio, city, categories, hourly_rate, is_verified, is_featured, is_active)
-- VALUES (
--   (SELECT id FROM public.profiles WHERE email = 'tech@example.com'),
--   'Παπαδόπουλος Υδραυλικοί',
--   'Έμπειρος υδραυλικός με 15 χρόνια στην αγορά. Αναλαμβάνω επισκευές, εγκαταστάσεις και αποφράξεις.',
--   'Αθήνα',
--   ARRAY['plumber', 'hvac'],
--   45.00,
--   TRUE,
--   TRUE,
--   TRUE
-- );

-- Set admin (run after creating your account):
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@example.com';
