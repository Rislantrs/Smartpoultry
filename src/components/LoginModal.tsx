import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Eye, EyeOff, Smartphone, Building2, Egg, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = 'login' | 'register' | 'forgot';

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [phone, setPhone] = useState('');
  const [flockSize, setFlockSize] = useState('1000-5000');
  const [rememberMe, setRememberMe] = useState(false);

  // Reset tab when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Small timeout to avoid flicker during closing animation
      const timer = setTimeout(() => {
        setActiveTab('login');
        setShowPassword(false);
        setIsLoading(false);
        setIsSuccess(false);
        setEmail('');
        setPassword('');
        setFarmName('');
        setPhone('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate server request
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      if (activeTab === 'login') {
        setSuccessMessage('Selamat datang kembali, Peternak Cerdas! Mengalihkan ke Dashboard...');
        setTimeout(() => {
          onClose();
        }, 2200);
      } else if (activeTab === 'register') {
        setSuccessMessage('Akun peternakan berhasil dibuat! Menghubungkan ke chatbot...');
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        setSuccessMessage('Link reset kata sandi telah dikirim ke email Anda. Silakan periksa inbox!');
        setTimeout(() => {
          setActiveTab('login');
          setIsSuccess(false);
        }, 3000);
      }
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center px-4 sm:px-6">
        
        {/* Backdrop glass blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#1c130c]/75 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-[32px] bg-[#fdfbf7] border border-warm-earth/5 shadow-2xl p-6 sm:p-8 text-warm-earth select-none"
        >
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute right-5 top-5 p-2 rounded-full bg-warm-earth/5 hover:bg-warm-earth/10 text-warm-earth/60 hover:text-warm-earth transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Overlay state */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#fdfbf7] z-20 flex flex-col items-center justify-center p-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.1, stiffness: 100 }}
                  className="w-20 h-20 rounded-full bg-primary-gold/15 flex items-center justify-center text-primary-gold mb-6"
                >
                  <CheckCircle2 className="w-12 h-12 stroke-[2.5px]" />
                </motion.div>
                
                <h3 className="text-2xl font-black text-warm-earth mb-3 font-sans leading-tight">
                  {activeTab === 'forgot' ? 'Tautan Dikirim!' : 'Berhasil Masuk!'}
                </h3>
                
                <p className="text-sm font-semibold text-earth-light/80 max-w-xs leading-relaxed mb-8">
                  {successMessage}
                </p>

                {/* Simulated progress bar */}
                {(activeTab === 'login' || activeTab === 'register') && (
                  <div className="w-48 h-1.5 bg-warm-earth/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2 }}
                      className="h-full bg-primary-gold rounded-full"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header Title */}
          <div className="text-left mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-6 w-6 rounded-full bg-primary-gold flex items-center justify-center text-warm-earth">
                <Egg className="w-3.5 h-3.5 fill-warm-earth/10" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-gold font-sans">
                SmartPoultry AI
              </span>
            </div>
            
            <h2 className="text-3xl font-black text-warm-earth tracking-tight font-sans leading-none">
              {activeTab === 'login' && 'Selamat Datang'}
              {activeTab === 'register' && 'Buat Akun Baru'}
              {activeTab === 'forgot' && 'Reset Sandi'}
            </h2>
            <p className="text-xs font-semibold text-earth-light/60 mt-1">
              {activeTab === 'login' && 'Masuk untuk memantau produktivitas peternakan Anda'}
              {activeTab === 'register' && 'Daftarkan peternakan Anda dan dapatkan analisis AI gratis'}
              {activeTab === 'forgot' && 'Masukkan email terdaftar untuk menerima link pemulihan'}
            </p>
          </div>

          {/* Custom Tabs (Hidden in Forgot Mode) */}
          {activeTab !== 'forgot' && (
            <div className="flex bg-warm-earth/5 p-1 rounded-2xl mb-6 relative">
              <button 
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2.5 text-center text-sm font-extrabold rounded-xl transition-all duration-300 relative z-10 cursor-pointer ${
                  activeTab === 'login' ? 'text-warm-earth' : 'text-warm-earth/50'
                }`}
              >
                Masuk
              </button>
              <button 
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2.5 text-center text-sm font-extrabold rounded-xl transition-all duration-300 relative z-10 cursor-pointer ${
                  activeTab === 'register' ? 'text-warm-earth' : 'text-warm-earth/50'
                }`}
              >
                Daftar
              </button>
              
              {/* Highlight background pill animation */}
              <motion.div 
                layoutId="activeTabPill"
                className="absolute top-1 bottom-1 bg-white rounded-xl shadow-sm border border-warm-earth/5 z-0"
                style={{
                  left: activeTab === 'login' ? '4px' : 'calc(50% + 2px)',
                  right: activeTab === 'login' ? 'calc(50% + 2px)' : '4px'
                }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* REGISTER ONLY: Farm Name Input */}
            {activeTab === 'register' && (
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-warm-earth/65">
                  Nama Peternakan
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-earth/40">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Contoh: Berkah Jaya Layer"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full bg-white border border-warm-earth/10 focus:border-primary-gold focus:ring-2 focus:ring-primary-gold/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold transition-all focus:outline-none placeholder:text-warm-earth/30"
                  />
                </div>
              </div>
            )}

            {/* Email Input (All states) */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-warm-earth/65">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-earth/40">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email" 
                  placeholder="name@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-warm-earth/10 focus:border-primary-gold focus:ring-2 focus:ring-primary-gold/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold transition-all focus:outline-none placeholder:text-warm-earth/30"
                />
              </div>
            </div>

            {/* REGISTER ONLY: Phone / WA Input */}
            {activeTab === 'register' && (
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-warm-earth/65">
                  No. WhatsApp (Hubungkan Bot)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-earth/40">
                    <Smartphone className="w-4 h-4" />
                  </span>
                  <input 
                    type="tel" 
                    placeholder="08123456789"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-warm-earth/10 focus:border-primary-gold focus:ring-2 focus:ring-primary-gold/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold transition-all focus:outline-none placeholder:text-warm-earth/30"
                  />
                </div>
              </div>
            )}

            {/* REGISTER ONLY: Flock Size Selector */}
            {activeTab === 'register' && (
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-warm-earth/65">
                  Jumlah Populasi Ayam
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-earth/40">
                    <Egg className="w-4 h-4" />
                  </span>
                  <select 
                    value={flockSize}
                    onChange={(e) => setFlockSize(e.target.value)}
                    className="w-full bg-white border border-warm-earth/10 focus:border-primary-gold focus:ring-2 focus:ring-primary-gold/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold transition-all focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="under-1000">&lt; 1.000 Ekor</option>
                    <option value="1000-5000">1.000 - 5.000 Ekor</option>
                    <option value="5000-10000">5.000 - 10.000 Ekor</option>
                    <option value="above-10000">&gt; 10.000 Ekor</option>
                  </select>
                  {/* Custom Arrow overlay */}
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-warm-earth/40 font-bold text-xs">▼</span>
                </div>
              </div>
            )}

            {/* PASSWORD: Login & Register only */}
            {activeTab !== 'forgot' && (
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-warm-earth/65">
                    Kata Sandi
                  </label>
                  
                  {activeTab === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setActiveTab('forgot')}
                      className="text-xs font-bold text-primary-gold hover:text-yolk-accent transition-colors cursor-pointer"
                    >
                      Lupa sandi?
                    </button>
                  )}
                </div>
                
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-earth/40">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-warm-earth/10 focus:border-primary-gold focus:ring-2 focus:ring-primary-gold/15 rounded-2xl pl-11 pr-12 py-3.5 text-sm font-semibold transition-all focus:outline-none placeholder:text-warm-earth/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-earth/40 hover:text-warm-earth transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* LOGIN ONLY: Remember Me Checkbox */}
            {activeTab === 'login' && (
              <div className="flex items-center text-left py-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4.5 h-4.5 rounded-md border-warm-earth/10 text-primary-gold focus:ring-primary-gold/30 bg-white"
                  />
                  <span className="text-xs font-bold text-earth-light/75 select-none">Ingat akun saya di HP ini</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary-gold text-warm-earth font-extrabold py-3.5 rounded-full hover:bg-yolk-accent hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all shadow-lg shadow-primary-gold/15 text-sm cursor-pointer duration-150 relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-warm-earth" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Memproses...</span>
                </div>
              ) : (
                <>
                  <span>
                    {activeTab === 'login' && 'Masuk Sekarang'}
                    {activeTab === 'register' && 'Daftarkan Akun'}
                    {activeTab === 'forgot' && 'Kirim Link Reset'}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
                </>
              )}
            </button>

            {/* FORGOT PASSWORD ONLY: Back to Login link */}
            {activeTab === 'forgot' && (
              <button 
                type="button"
                onClick={() => setActiveTab('login')}
                className="w-full text-center text-xs font-bold text-warm-earth/60 hover:text-warm-earth transition-colors cursor-pointer py-1.5"
              >
                Kembali ke halaman masuk
              </button>
            )}

            {/* Foot note switcher link (hidden in forgot password flow) */}
            {activeTab !== 'forgot' && (
              <p className="text-center text-xs font-semibold text-earth-light/60 pt-4 border-t border-warm-earth/5">
                {activeTab === 'login' ? (
                  <>
                    Belum punya akun peternak?{' '}
                    <button 
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="font-extrabold text-primary-gold hover:underline transition-colors cursor-pointer"
                    >
                      Daftar gratis
                    </button>
                  </>
                ) : (
                  <>
                    Sudah terdaftar sebagai peternak?{' '}
                    <button 
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="font-extrabold text-primary-gold hover:underline transition-colors cursor-pointer"
                    >
                      Masuk disini
                    </button>
                  </>
                )}
              </p>
            )}

          </form>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
