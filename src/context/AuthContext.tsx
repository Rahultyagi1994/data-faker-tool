import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isDemoMode, UserProfile, GlobalStats } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  globalStats: GlobalStats;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGitHub: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  trackGeneration: (dataType: string, recordCount: number, scenario?: string) => Promise<void>;
  trackDownload: (dataType: string, recordCount: number, format: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo mode storage
const DEMO_USER_KEY = 'dataforge_demo_user';
const DEMO_STATS_KEY = 'dataforge_demo_stats';

const getInitialGlobalStats = (): GlobalStats => ({
  total_users: 0,
  total_generations: 0,
  total_records: 0,
  total_downloads: 0,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState<GlobalStats>(getInitialGlobalStats());

  // Load demo user from localStorage
  const loadDemoUser = () => {
    const stored = localStorage.getItem(DEMO_USER_KEY);
    if (stored) {
      const demoProfile = JSON.parse(stored) as UserProfile;
      setProfile(demoProfile);
      setUser({ id: demoProfile.id, email: demoProfile.email } as User);
    }
    const stats = localStorage.getItem(DEMO_STATS_KEY);
    if (stats) {
      setGlobalStats(JSON.parse(stats));
    }
    setLoading(false);
  };

  // Save demo user to localStorage
  const saveDemoUser = (demoProfile: UserProfile) => {
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoProfile));
    setProfile(demoProfile);
    setUser({ id: demoProfile.id, email: demoProfile.email } as User);
  };

  // Fetch user profile from Supabase
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data as UserProfile);
    }
  };

  // Fetch global stats
  const fetchGlobalStats = async () => {
    if (isDemoMode) {
      const stats = localStorage.getItem(DEMO_STATS_KEY);
      if (stats) setGlobalStats(JSON.parse(stats));
      return;
    }

    const { data, error } = await supabase
      .from('global_stats')
      .select('*')
      .single();

    if (!error && data) {
      setGlobalStats(data as GlobalStats);
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      loadDemoUser();
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    fetchGlobalStats();

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    if (isDemoMode) {
      const stored = localStorage.getItem(DEMO_USER_KEY);
      if (stored) {
        const demoProfile = JSON.parse(stored) as UserProfile;
        if (demoProfile.email === email) {
          saveDemoUser(demoProfile);
          return { error: null };
        }
      }
      return { error: new Error('User not found. Please sign up first.') };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    if (isDemoMode) {
      const newProfile: UserProfile = {
        id: crypto.randomUUID(),
        email,
        full_name: fullName,
        avatar_url: null,
        created_at: new Date().toISOString(),
        total_generations: 0,
        total_records: 0,
        last_active: new Date().toISOString(),
      };
      saveDemoUser(newProfile);
      
      // Update global stats
      const newStats = {
        ...globalStats,
        total_users: globalStats.total_users + 1,
      };
      setGlobalStats(newStats);
      localStorage.setItem(DEMO_STATS_KEY, JSON.stringify(newStats));
      
      return { error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (!error && data.user) {
      // Create profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        total_generations: 0,
        total_records: 0,
      });

      // Update global stats
      await supabase.rpc('increment_user_count');
    }

    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    if (isDemoMode) {
      const newProfile: UserProfile = {
        id: crypto.randomUUID(),
        email: 'demo@google.com',
        full_name: 'Google User',
        avatar_url: 'https://lh3.googleusercontent.com/a/default-user',
        created_at: new Date().toISOString(),
        total_generations: 0,
        total_records: 0,
        last_active: new Date().toISOString(),
      };
      saveDemoUser(newProfile);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    return { error: error as Error | null };
  };

  const signInWithGitHub = async () => {
    if (isDemoMode) {
      const newProfile: UserProfile = {
        id: crypto.randomUUID(),
        email: 'demo@github.com',
        full_name: 'GitHub User',
        avatar_url: 'https://github.com/ghost.png',
        created_at: new Date().toISOString(),
        total_generations: 0,
        total_records: 0,
        last_active: new Date().toISOString(),
      };
      saveDemoUser(newProfile);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem(DEMO_USER_KEY);
      setUser(null);
      setProfile(null);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const trackGeneration = async (dataType: string, recordCount: number, scenario?: string) => {
    if (!user || !profile) return;

    if (isDemoMode) {
      const updatedProfile = {
        ...profile,
        total_generations: profile.total_generations + 1,
        total_records: profile.total_records + recordCount,
        last_active: new Date().toISOString(),
      };
      saveDemoUser(updatedProfile);

      const newStats = {
        ...globalStats,
        total_generations: globalStats.total_generations + 1,
        total_records: globalStats.total_records + recordCount,
      };
      setGlobalStats(newStats);
      localStorage.setItem(DEMO_STATS_KEY, JSON.stringify(newStats));
      return;
    }

    // Log the usage
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      action: 'generate',
      data_type: dataType,
      record_count: recordCount,
      scenario_used: scenario,
    });

    // Update user profile
    await supabase
      .from('profiles')
      .update({
        total_generations: profile.total_generations + 1,
        total_records: profile.total_records + recordCount,
        last_active: new Date().toISOString(),
      })
      .eq('id', user.id);

    // Update global stats
    await supabase.rpc('increment_generation_stats', { record_count: recordCount });

    // Refresh profile
    fetchProfile(user.id);
    fetchGlobalStats();
  };

  const trackDownload = async (dataType: string, recordCount: number, format: string) => {
    if (!user) return;

    if (isDemoMode) {
      const newStats = {
        ...globalStats,
        total_downloads: globalStats.total_downloads + 1,
      };
      setGlobalStats(newStats);
      localStorage.setItem(DEMO_STATS_KEY, JSON.stringify(newStats));
      return;
    }

    await supabase.from('usage_logs').insert({
      user_id: user.id,
      action: 'download',
      data_type: dataType,
      record_count: recordCount,
      export_format: format,
    });

    await supabase.rpc('increment_download_count');
    fetchGlobalStats();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        globalStats,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithGitHub,
        signOut,
        trackGeneration,
        trackDownload,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
