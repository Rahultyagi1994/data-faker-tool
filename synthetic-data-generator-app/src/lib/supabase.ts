import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────────────────────
//  Data Forge — Supabase Integration
//  
//  HOW TO CONNECT:
//  1. Create a Supabase project at https://supabase.com
//  2. Go to Project Settings → API
//  3. Copy your Project URL and anon/public key
//  4. Either set them below or use the in-app config modal
//
//  REQUIRED DATABASE TABLES (run in Supabase SQL Editor):
//
//  CREATE TABLE page_visits (
//    id BIGSERIAL PRIMARY KEY,
//    page TEXT NOT NULL,
//    user_id TEXT,
//    user_email TEXT,
//    user_agent TEXT,
//    referrer TEXT,
//    metadata JSONB DEFAULT '{}',
//    visited_at TIMESTAMPTZ DEFAULT NOW()
//  );
//
//  CREATE TABLE analytics_events (
//    id BIGSERIAL PRIMARY KEY,
//    event_type TEXT NOT NULL,
//    user_email TEXT,
//    payload JSONB DEFAULT '{}',
//    created_at TIMESTAMPTZ DEFAULT NOW()
//  );
//
//  -- Enable Row Level Security
//  ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
//  ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
//
//  -- Allow inserts from anon users
//  CREATE POLICY "Allow anonymous inserts" ON page_visits FOR INSERT WITH CHECK (true);
//  CREATE POLICY "Allow anonymous inserts" ON analytics_events FOR INSERT WITH CHECK (true);
//
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY_URL  = 'dataforge_supabase_url';
const STORAGE_KEY_KEY  = 'dataforge_supabase_key';
const STORAGE_KEY_USER = 'dataforge_user';

// Default credentials — hardcoded for production
const DEFAULT_URL = 'https://mmyhdaphoqjxzhxqqbfk.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teWhkYXBob3FqeHpoeHFxYmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTU0ODIsImV4cCI6MjA4NjQ5MTQ4Mn0.sJJRntpm2G-hiEsAnueOWmV9uX8kFnVq-5ZylYtyi_M';

// ── Get stored or default credentials ───────────────────────────────────
function getCredentials(): { url: string; key: string } {
  const url = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_URL;
  const key = localStorage.getItem(STORAGE_KEY_KEY) || DEFAULT_KEY;
  return { url, key };
}

export function saveCredentials(url: string, key: string) {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  // Reload client
  _client = null;
}

export function getStoredCredentials() {
  return getCredentials();
}

export function hasCredentials(): boolean {
  const { url, key } = getCredentials();
  return !!(url && key && url.startsWith('https://'));
}

export function clearCredentials() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
  _client = null;
}

// ── Supabase Client (lazy singleton) ────────────────────────────────────
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (_client) return _client;
  const { url, key } = getCredentials();
  if (!url || !key || !url.startsWith('https://')) return null;
  try {
    _client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return _client;
  } catch {
    return null;
  }
}

// Export for direct access when needed
export function getSupabaseClient(): SupabaseClient | null {
  return getClient();
}

// ── Connection test ─────────────────────────────────────────────────────
export async function testConnection(): Promise<{ success: boolean; error?: string }> {
  const client = getClient();
  if (!client) return { success: false, error: 'No Supabase credentials configured.' };
  try {
    const { error } = await client.from('page_visits').select('id', { count: 'exact', head: true });
    if (error) {
      // Table might not exist yet — that's OK if auth works
      if (error.message.includes('does not exist')) {
        return { success: true, error: 'Connected! But tables not created yet. Run the SQL setup.' };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Connection failed' };
  }
}

// ── Auth: Sign Up ───────────────────────────────────────────────────────
export async function signUp(email: string, password: string, name: string): Promise<{
  user: User | null;
  session: Session | null;
  error: string | null;
}> {
  const client = getClient();
  
  // If no Supabase configured, use local-only mode
  if (!client) {
    const localUser = { email, name };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(localUser));
    return {
      user: { id: crypto.randomUUID(), email, user_metadata: { name } } as unknown as User,
      session: null,
      error: null,
    };
  }
  
  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { name, full_name: name },
      },
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    const localUser = { email, name };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(localUser));
    
    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      session: null,
      error: err instanceof Error ? err.message : 'Sign up failed',
    };
  }
}

