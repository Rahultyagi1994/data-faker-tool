import { createClient } from '@supabase/supabase-js';

// Public Supabase project — replace with your own credentials
const SUPABASE_URL = 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = 'public-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true },
});

// ── Traffic / analytics helper ──────────────────────────────────────────────
export async function trackPageVisit(page: string, userId?: string) {
  try {
    await supabase.from('page_visits').insert({
      page,
      user_id: userId ?? null,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      visited_at: new Date().toISOString(),
    });
  } catch {
    // never block the UI for analytics
  }
}
