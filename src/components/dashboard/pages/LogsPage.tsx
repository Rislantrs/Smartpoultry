import { useState, useMemo, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  Download,
  Calendar,
  Layers,
  ChevronRight,
  TrendingDown,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  PlusCircle,
  Activity,
  HeartPulse,
  Egg,
  Package,
  Wrench,
  DollarSign,
  Info,
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  detailedDailyLogs,
  vaccinationLogs,
  weeklyProductionLogs,
  maintenanceLogs,
  financialSalesLogs,
  type DetailedDailyLog,
  type VaccinationLog,
  type WeeklyProductionLog,
  type MaintenanceLog,
  type FinancialSalesLog,
  type LogStatus,
  type LogSource,
} from '../data/mockData';

type LogTab = 'harian' | 'vaksin' | 'mingguan' | 'perawatan' | 'keuangan';

interface AIAlert {
  type: 'warning' | 'info' | 'success' | 'danger';
  title: string;
  detail: string;
}

interface AIRecommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
}

interface AIInsightsPayload {
  summary: string;
  alerts: AIAlert[];
  recommendations: AIRecommendation[];
}

const alertIconMap = {
  warning: AlertCircle,
  danger: ShieldAlert,
  info: Info,
  success: ShieldCheck,
};

const alertColorMap = {
  warning: { bg: 'bg-amber-50/70', border: 'border-amber-100', icon: 'text-amber-500' },
  danger:  { bg: 'bg-red-50/60',   border: 'border-red-100',   icon: 'text-red-500' },
  info:    { bg: 'bg-blue-50/60',  border: 'border-blue-100',  icon: 'text-blue-500' },
  success: { bg: 'bg-emerald-50/60', border: 'border-emerald-100', icon: 'text-emerald-600' },
};

function escapeCsvValue(value: string | number | boolean | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadTextFile(filename: string, mimeType: string, content: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadCsvFile(filename: string, headers: string[], rows: Array<Array<string | number | boolean | null | undefined>>) {
  const csvRows = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => row.map(escapeCsvValue).join(',')),
  ];
  downloadTextFile(filename, 'text/csv;charset=utf-8', `\uFEFF${csvRows.join('\r\n')}`);
}

