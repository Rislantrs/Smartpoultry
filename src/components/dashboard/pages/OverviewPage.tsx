import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Users,
  Egg,
  Scale,
  HeartPulse,
  MoreHorizontal,
  ArrowUpRight,
  AlertCircle,
  Info,
  ShieldCheck,
  Loader2,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import StatCard from '../ui/StatCard';
import {
  type LogStatus,
  type LogSource,
  type DetailedDailyLog,
} from '../data/mockData';

/* ─── Helpers ─────────────────────────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

const statusColor: Record<LogStatus, string> = {
  Normal: 'bg-emerald-50 text-emerald-600',
  Perhatian: 'bg-amber-50 text-amber-600',
  Kritis: 'bg-red-50 text-red-500',
};

const sourceStyle: Record<LogSource, string> = {
  Telegram: 'bg-sky-50 text-sky-600',
  Web: 'bg-violet-50 text-violet-600',
  Manual: 'bg-gray-100 text-gray-500',
  'AI Agent': 'bg-fuchsia-50 text-fuchsia-600',
};

// Real-time Status Evaluator for DetailedDailyLog
const getLogStatus = (log: DetailedDailyLog): LogStatus => {
  if (log.ayamMati > 3 || (log.suhuSiang > 31 && log.fecesKondisi === 'Basah') || log.airStatus === 'Keruh') {
    return 'Kritis';
  }
  if (log.ayamMati > 1 || log.fecesKondisi === 'Basah' || log.telurBS > 4) {
    return 'Perhatian';
  }
  return 'Normal';
};

/* ─── Custom Recharts Tooltip ─────────────────────────── */

interface TooltipPayloadItem {
  value: number;
  payload: { tanggal: string };
}

function ProductionTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-medium text-gray-400">{d.payload.tanggal}</p>
      <p className="mt-1 text-lg font-bold text-warm-earth">
        {d.value.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-400">butir</span>
      </p>
    </div>
  );
}

// Donut center label text is now rendered directly inside PieChart to avoid Recharts label connector line bugs

/* ─── AI Insights Types ──────────────────────────────── */

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

/* ─── Main Page ───────────────────────────────────────── */

export default function OverviewPage() {
  const [showBanner, setShowBanner] = useState(true);
  const greeting = useMemo(getGreeting, []);
  const navigate = useNavigate();

  // ── AI Insights State ──
  const [aiInsights, setAiInsights] = useState<AIInsightsPayload | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightModel, setInsightModel] = useState('');

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Retrieve shared real-time states from parent router context
  const { dailyList, profileData, cageData, vaccineList, maintList } = useOutletContext<{
    dailyList: DetailedDailyLog[];
    profileData: any;
    cageData: any;
    vaccineList: any[];
    maintList: any[];
  }>();

  // Dynamic cost composition calculated based on actual data
  const derivedCostComposition = useMemo(() => {
    // Default fallbacks in case lists are empty
    const defaultPakan = 65;
    const defaultLabor = 15;
    const defaultVaccine = 12;
    const defaultElectricity = 5;
    const defaultMaint = 3;

    if (!dailyList || dailyList.length === 0) {
      return [
        { name: 'Pakan', value: defaultPakan, color: '#FF9F1C' },
        { name: 'Tenaga Kerja', value: defaultLabor, color: '#3B82F6' },
        { name: 'Obat & Vaksin', value: defaultVaccine, color: '#10B981' },
        { name: 'Listrik', value: defaultElectricity, color: '#8B5CF6' },
        { name: 'Lainnya', value: defaultMaint, color: '#F59E0B' },
      ];
    }

    // 1. Pakan (Feed) Cost: total feed consumed in kg * estimated Rp 8.500 / kg
    const totalPakanKg = dailyList.reduce((sum, log) => sum + (log.pakanKeluarKg || 0), 0);
    const feedCost = totalPakanKg > 0 ? totalPakanKg * 8500 : defaultPakan * 100000;

    // 2. Tenaga Kerja (Labor) Cost: daily rate of Rp 150.000 multiplied by days tracked
    const laborCost = dailyList.length * 150000;

    // 3. Obat & Vaksin Cost: number of vaccine logs * Rp 1.500.000
    const vaccineCost = (vaccineList && vaccineList.length > 0)
      ? vaccineList.length * 1500000
      : defaultVaccine * 125000;

    // 4. Listrik Cost: Rp 40.000 per day tracked
    const electricityCost = dailyList.length * 40000;

    // 5. Lainnya / Maintenance Cost: sum of maintenance logs + small baseline
    const maintenanceLogsCost = (maintList || []).reduce((sum, log) => sum + (log.biaya || 0), 0);
    const maintenanceCost = maintenanceLogsCost > 0
      ? maintenanceLogsCost
      : defaultMaint * 125000;

    const totalCost = feedCost + laborCost + vaccineCost + electricityCost + maintenanceCost;

    if (totalCost === 0) {
      return [
        { name: 'Pakan', value: defaultPakan, color: '#FF9F1C' },
        { name: 'Tenaga Kerja', value: defaultLabor, color: '#3B82F6' },
        { name: 'Obat & Vaksin', value: defaultVaccine, color: '#10B981' },
        { name: 'Listrik', value: defaultElectricity, color: '#8B5CF6' },
        { name: 'Lainnya', value: defaultMaint, color: '#F59E0B' },
      ];
    }

    const pakanPct = Math.round((feedCost / totalCost) * 100);
    const laborPct = Math.round((laborCost / totalCost) * 100);
    const vaccinePct = Math.round((vaccineCost / totalCost) * 100);
    const electricityPct = Math.round((electricityCost / totalCost) * 100);

    // Make sure sum is exactly 100% by adjusting 'Lainnya'
    const otherPct = Math.max(1, 100 - (pakanPct + laborPct + vaccinePct + electricityPct));

    return [
      { name: 'Pakan', value: pakanPct, color: '#FF9F1C' },
      { name: 'Tenaga Kerja', value: laborPct, color: '#3B82F6' },
      { name: 'Obat & Vaksin', value: vaccinePct, color: '#10B981' },
      { name: 'Listrik', value: electricityPct, color: '#8B5CF6' },
      { name: 'Lainnya', value: otherPct, color: '#F59E0B' },
    ];
  }, [dailyList, vaccineList, maintList]);

  const derivedProductionTrend = useMemo(() => {
    const sorted = [...dailyList].slice(0, 30).reverse();
    return sorted.map(l => {
      const label = l.tanggal.replace(/\s\d{4}$/, '');
      return {
        tanggal: label,
        telur: l.telurButir,
      };
    });
  }, [dailyList]);

