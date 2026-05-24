import { useState } from 'react';
import { Menu, X, ArrowRight, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onOpenLogin: () => void;
}

export default function Header({ onOpenLogin }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
      className="fixed top-4 left-0 right-0 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none"
    >
      {/* Floating Capsule Navbar */}
      <div className="w-full bg-white/95 border border-warm-earth/5 shadow-2xl rounded-full backdrop-blur-xl px-5 sm:px-8 py-2.5 flex items-center justify-between gap-4 transition-all duration-300">
        
        {/* Left: Logo & Brand Name (Inspired by Farmio but tailored to SmartPoultry) */}
        <a href="/#beranda" className="flex items-center gap-3.5 cursor-pointer group shrink-0">
          <div className="h-12 w-12 rounded-full bg-primary-gold flex items-center justify-center shadow-lg ring-2 ring-white overflow-hidden transition-transform duration-300 group-hover:scale-105 shrink-0 relative">
            <img 
              src="/assets/logo.png" 
              alt="SmartPoultry logo" 
              className="h-full w-full object-cover scale-[1.65] origin-center transition-transform duration-500 group-hover:scale-[1.75]" 
            />
          </div>
          
          <div className="leading-tight text-left">
            <span className="block text-[9px] font-black uppercase tracking-[0.3em] text-primary-gold leading-none mb-0.5">
              SmartPoultry AI
            </span>
            <span className="block text-[21px] font-black tracking-tight text-warm-earth leading-none">
              Peternak<span className="text-primary-gold">Cerdas</span>
            </span>
          </div>
        </a>

        {/* Center: Desktop Navigation Links (Exactly 5 menu items, balanced and premium like the mockup) */}
        <nav className="hidden xl:flex items-center gap-8">
          <a href="/#beranda" className="text-[14px] text-warm-earth/75 hover:text-primary-gold font-bold transition-all duration-200 cursor-pointer">
            Beranda
          </a>
          <a href="/tentang-kami" className="text-[14px] text-warm-earth/75 hover:text-primary-gold font-bold transition-all duration-200 cursor-pointer">
            Tentang Kami
          </a>
          <a href="/layanan" className="text-[14px] text-warm-earth/75 hover:text-primary-gold font-bold transition-all duration-200 cursor-pointer">
            Layanan
          </a>
          <a href="/galeri" className="text-[14px] text-warm-earth/75 hover:text-primary-gold font-bold transition-all duration-200 cursor-pointer">
            Galeri
          </a>
          <a href="/testimoni" className="text-[14px] text-warm-earth/75 hover:text-primary-gold font-bold transition-all duration-200 cursor-pointer">
            Testimoni
          </a>
        </nav>

        {/* Right: Premium Yolk Action Button for Login */}
        <div className="hidden xl:flex items-center">
          <button 
            onClick={onOpenLogin}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-gold text-warm-earth text-sm font-extrabold rounded-full hover:bg-yolk-accent transition-all shadow-lg shadow-primary-gold/15 hover:scale-105 active:scale-95 duration-200 cursor-pointer"
          >
            Login
            <ArrowRight className="w-4.5 h-4.5 stroke-[3px]" />
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 text-warm-earth cursor-pointer hover:text-primary-gold transition-colors shrink-0"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay Capsule */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="xl:hidden mt-2 border border-warm-earth/5 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="px-5 pt-5 pb-6 space-y-2">
              <a 
                href="/#beranda" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-[15px] font-bold text-warm-earth/80 hover:bg-primary-gold/10 hover:text-primary-gold transition-colors"
              >
                Beranda
              </a>
              <a 
                href="/tentang-kami" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-[15px] font-bold text-warm-earth/80 hover:bg-primary-gold/10 hover:text-primary-gold transition-colors"
              >
                Tentang Kami
              </a>
              <a 
                href="/layanan" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-[15px] font-bold text-warm-earth/80 hover:bg-primary-gold/10 hover:text-primary-gold transition-colors"
              >
                Layanan
              </a>
              <a 
                href="/galeri" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-[15px] font-bold text-warm-earth/80 hover:bg-primary-gold/10 hover:text-primary-gold transition-colors"
              >
                Galeri
              </a>
              <a 
                href="/testimoni" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-[15px] font-bold text-warm-earth/80 hover:bg-primary-gold/10 hover:text-primary-gold transition-colors"
              >
                Testimoni
              </a>
              
              <div className="pt-4 border-t border-warm-earth/5 flex flex-col gap-4">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary-gold text-warm-earth text-sm font-extrabold rounded-full hover:bg-yolk-accent transition-all shadow-lg cursor-pointer"
                >
                  Login
                  <ArrowRight className="w-4.5 h-4.5 stroke-[3px]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