function downloadExcelFile(filename: string, headers: string[], rows: Array<Array<string | number | boolean | null | undefined>>) {
  const tableRows = rows
    .map((row) => `<tr>${row.map((value) => `<td>${String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`)
    .join('');

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `;

  downloadTextFile(filename, 'application/vnd.ms-excel;charset=utf-8', html);
}

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState<LogTab>('harian');
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'spreadsheet' | 'card'>('card');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setViewMode(mobile ? 'card' : 'spreadsheet');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Enriched State Management from global context
  const {
    dailyList, addDailyLog, deleteDailyLog,
    vaccineList, addVaccineLog, deleteVaccineLog,
    weeklyList, addWeeklyLog, deleteWeeklyLog,
    maintList, addMaintLog, deleteMaintLog,
    salesList, addSalesLog, deleteSalesLog,
    searchQuery, selectedPeriod
  } = useOutletContext<{
    dailyList: DetailedDailyLog[];
    addDailyLog: (log: DetailedDailyLog) => Promise<void>;
    deleteDailyLog: (id: string) => Promise<void>;
    vaccineList: VaccinationLog[];
    addVaccineLog: (log: VaccinationLog) => Promise<void>;
    deleteVaccineLog: (id: string) => Promise<void>;
    weeklyList: WeeklyProductionLog[];
    addWeeklyLog: (log: WeeklyProductionLog) => Promise<void>;
    deleteWeeklyLog: (id: string) => Promise<void>;
    maintList: MaintenanceLog[];
    addMaintLog: (log: MaintenanceLog) => Promise<void>;
    deleteMaintLog: (id: string) => Promise<void>;
    salesList: FinancialSalesLog[];
    addSalesLog: (log: FinancialSalesLog) => Promise<void>;
    deleteSalesLog: (id: string) => Promise<void>;
    searchQuery?: string;
    selectedPeriod?: 'today' | '7days' | '30days' | 'month';
  }>();

  // Sync global search to local search
  useEffect(() => {
    if (searchQuery !== undefined) {
      setSearch(searchQuery);
    }
  }, [searchQuery]);

  // Modal Control
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── AI Insights State for LogsPage ──
  const [logsInsights, setLogsInsights] = useState<AIInsightsPayload | null>(null);
  const [isLoadingLogsInsights, setIsLoadingLogsInsights] = useState(false);
  const [logsModel, setLogsModel] = useState('');
  const [logsProvider, setLogsProvider] = useState('');

  const cleanMarkdown = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`/g, '')
      .replace(/#{1,6}\s+/g, '')
      .trim();
  };

  const fetchLogsAIInsights = useCallback(async (forceRefresh?: boolean) => {
    setIsLoadingLogsInsights(true);
    const curHour = new Date().getHours();
    const session = curHour < 12 ? 'pagi' : 'sore';

    const cacheKey = 'sp_logs_insights_cache';
    const fetchTimeKey = 'sp_logs_insights_last_fetch';
    const logCountKey = 'sp_logs_insights_log_count';
    const sessionKey = 'sp_logs_insights_session';
    const modelKey = 'sp_logs_insights_model';
    const providerKey = 'sp_logs_insights_provider';

    try {

      const cachedData = localStorage.getItem(cacheKey);
      const lastFetch = localStorage.getItem(fetchTimeKey);
      const cachedLogCount = localStorage.getItem(logCountKey);
      const cachedSession = localStorage.getItem(sessionKey);
      const cachedModel = localStorage.getItem(modelKey) || '';
      const cachedProvider = localStorage.getItem(providerKey) || '';

      const now = Date.now();
      const twelveHours = 12 * 60 * 60 * 1000;
      const parsedLogCount = cachedLogCount ? parseInt(cachedLogCount, 10) : -1;

      if (
        !forceRefresh &&
        cachedData &&
        lastFetch &&
        parsedLogCount === dailyList.length &&
        session === cachedSession &&
        (now - parseInt(lastFetch, 10)) < twelveHours
      ) {
        setLogsInsights(JSON.parse(cachedData) as AIInsightsPayload);
        setLogsModel(cachedModel);
        setLogsProvider(cachedProvider);
        setIsLoadingLogsInsights(false);
        return;
      }

      // Build farm data snapshot for AI
      const latestForAI = dailyList[0];
      const farmSnapshot = {
        logHarian: dailyList.slice(0, 5).map(l => ({
          tanggal: l.tanggal,
          telurButir: l.telurButir,
          pakanKg: l.pakanKeluarKg,
          ayamMati: l.ayamMati,
          suhuSiang: l.suhuSiang,
          feces: l.fecesKondisi,
          gejala: l.gejalaPenyakit || 'tidak ada'
        })),
        kondisiTerkini: latestForAI ? {
          suhuSiang: latestForAI.suhuSiang,
          feces: latestForAI.fecesKondisi,
          mortalitas: latestForAI.ayamMati,
          telurHariIni: latestForAI.telurButir
        } : {}
      };

      const { data, error } = await supabase.functions.invoke('poultry-ai', {
        body: {
          message: `Berikan analisis AI Harian khusus sesi ${session === 'pagi' ? 'Pagi Hari (07:00)' : 'Sore Hari (16:00)'} berdasarkan data kandang terkini.`,
          isInsightsRequest: true,
          farmData: farmSnapshot,
        }
      });

      if (error) throw error;

      if (data?.payload) {
        const payload = data.payload as AIInsightsPayload;
        // Clean markdown tokens inside payloads
        const cleanedPayload: AIInsightsPayload = {
          summary: cleanMarkdown(payload.summary),
          alerts: (payload.alerts || []).map(a => ({
            type: a.type,
            title: cleanMarkdown(a.title),
            detail: cleanMarkdown(a.detail)
          })),
          recommendations: (payload.recommendations || []).map(r => ({
            priority: r.priority,
            title: cleanMarkdown(r.title),
            detail: cleanMarkdown(r.detail)
          }))
        };

        setLogsInsights(cleanedPayload);
        setLogsModel(data.modelUsed || '');
        setLogsProvider(data.providerUsed || '');

        localStorage.setItem(cacheKey, JSON.stringify(cleanedPayload));
        localStorage.setItem(fetchTimeKey, now.toString());
        localStorage.setItem(logCountKey, dailyList.length.toString());
        localStorage.setItem(sessionKey, session);
        localStorage.setItem(modelKey, data.modelUsed || '');
        localStorage.setItem(providerKey, data.providerUsed || '');
      }
    } catch (err) {
      console.warn('AI Logs Insights gagal:', err);
      // Fallback lokal berdasarkan data aktual dan waktu sesi
      const log = dailyList[0];
      const isHeatStress = log && log.suhuSiang > 31 && log.fecesKondisi === 'Basah';
      const hasMortality = log && log.ayamMati > 1;
      
      const fallbackPayload: AIInsightsPayload = {
        summary: session === 'pagi'
          ? `Analisis Sesi Pagi: Rencana tindakan hari ini berfokus pada ${isHeatStress ? 'penanganan stres panas' : 'pemeliharaan rutin'}.`
          : `Analisis Sesi Sore: Evaluasi performa harian ${isHeatStress ? 'menunjukkan urgensi ventilasi malam' : 'berjalan stabil'}.`,
        alerts: [
          {
            type: isHeatStress ? 'danger' : hasMortality ? 'warning' : 'success',
            title: session === 'pagi'
              ? (isHeatStress ? 'Briefing Pagi: Ancaman Stres Panas Terdeteksi' : hasMortality ? 'Briefing Pagi: Mortalitas Meningkat' : 'Briefing Pagi: Kondisi Kandang Stabil')
              : (isHeatStress ? 'Evaluasi Sore: Rekap Stres Panas Terdeteksi' : hasMortality ? 'Evaluasi Sore: Catatan Mortalitas Harian' : 'Evaluasi Sore: Performa Harian Optimal'),
            detail: log
              ? (session === 'pagi'
                ? `Hari ini suhu diperkirakan naik. Data terakhir mencatat suhu ${log.suhuSiang}°C. ${
                    isHeatStress
                      ? 'Segera bersiap menyalakan blower tambahan sejak pukul 10:00 dan siapkan campuran VitaStress.'
                      : hasMortality
                        ? 'Lakukan inspeksi menyeluruh pada blok kandang dengan tingkat mortalitas tinggi.'
                        : 'Jalankan sirkulasi air minum bersih dan pastikan sekam kering sebelum suhu naik siang nanti.'
                  }`
                : `Evaluasi sore menunjukkan suhu siang mencapai ${log.suhuSiang}°C dengan feces ${log.fecesKondisi}. ${
                    isHeatStress
                      ? 'Tingginya kelembaban kotoran memicu amonia malam hari. Pastikan exhaust fan tetap aktif di sirkulasi minimum malam ini.'
                      : hasMortality
                        ? `Total kematian ${log.ayamMati} ekor tercatat sore ini. Bersihkan kandang dari bangkai segera.`
                        : 'Produksi telur dan FCR hari ini berada di kurva optimal. Pertahankan iklim kandang.'
                  }`)
              : 'Mulai isi log harian untuk mendapatkan analisis AI secara real-time.'
          }
        ],
        recommendations: [
          {
            priority: isHeatStress ? 'high' : 'medium',
            title: isHeatStress
              ? (session === 'pagi' ? 'Persiapan VitaStress & Kipas' : 'Sirkulasi Minimum Malam Hari')
              : (session === 'pagi' ? 'Sanitasi Wadah Pakan Pagi' : 'Evaluasi Pakan Terserap'),
            detail: isHeatStress
              ? (session === 'pagi'
                ? 'Campurkan multivitamin VitaStress pada air minum pagi hari sebelum pukul 09:00 dan pastikan seluruh kipas blower prima.'
                : 'Gunakan pengaturan sirkulasi udara minimum malam hari untuk menguras gas amonia tanpa membuat ayam kedinginan.')
              : (session === 'pagi'
                ? 'Lakukan pembersihan wadah pakan sisa sebelum menuangkan pakan baru agar FCR tetap terkontrol.'
                : 'Timbang pakan sisa sore ini untuk mencatat FCR harian yang akurat pada buku spreadsheet.')
          }
        ]
      };

      const cleanedFallback: AIInsightsPayload = {
        summary: cleanMarkdown(fallbackPayload.summary),
        alerts: fallbackPayload.alerts.map(a => ({
          type: a.type,
          title: cleanMarkdown(a.title),
          detail: cleanMarkdown(a.detail)
        })),
        recommendations: fallbackPayload.recommendations.map(r => ({
          priority: r.priority,
          title: cleanMarkdown(r.title),
          detail: cleanMarkdown(r.detail)
        }))
      };

      setLogsInsights(cleanedFallback);
      setLogsModel('local-fallback');
      setLogsProvider('lokal');

      localStorage.setItem(cacheKey, JSON.stringify(cleanedFallback));
      localStorage.setItem(fetchTimeKey, Date.now().toString());
      localStorage.setItem(logCountKey, dailyList.length.toString());
      localStorage.setItem(sessionKey, session);
      localStorage.setItem(modelKey, 'local-fallback');
      localStorage.setItem(providerKey, 'lokal');
    } finally {
      setIsLoadingLogsInsights(false);
    }
  }, [dailyList]);

  // Trigger AI fetch on mount
  useEffect(() => {
    fetchLogsAIInsights();
  }, [fetchLogsAIInsights]);

  // Dynamic Add State structures (cleans up inputs per tab)
  const [newDaily, setNewDaily] = useState<Omit<DetailedDailyLog, 'id' | 'sumber'>>({
    tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    telurButir: 4300,
    telurBeratKg: 268,
    telurBS: 2,
    pakanKeluarKg: 480,
    pakanKeluarSak: 9.6,
    pakanSisaKg: 10,
    airStatus: 'Bersih',
    vitaminDosisTime: '',
    ayamMati: 0,
    gejalaPenyakit: '',
    suhuPagi: 24.0,
    suhuSiang: 29.5,
    fecesKondisi: 'Normal',
    ambilTelurJam: '',
    pembersihanArea: '',
  });

  const [newVaccine, setNewVaccine] = useState<Omit<VaccinationLog, 'id'>>({
    tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    vaksinName: '',
    dosisMetode: 'Air Minum',
    efekSamping: '',
    targetGroup: 'Seluruh Kandang',
  });

  const [newWeekly, setNewWeekly] = useState<Omit<WeeklyProductionLog, 'id'>>({
    mingguTanggal: '21 Mei - 27 Mei 2026',
    totalTelurButir: 30500,
    totalTelurKg: 1900,
    totalPakanKg: 3420,
    fcr: 1.80,
    cangkangKualitas: 'Kualitas normal',
  });

  const [newMaint, setNewMaint] = useState<Omit<MaintenanceLog, 'id'>>({
    tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    itemKategori: 'Kipas',
    kegiatan: 'Servis',
    biaya: 150000,
  });

  const [newSale, setNewSale] = useState<Omit<FinancialSalesLog, 'id' | 'totalPendapatan'>>({
    tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    volumeKg: 200,
    hargaPerKg: 26000,
    catatanPembeli: '',
  });

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Delete Handlers
  const handleDeleteItem = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data log ini?')) return;
    
    try {
      if (activeTab === 'harian') await deleteDailyLog(id);
      else if (activeTab === 'vaksin') await deleteVaccineLog(id);
      else if (activeTab === 'mingguan') await deleteWeeklyLog(id);
      else if (activeTab === 'perawatan') await deleteMaintLog(id);
      else if (activeTab === 'keuangan') await deleteSalesLog(id);
      
      showToast('Data berhasil dihapus dari pembukuan.');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus data dari Supabase. Silakan coba lagi.');
    }
  };

  // Submit Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `${activeTab}-${Date.now()}`;

    try {
      if (activeTab === 'harian') {
        const log: DetailedDailyLog = { ...newDaily, id, sumber: 'Web' };
        await addDailyLog(log);
        showToast(`Sukses mencatat Lembar Harian tanggal ${newDaily.tanggal}!`);
      } else if (activeTab === 'vaksin') {
        const log: VaccinationLog = { ...newVaccine, id };
        await addVaccineLog(log);
        showToast(`Sukses mencatat vaksin ${newVaccine.vaksinName}!`);
      } else if (activeTab === 'mingguan') {
        // Calculate FCR = Total Pakan / Total Berat Telur
        const calculatedFcr = Number((newWeekly.totalPakanKg / newWeekly.totalTelurKg).toFixed(2));
        const log: WeeklyProductionLog = { ...newWeekly, id, fcr: calculatedFcr };
        await addWeeklyLog(log);
        showToast(`Sukses merekap produksi mingguan FCR: ${calculatedFcr}!`);
      } else if (activeTab === 'perawatan') {
        const log: MaintenanceLog = { ...newMaint, id };
        await addMaintLog(log);
        showToast(`Sukses mendata perawatan ${newMaint.itemKategori}!`);
      } else if (activeTab === 'keuangan') {
        // Calculated revenue
        const rev = newSale.volumeKg * newSale.hargaPerKg;
        const log: FinancialSalesLog = { ...newSale, id, totalPendapatan: rev };
        await addSalesLog(log);
        showToast(`Sukses mencatat penjualan telur Rp ${rev.toLocaleString('id-ID')}!`);
      }
      setIsOpenModal(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data ke Supabase. Silakan periksa koneksi atau input Anda.');
    }
  };

  // Filters & Search
  const filteredDaily = useMemo(() => {
    let list = dailyList;
    if (selectedPeriod === 'today') {
      list = list.slice(0, 1);
    } else if (selectedPeriod === '7days') {
      list = list.slice(0, 7);
    } else if (selectedPeriod === '30days') {
      list = list.slice(0, 30);
    }
    return list.filter(d => d.tanggal.toLowerCase().includes(search.toLowerCase()));
  }, [dailyList, search, selectedPeriod]);

  const filteredVaccine = useMemo(() => {
    let list = vaccineList;
    if (selectedPeriod === 'today') {
      list = list.slice(0, 1);
    } else if (selectedPeriod === '7days') {
      list = list.slice(0, 3);
    } else if (selectedPeriod === '30days') {
      list = list.slice(0, 10);
    }
    return list.filter(v => v.vaksinName.toLowerCase().includes(search.toLowerCase()) || v.tanggal.toLowerCase().includes(search.toLowerCase()));
  }, [vaccineList, search, selectedPeriod]);

  const filteredWeekly = useMemo(() => {
    let list = weeklyList;
    if (selectedPeriod === 'today') {
      list = list.slice(0, 1);
    } else if (selectedPeriod === '7days') {
      list = list.slice(0, 2);
    } else if (selectedPeriod === '30days') {
      list = list.slice(0, 5);
    }
    return list.filter(w => w.mingguTanggal.toLowerCase().includes(search.toLowerCase()));
  }, [weeklyList, search, selectedPeriod]);

  const filteredMaint = useMemo(() => {
    let list = maintList;
    if (selectedPeriod === 'today') {
      list = list.slice(0, 1);
    } else if (selectedPeriod === '7days') {
      list = list.slice(0, 3);
    } else if (selectedPeriod === '30days') {
      list = list.slice(0, 10);
    }
    return list.filter(m => m.itemKategori.toLowerCase().includes(search.toLowerCase()) || m.tanggal.toLowerCase().includes(search.toLowerCase()));
  }, [maintList, search, selectedPeriod]);

  const filteredSales = useMemo(() => {
    let list = salesList;
    if (selectedPeriod === 'today') {
      list = list.slice(0, 1);
    } else if (selectedPeriod === '7days') {
      list = list.slice(0, 4);
    } else if (selectedPeriod === '30days') {
      list = list.slice(0, 15);
    }
    return list.filter(s => s.tanggal.toLowerCase().includes(search.toLowerCase()) || (s.catatanPembeli || '').toLowerCase().includes(search.toLowerCase()));
  }, [salesList, search, selectedPeriod]);

  const handleExport = (format: 'Excel' | 'CSV') => {
    const suffix = format === 'Excel' ? 'xls' : 'csv';
    const baseName = `smartpoultry-${activeTab}-${new Date().toISOString().slice(0, 10)}`;

    if (activeTab === 'harian') {
      const headers = ['Tanggal', 'Telur Butir', 'Telur Berat Kg', 'Telur BS', 'Pakan Kg', 'Pakan Sak', 'Sisa Pakan Kg', 'Air', 'Vitamin', 'Ayam Mati', 'Gejala', 'Suhu Pagi', 'Suhu Siang', 'Feces', 'Jam Ambil Telur', 'Pembersihan', 'Sumber'];
      const rows = filteredDaily.map((row) => [
        row.tanggal,
        row.telurButir,
        row.telurBeratKg,
        row.telurBS,
        row.pakanKeluarKg,
        row.pakanKeluarSak,
        row.pakanSisaKg ?? '',
        row.airStatus,
        row.vitaminDosisTime ?? '',
        row.ayamMati,
        row.gejalaPenyakit ?? '',
        row.suhuPagi,
        row.suhuSiang,
        row.fecesKondisi,
        row.ambilTelurJam ?? '',
        row.pembersihanArea ?? '',
        row.sumber,
      ]);

      if (format === 'CSV') downloadCsvFile(`${baseName}.${suffix}`, headers, rows);
      else downloadExcelFile(`${baseName}.${suffix}`, headers, rows);
    } else if (activeTab === 'vaksin') {
      const headers = ['Tanggal', 'Nama Vaksin', 'Metode', 'Efek Samping', 'Target'];
      const rows = filteredVaccine.map((row) => [row.tanggal, row.vaksinName, row.dosisMetode, row.efekSamping ?? '', row.targetGroup]);

      if (format === 'CSV') downloadCsvFile(`${baseName}.${suffix}`, headers, rows);
      else downloadExcelFile(`${baseName}.${suffix}`, headers, rows);
    } else if (activeTab === 'mingguan') {
      const headers = ['Periode', 'Total Telur Butir', 'Total Telur Kg', 'Total Pakan Kg', 'FCR', 'Kualitas Cangkang'];
      const rows = filteredWeekly.map((row) => [row.mingguTanggal, row.totalTelurButir, row.totalTelurKg, row.totalPakanKg, row.fcr, row.cangkangKualitas]);

      if (format === 'CSV') downloadCsvFile(`${baseName}.${suffix}`, headers, rows);
      else downloadExcelFile(`${baseName}.${suffix}`, headers, rows);
    } else if (activeTab === 'perawatan') {
      const headers = ['Tanggal', 'Kategori', 'Kegiatan', 'Biaya'];
      const rows = filteredMaint.map((row) => [row.tanggal, row.itemKategori, row.kegiatan, row.biaya]);

      if (format === 'CSV') downloadCsvFile(`${baseName}.${suffix}`, headers, rows);
      else downloadExcelFile(`${baseName}.${suffix}`, headers, rows);
    } else {
      const headers = ['Tanggal', 'Volume Kg', 'Harga Per Kg', 'Total Pendapatan', 'Catatan Pembeli'];
      const rows = filteredSales.map((row) => [row.tanggal, row.volumeKg, row.hargaPerKg, row.totalPendapatan, row.catatanPembeli ?? '']);

      if (format === 'CSV') downloadCsvFile(`${baseName}.${suffix}`, headers, rows);
      else downloadExcelFile(`${baseName}.${suffix}`, headers, rows);
    }

    showToast(`Sukses mengekspor ${activeTab.toUpperCase()} log sebagai berkas ${format}.`);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-6 lg:p-8">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={isMobile ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
            transition={isMobile ? { duration: 0 } : { duration: 0.3 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-sm text-white shadow-2xl border border-white/10"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Title */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-warm-earth md:text-2xl">Buku Catatan Digital (Spreadsheet Logs)</h2>
          <p className="text-xs text-slate-500 hidden sm:block">Pusat pencatatan Lembar Harian kandang dan Log Rekap terarah dengan validasi Wajib/Opsional.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Exporter */}
          <div className="inline-flex rounded-xl bg-white p-1 border border-slate-100 shadow-sm shrink-0">
            <button
              onClick={() => handleExport('Excel')}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-[10px] md:text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Excel</span>
            </button>
            <button
              onClick={() => handleExport('CSV')}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-[10px] md:text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">CSV</span>
            </button>
          </div>

          {/* Add Item Trigger - Hidden on Mobile (uses FAB instead) */}
          <button
            onClick={() => setIsOpenModal(true)}
            className="hidden md:flex items-center gap-1.5 rounded-xl bg-primary-gold px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary-gold/20 hover:bg-primary-gold/90 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>
              {activeTab === 'harian' && 'Isi Lembar Harian'}
              {activeTab === 'vaksin' && 'Catat Vaksinasi'}
              {activeTab === 'mingguan' && 'Catat Rekap Mingguan'}
              {activeTab === 'perawatan' && 'Tambah Log Perawatan'}
              {activeTab === 'keuangan' && 'Catat Penjualan Telur'}
            </span>
          </button>
        </div>
      </div>

      {/* Search Bar & View Mode Switcher */}
      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Cari di dalam log ${activeTab === 'harian' ? 'lembar harian' : activeTab}...`}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/60 rounded-xl text-xs text-warm-earth focus:outline-none focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold/50 transition-all"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 shrink-0 self-end md:self-auto">
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-1 px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'card' ? 'bg-white text-primary-gold shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Tampilan Kartu</span>
            </button>
            <button
              onClick={() => setViewMode('spreadsheet')}
              className={`flex items-center gap-1 px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'spreadsheet' ? 'bg-white text-primary-gold shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Tampilan Grid Spreadsheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Spreadsheet Tables Switch Panels (Excel/WPS Workbook Style) */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col">
        {/* Workbook Sheet Tab Bar */}
        <div className="flex items-end overflow-x-auto dashboard-scroll border-b border-slate-200 bg-slate-50 px-3 pt-3 pb-1 select-none">
          {(['harian', 'vaksin', 'mingguan', 'perawatan', 'keuangan'] as LogTab[]).map((tab, idx) => {
            const tabLabels: Record<LogTab, { label: string; icon: any }> = {
              harian: { label: 'Harian_Kandang', icon: Activity },
              vaksin: { label: 'Kesehatan_Vaksin', icon: HeartPulse },
              mingguan: { label: 'Rekap_Mingguan', icon: Egg },
              perawatan: { label: 'Perawatan_Alat', icon: Wrench },
              keuangan: { label: 'Jual_Telur', icon: DollarSign },
            };
            const TabIcon = tabLabels[tab].icon;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSearch(''); }}
                className={`flex items-center gap-1.5 px-4 py-2 text-[10px] md:text-xs font-bold transition-all rounded-t-lg border-t border-r border-l cursor-pointer whitespace-nowrap -mb-[1px] ${
                  isActive
                     ? 'bg-white text-primary-gold border-slate-200 border-t-2 border-t-primary-gold z-10 shadow-sm'
                     : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <TabIcon className="h-3.5 w-3.5" />
                <span>Sheet{idx + 1}: {tabLabels[tab].label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic sheet rendering */}
        {viewMode === 'spreadsheet' ? (
          <div className="overflow-x-auto dashboard-scroll relative rounded-b-3xl">
            {/* Spreadsheet Table Rendering */}
            {activeTab === 'harian' && (
              <table className="w-full min-w-[1400px] text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-2 py-3.5 text-center border-r border-slate-100" style={{ position: 'sticky', left: 0, width: '40px', minWidth: '40px', zIndex: 30, backgroundColor: '#f1f5f9' }}>Row</th>
                    <th className="px-4 py-3.5 border-r border-slate-100" style={{ position: 'sticky', left: '40px', zIndex: 30, backgroundColor: '#f1f5f9' }}>Tanggal</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Produksi Telur (Utuh / Rusak)</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Konsumsi Pakan (Kg / Sak)</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Sisa Pakan</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Air & Vitamin</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Ayam Mati / Gejala</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Suhu (Pagi / Siang)</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Kondisi Feces</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Ambil Jam / Sapu</th>
                    <th className="px-4 py-3.5 text-center border-r border-slate-100">Sumber</th>
                    <th className="px-4 py-3.5 text-center">Aksi</th>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-100/50 text-[9px] font-bold text-slate-400 font-mono">
                    <th className="px-2 py-1 text-center border-r border-slate-100" style={{ position: 'sticky', left: 0, width: '40px', minWidth: '40px', zIndex: 30, backgroundColor: '#f8fafc' }}> </th>
                    <th className="px-4 py-1 border-r border-slate-100" style={{ position: 'sticky', left: '40px', zIndex: 30, backgroundColor: '#f8fafc' }}>A</th>
                    <th className="px-4 py-1 border-r border-slate-100">B</th>
                    <th className="px-4 py-1 border-r border-slate-100">C</th>
                    <th className="px-4 py-1 border-r border-slate-100">D</th>
                    <th className="px-4 py-1 border-r border-slate-100">E</th>
                    <th className="px-4 py-1 border-r border-slate-100">F</th>
                    <th className="px-4 py-1 border-r border-slate-100">G</th>
                    <th className="px-4 py-1 border-r border-slate-100">H</th>
                    <th className="px-4 py-1 border-r border-slate-100">I</th>
                    <th className="px-4 py-1 border-r border-slate-100">J</th>
                    <th className="px-4 py-1">K</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDaily.map((d, rowIndex) => (
                    <tr key={d.id} className="border-b border-slate-100 hover:bg-soft-beige/40 bg-white transition-colors">
                      <td className="whitespace-nowrap px-2 py-3 font-mono text-[10px] text-slate-400 text-center border-r border-slate-100" style={{ position: 'sticky', left: 0, width: '40px', minWidth: '40px', zIndex: 20, backgroundColor: '#f8fafc' }}>
                        {rowIndex + 1}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-warm-earth border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]" style={{ position: 'sticky', left: '40px', zIndex: 10, backgroundColor: '#ffffff' }}>
                        {d.tanggal}
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100">
                        <p className="font-semibold text-slate-800 whitespace-nowrap">{d.telurButir} butir ({d.telurBeratKg} kg)</p>
                        {d.telurBS > 0 && <span className="text-[10px] text-red-500 font-medium whitespace-nowrap">BS: {d.telurBS} butir</span>}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap border-r border-slate-100">
                        {d.pakanKeluarKg} kg <span className="text-slate-400 text-[10px]">({d.pakanKeluarSak} sak)</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap border-r border-slate-100">{d.pakanSisaKg ? `${d.pakanSisaKg} kg` : '-'}</td>
                      <td className="px-4 py-3 border-r border-slate-100">
                        <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          d.airStatus === 'Bersih' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>{d.airStatus}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">{d.vitaminDosisTime || '-'}</p>
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100">
                        {d.ayamMati > 0 ? <span className="font-bold text-red-500">{d.ayamMati} Ekor</span> : <span className="text-slate-400">Sehat</span>}
                        <p className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">{d.gejalaPenyakit || '-'}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600 font-mono border-r border-slate-100">Pagi: {d.suhuPagi}°C / Siang: {d.suhuSiang}°C</td>
                      <td className="px-4 py-3 border-r border-slate-100">
                        <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          d.fecesKondisi === 'Normal' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                        }`}>{d.fecesKondisi}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 border-r border-slate-100">
                        <p className="whitespace-nowrap">Jam: {d.ambilTelurJam || '-'}</p>
                        <p className="text-[10px] text-slate-400 whitespace-nowrap">{d.pembersihanArea || '-'}</p>
                      </td>
                      <td className="px-4 py-3 text-center border-r border-slate-100">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          d.sumber === 'Telegram' ? 'bg-sky-50 text-sky-600' : 'bg-violet-50 text-violet-600'
                        }`}>{d.sumber}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDeleteItem(d.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'vaksin' && (
              <table className="w-full min-w-[1000px] text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-2 py-3.5 text-center border-r border-slate-100" style={{ position: 'sticky', left: 0, width: '40px', minWidth: '40px', zIndex: 30, backgroundColor: '#f1f5f9' }}>Row</th>
                    <th className="px-4 py-3.5 border-r border-slate-100" style={{ position: 'sticky', left: '40px', zIndex: 30, backgroundColor: '#f1f5f9' }}>Tanggal</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Nama Vaksin / Obat</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Dosis & Metode</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Efek Samping Terpantau</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Target Vaksinasi</th>
                    <th className="px-4 py-3.5 text-center">Aksi</th>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-100/50 text-[9px] font-bold text-slate-400 font-mono">
                    <th className="px-2 py-1 text-center border-r border-slate-100" style={{ position: 'sticky', left: 0, width: '40px', minWidth: '40px', zIndex: 30, backgroundColor: '#f8fafc' }}> </th>
                    <th className="px-4 py-1 border-r border-slate-100" style={{ position: 'sticky', left: '40px', zIndex: 30, backgroundColor: '#f8fafc' }}>A</th>
                    <th className="px-4 py-1 border-r border-slate-100">B</th>
                    <th className="px-4 py-1 border-r border-slate-100">C</th>
                    <th className="px-4 py-1 border-r border-slate-100">D</th>
                    <th className="px-4 py-1 border-r border-slate-100">E</th>
                    <th className="px-4 py-1">F</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVaccine.map((v, rowIndex) => (
                    <tr key={v.id} className="border-b border-slate-100 hover:bg-soft-beige/40 bg-white transition-colors">
                      <td className="whitespace-nowrap px-2 py-3 font-mono text-[10px] text-slate-400 text-center border-r border-slate-100" style={{ position: 'sticky', left: 0, width: '40px', minWidth: '40px', zIndex: 20, backgroundColor: '#f8fafc' }}>
                        {rowIndex + 1}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-warm-earth border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]" style={{ position: 'sticky', left: '40px', zIndex: 10, backgroundColor: '#ffffff' }}>
                        {v.tanggal}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 border-r border-slate-100">
                        <div className="flex items-center gap-2">
                          <HeartPulse className="h-4 w-4 text-indigo-500" />
                          <span>{v.vaksinName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 border-r border-slate-100">{v.dosisMetode}</td>
                      <td className="px-4 py-3 text-slate-500 border-r border-slate-100">{v.efekSamping || 'Tidak ada'}</td>
                      <td className="px-4 py-3 font-medium text-slate-700 border-r border-slate-100">{v.targetGroup}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDeleteItem(v.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'mingguan' && (
              <table className="w-full min-w-[1000px] text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-2 py-3.5 text-center border-r border-slate-100" style={{ position: 'sticky', left: 0, width: '40px', minWidth: '40px', zIndex: 30, backgroundColor: '#f1f5f9' }}>Row</th>
                    <th className="px-4 py-3.5 border-r border-slate-100" style={{ position: 'sticky', left: '40px', zIndex: 30, backgroundColor: '#f1f5f9' }}>Periode Mingguan</th>
                    <th className="px-4 py-3.5 text-right border-r border-slate-100">Total Telur (Pcs)</th>
                    <th className="px-4 py-3.5 text-right border-r border-slate-100">Total Telur (Kg)</th>
                    <th className="px-4 py-3.5 text-right border-r border-slate-100">Total Pakan (Kg)</th>
                    <th className="px-4 py-3.5 text-center border-r border-slate-100">Hasil FCR</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Kualitas Cangkang</th>
                    <th className="px-4 py-3.5 text-center">Aksi</th>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-100/50 text-[9px] font-bold text-slate-400 font-mono">
                    <th className="px-2 py-1 text-center border-r border-slate-100" style={{ position: 'sticky', left: 0, width: '40px', minWidth: '40px', zIndex: 30, backgroundColor: '#f8fafc' }}> </th>
                    <th className="px-4 py-1 border-r border-slate-100" style={{ position: 'sticky', left: '40px', zIndex: 30, backgroundColor: '#f8fafc' }}>A</th>
                    <th className="px-4 py-1 border-r border-slate-100">B</th>
                    <th className="px-4 py-1 border-r border-slate-100">C</th>
                    <th className="px-4 py-1 border-r border-slate-100">D</th>
                    <th className="px-4 py-1 border-r border-slate-100">E</th>
                    <th className="px-4 py-1 border-r border-slate-100">F</th>
                    <th className="px-4 py-1">G</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWeekly.map((w, rowIndex) => (
                    <tr key={w.id} className="border-b border-slate-100 hover:bg-soft-beige/40 bg-white transition-colors">
                      <td className="whitespace-nowrap px-2 py-3 font-mono text-[10px] text-slate-400 text-center border-r border-slate-100" style={{ position: 'sticky', left: 0, width: '40px', minWidth: '40px', zIndex: 20, backgroundColor: '#f8fafc' }}>
                        {rowIndex + 1}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-warm-earth border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]" style={{ position: 'sticky', left: '40px', zIndex: 10, backgroundColor: '#ffffff' }}>
                        {w.mingguTanggal}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700 border-r border-slate-100">{w.totalTelurButir.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800 border-r border-slate-100">{w.totalTelurKg.toLocaleString('id-ID')} kg</td>
                      <td className="px-4 py-3 text-right text-slate-600 border-r border-slate-100">{w.totalPakanKg.toLocaleString('id-ID')} kg</td>
                      <td className="px-4 py-3 text-center border-r border-slate-100">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 font-mono font-bold text-xs ${
                          w.fcr <= 1.85 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>{w.fcr}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 border-r border-slate-100">{w.cangkangKualitas}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDeleteItem(w.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'perawatan' && (
              <table className="w-full min-w-[1000px] text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-2 py-3.5 text-center border-r border-slate-100" style={{ position: 'sticky', left: 0, width: '40px', minWidth: '40px', zIndex: 30, backgroundColor: '#f1f5f9' }}>Row</th>
                    <th className="px-4 py-3.5 border-r border-slate-100" style={{ position: 'sticky', left: '40px', zIndex: 30, backgroundColor: '#f1f5f9' }}>Tanggal</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Kategori Alat</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Tipe Kegiatan Perawatan</th>
                    <th className="px-4 py-3.5 border-r border-slate-100 text-right">Biaya Sparepart / Tukang</th>
                    <th className="px-4 py-3.5 text-center">Aksi</th>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-100/50 text-[9px] font-bold text-slate-400 font-mono">
                    <th className="px-2 py-1 text-center border-r border-slate-100" style={{ position: 'sticky', left: 0, width: '40px', minWidth: '40px', zIndex: 30, backgroundColor: '#f8fafc' }}> </th>
                    <th className="px-4 py-1 border-r border-slate-100" style={{ position: 'sticky', left: '40px', zIndex: 30, backgroundColor: '#f8fafc' }}>A</th>
                    <th className="px-4 py-1 border-r border-slate-100">B</th>
                    <th className="px-4 py-1 border-r border-slate-100">C</th>
                    <th className="px-4 py-1 border-r border-slate-100">D</th>
                    <th className="px-4 py-1">E</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaint.map((m, rowIndex) => (
                    <tr key={m.id} className="border-b border-slate-100 hover:bg-soft-beige/40 bg-white transition-colors">
                      <td className="whitespace-nowrap px-2 py-3 font-mono text-[10px] text-slate-400 text-center border-r border-slate-100" style={{ position: 'sticky', left: 0, width: '40px', minWidth: '40px', zIndex: 20, backgroundColor: '#f8fafc' }}>
                        {rowIndex + 1}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-warm-earth border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]" style={{ position: 'sticky', left: '40px', zIndex: 10, backgroundColor: '#ffffff' }}>
                        {m.tanggal}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 border-r border-slate-100">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-amber-500" />
                          <span>{m.itemKategori}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 border-r border-slate-100">{m.kegiatan}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800 border-r border-slate-100">Rp {m.biaya.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDeleteItem(m.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'keuangan' && (
              <table className="w-full min-w-[1000px] text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-2 py-3.5 text-center border-r border-slate-100" style={{ position: 'sticky', left: 0, width: '40px', minWidth: '40px', zIndex: 30, backgroundColor: '#f1f5f9' }}>Row</th>
                    <th className="px-4 py-3.5 border-r border-slate-100" style={{ position: 'sticky', left: '40px', zIndex: 30, backgroundColor: '#f1f5f9' }}>Tanggal</th>
                    <th className="px-4 py-3.5 text-right border-r border-slate-100">Volume Telur Jual (Kg)</th>
                    <th className="px-4 py-3.5 text-right border-r border-slate-100">Harga Jual / Kg</th>
                    <th className="px-4 py-3.5 text-right border-r border-slate-100">Total Pendapatan (Revenue)</th>
                    <th className="px-4 py-3.5 border-r border-slate-100">Catatan Pembeli / Pasar</th>
                    <th className="px-4 py-3.5 text-center">Aksi</th>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-100/50 text-[9px] font-bold text-slate-400 font-mono">
                    <th className="px-2 py-1 text-center border-r border-slate-100" style={{ position: 'sticky', left: 0, width: '40px', minWidth: '40px', zIndex: 30, backgroundColor: '#f8fafc' }}> </th>
                    <th className="px-4 py-1 border-r border-slate-100" style={{ position: 'sticky', left: '40px', zIndex: 30, backgroundColor: '#f8fafc' }}>A</th>
                    <th className="px-4 py-1 border-r border-slate-100">B</th>
                    <th className="px-4 py-1 border-r border-slate-100">C</th>
                    <th className="px-4 py-1 border-r border-slate-100">D</th>
                    <th className="px-4 py-1 border-r border-slate-100">E</th>
                    <th className="px-4 py-1">F</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((s, rowIndex) => (
                    <tr key={s.id} className="border-b border-slate-100 hover:bg-soft-beige/40 bg-white transition-colors">
                      <td className="whitespace-nowrap px-2 py-3 font-mono text-[10px] text-slate-400 text-center border-r border-slate-100" style={{ position: 'sticky', left: 0, width: '40px', minWidth: '40px', zIndex: 20, backgroundColor: '#f8fafc' }}>
                        {rowIndex + 1}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-warm-earth border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]" style={{ position: 'sticky', left: '40px', zIndex: 10, backgroundColor: '#ffffff' }}>
                        {s.tanggal}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700 border-r border-slate-100">{s.volumeKg} kg</td>
                      <td className="px-4 py-3 text-right text-slate-600 border-r border-slate-100">Rp {s.hargaPerKg.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-right font-black text-emerald-600 border-r border-slate-100">Rp {s.totalPendapatan.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-slate-500 border-r border-slate-100">{s.catatanPembeli || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDeleteItem(s.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer">
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          /* Cards view for ultra-clean mobile support (WPS Card View) */
          <div className="grid grid-cols-1 gap-4 p-4 bg-slate-50/50 rounded-b-3xl">
            {activeTab === 'harian' && (
              filteredDaily.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-semibold bg-white rounded-2xl border border-slate-100">
                  Tidak ada data log harian ditemukan.
                </div>
              ) : (
                filteredDaily.map((d, rowIndex) => (
                  <div key={d.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 space-y-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary-gold" />
                    <div className="flex items-start justify-between pl-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">Row {rowIndex + 1}</span>
                        <h4 className="text-sm font-bold text-warm-earth mt-0.5">{d.tanggal}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          d.sumber === 'Telegram' ? 'bg-sky-50 text-sky-600' : 'bg-violet-50 text-violet-600'
                        }`}>{d.sumber}</span>
                        <button onClick={() => handleDeleteItem(d.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pl-1 pt-1.5 border-t border-slate-100 text-xs">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Egg className="h-3.5 w-3.5 text-primary-gold" />
                          <span>Produksi Telur</span>
                        </p>
                        <p className="font-semibold text-slate-800">{d.telurButir} butir <span className="text-[10px] text-slate-500">({d.telurBeratKg} kg)</span></p>
                        {d.telurBS > 0 && <p className="text-[10px] text-red-500 font-medium">BS: {d.telurBS} butir</p>}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Package className="h-3.5 w-3.5 text-amber-600" />
                          <span>Konsumsi Pakan</span>
                        </p>
                        <p className="font-semibold text-slate-800">{d.pakanKeluarKg} kg <span className="text-[10px] text-slate-500">({d.pakanKeluarSak} sak)</span></p>
                        {d.pakanSisaKg > 0 && <p className="text-[10px] text-slate-500">Sisa: {d.pakanSisaKg} kg</p>}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Activity className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Air & Vitamin</span>
                        </p>
                        <p className="font-semibold text-slate-800">
                          Air: <span className={d.airStatus === 'Bersih' ? 'text-emerald-600' : 'text-amber-600'}>{d.airStatus}</span>
                        </p>
                        {d.vitaminDosisTime && <p className="text-[10px] text-slate-500 line-clamp-1">{d.vitaminDosisTime}</p>}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <HeartPulse className="h-3.5 w-3.5 text-red-500" />
                          <span>Mortalitas & Suhu</span>
                        </p>
                        <p className="font-semibold text-slate-800">
                          {d.ayamMati > 0 ? <span className="text-red-500 font-bold">{d.ayamMati} Ekor</span> : 'Sehat'}
                        </p>
                        <p className="text-[10px] text-slate-500">Pagi {d.suhuPagi}°C / Siang {d.suhuSiang}°C</p>
                      </div>
                    </div>
                    {(d.gejalaPenyakit || d.pembersihanArea || d.ambilTelurJam) && (
                      <div className="bg-slate-50 rounded-xl p-2.5 text-[10px] text-slate-600 space-y-1 pl-3 border-l border-slate-200">
                        {d.gejalaPenyakit && <p><strong>Gejala:</strong> {d.gejalaPenyakit}</p>}
                        {d.ambilTelurJam && <p><strong>Ambil Telur:</strong> Jam {d.ambilTelurJam}</p>}
                        {d.pembersihanArea && <p><strong>Pembersihan:</strong> {d.pembersihanArea}</p>}
                      </div>
                    )}
                  </div>
                ))
              )
            )}

            {activeTab === 'vaksin' && (
              filteredVaccine.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-semibold bg-white rounded-2xl border border-slate-100">
                  Tidak ada data log kesehatan ditemukan.
                </div>
              ) : (
                filteredVaccine.map((v, rowIndex) => (
                  <div key={v.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 space-y-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-indigo-500" />
                    <div className="flex items-start justify-between pl-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">Row {rowIndex + 1}</span>
                        <h4 className="text-sm font-bold text-warm-earth mt-0.5 flex items-center gap-1.5">
                          <HeartPulse className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span>{v.vaksinName}</span>
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 font-semibold">{v.tanggal}</span>
                        <button onClick={() => handleDeleteItem(v.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pl-1 pt-1.5 border-t border-slate-100 text-xs text-slate-600">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Dosis & Metode</span>
                        <span className="font-semibold text-slate-800">{v.dosisMetode}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Target Vaksinasi</span>
                        <span className="font-semibold text-slate-700">{v.targetGroup}</span>
                      </div>
                    </div>
                    {v.efekSamping && (
                      <div className="bg-amber-50/50 rounded-xl p-2.5 text-[10px] text-amber-700 pl-3 border-l border-amber-200">
                        <p><strong>Efek Samping:</strong> {v.efekSamping}</p>
                      </div>
                    )}
                  </div>
                ))
              )
            )}

            {activeTab === 'mingguan' && (
              filteredWeekly.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-semibold bg-white rounded-2xl border border-slate-100">
                  Tidak ada data rekap mingguan ditemukan.
                </div>
              ) : (
                filteredWeekly.map((w, rowIndex) => (
                  <div key={w.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 space-y-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-emerald-500" />
                    <div className="flex items-start justify-between pl-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">Row {rowIndex + 1}</span>
                        <h4 className="text-sm font-bold text-warm-earth mt-0.5">{w.mingguTanggal}</h4>
                      </div>
                      <button onClick={() => handleDeleteItem(w.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pl-1 pt-1.5 border-t border-slate-100 text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Hasil FCR</span>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 mt-0.5 font-mono font-bold text-xs ${
                          w.fcr <= 1.85 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>{w.fcr}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Total Telur (Pcs / Kg)</span>
                        <span className="font-bold text-slate-800">{w.totalTelurButir.toLocaleString('id-ID')} butir ({w.totalTelurKg} kg)</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Total Pakan (Kg)</span>
                        <span className="font-semibold text-slate-600">{w.totalPakanKg.toLocaleString('id-ID')} kg</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Kualitas Cangkang</span>
                        <span className="font-medium text-slate-500">{w.cangkangKualitas}</span>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === 'perawatan' && (
              filteredMaint.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-semibold bg-white rounded-2xl border border-slate-100">
                  Tidak ada data log perawatan ditemukan.
                </div>
              ) : (
                filteredMaint.map((m, rowIndex) => (
                  <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 space-y-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-amber-500" />
                    <div className="flex items-start justify-between pl-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">Row {rowIndex + 1}</span>
                        <h4 className="text-sm font-bold text-warm-earth mt-0.5 flex items-center gap-1.5">
                          <Wrench className="h-4 w-4 text-amber-500 shrink-0" />
                          <span>{m.itemKategori}</span>
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 font-semibold">{m.tanggal}</span>
                        <button onClick={() => handleDeleteItem(m.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pl-1 pt-1.5 border-t border-slate-100 text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Tipe Kegiatan</span>
                        <span className="font-semibold text-slate-700">{m.kegiatan}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Biaya Perawatan</span>
                        <span className="font-black text-slate-800">Rp {m.biaya.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === 'keuangan' && (
              filteredSales.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-semibold bg-white rounded-2xl border border-slate-100">
                  Tidak ada data log penjualan ditemukan.
                </div>
              ) : (
                filteredSales.map((s, rowIndex) => (
                  <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 space-y-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-emerald-500" />
                    <div className="flex items-start justify-between pl-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">Row {rowIndex + 1}</span>
                        <h4 className="text-sm font-bold text-warm-earth mt-0.5">{s.tanggal}</h4>
                      </div>
                      <button onClick={() => handleDeleteItem(s.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pl-1 pt-1.5 border-t border-slate-100 text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Total Pendapatan</span>
                        <span className="font-black text-emerald-600 text-sm">Rp {s.totalPendapatan.toLocaleString('id-ID')}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Volume Terjual</span>
                        <span className="font-bold text-slate-800">{s.volumeKg} kg <span className="text-[10px] text-slate-400 font-normal">(@ Rp {s.hargaPerKg}/kg)</span></span>
                      </div>
                    </div>
                    {s.catatanPembeli && (
                      <div className="bg-slate-50 rounded-xl p-2.5 text-[10px] text-slate-600 pl-3 border-l border-slate-200">
                        <p><strong>Catatan/Pasar:</strong> {s.catatanPembeli}</p>
                      </div>
                    )}
                  </div>
                ))
              )
            )}
          </div>
        )}
      </div>

      {/* AI Assistant Context-Aware Alert and Insights Module */}
      <motion.div
        initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={isMobile ? { duration: 0 } : { duration: 0.5 }}
        className="rounded-3xl border border-primary-gold/15 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/10 p-6 shadow-sm space-y-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              isLoadingLogsInsights ? 'bg-slate-100' : 'bg-primary-gold/10'
            }`}>
              {isLoadingLogsInsights ? (
                <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5 text-primary-gold" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-warm-earth">
                  Analisis AI Harian Sesi {new Date().getHours() < 12 ? 'Pagi (07:00 check)' : 'Sore (16:00 rekap)'}
                </h4>
                {logsModel && !isLoadingLogsInsights && (
                  <span className="text-[9px] font-semibold text-primary-gold bg-primary-gold/5 border border-primary-gold/10 px-2 py-0.5 rounded-full inline-block">
                    Dianalisis oleh {logsModel}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Korelasi pembukuan dianalisis secara instan oleh AI Agent.
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchLogsAIInsights(true)}
            disabled={isLoadingLogsInsights}
            className="shrink-0 p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-primary-gold transition-colors cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingLogsInsights ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoadingLogsInsights ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl border border-slate-100 p-4 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {logsInsights?.alerts?.map((alert, idx) => {
              const colors = alertColorMap[alert.type] || alertColorMap.info;
              const IconComp = alertIconMap[alert.type] || Info;
              return (
                <div key={`alert-${idx}`} className={`rounded-2xl border ${colors.border} ${colors.bg} p-4 space-y-1.5`}>
                  <div className="flex items-center gap-2">
                    <IconComp className={`h-4.5 w-4.5 ${colors.icon} shrink-0`} />
                    <h5 className="text-xs font-bold text-warm-earth">{alert.title}</h5>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{alert.detail}</p>
                </div>
              );
            })}
            {logsInsights?.recommendations?.map((rec, idx) => (
              <div key={`rec-${idx}`} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    rec.priority === 'high' ? 'bg-red-500' : rec.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <h5 className="text-xs font-bold text-warm-earth">{rec.title}</h5>
                  <span className={`text-[9px] font-extrabold uppercase ${
                    rec.priority === 'high' ? 'text-red-500' : rec.priority === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {rec.priority === 'high' ? '• Segera' : rec.priority === 'medium' ? '• Sedang' : '• Rendah'}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{rec.detail}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* DYNAMIC SUBMIT LOG MODAL (Wajib vs Opsional Groups) */}
      <AnimatePresence>
        {isOpenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
            {/* Backdrop */}
            <motion.div
              initial={isMobile ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={isMobile ? { opacity: 1 } : { opacity: 0 }}
              transition={isMobile ? { duration: 0 } : { duration: 0.2 }}
              onClick={() => setIsOpenModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Dialog Container */}
            <motion.div
              initial={isMobile ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={isMobile ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
              transition={isMobile ? { duration: 0 } : { duration: 0.3 }}
              className="relative w-full h-full md:h-auto md:max-h-[85vh] md:max-w-2xl overflow-y-auto rounded-none md:rounded-3xl bg-white p-5 md:p-6 shadow-2xl border border-slate-100 flex flex-col"
            >
              {/* Modal Header */}
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-5.5 w-5.5 text-primary-gold" />
                  <div>
                    <h3 className="text-base font-bold text-warm-earth">
                      {activeTab === 'harian' && 'Pengisian Lembar Harian Kandang'}
                      {activeTab === 'vaksin' && 'Catat Log Kesehatan & Vaksin'}
                      {activeTab === 'mingguan' && 'Catat Rekap Produksi Mingguan'}
                      {activeTab === 'perawatan' && 'Input Log Perawatan Sarana'}
                      {activeTab === 'keuangan' && 'Input Log Penjualan Pasar'}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Kolom berlabel <span className="text-red-500 font-bold">Wajib</span> harus diisi demi kalkulasi statistik FCR.</p>
                  </div>
                </div>
                
                <button onClick={() => setIsOpenModal(false)} className="rounded-xl p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* MODAL FORMS SWITCH */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. FORM HARIAN KANDANG */}
                {activeTab === 'harian' && (
                  <div className="space-y-4">
                    {/* General: Tanggal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          Tanggal <span className="text-red-500 font-extrabold text-[10px] bg-red-50 px-1 rounded">Wajib</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newDaily.tanggal}
                          onChange={(e) => setNewDaily({ ...newDaily, tanggal: e.target.value })}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-gold/20 focus:border-primary-gold focus:outline-none"
                          placeholder="Cth: 21 Mei 2026"
                        />
                      </div>
                    </div>

                    {/* Group 1: Produksi (Wajib) */}
                    <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="text-xs font-bold text-warm-earth uppercase tracking-wider flex items-center gap-1.5">
                        <Egg className="h-4 w-4 text-primary-gold" />
                        <span>Blok Produksi Telur</span>
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Telur Butir <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={newDaily.telurButir}
                            onChange={(e) => setNewDaily({ ...newDaily, telurButir: Number(e.target.value) })}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Total Berat Kg <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            min={0}
                            value={newDaily.telurBeratKg}
                            onChange={(e) => setNewDaily({ ...newDaily, telurBeratKg: Number(e.target.value) })}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Telur Rusak/BS <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={newDaily.telurBS}
                            onChange={(e) => setNewDaily({ ...newDaily, telurBS: Number(e.target.value) })}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Group 2: Pakan (Wajib & Opsional) */}
                    <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="text-xs font-bold text-warm-earth uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-amber-600" />
                        <span>Blok Pakan & Logistik</span>
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Keluar Kg <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={newDaily.pakanKeluarKg}
                            onChange={(e) => setNewDaily({ ...newDaily, pakanKeluarKg: Number(e.target.value) })}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Keluar Sak <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            required
                            min={0}
                            value={newDaily.pakanKeluarSak}
                            onChange={(e) => setNewDaily({ ...newDaily, pakanKeluarSak: Number(e.target.value) })}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Pakan Sisa Kg <span className="text-slate-400 text-[8px] bg-slate-100 px-1 rounded ml-1">Opsional</span>
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={newDaily.pakanSisaKg || ''}
                            onChange={(e) => setNewDaily({ ...newDaily, pakanSisaKg: Number(e.target.value) })}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                            placeholder="Cth: 15"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Group 3: Air, Vitamin & Lingkungan */}
                    <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="text-xs font-bold text-warm-earth uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-emerald-500" />
                        <span>Kesehatan & Lingkungan Kandang</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Status Air <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newDaily.airStatus}
                            onChange={(e) => setNewDaily({ ...newDaily, airStatus: e.target.value as 'Bersih' | 'Keruh' })}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                          >
                            <option value="Bersih">Bersih</option>
                            <option value="Keruh">Keruh</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Ayam Mati <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={newDaily.ayamMati}
                            onChange={(e) => setNewDaily({ ...newDaily, ayamMati: Number(e.target.value) })}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Suhu Pagi (°C) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            required
                            value={newDaily.suhuPagi}
                            onChange={(e) => setNewDaily({ ...newDaily, suhuPagi: Number(e.target.value) })}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Suhu Siang (°C) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            required
                            value={newDaily.suhuSiang}
                            onChange={(e) => setNewDaily({ ...newDaily, suhuSiang: Number(e.target.value) })}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Kondisi Kotoran <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newDaily.fecesKondisi}
                            onChange={(e) => setNewDaily({ ...newDaily, fecesKondisi: e.target.value as 'Normal' | 'Basah' })}
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
                          >
                            <option value="Normal">Normal (Kering/Kecoklatan)</option>
                            <option value="Basah">Basah (Indikasi Penyakit/Amonia tinggi)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-semibold">
                            Dosis & Waktu Vitamin <span className="text-slate-400 text-[8px] bg-slate-100 px-1 rounded ml-1">Opsional</span>
                          </label>
                          <input
                            type="text"
                            value={newDaily.vitaminDosisTime}
                            onChange={(e) => setNewDaily({ ...newDaily, vitaminDosisTime: e.target.value })}
                            placeholder="Cth: 10:00 - 5ml/L Vita Stress"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Gejala Penyakit <span className="text-slate-400 text-[8px] bg-slate-100 px-1 rounded ml-1">Opsional</span>
                          </label>
                          <input
                            type="text"
                            value={newDaily.gejalaPenyakit}
                            onChange={(e) => setNewDaily({ ...newDaily, gejalaPenyakit: e.target.value })}
                            placeholder="Cth: Ayam lemas di pojok kandang 1 blok B"
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Group 4: Operasional (Opsional) */}
                    <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="text-xs font-bold text-warm-earth uppercase tracking-wider flex items-center gap-1.5">
                        <Wrench className="h-4 w-4 text-slate-500" />
                        <span>Blok Operasional & Rutinitas Kandang (Opsional)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jam Pengambilan Telur</label>
                          <input
                            type="text"
                            value={newDaily.ambilTelurJam}
                            onChange={(e) => setNewDaily({ ...newDaily, ambilTelurJam: e.target.value })}
                            placeholder="Cth: 09:00, 15:00"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kegiatan Pembersihan Area</label>
                          <input
                            type="text"
                            value={newDaily.pembersihanArea}
                            onChange={(e) => setNewDaily({ ...newDaily, pembersihanArea: e.target.value })}
                            placeholder="Cth: Sapu area pakan & semprot desinfektan"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. FORM KESEHATAN & VAKSINASI */}
                {activeTab === 'vaksin' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                        <input
                          type="text"
                          required
                          value={newVaccine.tanggal}
                          onChange={(e) => setNewVaccine({ ...newVaccine, tanggal: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Vaksin / Obat <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={newVaccine.vaksinName}
                          onChange={(e) => setNewVaccine({ ...newVaccine, vaksinName: e.target.value })}
                          placeholder="Cth: ND-Lasota Clone / Gumboro Active"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dosis & Metode <span className="text-red-500">*</span></label>
                        <select
                          value={newVaccine.dosisMetode}
                          onChange={(e) => setNewVaccine({ ...newVaccine, dosisMetode: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none bg-white"
                        >
                          <option value="Air Minum">Air Minum</option>
                          <option value="Suntik Dada (IM)">Suntik Dada (IM)</option>
                          <option value="Tetes Mata / Hidung">Tetes Mata / Hidung</option>
                          <option value="Suntik Sayap (Puncture)">Suntik Sayap (Puncture)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Kandang / Blok <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={newVaccine.targetGroup}
                          onChange={(e) => setNewVaccine({ ...newVaccine, targetGroup: e.target.value })}
                          placeholder="Cth: Kandang 1 / Blok B saja"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Efek Samping Terpantau <span className="text-slate-400 text-[9px] bg-slate-100 px-1 rounded ml-1">Opsional</span></label>
                      <input
                        type="text"
                        value={newVaccine.efekSamping}
                        onChange={(e) => setNewVaccine({ ...newVaccine, efekSamping: e.target.value })}
                        placeholder="Cth: Beberapa ayam terlihat lesu ringan selama 24 jam"
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 3. FORM REKAP MINGGUAN */}
                {activeTab === 'mingguan' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Periode Minggu</label>
                        <input
                          type="text"
                          required
                          value={newWeekly.mingguTanggal}
                          onChange={(e) => setNewWeekly({ ...newWeekly, mingguTanggal: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kualitas Cangkang Telur <span className="text-slate-400 text-[9px] bg-slate-100 px-1 rounded ml-1">Opsional</span></label>
                        <input
                          type="text"
                          value={newWeekly.cangkangKualitas}
                          onChange={(e) => setNewWeekly({ ...newWeekly, cangkangKualitas: e.target.value })}
                          placeholder="Cth: Kualitas tebal tegap kecoklatan / 5% cangkang retak"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Telur (Butir) <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={newWeekly.totalTelurButir}
                          onChange={(e) => setNewWeekly({ ...newWeekly, totalTelurButir: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Telur (Kg) <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={newWeekly.totalTelurKg}
                          onChange={(e) => setNewWeekly({ ...newWeekly, totalTelurKg: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Pakan (Kg) <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={newWeekly.totalPakanKg}
                          onChange={(e) => setNewWeekly({ ...newWeekly, totalPakanKg: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl bg-primary-gold/5 border border-primary-gold/15 p-3 text-[10px] text-slate-500 leading-normal">
                      <strong className="font-extrabold text-primary-gold">Catatan AI FCR</strong>: Setelah formulir disimpan, sistem akan secara otomatis menghitung Feed Conversion Ratio (FCR) mingguan Anda: <span className="font-bold text-primary-gold">Total Pakan / Total Berat Telur</span>.
                    </div>
                  </div>
                )}

                {/* 4. FORM PERAWATAN ALAT */}
                {activeTab === 'perawatan' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                        <input
                          type="text"
                          required
                          value={newMaint.tanggal}
                          onChange={(e) => setNewMaint({ ...newMaint, tanggal: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori Item Sarana <span className="text-red-500">*</span></label>
                        <select
                          value={newMaint.itemKategori}
                          onChange={(e) => setNewMaint({ ...newMaint, itemKategori: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none bg-white"
                        >
                          <option value="Kipas">Kipas Blower Kandang</option>
                          <option value="Nipple">Nipple System Air Minum</option>
                          <option value="Atap">Konstruksi Atap Kandang</option>
                          <option value="Lampu">Sistem Pencahayaan Lampu</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipe Kegiatan Perawatan <span className="text-red-500">*</span></label>
                        <select
                          value={newMaint.kegiatan}
                          onChange={(e) => setNewMaint({ ...newMaint, kegiatan: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none bg-white"
                        >
                          <option value="Perbaikan">Perbaikan Kerusakan</option>
                          <option value="Servis">Servis Berkala / Perawatan</option>
                          <option value="Pembersihan total">Pembersihan Total Kandang</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Biaya Perawatan (Rupiah) <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={newMaint.biaya}
                          onChange={(e) => setNewMaint({ ...newMaint, biaya: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. FORM FINANCIAL SALES */}
                {activeTab === 'keuangan' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Transaksi</label>
                        <input
                          type="text"
                          required
                          value={newSale.tanggal}
                          onChange={(e) => setNewSale({ ...newSale, tanggal: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Volume Telur Jual (Kg) <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={newSale.volumeKg}
                          onChange={(e) => setNewSale({ ...newSale, volumeKg: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Harga Jual per Kg (Rp) <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={newSale.hargaPerKg}
                          onChange={(e) => setNewSale({ ...newSale, hargaPerKg: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan Pembeli / Pasar <span className="text-slate-400 text-[9px] bg-slate-100 px-1 rounded ml-1">Opsional</span></label>
                        <input
                          type="text"
                          value={newSale.catatanPembeli}
                          onChange={(e) => setNewSale({ ...newSale, catatanPembeli: e.target.value })}
                          placeholder="Cth: Pengepul Cv Makmur Jaya - lunas"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button footer */}
                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpenModal(false)}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary-gold px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-gold/90 transition-colors shadow-md shadow-primary-gold/15 cursor-pointer"
                  >
                    Simpan Catatan
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) for mobile view (WPS Style) */}
      {isMobile && (
        <button
          onClick={() => setIsOpenModal(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-gold text-white shadow-xl shadow-primary-gold/30 hover:bg-primary-gold/90 border-2 border-white cursor-pointer active:scale-95 transition-transform"
          title="Tambah Catatan"
        >
          <Plus className="h-6 w-6 stroke-[3px]" />
        </button>
      )}
    </div>
  );
}
