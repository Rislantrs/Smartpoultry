import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C1E11] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none font-sans">
      {/* Soft farm theme background gradients */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 10% 20%, rgba(255, 159, 28, 0.04), transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(255, 193, 7, 0.03), transparent 35%),
            linear-gradient(135deg, #FDFBF7 0%, #F5F2ED 100%)
          `,
        }}
      />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8 flex flex-col items-center">
        
        {/* Floating Broken Egg Image */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative w-72 sm:w-80 aspect-[8/7] flex items-center justify-center pointer-events-none"
        >
          {/* Subtle gold shadow/glow beneath the egg */}
          <div className="absolute bottom-4 w-48 h-6 bg-primary-gold/10 rounded-full blur-xl animate-pulse" />
          
          <img
            src="/assets/error page.png"
            alt="Halaman Pecah (404 Error)"
            className="w-full h-auto object-contain drop-shadow-[0_15px_30px_rgba(44,30,17,0.08)]"
          />
        </motion.div>

        {/* Text Area */}
        <div className="space-y-4">
          {/* Bold Yellow/Gold Title explaining the error */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-3xl font-black text-[#FF9F1C] tracking-tight uppercase font-sans flex items-center justify-center gap-2"
          >
            🥚 404 — HALAMAN PECAH!
          </motion.h2>

          {/* Descriptive text in smaller font size */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#2C1E11]/75 text-sm sm:text-base font-medium leading-relaxed font-sans max-w-md mx-auto"
          >
            Waduh! Halaman yang Anda cari telah pecah atau dipindahkan dari sarangnya. Mari kembali ke dashboard!
          </motion.p>
        </div>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#FF9F1C] text-[#2C1E11] text-xs sm:text-sm font-bold rounded-full hover:bg-[#FFC107] transition-all shadow-md active:scale-95 duration-200 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Ke Dashboard
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-8 py-3.5 border border-[#2C1E11]/30 hover:bg-[#2C1E11]/5 text-[#2C1E11] text-xs sm:text-sm font-bold rounded-full transition-all active:scale-95 duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </motion.div>

      </div>
    </div>
  );
}
