import { useAuth } from '../context/AuthContext';

interface UsageStatsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UsageStats({ isOpen, onClose }: UsageStatsProps) {
  const { user, profile, globalStats, signOut } = useAuth();

  if (!isOpen || !user || !profile) return null;

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-dark-700">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-dark-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {profile.full_name || 'User'}
              </h2>
              <p className="text-dark-400 text-sm">{profile.email}</p>
              <p className="text-dark-500 text-xs mt-1">
                Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'today'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-6">
          {/* Your Stats */}
          <div>
            <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-3">Your Stats</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">{profile.total_generations.toLocaleString()}</div>
                <div className="text-dark-400 text-xs mt-1">Generations</div>
              </div>
              <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{profile.total_records.toLocaleString()}</div>
                <div className="text-dark-400 text-xs mt-1">Records</div>
              </div>
              <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {profile.total_generations > 0 ? Math.round(profile.total_records / profile.total_generations).toLocaleString() : 0}
                </div>
                <div className="text-dark-400 text-xs mt-1">Avg Size</div>
              </div>
            </div>
          </div>

          {/* Global Stats */}
          <div>
            <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-3">Global Community</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{globalStats.total_users.toLocaleString()}</div>
                    <div className="text-dark-400 text-xs">Total Users</div>
                  </div>
                </div>
              </div>
              <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{globalStats.total_generations.toLocaleString()}</div>
                    <div className="text-dark-400 text-xs">Generations</div>
                  </div>
                </div>
              </div>
              <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{globalStats.total_records.toLocaleString()}</div>
                    <div className="text-dark-400 text-xs">Total Records</div>
                  </div>
                </div>
              </div>
              <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{globalStats.total_downloads.toLocaleString()}</div>
                    <div className="text-dark-400 text-xs">Downloads</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full py-3 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-dark-300 hover:text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
