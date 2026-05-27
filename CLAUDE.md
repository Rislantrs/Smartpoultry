# CLAUDE.md — SmartPoultry AI Agent & Dashboard

## 1. Project Overview

- **Name** : SmartPoultry AI
- **Description** : Ekosistem dashboard & AI Agent berbasis website dan Telegram yang dirancang khusus untuk peternak ayam petelur (layer) di Indonesia. Membantu otomatisasi pencatatan harian, analisis efisiensi pakan (FCR), dan diagnosis penyakit ayam secara instan.
- **Goal** : Mengeliminasi pembukuan manual, memberikan peringatan dini terhadap penurunan produksi, dan mempermudah manajemen kandang menggunakan bahasa alami sehari-hari.
- **Target Users**: Peternak ayam petelur mandiri, pekerja kandang, dan pemilik bisnis peternakan di Indonesia.
- **Status** : Active MVP Development (Vite + React + Supabase)

---

## 2. Tech Stack Terkini (Aktif)

- **Frontend Core** : React 19 + Vite 6 (Sangat cepat untuk pengembangan)
- **Routing** : React Router DOM v7 (Client-side nested routing)
- **Styling** : Tailwind CSS v4 (Sleek, performan tinggi)
- **Animations** : Framer Motion (`motion/react` untuk mikro-interaksi premium)
- **UI Icons** : Lucide React (Konsisten & modern)
- **Charts Library**: Recharts (Visualisasi Area & Pie Chart yang responsif)
- **Database / Auth**: Supabase (PostgreSQL + Realtime + Supabase Auth)
- **AI Integration** : Google Gemini API (Menggunakan `@google/genai` di Backend / Edge Functions)
- **Bot Engine** : Telegraf.js / Express (Untuk Bot Telegram)
- **Package Manager**: NPM

---

## 3. Struktur Folder Proyek (Aktif)

Proyek ini terstruktur secara bersih dengan memisahkan halaman landing page publik dan dashboard peternak:

```
[root]/
├── smartpoultry/
│   ├── src/
│   │   ├── lib/                  # Inisialisasi Supabase Client
│   │   │   └── supabase.ts
│   │   ├── types/                # Strict TypeScript database & entity interfaces
│   │   │   └── database.ts
│   │   ├── data/                 # Root-level Mock Data untuk simulasi database
│   │   │   └── mockData.ts
│   │   ├── components/           # UI Components
│   │   │   ├── dashboard/        # Seluruh Ekosistem Dashboard
│   │   │   │   ├── data/         # Mock data spesifik dashboard (bahasa Indonesia)
│   │   │   │   │   └── mockData.ts
│   │   │   │   ├── pages/        # Halaman-halaman Dashboard
│   │   │   │   │   └── OverviewPage.tsx  # Halaman Ringkasan Utama (Premium)
│   │   │   │   ├── ui/           # UI Atoms (Reusable dashboard components)
│   │   │   │   │   └── StatCard.tsx
│   │   │   │   ├── DashboardLayout.tsx  # Layout Shell (Sidebar + TopBar + Chat)
│   │   │   │   ├── Sidebar.tsx   # Sidebar Navigasi Collapsible
│   │   │   │   ├── TopBar.tsx    # Bar Atas (Notifikasi, Selektor Periode, User)
│   │   │   │   └── AiChatPanel.tsx # Floating Panel Chat AI Analyst (Gemini-ready)
│   │   │   └── (Landing Page)    # Header.tsx, Hero.tsx, Footer.tsx, dll.
│   │   ├── App.tsx               # Konfigurasi Routing Utama
│   │   ├── index.css             # Tema & CSS Tokens (Warm Poultry Accent)
│   │   └── main.tsx              # Bootstrap React App
│   ├── package.json              # Dependencies & Scripts
│   └── vite.config.ts            # Konfigurasi Bundler Vite & Tailwind v4
```

---

## 4. CEKLIS PROGRES PENGEMBANGAN

Di bawah ini adalah status pencapaian fitur yang telah diselesaikan dan daftar tugas selanjutnya (TODO) untuk diselesaikan:

