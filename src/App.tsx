import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import Generator from './components/Generator';
import { getSession, signOut as supabaseSignOut, trackPageVisit } from './lib/supabase';

type View = 'loading' | 'landing' | 'signin' | 'app';

export function App() {
  const [view, setView]         = useState<View>('loading');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { user } = await getSession();
        if (user) {
          setUserName(user.name);
          setUserEmail(user.email);
          setView('app');
          trackPageVisit('auto-login', user.email);
        } else {
          setView('landing');
          trackPageVisit('landing');
        }
      } catch {
        setView('landing');
      }
    };
    checkSession();
  }, []);

  const handleGetStarted = () => {
    setView('signin');
    trackPageVisit('signin-page');
  };

  const handleSignIn = (email: string, name: string) => {
    setUserName(name || email.split('@')[0]);
    setUserEmail(email);
    setView('app');
    trackPageVisit('app', email);
  };

  const handleSignOut = async () => {
    await supabaseSignOut();
    setView('landing');
    setUserName('');
    setUserEmail('');
    trackPageVisit('sign-out');
  };

  // Loading state
  if (view === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#05050f' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse"
               style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 0 40px rgba(249,115,22,0.4)' }}>
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm font-medium">Loading Data Forge…</p>
        </div>
      </div>
    );
  }

  if (view === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (view === 'signin') {
    return <SignIn onSignIn={handleSignIn} />;
  }

  return <Generator userName={userName} userEmail={userEmail} onSignOut={handleSignOut} />;
}
