import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGitHub } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        result = await signUpWithEmail(email, password, fullName);
        if (!result.error) {
          setSuccessMsg('Account created! Check your email to confirm, then sign in.');
          setIsSignUp(false);
          setPassword('');
        }
      } else {
        result = await signInWithEmail(email, password);
      }

      if (result.error) {
        setError(result.error.message);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error.message);
    }
    setLoading(false);
  };

  const handleGitHubSignIn = async () => {
    setError(null);
    setLoading(true);
    const result = await signInWithGitHub();
    if (result.error) {
      setError(result.error.message);
    }
    setLoading(false);
  };

  const features = [
    {
      icon: '👤',
      title: 'Users & Profiles',
      description: 'Names, emails, phones, job titles'
    },
    {
      icon: '🏠',
      title: 'Addresses',
      description: 'Streets, cities, ZIP codes, coordinates'
    },
    {
      icon: '💳',
      title: 'Transactions',
      description: 'Amounts, merchants, categories'
    },
    {
      icon: '🏥',
      title: 'Patients',
      description: 'MRN, blood type, allergies, conditions'
    },
    {
      icon: '📋',
      title: 'Medical Records',
      description: 'ICD-10, vitals, clinical notes'
    },
    {
      icon: '💊',
      title: 'Prescriptions',
      description: 'Medications, dosages, DEA numbers'
    },
    {
      icon: '🧪',
      title: 'Lab Results',
      description: 'Real tests with reference ranges'
    },
    {
      icon: '🏦',
      title: 'Insurance Claims',
      description: 'Amounts, CPT codes, status'
    },
    {
      icon: '👨‍⚕️',
      title: 'Providers',
      description: 'NPI numbers, specialties, credentials'
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] right-[20%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Hero */}
        <div className="hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">DataForge</span>
          </div>

          {/* Hero Text */}
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Generate Realistic
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Synthetic Data
            </span>
            <br />
            in Seconds
          </h1>

          <p className="text-lg text-dark-300 mb-8 max-w-lg">
            Create realistic fake data for testing, development, and demos. 
            From users and transactions to HIPAA-safe healthcare data with FHIR export.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-dark-900/50 border border-dark-800 rounded-xl p-3 hover:border-dark-600 transition-colors"
              >
                <div className="text-2xl mb-1">{feature.icon}</div>
                <div className="text-sm font-semibold text-white">{feature.title}</div>
                <div className="text-xs text-dark-400">{feature.description}</div>
              </div>
            ))}
          </div>

          {/* Export Formats */}
          <div className="flex items-center gap-4">
            <span className="text-dark-400 text-sm">Export to:</span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-dark-800/50 border border-dark-700 rounded-lg text-sm text-dark-300">JSON</span>
              <span className="px-3 py-1.5 bg-dark-800/50 border border-dark-700 rounded-lg text-sm text-dark-300">CSV</span>
              <span className="px-3 py-1.5 bg-dark-800/50 border border-dark-700 rounded-lg text-sm text-dark-300">SQL</span>
              <span className="px-3 py-1.5 bg-teal-500/10 border border-teal-500/30 rounded-lg text-sm text-teal-400">HL7 FHIR</span>
            </div>
          </div>

          {/* Product Hunt Badge */}
          <div className="mt-8">
            <a 
              href="https://www.producthunt.com/products/dataforge-synthetic-data-generator?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-dataforge-synthetic-data-generator" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <img 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1077479&theme=dark&t=1770829437528" 
                alt="DataForge on Product Hunt" 
                width="250" 
                height="54"
              />
            </a>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 lg:max-w-xl flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">DataForge</span>
          </div>

          <div className="bg-dark-900/80 backdrop-blur-xl border border-dark-700 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <p className="text-dark-400">
                {isSignUp ? 'Start generating synthetic data for free' : 'Sign in to continue generating data'}
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-xl text-white font-medium transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <button
                onClick={handleGitHubSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-xl text-white font-medium transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-dark-700" />
              <span className="text-dark-500 text-sm">or continue with email</span>
              <div className="flex-1 h-px bg-dark-700" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
                  ✅ {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            {/* Toggle */}
            <p className="text-center text-dark-400 mt-6">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up Free'}
              </button>
            </p>

 
          </div>

          {/* Mobile Features */}
          <div className="lg:hidden mt-8">
            <p className="text-dark-400 text-sm text-center mb-4">Generate data for:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {features.slice(0, 6).map((feature, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 bg-dark-800/50 border border-dark-700 rounded-full text-sm text-dark-300"
                >
                  {feature.icon} {feature.title}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-dark-500 text-xs text-center mt-8">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