### **Fase 1: Fondasi & Konfigurasi** ✅
- [x] Inisialisasi Client Supabase dengan proteksi environment variables (`src/lib/supabase.ts`)
- [x] Desain Tipe TypeScript Terstruktur sesuai skema database ril (`src/types/database.ts`)
- [x] Konfigurasi Router Aplikasi menggunakan React Router (`src/App.tsx`, `src/main.tsx`)
- [x] Penyusunan data simulasi (mock data) bisnis peternakan dalam bahasa Indonesia (`src/components/dashboard/data/mockData.ts`)

### **Fase 2: Layout Dashboard Premium & Responsif** ✅
- [x] Membuat Layout Utama Dashboard (`DashboardLayout.tsx`)
- [x] Mendesain Sidebar Navigasi Interaktif dengan indikator active state animasi gold (`Sidebar.tsx`)
- [x] Membuat TopBar dengan filter periode, notifikasi popover, profil user, dan tombol ekspor (`TopBar.tsx`)
- [x] Implementasi transisi responsif untuk layar handphone (Mobile slide-in sidebar overlay)

### **Fase 3: Halaman Utama (Overview Page)** ✅
- [x] Banner AI Analyst penyambut harian berbasis waktu (Pagi/Siang/Sore/Malam) yang bisa di-dismiss
- [x] 4 Kartu Metrik Pintar (Populasi Ayam, Produksi Telur, Feed Conversion Ratio, Mortalitas) lengkap dengan indikator kenaikan/penurunan
- [x] Grafik Tren Produksi Telur 30 hari terakhir dengan visualisasi gradient Area Chart (Recharts)
- [x] Donut Chart Komposisi Biaya Operasional (Pakan vs Vitamin/Obat vs Operasional)
- [x] Tabel Riwayat Log Pencatatan Terakhir dengan status badge berwarna (Berhasil, Peringatan) dan ikon sumber (Telegram Bot vs Web)

### **Fase 4: Asisten AI Chat Panel (Gemini-Ready)** ✅
- [x] Floating Chat Button dengan efek denyut halus (pulse micro-animation)
- [x] Panel Obrolan AI yang melayang dan dapat dibuka-tutup dengan lancar
- [x] Balon chat interaktif untuk user dan AI, lengkap dengan efek mengetik (typing indicator)
- [x] Tombol Aksi Cepat (Quick Actions) untuk laporan cepat (misal: "Laporkan ayam mati", "Cek efisiensi pakan")
- [x] Template mock response simulasi asisten AI peternakan berbahasa Indonesia casual

---

### **Fase 5: Langkah Selanjutnya (TODO Rencana Kerja)** 🚀

#### **1. Implementasi Halaman Dashboard Tambahan** ✅
- [x] **Halaman Spreadsheet Logs (`/dashboard/logs`)** — Selesai!
- [x] **Halaman Analitik Mendalam (`/dashboard/analytics`)** — Selesai!
- [x] **Halaman Klinik AI / Vet AI (`/dashboard/diagnosis`)** — Selesai!
- [x] **Halaman Inventaris Gudang (`/dashboard/inventory`)** — Selesai!
- [x] **Halaman Pengaturan & Integrasi (`/dashboard/settings`)** — Selesai!

#### **2. Integrasi Backend AI Agent (Backend-First Gemini)**
- [ ] Membuat **Supabase Edge Function** (`/supabase/functions/poultry-ai`) untuk proxy aman ke Gemini API
- [ ] Menghubungkan chat input pada `AiChatPanel.tsx` dengan endpoint real Edge Function
- [ ] Menyusun system prompt Gemini khusus peternakan (menggunakan bahasa Indonesia yang santun, praktis, dan suportif)

#### **3. Integrasi Autentikasi & Data Ril**
- [ ] Menghubungkan tombol "Login" di `LoginModal.tsx` dengan **Supabase Auth**
- [ ] Mengaktifkan proteksi rute `/dashboard/*` agar pengunjung yang belum login dialihkan ke `/`
- [ ] Mengganti data statis user dengan metadata akun peternak dari sesi aktif Supabase Auth

