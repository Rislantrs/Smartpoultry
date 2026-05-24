// ── Mock Data for SmartPoultry Dashboard ──

/** 30-day egg production trend */
export interface ProductionDataPoint {
  tanggal: string;
  telur: number;
}

export const productionTrend: ProductionDataPoint[] = [
  { tanggal: '21 Apr', telur: 4120 },
  { tanggal: '22 Apr', telur: 4085 },
  { tanggal: '23 Apr', telur: 4200 },
  { tanggal: '24 Apr', telur: 4150 },
  { tanggal: '25 Apr', telur: 4180 },
  { tanggal: '26 Apr', telur: 4050 },
  { tanggal: '27 Apr', telur: 4230 },
  { tanggal: '28 Apr', telur: 4260 },
  { tanggal: '29 Apr', telur: 4190 },
  { tanggal: '30 Apr', telur: 4170 },
  { tanggal: '1 Mei', telur: 4300 },
  { tanggal: '2 Mei', telur: 4280 },
  { tanggal: '3 Mei', telur: 4220 },
  { tanggal: '4 Mei', telur: 4350 },
  { tanggal: '5 Mei', telur: 4310 },
  { tanggal: '6 Mei', telur: 4100 },
  { tanggal: '7 Mei', telur: 4250 },
  { tanggal: '8 Mei', telur: 4340 },
  { tanggal: '9 Mei', telur: 4290 },
  { tanggal: '10 Mei', telur: 4370 },
  { tanggal: '11 Mei', telur: 4400 },
  { tanggal: '12 Mei', telur: 4320 },
  { tanggal: '13 Mei', telur: 4360 },
  { tanggal: '14 Mei', telur: 4410 },
  { tanggal: '15 Mei', telur: 4380 },
  { tanggal: '16 Mei', telur: 4200 },
  { tanggal: '17 Mei', telur: 4350 },
  { tanggal: '18 Mei', telur: 4300 },
  { tanggal: '19 Mei', telur: 4420 },
  { tanggal: '20 Mei', telur: 4380 },
];

/** Cost composition (Komposisi Biaya) */
export interface CostSegment {
  name: string;
  value: number;
  color: string;
}

export const costComposition: CostSegment[] = [
  { name: 'Pakan', value: 65, color: '#FF9F1C' },
  { name: 'Tenaga Kerja', value: 15, color: '#3B82F6' },
  { name: 'Obat & Vaksin', value: 12, color: '#10B981' },
  { name: 'Listrik', value: 5, color: '#8B5CF6' },
  { name: 'Lainnya', value: 3, color: '#F59E0B' },
];

/** Recent farm log entries */
export type LogStatus = 'Normal' | 'Perhatian' | 'Kritis';
export type LogSource = 'Telegram' | 'Web' | 'Manual' | 'AI Agent';

export interface LogEntry {
  id: string;
  tanggal: string;
  pakan: number;
  telur: number;
  mortalitas: number;
  status: LogStatus;
  sumber: LogSource;
}

// Keep recentLogs for Overview backward compatibility
export const recentLogs: LogEntry[] = [
  { id: 'log-001', tanggal: '20 Mei 2026', pakan: 485, telur: 4380, mortalitas: 2, status: 'Normal', sumber: 'Telegram' },
  { id: 'log-002', tanggal: '19 Mei 2026', pakan: 490, telur: 4420, mortalitas: 1, status: 'Normal', sumber: 'Web' },
  { id: 'log-003', tanggal: '18 Mei 2026', pakan: 488, telur: 4300, mortalitas: 3, status: 'Perhatian', sumber: 'Telegram' },
  { id: 'log-004', tanggal: '17 Mei 2026', pakan: 492, telur: 4350, mortalitas: 1, status: 'Normal', sumber: 'Manual' },
  { id: 'log-005', tanggal: '16 Mei 2026', pakan: 500, telur: 4200, mortalitas: 5, status: 'Kritis', sumber: 'Telegram' },
  { id: 'log-006', tanggal: '15 Mei 2026', pakan: 486, telur: 4380, mortalitas: 2, status: 'Normal', sumber: 'Web' },
];

/** Overview stat summary */
export interface StatSummary {
  totalPopulasi: number;
  produksiTelur: number;
  feedToEggRatio: number;
  mortalitasHarian: number;
}

