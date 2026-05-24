import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  User,
  Layout,
  MessageSquare,
  Key,
  Copy,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Lock,
  PlusCircle,
  X,
  Sparkles,
  Bot,
  ExternalLink,
  Link2Off,
  Bell,
  BellOff,
  Send,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

// ─── Telegram Settings Sub-Component ─────────────────────────────────────

function TelegramSettingsPanel({ telegramToken }: { telegramToken: string }) {
  const [link, setLink] = useState<any | null>(null);
  const [loadingLink, setLoadingLink] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [toastLocal, setToastLocal] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastLocal(msg);
    setTimeout(() => setToastLocal(null), 3000);
  };

  const fetchLink = async () => {
    setLoadingLink(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoadingLink(false); return; }
    const { data } = await supabase
      .from('telegram_links')
      .select('*')
      .eq('profile_id', session.user.id)
      .eq('is_active', true)
      .maybeSingle();
    setLink(data);
    setLoadingLink(false);
  };

  useEffect(() => { fetchLink(); }, []);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(telegramToken || 'SP-832F-EGG9-LAYR');
    setIsCopied(true);
    showToast('Token disalin!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleNotif = async () => {
    if (!link) return;
    const newVal = !link.notify_daily;
    await supabase.from('telegram_links').update({ notify_daily: newVal }).eq('id', link.id);
    setLink((p: any) => ({ ...p, notify_daily: newVal }));
    showToast(newVal ? '✅ Laporan pagi diaktifkan' : '🔕 Laporan pagi dinonaktifkan');
  };

  const handleDisconnect = async () => {
    if (!link || !window.confirm('Putuskan koneksi Telegram?')) return;
    await supabase.from('telegram_links').update({ is_active: false }).eq('id', link.id);
    setLink(null);
    showToast('Koneksi Telegram diputus.');
  };

  return (
    <div className="space-y-5">
      {/* Toast lokal */}
      <AnimatePresence>
        {toastLocal && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-sm text-white shadow-2xl border border-white/10"
          >
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{toastLocal}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <h3 className="text-sm font-bold text-warm-earth uppercase tracking-wider flex items-center gap-2">
          <Bot className="h-4.5 w-4.5 text-primary-gold" />
          <span>Integrasi Bot Telegram AI Agent</span>
        </h3>
        <button onClick={fetchLink} className="p-1.5 rounded-xl text-slate-400 hover:text-primary-gold hover:bg-primary-gold/5 transition-all cursor-pointer">
          <RefreshCw className={`h-4 w-4 ${loadingLink ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loadingLink ? (
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-slate-100 rounded-2xl" />
          <div className="h-10 bg-slate-100 rounded-2xl" />
        </div>
      ) : link ? (
        /* Connected */
        <div className="space-y-4">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Telegram Terhubung
            </div>
            <div className="text-xs text-emerald-800 space-y-1">
              {link.first_name && <p>👤 <strong>{link.first_name}</strong>{link.username ? ` (@${link.username})` : ''}</p>}
              <p>🆔 Chat ID: <code className="font-mono bg-emerald-100 px-1 rounded">{link.chat_id}</code></p>
              <p>📅 Terhubung sejak: {new Date(link.linked_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <button
            onClick={handleToggleNotif}
            className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
              link.notify_daily
                ? 'bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100'
                : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {link.notify_daily ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              <span>Laporan Pagi Otomatis (07:00 WIB)</span>
            </div>
            <div className={`h-5 w-9 rounded-full transition-colors relative ${link.notify_daily ? 'bg-amber-400' : 'bg-slate-200'}`}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${link.notify_daily ? 'translate-x-4 left-0.5' : 'left-0.5'}`} />
            </div>
          </button>

          <div className="flex gap-2">
            <a
              href="https://t.me/SmartPoultry_Robot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-600 transition-colors shadow-md shadow-sky-500/20 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              Buka Bot Telegram
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1.5 rounded-2xl border border-red-100 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Link2Off className="h-4 w-4" />
              Putus
            </button>
          </div>
        </div>
      ) : (
        /* Not Connected */
        <div className="space-y-4 text-xs text-slate-600">
          <p className="leading-relaxed">
            Hubungkan Telegram untuk input laporan kandang dari lapangan, terima insight AI harian, dan ekspor data CSV langsung via chat bot.
          </p>

          {/* Token Box */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-warm-earth text-xs">Token Integrasi</h4>
                <p className="text-[10px] text-slate-400">Salin dan kirim to bot Telegram</p>
              </div>
              <div className="flex items-center gap-2 font-mono font-black text-primary-gold">
                <span>{telegramToken || 'SP-832F-EGG9-LAYR'}</span>
                <button onClick={handleCopyToken} className="p-1 rounded-lg text-slate-400 hover:text-primary-gold hover:bg-primary-gold/5 transition-all cursor-pointer">
                  {isCopied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <code className="block bg-slate-800 text-emerald-400 text-[10px] font-mono px-3 py-2 rounded-xl">
              /link {telegramToken || 'SP-832F-EGG9-LAYR'}
            </code>
          </div>

          {/* Steps */}
          <ol className="space-y-2">
            {[
              { n: '1', text: 'Cari bot di Telegram:', bold: '@SmartPoultry_Robot' },
              { n: '2', text: 'Ketik dan kirim:', bold: '/start' },
              { n: '3', text: 'Salin token di atas, kirim:', bold: `/link ${telegramToken || 'SP-832F-EGG9-LAYR'}` },
            ].map((s, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="h-4.5 w-4.5 rounded-full bg-primary-gold/15 text-primary-gold text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{s.n}</span>
                <p>{s.text} <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono font-bold text-primary-gold">{s.bold}</code></p>
              </li>
            ))}
          </ol>

          <a
            href="https://t.me/SmartPoultry_Robot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-xs font-bold text-white hover:bg-sky-600 transition-colors shadow-md shadow-sky-500/20 cursor-pointer"
          >
            <Bot className="h-4 w-4" />
            Buka @SmartPoultry_Robot di Telegram
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}


export default function SettingsPage() {
  const { profileData, cageData, isDemoMode, setProfileData, setCageData } = useOutletContext<{
    profileData: any;
    cageData: any;
    isDemoMode: boolean;
    setProfileData: (p: any) => void;
    setCageData: (c: any) => void;
  }>();

  const [activeTab, setActiveTab] = useState<'profile' | 'cage' | 'telegram'>('profile');
  const [loading, setLoading] = useState(true);

  // Input states
  const [profile, setProfile] = useState({
    farmName: '',
    owner: '',
    phone: '',
    location: '',
    telegramToken: '',
  });

  const [qLocation, setQLocation] = useState('Blitar, Jawa Timur');
  const [qFeedingFreq, setQFeedingFreq] = useState('2');
  const [qFeedingTimes, setQFeedingTimes] = useState('07:00 & 14:00');
  const [qEggCollectionTimes, setQEggCollectionTimes] = useState('10:00 & 15:00');

  const [cage, setCage] = useState({
    strain: 'Lohmann Brown',
    age: '24', // weeks
    capacity: '5000',
    targetFcr: '2.15',
  });

  const [isCopied, setIsCopied] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Fetch settings from Supabase
  useEffect(() => {
    if (isDemoMode) {
      if (profileData) {
        let parsedLocation = profileData.location || '';
        let locationStr = parsedLocation;
        let feedFreq = '2';
        let feedTimes = '07:00 & 14:00';
        let eggTimes = '10:00 & 15:00';

        try {
          if (parsedLocation.startsWith('{')) {
            const jsonObj = JSON.parse(parsedLocation);
            locationStr = jsonObj.alamat || '';
            feedFreq = (jsonObj.feedingFreq || '2').replace(/x sehari/g, '').trim();
            feedTimes = jsonObj.feedingTimes || '07:00 & 14:00';
            eggTimes = jsonObj.eggCollectionTimes || '10:00 & 15:00';
          }
        } catch (e) {
          console.error('Failed to parse location JSON:', e);
        }

        setProfile({
          farmName: profileData.farm_name || '',
          owner: profileData.owner_name || '',
          phone: profileData.phone_number || '',
          location: locationStr,
          telegramToken: 'SP-832F-EGG9-LAYR',
        });

        setQLocation(locationStr);
        setQFeedingFreq(feedFreq);
        setQFeedingTimes(feedTimes);
        setQEggCollectionTimes(eggTimes);
      }
      if (cageData) {
        setCage({
          strain: cageData.strain || 'Lohmann Brown',
          age: String(cageData.chicken_age_weeks || '24'),
          capacity: String(cageData.capacity || '5000'),
          targetFcr: String(cageData.target_fcr || '2.15'),
        });
      }
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch profile
        const { data: profileWithToken } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileWithToken) {
          let parsedLocation = profileWithToken.location || '';
          let locationStr = parsedLocation;
          let feedFreq = '2';
          let feedTimes = '07:00 & 14:00';
          let eggTimes = '10:00 & 15:00';

          try {
            if (parsedLocation.startsWith('{')) {
              const jsonObj = JSON.parse(parsedLocation);
              locationStr = jsonObj.alamat || '';
              feedFreq = (jsonObj.feedingFreq || '2').replace(/x sehari/g, '').trim();
              feedTimes = jsonObj.feedingTimes || '07:00 & 14:00';
              eggTimes = jsonObj.eggCollectionTimes || '10:00 & 15:00';
            }
          } catch (e) {
            console.error('Failed to parse location JSON:', e);
          }

          setProfile({
            farmName: profileWithToken.farm_name || '',
            owner: profileWithToken.owner_name || '',
            phone: profileWithToken.phone_number || '',
            location: locationStr,
            telegramToken: profileWithToken.telegram_token || '',
          });

          setQLocation(locationStr);
          setQFeedingFreq(feedFreq);
          setQFeedingTimes(feedTimes);
          setQEggCollectionTimes(eggTimes);
        }

        // Fetch cage spec
        const { data: cageWithData } = await supabase
          .from('cages')
          .select('*')
          .eq('profile_id', session.user.id)
          .maybeSingle();

        if (cageWithData) {
          setCage({
            strain: cageWithData.strain || 'Lohmann Brown',
            age: String(cageWithData.chicken_age_weeks || '24'),
            capacity: String(cageWithData.capacity || '5000'),
            targetFcr: String(cageWithData.target_fcr || '2.15'),
          });
        }
      } catch (err) {
        console.error('Gagal mengambil data pengaturan:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [profileData, cageData, isDemoMode]);

  // Copy token helper
  const handleCopyToken = () => {
    navigator.clipboard.writeText(profile.telegramToken || 'SP-832F-EGG9-LAYR');
    setIsCopied(true);
    setToastMsg('Token integrasi berhasil disalin ke clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Submit profile handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const locationData = JSON.stringify({
      alamat: profile.location,
      feedingFreq: `${qFeedingFreq}x sehari`,
      feedingTimes: qFeedingTimes,
      eggCollectionTimes: qEggCollectionTimes,
    });

    if (isDemoMode) {
      const updatedProfile = {
        id: 'demo-user',
        farm_name: profile.farmName,
        owner_name: profile.owner,
        phone_number: profile.phone,
        location: locationData,
      };
      setProfileData(updatedProfile);
      localStorage.setItem('sp_demo_profile_data', JSON.stringify(updatedProfile));
      setToastMsg('Profil peternakan demo berhasil diperbarui!');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          farm_name: profile.farmName,
          owner_name: profile.owner,
          phone_number: profile.phone,
          location: locationData,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setProfileData({
        id: session.user.id,
        farm_name: profile.farmName,
        owner_name: profile.owner,
        phone_number: profile.phone,
        location: locationData,
      });

      setToastMsg('Profil peternakan berhasil diperbarui!');
    } catch (err) {
      console.error('Gagal memperbarui profil:', err);
      setToastMsg('Gagal memperbarui profil peternakan.');
    } finally {
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  // Submit cage config handler
  const handleSaveCage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) {
      const updatedCage = {
        strain: cage.strain,
        chicken_age_weeks: parseInt(cage.age, 10) || 0,
        capacity: parseInt(cage.capacity, 10) || 0,
        target_fcr: parseFloat(cage.targetFcr) || 0,
      };
      setCageData(updatedCage);
      localStorage.setItem('sp_demo_cage_data', JSON.stringify(updatedCage));
      setToastMsg('Konfigurasi kandang demo berhasil diperbarui!');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('cages')
        .update({
          strain: cage.strain,
          chicken_age_weeks: parseInt(cage.age, 10) || 0,
          capacity: parseInt(cage.capacity, 10) || 0,
          target_fcr: parseFloat(cage.targetFcr) || 0,
        })
        .eq('profile_id', session.user.id);

      if (error) throw error;
      setToastMsg('Konfigurasi kandang berhasil diperbarui!');
    } catch (err) {
      console.error('Gagal memperbarui konfigurasi kandang:', err);
      setToastMsg('Gagal memperbarui konfigurasi kandang.');
    } finally {
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6 p-4 md:p-6 lg:p-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-sm text-white shadow-2xl border border-white/10"
          >
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-warm-earth md:text-2xl">Pengaturan Sistem</h2>
        <p className="text-sm text-slate-500">Sesuaikan profil peternakan, parameter kandang ayam, dan konfigurasi Telegram Bot.</p>
      </div>

      {/* Settings Container Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 items-start">
        {/* Left Nav Tabs */}
        <div className="rounded-3xl border border-slate-100 bg-white p-3.5 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-left transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-primary-gold/10 text-primary-gold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <User className="h-4.5 w-4.5 shrink-0" />
            <span>Profil Farm & Kontak</span>
          </button>

          <button
            onClick={() => setActiveTab('cage')}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-left transition-all cursor-pointer ${
              activeTab === 'cage'
                ? 'bg-primary-gold/10 text-primary-gold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Layout className="h-4.5 w-4.5 shrink-0" />
            <span>Spesifikasi Kandang</span>
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-left transition-all cursor-pointer ${
              activeTab === 'telegram'
                ? 'bg-primary-gold/10 text-primary-gold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="h-4.5 w-4.5 shrink-0" />
            <span>Integrasi Bot Telegram</span>
          </button>
        </div>

        {/* Right Active Form Panels */}
        <div className="md:col-span-3 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm min-h-[350px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400">
              <div className="w-10 h-10 border-4 border-primary-gold border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-bold text-xs">Memuat konfigurasi...</p>
            </div>
          ) : (
            <>
              {/* 1. Profile form */}
              {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <h3 className="text-sm font-bold text-warm-earth uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-primary-gold" />
                <span>Informasi Umum Peternakan</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Peternakan (Farm)</label>
                  <input
                    type="text"
                    required
                    value={profile.farmName}
                    onChange={(e) => setProfile({ ...profile, farmName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Pemilik / Pengelola</label>
                  <input
                    type="text"
                    required
                    value={profile.owner}
                    onChange={(e) => setProfile({ ...profile, owner: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nomor Telepon (WhatsApp)</label>
                  <input
                    type="text"
                    required
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lokasi Geografis</label>
                  <input
                    type="text"
                    required
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold"
                  />
                </div>
              </div>

              {/* Questionnaire / AI Personalization section */}
              <h3 className="text-sm font-bold text-warm-earth uppercase tracking-wider border-b border-slate-100 pb-2.5 pt-4 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary-gold" />
                <span>Workflow &amp; Personalisasi Asisten AI</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Frekuensi Pakan Harian</label>
                  <select
                    value={qFeedingFreq}
                    onChange={(e) => setQFeedingFreq(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold bg-white"
                  >
                    <option value="1">1x Sehari</option>
                    <option value="2">2x Sehari</option>
                    <option value="3">3x Sehari</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jadwal Jam Pemberian Pakan</label>
                  <input
                    type="text"
                    required
                    value={qFeedingTimes}
                    onChange={(e) => setQFeedingTimes(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jadwal Jam Ambil Telur</label>
                  <input
                    type="text"
                    required
                    value={qEggCollectionTimes}
                    onChange={(e) => setQEggCollectionTimes(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-primary-gold px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-gold/90 transition-colors shadow-md shadow-primary-gold/15 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}

          {/* 2. Cage Specs */}
          {activeTab === 'cage' && (
            <form onSubmit={handleSaveCage} className="space-y-4">
              <h3 className="text-sm font-bold text-warm-earth uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <Layout className="h-4.5 w-4.5 text-primary-gold" />
                <span>Parameter Klinis Kandang Laying</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Strain / Ras Ayam Petelur</label>
                  <select
                    value={cage.strain}
                    onChange={(e) => setCage({ ...cage, strain: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold bg-white"
                  >
                    <option value="Lohmann Brown">Lohmann Brown (Sangat Populer)</option>
                    <option value="Isa Brown">Isa Brown</option>
                    <option value="Hy-Line Brown">Hy-Line Brown</option>
                    <option value="Hisex Brown">Hisex Brown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Umur Kawanan Ayam (Minggu)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={cage.age}
                    onChange={(e) => setCage({ ...cage, age: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kapasitas Populasi Maksimal</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={cage.capacity}
                    onChange={(e) => setCage({ ...cage, capacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Standar Target FCR Ideal</label>
                  <input
                    type="text"
                    required
                    value={cage.targetFcr}
                    onChange={(e) => setCage({ ...cage, targetFcr: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-primary-gold px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-gold/90 transition-colors shadow-md shadow-primary-gold/15 cursor-pointer"
                >
                  Simpan Parameter
                </button>
              </div>
            </form>
          )}

          {/* 3. Telegram Integration */}
          {activeTab === 'telegram' && (
            <TelegramSettingsPanel telegramToken={profile.telegramToken} />
          )}
        </>
      )}
    </div>
      </div>
    </div>
  );
}