---

## 5. Daftar Tugas Eksternal & Deployment (Tindakan Manual User) 🛠️

Berikut adalah daftar hal-hal eksternal penting yang perlu diatur di luar kode frontend (seperti Supabase API Key, Secret Token, skema database, dan Bot Telegram) untuk mengaktifkan fitur secara penuh:

### A. Pengaturan & Kredensial Supabase (Database & Auth)
- [ ] **Buat Proyek Baru Supabase**: Buat proyek di [supabase.com](https://supabase.com).
- [ ] **Salin Kredensial**: Ambil `SUPABASE_URL` dan `SUPABASE_ANON_KEY` dari dashboard Supabase Anda.
- [ ] **Konfigurasi Environment Variables Lokal**: Buat file `.env` di dalam folder `smartpoultry/` dengan isi:
  ```env
  VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
  VITE_SUPABASE_ANON_KEY=<your-anon-key>
  ```

### B. Penyusunan Skema Database (PostgreSQL Schema)
Jalankan script DDL berikut di Supabase SQL Editor untuk menyusun tabel-tabel data real peternakan:
- [ ] **Tabel `profiles`** (Menyimpan detail peternak):
  ```sql
  create table profiles (
    id uuid references auth.users on delete cascade primary key,
    farm_name text not null,
    owner_name text not null,
    phone_number text,
    location text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );
  ```
- [ ] **Tabel `cages`** (Konfigurasi Kandang):
  ```sql
  create table cages (
    id uuid default gen_random_uuid() primary key,
    profile_id uuid references profiles(id) on delete cascade not null,
    strain text not null,
    chicken_age_weeks integer not null,
    capacity integer not null,
    target_fcr numeric(4,2) default 2.15 not null,
    updated_at timestamp with time zone default now()
  );
  ```
- [ ] **Tabel `daily_logs`** (Lembar Harian Kandang - Lengkap):
  ```sql
  create table daily_logs (
    id uuid default gen_random_uuid() primary key,
    profile_id uuid references profiles(id) on delete cascade not null,
    log_date date default current_date not null,
    -- Produksi (Wajib)
    eggs_qty_pcs integer not null,
    eggs_weight_kg numeric(6,2) not null,
    eggs_damaged_pcs integer default 0 not null,
    -- Pakan (Wajib & Opsional)
    feed_consumed_kg numeric(6,2) not null,
    feed_consumed_bags numeric(4,1) not null,
    feed_remaining_kg numeric(6,2), -- Opsional
    -- Air & Vitamin (Wajib & Opsional)
    water_status text default 'Bersih'::text not null, -- 'Bersih', 'Keruh'
    vitamin_dose_time text, -- Opsional (cth: "10:00 - 5ml/L Vita Stress")
    -- Kesehatan (Wajib & Opsional)
    mortality_count integer default 0 not null,
    health_symptoms text, -- Opsional
    -- Lingkungan (Wajib)
    temp_morning_c numeric(3,1) not null,
    temp_afternoon_c numeric(3,1) not null,
    feces_condition text default 'Normal'::text not null, -- 'Normal', 'Basah'
    -- Operasional (Opsional)
    egg_collection_time text, -- Opsional (cth: "09:00, 14:00")
    cleaning_schedule text, -- Opsional (cth: "Sapu & semprot kandang A")
    -- Metadata
    input_source text default 'Web'::text not null, -- 'Web', 'Telegram', 'AI Agent'
    created_at timestamp with time zone default now()
  );
  ```
- [ ] **Tabel `vaccination_logs`** (Log 1: Kesehatan & Vaksinasi):
  ```sql
  create table vaccination_logs (
    id uuid default gen_random_uuid() primary key,
    profile_id uuid references profiles(id) on delete cascade not null,
    log_date date not null,
    vaccine_name text not null,
    dose_method text not null, -- 'Tetes Mata', 'Suntik', 'Air Minum'
    side_effects text, -- Opsional
    target_group text not null, -- 'Semua Kandang', 'Blok A', 'Kandang 1'
    created_at timestamp with time zone default now()
  );
  ```
- [ ] **Tabel `weekly_recap_logs`** (Log 2: Rekap Produksi & Kualitas Mingguan):
  ```sql
  create table weekly_recap_logs (
    id uuid default gen_random_uuid() primary key,
    profile_id uuid references profiles(id) on delete cascade not null,
    week_start_date date not null,
    total_eggs_pcs integer not null,
    total_feed_kg numeric(8,2) not null,
    fcr numeric(4,2) not null, -- Total Pakan / Total Berat Telur
    shell_quality_notes text, -- Opsional (cth: "Cangkang tipis 5% di blok B")
    created_at timestamp with time zone default now()
  );
  ```
- [ ] **Tabel `inventory_logs`** (Log 3: Mutasi Persediaan Gudang):
  ```sql
  create table inventory_logs (
    id uuid default gen_random_uuid() primary key,
    profile_id uuid references profiles(id) on delete cascade not null,
    item_name text not null, -- Pakan, Vitamin, Tray Telur, Disinfektan
    stock_initial numeric(8,2) not null,
    stock_in numeric(8,2) default 0.00 not null,
    stock_out numeric(8,2) default 0.00 not null,
    stock_final numeric(8,2) not null,
    expiry_date date, -- Opsional (Obat / pakan)
    log_date date default current_date not null
  );
  ```
- [ ] **Tabel `maintenance_logs`** (Log 4: Perawatan & Perbaikan):
  ```sql
  create table maintenance_logs (
    id uuid default gen_random_uuid() primary key,
    profile_id uuid references profiles(id) on delete cascade not null,
    log_date date not null,
    item_category text not null, -- 'Kipas', 'Nipple', 'Atap', 'Lampu'
    activity_details text not null, -- 'Perbaikan', 'Servis', 'Pembersihan total'
    cost numeric(12,2) default 0.00 not null,
    created_at timestamp with time zone default now()
  );
  ```
- [ ] **Tabel `financial_sales_logs`** (Log 5: Keuangan & Penjualan Pasar):
  ```sql
  create table financial_sales_logs (
    id uuid default gen_random_uuid() primary key,
    profile_id uuid references profiles(id) on delete cascade not null,
    log_date date not null,
    volume_sold_kg numeric(8,2) not null,
    price_per_kg numeric(10,2) not null,
    total_revenue numeric(12,2) not null, -- Volume * Harga
    buyer_notes text, -- Opsional
    created_at timestamp with time zone default now()
  );
  ```

### C. Integrasi API Gemini di Supabase Edge Functions
- [ ] **Dapatkan API Key Gemini**: Daftar dan dapatkan kunci API gratis/berbayar di Google AI Studio.
- [ ] **Simpan API Key di Supabase Secrets**: Lewat terminal CLI lokal atau dashboard Supabase, atur variabel rahasia dengan perintah:
  ```bash
  supabase secrets set GEMINI_API_KEY=AIzaSy...your-actual-gemini-key
  ```
- [ ] **Deploy Edge Function**: Deploy fungsi `/supabase/functions/poultry-ai` agar API key tetap aman di backend.
  ```bash
  supabase functions deploy poultry-ai
  ```

### D. Setup Bot Telegram Resmi (Otomatisasi Laporan)
- [ ] **Buat Bot via BotFather**: Buka Telegram, cari `@BotFather`, kirim perintah `/newbot`, lalu simpan **Telegram Bot Token** API.
- [ ] **Hubungkan Webhook Telegram**: Daftarkan URL Supabase Edge Function Anda sebagai webhook agar Telegram otomatis meneruskan pesan dari peternak ke asisten pintar:
  ```bash
  curl -F "url=https://<your-project-id>.supabase.co/functions/v1/poultry-ai" https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook
  ```

---

---

## 5. Integrasi AI Agent (Gemini & Supabase Edge Functions)

Untuk menjaga keamanan, **API Key Gemini TIDAK BOLEH diletakkan di frontend (Vite)**. Gunakan Supabase Edge Functions sebagai jembatan backend-first.

### A. Konfigurasi Edge Function (`/supabase/functions/poultry-ai/index.ts`)
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "npm:@google/genai"

const ai = new GoogleGenAI({ apiKey: Deno.env.get("GEMINI_API_KEY") })

serve(async (req) => {
  const { message, history } = await req.json()

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { 
          role: 'user', 
          parts: [{ text: "Anda adalah asisten ahli peternakan ayam petelur Indonesia bernama 'SmartPoultry AI'. Jawablah dengan ramah, santun, dan gunakan analogi yang mudah dipahami peternak lokal." }] 
        },
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ]
    })

    return new Response(
      JSON.stringify({ reply: response.text }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

---

## 6. Integrasi Telegram Bot (Otomatisasi Input Bahasa Alami)

Telegram bot berfungsi sebagai antarmuka pencatatan instan saat peternak berada di lapangan.

### A. Alur Parsing Laporan Peternak
1. **Laporan Peternak**: *"Pagi ini habis pakan 3 sak merek Malindo. Telur dapet 50 kg. Ada ayam mati 2 ekor karena lemas."*
2. **Parsing Gemini (Structured Output)**: Edge function memanggil Gemini dengan instruksi ekstraksi JSON:
   ```json
   {
     "feed_consumed_qty": 3,
     "feed_brand": "Malindo",
     "egg_yield_kg": 50.0,
     "mortality_count": 2,
     "health_notes": "Ayam lemas"
   }
   ```
3. **Database Insert**: Masukkan data ke dalam tabel `farm_logs` lewat API Supabase.
4. **Respon Telegram**: Bot membalas dengan konfirmasi terstruktur otomatis:
   > 📝 **Laporan Berhasil Dicatat!**
   > - 📦 Pakan: 3 Sak (Malindo)
   > - 🥚 Telur: 50 Kg
   > - 💀 Kematian: 2 Ekor (Lemas)
   > Data otomatis diperbarui di web dashboard Anda!

### B. Otomatisasi Alarm Dini (Early Warning System)
Gunakan Supabase Database Trigger atau Edge Function Cron untuk mengevaluasi data harian:
- **Formula**: `(Rata-rata Telur 3 Hari Terakhir - Produksi Hari Ini) / Rata-rata 3 Hari Terakhir`
- **Kondisi**: Jika penurunan produksi telur melebihi **5%**, backend akan otomatis mengirim pesan darurat melalui bot Telegram peternak yang bersangkutan:
  > ⚠️ **PERINGATAN KRITIS!**
  > Produksi telur kandang Anda turun **7.2%** dibanding rata-rata 3 hari terakhir. 
  > Silakan periksa pakan atau gunakan menu **Vet AI** di dashboard untuk mendiagnosis gejala flu burung/kolera sedini mungkin!

---

## 7. Aturan & Batasan Penulisan Kode (Coding Constraints)

1. **Bahasa Kode**: Seluruh kode, nama variabel, nama kolom database, komentar kode, dan dokumentasi teknis **WAJIB ditulis dalam bahasa Inggris**.
2. **Bahasa User-Facing**: Antarmuka dashboard, teks UI, banner AI, dan balasan chat AI peternak **WAJIB menggunakan Bahasa Indonesia** yang mudah dimengerti peternak lokal.
3. **Strict TypeScript**: Hindari penggunaan tipe `any`. Selalu definisikan tipe objek secara eksplisit (gunakan interface di `src/types/database.ts`).
4. **Native Mobile Camera Access**: Untuk halaman Vet AI, wajib memicu kamera HP secara native melalui tag:
   ```html
   <input type="file" accept="image/*" capture="environment" />
   ```
5. **Responsiveness**: Semua komponen dashboard harus dirancang secara mobile-first, mengingat sebagian besar peternak memantau kandang lewat perangkat handphone.