export const statSummary: StatSummary = {
  totalPopulasi: 4850,
  produksiTelur: 4380,
  feedToEggRatio: 2.18,
  mortalitasHarian: 0.04,
};


// ==========================================
// ── ENRICHED LOGS DATA STRUCTURES (NEW) ──
// ==========================================

/** A. Enriched Daily Cage Sheet (Lembar Harian Kandang) */
export interface DetailedDailyLog {
  id: string;
  tanggal: string;
  // Produksi (Wajib)
  telurButir: number;
  telurBeratKg: number;
  telurBS: number; // Damaged
  // Pakan (Wajib & Opsional)
  pakanKeluarKg: number;
  pakanKeluarSak: number;
  pakanSisaKg?: number; // Opsional
  // Air & Vitamin (Wajib & Opsional)
  airStatus: 'Bersih' | 'Keruh';
  vitaminDosisTime?: string; // Opsional (cth: "09:00 - 5ml/L Vita Stress")
  // Kesehatan (Wajib & Opsional)
  ayamMati: number;
  gejalaPenyakit?: string; // Opsional
  // Lingkungan (Wajib)
  suhuPagi: number;
  suhuSiang: number;
  fecesKondisi: 'Normal' | 'Basah';
  // Operasional (Opsional)
  ambilTelurJam?: string;
  pembersihanArea?: string;
  // Metadata
  sumber: LogSource;
}

export const detailedDailyLogs: DetailedDailyLog[] = [
  {
    id: 'harian-001',
    tanggal: '20 Mei 2026',
    telurButir: 4380,
    telurBeratKg: 270,
    telurBS: 4,
    pakanKeluarKg: 485,
    pakanKeluarSak: 9.7,
    pakanSisaKg: 15,
    airStatus: 'Bersih',
    vitaminDosisTime: '10:00 - 5g/L VitaStress',
    ayamMati: 2,
    gejalaPenyakit: 'Ayam lemas di pojok kandang 2',
    suhuPagi: 24.5,
    suhuSiang: 30.2,
    fecesKondisi: 'Normal',
    ambilTelurJam: '09:00, 15:00',
    pembersihanArea: 'Sapu & semprot kandang 1-2',
    sumber: 'Telegram',
  },
  {
    id: 'harian-002',
    tanggal: '19 Mei 2026',
    telurButir: 4420,
    telurBeratKg: 275,
    telurBS: 2,
    pakanKeluarKg: 490,
    pakanKeluarSak: 9.8,
    pakanSisaKg: 10,
    airStatus: 'Bersih',
    vitaminDosisTime: '09:00 - 10ml/L B-Complex',
    ayamMati: 1,
    suhuPagi: 23.8,
    suhuSiang: 29.5,
    fecesKondisi: 'Normal',
    ambilTelurJam: '09:15, 14:45',
    pembersihanArea: 'Sapu bersih area pakan',
    sumber: 'Web',
  },
  {
    id: 'harian-003',
    tanggal: '18 Mei 2026',
    telurButir: 4300,
    telurBeratKg: 268,
    telurBS: 8,
    pakanKeluarKg: 488,
    pakanKeluarSak: 9.7,
    pakanSisaKg: 12,
    airStatus: 'Bersih',
    vitaminDosisTime: '08:00 - 5g/L VitaStress',
    ayamMati: 3,
    gejalaPenyakit: 'Napas ngorok di kandang 1 blok B',
    suhuPagi: 24.0,
    suhuSiang: 31.8, // Heat stress!
    fecesKondisi: 'Basah', // correlated!
    ambilTelurJam: '09:00, 15:00',
    pembersihanArea: 'Semprot disinfektan kandang 1',
    sumber: 'Telegram',
  },
];

/** B1. Log Kesehatan & Vaksinasi */
export interface VaccinationLog {
  id: string;
  tanggal: string;
  vaksinName: string;
  dosisMetode: string; // Tetes mata, suntik, air minum
  efekSamping?: string; // Opsional
  targetGroup: string; // Seluruh kandang, blok tertentu
}

