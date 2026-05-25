/**
 * SmartPoultry — Daily Report Telegram Cron Function
 * 
 * Fungsi ini dipanggil secara terjadwal (jam 07:00 WIB setiap pagi)
 * untuk mengirim laporan insight harian otomatis ke semua pengguna
 * yang mengaktifkan notifikasi Telegram.
 * 
 * Setup cron di Supabase Dashboard → Database → Cron Jobs:
 *   Schedule: 0 * * * *  (atau setiap jam 0)
 *   Command:  SELECT net.http_post(
 *               url := 'https://lzxpxynfskqerwtzmbcd.supabase.co/functions/v1/telegram-daily-report',
 *               headers := '{"Authorization": "Bearer <SUPABASE_SERVICE_ROLE_KEY>", "Content-Type": "application/json"}',
 *               body := '{}',
 *               timeout_milliseconds := 30000
 *             );
 *   PENTING: Tambahkan `timeout_milliseconds := 30000` karena fungsi ini memanggil LLM AI yang mungkin butuh waktu lebih dari 1 detik (default timeout).
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const TELEGRAM_TOKEN  = Deno.env.get('TELEGRAM_BOT_TOKEN') || ''
const SUPABASE_URL    = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const GROQ_API_KEY    = Deno.env.get('GROQ_API_KEY') || ''
const BLUESMINDS_KEY  = Deno.env.get('BLUESMINDS_API_KEY') || ''
const BLUESMINDS_URL  = Deno.env.get('BLUESMINDS_BASE_URL') || 'https://api.bluesminds.my.id/v1'

const TELEGRAM_API    = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function todayISO() {
  const now = new Date()
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  return wib.toISOString().split('T')[0]
}

function nDaysAgoISO(n: number) {
  const now = new Date()
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  wib.setDate(wib.getDate() - n)
  return wib.toISOString().split('T')[0]
}

function formatDateID(isoDate: string) {
  const d = new Date(isoDate + 'T00:00:00Z')
  return `${d.getUTCDate()} ${MONTHS_ID[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

// ─── Panggil AI untuk insight harian ─────────────────────────────────────

async function getAIInsight(farmData: unknown, farmName: string): Promise<string> {
  const systemPrompt =
    `Anda adalah SmartPoultry AI yang mengirimkan laporan pagi harian kepada peternak ayam petelur via Telegram.
Buat laporan singkat (maks 200 kata) mencakup:
1. Ringkasan kondisi kandang kemarin
2. 1-2 peringatan atau hal yang perlu diperhatikan hari ini
3. 1 rekomendasi tindakan konkret
Format: gunakan HTML Telegram (<b>bold</b>), JANGAN gunakan ** atau ##.
Gunakan data aktual yang diberikan. Bahasa Indonesia yang ramah dan profesional.`

  const userMsg = `Data kandang ${farmName}:\n${JSON.stringify(farmData, null, 2)}\n\nBuatkan laporan pagi untuk peternak ini.`

  // Coba GROQ
  if (GROQ_API_KEY) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMsg },
          ],
          max_tokens: 400,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        return data.choices?.[0]?.message?.content || ''
      }
    } catch { /* fallthrough */ }
  }

  // Coba Bluesminds
  if (BLUESMINDS_KEY) {
    try {
      const res = await fetch(`${BLUESMINDS_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${BLUESMINDS_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-3.1-flash-lite-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMsg },
          ],
        }),
      })
      if (res.ok) {
        const data = await res.json()
        return data.choices?.[0]?.message?.content || ''
      }
    } catch { /* fallthrough */ }
  }

  return ''
}

// ─── Buat pesan laporan pagi ──────────────────────────────────────────────

function buildMorningReport(
  farmName: string,
  yesterdayLog: Record<string, unknown> | null,
  last7Logs: Record<string, unknown>[],
  aiInsight: string
): string {
  const today = formatDateID(todayISO())

  let report = `🌅 <b>Laporan Pagi SmartPoultry AI</b>
📅 ${today} — Selamat Pagi!

━━━━━━━━━━━━━━━━━━━━━━
🏡 <b>${farmName}</b>
━━━━━━━━━━━━━━━━━━━━━━
`

  if (yesterdayLog) {
    const pakan = Number(yesterdayLog.feed_consumed_kg || 0)
    const telurKg = Number(yesterdayLog.eggs_weight_kg || 0)
    const fcr = telurKg ? (pakan / telurKg).toFixed(2) : '-'
    const mati = Number(yesterdayLog.mortality_count || 0)
    const suhu = Number(yesterdayLog.temp_afternoon_c || 0)
    const feces = String(yesterdayLog.feces_condition || 'Normal')

    const statusEmoji = mati > 3 || (suhu > 31 && feces === 'Basah') ? '🔴 KRITIS' :
                        mati > 1 || feces === 'Basah' ? '🟡 PERHATIAN' : '🟢 Normal'

    report += `📊 <b>Rekapitulasi Kemarin:</b>
🥚 Telur: <b>${Number(yesterdayLog.eggs_qty_pcs || 0).toLocaleString('id-ID')} butir</b> (${telurKg} kg)
🌾 Pakan: ${pakan} kg | FCR: <b>${fcr}</b>
💀 Mortalitas: ${mati} ekor
🌡️ Suhu Max: ${suhu}°C | Feces: ${feces}
Status: ${statusEmoji}

`
  } else {
    report += `📭 Belum ada log untuk kemarin.\nSegera catat hari ini via shortcut!\n\n`
  }

  // Tren 7 hari
  if (last7Logs.length >= 2) {
    const totalTelur = last7Logs.reduce((s, l) => s + Number(l.eggs_qty_pcs || 0), 0)
    const avgTelur = Math.round(totalTelur / last7Logs.length)
    const totalPakan = last7Logs.reduce((s, l) => s + Number(l.feed_consumed_kg || 0), 0)
    const totalTelurKg = last7Logs.reduce((s, l) => s + Number(l.eggs_weight_kg || 0), 0)
    const avgFCR = totalTelurKg ? (totalPakan / totalTelurKg).toFixed(2) : '-'

    report += `📈 <b>Tren 7 Hari:</b>
  • Rata-rata produksi: <b>${avgTelur.toLocaleString('id-ID')} butir/hari</b>
  • FCR Rerata: <b>${avgFCR}</b>

`
  }

  // Insight AI
  if (aiInsight) {
    report += `🤖 <b>Analisis &amp; Rekomendasi AI:</b>
${aiInsight}

`
  }

  report += `━━━━━━━━━━━━━━━━━━━━━━
💡 Ketik shortcut untuk catat hari ini:
<code>TL [n]; TB [n]; PK [n]; AM [n]; SH [n]; FC normal</code>

Ketik /bantuan untuk panduan lengkap. 🐔`

  return report
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  if (!TELEGRAM_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
    return new Response('Missing environment variables', { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  try {
    // Ambil jam saat ini di WIB (UTC+7)
    const now = new Date()
    const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000)
    const currentHourWIB = wib.getUTCHours()
    console.log(`Running daily report cron for hour ${currentHourWIB} WIB`)

    // Ambil semua pengguna yang aktif dan mengaktifkan notif pada jam ini
    const { data: links, error: linksError } = await supabase
      .from('telegram_links')
      .select('profile_id, chat_id, first_name')
      .eq('is_active', true)
      .eq('notify_daily', true)
      .eq('notify_hour', currentHourWIB)

    if (linksError) throw linksError
    if (!links?.length) {
      return new Response(JSON.stringify({ sent: 0, message: 'No active subscribers' }))
    }

    const yesterday = nDaysAgoISO(1)
    const sevenDaysAgo = nDaysAgoISO(6)

    let sentCount = 0
    const errors: string[] = []

    for (const link of links) {
      if (!link.profile_id || !link.chat_id) continue

      try {
        // Ambil data paralel
        const [profileRes, yesterdayRes, last7Res] = await Promise.all([
          supabase.from('profiles').select('farm_name, owner_name').eq('id', link.profile_id).maybeSingle(),
          supabase.from('daily_logs').select('*').eq('profile_id', link.profile_id).eq('log_date', yesterday).maybeSingle(),
          supabase.from('daily_logs').select('*').eq('profile_id', link.profile_id)
            .gte('log_date', sevenDaysAgo).order('log_date', { ascending: false }),
        ])

        const farmName = profileRes.data?.farm_name || `Farm ${link.first_name || ''}`
        const yesterdayLog = yesterdayRes.data
        const last7Logs = last7Res.data || []

        // Generate AI insight
        const farmContext = { profil: profileRes.data, logHarian: last7Logs.slice(0, 5) }
        const aiInsight = await getAIInsight(farmContext, farmName)

        // Bangun pesan
        const report = buildMorningReport(farmName, yesterdayLog, last7Logs, aiInsight)

        // Kirim ke Telegram
        await sendMessage(link.chat_id, report)
        sentCount++

        // Jeda kecil untuk menghindari rate limit Telegram
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (userErr) {
        errors.push(`chat_id ${link.chat_id}: ${String(userErr)}`)
        console.error(`Error sending to ${link.chat_id}:`, userErr)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        total: links.length,
        errors: errors.length ? errors : undefined,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Daily report error:', error)
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
