import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Egg, ArrowRight, CheckCircle2, ShieldAlert, Play, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [authStep, setAuthStep] = useState<string>(''); // 'connecting' | 'seeding' | 'done' | ''
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const DEMO_MODE_KEY = 'sp_demo_mode';
  const DEMO_PROFILE_ID_KEY = 'sp_demo_profile_id';

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if session is already active. If yes, redirect to dashboard.
  useEffect(() => {
    let active = true;

    const demoModeEnabled = localStorage.getItem(DEMO_MODE_KEY) === '1';
    if (demoModeEnabled) {
      setIsCheckingAuth(false);
      navigate('/dashboard', { replace: true });
      return;
    }

    const checkHasSupabaseToken = () => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('auth-token') || key.startsWith('sb-'))) {
          return true;
        }
      }
      return false;
    };

    const checkSession = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const { data: { session: initialSession } } = await Promise.race([
          sessionPromise,
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout saat mengambil sesi')), 4000))
        ]);
        
        let session = initialSession;
        
        const hasToken = checkHasSupabaseToken();
        const hasOAuthCallback =
          window.location.hash.includes('access_token=') ||
          new URLSearchParams(window.location.search).has('code');

        // Polling toleransi asinkron jika terdapat OAuth callback atau token di local storage
        if (!session && (hasOAuthCallback || hasToken)) {
          const maxAttempts = hasOAuthCallback ? 15 : 3;
          console.log(`[Login Auth] Sesi awal kosong. Menjalankan auto-restore polling (max ${maxAttempts}x)...`);
          for (let i = 0; i < maxAttempts; i++) {
            await new Promise(r => setTimeout(r, 300));
            if (!active) return;
            const res = await supabase.auth.getSession();
            if (res.data.session) {
              session = res.data.session;
              break;
            }
          }
        }

        if (!active) return;

        if (session) {
          console.log('[Login Auth] Sesi aktif ditemukan. Mengalihkan ke dashboard...');
          navigate('/dashboard', { replace: true });
        } else {
          // Clean all local storage tokens when session is fully invalid
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
              key.includes('auth-token') ||
              key.includes('supabase') ||
              key.startsWith('sb-')
            ) && key !== DEMO_MODE_KEY) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));

          setIsCheckingAuth(false);
        }
      } catch (err) {
        console.error('[Login Auth] Gagal mengecek sesi:', err);
        setIsCheckingAuth(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      const isDemo = localStorage.getItem(DEMO_MODE_KEY) === '1' || session?.user?.email === 'demo@smartpoultry.ai';

      if (session && !isDemo) {
        navigate('/dashboard', { replace: true });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Gagal terhubung dengan layanan Google Auth.');
    }
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setAuthStep('connecting');

    try {
      if (isRegisterMode) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        setAuthStep('done');
        setErrorMsg('Registrasi berhasil! Silakan cek inbox/spam email Anda untuk verifikasi konfirmasi sebelum masuk, atau coba langsung masuk jika konfirmasi dinonaktifkan.');
        setIsLoading(false);
        setAuthStep('');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        setAuthStep('done');
        setTimeout(() => {
          setIsLoading(false);
          setAuthStep('');
          navigate('/dashboard');
        }, 700);
      }
    } catch (err: any) {
      setIsLoading(false);
      setAuthStep('');
      setErrorMsg(err.message || 'Gagal melakukan autentikasi.');
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setAuthStep('connecting');

    try {
      // Clear any existing Supabase session to avoid conflicts
      await supabase.auth.signOut().catch(() => {});
      
      localStorage.setItem(DEMO_MODE_KEY, '1');
      setAuthStep('done');
      
      setTimeout(() => {
        setIsLoading(false);
        setAuthStep('');
        navigate('/dashboard');
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      setAuthStep('');
      setErrorMsg(err.message || 'Gagal masuk ke Mode Demo. Silakan periksa pengaturan browser Anda.');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8f4]">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-primary-gold/10" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary-gold border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <Egg className="h-8 w-8 text-primary-gold/60 animate-pulse" />
        </div>
        <h3 className="text-sm font-bold text-warm-earth tracking-wider uppercase font-sans">
          Memverifikasi Sesi...
        </h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-soft-beige select-none">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 15% 20%, rgba(255, 159, 28, 0.10), transparent 28%),
            radial-gradient(circle at 82% 18%, rgba(255, 193, 7, 0.08), transparent 24%),
            radial-gradient(circle at 85% 85%, rgba(28, 19, 12, 0.04), transparent 30%),
            linear-gradient(180deg, #fdfbf7 0%, #faf6f0 100%)
          `,
        }}
      />

      <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-primary-gold/8 to-transparent" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10 sm:px-6">
        <motion.div
          initial={{ y: 28, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.8, bounce: 0.12 }}
          className="w-full max-w-105 overflow-hidden rounded-[28px] border border-warm-earth/10 bg-white/92 shadow-[0_20px_60px_rgba(28,19,12,0.10)] backdrop-blur-sm"
        >
          <div className="h-1.5 bg-linear-to-r from-primary-gold via-yolk-accent to-primary-gold" />

          <div className="px-6 pt-8 pb-7 sm:px-8 sm:pt-10 sm:pb-8">
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1c130c] text-white shadow-lg shadow-[#1c130c]/10">
                <Egg className="h-7 w-7 fill-white/10" />
              </div>
              <div className="inline-flex items-center rounded-full border border-primary-gold/15 bg-primary-gold/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-primary-gold">
                SmartPoultry AI SSO
              </div>

              <h1 className="mt-4 text-[32px] font-black leading-none tracking-tight text-warm-earth sm:text-[36px]">
                Precision Analytics
              </h1>
              <p className="mt-3 max-w-70 text-sm font-medium leading-relaxed text-earth-light/70">
                Masuk cepat ke dashboard kandang, analitik produksi, dan AI peternakan dalam satu ekosistem.
              </p>
            </div>

            {/* Loading Overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 p-6 text-center select-none"
                >
                  {authStep === 'done' ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 100 }}
                      className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-gold/15 text-primary-gold"
                    >
                      <CheckCircle2 className="h-12 w-12 stroke-[2.5px]" />
                    </motion.div>
                  ) : (
                    <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-primary-gold/10" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-primary-gold border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                      <Egg className="h-8 w-8 text-primary-gold/60" />
                    </div>
                  )}

                  <h3 className="mb-3 text-2xl font-black tracking-tight text-warm-earth font-sans">
                    {authStep === 'connecting' && 'Menghubungkan Sesi...'}
                    {authStep === 'registering' && 'Membuat Profil Demo...'}
                    {authStep === 'seeding' && 'Mempersiapkan Data Supabase...'}
                    {authStep === 'done' && 'Autentikasi Berhasil!'}
                  </h3>

                  <p className="max-w-xs text-sm font-semibold leading-relaxed text-earth-light/60">
                    {authStep === 'connecting' && 'Mengontak server Supabase Auth untuk mencocokkan kredensial.'}
                    {authStep === 'registering' && 'Inisialisasi akun demo baru pada instansi database.'}
                    {authStep === 'seeding' && 'Memasukkan data dummy harian, kesehatan, dan keuangan juri secara persisten.'}
                    {authStep === 'done' && 'Selamat datang! Mengalihkan Anda langsung ke Smart Dashboard...'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mb-6 flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-left">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <h4 className="text-xs font-bold text-red-700">Terjadi Kesalahan</h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-red-600/90">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Email and Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4 mb-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-warm-earth/65">
                  Email Peternak
                </label>
                <input 
                  type="email" 
                  placeholder="nama@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-warm-earth/10 focus:border-primary-gold focus:ring-2 focus:ring-primary-gold/15 rounded-xl px-4 py-3 text-sm font-semibold transition-all focus:outline-none placeholder:text-warm-earth/30"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-warm-earth/65">
                  Kata Sandi
                </label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-warm-earth/10 focus:border-primary-gold focus:ring-2 focus:ring-primary-gold/15 rounded-xl px-4 py-3 text-sm font-semibold transition-all focus:outline-none placeholder:text-warm-earth/30"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary-gold text-warm-earth font-extrabold py-3 rounded-xl hover:bg-yolk-accent transition-all text-xs cursor-pointer shadow-sm"
              >
                <span>{isRegisterMode ? 'Daftar Akun Baru' : 'Masuk dengan Email'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-xs font-extrabold text-primary-gold hover:underline cursor-pointer"
                >
                  {isRegisterMode ? 'Sudah punya akun? Masuk disini' : 'Belum punya akun? Daftar gratis'}
                </button>
              </div>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-extrabold tracking-wider">ATAU OPSI LAIN</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Option Grid */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-all duration-200 hover:border-primary-gold/35 hover:bg-white active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-xs">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.68 14.93 1 12 1 7.37 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.58 8.91 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.45c-.28 1.48-1.12 2.74-2.38 3.59l3.7 2.87c2.16-2 3.72-4.94 3.72-8.57z" />
                      <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3c0-.81.14-1.58.38-2.3L1.5 6.9C.54 8.82 0 10.97 0 13.2c0 2.23.54 4.38 1.5 6.3l3.86-3z" />
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.11.75-2.52 1.19-4.26 1.19-3.09 0-5.73-2.54-6.64-5.46L1.5 15.95C3.4 19.8 7.37 23 12 23z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-warm-earth">Continue with Google</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary-gold" />
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full group flex items-center justify-between rounded-xl border border-primary-gold/15 bg-[#eaf2ff] px-4 py-3 text-left transition-all duration-200 hover:border-primary-gold/35 hover:bg-[#e3eeff] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#132238] text-white shadow-xs">
                    <Play className="h-3 w-3 fill-white" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-warm-earth">Try Product Demo</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary-gold" />
              </button>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 text-[10px] font-bold text-slate-400">
              <button
                onClick={() => navigate('/')}
                className="text-primary-gold transition-colors hover:text-yolk-accent"
              >
                ← Kembali ke Beranda
              </button>
              <span>SmartPoultry AI v1.2.0 • 2026</span>
            </div>
          </div>
        </motion.div>
    </div>
    </div>
  );
}