// ── Auth: Sign In ───────────────────────────────────────────────────────
export async function signIn(email: string, password: string): Promise<{
  user: User | null;
  session: Session | null;
  error: string | null;
}> {
  const client = getClient();
  
  // If no Supabase configured, use local-only mode
  if (!client) {
    const localUser = { email, name: email.split('@')[0] };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(localUser));
    return {
      user: { id: crypto.randomUUID(), email, user_metadata: { name: email.split('@')[0] } } as unknown as User,
      session: null,
      error: null,
    };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    const name = data.user?.user_metadata?.name || data.user?.user_metadata?.full_name || email.split('@')[0];
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify({ email, name }));

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      session: null,
      error: err instanceof Error ? err.message : 'Sign in failed',
    };
  }
}

// ── Auth: Sign Out ──────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  const client = getClient();
  localStorage.removeItem(STORAGE_KEY_USER);
  if (client) {
    try {
      await client.auth.signOut();
    } catch {
      // ignore
    }
  }
}

// ── Auth: Get current session ───────────────────────────────────────────
export async function getSession(): Promise<{
  user: { email: string; name: string } | null;
  isSupabaseAuth: boolean;
}> {
  const client = getClient();
  
  // Check Supabase session first
  if (client) {
    try {
      const { data } = await client.auth.getSession();
      if (data.session?.user) {
        const user = data.session.user;
        const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        return {
          user: { email: user.email || '', name },
          isSupabaseAuth: true,
        };
      }
    } catch {
      // Fall through to local check
    }
  }

  // Check local storage
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.email) {
        return { user: parsed, isSupabaseAuth: false };
      }
    }
  } catch {
    // ignore
  }

  return { user: null, isSupabaseAuth: false };
}

// ── Analytics: Track Page Visit ─────────────────────────────────────────
export async function trackPageVisit(page: string, userEmail?: string) {
  const client = getClient();
  if (!client) return;

  try {
    await client.from('page_visits').insert({
      page,
      user_email: userEmail ?? null,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      metadata: {
        screen_width: window.innerWidth,
        screen_height: window.innerHeight,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      visited_at: new Date().toISOString(),
    });
  } catch {
    // Never block UI for analytics
  }
}

// ── Analytics: Track Event ──────────────────────────────────────────────
export async function trackEvent(
  eventType: string,
  userEmail?: string,
  payload?: Record<string, unknown>
) {
  const client = getClient();
  if (!client) return;

  try {
    await client.from('analytics_events').insert({
      event_type: eventType,
      user_email: userEmail ?? null,
      payload: payload ?? {},
      created_at: new Date().toISOString(),
    });
  } catch {
    // Never block UI for analytics
  }
}

// ── Analytics: Get Stats (for admin dashboard) ─────────────────────────
export async function getVisitStats(): Promise<{
  totalVisits: number;
  uniqueUsers: number;
  topPages: { page: string; count: number }[];
  recentVisits: { page: string; user_email: string | null; visited_at: string }[];
} | null> {
  const client = getClient();
  if (!client) return null;

  try {
    // Total visits
    const { count: totalVisits } = await client
      .from('page_visits')
      .select('*', { count: 'exact', head: true });

    // Recent visits
    const { data: recent } = await client
      .from('page_visits')
      .select('page, user_email, visited_at')
      .order('visited_at', { ascending: false })
      .limit(20);

    // Get all visits for aggregation
    const { data: allVisits } = await client
      .from('page_visits')
      .select('page, user_email');

    const uniqueEmails = new Set<string>();
    const pageCounts: Record<string, number> = {};

    allVisits?.forEach(v => {
      if (v.user_email) uniqueEmails.add(v.user_email);
      pageCounts[v.page] = (pageCounts[v.page] || 0) + 1;
    });

    const topPages = Object.entries(pageCounts)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalVisits: totalVisits || 0,
      uniqueUsers: uniqueEmails.size,
      topPages,
      recentVisits: recent || [],
    };
  } catch {
    return null;
  }
}

// ── Analytics: Get Event Stats ──────────────────────────────────────────
export async function getEventStats(): Promise<{
  totalEvents: number;
  eventTypes: { type: string; count: number }[];
  recentEvents: { event_type: string; user_email: string | null; payload: Record<string, unknown>; created_at: string }[];
} | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const { count: totalEvents } = await client
      .from('analytics_events')
      .select('*', { count: 'exact', head: true });

    const { data: allEvents } = await client
      .from('analytics_events')
      .select('event_type');

    const typeCounts: Record<string, number> = {};
    allEvents?.forEach(e => {
      typeCounts[e.event_type] = (typeCounts[e.event_type] || 0) + 1;
    });

    const eventTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const { data: recent } = await client
      .from('analytics_events')
      .select('event_type, user_email, payload, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    return {
      totalEvents: totalEvents || 0,
      eventTypes,
      recentEvents: recent || [],
    };
  } catch {
    return null;
  }
}