const cleanMarkdown = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .trim();
};

  // ── Fetch AI Insights ─────────────────────────────────
  const fetchAIInsights = useCallback(async (forceRefresh?: boolean) => {
    setIsLoadingInsights(true);
    try {
      const cacheKey = 'sp_insights_cache';
      const fetchTimeKey = 'sp_insights_last_fetch';
      const logCountKey = 'sp_insights_log_count';
      const modelKey = 'sp_insights_model';

      const cachedData = localStorage.getItem(cacheKey);
      const lastFetch = localStorage.getItem(fetchTimeKey);
      const cachedLogCount = localStorage.getItem(logCountKey);
      const cachedModel = localStorage.getItem(modelKey) || '';

      const now = Date.now();
      const twelveHours = 12 * 60 * 60 * 1000;
      const parsedLogCount = cachedLogCount ? parseInt(cachedLogCount, 10) : -1;

      if (
        !forceRefresh &&
        cachedData &&
        lastFetch &&
        parsedLogCount === dailyList.length &&
        (now - parseInt(lastFetch, 10)) < twelveHours
      ) {
        setAiInsights(JSON.parse(cachedData) as AIInsightsPayload);
        setInsightModel(cachedModel);
        setIsLoadingInsights(false);
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
          message: 'Berikan insight dan alert real-time berdasarkan data kandang terkini.',
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

        setAiInsights(cleanedPayload);
        setInsightModel(data.modelUsed || '');

        localStorage.setItem(cacheKey, JSON.stringify(cleanedPayload));
        localStorage.setItem(fetchTimeKey, now.toString());
        localStorage.setItem(logCountKey, dailyList.length.toString());
        localStorage.setItem(modelKey, data.modelUsed || '');
      }
    } catch (err) {
      console.warn('AI Overview Insights gagal:', err);
      // Fallback lokal berdasarkan data aktual
      const log = dailyList[0];
      const isHeatStress = log && log.suhuSiang > 31 && log.fecesKondisi === 'Basah';
      const hasMortality = log && log.ayamMati > 1;
      const fallbackPayload: AIInsightsPayload = {
        summary: `Kondisi kandang terpantau ${isHeatStress ? 'KRITIS' : 'normal'} hari ini.`,
        alerts: [
          {
            type: isHeatStress ? 'danger' : hasMortality ? 'warning' : 'success',
            title: isHeatStress ? 'Deteksi Heat Stress & FCR Naik' : hasMortality ? 'Mortalitas Perlu Dipantau' : 'Kondisi Kandang Normal',
            detail: log
              ? `Log harian mencatat pada ${log.tanggal}, suhu siang ${log.suhuSiang}°C dengan feces ${log.fecesKondisi}. ${
                  isHeatStress
                    ? 'Kondisi stres panas terdeteksi, disarankan penambahan blower atau pemberian elektrolit VitaStress di siang hari.'
                    : hasMortality
                      ? `Mortalitas ${log.ayamMati} ekor tercatat. Pantau kesehatan kawanan dan lakukan pengecekan rutin.`
                      : 'Produksi berjalan normal. Pertahankan jadwal pemberian pakan dan pemantauan feces.'
                }`
              : 'Data kandang belum tersedia. Mulai catat log harian untuk mendapatkan analisis AI yang akurat.'
          }
        ],
        recommendations: [
          {
            priority: isHeatStress ? 'high' : 'medium',
            title: isHeatStress ? 'Aktifkan Blower Tambahan Segera' : 'Pantau Kondisi Pakan Harian',
            detail: isHeatStress
              ? `Suhu siang ${log?.suhuSiang}°C melebihi ambang aman 30°C. Aktifkan blower kandang, tambahkan 5g/L VitaStress pada air minum siang hari untuk mencegah penurunan produksi lebih lanjut.`
              : 'Pastikan konsumsi pakan harian per ayam berada di kisaran 100-105 gram untuk menjaga FCR optimal di bawah 2.20.'
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

      setAiInsights(cleanedFallback);
      setInsightModel('local-fallback');

      localStorage.setItem('sp_insights_cache', JSON.stringify(cleanedFallback));
      localStorage.setItem('sp_insights_last_fetch', Date.now().toString());
      localStorage.setItem('sp_insights_log_count', dailyList.length.toString());
      localStorage.setItem('sp_insights_model', 'local-fallback');
    } finally {
      setIsLoadingInsights(false);
    }
  }, [dailyList]);

  // Auto-fetch AI insights on mount (once)
  useEffect(() => {
    fetchAIInsights();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dynamic calculations based on current dynamic data logs
  const basePopulasi = cageData?.capacity || 4850;
  
  const latestLog = useMemo(() => {
    return dailyList[0] || {
      telurButir: 4380,
      telurBeratKg: 270,
      telurBS: 4,
      pakanKeluarKg: 485,
      pakanKeluarSak: 9.7,
      pakanSisaKg: 15,
      airStatus: 'Bersih' as const,
      ayamMati: 2,
      suhuPagi: 24.5,
      suhuSiang: 30.2,
      fecesKondisi: 'Normal' as const,
      sumber: 'Telegram' as LogSource,
      tanggal: '20 Mei 2026',
    };
  }, [dailyList]);

  const prevLog = useMemo(() => {
    return dailyList[1] || {
      telurButir: 4420,
      telurBeratKg: 275,
      telurBS: 2,
      pakanKeluarKg: 490,
      pakanKeluarSak: 9.8,
      pakanSisaKg: 10,
      airStatus: 'Bersih' as const,
      ayamMati: 1,
      suhuPagi: 23.8,
      suhuSiang: 29.5,
      fecesKondisi: 'Normal' as const,
      sumber: 'Web' as LogSource,
      tanggal: '19 Mei 2026',
    };
  }, [dailyList]);

  // computed cards metrics
  const productionValue = latestLog.telurButir;
  const productionChange = prevLog.telurButir 
    ? Number((((productionValue - prevLog.telurButir) / prevLog.telurButir) * 100).toFixed(1)) 
    : 0;

  // FCR = Pakan Diberikan (Kg) / Total Berat Telur (Kg)
  const fcrValue = latestLog.telurBeratKg 
    ? Number((latestLog.pakanKeluarKg / latestLog.telurBeratKg).toFixed(2)) 
    : 1.80;
  const prevFcrValue = prevLog.telurBeratKg 
    ? Number((prevLog.pakanKeluarKg / prevLog.telurBeratKg).toFixed(2)) 
    : 1.78;
  const fcrChange = prevFcrValue 
    ? Number((((fcrValue - prevFcrValue) / prevFcrValue) * 100).toFixed(1)) 
    : 0;

  // Mortality = (ayamMati / basePopulasi) * 100
  const mortalityRate = Number(((latestLog.ayamMati / basePopulasi) * 100).toFixed(2));
  const prevMortalityRate = Number(((prevLog.ayamMati / basePopulasi) * 100).toFixed(2));
  const mortalityChange = Number((mortalityRate - prevMortalityRate).toFixed(2));

  // Dynamic population change rate based on today's mortality rate relative to total population
  const populasiChange = -Number(((latestLog.ayamMati / basePopulasi) * 100).toFixed(2));

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-6 lg:p-8">
      {/* ── Section 1 · AI Analyst Banner ── */}
      {showBanner && (
        <motion.div
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
          transition={isMobile ? { duration: 0 } : { duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-primary-gold/20 p-5 md:p-6"
          style={{
            background:
              'linear-gradient(135deg, #FFF8EC 0%, #FFFDF8 50%, #FFF4E0 100%)',
          }}
        >
          {/* decorative circle */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-gold/[0.06] blur-2xl" />

          <div className="flex items-start gap-4">
            {/* AI avatar */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-gold to-yolk-accent shadow-md shadow-primary-gold/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-warm-earth">
                {greeting}, Peternak Cerdas! 🐔
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-earth-light/80">
                Produksi telur hari ini tercatat{' '}
                <span className="font-semibold text-warm-earth">{productionValue.toLocaleString('id-ID')} butir</span> ({latestLog.telurBeratKg} kg). Feed-to-egg ratio saat ini berkisar{' '}
                <span className="font-semibold text-primary-gold">{fcrValue}</span> —
                efisiensi pakan Anda terpantau {fcrValue <= 1.85 ? 'sangat efisien' : 'stabil'}. Status feces kotoran {latestLog.fecesKondisi === 'Basah' ? 'Basah (pantau suhu!)' : 'Normal'} dengan suhu siang max {latestLog.suhuSiang}°C.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowBanner(false)}
              className="shrink-0 rounded-xl p-1.5 text-warm-earth/40 transition-colors hover:bg-warm-earth/5 hover:text-warm-earth/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Section 2 · Stat Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Populasi"
          value={basePopulasi.toLocaleString('id-ID')}
          subtitle="ekor"
          change={populasiChange}
          changeLabel="vs mortalitas hari ini"
          icon={<Users />}
          accentColor="#3B82F6"
          index={0}
        />
        <StatCard
          title="Produksi Telur"
          value={productionValue.toLocaleString('id-ID')}
          subtitle="butir hari ini"
          change={productionChange}
          changeLabel="vs kemarin"
          icon={<Egg />}
          accentColor="#FF9F1C"
          index={1}
        />
        <StatCard
          title="Feed-to-Egg Ratio"
          value={fcrValue.toFixed(2)}
          subtitle="kg pakan/kg telur"
          change={fcrChange}
          changeLabel="vs kemarin"
          icon={<Scale />}
          accentColor="#10B981"
          invertChange
          index={2}
        />
        <StatCard
          title="Mortalitas Harian"
          value={`${mortalityRate}%`}
          subtitle={`mati: ${latestLog.ayamMati} ekor`}
          change={mortalityChange}
          changeLabel="selisih rate"
          icon={<HeartPulse />}
          accentColor="#EF4444"
          invertChange
          index={3}
        />
      </div>

      {/* ── Section 3 · Charts ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Left — Production Trend */}
        <motion.div
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={isMobile ? { duration: 0 } : { duration: 0.5, delay: 0.5 }}
          className="col-span-1 overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-3"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-warm-earth">
                Tren Produksi
              </h3>
              <p className="text-xs text-gray-400">30 hari terakhir</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard/analytics')}
              className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="h-72 w-full min-w-0">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                <AreaChart
                  data={derivedProductionTrend}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF9F1C" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#FF9F1C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="tanggal"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    domain={['dataMin - 100', 'dataMax + 100']}
                    tickFormatter={(v: number) => v.toLocaleString('id-ID')}
                  />
                  <Tooltip content={<ProductionTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="telur"
                    stroke="#FF9F1C"
                    strokeWidth={2.5}
                    fill="url(#goldGrad)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      strokeWidth: 2,
                      stroke: '#fff',
                      fill: '#FF9F1C',
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Right — Cost Composition Donut */}
        <motion.div
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={isMobile ? { duration: 0 } : { duration: 0.5, delay: 0.6 }}
          className="col-span-1 overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2"
        >
          <div className="mb-2">
            <h3 className="text-base font-semibold text-warm-earth">
              Komposisi Biaya
            </h3>
            <p className="text-xs text-gray-400">Persentase pengeluaran</p>
          </div>

          <div className="flex h-52 min-w-0 items-center justify-center">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
                <PieChart>
                  <Pie
                    data={derivedCostComposition}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                    label={false}
                  >
                    {derivedCostComposition.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  {/* Center text rendered cleanly and reliably without extra dummy Pie to avoid Recharts label line bugs */}
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan x="50%" dy="-4" className="fill-warm-earth text-2xl font-bold font-sans">
                      5
                    </tspan>
                    <tspan x="50%" dy="18" className="fill-gray-400 text-[10px] uppercase font-bold tracking-wider font-sans">
                      Kategori
                    </tspan>
                  </text>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend */}
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
            {derivedCostComposition.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="truncate text-gray-500">{s.name}</span>
                <span className="ml-auto font-semibold text-warm-earth">
                  {s.value}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Section 4 · AI Real-time Smart Insights & Alerts ── */}
      <motion.div
        initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={isMobile ? { duration: 0 } : { duration: 0.5, delay: 0.65 }}
        className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5 space-y-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              isLoadingInsights ? 'bg-slate-100' : 'bg-primary-gold/10'
            }`}>
              {isLoadingInsights
                ? <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                : <Sparkles className="h-4 w-4 text-primary-gold" />
              }
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-warm-earth">AI Real-time Smart Insights & Alerts</h3>
                {insightModel && !isLoadingInsights && (
                  <span className="text-[9px] font-semibold text-primary-gold bg-primary-gold/5 border border-primary-gold/10 px-2 py-0.5 rounded-full inline-block">
                    Dianalisis oleh {insightModel}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Korelasi pembukuan dianalisis secara instan oleh AI Agent.
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchAIInsights(true)}
            disabled={isLoadingInsights}
            className="shrink-0 p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-primary-gold transition-colors cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingInsights ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoadingInsights ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl border border-slate-100 p-4 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiInsights?.alerts?.map((alert, idx) => {
              const colors = alertColorMap[alert.type] || alertColorMap.info;
              const IconComp = alertIconMap[alert.type] || Info;
              return (
                <div key={idx} className={`rounded-2xl border ${colors.border} ${colors.bg} p-4 space-y-1.5`}>
                  <div className="flex items-center gap-2">
                    <IconComp className={`h-4 w-4 ${colors.icon} shrink-0`} />
                    <h5 className="text-xs font-bold text-warm-earth">{alert.title}</h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{alert.detail}</p>
                </div>
              );
            })}
            {aiInsights?.recommendations?.map((rec, idx) => (
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
                <p className="text-xs text-slate-600 leading-relaxed">{rec.detail}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Section 5 · Recent Logs ── */}
      <motion.div
        initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={isMobile ? { duration: 0 } : { duration: 0.5, delay: 0.75 }}
        className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-warm-earth">
              Pencatatan Lembar Harian Terakhir
            </h3>
            <p className="text-xs text-gray-400">
              Log harian kandang terintegrasi dari input manual web, bot Telegram, maupun AI Agent.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard/logs')}
            className="inline-flex items-center gap-1 rounded-full bg-soft-beige px-4 py-1.5 text-xs font-semibold text-primary-gold transition-colors hover:bg-primary-gold/10 cursor-pointer"
          >
            Buka Spreadsheet Logs
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-xs font-medium uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3 text-right">Pakan Diberikan</th>
                <th className="px-6 py-3 text-right">Hasil Telur (Butir)</th>
                <th className="px-6 py-3 text-right">Mortalitas</th>
                <th className="px-6 py-3 text-center">Feces & Suhu Siang</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Sumber</th>
              </tr>
            </thead>
            <tbody>
              {dailyList.slice(0, 6).map((log, i) => {
                const calculatedStatus = getLogStatus(log);
                return (
                  <tr
                    key={log.id}
                    className={`border-b border-gray-50 transition-colors last:border-0 hover:bg-soft-beige/60 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <td className="whitespace-nowrap px-6 py-3 font-semibold text-warm-earth">
                      {log.tanggal}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-600 font-medium">
                      {log.pakanKeluarKg.toLocaleString('id-ID')} kg <span className="text-[10px] text-gray-400">({log.pakanKeluarSak} sak)</span>
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-warm-earth">
                      {log.telurButir.toLocaleString('id-ID')} btr <span className="text-[10px] text-gray-400">({log.telurBeratKg} kg)</span>
                    </td>
                    <td className="px-6 py-3 text-right text-slate-700 font-medium">
                      {log.ayamMati > 0 ? (
                        <span className="text-red-500 font-bold">{log.ayamMati} ekor</span>
                      ) : (
                        <span className="text-emerald-500">Sehat 🐔</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center text-xs text-gray-600">
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold mr-1.5 ${
                        log.fecesKondisi === 'Normal' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                      }`}>{log.fecesKondisi}</span>
                      <span className="font-mono text-slate-500">{log.suhuSiang}°C</span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          statusColor[calculatedStatus]
                        }`}
                      >
                        {calculatedStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          sourceStyle[log.sumber]
                        }`}
                      >
                        {log.sumber}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
