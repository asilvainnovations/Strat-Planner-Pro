import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { StratLogo } from '@/components/branding/Logo';
import {
  Users, Eye, Globe, Smartphone, AlertTriangle, TrendingUp, ArrowLeft,
  CheckCircle2, XCircle, Loader2, Search, Filter, Download
} from 'lucide-react';

interface Signup {
  id: string;
  email: string;
  full_name: string | null;
  organization: string | null;
  created_at: string;
  verification_status?: string;
  user_type?: string;
  plan?: string;
}

interface Visit {
  id: string;
  email: string | null;
  page: string;
  device: string;
  location: string;
  visited_at: string;
}

interface ActivityIssue {
  id: string;
  user_id: string | null;
  action: string;
  details: any;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  const [signups, setSignups] = useState<Signup[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [activity, setActivity] = useState<ActivityIssue[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<keyof Signup>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      // not admin -> redirect home
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setLoadingData(true);
      try {
        const [{ data: profilesData }, { data: visitsData }, { data: activityData }] = await Promise.all([
          supabase.from('user_profiles').select('*').order('created_at', { ascending: false }).limit(500),
          supabase.from('visit_logs').select('*').order('visited_at', { ascending: false }).limit(1000),
          supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(200),
        ]);
        setSignups((profilesData || []) as Signup[]);
        setVisits((visitsData || []) as Visit[]);
        setActivity((activityData || []) as ActivityIssue[]);
      } finally { setLoadingData(false); }
    })();
  }, [isAdmin]);

  // ─── Stats ────────────────────────────────────────
  const stats = useMemo(() => {
    const totalSignups = signups.length;
    const totalVisits = visits.length;
    const uniqueLocations = new Set(visits.map(v => v.location).filter(Boolean)).size;
    const devices = visits.reduce<Record<string, number>>((acc, v) => {
      const d = v.device || 'Unknown'; acc[d] = (acc[d] || 0) + 1; return acc;
    }, {});
    const bounces = visits.filter(v => v.page === '/' || v.page === '/landing').length;
    return { totalSignups, totalVisits, uniqueLocations, devices, bounces };
  }, [signups, visits]);

  // Signups over time (last 14 days)
  const signupsByDay = useMemo(() => {
    const days: Record<string, number> = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      days[d.toISOString().split('T')[0]] = 0;
    }
    signups.forEach(s => {
      const day = (s.created_at || '').split('T')[0];
      if (day in days) days[day]++;
    });
    return days;
  }, [signups]);

  // User-type / plan revenue split (mock if no plan field)
  const planSplit = useMemo(() => {
    const split: Record<string, number> = { Free: 0, Starter: 0, Pro: 0, Enterprise: 0 };
    signups.forEach(s => {
      const p = s.plan || (s.user_type === 'enterprise' ? 'Enterprise' : 'Free');
      split[p] = (split[p] || 0) + 1;
    });
    return split;
  }, [signups]);

  // Filter + sort
  const filteredSignups = useMemo(() => {
    let arr = [...signups];
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(s =>
        (s.email || '').toLowerCase().includes(q) ||
        (s.full_name || '').toLowerCase().includes(q) ||
        (s.organization || '').toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      arr = arr.filter(s => (s.verification_status || 'pending') === statusFilter);
    }
    arr.sort((a, b) => {
      const va = (a[sortKey] || '') as any;
      const vb = (b[sortKey] || '') as any;
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [signups, search, statusFilter, sortKey, sortDir]);

  const updateVerification = async (id: string, status: 'approved' | 'rejected') => {
    setSignups(prev => prev.map(s => s.id === id ? { ...s, verification_status: status } : s));
    await supabase.from('user_profiles').update({ verification_status: status }).eq('id', id);
  };

  const exportCSV = () => {
    const rows = [
      ['Email', 'Name', 'Organization', 'Plan', 'Status', 'Created'],
      ...filteredSignups.map(s => [s.email, s.full_name || '', s.organization || '', s.plan || 'Free', s.verification_status || 'pending', s.created_at]),
    ];
    const csv = rows.map(r => r.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `signups_${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const maxSignupCount = Math.max(...Object.values(signupsByDay), 1);
  const maxPlan = Math.max(...Object.values(planSplit), 1);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <StratLogo size="lg" withGlow />
            <div>
              <h1 className="text-2xl font-black text-white">Super Admin Dashboard</h1>
              <p className="text-xs text-slate-500">Logged in as {user?.email}</p>
            </div>
          </div>
          <button onClick={exportCSV} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-cyan-500">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard icon={Users} label="Signups" value={stats.totalSignups} color="cyan" />
          <StatCard icon={Eye} label="Visits" value={stats.totalVisits} color="blue" />
          <StatCard icon={Globe} label="Locations" value={stats.uniqueLocations} color="emerald" />
          <StatCard icon={Smartphone} label="Mobile %" value={`${Math.round(((stats.devices.Mobile || 0) / Math.max(stats.totalVisits, 1)) * 100)}%`} color="amber" />
          <StatCard icon={TrendingUp} label="Bounces" value={stats.bounces} color="rose" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">Signups Over Time (14 days)</h3>
            <div className="flex items-end gap-1 h-32">
              {Object.entries(signupsByDay).map(([day, count]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1" title={`${day}: ${count}`}>
                  <div className="text-[9px] text-slate-500">{count || ''}</div>
                  <div className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-sm"
                    style={{ height: `${(count / maxSignupCount) * 100}%`, minHeight: '4px' }} />
                  <div className="text-[8px] text-slate-600">{day.slice(8)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">Plan Revenue Split (Stacked)</h3>
            <div className="space-y-2">
              {Object.entries(planSplit).map(([plan, count]) => (
                <div key={plan}>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{plan}</span><span>{count}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${plan === 'Free' ? 'bg-slate-500' : plan === 'Starter' ? 'bg-cyan-500' : plan === 'Pro' ? 'bg-blue-500' : 'bg-purple-500'}`}
                      style={{ width: `${(count / maxPlan) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">Devices Used</h3>
            <div className="space-y-3">
              {Object.entries(stats.devices).map(([d, count]) => (
                <div key={d} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{d}</span>
                  <span className="text-white font-bold">{count}</span>
                </div>
              ))}
              {Object.keys(stats.devices).length === 0 && <p className="text-xs text-slate-500">No data yet</p>}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-slate-800 px-3 rounded-lg">
            <Search className="w-4 h-4 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email, name, organization..."
              className="flex-1 bg-transparent py-2 outline-none text-sm text-white placeholder:text-slate-500" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 px-3 rounded-lg text-sm text-white outline-none">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={`${sortKey}:${sortDir}`} onChange={(e) => {
            const [k, d] = e.target.value.split(':');
            setSortKey(k as keyof Signup); setSortDir(d as 'asc' | 'desc');
          }} className="bg-slate-800 px-3 rounded-lg text-sm text-white outline-none">
            <option value="created_at:desc">Newest first</option>
            <option value="created_at:asc">Oldest first</option>
            <option value="email:asc">Email A-Z</option>
            <option value="email:desc">Email Z-A</option>
          </select>
        </div>

        {/* Signups Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white">Signups ({filteredSignups.length})</h3>
            {loadingData && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/40 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Organization</th>
                  <th className="text-left px-4 py-3">Plan</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Created</th>
                  <th className="text-right px-4 py-3">Verification</th>
                </tr>
              </thead>
              <tbody>
                {filteredSignups.map(s => (
                  <tr key={s.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-white font-medium">{s.email}</td>
                    <td className="px-4 py-3 text-slate-300">{s.full_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{s.organization || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{s.plan || 'Free'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        s.verification_status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        s.verification_status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>{s.verification_status || 'pending'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => updateVerification(s.id, 'approved')}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" title="Approve">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => updateVerification(s.id, 'rejected')}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSignups.length === 0 && !loadingData && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">No signups match the filters</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Log with Issues */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white">Activity Log & Issues</h3>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800">
            {activity.map(a => (
              <div key={a.id} className="px-5 py-3 hover:bg-slate-800/30">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{a.action}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{JSON.stringify(a.details)}</p>
                  </div>
                  <span className="text-[10px] text-slate-600">{new Date(a.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {activity.length === 0 && (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: any; label: string; value: any; color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
    <Icon className={`w-5 h-5 text-${color}-400 mb-2`} />
    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{label}</p>
    <p className="text-2xl font-black text-white mt-1">{value}</p>
  </div>
);

export default AdminDashboard;
