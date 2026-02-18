import { useState, useEffect } from 'react';
import SignIn from './components/SignIn';
import Generator from './components/Generator';
import { trackPageVisit } from './lib/supabase';

type View = 'signin' | 'app';

export function App() {
  const [view, setView]         = useState<View>('signin');
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    trackPageVisit('landing');
  }, []);

  const handleSignIn = (email: string, name: string) => {
    setUserName(name || email.split('@')[0]);
    setView('app');
    trackPageVisit('app', email);
  };

  const handleGuest = () => {
    setUserName('Guest');
    setView('app');
    trackPageVisit('app-guest');
  };

  const handleSignOut = () => {
    setView('signin');
    setUserName('Guest');
  };

  if (view === 'signin') {
    return <SignIn onSignIn={handleSignIn} onGuest={handleGuest} />;
  }

  return <Generator userName={userName} onSignOut={handleSignOut} />;
}
