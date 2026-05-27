// SmartPoultry Database Types
// Supabase schema type definitions for layer poultry farm management in Indonesia

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Profile>;
      };
      cages: {
        Row: Cage;
        Insert: Omit<Cage, 'id' | 'updated_at'>;
        Update: Partial<Cage>;
      };
      daily_logs: {
        Row: DailyLog;
        Insert: Omit<DailyLog, 'id' | 'created_at'>;
        Update: Partial<DailyLog>;
      };
      vaccination_logs: {
        Row: VaccinationLog;
        Insert: Omit<VaccinationLog, 'id' | 'created_at'>;
        Update: Partial<VaccinationLog>;
      };
      weekly_recap_logs: {
        Row: WeeklyRecapLog;
        Insert: Omit<WeeklyRecapLog, 'id' | 'created_at'>;
        Update: Partial<WeeklyRecapLog>;
      };
      inventory_logs: {
        Row: InventoryLog;
        Insert: Omit<InventoryLog, 'id'>;
        Update: Partial<InventoryLog>;
      };
      maintenance_logs: {
        Row: MaintenanceLog;
        Insert: Omit<MaintenanceLog, 'id' | 'created_at'>;
        Update: Partial<MaintenanceLog>;
      };
      financial_sales_logs: {
        Row: FinancialSalesLog;
        Insert: Omit<FinancialSalesLog, 'id' | 'created_at'>;
        Update: Partial<FinancialSalesLog>;
      };
      telegram_links: {
        Row: TelegramLink;
        Insert: Omit<TelegramLink, 'id' | 'linked_at'>;
        Update: Partial<TelegramLink>;
      };
      telegram_activity_logs: {
        Row: TelegramActivityLog;
        Insert: Omit<TelegramActivityLog, 'id' | 'created_at'>;
        Update: Partial<TelegramActivityLog>;
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export interface Profile {
  id: string; // uuid references auth.users
  farm_name: string;
  owner_name: string;
  phone_number?: string | null;
  location?: string | null;
  telegram_token?: string | null;
  created_at: string;
}

export interface Cage {
  id: string;
  profile_id: string;
  strain: string;
  chicken_age_weeks: number;
  capacity: number;
  target_fcr: number;
  updated_at?: string;
}

export interface DailyLog {
  id: string;
  profile_id: string;
  log_date: string;
  eggs_qty_pcs: number;
  eggs_weight_kg: number;
  eggs_damaged_pcs: number;
  feed_consumed_kg: number;
  feed_consumed_bags: number;
  feed_remaining_kg?: number | null;
  water_status: 'Bersih' | 'Keruh';
  vitamin_dose_time?: string | null;
  mortality_count: number;
  health_symptoms?: string | null;
  temp_morning_c: number;
  temp_afternoon_c: number;
  feces_condition: 'Normal' | 'Basah';
  egg_collection_time?: string | null;
  cleaning_schedule?: string | null;
  input_source: 'Web' | 'Telegram' | 'AI Agent';
  created_at: string;
}

export interface VaccinationLog {
  id: string;
  profile_id: string;
  log_date: string;
  vaccine_name: string;
  dose_method: string;
  side_effects?: string | null;
  target_group: string;
  created_at: string;
}

export interface WeeklyRecapLog {
  id: string;
  profile_id: string;
  week_start_date: string;
  total_eggs_pcs: number;
  total_feed_kg: number;
  fcr: number;
  shell_quality_notes?: string | null;
  created_at: string;
}

export interface InventoryLog {
  id: string;
  profile_id: string;
  item_name: string;
  stock_initial: number;
  stock_in: number;
  stock_out: number;
  stock_final: number;
  expiry_date?: string | null;
  log_date: string;
}

export interface MaintenanceLog {
  id: string;
  profile_id: string;
  log_date: string;
  item_category: string;
  activity_details: string;
  cost: number;
  created_at: string;
}

export interface FinancialSalesLog {
  id: string;
  profile_id: string;
  log_date: string;
  volume_sold_kg: number;
  price_per_kg: number;
  total_revenue: number;
  buyer_notes?: string | null;
  created_at: string;
}

export interface TelegramLink {
  id: string;
  profile_id: string;
  chat_id: number;
  username?: string | null;
  first_name?: string | null;
  linked_at: string;
  is_active: boolean;
  notify_daily: boolean;
  notify_hour: number;
  last_seen_at?: string | null;
}

export interface TelegramActivityLog {
  id: string;
  profile_id?: string | null;
  chat_id: number;
  command: string;
  response_type?: string | null;
  message_id?: number | null;
  created_at: string;
}


// ─── Dashboard-specific view types ──────────────────────────────────

export interface DashboardStats {
  totalPopulation: number;
  populationChange: number;
  todayEggProduction: number;
  eggProductionChange: number;
  feedToEggRatio: number;
  ratioChange: number;
  dailyMortality: number;
  mortalityChange: number;
}

export interface ProductionTrend {
  date: string;
  eggs: number;
  feed: number;
}

export interface CostBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface RecentLog {
  id: string;
  date: string;
  feed_kg: number;
  eggs: number;
  mortality: number;
  status: 'normal' | 'warning' | 'critical';
  source: 'telegram' | 'web' | 'manual';
}

export interface AiInsight {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
}

export interface HealthOverview {
  healthy: number;
  warning: number;
  critical: number;
  lastVaccination: string;
  nextVaccination: string;
}

export interface InventoryAlert {
  id: string;
  item_name: string;
  category: 'feed' | 'medicine' | 'eggs' | 'equipment';
  current_quantity: number;
  min_threshold: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high';
}
