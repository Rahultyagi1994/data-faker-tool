import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile, GlobalStats } from '../lib/supabase';

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

  // Fetch user profile from Supabase
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
      } else if (error) {
        console.log('Profile fetch note:', error.message);
        // Profile might not exist yet if trigger hasn't fired
        // Try to create it manually
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (currentUser) {
          const { error: insertError } = await supabase.from('profiles').upsert({
            id: currentUser.id,
            email: currentUser.email,
            full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User',
            avatar_url: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || null,
            total_generations: 0,
            total_records: 0,
            total_downloads: 0,
          });
          if (!insertError) {
            // Fetch again after insert
            const { data: newData } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (newData) setProfile(newData as UserProfile);
          }
        }
      }
    } catch (err) {
      console.log('Profile fetch error:', err);
    }
  };

  // Fetch global stats
  const fetchGlobalStats = async () => {
    try {
      const { data, error } = await supabase
        .from('global_stats')
        .select('*')
        .single();

      if (!error && data) {
        setGlobalStats(data as GlobalStats);
      }
    } catch (err) {
      console.log('Stats fetch error:', err);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          // Small delay to let the trigger create the profile
          setTimeout(() => fetchProfile(newSession.user.id), 500);
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
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Sign in failed') };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      // Don't manually create profile — the database trigger handles it
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Sign up failed') };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Google sign in failed') };
    }
  };

  const signInWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin,
        },
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: new Error(err.message || 'GitHub sign in failed') };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const trackGeneration = async (dataType: string, recordCount: number, scenario?: string) => {
    if (!user) return;

    try {
      // Log the usage
      await supabase.from('usage_logs').insert({
        user_id: user.id,
        action: 'generate',
        data_type: dataType,
        record_count: recordCount,
        scenario_used: scenario || null,
      });

      // Update user profile stats
      if (profile) {
        const newGenCount = (profile.total_generations || 0) + 1;
        const newRecordCount = (profile.total_records || 0) + recordCount;
        
        await supabase
          .from('profiles')
          .update({
            total_generations: newGenCount,
            total_records: newRecordCount,
            last_active: new Date().toISOString(),
          })
          .eq('id', user.id);

        // Update local profile state
        setProfile(prev => prev ? {
          ...prev,
          total_generations: newGenCount,
          total_records: newRecordCount,
          last_active: new Date().toISOString(),
        } : prev);
      }

      // Try to update global stats (may fail if RLS doesn't allow it — that's OK)
      try {
        const { data: currentStats } = await supabase.from('global_stats').select('*').single();
        if (currentStats) {
          await supabase.from('global_stats').update({
            total_generations: (currentStats.total_generations || 0) + 1,
            total_records: (currentStats.total_records || 0) + recordCount,
            updated_at: new Date().toISOString(),
          }).eq('id', 1);
        }
      } catch {
        // Global stats update failed — RLS may block it, that's fine
      }
    } catch (err) {
      console.log('Track generation error:', err);
    }
  };

  const trackDownload = async (dataType: string, recordCount: number, format: string) => {
    if (!user) return;

    try {
      await supabase.from('usage_logs').insert({
        user_id: user.id,
        action: 'download',
        data_type: dataType,
        record_count: recordCount,
        export_format: format,
      });

      // Update profile download count
      if (profile) {
        const newDownloads = (profile.total_downloads || 0) + 1;
        await supabase.from('profiles').update({
          total_downloads: newDownloads,
          last_active: new Date().toISOString(),
        }).eq('id', user.id);

        setProfile(prev => prev ? { ...prev, total_downloads: newDownloads } : prev);
      }

      // Try to update global stats
      try {
        const { data: currentStats } = await supabase.from('global_stats').select('*').single();
        if (currentStats) {
          await supabase.from('global_stats').update({
            total_downloads: (currentStats.total_downloads || 0) + 1,
            updated_at: new Date().toISOString(),
          }).eq('id', 1);
        }
      } catch {
        // Global stats update may fail due to RLS — that's OK
      }
    } catch (err) {
      console.log('Track download error:', err);
    }
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
