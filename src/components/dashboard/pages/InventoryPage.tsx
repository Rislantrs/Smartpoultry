import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  FileText,
  Egg,
  Scale,
  Calendar,
  Layers,
  ArrowRightLeft,
  ShoppingBag,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  X,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  nama: string;
  kategori: 'Pakan' | 'Telur' | 'Kesehatan';
  stok: number;
  satuan: string;
  lajuKonsumsi?: number; // per day
  peringatanHari?: number; // days left
  status: 'Cukup' | 'Kritis' | 'Melimpah';
}

interface StockLog {
  id: string;
  tanggal: string;
  item: string;
  tipe: 'Masuk' | 'Keluar';
  kuantitas: number;
  satuan: string;
  keterangan: string;
}

const mockInventory: InventoryItem[] = [
  { id: 'inv-01', nama: 'Konsentrat Pakan Malindo 8202', kategori: 'Pakan', stok: 42, satuan: 'Sak (50kg)', lajuKonsumsi: 10, status: 'Kritis' },
  { id: 'inv-02', nama: 'Pakan Jadi Jagung Giling CP', kategori: 'Pakan', stok: 120, satuan: 'Sak (50kg)', lajuKonsumsi: 12, status: 'Cukup' },
  { id: 'inv-03', nama: 'Telur Ayam Segar (Gudang)', kategori: 'Telur', stok: 320, satuan: 'Kg', status: 'Melimpah' },
  { id: 'inv-04', nama: 'Vaksin ND-Lasota (Aktif)', kategori: 'Kesehatan', stok: 15, satuan: 'Vial', status: 'Cukup' },
  { id: 'inv-05', nama: 'Multivitamin Vita Stress', kategori: 'Kesehatan', stok: 4, satuan: 'Kg', status: 'Kritis' },
];

