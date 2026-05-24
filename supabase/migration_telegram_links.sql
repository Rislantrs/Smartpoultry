-- ─── SmartPoultry: Telegram Integration Migration ───────────────────────────
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Tabel penghubung Telegram chat_id ke profile dashboard
CREATE TABLE IF NOT EXISTS public.telegram_links (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chat_id       bigint      NOT NULL UNIQUE,
  username      text,                     -- Username Telegram (opsional)
  first_name    text,                     -- Nama depan Telegram
  linked_at     timestamptz DEFAULT now() NOT NULL,
  is_active     boolean     DEFAULT true  NOT NULL,
  notify_daily  boolean     DEFAULT true  NOT NULL,   -- Terima laporan harian otomatis
  notify_hour   int         DEFAULT 7     NOT NULL,   -- Jam kirim laporan (WIB, 0-23)
  last_seen_at  timestamptz
);

-- Index untuk query cepat by chat_id dan profile_id
CREATE INDEX IF NOT EXISTS idx_telegram_links_chat_id     ON public.telegram_links (chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_links_profile_id  ON public.telegram_links (profile_id);

-- Row Level Security
ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY;

-- Policy: user hanya bisa baca/ubah data miliknya sendiri
CREATE POLICY "Users can manage their own telegram links"
  ON public.telegram_links
  FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Policy: service role bisa akses semua (untuk Edge Function Telegram webhook)
CREATE POLICY "Service role full access"
  ON public.telegram_links
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Tabel log aktivitas Telegram (untuk riwayat perintah dari bot)
CREATE TABLE IF NOT EXISTS public.telegram_activity_logs (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id    uuid        REFERENCES public.profiles(id) ON DELETE CASCADE,
  chat_id       bigint      NOT NULL,
  command       text        NOT NULL,     -- Perintah yang diketik (/start, TL 500, dll)
  response_type text,                     -- 'log_saved' | 'report' | 'csv' | 'ai_chat' | 'error'
  message_id    bigint,                   -- Telegram message_id untuk referensi
  created_at    timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tg_activity_profile ON public.telegram_activity_logs (profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tg_activity_chat    ON public.telegram_activity_logs (chat_id, created_at DESC);

ALTER TABLE public.telegram_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their telegram activity"
  ON public.telegram_activity_logs
  FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Service role full access on activity"
  ON public.telegram_activity_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Pastikan tabel daily_logs sudah punya kolom input_source dengan nilai 'Telegram'
-- (Kolom sudah ada, tapi tambahkan 'AI Agent' jika belum)
-- ALTER TABLE daily_logs DROP CONSTRAINT IF EXISTS daily_logs_input_source_check;
-- ALTER TABLE daily_logs ADD CONSTRAINT daily_logs_input_source_check
--   CHECK (input_source IN ('Web', 'Telegram', 'AI Agent', 'Manual'));
