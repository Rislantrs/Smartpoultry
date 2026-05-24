import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Stethoscope,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BookOpen,
  Bot,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  userProfile?: {
    id: string;
    farm_name: string;
    owner_name: string;
  } | null;
  onLogout?: () => void;
}

interface NavItem {
  label: string;
  icon: ComponentType<{ className?: string }>;
  path: string;
}

const mainNavItems: NavItem[] = [
  { label: 'Ringkasan', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Pencatatan', icon: ClipboardList, path: '/dashboard/logs' },
  { label: 'Analisis', icon: BarChart3, path: '/dashboard/analytics' },
  { label: 'Diagnosa AI', icon: Stethoscope, path: '/dashboard/diagnosis' },
  { label: 'Gudang', icon: Package, path: '/dashboard/inventory' },
];

const bottomNavItems: NavItem[] = [
  { label: 'Bot Telegram', icon: Bot, path: '/dashboard/telegram' },
  { label: 'Panduan AI', icon: BookOpen, path: '/dashboard/shortcuts' },
  { label: 'Profil & Sistem', icon: Settings, path: '/dashboard/settings' },
];

function NavItemButton({
  item,
  isActive,
  isCollapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const Icon = item.icon;

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          group relative flex items-center w-full rounded-xl transition-all duration-200 cursor-pointer
          ${isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3 gap-3'}
          ${
            isActive
              ? 'bg-primary-gold/10 text-primary-gold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }
        `}
      >
        {/* Gold left border indicator for active item */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary-gold rounded-r-full"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}

        <Icon
          className={`shrink-0 transition-colors duration-200 ${
            isActive ? 'text-primary-gold' : 'text-slate-400 group-hover:text-white'
          } ${isCollapsed ? 'w-5.5 h-5.5' : 'w-5 h-5'}`}
        />

        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className={`text-sm font-semibold whitespace-nowrap overflow-hidden ${
                isActive ? 'text-primary-gold' : ''
              }`}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Tooltip when collapsed */}
      <AnimatePresence>
        {isCollapsed && showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50"
          >
            <div className="bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap border border-slate-700">
              {item.label}
              <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[5px] border-r-slate-800" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar({ isOpen, onToggle, isMobileOpen, onMobileClose, userProfile, onLogout }: SidebarProps) {
  const [googleAvatar, setGoogleAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.user_metadata?.avatar_url) {
        setGoogleAvatar(session.user.user_metadata.avatar_url);
      }
    };
    fetchSession();
  }, []);

  const ownerName = userProfile?.owner_name || 'Peternak Cerdas';
  const farmName = userProfile?.farm_name || 'Manajer Farm';
  
  const initials = (() => {
    const name = ownerName.trim();
    if (!name) return 'PC';
    const parts = name.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  })();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onMobileClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Area */}
      <div className={`flex items-center shrink-0 border-b border-white/5 ${isOpen ? 'px-6 py-5 gap-3' : 'px-4 py-5 justify-center'}`}>
        <div className="h-10 w-10 rounded-xl bg-primary-gold flex items-center justify-center shadow-lg shadow-primary-gold/20 shrink-0 overflow-hidden">
          <img
            src="/assets/logo.png"
            alt="SmartPoultry logo"
            className="h-full w-full object-cover scale-[1.6]"
          />
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="leading-tight">
                <span className="block text-[8px] font-bold uppercase tracking-[0.25em] text-primary-gold/70">
                  SmartPoultry AI
                </span>
                <span className="block text-[17px] font-extrabold tracking-tight text-white leading-tight">
                  Peternak<span className="text-primary-gold">Cerdas</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <AnimatePresence>
          {isOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-4 mb-2"
            >
              Menu Utama
            </motion.p>
          )}
        </AnimatePresence>

        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <div key={item.path}>
              <NavItemButton
                item={item}
                isActive={isActive(item.path)}
                isCollapsed={!isOpen}
                onClick={() => handleNavigate(item.path)}
              />
            </div>
          ))}
        </nav>

        {/* Separator */}
        <div className={`my-4 border-t border-white/5 ${isOpen ? 'mx-4' : 'mx-2'}`} />

        <AnimatePresence>
          {isOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-4 mb-2"
            >
              Lainnya
            </motion.p>
          )}
        </AnimatePresence>

        <nav className="space-y-1">
          {bottomNavItems.map((item) => (
            <div key={item.path}>
              <NavItemButton
                item={item}
                isActive={isActive(item.path)}
                isCollapsed={!isOpen}
                onClick={() => handleNavigate(item.path)}
              />
            </div>
          ))}
        </nav>
      </div>

      {/* Collapse Toggle Button */}
      <div className="hidden lg:block px-3 pb-2">
        <button
          onClick={onToggle}
          className={`flex items-center w-full rounded-xl py-2.5 text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer ${
            isOpen ? 'px-4 gap-3' : 'justify-center px-3'
          }`}
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5 shrink-0" />
          ) : (
            <ChevronRight className="w-5 h-5 shrink-0" />
          )}
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Tutup Sidebar
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* User Info Section */}
      <div className={`shrink-0 border-t border-white/5 ${isOpen ? 'px-4 py-4' : 'px-3 py-4'}`}>
        <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-gold to-yolk-accent flex items-center justify-center shrink-0 text-warm-earth font-bold text-sm shadow-md overflow-hidden">
            {googleAvatar ? (
              <img src={googleAvatar} alt={ownerName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-white truncate">{ownerName}</p>
                <p className="text-xs text-slate-400 truncate">{farmName}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isOpen && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: isOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 bg-[#0f172a] select-none"
        style={{ willChange: 'width' }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={isMobile ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={isMobile ? { opacity: 1 } : { opacity: 0 }}
              transition={isMobile ? { duration: 0 } : { duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={isMobile ? { x: 0 } : { x: -280 }}
              animate={{ x: 0 }}
              exit={isMobile ? { x: 0 } : { x: -280 }}
              transition={isMobile ? { duration: 0 } : { duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-0 top-0 h-screen w-[280px] z-50 bg-[#0f172a] lg:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
