/**
 * SmartPoultry AI — Telegram Bot Webhook Edge Function
 * 
 * Fitur AI Agent:
 * - /start        — Sambutan & panduan bot
 * - /link <token> — Hubungkan akun Telegram ke dashboard
 * - /status       — Ringkasan kondisi kandang hari ini
 * - /catatan [kemarin|N] — Laporan harian historis
 * - /laporan [7|30|bulan] — Ringkasan periode
 * - /csv [N]      — Export CSV N hari terakhir sebagai file
 * - /bantuan      — Daftar perintah & shortcut
 * - /notif [on|off] — Toggle laporan otomatis harian
 * - Shortcut log: TL 5000; TB 300; TR 4; PK 480; PS 12; AM 1; SH 30.2; FC normal; VT VitaStress; AB 09:00
 * - Chat bebas AI → forward ke poultry-ai untuk jawaban cerdas dengan konteks data kandang
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Environment Variables ────────────────────────────────────────────────
const TELEGRAM_TOKEN    = Deno.env.get('TELEGRAM_BOT_TOKEN') || ''
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const GROQ_API_KEY      = Deno.env.get('GROQ_API_KEY') || ''
const BLUESMINDS_KEY    = Deno.env.get('BLUESMINDS_API_KEY') || ''
const BLUESMINDS_URL    = Deno.env.get('BLUESMINDS_BASE_URL') || 'https://api.bluesminds.my.id/v1'

const TELEGRAM_API      = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`

// ─── Supabase Admin Client ────────────────────────────────────────────────
function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

// ─── Telegram API Helper ─────────────────────────────────────────────────

async function sendMessage(chatId: number, text: string, extra: Record<string, unknown> = {}) {
  const body = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...extra,
  }
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function sendDocument(chatId: number, filename: string, csvContent: string, caption: string) {
  const form = new FormData()
  form.append('chat_id', String(chatId))
  form.append('caption', caption)
  form.append('parse_mode', 'HTML')
  form.append('document', new Blob([csvContent], { type: 'text/csv' }), filename)
  await fetch(`${TELEGRAM_API}/sendDocument`, { method: 'POST', body: form })
}

// ─── Date Helpers ─────────────────────────────────────────────────────────

function todayISO(): string {
  const now = new Date()
  // WIB = UTC+7
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  return wib.toISOString().split('T')[0]
}

function nDaysAgoISO(n: number): string {
  const now = new Date()
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  wib.setDate(wib.getDate() - n)
  return wib.toISOString().split('T')[0]
}

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function formatDateID(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00Z')
  return `${d.getUTCDate()} ${MONTHS_ID[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

// ─── Shortcut Parser (Sama Persis dengan ShortcutsPage.tsx) ──────────────

function parseShortcuts(text: string): Record<string, unknown> | null {
  const lower = text.toLowerCase()

  // Harus mengandung setidaknya satu shortcut yang dikenali
  const hasShortcuts =
    /\btl\s*\d+/.test(lower) || /\btb\s*\d+/.test(lower) || /\btr\s*\d+/.test(lower) ||
    /\bpk\s*\d+/.test(lower) || /\bps\s*\d+/.test(lower) || /\bam\s*\d+/.test(lower) ||
    /\bsh\s*\d+/.test(lower) || /\bfc\s*(normal|basah)/.test(lower) ||
    /\bvt\s+\S/.test(lower) || /\bab\s+\S/.test(lower) ||
    // Natural language fallback
    /\btelur\s*\d+/.test(lower) || /\bpakan\s*\d+/.test(lower)

  if (!hasShortcuts) return null

  const result: Record<string, unknown> = {}

  // TL — Telur Butir
  const tlMatch = lower.match(/\btl\s*(\d+(?:\.\d+)?)/)
  if (tlMatch) result.telurButir = parseInt(tlMatch[1], 10)

  // TB — Berat Telur (kg)
  const tbMatch = lower.match(/\btb\s*(\d+(?:\.\d+)?)/)
  if (tbMatch) result.telurBeratKg = parseFloat(tbMatch[1])
  else if (result.telurButir) {
    // Auto-estimate: rata-rata 62g/butir
    result.telurBeratKg = Math.round((result.telurButir as number) * 0.062 * 10) / 10
  }

  // TR — Telur Rusak/BS
  const trMatch = lower.match(/\btr\s*(\d+(?:\.\d+)?)/)
  if (trMatch) result.telurBS = parseInt(trMatch[1], 10)
  else result.telurBS = 0

  // PK — Pakan Keluar (kg)
  const pkMatch = lower.match(/\bpk\s*(\d+(?:\.\d+)?)/)
  if (pkMatch) {
    result.pakanKeluarKg = parseFloat(pkMatch[1])
    result.pakanKeluarSak = Math.round((result.pakanKeluarKg as number) / 50 * 10) / 10
  }

  // PS — Pakan Sisa (kg)
  const psMatch = lower.match(/\bps\s*(\d+(?:\.\d+)?)/)
  if (psMatch) result.pakanSisaKg = parseFloat(psMatch[1])

  // AM — Ayam Mati
  const amMatch = lower.match(/\bam\s*(\d+(?:\.\d+)?)/)
  if (amMatch) result.ayamMati = parseInt(amMatch[1], 10)
  else result.ayamMati = 0

  // SH — Suhu Siang
  const shMatch = lower.match(/\bsh\s*(\d+(?:\.\d+)?)/)
  if (shMatch) result.suhuSiang = parseFloat(shMatch[1])
  else result.suhuSiang = 30.0

  // FC — Kondisi Feces
  const fcMatch = lower.match(/\bfc\s*(normal|basah)/)
  if (fcMatch) result.fecesKondisi = fcMatch[1] === 'basah' ? 'Basah' : 'Normal'
  else result.fecesKondisi = 'Normal'

  // VT — Vitamin / Vaksin
  const vtMatch = lower.match(/\bvt\s+([^;]+)/)
  if (vtMatch) result.vitaminDosisTime = vtMatch[1].trim()

  // AB — Jam Ambil Telur / Bersih Kandang
  const abMatch = lower.match(/\bab\s+([^;]+)/)
  if (abMatch) result.ambilTelurJam = abMatch[1].trim()

  // Auto suhu pagi (estimasi = suhu siang - 5)
  if (result.suhuSiang) result.suhuPagi = (result.suhuSiang as number) - 5

  return result
}

// ─── FCR Calculator ───────────────────────────────────────────────────────

function calcFCR(pakanKg: number, telurKg: number): string {
  if (!telurKg || telurKg === 0) return '-'
  return (pakanKg / telurKg).toFixed(2)
}

// ─── Format Log untuk Pesan Telegram ─────────────────────────────────────

function formatDailyLogMessage(log: Record<string, unknown>, profileName: string): string {
  const fcr = calcFCR(Number(log.feed_consumed_kg || 0), Number(log.eggs_weight_kg || 0))
  const status = (() => {
    const mati = Number(log.mortality_count || 0)
    const suhu = Number(log.temp_afternoon_c || 0)
    const feces = String(log.feces_condition || '')
    if (mati > 3 || (suhu > 31 && feces === 'Basah')) return '🔴 KRITIS'
    if (mati > 1 || feces === 'Basah' || Number(log.eggs_damaged_pcs || 0) > 4) return '🟡 PERHATIAN'
    return '🟢 Normal'
  })()

  return `📋 <b>Log Harian Kandang</b>
👤 ${profileName}
📅 ${formatDateID(String(log.log_date))}
━━━━━━━━━━━━━━━━━━━━━━

🥚 <b>Produksi Telur</b>
  • Utuh: <b>${Number(log.eggs_qty_pcs || 0).toLocaleString('id-ID')} butir</b>
  • Berat: ${log.eggs_weight_kg || '-'} kg
  • Rusak/BS: ${log.eggs_damaged_pcs || 0} butir

🌾 <b>Pakan &amp; Air</b>
  • Konsumsi: <b>${log.feed_consumed_kg || '-'} kg</b> (${log.feed_consumed_bags || '-'} sak)
  • Sisa gudang: ${log.feed_remaining_kg || '-'} kg
  • Air: ${log.water_status || 'Bersih'}

📊 <b>FCR Hari Ini</b>: <b>${fcr}</b>

🐔 <b>Kesehatan</b>
  • Mortalitas: ${log.mortality_count || 0} ekor
  • Suhu Siang: ${log.temp_afternoon_c || '-'}°C
  • Feces: ${log.feces_condition || 'Normal'}
  • Gejala: ${log.health_symptoms || 'Tidak ada'}

💊 Vitamin: ${log.vitamin_dose_time || '-'}
⏰ Ambil Telur: ${log.egg_collection_time || '-'}
🧹 Kebersihan: ${log.cleaning_schedule || '-'}

Status: ${status}
Sumber: ${log.input_source || 'Telegram'}`
}

// ─── Format Tabel Ringkasan N Hari ────────────────────────────────────────

function formatSummaryTable(logs: Record<string, unknown>[]): string {
  if (!logs.length) return 'Tidak ada data untuk periode ini.'

  let table = `📊 <b>Ringkasan ${logs.length} Hari Terakhir</b>\n`
  table += `━━━━━━━━━━━━━━━━━━━━━━\n`

  let totalTelur = 0, totalPakan = 0, totalMati = 0

  for (const log of logs) {
    const telur = Number(log.eggs_qty_pcs || 0)
    const pakan = Number(log.feed_consumed_kg || 0)
    const mati = Number(log.mortality_count || 0)
    const fcr = calcFCR(pakan, Number(log.eggs_weight_kg || 0))
    const tgl = formatDateID(String(log.log_date)).replace(/\d{4}$/, '').trim()

    table += `\n📅 <b>${tgl}</b>\n`
    table += `  🥚 ${telur.toLocaleString('id-ID')} butir | 🌾 ${pakan}kg | FCR: ${fcr} | 💀 ${mati}\n`

    totalTelur += telur
    totalPakan += pakan
    totalMati += mati
  }

  const avgFCR = calcFCR(totalPakan, logs.reduce((s, l) => s + Number(l.eggs_weight_kg || 0), 0))

  table += `\n━━━━━━━━━━━━━━━━━━━━━━\n`
  table += `📈 <b>Total ${logs.length} hari:</b>\n`
  table += `  🥚 ${totalTelur.toLocaleString('id-ID')} butir | 🌾 ${totalPakan.toLocaleString('id-ID')} kg\n`
  table += `  FCR Rerata: <b>${avgFCR}</b> | 💀 Total mati: ${totalMati} ekor`

  return table
}

// ─── Generate CSV Content ─────────────────────────────────────────────────

function generateCSV(logs: Record<string, unknown>[]): string {
  const header = [
    'Tanggal', 'Telur Butir', 'Berat Telur (kg)', 'Telur Rusak',
    'Pakan Kg', 'Pakan Sak', 'Pakan Sisa Kg', 'FCR',
    'Air', 'Vitamin/Dosis', 'Mortalitas', 'Gejala Penyakit',
    'Suhu Pagi', 'Suhu Siang', 'Kondisi Feces',
    'Jam Ambil Telur', 'Kebersihan', 'Sumber Input'
  ].join(',')

  const rows = logs.map(log => {
    const pakan = Number(log.feed_consumed_kg || 0)
    const telurKg = Number(log.eggs_weight_kg || 0)
    const fcr = telurKg ? (pakan / telurKg).toFixed(2) : ''

    return [
      log.log_date,
      log.eggs_qty_pcs,
      log.eggs_weight_kg,
      log.eggs_damaged_pcs,
      log.feed_consumed_kg,
      log.feed_consumed_bags,
      log.feed_remaining_kg || '',
      fcr,
      log.water_status,
      String(log.vitamin_dose_time || '').replace(/,/g, ';'),
      log.mortality_count,
      String(log.health_symptoms || '').replace(/,/g, ';'),
      log.temp_morning_c,
      log.temp_afternoon_c,
      log.feces_condition,
      String(log.egg_collection_time || '').replace(/,/g, ';'),
      String(log.cleaning_schedule || '').replace(/,/g, ';'),
      log.input_source,
    ].join(',')
  })

  return [header, ...rows].join('\n')
}

// ─── AI Chat (forward ke poultry-ai edge function) ────────────────────────

async function callPoultryAI(
  message: string,
  farmData: unknown,
  isInsights = false,
  image: string | null = null,
  isClinicalDiagnosis = false
): Promise<string> {
  try {
    // Panggil poultry-ai Edge Function internal
    const res = await fetch(`${SUPABASE_URL}/functions/v1/poultry-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      },
      body: JSON.stringify({
        message,
        farmData,
        isInsightsRequest: isInsights,
        isClinicalDiagnosis,
        image,
        history: [],
      }),
    })

    if (!res.ok) throw new Error('poultry-ai tidak merespons')

    const data = await res.json()
    let reply = data.reply || ''

    if (isClinicalDiagnosis) {
      try {
        const cleanText = reply.replace(/```json/g, "").replace(/```/g, "").trim()
        const parsed = JSON.parse(cleanText)
        
        const symptomsList = Array.isArray(parsed.gejala) 
          ? parsed.gejala.map((g: string) => `• ${g}`).join('\n') 
          : '• Tidak ada gejala terinci'
        
        const quarantineList = Array.isArray(parsed.karantina) 
          ? parsed.karantina.map((k: string, idx: number) => `${idx + 1}. ${k}`).join('\n') 
          : '• Tidak ada instruksi karantina'
          
        const medicineList = Array.isArray(parsed.obat) 
          ? parsed.obat.map((o: unknown) => {
              if (typeof o === 'string') return `• ${o}`
              if (o && typeof o === 'object') {
                const med = o as { nama?: string; fungsi?: string; dosis?: string }
                const parts = [
                  med.nama && `<b>${med.nama}</b>`,
                  med.fungsi && `Fungsi: ${med.fungsi}`,
                  med.dosis && `Dosis: ${med.dosis}`
                ].filter(Boolean)
                return `• ${parts.join(' - ')}`
              }
              return '• Rekomendasi obat tidak tersedia'
            }).join('\n')
          : '• Rekomendasi obat tidak tersedia'

        const dangerColor = parsed.tingkatBahaya === 'Tinggi' ? '🔴 Tinggi' : 
                            parsed.tingkatBahaya === 'Rendah' ? '🟢 Rendah' : '🟡 Sedang'

        return `🩺 <b>HASIL DIAGNOSA KLINIS VET AI</b>
━━━━━━━━━━━━━━━━━━━━━━
🦠 <b>Penyakit:</b> <b>${parsed.nama || 'Diagnosis AI'}</b>
📊 <b>Tingkat Keyakinan:</b> <b>${parsed.keyakinan || 85}%</b>
⚠️ <b>Tingkat Bahaya:</b> <b>${dangerColor}</b>

📝 <b>Deskripsi Klinis:</b>
${parsed.deskripsi || 'Tidak ada deskripsi rinci.'}

🔍 <b>Gejala Utama Terdeteksi:</b>
${symptomsList}

🚧 <b>Tindakan Karantina &amp; Pencegahan:</b>
${quarantineList}

💊 <b>Rekomendasi Terapi &amp; Obat:</b>
${medicineList}

━━━━━━━━━━━━━━━━━━━━━━
<i>Disclaimer: Analisis ini adalah asisten referensi awal berbasis AI, bukan pengganti diagnosis resmi dokter hewan atau mantri peternakan.</i>`
      } catch (jsonErr) {
        console.warn('Gagal mem-parse JSON hasil diagnosis di telegram-bot, gunakan raw text:', jsonErr)
      }
    }

    // Bersihkan markdown untuk Telegram (gunakan HTML parse_mode)
    reply = reply
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/#{1,6}\s+/g, '')
      .replace(/`(.*?)`/g, '<code>$1</code>')

    return reply || 'Maaf, AI tidak memberikan respons.'
  } catch (err) {
    console.error('callPoultryAI error:', err)
    return 'Maaf, AI Agent sedang tidak tersedia saat ini. Coba beberapa saat lagi.'
  }
}

// ─── GROQ Langsung untuk chat Telegram (lebih ringan) ────────────────────

async function callGroqDirect(message: string, systemPrompt: string): Promise<string> {
  if (!GROQ_API_KEY) return ''
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
      }),
    })
    if (!res.ok) throw new Error('Groq error')
    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
  } catch {
    return ''
  }
}

// ─── Pesan Sambutan /start ────────────────────────────────────────────────

function getStartMessage(firstName: string): string {
  return `🐔 <b>Selamat datang di SmartPoultry AI Bot!</b>

Halo, <b>${firstName}</b>! Saya adalah AI Agent khusus peternakan ayam petelur yang siap membantu Anda 24/7.

━━━━━━━━━━━━━━━━━━━━━━
📌 <b>LANGKAH PERTAMA — Hubungkan Akun:</b>

1. Buka <b>Dashboard Web SmartPoultry</b>
2. Pergi ke <b>Pengaturan → Integrasi Bot Telegram</b>
3. Salin token Anda, lalu kirim perintah:

<code>/link SP-832F-EGG9-LAYR</code>

━━━━━━━━━━━━━━━━━━━━━━
⚡ <b>SETELAH TERHUBUNG, ketik /bantuan untuk:</b>
• Input log harian dengan shortcut cepat
• Laporan & analisis AI otomatis
• Export data CSV
• Tanya apa saja soal kandang ayam Anda

Saya paham bahasa Indonesia sehari-hari! 🤖`
}

// ─── Pesan Bantuan /bantuan ───────────────────────────────────────────────

function getHelpMessage(): string {
  return `📖 <b>Panduan Lengkap SmartPoultry Bot</b>

━━━━━━━━━━━━━━━━━━━━━━
⚡ <b>SHORTCUT LOG HARIAN</b>
Ketik kode dipisah titik koma (;):

<code>TL 5000; TB 300; TR 4; PK 480; PS 12; AM 1; SH 30.2; FC normal; VT VitaStress; AB 09:00</code>

<b>Kamus Kode:</b>
• <code>TL [n]</code> — Telur Utuh (butir) ⚠️Wajib
• <code>TB [n]</code> — Berat Telur (kg) ⚠️Wajib
• <code>TR [n]</code> — Telur Rusak/BS (butir)
• <code>PK [n]</code> — Pakan Keluar (kg) ⚠️Wajib
• <code>PS [n]</code> — Pakan Sisa Gudang (kg)
• <code>AM [n]</code> — Ayam Mati (ekor) ⚠️Wajib
• <code>SH [n]</code> — Suhu Siang (°C) ⚠️Wajib
• <code>FC normal/basah</code> — Kondisi Feces ⚠️Wajib
• <code>VT [nama]</code> — Vitamin/Vaksin/Obat
• <code>AB [jam]</code> — Jam Ambil Telur/Bersih

━━━━━━━━━━━━━━━━━━━━━━
📊 <b>PERINTAH LAPORAN</b>
• <code>/status</code> — Kondisi hari ini
• <code>/catatan kemarin</code> — Log kemarin detail
• <code>/catatan 3</code> — Log 3 hari terakhir
• <code>/laporan 7</code> — Ringkasan 7 hari
• <code>/laporan 30</code> — Ringkasan 30 hari
• <code>/csv 30</code> — Unduh file CSV 30 hari

━━━━━━━━━━━━━━━━━━━━━━
🤖 <b>TANYA AI</b>
Ketik pertanyaan bebas, contoh:
• "Apa penyebab FCR tinggi kandangku?"
• "Rekomendasi vitamin untuk heat stress"
• "Analisa produksi minggu ini"

━━━━━━━━━━━━━━━━━━━━━━
⚙️ <b>PENGATURAN</b>
• <code>/notif on</code> — Aktifkan laporan harian otomatis
• <code>/notif off</code> — Matikan laporan otomatis
• <code>/bantuan</code> — Tampilkan panduan ini`
}

// ─── Simpan Log ke Supabase ───────────────────────────────────────────────

async function saveDailyLog(
  supabase: ReturnType<typeof getSupabase>,
  profileId: string,
  parsed: Record<string, unknown>
): Promise<{ success: boolean; id?: string; error?: string }> {
  const today = todayISO()

  const dbRow = {
    profile_id: profileId,
    log_date: today,
    eggs_qty_pcs: Number(parsed.telurButir || 0),
    eggs_weight_kg: Number(parsed.telurBeratKg || 0),
    eggs_damaged_pcs: Number(parsed.telurBS || 0),
    feed_consumed_kg: Number(parsed.pakanKeluarKg || 0),
    feed_consumed_bags: Number(parsed.pakanKeluarSak || 0),
    feed_remaining_kg: parsed.pakanSisaKg !== undefined ? Number(parsed.pakanSisaKg) : null,
    water_status: 'Bersih' as const,
    vitamin_dose_time: (parsed.vitaminDosisTime as string) || null,
    mortality_count: Number(parsed.ayamMati || 0),
    health_symptoms: (parsed.gejalaPenyakit as string) || null,
    temp_morning_c: Number(parsed.suhuPagi || (Number(parsed.suhuSiang || 30) - 5)),
    temp_afternoon_c: Number(parsed.suhuSiang || 30),
    feces_condition: (parsed.fecesKondisi as 'Normal' | 'Basah') || 'Normal',
    egg_collection_time: (parsed.ambilTelurJam as string) || null,
    cleaning_schedule: (parsed.pembersihanArea as string) || null,
    input_source: 'Telegram' as const,
  }

  // Cek apakah hari ini sudah ada log → update jika ada
  const { data: existing } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('profile_id', profileId)
    .eq('log_date', today)
    .maybeSingle()

  if (existing?.id) {
    // UPDATE log hari ini
    const { error } = await supabase
      .from('daily_logs')
      .update(dbRow)
      .eq('id', existing.id)

    if (error) return { success: false, error: error.message }
    return { success: true, id: existing.id }
  } else {
    // INSERT log baru
    const { data, error } = await supabase
      .from('daily_logs')
      .insert([dbRow])
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, id: data?.id }
  }
}

// ─── Log Aktivitas Telegram ───────────────────────────────────────────────

async function logActivity(
  supabase: ReturnType<typeof getSupabase>,
  profileId: string | null,
  chatId: number,
  command: string,
  responseType: string,
  messageId?: number
) {
  await supabase.from('telegram_activity_logs').insert([{
    profile_id: profileId,
    chat_id: chatId,
    command: command.substring(0, 500),
    response_type: responseType,
    message_id: messageId,
  }]).then(() => {})   // Jangan block eksekusi utama
}

// ─── Update last_seen_at ──────────────────────────────────────────────────

async function updateLastSeen(supabase: ReturnType<typeof getSupabase>, chatId: number) {
  await supabase
    .from('telegram_links')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('chat_id', chatId)
}

// ─── Fetch Farm Data untuk Konteks AI ─────────────────────────────────────

async function fetchFarmData(supabase: ReturnType<typeof getSupabase>, profileId: string) {
  const [profileRes, cageRes, logsRes, weeklyRes] = await Promise.all([
    supabase.from('profiles').select('farm_name, owner_name, location').eq('id', profileId).maybeSingle(),
    supabase.from('cages').select('*').eq('profile_id', profileId).maybeSingle(),
    supabase.from('daily_logs').select('*').eq('profile_id', profileId)
      .order('log_date', { ascending: false }).limit(10),
    supabase.from('weekly_recap_logs').select('*').eq('profile_id', profileId)
      .order('week_start_date', { ascending: false }).limit(4),
  ])

  return {
    profil: profileRes.data,
    kandang: cageRes.data,
    logHarian: logsRes.data || [],
    rekapMingguan: weeklyRes.data || [],
  }
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method === 'GET') {
    try {
      const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-bot`
      console.log(`Registering Telegram Webhook to: ${webhookUrl}`)
      const registerRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      })
      const registerData = await registerRes.json()
      
      const infoRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getWebhookInfo`)
      const infoData = await infoRes.json()

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Webhook registration processed', 
        registerResult: registerData,
        webhookInfo: infoData 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: String(err) }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }

  try {
    if (!TELEGRAM_TOKEN) {
      return new Response('TELEGRAM_BOT_TOKEN not set', { status: 500 })
    }

    const body = await req.json()
    const message = body?.message
    if (!message) {
      return new Response('ok', { status: 200 })
    }

    const chatId: number = message.chat?.id
    const messageId: number = message.message_id
    const firstName: string = message.from?.first_name || 'Peternak'
    const username: string = message.from?.username || ''

    // Ambil caption atau teks pesan
    let text: string = (message.text || message.caption || '').trim()

    // Ambil photo dari message
    let imageUrl: string | null = null
    const photo = message.photo
    if (photo && photo.length > 0) {
      try {
        // Ambil photo dengan ukuran terbesar (biasanya yang terakhir di array)
        const largestPhoto = photo[photo.length - 1]
        const fileId = largestPhoto.file_id

        // Dapatkan path file dari Telegram API getFile
        const fileRes = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`)
        if (fileRes.ok) {
          const fileData = await fileRes.json()
          if (fileData.ok && fileData.result?.file_path) {
            imageUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${fileData.result.file_path}`
          }
        }
      } catch (err) {
        console.error('Gagal mendapatkan file foto dari Telegram:', err)
      }
    }

    if (!chatId) {
      return new Response('ok', { status: 200 })
    }

    if (!text && !imageUrl) {
      return new Response('ok', { status: 200 })
    }

    // Set default prompt jika ada gambar tapi tidak ada teks penyerta
    if (imageUrl && !text) {
      text = 'Lakukan analisis klinis penyakit ayam berdasarkan foto kotoran (feces) atau kondisi fisik ayam ini. Berikan hasil diagnosis terstruktur.'
    }

    const supabase = getSupabase()
    const lowerText = text.toLowerCase()

    // ── Cek apakah user sudah terhubung ──────────────────────────────────
    const { data: linkData } = await supabase
      .from('telegram_links')
      .select('profile_id, is_active')
      .eq('chat_id', chatId)
      .maybeSingle()

    const profileId: string | null = linkData?.profile_id || null
    const isLinked = !!profileId && linkData?.is_active

    // Update last seen
    if (isLinked) updateLastSeen(supabase, chatId)

    // ─────────────────────────────────────────────────────────────────────
    // PERINTAH: /start
    // ─────────────────────────────────────────────────────────────────────
    if (text.startsWith('/start')) {
      await sendMessage(chatId, getStartMessage(firstName))
      await logActivity(supabase, profileId, chatId, text, 'start', messageId)
      return new Response('ok')
    }

    // ─────────────────────────────────────────────────────────────────────
    // PERINTAH: /link <token>
    // ─────────────────────────────────────────────────────────────────────
    if (text.startsWith('/link')) {
      const parts = text.split(/\s+/)
      const token = parts[1]?.toUpperCase()

      if (!token) {
        await sendMessage(chatId,
          '⚠️ Format salah.\nGunakan: <code>/link [TOKEN_ANDA]</code>\n\nToken ada di Dashboard → Pengaturan → Integrasi Bot Telegram.')
        return new Response('ok')
      }

      const { data: profileWithToken, error: profileError } = await supabase
        .from('profiles')
        .select('id, farm_name')
        .eq('telegram_token', token)
        .maybeSingle()

      if (profileError || !profileWithToken) {
        await sendMessage(chatId,
          '❌ Token tidak valid.\nPeriksa kembali token integrasi di Dashboard → Pengaturan → Integrasi Bot Telegram.\n\nPastikan Anda menyalin token yang benar.')
        return new Response('ok')
      }

      // Simpan link ke database
      const { error } = await supabase
        .from('telegram_links')
        .upsert([{
          profile_id: profileWithToken.id,
          chat_id: chatId,
          username,
          first_name: firstName,
          is_active: true,
        }], { onConflict: 'chat_id' })

      if (error) {
        await sendMessage(chatId, '❌ Gagal menghubungkan akun. Coba lagi beberapa saat.')
        return new Response('ok')
      }

      await sendMessage(chatId,
        `✅ <b>Akun Telegram berhasil terhubung!</b>

Selamat, <b>${firstName}</b>! Bot SmartPoultry AI kini terintegrasi dengan dashboard <b>${profileWithToken.farm_name || 'Anda'}</b>.

Mulai catat log harian dengan shortcut cepat:
<code>TL 5000; TB 300; PK 480; AM 1; SH 30; FC normal</code>

Ketik /bantuan untuk panduan lengkap. 🐔`)

      await logActivity(supabase, profileWithToken.id, chatId, text, 'linked', messageId)
      return new Response('ok')
    }

    // ─────────────────────────────────────────────────────────────────────
    // PERINTAH: /bantuan
    // ─────────────────────────────────────────────────────────────────────
    if (text.startsWith('/bantuan') || text.startsWith('/help') || text.startsWith('/panduan')) {
      await sendMessage(chatId, getHelpMessage())
      await logActivity(supabase, profileId, chatId, text, 'help', messageId)
      return new Response('ok')
    }

    // ─── Ab sini semua perintah butuh akun terhubung ─────────────────────
    if (!isLinked) {
      await sendMessage(chatId,
        `⚠️ Akun Anda belum terhubung ke dashboard SmartPoultry.

Langkah mudah:
1. Buka Dashboard Web → Pengaturan → Integrasi Bot Telegram
2. Salin token Anda
3. Kirim: <code>/link [TOKEN_ANDA]</code>

Ketik /start untuk panduan lengkap.`)
      return new Response('ok')
    }

    // Ambil data kandang untuk konteks AI
    const farmData = await fetchFarmData(supabase, profileId!)

    // ─────────────────────────────────────────────────────────────────────
    // PERINTAH: /notif on|off|hour
    // ─────────────────────────────────────────────────────────────────────
    if (text.startsWith('/notif')) {
      const parts = text.split(/\s+/)
      const flag = parts[1]?.toLowerCase()
      if (flag === 'on' || flag === 'off') {
        const notifyDaily = flag === 'on'
        await supabase
          .from('telegram_links')
          .update({ notify_daily: notifyDaily })
          .eq('chat_id', chatId)

        await sendMessage(chatId,
          notifyDaily
            ? '✅ Laporan harian otomatis <b>diaktifkan</b>.\nAnda akan menerima insight AI harian sesuai jam pengaturan Anda (default 07:00 WIB). 🌅'
            : '🔕 Laporan harian otomatis <b>dinonaktifkan</b>.\nKetik /notif on kapan saja untuk mengaktifkan kembali.')
      } else if (flag && /^\d+$/.test(flag)) {
        const hour = parseInt(flag, 10)
        if (hour >= 0 && hour <= 23) {
          await supabase
            .from('telegram_links')
            .update({ notify_hour: hour, notify_daily: true })
            .eq('chat_id', chatId)

          const padHour = String(hour).padStart(2, '0')
          await sendMessage(chatId,
            `✅ Jadwal laporan harian diatur ke jam <b>${padHour}:00 WIB</b>.\nNotifikasi harian Anda otomatis aktif untuk jam tersebut! 🔔\n\n<i>Catatan: Supabase Cron Job perlu berjalan setiap jam agar notifikasi di luar jam 07:00 WIB dapat terkirim tepat waktu.</i>`)
        } else {
          await sendMessage(chatId, '⚠️ Jam tidak valid. Gunakan format 0-23 (contoh: <code>/notif 14</code> untuk jam 14:00 WIB).')
        }
      } else {
        await sendMessage(chatId, 'Format:\n• <code>/notif on</code> (aktifkan)\n• <code>/notif off</code> (nonaktifkan)\n• <code>/notif [jam]</code> (contoh: <code>/notif 14</code> untuk jam 14:00 WIB)')
      }
      await logActivity(supabase, profileId, chatId, text, 'notif', messageId)
      return new Response('ok')
    }

    // ─────────────────────────────────────────────────────────────────────
    // PERINTAH: /status — Kondisi hari ini
    // ─────────────────────────────────────────────────────────────────────
    if (text.startsWith('/status')) {
      const today = todayISO()
      const { data: todayLog } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('profile_id', profileId!)
        .eq('log_date', today)
        .maybeSingle()

      if (!todayLog) {
        // Ambil log terakhir
        const { data: lastLog } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('profile_id', profileId!)
          .order('log_date', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!lastLog) {
          await sendMessage(chatId,
            '📭 Belum ada log yang tercatat hari ini.\n\nMulai catat dengan shortcut:\n<code>TL 5000; TB 300; PK 480; AM 1; SH 30; FC normal</code>')
        } else {
          await sendMessage(chatId,
            `⚠️ <b>Belum ada log hari ini.</b>\n\nLog terakhir: ${formatDateID(lastLog.log_date)}\n\n` +
            formatDailyLogMessage(lastLog, farmData.profil?.farm_name || 'Farm'))
        }
      } else {
        // Dapatkan insight AI untuk hari ini
        const insight = await callPoultryAI(
          'Berikan ringkasan singkat kondisi kandang hari ini dalam 2-3 kalimat berdasarkan data terlampir.',
          farmData,
          false
        )
        const logMsg = formatDailyLogMessage(todayLog, farmData.profil?.farm_name || 'Farm')
        await sendMessage(chatId, logMsg)
        if (insight) {
          await sendMessage(chatId, `🤖 <b>Analisis AI:</b>\n${insight}`)
        }
      }

      await logActivity(supabase, profileId, chatId, text, 'status', messageId)
      return new Response('ok')
    }

    // ─────────────────────────────────────────────────────────────────────
    // PERINTAH: /catatan [kemarin|N]
    // ─────────────────────────────────────────────────────────────────────
    if (text.startsWith('/catatan')) {
      const parts = text.split(/\s+/)
      let daysBack = 1

      if (parts[1] === 'kemarin') {
        daysBack = 1
      } else if (parts[1] && /^\d+$/.test(parts[1])) {
        daysBack = Math.min(parseInt(parts[1], 10), 30)
      }

      const startDate = nDaysAgoISO(daysBack)
      const endDate = nDaysAgoISO(0)

      const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('profile_id', profileId!)
        .gte('log_date', startDate)
        .lte('log_date', endDate)
        .order('log_date', { ascending: false })
        .limit(daysBack)

      if (!logs?.length) {
        await sendMessage(chatId, `📭 Tidak ada data log untuk ${daysBack} hari terakhir.\n\nMulai catat dengan shortcut: <code>TL 5000; PK 480; AM 1</code>`)
      } else if (daysBack === 1 && logs.length === 1) {
        await sendMessage(chatId, formatDailyLogMessage(logs[0], farmData.profil?.farm_name || 'Farm'))
      } else {
        await sendMessage(chatId, formatSummaryTable(logs))
      }

      await logActivity(supabase, profileId, chatId, text, 'catatan', messageId)
      return new Response('ok')
    }

    // ─────────────────────────────────────────────────────────────────────
    // PERINTAH: /laporan [N]
    // ─────────────────────────────────────────────────────────────────────
    if (text.startsWith('/laporan') || text.startsWith('/rekap')) {
      const parts = text.split(/\s+/)
      let days = 7

      if (parts[1] === 'minggu') days = 7
      else if (parts[1] === 'bulan') days = 30
      else if (parts[1] && /^\d+$/.test(parts[1])) {
        days = Math.min(parseInt(parts[1], 10), 90)
      }

      const startDate = nDaysAgoISO(days - 1)

      const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('profile_id', profileId!)
        .gte('log_date', startDate)
        .order('log_date', { ascending: false })

      const tableMsg = formatSummaryTable(logs || [])
      await sendMessage(chatId, tableMsg)

      // Tambahkan analisis AI
      if (logs && logs.length >= 3) {
        const insight = await callPoultryAI(
          `Berikan analisis dan rekomendasi untuk data ${days} hari terakhir ini. Fokus pada tren FCR, produksi, dan kesehatan.`,
          farmData
        )
        if (insight) {
          await sendMessage(chatId, `\n🤖 <b>Analisis AI (${days} hari):</b>\n\n${insight}`)
        }
      }

      await logActivity(supabase, profileId, chatId, text, 'laporan', messageId)
      return new Response('ok')
    }

    // ─────────────────────────────────────────────────────────────────────
    // PERINTAH: /csv [N]
    // ─────────────────────────────────────────────────────────────────────
    if (text.startsWith('/csv') || text.startsWith('/export')) {
      const parts = text.split(/\s+/)
      let days = 30
      if (parts[1] && /^\d+$/.test(parts[1])) {
        days = Math.min(parseInt(parts[1], 10), 365)
      }

      const startDate = nDaysAgoISO(days - 1)

      const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('profile_id', profileId!)
        .gte('log_date', startDate)
        .order('log_date', { ascending: true })

      if (!logs?.length) {
        await sendMessage(chatId, `📭 Tidak ada data untuk diekspor (${days} hari terakhir).`)
      } else {
        const csvContent = generateCSV(logs)
        const farmName = (farmData.profil?.farm_name || 'SmartPoultry').replace(/\s+/g, '_')
        const filename = `${farmName}_${days}hari_${todayISO()}.csv`
        const caption = `📊 <b>Ekspor Data ${farmName}</b>\n📅 ${days} hari terakhir (${logs.length} record)\n🗓️ Diunduh: ${formatDateID(todayISO())}`

        await sendDocument(chatId, filename, csvContent, caption)
      }

      await logActivity(supabase, profileId, chatId, text, 'csv', messageId)
      return new Response('ok')
    }

    // ─────────────────────────────────────────────────────────────────────
    // SHORTCUT LOG HARIAN (TL, PK, AM, dll)
    // ─────────────────────────────────────────────────────────────────────
    const parsed = parseShortcuts(text)
    if (parsed && Object.keys(parsed).length > 0) {
      // Validasi minimal ada TL atau PK
      if (!parsed.telurButir && !parsed.pakanKeluarKg) {
        await sendMessage(chatId,
          '⚠️ Data tidak lengkap. Minimal ketik <b>TL</b> (telur) atau <b>PK</b> (pakan).\n\nContoh:\n<code>TL 5000; TB 300; PK 480; AM 1; SH 30; FC normal</code>')
        return new Response('ok')
      }

      // Kirim pesan "sedang menyimpan..."
      await sendMessage(chatId, '⏳ Menyimpan data ke database...')

      // Simpan ke Supabase
      const saveResult = await saveDailyLog(supabase, profileId!, parsed)

      if (!saveResult.success) {
        await sendMessage(chatId,
          `❌ Gagal menyimpan data: ${saveResult.error}\n\nCoba lagi atau hubungi dukungan.`)
        await logActivity(supabase, profileId, chatId, text, 'error', messageId)
        return new Response('ok')
      }

      // Hitung FCR
      const fcr = parsed.telurBeratKg
        ? (Number(parsed.pakanKeluarKg || 0) / Number(parsed.telurBeratKg)).toFixed(2)
        : '-'

      // Evaluasi status kandang
      const mati = Number(parsed.ayamMati || 0)
      const suhu = Number(parsed.suhuSiang || 0)
      const feces = String(parsed.fecesKondisi || 'Normal')
      const statusEmoji = mati > 3 || (suhu > 31 && feces === 'Basah') ? '🔴' :
                          mati > 1 || feces === 'Basah' ? '🟡' : '🟢'

      const successMsg = `✅ <b>Log Harian Berhasil Disimpan!</b>
📅 ${formatDateID(todayISO())} — Sumber: Telegram

━━━━━━━━━━━━━━━━━━━━━━
🥚 Telur: <b>${Number(parsed.telurButir || 0).toLocaleString('id-ID')} butir</b>${parsed.telurBeratKg ? ` (${parsed.telurBeratKg} kg)` : ''}${parsed.telurBS ? ` | Rusak: ${parsed.telurBS}` : ''}
🌾 Pakan: <b>${parsed.pakanKeluarKg || '-'} kg</b>${parsed.pakanSisaKg !== undefined ? ` | Sisa: ${parsed.pakanSisaKg} kg` : ''}
📊 FCR Estimasi: <b>${fcr}</b>
💀 Mortalitas: ${parsed.ayamMati || 0} ekor
🌡️ Suhu Siang: ${parsed.suhuSiang || '-'}°C | Feces: ${parsed.fecesKondisi || 'Normal'}
${parsed.vitaminDosisTime ? `💊 Vitamin: ${parsed.vitaminDosisTime}\n` : ''}${parsed.ambilTelurJam ? `⏰ Ambil Telur: ${parsed.ambilTelurJam}\n` : ''}
Status Kandang: ${statusEmoji}

✨ Data sudah terupdate di dashboard web Anda!`

      await sendMessage(chatId, successMsg)

      // Analisis otomatis jika ada kondisi waspada
      if (mati > 1 || suhu > 31 || feces === 'Basah') {
        const warningInsight = await callPoultryAI(
          'Berikan rekomendasi singkat dan konkret berdasarkan kondisi kandang yang sedikit mengkhawatirkan ini. Jawab dalam 3-4 poin tindakan.',
          farmData
        )
        if (warningInsight) {
          await sendMessage(chatId, `⚠️ <b>Peringatan AI:</b>\n\n${warningInsight}`)
        }
      }

      await logActivity(supabase, profileId, chatId, text, 'log_saved', messageId)
      return new Response('ok')
    }

    // ─────────────────────────────────────────────────────────────────────
    // CHAT BEBAS AI — Forward ke poultry-ai dengan konteks farm data
    // ─────────────────────────────────────────────────────────────────────
    let aiReply = ''

    if (imageUrl) {
      // Kirim status foto diterima
      await sendMessage(chatId, '📸 <b>Foto diterima!</b> Sedang memproses analisis visual feces/telur oleh Vet AI...')
      
      // Panggil asisten poultry-ai vision untuk diagnosa klinis
      aiReply = await callPoultryAI(text, farmData, false, imageUrl, true)
    } else {
      await sendMessage(chatId, '🤖 Sedang diproses oleh AI...')

      const systemPromptTelegram =
        `Anda adalah SmartPoultry AI Agent — asisten peternakan ayam petelur via Telegram.
Jawab dalam Bahasa Indonesia yang ramah, padat, dan mudah dipahami peternak di lapangan.
JANGAN gunakan markdown ** atau ## — gunakan format HTML: <b>bold</b>, <i>italic</i>.
Maksimal 300 kata per jawaban. Fokus pada informasi praktis dan actionable.
Data kandang pengguna sudah disertakan sebagai konteks. Gunakan data aktual tersebut!`

      const farmContext = `[DATA KANDANG AKTUAL]
Farm: ${farmData.profil?.farm_name || 'N/A'}
Strain: ${farmData.kandang?.strain || 'N/A'} | Umur: ${farmData.kandang?.chicken_age_weeks || '-'} minggu | Kapasitas: ${farmData.kandang?.capacity || '-'} ekor
Log terakhir: ${farmData.logHarian[0] ? JSON.stringify(farmData.logHarian.slice(0, 3)) : 'Belum ada'}

Pertanyaan pengguna: ${text}`

      // Coba GROQ dulu (lebih cepat & gratis)
      if (GROQ_API_KEY) {
        aiReply = await callGroqDirect(farmContext, systemPromptTelegram)
      }

      // Fallback ke poultry-ai Edge Function
      if (!aiReply) {
        aiReply = await callPoultryAI(text, farmData)
      }
    }

    if (aiReply) {
      await sendMessage(chatId, aiReply)
    } else {
      await sendMessage(chatId,
        'Maaf, AI Agent sedang offline. Coba beberapa menit lagi, atau ketik /bantuan untuk melihat perintah yang tersedia.')
    }

    await logActivity(supabase, profileId, chatId, text, 'ai_chat', messageId)
    return new Response('ok')

  } catch (error) {
    console.error('Telegram webhook error:', error)
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 200,   // Selalu 200 agar Telegram tidak retry terus
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
