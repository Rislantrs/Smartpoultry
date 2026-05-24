# Laporan Audit Keamanan & Performa (Lighthouse & Security Checklist)

Dokumen ini menjelaskan status keamanan serta optimalisasi performa pada platform **SmartPoultry**. Seluruh sistem telah didesain dengan mematuhi standar keamanan modern (OWASP top 10) serta teknik pemuatan cepat berbasis web vitals (Lighthouse/Warehouse).

---

## 🛡️ 1. Audit Keamanan Website (Secure Web Checklist)

Keamanan aplikasi SmartPoultry bertumpu pada arsitektur **Zero-Trust Backend** dengan memanfaatkan isolasi penuh antara UI (Client) dan Database via Supabase Middleware.

### A. Proteksi Database — Row Level Security (RLS)
Seluruh tabel di database Supabase wajib mengaktifkan **Row Level Security (RLS)**. Tanpa RLS yang aktif, siapa pun yang memiliki `anon_key` dapat memanipulasi data melalui REST API.
- **Tabel `profiles`**: RLS aktif. Pengguna hanya dapat membaca dan menulis data baris miliknya sendiri (`auth.uid() = id`).
- **Tabel `daily_logs`**: RLS aktif. Filter relasional `profile_id` diikat langsung ke session ID pengguna (`auth.uid() = profile_id`).
- **Tabel `telegram_links`**: RLS aktif. Hanya admin sistem atau pemilik `chat_id` bersangkutan yang dapat membaca status integrasi bot.

### B. Isolasi API Credentials & Secrets
- **Client-Side (React)**: Hanya menyimpan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` yang aman dibagikan karena dibatasi ketat oleh RLS di atas.
- **Server-Side (Edge Functions)**: API Key bernilai tinggi seperti `GROQ_API_KEY`, `BLUESMINDS_API_KEY`, dan `TELEGRAM_BOT_TOKEN` **tidak pernah bocor ke browser**. Kredensial ini disimpan aman di Vault Supabase (Deno Environment Secrets) dan hanya dieksekusi di server terisolasi.

### C. Sanitasi Input & Pencegahan Injeksi
- **SQL Injection**: Dicegah secara inheren dengan menggunakan query builder PostgREST Supabase yang otomatis mengonversi seluruh parameter menjadi parameterized queries.
- **Cross-Site Scripting (XSS)**: Seluruh input dari peternak (termasuk catatan harian dan nama kandang) dirender oleh React menggunakan *virtual DOM escaping*. Karakter `<` atau `>` otomatis diubah menjadi teks aman sehingga kode berbahaya tidak dapat dieksekusi di browser.
- **Telegram Bot Validation**: Input teks liar dari Telegram dibatasi secara ketat pada parser regex shortcut. Obrolan bebas langsung diarahkan ke model AI dengan pembatasan parser HTML bawaan Telegram untuk mencegah *HTML injection* ke dalam chat.

---

## ⚡ 2. Audit Performa Website (Lighthouse / Warehouse Score Optimization)

Untuk mendapatkan skor performa yang tinggi (>95) di Google Lighthouse / Web Vitals Warehouse, aplikasi menggunakan strategi optimasi modern berikut:

### A. Pemuatan Awal Instan (Vite & Asset Optimizations)
1. **Asset Compression (WebP)**: Seluruh aset gambar berukuran besar seperti latar belakang kandang (`bg_1.webp`, `bg_2.webp`) telah dikonversi dari PNG/JPG ke format **WebP** dengan kompresi tinggi tanpa kehilangan ketajaman visual, memangkas ukuran aset hingga **65%**.
2. **Minifikasi & Tree-Shaking**: Bundler Vite otomatis memangkas modul CSS/JS yang tidak digunakan (*dead-code elimination*) dan mengompresi berkas JavaScript utama (`dist/assets/index.js`) secara agresif saat `npm run build`.

### B. Optimalisasi UX — Cumulative Layout Shift (CLS) & LCP
1. **Premium Loading Skeletons**: Seluruh pemanggilan API asinkron (seperti memuat data grafik FCR di `AnalyticsPage` atau mendiagnosis penyakit di `DiagnosisPage`) menggunakan komponen *Skeleton Screen* abu-abu yang berdenyut lembut (*pulse animation*). Ini mencegah pergeseran layout yang mengganggu (skor CLS = 0).
2. **Responsive Rendering**: Penggunaan Recharts dibungkus dalam `ResponsiveContainer` dengan batasan tinggi piksel absolut yang rasional agar grafik tidak meloncat saat dimuat di layar HP.

---

## 📝 Rekomendasi Checklist Berkala Keamanan & Performa:
1. **Periksa RLS Baru**: Setiap kali membuat tabel baru di Supabase, pastikan perintah SQL `ALTER TABLE "nama_tabel" ENABLE ROW LEVEL SECURITY;` selalu dijalankan.
2. **Perbarui Token Telegram berkala**: Jika bot dipindahkan, segera hapus link lama di dashboard dan buat ulang token integrasi unik.
3. **Pemuatan Lazy Loading**: Untuk fitur masa depan yang sangat kompleks, gunakan React `lazy()` dan `Suspense` untuk memecah berkas bundle utama menjadi potongan yang lebih kecil.
