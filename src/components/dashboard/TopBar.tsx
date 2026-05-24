import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Search,
  Bell,
  Settings,
  Download,
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface TopBarProps {
  onToggleSidebar: () => void;
  userProfile?: {
    id: string;
    farm_name: string;
    owner_name: string;
    phone_number?: string | null;
    location?: string | null;
  } | null;
  isDemoMode?: boolean;
  onLogout?: () => void;
  dailyList?: any[];
  vaccineList?: any[];
  weeklyList?: any[];
  maintList?: any[];
  salesList?: any[];
  inventoryList?: any[];
  cageData?: any;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  selectedPeriod?: 'today' | '7days' | '30days' | 'month';
  setSelectedPeriod?: (p: 'today' | '7days' | '30days' | 'month') => void;
}

type PeriodOption = 'today' | '7days' | '30days' | 'month';

interface PageInfo {
  title: string;
  subtitle: string;
}

const periodLabels: Record<PeriodOption, string> = {
  today: 'Hari Ini',
  '7days': '7 Hari',
  '30days': '30 Hari',
  month: 'Bulan Ini',
};

const pageTitles: Record<string, PageInfo> = {
  '/dashboard': {
    title: 'Ringkasan',
    subtitle: 'Pantau performa farm Anda secara keseluruhan',
  },
  '/dashboard/logs': {
    title: 'Pencatatan',
    subtitle: 'Log harian produksi, pakan, dan mortalitas',
  },
  '/dashboard/analytics': {
    title: 'Analisis',
    subtitle: 'Analisis tren dan pola produksi',
  },
  '/dashboard/diagnosis': {
    title: 'Diagnosa AI',
    subtitle: 'Deteksi dini penyakit dengan kecerdasan buatan',
  },
  '/dashboard/inventory': {
    title: 'Gudang',
    subtitle: 'Kelola stok pakan, obat, dan perlengkapan',
  },
  '/dashboard/settings': {
    title: 'Pengaturan',
    subtitle: 'Konfigurasi akun dan preferensi sistem',
  },
};

function getPageInfo(pathname: string): PageInfo {
  // Exact match first
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }
  // Try matching prefix for nested routes
  const matchedKey = Object.keys(pageTitles)
    .filter((key) => key !== '/dashboard')
    .find((key) => pathname.startsWith(key));

  if (matchedKey) {
    return pageTitles[matchedKey];
  }

  // Default to dashboard
  return pageTitles['/dashboard'];
}

