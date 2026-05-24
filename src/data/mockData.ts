import type {
  DashboardStats,
  ProductionTrend,
  CostBreakdown,
  RecentLog,
  AiInsight,
  HealthOverview,
  InventoryAlert,
} from '../types/database';

// ─── Dashboard Stats ────────────────────────────────────────────────
// 5000 layer hens, ~88% hen-day production rate
// Daily eggs: ~4400 butir (~275 kg)
// Daily feed: ~575 kg (115g per hen)
// Feed-to-egg ratio: 575 / 275 ≈ 2.09

export const dashboardStats: DashboardStats = {
  totalPopulation: 4962,
  populationChange: -0.8,
  todayEggProduction: 4387,
  eggProductionChange: 2.3,
  feedToEggRatio: 2.14,
  ratioChange: -1.2,
  dailyMortality: 3,
  mortalityChange: -15.0,
};

// ─── Production Trends (30 hari terakhir) ───────────────────────────
// Realistic fluctuation: eggs 4100-4550, feed 550-600 kg

function generateProductionTrends(): ProductionTrend[] {
  const data: ProductionTrend[] = [];
  const baseDate = new Date(2026, 4, 21); // 21 Mei 2026

  for (let i = 29; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);

    // Egg production: 85-92% of 5000 = 4250-4600
    const henDayRate = 0.85 + Math.random() * 0.07;
    const population = 5000 - Math.floor(i * 1.3); // gradual population decline
    const eggs = Math.round(population * henDayRate);

    // Feed: 110-120g per hen = 550-600 kg for 5000 hens
    const feedPerHen = 0.110 + Math.random() * 0.010; // kg
    const feed = Math.round(population * feedPerHen);

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    data.push({
      date: `${date.getFullYear()}-${month}-${day}`,
      eggs,
      feed,
    });
  }

  return data;
}

export const productionTrends: ProductionTrend[] = generateProductionTrends();

// ─── Komposisi Biaya (Cost Breakdown) ───────────────────────────────
// Typical Indonesian layer farm cost structure

export const costBreakdown: CostBreakdown[] = [
  { name: 'Pakan', value: 65, color: '#FF9F1C' },
  { name: 'Obat & Vitamin', value: 12, color: '#FFC107' },
  { name: 'Tenaga Kerja', value: 15, color: '#D35400' },
  { name: 'Listrik & Air', value: 5, color: '#2C1E11' },
  { name: 'Lainnya', value: 3, color: '#3E2723' },
];

// ─── Log Pencatatan Terakhir (Recent Logs) ──────────────────────────

export const recentLogs: RecentLog[] = [
  {
    id: 'log-001',
    date: '2026-05-21',
    feed_kg: 572,
    eggs: 4387,
    mortality: 3,
    status: 'normal',
    source: 'telegram',
  },
  {
    id: 'log-002',
    date: '2026-05-20',
    feed_kg: 580,
    eggs: 4412,
    mortality: 2,
    status: 'normal',
    source: 'web',
  },
  {
    id: 'log-003',
    date: '2026-05-19',
    feed_kg: 568,
    eggs: 4298,
    mortality: 5,
    status: 'warning',
    source: 'telegram',
  },
  {
    id: 'log-004',
    date: '2026-05-18',
    feed_kg: 575,
    eggs: 4350,
    mortality: 2,
    status: 'normal',
    source: 'manual',
  },
  {
    id: 'log-005',
    date: '2026-05-17',
    feed_kg: 590,
    eggs: 4180,
    mortality: 8,
    status: 'critical',
    source: 'telegram',
  },
  {
    id: 'log-006',
    date: '2026-05-16',
    feed_kg: 578,
    eggs: 4425,
    mortality: 1,
    status: 'normal',
    source: 'web',
  },
  {
    id: 'log-007',
    date: '2026-05-15',
    feed_kg: 585,
    eggs: 4390,
    mortality: 3,
    status: 'normal',
    source: 'telegram',
  },
  {
    id: 'log-008',
    date: '2026-05-14',
    feed_kg: 570,
    eggs: 4445,
    mortality: 2,
    status: 'normal',
    source: 'manual',
  },
];

// ─── AI Insights (dalam bahasa Indonesia kasual) ────────────────────

export const aiInsights: AiInsight[] = [
  {
    id: 'ai-001',
    message:
      'Produksi telur naik 2.3% minggu ini 🎉 Konsistensi pakan dan vitamin yang bagus kayaknya jadi faktor utamanya.',
    type: 'success',
  },
  {
    id: 'ai-002',
    message:
      'Perhatiin nih, mortalitas tanggal 17 Mei agak tinggi (8 ekor). Cek kondisi ventilasi kandang, suhu mungkin terlalu panas kemarin.',
    type: 'warning',
  },
  {
    id: 'ai-003',
    message:
      'Feed-to-egg ratio lagi di 2.14, bagus banget! Rata-rata industri layer di Indonesia itu sekitar 2.2-2.5. Pertahankan ya 👍',
    type: 'info',
  },
  {
    id: 'ai-004',
    message:
      'Stok pakan layer tinggal buat ~5 hari lagi. Mending order sekarang biar nggak kehabisan dan ayam nggak stress.',
    type: 'warning',
  },
  {
    id: 'ai-005',
    message:
      'Vaksinasi ND (Newcastle Disease) berikutnya dijadwalkan 28 Mei. Jangan lupa siapin vaksinnya dari sekarang!',
    type: 'info',
  },
];

// ─── Health Overview ────────────────────────────────────────────────

export const healthOverview: HealthOverview = {
  healthy: 4930,
  warning: 27,
  critical: 5,
  lastVaccination: '2026-05-05',
  nextVaccination: '2026-05-28',
};

// ─── Inventory Alerts (Peringatan Stok) ─────────────────────────────

export const inventoryAlerts: InventoryAlert[] = [
  {
    id: 'inv-001',
    item_name: 'Pakan Layer (Konsentrat)',
    category: 'feed',
    current_quantity: 2800,
    min_threshold: 3000,
    unit: 'kg',
    urgency: 'high',
  },
  {
    id: 'inv-002',
    item_name: 'Jagung Giling',
    category: 'feed',
    current_quantity: 1500,
    min_threshold: 2000,
    unit: 'kg',
    urgency: 'medium',
  },
  {
    id: 'inv-003',
    item_name: 'Vaksin ND (Newcastle Disease)',
    category: 'medicine',
    current_quantity: 15,
    min_threshold: 50,
    unit: 'dosis',
    urgency: 'high',
  },
  {
    id: 'inv-004',
    item_name: 'Vitamin B-Complex',
    category: 'medicine',
    current_quantity: 8,
    min_threshold: 10,
    unit: 'liter',
    urgency: 'low',
  },
  {
    id: 'inv-005',
    item_name: 'Egg Tray (30 butir)',
    category: 'eggs',
    current_quantity: 120,
    min_threshold: 200,
    unit: 'pcs',
    urgency: 'medium',
  },
];