const mockStockLogs: StockLog[] = [
  { id: 'log-101', tanggal: '21 Mei 2026', item: 'Konsentrat Pakan Malindo 8202', tipe: 'Keluar', kuantitas: 10, satuan: 'Sak', keterangan: 'Jatah makan pagi & sore kandang 1' },
  { id: 'log-102', tanggal: '20 Mei 2026', item: 'Telur Ayam Segar (Gudang)', tipe: 'Masuk', kuantitas: 270, satuan: 'Kg', keterangan: 'Hasil panen harian kandang 1 & 2' },
  { id: 'log-103', tanggal: '19 Mei 2026', item: 'Telur Ayam Segar (Gudang)', tipe: 'Keluar', kuantitas: 500, satuan: 'Kg', keterangan: 'Diambil oleh pengepul Cv Makmur Jaya' },
  { id: 'log-104', tanggal: '18 Mei 2026', item: 'Konsentrat Pakan Malindo 8202', tipe: 'Masuk', kuantitas: 50, satuan: 'Sak', keterangan: 'Pengiriman supplier Malindo Utama' },
];

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function formatDateToIndonesian(dateSrc: string | Date): string {
  const d = new Date(dateSrc);
  if (isNaN(d.getTime())) return String(dateSrc);
  const day = d.getDate();
  const month = MONTHS_ID[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(mockInventory);
  const [logs, setLogs] = useState<StockLog[]>(mockStockLogs);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { inventoryList, addInventoryLog, profileData, isDemoMode } = useOutletContext<{
    inventoryList: any[];
    addInventoryLog: (log: any) => Promise<void>;
    profileData: any;
    isDemoMode: boolean;
  }>();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Adjust stock states
  const [adjustType, setAdjustType] = useState<'Masuk' | 'Keluar'>('Masuk');
  const [adjustQty, setAdjustQty] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const processDbLogs = (dbLogs: any[]) => {
    if (!dbLogs || dbLogs.length === 0) return;
    
    // 1. Process Logs State (defensive against old localStorage schemas)
    const stateLogs: StockLog[] = dbLogs.map(log => {
      const itemName = log.item_name || log.item || '';
      const isMasuk = log.stock_in !== undefined ? log.stock_in > 0 : log.tipe === 'Masuk';
      const qty = log.stock_in !== undefined ? (isMasuk ? log.stock_in : log.stock_out) : (log.kuantitas || 0);
      
      let unit = log.satuan || 'Pcs';
      if (itemName.includes('Pakan')) unit = 'Sak';
      else if (itemName.includes('Telur')) unit = 'Kg';
      else if (itemName.includes('Vaksin')) unit = 'Vial';
      else if (itemName.includes('Stress') || itemName.includes('Vitamin')) unit = 'Kg';

      let autoKeterangan = log.keterangan || (isMasuk ? 'Penambahan persediaan' : 'Pengeluaran persediaan');
      if (itemName.includes('Malindo') && !isMasuk) {
        autoKeterangan = 'Jatah makan pagi & sore kandang 1';
      } else if (itemName.includes('CP') && !isMasuk) {
        autoKeterangan = 'Jatah makan kandang 2';
      } else if (itemName.includes('Telur') && isMasuk) {
        autoKeterangan = 'Hasil panen harian kandang 1 & 2';
      } else if (itemName.includes('Telur') && !isMasuk) {
        autoKeterangan = 'Diambil oleh pengepul Cv Makmur Jaya';
      } else if (itemName.includes('Malindo') && isMasuk) {
        autoKeterangan = 'Pengiriman supplier Malindo Utama';
      }

      return {
        id: String(log.id),
        tanggal: log.tanggal || formatDateToIndonesian(log.log_date),
        item: itemName,
        tipe: isMasuk ? 'Masuk' : 'Keluar',
        kuantitas: qty,
        satuan: unit,
        keterangan: autoKeterangan,
      };
    });

    setLogs(stateLogs);

    // 2. Process Items State
    const standardItems: InventoryItem[] = [
      { id: 'inv-01', nama: 'Konsentrat Pakan Malindo 8202', kategori: 'Pakan', stok: 42, satuan: 'Sak (50kg)', lajuKonsumsi: 10, status: 'Kritis' },
      { id: 'inv-02', nama: 'Pakan Jadi Jagung Giling CP', kategori: 'Pakan', stok: 120, satuan: 'Sak (50kg)', lajuKonsumsi: 12, status: 'Cukup' },
      { id: 'inv-03', nama: 'Telur Ayam Segar (Gudang)', kategori: 'Telur', stok: 320, satuan: 'Kg', status: 'Melimpah' },
      { id: 'inv-04', nama: 'Vaksin ND-Lasota (Aktif)', kategori: 'Kesehatan', stok: 15, satuan: 'Vial', status: 'Cukup' },
      { id: 'inv-05', nama: 'Multivitamin Vita Stress', kategori: 'Kesehatan', stok: 4, satuan: 'Kg', status: 'Kritis' },
    ];

    const processedItems = standardItems.map(item => {
      const itemLogs = dbLogs.filter(l => (l.item_name || l.item || '').toLowerCase() === item.nama.toLowerCase());
      let currentStock = item.stok;
      
      if (itemLogs.length > 0) {
        currentStock = itemLogs[0].stock_final !== undefined ? itemLogs[0].stock_final : (itemLogs[0].stok !== undefined ? itemLogs[0].stok : itemLogs[0].kuantitas);
      }

      let status: 'Cukup' | 'Kritis' | 'Melimpah' = 'Cukup';
      if (item.kategori === 'Pakan') {
        const daily = item.lajuKonsumsi || 10;
        if (currentStock / daily < 5) status = 'Kritis';
        else if (currentStock / daily > 15) status = 'Melimpah';
      } else {
        if (currentStock < 5) status = 'Kritis';
        else if (currentStock > 200) status = 'Melimpah';
      }

      return {
        ...item,
        stok: currentStock,
        status,
      };
    });

    setItems(processedItems);
  };

  // Sync states whenever global inventoryList updates (completely reactive!)
  useEffect(() => {
    if (inventoryList && inventoryList.length > 0) {
      processDbLogs(inventoryList);
    }
  }, [inventoryList]);

  // Handle Inventory Updates
  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const qty = Number(adjustQty);
    const newStok = adjustType === 'Masuk' 
      ? selectedItem.stok + qty 
      : Math.max(0, selectedItem.stok - qty);

    setIsLoading(true);
    try {
      const newLog = {
        item_name: selectedItem.nama,
        stock_initial: selectedItem.stok,
        stock_in: adjustType === 'Masuk' ? qty : 0,
        stock_out: adjustType === 'Keluar' ? qty : 0,
        stock_final: newStok,
        log_date: new Date().toISOString().split('T')[0],
      };

      await addInventoryLog(newLog);

      setToastMsg(`Stok ${selectedItem.nama} berhasil disesuaikan!`);
      setTimeout(() => setToastMsg(null), 3000);
      setSelectedItem(null);
      setAdjustQty(5);
      setAdjustReason('');
    } catch (err) {
      console.error('Gagal memperbarui stok:', err);
      setToastMsg('Gagal memperbarui stok. Silakan coba lagi.');
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic stats calculation
  const totalPakan = useMemo(() => {
    return items.filter(i => i.kategori === 'Pakan').reduce((sum, i) => sum + i.stok, 0);
  }, [items]);

  const malindoStats = useMemo(() => {
    const malindoItem = items.find(i => i.nama === 'Konsentrat Pakan Malindo 8202');
    const stok = malindoItem ? malindoItem.stok : 42;
    const laju = malindoItem ? malindoItem.lajuKonsumsi || 10 : 10;
    const days = Number((stok / laju).toFixed(1));
    return {
      days,
      isKritis: days < 5,
    };
  }, [items]);

  const telurStats = useMemo(() => {
    const telurItem = items.find(i => i.kategori === 'Telur');
    const stok = telurItem ? telurItem.stok : 320;
    const trays = Number((stok / 30).toFixed(1));
    return {
      stok,
      trays,
    };
  }, [items]);

  const totalKesehatan = useMemo(() => {
    return items.filter(i => i.kategori === 'Kesehatan').reduce((sum, i) => sum + i.stok, 0);
  }, [items]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-6 lg:p-8">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={isMobile ? { duration: 0 } : { duration: 0.3 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-sm text-white shadow-2xl"
          >
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-warm-earth md:text-2xl">Inventaris & Gudang</h2>
            {isLoading && (
              <span className="inline-flex items-center text-xs font-semibold text-primary-gold bg-primary-gold/5 border border-primary-gold/10 px-2 py-0.5 rounded-full animate-pulse">
                Menyinkronkan database...
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">Kelola persediaan pakan, sediaan obat-obatan, dan hasil panen telur siap jual.</p>
        </div>
      </div>

      {/* Overview Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Feed Stock */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 top-4 text-amber-500/10 shrink-0 pointer-events-none">
            <ShoppingBag className="h-20 w-20" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pakan Tersisa</span>
          <p className="mt-2 text-2xl font-black text-warm-earth">{totalPakan} <span className="text-sm font-normal text-slate-400">Sak</span></p>
          <div className={`mt-2 flex items-center gap-1.5 text-xs font-semibold rounded-lg px-2.5 py-1.5 w-fit border ${
            malindoStats.isKritis
              ? 'text-amber-600 bg-amber-50 border-amber-100/50'
              : 'text-emerald-600 bg-emerald-50 border-emerald-100/50'
          }`}>
            {malindoStats.isKritis ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle className="h-4 w-4 shrink-0" />}
            <span>Pakan Malindo {malindoStats.isKritis ? 'kritis' : 'aman'} (sisa {malindoStats.days} hari)</span>
          </div>
        </div>

        {/* Card 2: Egg Stock */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 top-4 text-primary-gold/10 shrink-0 pointer-events-none">
            <Egg className="h-20 w-20" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telur Gudang Siap Jual</span>
          <p className="mt-2 text-2xl font-black text-warm-earth">{telurStats.stok} <span className="text-sm font-normal text-slate-400">Kg</span></p>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span>Panen Telur: ~{telurStats.trays} Tray</span>
          </div>
        </div>

        {/* Card 3: Health products */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 top-4 text-indigo-500/10 shrink-0 pointer-events-none">
            <HeartPulse className="h-20 w-20" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Obat & Vaksin Kandang</span>
          <p className="mt-2 text-2xl font-black text-warm-earth">{totalKesehatan} <span className="text-sm font-normal text-slate-400">Item Aktif</span></p>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
            <CheckCircle className="h-4 w-4" />
            <span>Semua vaksin tersimpan di lemari pendingin</span>
          </div>
        </div>
      </div>

      {/* Grid: Stock List and Transaction Logs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Stock list */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-warm-earth uppercase tracking-wider">Daftar Inventaris</h3>
            <span className="text-xs text-slate-400 font-semibold">Sentuh item untuk menyesuaikan stok</span>
          </div>

          <div className="space-y-2">
            {items.map((item) => {
              const isKritis = item.status === 'Kritis';
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="w-full flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-soft-beige/50 p-4 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2.5 transition-colors ${
                      item.kategori === 'Pakan'
                        ? 'bg-amber-50 text-amber-600'
                        : item.kategori === 'Telur'
                        ? 'bg-orange-50 text-orange-500'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {item.kategori === 'Pakan' ? <Package className="h-5 w-5" /> : item.kategori === 'Telur' ? <Egg className="h-5 w-5" /> : <HeartPulse className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-warm-earth group-hover:text-primary-gold transition-colors">{item.nama}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.kategori} • #{item.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-xs font-black text-warm-earth">{item.stok} <span className="text-[10px] text-slate-400 font-normal">{item.satuan}</span></p>
                      
                      {item.lajuKonsumsi && (
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                          Laju: {item.lajuKonsumsi} sak/hari
                        </p>
                      )}
                    </div>

                    <span className={`inline-flex rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      isKritis 
                        ? 'bg-red-50 text-red-500 border border-red-100' 
                        : item.status === 'Melimpah'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isKritis ? 'Stok Kritis' : item.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Transaction logs */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-warm-earth uppercase tracking-wider border-b border-slate-100 pb-3">Mutasi Stok Terakhir</h3>
          
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Belum ada catatan mutasi.</p>
            ) : (
              logs.map((log) => {
                const isMasuk = log.tipe === 'Masuk';
                return (
                  <div key={log.id} className="flex items-start justify-between gap-2 text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex gap-2.5 items-start">
                      <div className={`rounded-lg p-1.5 mt-0.5 ${
                        isMasuk ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {isMasuk ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-warm-earth line-clamp-1">{log.item}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{log.tanggal} • {log.keterangan}</p>
                      </div>
                    </div>

                    <span className={`font-black text-right shrink-0 ${isMasuk ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isMasuk ? '+' : '-'}{log.kuantitas} {log.satuan}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Adjust Stock Dialog Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={isMobile ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={isMobile ? { opacity: 1 } : { opacity: 0 }}
              transition={isMobile ? { duration: 0 } : { duration: 0.2 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Dialog Content */}
            <motion.div
              initial={isMobile ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={isMobile ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
              transition={isMobile ? { duration: 0 } : { duration: 0.3 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100"
            >
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-warm-earth">Sesuaikan Persediaan</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedItem.nama}</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="rounded-xl p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStock} className="space-y-4">
                {/* Movement Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tipe Penyesuaian</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setAdjustType('Masuk')}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        adjustType === 'Masuk'
                          ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/40'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Plus className="h-4.5 w-4.5" />
                      <span>Stok Masuk (+)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType('Keluar')}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        adjustType === 'Keluar'
                          ? 'bg-white text-red-500 shadow-sm border border-slate-200/40'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Minus className="h-4.5 w-4.5" />
                      <span>Stok Keluar (-)</span>
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jumlah ({selectedItem.satuan})</label>
                  <input
                     type="number"
                     required
                     min={1}
                     value={adjustQty}
                     onChange={(e) => setAdjustQty(Number(e.target.value))}
                     className="w-full px-3.5 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keterangan / Catatan Mutasi</label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="Contoh: Bongkar supplier CP / Pakan sore kandang 2"
                    className="w-full px-3.5 py-2.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={`rounded-xl px-5 py-2 text-xs font-bold text-white transition-all shadow-md cursor-pointer ${
                      adjustType === 'Masuk'
                        ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100'
                        : 'bg-red-500 hover:bg-red-600 shadow-red-100'
                    }`}
                  >
                    Simpan Penyesuaian
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