function getInitials(name?: string | null): string {
  if (!name) return 'SP';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function TopBar({
  onToggleSidebar,
  userProfile,
  isDemoMode,
  onLogout,
  dailyList,
  vaccineList,
  weeklyList,
  maintList,
  salesList,
  inventoryList,
  cageData,
  searchQuery: parentSearchQuery,
  setSearchQuery: parentSetSearchQuery,
  selectedPeriod: parentSelectedPeriod,
  setSelectedPeriod: parentSetSelectedPeriod,
}: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [localPeriod, setLocalPeriod] = useState<PeriodOption>('30days');
  const [localSearch, setLocalSearch] = useState('');

  const activePeriod = parentSelectedPeriod !== undefined ? parentSelectedPeriod : localPeriod;
  const setActivePeriod = parentSetSelectedPeriod !== undefined ? parentSetSelectedPeriod : setLocalPeriod;

  const activeSearch = parentSearchQuery !== undefined ? parentSearchQuery : localSearch;
  const setActiveSearch = parentSetSearchQuery !== undefined ? parentSetSearchQuery : setLocalSearch;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const pageInfo = getPageInfo(location.pathname);

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Handle clicking outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }

      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = () => {
    let csvContent = '';
    let fileName = `smartpoultry-${location.pathname.replace(/\//g, '-') || 'dashboard'}-${Date.now()}.csv`;

    const cleanCsvCell = (val: any) => {
      if (val === undefined || val === null) return '""';
      let str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/' || location.pathname === '/dashboard/logs' || location.pathname === '/dashboard/analytics') {
      // Export Daily Logs as CSV
      const headers = [
        'Tanggal', 'Telur Utuh (butir)', 'Berat Telur (kg)', 'Telur Rusak/BS (butir)',
        'Pakan Keluar (kg)', 'Pakan Keluar (sak)', 'Sisa Pakan (kg)', 'Status Air',
        'Vitamin & Dosis', 'Ayam Mati (ekor)', 'Gejala Penyakit', 'Suhu Pagi (C)',
        'Suhu Siang (C)', 'Kondisi Feces', 'Jam Ambil Telur', 'Jadwal Pembersihan', 'Sumber'
      ];
      csvContent += headers.map(cleanCsvCell).join(',') + '\n';

      const listToExport = dailyList || [];
      listToExport.forEach((row: any) => {
        const line = [
          row.tanggal,
          row.telurButir,
          row.telurBeratKg,
          row.telurBS,
          row.pakanKeluarKg,
          row.pakanKeluarSak,
          row.pakanSisaKg ?? '-',
          row.airStatus,
          row.vitaminDosisTime ?? '-',
          row.ayamMati,
          row.gejalaPenyakit ?? '-',
          row.suhuPagi,
          row.suhuSiang,
          row.fecesKondisi,
          row.ambilTelurJam ?? '-',
          row.pembersihanArea ?? '-',
          row.sumber
        ];
        csvContent += line.map(cleanCsvCell).join(',') + '\n';
      });
    } else if (location.pathname === '/dashboard/inventory') {
      // Export Inventory gudang as CSV
      const headers = ['Tanggal', 'Nama Barang', 'Stok Awal', 'Masuk', 'Keluar', 'Stok Akhir'];
      csvContent += headers.map(cleanCsvCell).join(',') + '\n';

      const listToExport = inventoryList || [];
      listToExport.forEach((row: any) => {
        const line = [
          row.log_date,
          row.item_name,
          row.stock_initial,
          row.stock_in,
          row.stock_out,
          row.stock_final
        ];
        csvContent += line.map(cleanCsvCell).join(',') + '\n';
      });
    } else {
      // Export Settings & Profile info as CSV
      const headers = ['Parameter', 'Nilai'];
      csvContent += headers.map(cleanCsvCell).join(',') + '\n';

      let parsedLocation = userProfile?.location || '';
      let alamat = parsedLocation;
      let feedFreq = '2';
      let feedTimes = '07:00 & 14:00';
      let eggTimes = '10:00 & 15:00';

      try {
        if (parsedLocation.startsWith('{')) {
          const jsonObj = JSON.parse(parsedLocation);
          alamat = jsonObj.alamat || '';
          feedFreq = jsonObj.feedingFreq || '2x sehari';
          feedTimes = jsonObj.feedingTimes || '07:00 & 14:00';
          eggTimes = jsonObj.eggCollectionTimes || '10:00 & 15:00';
        }
      } catch (e) {}

      const settingsRows = [
        ['Nama Farm', userProfile?.farm_name || 'Kandang Mandiri'],
        ['Nama Pemilik', userProfile?.owner_name || 'Peternak Pintar'],
        ['Nomor Telepon', userProfile?.phone_number || '-'],
        ['Lokasi Geografis', alamat || '-'],
        ['Frekuensi Pakan Harian', feedFreq],
        ['Jadwal Pemberian Pakan', feedTimes],
        ['Jadwal Ambil Telur', eggTimes],
        ['Strain/Ras Ayam', cageData?.strain || 'Lohmann Brown'],
        ['Umur Kawanan Ayam (Minggu)', cageData?.chicken_age_weeks || '24'],
        ['Kapasitas Populasi Maksimal', cageData?.capacity || '5000'],
        ['Standar Target FCR Ideal', cageData?.target_fcr || '2.15'],
      ];

      settingsRows.forEach((row) => {
        csvContent += row.map(cleanCsvCell).join(',') + '\n';
      });
    }

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleOpenSettings = () => {
    setNotificationsOpen(false);
    setDropdownOpen(false);
    navigate('/dashboard/settings');
  };

  const notificationItems = [
    {
      title: 'Ringkasan siap ditinjau',
      detail: `Halaman ${pageInfo.title.toLowerCase()} aktif pada ${currentDate}.`,
    },
    {
      title: isDemoMode ? 'Mode demo aktif' : 'Data tersinkron',
      detail: isDemoMode
        ? 'Anda sedang melihat data simulasi untuk mencoba seluruh tombol.'
        : 'Data real farm siap diekspor atau ditinjau dari dashboard ini.',
    },
    {
      title: 'Akses cepat pengaturan',
      detail: 'Gunakan ikon roda gigi untuk membuka pengaturan akun dan integrasi.',
    },
  ];

  const ownerName = userProfile?.owner_name || 'Peternak Pintar';
  const farmName = userProfile?.farm_name || 'Kandang Mandiri';
  const initials = getInitials(ownerName);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-warm-earth/5 select-none">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-[70px]">
        {/* Left side: hamburger + page title */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 -ml-2 rounded-xl text-warm-earth/60 hover:text-warm-earth hover:bg-warm-earth/5 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="shrink-0 flex flex-col justify-center">
            <h1 className="text-base sm:text-lg font-black text-warm-earth uppercase tracking-tight shrink-0 whitespace-nowrap">
              {pageInfo.title}
            </h1>
            <p className="text-[10px] sm:text-xs text-warm-earth/50 font-semibold hidden lg:block truncate max-w-[150px] lg:max-w-[300px]">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right side: controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Input - hidden on small screens */}
          <div className="relative hidden 2xl:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-earth/30" />
            <input
              type="text"
              value={activeSearch}
              onChange={(e) => setActiveSearch(e.target.value)}
              placeholder="Cari..."
              className="w-48 pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm text-warm-earth placeholder:text-warm-earth/30 focus:outline-none focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold/30 transition-all"
            />
          </div>

          {/* Period Selector - segmented control */}
          <div className="hidden lg:flex items-center bg-gray-50 rounded-full p-1 border border-gray-100">
            {(Object.keys(periodLabels) as PeriodOption[]).map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`relative px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activePeriod === period
                    ? 'text-warm-earth'
                    : 'text-warm-earth/40 hover:text-warm-earth/70'
                }`}
              >
                {activePeriod === period && (
                  <motion.div
                    layoutId="periodSelector"
                    className="absolute inset-0 bg-white rounded-full shadow-sm border border-gray-200"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{periodLabels[period]}</span>
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary-gold/10 text-primary-gold hover:bg-primary-gold/20 transition-colors text-xs font-semibold cursor-pointer"
            title="Ekspor Data"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Ekspor</span>
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen((value) => !value)}
              className="relative p-2 rounded-full text-warm-earth/40 hover:text-warm-earth hover:bg-warm-earth/5 transition-colors cursor-pointer"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-terracotta text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                3
              </span>
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-warm-earth/10 bg-white/95 p-3 shadow-[0_12px_40px_rgba(28,19,12,0.12)] backdrop-blur-md z-40"
                >
                  <div className="flex items-center justify-between px-1 pb-2 border-b border-warm-earth/5">
                    <div>
                      <p className="text-sm font-bold text-warm-earth">Notifikasi</p>
                      <p className="text-[11px] text-warm-earth/40">Ringkasan cepat untuk kandang Anda</p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-gold">Aktif</span>
                  </div>

                  <div className="space-y-2 pt-3">
                    {notificationItems.map((item) => (
                      <div key={item.title} className="rounded-xl bg-warm-earth/3 px-3 py-2.5 border border-warm-earth/5">
                        <p className="text-xs font-bold text-warm-earth">{item.title}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-warm-earth/55">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <button
            type="button"
            onClick={handleOpenSettings}
            className="hidden sm:flex p-2 rounded-full text-warm-earth/40 hover:text-warm-earth hover:bg-warm-earth/5 transition-colors cursor-pointer"
            title="Pengaturan"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* User Avatar with Dropdown */}
          <div className="relative flex items-center pl-2 sm:pl-3 border-l border-warm-earth/10" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 text-left cursor-pointer focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-gold to-yolk-accent flex items-center justify-center text-warm-earth font-black text-xs shadow-md hover:shadow-lg transition-all active:scale-95 duration-200">
                {initials}
              </div>
              <div className="hidden lg:block">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-warm-earth leading-tight truncate max-w-[120px]">
                    {ownerName}
                  </p>
                  {isDemoMode && (
                    <span className="bg-amber-500/15 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-amber-500/20 tracking-wider">
                      DEMO
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-warm-earth/40 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                <p className="text-[10px] text-warm-earth/40 leading-tight truncate max-w-[120px]">{farmName}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-warm-earth/10 bg-white/95 p-2.5 shadow-[0_12px_40px_rgba(28,19,12,0.12)] backdrop-blur-md z-40"
                >
                  <div className="px-3.5 py-2 border-b border-warm-earth/5 mb-2">
                    <p className="text-xs font-bold text-warm-earth truncate">{ownerName}</p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{farmName}</p>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar (Logout)</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

