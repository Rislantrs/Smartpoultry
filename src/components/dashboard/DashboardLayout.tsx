import { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AiChatPanel from './AiChatPanel';
import { Egg } from 'lucide-react';
import { supabase } from '../../lib/supabase';
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
} from './data/mockData';

const DEMO_MODE_KEY = 'sp_demo_mode';
const DEMO_PROFILE_ID = 'demo-user';

// ─── DATE FORMAT & PARSE HELPERS (INDONESIAN <=> ISO) ───

const MONTH_MAP_ID_TO_EN: Record<string, string> = {
  'januari': 'january', 'februari': 'february', 'maret': 'march', 'april': 'april',
  'mei': 'may', 'juni': 'june', 'juli': 'july', 'agustus': 'august',
  'september': 'september', 'oktober': 'october', 'november': 'november', 'desember': 'december'
};

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

function formatDateToIndonesianWithoutYear(dateSrc: string | Date): string {
  const d = new Date(dateSrc);
  if (isNaN(d.getTime())) return String(dateSrc);
  const day = d.getDate();
  const month = MONTHS_ID[d.getMonth()];
  return `${day} ${month}`;
}

function parseIndonesianDateToISO(indStr: string): string {
  if (!indStr) return new Date().toISOString().split('T')[0];
  const cleanStr = indStr.trim().toLowerCase();
  const parts = cleanStr.split(/\s+/);
  
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthNameId = parts[1];
    const year = parseInt(parts[2], 10);
    
    const monthNameEn = MONTH_MAP_ID_TO_EN[monthNameId] || monthNameId;
    const d = new Date(`${monthNameEn} ${day}, ${year}`);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  } else if (parts.length === 2) {
    const day = parseInt(parts[0], 10);
    const monthNameId = parts[1];
    const year = new Date().getFullYear();
    const monthNameEn = MONTH_MAP_ID_TO_EN[monthNameId] || monthNameId;
    const d = new Date(`${monthNameEn} ${day}, ${year}`);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  
  const fallbackDate = new Date(indStr);
  if (!isNaN(fallbackDate.getTime())) {
    return fallbackDate.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

// ─── STATE DB MAPPERS ───

function mapDbDailyToState(db: any): DetailedDailyLog {
  return {
    id: db.id,
    tanggal: formatDateToIndonesian(db.log_date),
    telurButir: db.eggs_qty_pcs,
    telurBeratKg: Number(db.eggs_weight_kg),
    telurBS: db.eggs_damaged_pcs,
    pakanKeluarKg: Number(db.feed_consumed_kg),
    pakanKeluarSak: Number(db.feed_consumed_bags),
    pakanSisaKg: db.feed_remaining_kg ? Number(db.feed_remaining_kg) : undefined,
    airStatus: db.water_status,
    vitaminDosisTime: db.vitamin_dose_time || undefined,
    ayamMati: db.mortality_count,
    gejalaPenyakit: db.health_symptoms || undefined,
    suhuPagi: Number(db.temp_morning_c),
    suhuSiang: Number(db.temp_afternoon_c),
    fecesKondisi: db.feces_condition,
    ambilTelurJam: db.egg_collection_time || undefined,
    pembersihanArea: db.cleaning_schedule || undefined,
    sumber: db.input_source as any,
  };
}

function mapStateDailyToDb(state: DetailedDailyLog, profileId: string): any {
  return {
    profile_id: profileId,
    log_date: parseIndonesianDateToISO(state.tanggal),
    eggs_qty_pcs: state.telurButir,
    eggs_weight_kg: state.telurBeratKg,
    eggs_damaged_pcs: state.telurBS,
    feed_consumed_kg: state.pakanKeluarKg,
    feed_consumed_bags: state.pakanKeluarSak,
    feed_remaining_kg: state.pakanSisaKg ?? null,
    water_status: state.airStatus,
    vitamin_dose_time: state.vitaminDosisTime ?? null,
    mortality_count: state.ayamMati,
    health_symptoms: state.gejalaPenyakit ?? null,
    temp_morning_c: state.suhuPagi,
    temp_afternoon_c: state.suhuSiang,
    feces_condition: state.fecesKondisi,
    egg_collection_time: state.ambilTelurJam ?? null,
    cleaning_schedule: state.pembersihanArea ?? null,
    input_source: state.sumber,
  };
}

function mapDbVaccineToState(db: any): VaccinationLog {
  return {
    id: db.id,
    tanggal: formatDateToIndonesian(db.log_date),
    vaksinName: db.vaccine_name,
    dosisMetode: db.dose_method,
    efekSamping: db.side_effects || undefined,
    targetGroup: db.target_group,
  };
}

function mapStateVaccineToDb(state: VaccinationLog, profileId: string): any {
  return {
    profile_id: profileId,
    log_date: parseIndonesianDateToISO(state.tanggal),
    vaccine_name: state.vaksinName,
    dose_method: state.dosisMetode,
    side_effects: state.efekSamping ?? null,
    target_group: state.targetGroup,
  };
}

function mapDbWeeklyToState(db: any): WeeklyProductionLog {
  const startDate = new Date(db.week_start_date);
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  const startStr = formatDateToIndonesianWithoutYear(startDate);
  const endStr = formatDateToIndonesian(endDate);
  
  return {
    id: db.id,
    mingguTanggal: `${startStr} - ${endStr}`,
    totalTelurButir: db.total_eggs_pcs,
    totalTelurKg: Number(db.total_feed_kg / (db.fcr || 1.8)),
    totalPakanKg: Number(db.total_feed_kg),
    fcr: Number(db.fcr),
    cangkangKualitas: db.shell_quality_notes || 'Kualitas normal',
  };
}

function mapStateWeeklyToDb(state: WeeklyProductionLog, profileId: string): any {
  const firstPart = state.mingguTanggal.split(' - ')[0];
  let parsedDateStr = parseIndonesianDateToISO(firstPart);
  if (!parsedDateStr.includes('-')) {
    const secondPart = state.mingguTanggal.split(' - ')[1];
    const yearMatch = secondPart.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
    parsedDateStr = parseIndonesianDateToISO(`${firstPart} ${year}`);
  }
  return {
    profile_id: profileId,
    week_start_date: parsedDateStr,
    total_eggs_pcs: state.totalTelurButir,
    total_feed_kg: state.totalPakanKg,
    fcr: state.fcr,
    shell_quality_notes: state.cangkangKualitas ?? null,
  };
}

function mapDbMaintToState(db: any): MaintenanceLog {
  return {
    id: db.id,
    tanggal: formatDateToIndonesian(db.log_date),
    itemKategori: db.item_category as any,
    kegiatan: db.activity_details as any,
    biaya: Number(db.cost),
  };
}

function mapStateMaintToDb(state: MaintenanceLog, profileId: string): any {
  return {
    profile_id: profileId,
    log_date: parseIndonesianDateToISO(state.tanggal),
    item_category: state.itemKategori,
    activity_details: state.kegiatan,
    cost: state.biaya,
  };
}

function mapDbSalesToState(db: any): FinancialSalesLog {
  return {
    id: db.id,
    tanggal: formatDateToIndonesian(db.log_date),
    volumeKg: Number(db.volume_sold_kg),
    hargaPerKg: Number(db.price_per_kg),
    totalPendapatan: Number(db.total_revenue),
    catatanPembeli: db.buyer_notes || undefined,
  };
}

function mapStateSalesToDb(state: FinancialSalesLog, profileId: string): any {
  return {
    profile_id: profileId,
    log_date: parseIndonesianDateToISO(state.tanggal),
    volume_sold_kg: state.volumeKg,
    price_per_kg: state.hargaPerKg,
    total_revenue: state.totalPendapatan,
  };
}

// ─── DEMO LOCALSTORAGE HELPERS ───
const getDemoDailyList = (): DetailedDailyLog[] => {
  const val = localStorage.getItem('sp_demo_daily_logs');
  return val ? JSON.parse(val) : detailedDailyLogs;
};
const getDemoVaccineList = (): VaccinationLog[] => {
  const val = localStorage.getItem('sp_demo_vaccination_logs');
  return val ? JSON.parse(val) : vaccinationLogs;
};
const getDemoWeeklyList = (): WeeklyProductionLog[] => {
  const val = localStorage.getItem('sp_demo_weekly_logs');
  return val ? JSON.parse(val) : weeklyProductionLogs;
};
const getDemoMaintList = (): MaintenanceLog[] => {
  const val = localStorage.getItem('sp_demo_maintenance_logs');
  return val ? JSON.parse(val) : maintenanceLogs;
};
const getDemoSalesList = (): FinancialSalesLog[] => {
  const val = localStorage.getItem('sp_demo_sales_logs');
  return val ? JSON.parse(val) : financialSalesLogs;
};
const getDemoProfileData = () => {
  const val = localStorage.getItem('sp_demo_profile_data');
  return val ? JSON.parse(val) : {
    id: DEMO_PROFILE_ID,
    farm_name: 'Kandang Demo Mandiri',
    owner_name: 'demo',
    location: 'Blitar, Jawa Timur',
  };
};
const getDemoCageData = () => {
  const val = localStorage.getItem('sp_demo_cage_data');
  return val ? JSON.parse(val) : {
    strain: 'Lohmann Brown',
    chicken_age_weeks: 24,
    capacity: 4850,
    target_fcr: 2.15,
  };
};

const getDemoInventoryList = (): any[] => {
  const val = localStorage.getItem('sp_demo_inventory_logs');
  if (val) return JSON.parse(val);
  const seedRows = [
    {
      id: 'inv-seed-1',
      profile_id: DEMO_PROFILE_ID,
      item_name: 'Konsentrat Pakan Malindo 8202',
      stock_initial: 52,
      stock_in: 0,
      stock_out: 10,
      stock_final: 42,
      log_date: '2026-05-21',
    },
    {
      id: 'inv-seed-2',
      profile_id: DEMO_PROFILE_ID,
      item_name: 'Telur Ayam Segar (Gudang)',
      stock_initial: 50,
      stock_in: 270,
      stock_out: 0,
      stock_final: 320,
      log_date: '2026-05-20',
    },
    {
      id: 'inv-seed-3',
      profile_id: DEMO_PROFILE_ID,
      item_name: 'Telur Ayam Segar (Gudang)',
      stock_initial: 550,
      stock_in: 0,
      stock_out: 500,
      stock_final: 50,
      log_date: '2026-05-19',
    },
    {
      id: 'inv-seed-4',
      profile_id: DEMO_PROFILE_ID,
      item_name: 'Konsentrat Pakan Malindo 8202',
      stock_initial: 2,
      stock_in: 50,
      stock_out: 0,
      stock_final: 52,
      log_date: '2026-05-18',
    },
    {
      id: 'inv-seed-5',
      profile_id: DEMO_PROFILE_ID,
      item_name: 'Pakan Jadi Jagung Giling CP',
      stock_initial: 0,
      stock_in: 120,
      stock_out: 0,
      stock_final: 120,
      log_date: '2026-05-15',
    },
    {
      id: 'inv-seed-6',
      profile_id: DEMO_PROFILE_ID,
      item_name: 'Vaksin ND-Lasota (Aktif)',
      stock_initial: 0,
      stock_in: 15,
      stock_out: 0,
      stock_final: 15,
      log_date: '2026-05-14',
    },
    {
      id: 'inv-seed-7',
      profile_id: DEMO_PROFILE_ID,
      item_name: 'Multivitamin Vita Stress',
      stock_initial: 0,
      stock_in: 4,
      stock_out: 0,
      stock_final: 4,
      log_date: '2026-05-14',
    }
  ];
  localStorage.setItem('sp_demo_inventory_logs', JSON.stringify(seedRows));
  return seedRows;
};


// ─── COMPONENT DEFINITION ───

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(() => localStorage.getItem(DEMO_MODE_KEY) === '1');

  // Auth & Session States
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Global search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7days' | '30days' | 'month'>('30days');

  // Keep a ref to the current profileId to avoid stale closures in auth subscriptions
  const profileIdRef = useRef<string | null>(null);
  useEffect(() => {
    profileIdRef.current = profileId;
  }, [profileId]);

  // Unified global farm state loaded from Supabase
  const [dailyList, setDailyList] = useState<DetailedDailyLog[]>([]);
  const [vaccineList, setVaccineList] = useState<VaccinationLog[]>([]);
  const [weeklyList, setWeeklyList] = useState<WeeklyProductionLog[]>([]);
  const [maintList, setMaintList] = useState<MaintenanceLog[]>([]);
  const [salesList, setSalesList] = useState<FinancialSalesLog[]>([]);
  const [inventoryList, setInventoryList] = useState<any[]>([]);

  // Live personalization states loaded from DB
  const [profileData, setProfileData] = useState<{ id: string; farm_name: string; owner_name: string; phone_number?: string | null; location?: string | null } | null>(null);
  const [cageData, setCageData] = useState<{ strain: string; chicken_age_weeks: number; capacity: number; target_fcr: number } | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Logout handler
  const handleLogout = useCallback(async () => {
    localStorage.removeItem(DEMO_MODE_KEY);
    localStorage.removeItem('sp_demo_daily_logs');
    localStorage.removeItem('sp_demo_vaccination_logs');
    localStorage.removeItem('sp_demo_weekly_logs');
    localStorage.removeItem('sp_demo_maintenance_logs');
    localStorage.removeItem('sp_demo_sales_logs');
    localStorage.removeItem('sp_demo_inventory_logs');
    await supabase.auth.signOut();
    setIsDemoMode(false);
    setProfileId(null);
    setProfileData(null);
    setCageData(null);
    setDailyList([]);
    setVaccineList([]);
    setWeeklyList([]);
    setMaintList([]);
    setSalesList([]);
    setInventoryList([]);
    navigate('/login');
  }, [navigate]);

  // ── Supabase Auth listener & initial check ──
  useEffect(() => {
    let authSubscription: any = null;

    const checkUser = async () => {
      setIsCheckingAuth(true);
      try {
        const demoModeEnabled = localStorage.getItem(DEMO_MODE_KEY) === '1';

        let session = null;
        try {
          const { data } = await supabase.auth.getSession();
          session = data.session;
        } catch (err) {
          console.warn('Session check failed:', err);
        }

        const isDemoEmail = session?.user?.email === 'demo@smartpoultry.ai';
        const isDemo = demoModeEnabled || isDemoEmail;

        if (isDemo) {
          setIsDemoMode(true);
          setProfileId(DEMO_PROFILE_ID);
          setProfileData(getDemoProfileData());
          setCageData(getDemoCageData());
          setDailyList(getDemoDailyList());
          setVaccineList(getDemoVaccineList());
          setWeeklyList(getDemoWeeklyList());
          setMaintList(getDemoMaintList());
          setSalesList(getDemoSalesList());
          setInventoryList(getDemoInventoryList());
          return;
        }

        // Fallback: If no session, redirect to login
        if (!session) {
          setIsDemoMode(false);
          navigate('/login');
          return;
        }

        // Active Supabase session
        if (session) {
          setProfileId(session.user.id);
          setIsDemoMode(false);

          try {
            // 1. Fetch Profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            // 2. Fetch Cage Specs
            const { data: cages } = await supabase
              .from('cages')
              .select('*')
              .eq('profile_id', session.user.id)
              .limit(1);

            const hasCage = cages && cages.length > 0;

            // Real User: Check if cage config exists
            if (!profile) {
              // Create empty profile as placeholder, but don't create cage to trigger questionnaire
              const emailPrefix = session.user.email ? session.user.email.split('@')[0] : '';
              const rawName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.user_metadata?.owner_name || emailPrefix || 'Peternak Pintar';
              const ownerName = rawName.split(/[\s._-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              const { data: insertedP } = await supabase.from('profiles').insert([{
                id: session.user.id,
                farm_name: `${ownerName} Layer Farm`,
                owner_name: ownerName,
                location: 'Blitar, Jawa Timur',
              }]).select().single();
              setProfileData(insertedP);
              setShowQuestionnaire(true);
            } else if (!hasCage) {
              setProfileData(profile);
              setShowQuestionnaire(true);
            } else {
              setProfileData(profile);
              setCageData(cages[0]);
              setShowQuestionnaire(false);
            }
          } catch (profileErr) {
            console.warn('Gagal memvalidasi profil Supabase:', profileErr);
          }

          // If we are showing questionnaire, wait for submission before loading logs
          const { data: cagesCheck } = await supabase.from('cages').select('*').eq('profile_id', session.user.id).limit(1);
          if (cagesCheck && cagesCheck.length > 0) {
            await loadFarmData(session.user.id);
          }
        }
      } catch (err) {
        console.error('Critical error in checkUser flow:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const demoModeEnabled = localStorage.getItem(DEMO_MODE_KEY) === '1';
      const isDemoEmail = session?.user?.email === 'demo@smartpoultry.ai';
      const isDemo = demoModeEnabled || isDemoEmail;

      if (isDemo) {
        setIsDemoMode(true);
        setProfileId(DEMO_PROFILE_ID);
        setProfileData(getDemoProfileData());
        setCageData(getDemoCageData());
        setDailyList(getDemoDailyList());
        setVaccineList(getDemoVaccineList());
        setWeeklyList(getDemoWeeklyList());
        setMaintList(getDemoMaintList());
        setSalesList(getDemoSalesList());
        setInventoryList(getDemoInventoryList());
        return;
      }

      if (event === 'SIGNED_OUT' || !session) {
        setIsDemoMode(false);
        setProfileId(null);
        setProfileData(null);
        setCageData(null);
        setDailyList([]);
        setVaccineList([]);
        setWeeklyList([]);
        setMaintList([]);
        setSalesList([]);
        setInventoryList([]);
        navigate('/login');
      } else if (event === 'SIGNED_IN' && session) {
        // Prevent redundant loading if session is already active and matches current profileIdRef.current
        // This is critical to avoid race conditions and redundant seeding of dummy data!
        if (profileIdRef.current === session.user.id) {
          return;
        }

        setIsDemoMode(false);
        setProfileId(session.user.id);
        setIsCheckingAuth(true);
        
        try {
          // Fetch and load data
          const { data: cages } = await supabase.from('cages').select('*').eq('profile_id', session.user.id).limit(1);
          if (cages && cages.length > 0) {
            setCageData(cages[0]);
            await loadFarmData(session.user.id);
          }
        } catch (err) {
          console.error('Error during SIGNED_IN auth event processing:', err);
        } finally {
          setIsCheckingAuth(false);
        }
      }
    });

    authSubscription = subscription;

    return () => {
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, [navigate]);

  // ── Load & Seed Data Flow ──
  const loadFarmData = async (uid: string) => {
    try {
      // 1. Fetch Daily logs
      let { data: dailyRows, error: dailyErr } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('profile_id', uid)
        .order('log_date', { ascending: false });

      if (dailyErr) throw dailyErr;

      // Seeding Trigger: If database daily logs are completely empty for this user (e.g. fresh Demo or New User)
      if (!dailyRows || dailyRows.length === 0) {
        console.log('Database kosong untuk pengguna ini. Menjalankan auto-seeding data dummy...');
        
        // Seed Daily Logs
        const seededDaily = detailedDailyLogs.map(log => mapStateDailyToDb(log, uid));
        await supabase.from('daily_logs').insert(seededDaily);

        // Seed Vaccination Logs
        const seededVax = vaccinationLogs.map(log => mapStateVaccineToDb(log, uid));
        await supabase.from('vaccination_logs').insert(seededVax);

        // Seed Weekly Production Logs
        const seededWeekly = weeklyProductionLogs.map(log => mapStateWeeklyToDb(log, uid));
        await supabase.from('weekly_recap_logs').insert(seededWeekly);

        // Seed Maintenance Logs
        const seededMaint = maintenanceLogs.map(log => mapStateMaintToDb(log, uid));
        await supabase.from('maintenance_logs').insert(seededMaint);

        // Seed Financial Sales Logs
        const seededSales = financialSalesLogs.map(log => mapStateSalesToDb(log, uid));
        await supabase.from('financial_sales_logs').insert(seededSales);

        // Reload fresh seeded values
        const reloadDaily = await supabase
          .from('daily_logs')
          .select('*')
          .eq('profile_id', uid)
          .order('log_date', { ascending: false });
        dailyRows = reloadDaily.data || [];
      }

      // Fetch the rest of the tables
      const { data: vaxRows } = await supabase
        .from('vaccination_logs')
        .select('*')
        .eq('profile_id', uid)
        .order('log_date', { ascending: false });

      const { data: weeklyRows } = await supabase
        .from('weekly_recap_logs')
        .select('*')
        .eq('profile_id', uid)
        .order('week_start_date', { ascending: false });

      const { data: maintRows } = await supabase
        .from('maintenance_logs')
        .select('*')
        .eq('profile_id', uid)
        .order('log_date', { ascending: false });

      const { data: salesRows } = await supabase
        .from('financial_sales_logs')
        .select('*')
        .eq('profile_id', uid)
        .order('log_date', { ascending: false });

      let { data: invRows } = await supabase
        .from('inventory_logs')
        .select('*')
        .eq('profile_id', uid)
        .order('log_date', { ascending: false })
        .order('id', { ascending: false });

      // Seeding inventory logs if empty
      if (!invRows || invRows.length === 0) {
        console.log('Database inventory kosong untuk pengguna ini. Menjalankan auto-seeding...');
        const seedRows = [
          {
            profile_id: uid,
            item_name: 'Konsentrat Pakan Malindo 8202',
            stock_initial: 52,
            stock_in: 0,
            stock_out: 10,
            stock_final: 42,
            log_date: '2026-05-21',
          },
          {
            profile_id: uid,
            item_name: 'Telur Ayam Segar (Gudang)',
            stock_initial: 50,
            stock_in: 270,
            stock_out: 0,
            stock_final: 320,
            log_date: '2026-05-20',
          },
          {
            profile_id: uid,
            item_name: 'Telur Ayam Segar (Gudang)',
            stock_initial: 550,
            stock_in: 0,
            stock_out: 500,
            stock_final: 50,
            log_date: '2026-05-19',
          },
          {
            profile_id: uid,
            item_name: 'Konsentrat Pakan Malindo 8202',
            stock_initial: 2,
            stock_in: 50,
            stock_out: 0,
            stock_final: 52,
            log_date: '2026-05-18',
          },
          {
            profile_id: uid,
            item_name: 'Pakan Jadi Jagung Giling CP',
            stock_initial: 0,
            stock_in: 120,
            stock_out: 0,
            stock_final: 120,
            log_date: '2026-05-15',
          },
          {
            profile_id: uid,
            item_name: 'Vaksin ND-Lasota (Aktif)',
            stock_initial: 0,
            stock_in: 15,
            stock_out: 0,
            stock_final: 15,
            log_date: '2026-05-14',
          },
          {
            profile_id: uid,
            item_name: 'Multivitamin Vita Stress',
            stock_initial: 0,
            stock_in: 4,
            stock_out: 0,
            stock_final: 4,
            log_date: '2026-05-14',
          }
        ];
        await supabase.from('inventory_logs').insert(seedRows);
        
        const reloadInv = await supabase
          .from('inventory_logs')
          .select('*')
          .eq('profile_id', uid)
          .order('log_date', { ascending: false })
          .order('id', { ascending: false });
        invRows = reloadInv.data || [];
      }

      // Map rows back to React State structures
      setDailyList((dailyRows || []).map(mapDbDailyToState));
      setVaccineList((vaxRows || []).map(mapDbVaccineToState));
      setWeeklyList((weeklyRows || []).map(mapDbWeeklyToState));
      setMaintList((maintRows || []).map(mapDbMaintToState));
      setSalesList((salesRows || []).map(mapDbSalesToState));
      setInventoryList(invRows || []);

    } catch (err) {
      console.error('Gagal mengambil data farm dari Supabase:', err);
    }
  };

  // ─── REALTIME SUBSCRIPTION — Auto-sync saat Telegram bot insert data ───
  useEffect(() => {
    // Hanya aktifkan realtime untuk user Supabase nyata (bukan demo)
    if (!profileId || profileId === DEMO_PROFILE_ID) return;

    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = () => {
      realtimeChannel = supabase
        .channel(`daily_logs_realtime_${profileId}`)
        .on(
          'postgres_changes',
          {
            event: '*',          // INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'daily_logs',
            filter: `profile_id=eq.${profileId}`,
          },
          async (payload) => {
            console.log('[Realtime] daily_logs change from Telegram/AI:', payload.eventType);

            if (payload.eventType === 'INSERT') {
              const newLog = mapDbDailyToState(payload.new);
              setDailyList(prev => {
                // Hindari duplikat
                const exists = prev.some(d => d.id === newLog.id);
                if (exists) return prev;
                return [newLog, ...prev].sort((a, b) => {
                  // Sort by tanggal descending
                  const da = new Date(payload.new.log_date).getTime();
                  const db2 = new Date((prev.find(p => p.id === b.id) as any)?.log_date || 0).getTime();
                  return db2 - da;
                });
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedLog = mapDbDailyToState(payload.new);
              setDailyList(prev =>
                prev.map(d => d.id === updatedLog.id ? updatedLog : d)
              );
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old?.id;
              if (deletedId) {
                setDailyList(prev => prev.filter(d => d.id !== deletedId));
              }
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[Realtime] Berhasil subscribe ke daily_logs untuk profile:', profileId);
          }
        });
    };

    setupRealtime();

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [profileId]);

  // ─── CRUD PERSISTENCE ACTIONS (SUPABASE <=> STATE SINKING) ───

  const addDailyLog = useCallback(async (log: DetailedDailyLog) => {
    if (profileId === DEMO_PROFILE_ID) {
      setDailyList(prev => {
        const updated = [log, ...prev];
        localStorage.setItem('sp_demo_daily_logs', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    if (!profileId) return;
    const dbRow = mapStateDailyToDb(log, profileId);
    
    const { data, error } = await supabase
      .from('daily_logs')
      .insert([dbRow])
      .select();

    if (error) {
      console.error('Database daily log insert gagal:', error);
      throw error;
    }
    
    // Inject the returned database UUID id into the state
    const insertedLog = { ...log, id: data[0].id };
    setDailyList(prev => [insertedLog, ...prev]);
  }, [profileId]);

  const deleteDailyLog = useCallback(async (id: string) => {
    if (profileId === DEMO_PROFILE_ID) {
      setDailyList(prev => {
        const updated = prev.filter(d => d.id !== id);
        localStorage.setItem('sp_demo_daily_logs', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const { error } = await supabase
      .from('daily_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database daily log delete gagal:', error);
      throw error;
    }

    setDailyList(prev => prev.filter(d => d.id !== id));
  }, [profileId]);

  const addVaccineLog = useCallback(async (log: VaccinationLog) => {
    if (profileId === DEMO_PROFILE_ID) {
      setVaccineList(prev => {
        const updated = [log, ...prev];
        localStorage.setItem('sp_demo_vaccination_logs', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    if (!profileId) return;
    const dbRow = mapStateVaccineToDb(log, profileId);

    const { data, error } = await supabase
      .from('vaccination_logs')
      .insert([dbRow])
      .select();

    if (error) throw error;
    
    const insertedLog = { ...log, id: data[0].id };
    setVaccineList(prev => [insertedLog, ...prev]);
  }, [profileId]);

  const deleteVaccineLog = useCallback(async (id: string) => {
    if (profileId === DEMO_PROFILE_ID) {
      setVaccineList(prev => {
        const updated = prev.filter(v => v.id !== id);
        localStorage.setItem('sp_demo_vaccination_logs', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const { error } = await supabase
      .from('vaccination_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setVaccineList(prev => prev.filter(v => v.id !== id));
  }, [profileId]);

  const addWeeklyLog = useCallback(async (log: WeeklyProductionLog) => {
    if (profileId === DEMO_PROFILE_ID) {
      setWeeklyList(prev => {
        const updated = [log, ...prev];
        localStorage.setItem('sp_demo_weekly_logs', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    if (!profileId) return;
    const dbRow = mapStateWeeklyToDb(log, profileId);

    const { data, error } = await supabase
      .from('weekly_recap_logs')
      .insert([dbRow])
      .select();

    if (error) throw error;
    
    const insertedLog = { ...log, id: data[0].id };
    setWeeklyList(prev => [insertedLog, ...prev]);
  }, [profileId]);

  const deleteWeeklyLog = useCallback(async (id: string) => {
    if (profileId === DEMO_PROFILE_ID) {
      setWeeklyList(prev => {
        const updated = prev.filter(w => w.id !== id);
        localStorage.setItem('sp_demo_weekly_logs', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const { error } = await supabase
      .from('weekly_recap_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setWeeklyList(prev => prev.filter(w => w.id !== id));
  }, [profileId]);

  const addMaintLog = useCallback(async (log: MaintenanceLog) => {
    if (profileId === DEMO_PROFILE_ID) {
      setMaintList(prev => {
        const updated = [log, ...prev];
        localStorage.setItem('sp_demo_maintenance_logs', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    if (!profileId) return;
    const dbRow = mapStateMaintToDb(log, profileId);

    const { data, error } = await supabase
      .from('maintenance_logs')
      .insert([dbRow])
      .select();

    if (error) throw error;
    
    const insertedLog = { ...log, id: data[0].id };
    setMaintList(prev => [insertedLog, ...prev]);
  }, [profileId]);

  const deleteMaintLog = useCallback(async (id: string) => {
    if (profileId === DEMO_PROFILE_ID) {
      setMaintList(prev => {
        const updated = prev.filter(m => m.id !== id);
        localStorage.setItem('sp_demo_maintenance_logs', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const { error } = await supabase
      .from('maintenance_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setMaintList(prev => prev.filter(m => m.id !== id));
  }, [profileId]);

  const addSalesLog = useCallback(async (log: FinancialSalesLog) => {
    if (profileId === DEMO_PROFILE_ID) {
      setSalesList(prev => {
        const updated = [log, ...prev];
        localStorage.setItem('sp_demo_sales_logs', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    if (!profileId) return;
    const dbRow = mapStateSalesToDb(log, profileId);

    const { data, error } = await supabase
      .from('financial_sales_logs')
      .insert([dbRow])
      .select();

    if (error) throw error;
    
    const insertedLog = { ...log, id: data[0].id };
    setSalesList(prev => [insertedLog, ...prev]);
  }, [profileId]);

  const deleteSalesLog = useCallback(async (id: string) => {
    if (profileId === DEMO_PROFILE_ID) {
      setSalesList(prev => {
        const updated = prev.filter(s => s.id !== id);
        localStorage.setItem('sp_demo_sales_logs', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const { error } = await supabase
      .from('financial_sales_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setSalesList(prev => prev.filter(s => s.id !== id));
  }, [profileId]);

  const addInventoryLog = useCallback(async (log: any) => {
    if (profileId === DEMO_PROFILE_ID) {
      setInventoryList(prev => {
        const newLog = {
          ...log,
          id: `inv-${Date.now()}`,
          profile_id: DEMO_PROFILE_ID
        };
        const updated = [newLog, ...prev];
        localStorage.setItem('sp_demo_inventory_logs', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    if (!profileId) return;
    const { data, error } = await supabase
      .from('inventory_logs')
      .insert([{
        profile_id: profileId,
        item_name: log.item_name,
        stock_initial: log.stock_initial,
        stock_in: log.stock_in,
        stock_out: log.stock_out,
        stock_final: log.stock_final,
        log_date: log.log_date || new Date().toISOString().split('T')[0]
      }])
      .select();

    if (error) {
      console.error('Database inventory log insert gagal:', error);
      throw error;
    }

    const insertedLog = data[0];
    setInventoryList(prev => [insertedLog, ...prev]);
  }, [profileId, inventoryList]);

  // Questionnaire States
  const [qStep, setQStep] = useState(1);
  const [qOwnerName, setQOwnerName] = useState('');
  const [qFarmName, setQFarmName] = useState('');
  const [qLocation, setQLocation] = useState('Blitar, Jawa Timur');
  const [qStrain, setQStrain] = useState('Lohmann Brown');
  const [qCapacity, setQCapacity] = useState('5000');
  const [qAge, setQAge] = useState('24');
  const [qFeedingFreq, setQFeedingFreq] = useState('2'); // times a day
  const [qFeedingTimes, setQFeedingTimes] = useState('07:00 & 14:00');
  const [qEggCollectionTimes, setQEggCollectionTimes] = useState('10:00 & 15:00');
  const [isSubmittingQ, setIsSubmittingQ] = useState(false);

  useEffect(() => {
    if (profileData) {
      if (!qOwnerName) setQOwnerName(profileData.owner_name || '');
      if (!qFarmName) setQFarmName(profileData.farm_name || `${profileData.owner_name || 'Peternak'} Farm`);
    }
  }, [profileData]);

  const handleQuestionnaireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    setIsSubmittingQ(true);

    try {
      const locationData = JSON.stringify({
        alamat: qLocation,
        feedingFreq: `${qFeedingFreq}x sehari`,
        feedingTimes: qFeedingTimes,
        eggCollectionTimes: qEggCollectionTimes,
      });

      // 1. Create or Update Profile
      const { data: pData, error: pError } = await supabase
        .from('profiles')
        .upsert([{
          id: profileId,
          farm_name: qFarmName,
          owner_name: qOwnerName,
          phone_number: '',
          location: locationData,
        }])
        .select()
        .single();

      if (pError) throw pError;

      // 2. Create Cage
      const { data: cData, error: cError } = await supabase
        .from('cages')
        .insert([{
          profile_id: profileId,
          strain: qStrain,
          chicken_age_weeks: parseInt(qAge, 10) || 24,
          capacity: parseInt(qCapacity, 10) || 5000,
          target_fcr: 2.15,
        }])
        .select()
        .single();

      if (cError) throw cError;

      // 3. Create Starter Daily Log
      const todayISO = new Date().toISOString().split('T')[0];
      const starterDailyLog = {
        profile_id: profileId,
        log_date: todayISO,
        eggs_qty_pcs: 0,
        eggs_weight_kg: 0,
        eggs_damaged_pcs: 0,
        feed_consumed_kg: 0,
        feed_consumed_bags: 0,
        water_status: 'Bersih' as const,
        mortality_count: 0,
        temp_morning_c: 24,
        temp_afternoon_c: 30,
        feces_condition: 'Normal' as const,
        input_source: 'Web' as const,
      };
      
      await supabase.from('daily_logs').insert([starterDailyLog]);

      setProfileData(pData);
      setCageData(cData);
      setShowQuestionnaire(false);

      // Load logs from Supabase
      await loadFarmData(profileId);
    } catch (err) {
      console.error('Gagal menyimpan kuisioner personalisasi:', err);
      alert('Gagal menyimpan kuisioner. Silakan coba lagi.');
    } finally {
      setIsSubmittingQ(false);
    }
  };

  // Show premium loading skeletal screen while checking auth session or seeding
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-soft-beige flex flex-col items-center justify-center select-none">
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary-gold/10 scale-110 animate-pulse" />
          {/* Spinner border */}
          <div className="absolute inset-0 rounded-full border-4 border-t-primary-gold border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          {/* Egg Icon in the center */}
          <Egg className="w-10 h-10 text-primary-gold animate-bounce" />
        </div>
        <h3 className="text-lg font-bold text-warm-earth tracking-wide">Menghubungkan Database Supabase...</h3>
        <p className="text-xs text-slate-400 font-semibold mt-1">Mempersiapkan data peternakan Anda secara real-time.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f2] font-sans">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 10% 0%, rgba(255, 159, 28, 0.04), transparent 40%),
            radial-gradient(circle at 90% 100%, rgba(255, 193, 7, 0.03), transparent 35%),
            linear-gradient(135deg, #faf8f4 0%, #f5f2ed 100%)
          `,
        }}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        userProfile={profileData}
        onLogout={handleLogout}
      />

      <motion.div
        animate={{
          marginLeft: isMobile ? 0 : (sidebarOpen ? 280 : 80),
        }}
        transition={isMobile ? { duration: 0 } : { duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 flex flex-col min-h-screen lg:ml-70"
      >
        <TopBar
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          userProfile={profileData}
          isDemoMode={isDemoMode}
          onLogout={handleLogout}
          dailyList={dailyList}
          vaccineList={vaccineList}
          weeklyList={weeklyList}
          maintList={maintList}
          salesList={salesList}
          inventoryList={inventoryList}
          cageData={cageData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet context={{
            dailyList,
            addDailyLog,
            deleteDailyLog,
            vaccineList,
            addVaccineLog,
            deleteVaccineLog,
            weeklyList,
            addWeeklyLog,
            deleteWeeklyLog,
            maintList,
            addMaintLog,
            deleteMaintLog,
            salesList,
            addSalesLog,
            deleteSalesLog,
            inventoryList,
            addInventoryLog,
            profileData,
            cageData,
            isDemoMode,
            setProfileData,
            setCageData,
            searchQuery,
            setSearchQuery,
            selectedPeriod,
            setSelectedPeriod,
          }} />
        </main>

        <footer className="px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-xs text-warm-earth/30 font-medium">
            © 2026 SmartPoultry AI — PeternakCerdas. Hak cipta dilindungi.
          </p>
        </footer>
      </motion.div>

      <AiChatPanel
        dailyList={dailyList}
        addDailyLog={addDailyLog}
        vaccineList={vaccineList}
        addVaccineLog={addVaccineLog}
        weeklyList={weeklyList}
        addWeeklyLog={addWeeklyLog}
        maintList={maintList}
        addMaintLog={addMaintLog}
        salesList={salesList}
        addSalesLog={addSalesLog}
        inventoryList={inventoryList}
        addInventoryLog={addInventoryLog}
      />

      {/* ─── PERSONALIZATION QUESTIONNAIRE MODAL OVERLAY ─── */}
      <AnimatePresence>
        {showQuestionnaire && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-warm-earth/40 p-4 backdrop-blur-md select-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-warm-earth/10 bg-white/95 shadow-[0_24px_80px_rgba(28,19,12,0.18)] backdrop-blur-sm"
            >
              <div className="h-2 bg-linear-to-r from-primary-gold via-yolk-accent to-primary-gold" />
              
              <form onSubmit={handleQuestionnaireSubmit} className="p-6 sm:p-8">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-gold/10 text-primary-gold">
                    <Egg className="h-6 w-6 stroke-[2.5px]" />
                  </div>
                  <h2 className="text-2xl font-black text-warm-earth font-sans">Setup Profil Kandang Anda 🐔</h2>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Bantu AI SmartPoultry mengenal kandang Anda untuk analisis presisi & asisten pribadi.
                  </p>
                  
                  {/* Progress Indicator */}
                  <div className="mt-4 flex items-center justify-center gap-1.5">
                    {[1, 2, 3].map((step) => (
                      <span
                        key={step}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          qStep === step ? 'w-8 bg-primary-gold' : 'w-2 bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Step 1: Informasi Peternakan */}
                {qStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nama Pemilik</label>
                      <input
                        type="text"
                        required
                        value={qOwnerName}
                        onChange={(e) => setQOwnerName(e.target.value)}
                        placeholder="Nama Lengkap Anda"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-warm-earth outline-none focus:border-primary-gold focus:bg-white focus:ring-2 focus:ring-primary-gold/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nama Peternakan</label>
                      <input
                        type="text"
                        required
                        value={qFarmName}
                        onChange={(e) => setQFarmName(e.target.value)}
                        placeholder="Contoh: Berkah Layer Farm"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-warm-earth outline-none focus:border-primary-gold focus:bg-white focus:ring-2 focus:ring-primary-gold/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Lokasi Kabupaten/Kota</label>
                      <input
                        type="text"
                        required
                        value={qLocation}
                        onChange={(e) => setQLocation(e.target.value)}
                        placeholder="Contoh: Blitar, Jawa Timur"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-warm-earth outline-none focus:border-primary-gold focus:bg-white focus:ring-2 focus:ring-primary-gold/10 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Spesifikasi Kandang */}
                {qStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Strain / Ras Ayam</label>
                      <select
                        value={qStrain}
                        onChange={(e) => setQStrain(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-warm-earth outline-none focus:border-primary-gold focus:bg-white focus:ring-2 focus:ring-primary-gold/10 transition-all"
                      >
                        <option value="Lohmann Brown">Lohmann Brown (Sangat Populer)</option>
                        <option value="Isa Brown">Isa Brown</option>
                        <option value="Hy-Line Brown">Hy-Line Brown</option>
                        <option value="Dekalb Brown">Dekalb Brown</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Jumlah Ayam (Populasi)</label>
                        <input
                          type="number"
                          required
                          value={qCapacity}
                          onChange={(e) => setQCapacity(e.target.value)}
                          placeholder="Contoh: 5000"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-warm-earth outline-none focus:border-primary-gold focus:bg-white focus:ring-2 focus:ring-primary-gold/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Umur Ayam saat ini (Minggu)</label>
                        <input
                          type="number"
                          required
                          value={qAge}
                          onChange={(e) => setQAge(e.target.value)}
                          placeholder="Contoh: 24"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-warm-earth outline-none focus:border-primary-gold focus:bg-white focus:ring-2 focus:ring-primary-gold/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Alur Kerja Harian (AI Personalization) */}
                {qStep === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Frekuensi Pakan</label>
                        <select
                          value={qFeedingFreq}
                          onChange={(e) => setQFeedingFreq(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-warm-earth outline-none focus:border-primary-gold focus:bg-white focus:ring-2 focus:ring-primary-gold/10 transition-all"
                        >
                          <option value="1">1x Sehari</option>
                          <option value="2">2x Sehari</option>
                          <option value="3">3x Sehari</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Jam Pemberian Pakan</label>
                        <input
                          type="text"
                          required
                          value={qFeedingTimes}
                          onChange={(e) => setQFeedingTimes(e.target.value)}
                          placeholder="Contoh: 07:00 & 14:00"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-warm-earth outline-none focus:border-primary-gold focus:bg-white focus:ring-2 focus:ring-primary-gold/10 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Jam Pengambilan Telur</label>
                      <input
                        type="text"
                        required
                        value={qEggCollectionTimes}
                        onChange={(e) => setQEggCollectionTimes(e.target.value)}
                        placeholder="Contoh: 10:00 & 15:00"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-warm-earth outline-none focus:border-primary-gold focus:bg-white focus:ring-2 focus:ring-primary-gold/10 transition-all"
                      />
                    </div>
                    <div className="rounded-xl border border-primary-gold/10 bg-primary-gold/5 p-3 text-[11px] leading-relaxed text-earth-light/80">
                      💡 <strong>Informasi Asisten AI:</strong> AI SmartPoultry akan mengingat jadwal pakan Anda ini untuk mengirimkan alert pengingat, menganalisis efisiensi serapan FCR di jam terkait, dan mengoptimasi kesehatan kawanan secara cerdas.
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 flex gap-3">
                  {qStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setQStep(qStep - 1)}
                      className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 active:scale-[0.98]"
                    >
                      Kembali
                    </button>
                  )}
                  {qStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setQStep(qStep + 1)}
                      className="flex-1 rounded-2xl bg-warm-earth py-3 text-xs font-bold text-white transition-colors hover:bg-[#251b14] active:scale-[0.98]"
                    >
                      Lanjut
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmittingQ}
                      className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-primary-gold to-yolk-accent py-3 text-xs font-black text-warm-earth shadow-lg shadow-primary-gold/25 transition-all hover:opacity-95 active:scale-[0.98]"
                    >
                      {isSubmittingQ ? 'Menyimpan...' : 'Simpan & Masuk Dashboard'}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
