import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Link2,
  Link2Off,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Clock,
  Activity,
  Zap,
  Bell,
  BellOff,
  MessageSquare,
  BarChart3,
  FileText,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Terminal,
  Shield,
  Send,
  Calendar,
  Hash,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────

interface TelegramLink {
  id: string;
  chat_id: number;
  username: string | null;
  first_name: string | null;
  linked_at: string;
  is_active: boolean;
  notify_daily: boolean;
  last_seen_at: string | null;
}

interface ActivityLog {
  id: string;
  command: string;
  response_type: string;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────

const BOT_USERNAME = '@SmartPoultry_Robot';
const INTEGRATION_TOKEN = 'SP-832F-EGG9-LAYR';

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
                   'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatTimeAgo(isoString: string): string {
  const d = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

function formatDateID(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()} — ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const RESPONSE_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  log_saved:  { label: 'Log Tersimpan', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  report:     { label: 'Laporan',       color: 'text-blue-600',    bg: 'bg-blue-50' },
  catatan:    { label: 'Catatan',       color: 'text-blue-600',    bg: 'bg-blue-50' },
  laporan:    { label: 'Laporan',       color: 'text-indigo-600',  bg: 'bg-indigo-50' },
  csv:        { label: 'CSV Export',    color: 'text-purple-600',  bg: 'bg-purple-50' },
  ai_chat:    { label: 'Chat AI',       color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
  status:     { label: 'Status Check',  color: 'text-amber-600',   bg: 'bg-amber-50' },
  start:      { label: 'Start Bot',     color: 'text-slate-600',   bg: 'bg-slate-100' },
  linked:     { label: 'Akun Terhubung',color: 'text-emerald-600', bg: 'bg-emerald-50' },
  help:       { label: 'Bantuan',       color: 'text-slate-600',   bg: 'bg-slate-100' },
  notif:      { label: 'Notifikasi',    color: 'text-amber-600',   bg: 'bg-amber-50' },
  error:      { label: 'Error',         color: 'text-red-600',     bg: 'bg-red-50' },
};

// ─── Feature Cards ────────────────────────────────────────────────────────

const FEATURE_CARDS = [
  {
    icon: Zap,
    title: 'Input Shortcut Cepat',
    desc: 'Kirim TL 5000; PK 480; AM 1; SH 30; FC normal — data langsung tersimpan ke dashboard.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    icon: BarChart3,
    title: 'Laporan & Analisis AI',
    desc: 'Ketik /laporan 7 atau /status untuk mendapatkan ringkasan data dan insight AI otomatis.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: FileText,
    title: 'Export CSV via Telegram',
    desc: 'Kirim /csv 30 dan bot akan langsung mengirimkan file .csv 30 hari terakhir ke chat Anda.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    icon: Bell,
    title: 'Laporan Pagi Otomatis',
    desc: 'Bot otomatis mengirim insight harian setiap pagi jam 07:00 WIB berdasarkan data kemarin.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    icon: MessageSquare,
    title: 'Chat AI Bebas',
    desc: 'Tanya apa saja soal kandang: "Kenapa FCR naik?", "Rekomen vitamin heat stress", dll.',
    color: 'text-fuchsia-600',
    bg: 'bg-fuchsia-50',
    border: 'border-fuchsia-100',
  },
  {
    icon: Shield,
    title: 'Terhubung Aman',
    desc: 'Data terenkripsi end-to-end via Supabase. Token unik memastikan hanya akun Anda yang bisa mengakses.',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
  },
];

// ─── Quick Commands ───────────────────────────────────────────────────────

const QUICK_COMMANDS = [
  { cmd: 'TL 5000; TB 300; PK 480; AM 1; SH 30; FC normal', desc: 'Log harian lengkap' },
  { cmd: '/status', desc: 'Kondisi kandang hari ini' },
  { cmd: '/catatan kemarin', desc: 'Detail log kemarin' },
  { cmd: '/laporan 7', desc: 'Ringkasan 7 hari terakhir' },
  { cmd: '/csv 30', desc: 'Export CSV 30 hari' },
  { cmd: '/bantuan', desc: 'Panduan lengkap bot' },
];

// ─── Main Component ───────────────────────────────────────────────────────

export default function TelegramPage() {
  const [telegramLink, setTelegramLink] = useState<TelegramLink | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [telegramToken, setTelegramToken] = useState('SP-832F-EGG9-LAYR');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedCmd, setIsCopiedCmd] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ── Fetch Data ────────────────────────────────────────────────────────
  const fetchData = useCallback(async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsDemoMode(true);
        setTelegramToken('SP-832F-EGG9-LAYR');
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const profileId = session.user.id;
      const isDemoEmail = session.user.email === 'demo@smartpoultry.ai';
      const isDemo = isDemoEmail || (localStorage.getItem('sp_demo_mode') === '1');
      setIsDemoMode(isDemo);

      if (isDemo) {
        setTelegramToken('SP-832F-EGG9-LAYR');
        setTelegramLink(null);
        setActivityLogs([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const [linkRes, activityRes, profileRes] = await Promise.all([
        supabase
          .from('telegram_links')
          .select('*')
          .eq('profile_id', profileId)
          .eq('is_active', true)
          .maybeSingle(),
        supabase
          .from('telegram_activity_logs')
          .select('id, command, response_type, created_at')
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('profiles')
          .select('telegram_token')
          .eq('id', profileId)
          .maybeSingle(),
      ]);

      setTelegramLink(linkRes.data as TelegramLink | null);
      setActivityLogs((activityRes.data as ActivityLog[]) || []);
      if (profileRes.data?.telegram_token) {
        setTelegramToken(profileRes.data.telegram_token);
      }
    } catch (err) {
      console.error('TelegramPage fetch error:', err);
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // ── Toggle Notif ──────────────────────────────────────────────────────
  const handleToggleNotif = async () => {
    if (!telegramLink) return;
    const newVal = !telegramLink.notify_daily;

    const { error } = await supabase
      .from('telegram_links')
      .update({ notify_daily: newVal })
      .eq('id', telegramLink.id);

    if (!error) {
      setTelegramLink(prev => prev ? { ...prev, notify_daily: newVal } : prev);
      showToast(newVal ? '✅ Laporan pagi harian diaktifkan!' : '🔕 Laporan pagi harian dinonaktifkan.');
    }
  };

  // ── Disconnect ────────────────────────────────────────────────────────
  const handleDisconnect = async () => {
    if (!telegramLink || !window.confirm('Putuskan koneksi Telegram dari akun ini?')) return;

    const { error } = await supabase
      .from('telegram_links')
      .update({ is_active: false })
      .eq('id', telegramLink.id);

    if (!error) {
      setTelegramLink(null);
      showToast('Koneksi Telegram berhasil diputus.');
    }
  };

  // ── Copy Helpers ──────────────────────────────────────────────────────
  const handleCopyToken = () => {
    navigator.clipboard.writeText(telegramToken);
    setIsCopied(true);
    showToast('Token integrasi disalin!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setIsCopiedCmd(cmd);
    showToast('Perintah disalin!');
    setTimeout(() => setIsCopiedCmd(null), 1500);
  };

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 md:p-6 lg:p-8">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-sm text-white shadow-2xl border border-white/10"
          >
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 p-6 md:p-8 shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute -left-8 -bottom-8 h-48 w-48 rounded-full bg-sky-200 blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white/90 uppercase tracking-wider backdrop-blur-sm">
              <Bot className="h-3.5 w-3.5" />
              AI Agent Bot Telegram
            </div>
            <h2 className="text-2xl font-extrabold text-white md:text-3xl">Integrasi Bot Telegram</h2>
            <p className="text-sm text-white/80 leading-relaxed max-w-lg">
              Catat laporan kandang, tanya AI, dan terima insight otomatis langsung dari Telegram — tanpa buka browser.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            {/* Connection Status Badge */}
            <div className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold ${
              isLoading ? 'bg-white/10 text-white/60' :
              telegramLink ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/30' :
              'bg-white/10 text-white/70'
            }`}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : telegramLink ? (
                <><div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /><span>Terhubung</span></>
              ) : (
                <><div className="h-2 w-2 rounded-full bg-white/40" /><span>Belum Terhubung</span></>
              )}
            </div>
            <button
              onClick={() => fetchData(false)}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh status"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Setup & Status */}
        <div className="lg:col-span-1 space-y-5">

          {/* ── Connection Card ── */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-warm-earth uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Link2 className="h-4 w-4 text-primary-gold" />
              Status Koneksi
            </h3>

            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-10 bg-slate-100 rounded-2xl" />
                <div className="h-16 bg-slate-100 rounded-2xl" />
              </div>
            ) : telegramLink ? (
              /* Connected State */
              <div className="space-y-3">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-700">Akun Terhubung</span>
                  </div>
                  <div className="space-y-1 text-xs text-emerald-800">
                    {telegramLink.first_name && (
                      <p>👤 <strong>{telegramLink.first_name}</strong>{telegramLink.username ? ` (@${telegramLink.username})` : ''}</p>
                    )}
                    <p>🆔 Chat ID: <code className="font-mono bg-emerald-100 px-1 rounded">{telegramLink.chat_id}</code></p>
                    <p>📅 Terhubung: {formatDateID(telegramLink.linked_at)}</p>
                    {telegramLink.last_seen_at && (
                      <p>🟢 Terakhir aktif: {formatTimeAgo(telegramLink.last_seen_at)}</p>
                    )}
                  </div>
                </div>

                {/* Notif Toggle */}
                <button
                  onClick={handleToggleNotif}
                  className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                    telegramLink.notify_daily
                      ? 'bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100'
                      : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {telegramLink.notify_daily ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    <span>Laporan Pagi Otomatis (07:00 WIB)</span>
                  </div>
                  <div className={`h-5 w-9 rounded-full transition-colors ${telegramLink.notify_daily ? 'bg-amber-400' : 'bg-slate-200'}`}>
                    <div className={`h-4 w-4 rounded-full bg-white shadow-sm mt-0.5 transition-transform ${telegramLink.notify_daily ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'}`} />
                  </div>
                </button>

                {/* Open Telegram */}
                <a
                  href={`https://t.me/${BOT_USERNAME.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-xs font-bold text-white hover:bg-sky-600 transition-colors shadow-md shadow-sky-500/20 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  Buka Telegram Bot
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                {/* Disconnect */}
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-100 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Link2Off className="h-4 w-4" />
                  Putuskan Koneksi
                </button>
              </div>
            ) : (
              /* Not Connected State */
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <p className="text-xs font-bold text-warm-earth">Cara Menghubungkan Bot:</p>
                  <ol className="space-y-2.5">
                    {[
                      { n: '1', text: 'Buka Telegram dan cari bot:', code: BOT_USERNAME },
                      { n: '2', text: 'Ketik dan kirim perintah:', code: '/start' },
                      { n: '3', text: 'Kirim perintah berikut dengan token Anda:' },
                    ].map((step, i) => (
                      <li key={i} className="flex gap-2.5 items-start text-xs text-slate-600">
                        <span className="h-4.5 w-4.5 rounded-full bg-primary-gold/15 text-primary-gold text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{step.n}</span>
                        <span>
                          {step.text}
                          {step.code && <code className="ml-1 font-mono font-bold text-primary-gold bg-primary-gold/10 px-1 py-0.5 rounded">{step.code}</code>}
                        </span>
                      </li>
                    ))}
                  </ol>

                  {/* Token Box */}
                  <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Token Integrasi Anda:</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="font-mono text-sm font-black text-primary-gold">{telegramToken}</code>
                      <button
                        onClick={handleCopyToken}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary-gold hover:bg-primary-gold/5 transition-all cursor-pointer"
                      >
                        {isCopied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">Kirim via bot: <code className="font-mono bg-slate-100 px-1 rounded text-rose-600">/link {telegramToken}</code></p>
                  </div>
                </div>

                <a
                  href={`https://t.me/${BOT_USERNAME.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-xs font-bold text-white hover:bg-sky-600 transition-colors shadow-md shadow-sky-500/20"
                >
                  <Bot className="h-4 w-4" />
                  Buka {BOT_USERNAME}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                {isDemoMode && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 text-[11px] text-amber-700">
                    <AlertCircle className="h-4 w-4 inline mr-1 shrink-0" />
                    Mode Demo aktif. Login untuk menggunakan integrasi Telegram.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Quick Commands ── */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-warm-earth uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Terminal className="h-4 w-4 text-primary-gold" />
              Perintah Cepat
            </h3>
            <div className="space-y-1.5">
              {QUICK_COMMANDS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleCopyCmd(item.cmd)}
                  className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-primary-gold/5 hover:border-primary-gold/20 p-2.5 text-left group transition-all cursor-pointer"
                >
                  <div className="min-w-0">
                    <code className="block text-[10px] font-mono text-rose-600 truncate group-hover:text-primary-gold transition-colors">
                      {item.cmd}
                    </code>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  <div className="shrink-0">
                    {isCopiedCmd === item.cmd
                      ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      : <Copy className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary-gold transition-colors" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Features & Activity */}
        <div className="lg:col-span-2 space-y-5">

          {/* ── Feature Grid ── */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-warm-earth uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="h-4 w-4 text-primary-gold" />
              Fitur Bot AI Agent
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURE_CARDS.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -2 }}
                    className={`rounded-2xl border ${card.border} ${card.bg} p-4 space-y-2`}
                  >
                    <div className={`h-8 w-8 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <h4 className="text-xs font-bold text-warm-earth">{card.title}</h4>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed">{card.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Activity Log ── */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-warm-earth uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary-gold" />
                Riwayat Aktivitas Bot
              </h3>
              <button
                onClick={() => fetchData(false)}
                disabled={isRefreshing}
                className="p-1.5 rounded-xl text-slate-400 hover:text-primary-gold hover:bg-primary-gold/5 transition-all cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 bg-slate-100 rounded-2xl" />
                ))}
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-300 space-y-3">
                <MessageSquare className="h-12 w-12" />
                <p className="text-xs font-semibold text-slate-400">
                  {telegramLink ? 'Belum ada aktivitas bot.' : 'Hubungkan Telegram untuk melihat aktivitas.'}
                </p>
                {!telegramLink && (
                  <p className="text-[11px] text-slate-400">Ikuti langkah di panel kiri untuk memulai.</p>
                )}
              </div>
            ) : (
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {activityLogs.map((log) => {
                  const typeConf = RESPONSE_TYPE_CONFIG[log.response_type] || { label: log.response_type, color: 'text-slate-500', bg: 'bg-slate-50' };
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 rounded-2xl border border-slate-50 bg-slate-50/40 p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${typeConf.bg}`}>
                        <Hash className={`h-3.5 w-3.5 ${typeConf.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-mono text-slate-700 font-medium truncate">{log.command}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${typeConf.bg} ${typeConf.color}`}>
                            {typeConf.label}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(log.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Setup Guide ── */}
          <div className="rounded-3xl border border-primary-gold/15 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-warm-earth uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary-gold" />
              Panduan Deploy & Aktivasi (Untuk Developer)
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  step: '1',
                  title: 'Buat Bot via @BotFather',
                  desc: 'Di Telegram, cari @BotFather → /newbot → ikuti instruksi → salin Bot Token.',
                  code: null,
                },
                {
                  step: '2',
                  title: 'Set Secret di Supabase',
                  desc: 'Supabase Dashboard → Settings → Edge Functions → Secrets.',
                  code: 'TELEGRAM_BOT_TOKEN = <token>',
                },
                {
                  step: '3',
                  title: 'Jalankan SQL Migration',
                  desc: 'Jalankan file migration_telegram_links.sql di Supabase SQL Editor.',
                  code: null,
                },
                {
                  step: '4',
                  title: 'Set Telegram Webhook',
                  desc: 'Daftarkan URL edge function sebagai webhook Telegram (satu kali):',
                  code: `curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" -d "url=https://<PROJECT>.supabase.co/functions/v1/telegram-bot"`,
                },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl bg-white border border-amber-100/60 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary-gold/15 text-primary-gold text-[10px] font-black flex items-center justify-center shrink-0">{s.step}</span>
                    <h4 className="text-xs font-bold text-warm-earth">{s.title}</h4>
                  </div>
                  <p className="text-[10.5px] text-slate-500">{s.desc}</p>
                  {s.code && (
                    <div className="relative">
                      <code className="block bg-slate-900 text-emerald-400 text-[9px] font-mono p-2.5 rounded-xl leading-relaxed whitespace-pre-wrap break-all">
                        {s.code}
                      </code>
                      <button
                        onClick={() => handleCopyCmd(s.code!)}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
