import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
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

  // Email-only authentication

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

            {/* Email Sign In */}

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
