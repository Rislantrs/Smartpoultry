import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log('\n--- Checking Profiles Table ---');
  const { data: pData, error: pErr } = await supabase.from('profiles').select('*').limit(1);
  if (pErr) {
    console.error('Error querying profiles:', pErr.message, pErr.code);
  } else {
    console.log('Profiles table exists! Sample data:', pData);
  }

  console.log('\n--- Checking Cages Table ---');
  const { data: cData, error: cErr } = await supabase.from('cages').select('*').limit(1);
  if (cErr) {
    console.error('Error querying cages:', cErr.message, cErr.code);
  } else {
    console.log('Cages table exists! Sample data:', cData);
  }

  console.log('\n--- Checking Daily Logs Table ---');
  const { data: dData, error: dErr } = await supabase.from('daily_logs').select('*').limit(1);
  if (dErr) {
    console.error('Error querying daily_logs:', dErr.message, dErr.code);
  } else {
    console.log('Daily logs table exists! Sample data:', dData);
  }
}

check();
