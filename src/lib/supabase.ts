import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mmyhdaphoqjxzhxqqbfk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teWhkYXBob3FqeHpoeHFxYmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTU0ODIsImV4cCI6MjA4NjQ5MTQ4Mn0.sJJRntpm2G-hiEsAnueOWmV9uX8kFnVq-5ZylYtyi_M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if we're in demo mode (now false since we have real credentials)
export const isDemoMode = false;

// Types for our database
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  total_generations: number;
  total_records: number;
  last_active: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  action: 'generate' | 'download' | 'export';
  data_type: string;
  record_count: number;
  export_format: string | null;
  scenario_used: string | null;
  created_at: string;
}

export interface GlobalStats {
  total_users: number;
  total_generations: number;
  total_records: number;
  total_downloads: number;
}
