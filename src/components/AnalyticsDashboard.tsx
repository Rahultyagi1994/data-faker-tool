import { useState, useEffect } from 'react';
import { getVisitStats, getEventStats, hasCredentials } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface VisitStats {
  totalVisits: number;
  uniqueUsers: number;
  topPages: { page: string; count: number }[];
  recentVisits: { page: string; user_email: string | null; visited_at: string }[];
}

interface EventStats {
  totalEvents: number;
  eventTypes: { type: string; count: number }[];
  recentEvents: { event_type: string; user_email: string | null; payload: Record<string, unknown>; created_at: string }[];
}

export default function AnalyticsDashboard({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);
  const [eventStats, setEventStats] = useState<EventStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'visits' | 'events'>('overview');

  useEffect(() => {
    if (isOpen && hasCredentials()) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    setLoading(true);
    const [visits, events] = await Promise.all([
      getVisitStats(),
      getEventStats(),
    ]);
    setVisitStats(visits);
    setEventStats(events);
    setLoading(false);
  };

  if (!isOpen) return null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto"
           style={{ background: 'rgba(12,12,24,0.98)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Analytics Dashboard</h2>
              <p className="text-xs text-slate-500">Traffic & usage data from Supabase</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadStats} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
              🔄 Refresh
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {!hasCredentials() ? (
          <div className="p-12 text-center">
            <span className="text-4xl mb-4 block">🔌</span>
            <h3 className="text-xl font-bold text-white mb-2">No Supabase Connected</h3>
            <p className="text-sm text-slate-500">Connect your Supabase project to see analytics data.</p>
          </div>
        ) : loading ? (
          <div className="p-12 text-center">
            <svg className="w-8 h-8 animate-spin mx-auto mb-4 text-violet-400" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/>
            </svg>
            <p className="text-sm text-slate-500">Loading analytics…</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Visits', value: visitStats?.totalVisits ?? 0, icon: '👀', color: '#f97316' },
                { label: 'Unique Users', value: visitStats?.uniqueUsers ?? 0, icon: '👤', color: '#10b981' },
                { label: 'Total Events', value: eventStats?.totalEvents ?? 0, icon: '⚡', color: '#8b5cf6' },
                { label: 'Event Types', value: eventStats?.eventTypes?.length ?? 0, icon: '🏷️', color: '#06b6d4' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4 border border-white/10 relative overflow-hidden"
                     style={{ background: 'rgba(255,255,255,0.025)' }}>
                  <div className="absolute inset-0 opacity-5 pointer-events-none"
                       style={{ background: `radial-gradient(circle at top left, ${s.color}, transparent 70%)` }} />
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-black text-white">{s.value.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tab Toggle */}
            <div className="flex rounded-xl p-1 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
              {(['overview', 'visits', 'events'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                          activeTab === tab ? 'text-white' : 'text-slate-600 hover:text-slate-400'
                        }`}
                        style={activeTab === tab ? { background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' } : {}}>
                  {tab === 'overview' ? '📊 Overview' : tab === 'visits' ? '👀 Page Visits' : '⚡ Events'}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top Pages */}
                <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="px-4 py-3 border-b border-white/10">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">📄 Top Pages</span>
                  </div>
                  <div className="p-3 space-y-1.5">
                    {(visitStats?.topPages || []).map(p => (
                      <div key={p.page} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-all">
                        <span className="text-xs text-slate-400 font-mono">{p.page}</span>
                        <span className="text-xs font-bold text-orange-400">{p.count}</span>
                      </div>
                    ))}
                    {(!visitStats?.topPages?.length) && (
                      <p className="text-xs text-slate-700 text-center py-4">No data yet</p>
                    )}
                  </div>
                </div>

                {/* Event Types */}
                <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="px-4 py-3 border-b border-white/10">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">⚡ Event Types</span>
                  </div>
                  <div className="p-3 space-y-1.5">
                    {(eventStats?.eventTypes || []).map(e => (
                      <div key={e.type} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-all">
                        <span className="text-xs text-slate-400 font-mono">{e.type}</span>
                        <span className="text-xs font-bold text-violet-400">{e.count}</span>
                      </div>
                    ))}
                    {(!eventStats?.eventTypes?.length) && (
                      <p className="text-xs text-slate-700 text-center py-4">No data yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Visits Tab */}
            {activeTab === 'visits' && (
              <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="overflow-auto max-h-[400px]">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0" style={{ background: 'rgba(12,12,24,0.98)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-slate-500 font-bold border-b border-white/10">Page</th>
                        <th className="px-4 py-3 text-left text-slate-500 font-bold border-b border-white/10">User</th>
                        <th className="px-4 py-3 text-left text-slate-500 font-bold border-b border-white/10">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(visitStats?.recentVisits || []).map((v, i) => (
                        <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors">
                          <td className="px-4 py-2.5 text-slate-300 font-mono">{v.page}</td>
                          <td className="px-4 py-2.5 text-slate-500 font-mono">{v.user_email || '—'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{formatDate(v.visited_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!visitStats?.recentVisits?.length) && (
                    <p className="text-xs text-slate-700 text-center py-8">No visits recorded yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="overflow-auto max-h-[400px]">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0" style={{ background: 'rgba(12,12,24,0.98)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-slate-500 font-bold border-b border-white/10">Event</th>
                        <th className="px-4 py-3 text-left text-slate-500 font-bold border-b border-white/10">User</th>
                        <th className="px-4 py-3 text-left text-slate-500 font-bold border-b border-white/10">Details</th>
                        <th className="px-4 py-3 text-left text-slate-500 font-bold border-b border-white/10">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(eventStats?.recentEvents || []).map((e, i) => (
                        <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors">
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-violet-400 border border-violet-500/20"
                                  style={{ background: 'rgba(139,92,246,0.08)' }}>
                              {e.event_type}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-500 font-mono">{e.user_email || '—'}</td>
                          <td className="px-4 py-2.5 text-slate-600 font-mono max-w-[200px] truncate">
                            {JSON.stringify(e.payload).slice(0, 60)}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">{formatDate(e.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!eventStats?.recentEvents?.length) && (
                    <p className="text-xs text-slate-700 text-center py-8">No events recorded yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