export const vaccinationLogs: VaccinationLog[] = [
  { id: 'vaks-01', tanggal: '15 Mei 2026', vaksinName: 'Vaksin ND-Lasota (Gumboro)', dosisMetode: 'Air Minum', efekSamping: 'Beberapa ayam terlihat lesu ringan selama 24 jam', targetGroup: 'Kandang 1 & Kandang 2' },
  { id: 'vaks-02', tanggal: '02 Mei 2026', vaksinName: 'Vaksin Coryza (Inaktif)', dosisMetode: 'Suntik Dada (IM)', efekSamping: 'Bekas suntikan normal, tidak bengkak', targetGroup: 'Kandang 1 (Blok A & B)' },
  { id: 'vaks-03', tanggal: '12 Apr 2026', vaksinName: 'Obat Cacing Piperazine', dosisMetode: 'Air Minum', efekSamping: 'Tidak ada efek samping terpantau', targetGroup: 'Seluruh Kandang' },
];

/** B2. Log Produksi & Kualitas Mingguan */
export interface WeeklyProductionLog {
  id: string;
  mingguTanggal: string;
  totalTelurButir: number;
  totalTelurKg: number;
  totalPakanKg: number;
  fcr: number; // Total Pakan / Total Berat Telur (Wajib calculated)
  cangkangKualitas: string; // Cangkang tipis, retak, normal
}

export const weeklyProductionLogs: WeeklyProductionLog[] = [
  { id: 'wk-01', mingguTanggal: '14 Mei - 20 Mei 2026', totalTelurButir: 30480, totalTelurKg: 1890, totalPakanKg: 3418, fcr: 1.81, cangkangKualitas: 'Kualitas normal, cangkang tebal kecoklatan' },
  { id: 'wk-02', mingguTanggal: '07 Mei - 13 Mei 2026', totalTelurButir: 30120, totalTelurKg: 1850, totalPakanKg: 3450, fcr: 1.86, cangkangKualitas: 'Ditemukan sekitar 2% cangkang tipis di kandang 2' },
  { id: 'wk-03', mingguTanggal: '30 Apr - 06 Mei 2026', totalTelurButir: 29750, totalTelurKg: 1810, totalPakanKg: 3430, fcr: 1.89, cangkangKualitas: 'Ditemukan 5% cangkang tipis / retak (kurang kalsium)' },
];

/** B4. Log Perawatan & Perbaikan */
export interface MaintenanceLog {
  id: string;
  tanggal: string;
  itemKategori: 'Kipas' | 'Nipple' | 'Atap' | 'Lampu';
  kegiatan: 'Perbaikan' | 'Servis' | 'Pembersihan total';
  biaya: number; // Tukang / sparepart
}

export const maintenanceLogs: MaintenanceLog[] = [
  { id: 'maint-01', tanggal: '18 Mei 2026', itemKategori: 'Kipas', kegiatan: 'Servis', biaya: 250000 },
  { id: 'maint-02', tanggal: '10 Mei 2026', itemKategori: 'Nipple', kegiatan: 'Perbaikan', biaya: 120000 },
  { id: 'maint-03', tanggal: '28 Apr 2026', itemKategori: 'Atap', kegiatan: 'Perbaikan', biaya: 450000 },
];

/** B5. Log Keuangan & Pasar */
export interface FinancialSalesLog {
  id: string;
  tanggal: string;
  volumeKg: number;
  hargaPerKg: number;
  totalPendapatan: number; // Volume * Harga (Calculated)
  catatanPembeli?: string; // Komplain/permintaan
}

export const financialSalesLogs: FinancialSalesLog[] = [
  { id: 'sale-01', tanggal: '20 Mei 2026', volumeKg: 250, hargaPerKg: 26500, totalPendapatan: 6625000, catatanPembeli: 'Pengepul Cv Sentosa Mandiri - telur mulus tanpa retak' },
  { id: 'sale-02', tanggal: '18 Mei 2026', volumeKg: 300, hargaPerKg: 26000, totalPendapatan: 7800000, catatanPembeli: 'Cv Makmur Abadi - request pengiriman pagi hari jam 08:00' },
  { id: 'sale-03', tanggal: '15 Mei 2026', volumeKg: 200, hargaPerKg: 26700, totalPendapatan: 5340000, catatanPembeli: 'Pengepul Bp. Slamet - lunas transfer bank' },
];
