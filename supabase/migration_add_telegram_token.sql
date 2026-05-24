-- ─── SmartPoultry: Telegram Unique Token Migration ───────────────────────────
-- Jalankan ini di Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Tambahkan kolom telegram_token ke tabel public.profiles secara aman
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telegram_token text UNIQUE DEFAULT (
  'SP-' || 
  UPPER(SUBSTRING(gen_random_uuid()::text, 1, 4)) || '-' || 
  UPPER(SUBSTRING(gen_random_uuid()::text, 1, 4)) || 
  '-LAYR'
);

-- 2. Tambahkan indeks pencarian cepat untuk token integrasi
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_token ON public.profiles(telegram_token);

-- 3. Update token acak unik untuk semua profil yang saat ini bernilai NULL
UPDATE public.profiles 
SET telegram_token = 'SP-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 4)) || '-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 4)) || '-LAYR'
WHERE telegram_token IS NULL;

-- 4. Set token khusus legacy untuk akun Demo agar demo/test tetap berjalan mulus
UPDATE public.profiles
SET telegram_token = 'SP-832F-EGG9-LAYR'
WHERE LOWER(owner_name) LIKE '%demo%';

-- 5. Verifikasi bahwa kolom telegram_token tidak nullable untuk masa depan
ALTER TABLE public.profiles ALTER COLUMN telegram_token SET NOT NULL;
