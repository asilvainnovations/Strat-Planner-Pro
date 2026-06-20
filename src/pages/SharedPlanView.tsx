import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { StratLogo } from '@/components/branding/Logo';
import { Loader2, Lock, Eye, MessageCircle } from 'lucide-react';

interface ShareLink {
  share_id: string;
  plan_data: any;
  public_access: 'view' | 'comment';
  owner_email: string;
  revoked: boolean;
  created_at: string;
}

const SharedPlanView: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [link, setLink] = useState<ShareLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('share_links')
          .select('*')
          .eq('share_id', shareId)
          .maybeSingle();
        if (error || !data) throw new Error('Share link not found');
        if (data.revoked) throw new Error('This share link has been revoked by the owner');
        setLink(data as ShareLink);
      } catch (e: any) {
        setError(e?.message || 'Unable to load shared plan');
      } finally { setLoading(false); }
    })();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6">
        <Lock className="w-12 h-12 text-rose-400 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Plan Unavailable</h1>
        <p className="text-slate-400">{error || 'Unknown error'}</p>
      </div>
    );
  }

  const plan = link.plan_data || {};
  const cldNodes = plan.cldNodes || [];
  const cldLinks = plan.cldLinks || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StratLogo size="md" />
            <div>
              <h1 className="font-bold text-lg">{plan.name || 'Strategic Plan'}</h1>
              <p className="text-xs text-slate-500">Shared by {link.owner_email}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
            link.public_access === 'comment' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
          }`}>
            {link.public_access === 'comment' ? <><MessageCircle className="w-3 h-3" /> COMMENT</> : <><Eye className="w-3 h-3" /> READ-ONLY</>}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Plan summary */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-3">{plan.organization || 'Organization'}</h2>
          {plan.vision && <p className="text-sm text-slate-300"><span className="font-bold text-cyan-400">Vision:</span> {plan.vision}</p>}
          {plan.mission && <p className="text-sm text-slate-300 mt-2"><span className="font-bold text-cyan-400">Mission:</span> {plan.mission}</p>}
          {plan.strategicIntent && <p className="text-sm text-slate-300 mt-2"><span className="font-bold text-cyan-400">Strategic Intent:</span> {plan.strategicIntent}</p>}
        </section>

        {/* SWOT */}
        {plan.swotItems?.length > 0 && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-3">SWOT Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['strength', 'weakness', 'opportunity', 'threat'] as const).map(cat => (
                <div key={cat} className="bg-slate-800/40 rounded-xl p-3">
                  <h4 className="font-bold uppercase text-xs text-cyan-400 mb-2">{cat}s</h4>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {plan.swotItems.filter((i: any) => i.category === cat).map((i: any) => (
                      <li key={i.id}>• {i.description}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CLD */}
        {cldNodes.length > 0 && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-3">Causal Loop Diagram</h3>
            <p className="text-xs text-slate-400 mb-3">{cldNodes.length} variables, {cldLinks.length} causal links</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {cldNodes.slice(0, 16).map((n: any, i: number) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-2 text-xs">
                  <span className="font-bold text-cyan-300">{n.label || n.name || `Var ${i+1}`}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Objectives */}
        {plan.objectives?.length > 0 && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-3">Strategic Objectives</h3>
            <ul className="space-y-2">
              {plan.objectives.map((o: any) => (
                <li key={o.id} className="bg-slate-800/40 rounded-lg p-3">
                  <p className="font-bold text-white">{o.objective || o.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{o.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="text-center py-8 text-xs text-slate-600">
          Shared via Strat Planner Pro · {new Date(link.created_at).toLocaleDateString()}
        </footer>
      </main>
    </div>
  );
};

export default SharedPlanView;
