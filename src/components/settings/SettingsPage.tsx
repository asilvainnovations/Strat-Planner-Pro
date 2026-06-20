import React, { useEffect, useState } from 'react';
import {
  User as UserIcon, Bell, Palette, Cpu, Shield, Languages,
  Plug, Save, CheckCircle2, Loader2,
  MessageSquare, Mail, BarChart, HardDrive, FileSpreadsheet,
  Zap, Trello, Github, Slack, Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth, UserProfile } from '@/hooks/useAuth';
import { StratLogo } from '@/components/branding/Logo';

type TabId = 'profile' | 'notifications' | 'theme' | 'ai' | 'security' | 'language' | 'integrations';

interface Settings {
  notifications: {
    email: boolean;
    weekly_digest: boolean;
    kpi_alerts: boolean;
    team_mentions: boolean;
    product_updates: boolean;
  };
  ai_config: {
    model: string;
    temperature: number;
    auto_suggest: boolean;
    verbose: boolean;
    persona: string;
  };
  integrations: Record<string, { enabled: boolean; api_key?: string; webhook_url?: string; account?: string }>;
  theme_settings: { mode: string; accent: string; density: string };
  language: string;
  security: { two_factor: boolean; session_timeout: number };
}

const DEFAULT_SETTINGS: Settings = {
  notifications: { email: true, weekly_digest: true, kpi_alerts: true, team_mentions: true, product_updates: false },
  ai_config: { model: 'google/gemini-3-flash', temperature: 0.7, auto_suggest: true, verbose: false, persona: 'senior_strategist' },
  integrations: {},
  theme_settings: { mode: 'dark', accent: 'blue', density: 'comfortable' },
  language: 'en',
  security: { two_factor: false, session_timeout: 60 },
};

const INTEGRATION_DEFS = [
  { id: 'whatsapp', name: 'WhatsApp Business', icon: MessageSquare, color: 'text-emerald-400', desc: 'Send plan updates & alerts via WhatsApp Business API' },
  { id: 'gmail', name: 'Google Email (Gmail)', icon: Mail, color: 'text-rose-400', desc: 'Send plan summaries and team digests through Gmail' },
  { id: 'google_analytics', name: 'Google Analytics', icon: BarChart, color: 'text-amber-400', desc: 'Pull web analytics into your KPI dashboards' },
  { id: 'google_drive', name: 'Google Drive', icon: HardDrive, color: 'text-blue-400', desc: 'Auto-backup plans and exports to Drive' },
  { id: 'google_sheets', name: 'Google Sheets', icon: FileSpreadsheet, color: 'text-green-400', desc: 'Two-way sync KPIs with Google Sheets' },
  { id: 'zapier', name: 'Zapier', icon: Zap, color: 'text-orange-400', desc: 'Trigger 5,000+ Zaps when KPIs cross thresholds' },
  { id: 'trello', name: 'Trello', icon: Trello, color: 'text-sky-400', desc: 'Push PAPs and activities into Trello boards' },
  { id: 'slack', name: 'Slack', icon: Slack, color: 'text-purple-400', desc: 'Receive plan notifications in your Slack workspace' },
  { id: 'github', name: 'GitHub', icon: Github, color: 'text-slate-300', desc: 'Link engineering initiatives to GitHub projects' },
  { id: 'calendar', name: 'Google Calendar', icon: Calendar, color: 'text-indigo-400', desc: 'Auto-schedule strategic reviews & PAP milestones' },
];

const SettingsPage: React.FC = () => {
  const { user, profile, updateProfile, updatePassword } = useAuth();
  const [tab, setTab] = useState<TabId>('profile');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [profileForm, setProfileForm] = useState({
    full_name: '', organization: '', job_title: '', phone: '', avatar_url: '',
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Load profile & settings
  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        organization: profile.organization || '',
        job_title: profile.job_title || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('user_settings').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setSettings({
          notifications: { ...DEFAULT_SETTINGS.notifications, ...(data.notifications || {}) },
          ai_config: { ...DEFAULT_SETTINGS.ai_config, ...(data.ai_config || {}) },
          integrations: data.integrations || {},
          theme_settings: { ...DEFAULT_SETTINGS.theme_settings, ...(data.theme_settings || {}) },
          language: data.language || 'en',
          security: { ...DEFAULT_SETTINGS.security, ...(data.security || {}) },
        });
      }
    })();
  }, [user]);

  const persistSettings = async (next: Settings) => {
    if (!user) return;
    setLoading(true);
    try {
      await supabase.from('user_settings').upsert({
        user_id: user.id, ...next, updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      setSavedAt(new Date().toLocaleTimeString());
    } finally { setLoading(false); }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(profileForm as Partial<UserProfile>);
      setSavedAt(new Date().toLocaleTimeString());
    } finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    if (passwordForm.next !== passwordForm.confirm) { alert('Passwords do not match'); return; }
    if (passwordForm.next.length < 6) { alert('Password too short'); return; }
    setLoading(true);
    try {
      await updatePassword(passwordForm.next);
      setPasswordForm({ current: '', next: '', confirm: '' });
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e: any) { alert(e?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const toggleIntegration = async (id: string, enabled: boolean) => {
    const next = {
      ...settings,
      integrations: {
        ...settings.integrations,
        [id]: { ...(settings.integrations[id] || {}), enabled },
      },
    };
    setSettings(next);
    await persistSettings(next);
  };

  const updateIntegrationField = async (id: string, field: string, value: string) => {
    const next = {
      ...settings,
      integrations: {
        ...settings.integrations,
        [id]: { ...(settings.integrations[id] || { enabled: false }), [field]: value },
      },
    };
    setSettings(next);
  };

  const TABS: { id: TabId; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'ai', label: 'AI Configuration', icon: Cpu },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'language', label: 'Language', icon: Languages },
    { id: 'integrations', label: 'Integrations', icon: Plug },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <StratLogo size="lg" withGlow />
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
          <p className="text-slate-400 text-sm">Configure your Strat Planner Pro experience</p>
        </div>
        {savedAt && (
          <div className="ml-auto flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> Saved at {savedAt}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 h-fit lg:sticky lg:top-4">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}>
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </aside>

        <main className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 min-h-[480px]">
          {tab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Profile Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name" value={profileForm.full_name} onChange={(v) => setProfileForm(s => ({ ...s, full_name: v }))} />
                <Field label="Organization" value={profileForm.organization} onChange={(v) => setProfileForm(s => ({ ...s, organization: v }))} />
                <Field label="Job Title" value={profileForm.job_title} onChange={(v) => setProfileForm(s => ({ ...s, job_title: v }))} />
                <Field label="Phone" value={profileForm.phone} onChange={(v) => setProfileForm(s => ({ ...s, phone: v }))} />
                <Field label="Avatar URL" value={profileForm.avatar_url} onChange={(v) => setProfileForm(s => ({ ...s, avatar_url: v }))} />
                <Field label="Email (read-only)" value={user?.email || ''} onChange={() => {}} disabled />
              </div>
              <PrimaryBtn onClick={handleSaveProfile} loading={loading}>Save Profile</PrimaryBtn>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white">Notification Settings</h2>
              {Object.entries(settings.notifications).map(([k, v]) => (
                <Toggle key={k} label={k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  value={v}
                  onChange={(val) => {
                    const next = { ...settings, notifications: { ...settings.notifications, [k]: val } };
                    setSettings(next); persistSettings(next);
                  }} />
              ))}
            </div>
          )}

          {tab === 'theme' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Theme Settings</h2>
              <SelectField label="Mode" value={settings.theme_settings.mode}
                options={['dark', 'light', 'system']}
                onChange={(v) => { const next = { ...settings, theme_settings: { ...settings.theme_settings, mode: v } }; setSettings(next); persistSettings(next); }} />
              <SelectField label="Accent Color" value={settings.theme_settings.accent}
                options={['blue', 'cyan', 'emerald', 'purple', 'rose', 'amber']}
                onChange={(v) => { const next = { ...settings, theme_settings: { ...settings.theme_settings, accent: v } }; setSettings(next); persistSettings(next); }} />
              <SelectField label="Density" value={settings.theme_settings.density}
                options={['compact', 'comfortable', 'spacious']}
                onChange={(v) => { const next = { ...settings, theme_settings: { ...settings.theme_settings, density: v } }; setSettings(next); persistSettings(next); }} />
            </div>
          )}

          {tab === 'ai' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">AI Configuration</h2>
              <p className="text-sm text-slate-400">Customize how the AI Strategist behaves across your strategic plans.</p>
              <SelectField label="Default AI Model" value={settings.ai_config.model}
                options={[
                  'google/gemini-3-flash', 'google/gemini-3-pro', 'gpt-5.4', 'gpt-5.4-mini',
                  'anthropic/claude-opus-4-7', 'anthropic/claude-sonnet-4-6', 'anthropic/claude-haiku-4-5'
                ]}
                onChange={(v) => { const next = { ...settings, ai_config: { ...settings.ai_config, model: v } }; setSettings(next); persistSettings(next); }} />
              <SelectField label="Strategist Persona" value={settings.ai_config.persona}
                options={['senior_strategist', 'investment_analyst', 'systems_thinker', 'critical_consultant', 'concise_advisor']}
                onChange={(v) => { const next = { ...settings, ai_config: { ...settings.ai_config, persona: v } }; setSettings(next); persistSettings(next); }} />
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Temperature ({settings.ai_config.temperature})</label>
                <input type="range" min={0} max={1.5} step={0.1} value={settings.ai_config.temperature}
                  onChange={(e) => { const next = { ...settings, ai_config: { ...settings.ai_config, temperature: parseFloat(e.target.value) } }; setSettings(next); }}
                  onMouseUp={() => persistSettings(settings)}
                  className="w-full accent-cyan-500" />
              </div>
              <Toggle label="Auto-suggest improvements while editing"
                value={settings.ai_config.auto_suggest}
                onChange={(v) => { const next = { ...settings, ai_config: { ...settings.ai_config, auto_suggest: v } }; setSettings(next); persistSettings(next); }} />
              <Toggle label="Verbose explanations"
                value={settings.ai_config.verbose}
                onChange={(v) => { const next = { ...settings, ai_config: { ...settings.ai_config, verbose: v } }; setSettings(next); persistSettings(next); }} />
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Security Settings</h2>
              <Toggle label="Two-Factor Authentication"
                value={settings.security.two_factor}
                onChange={(v) => { const next = { ...settings, security: { ...settings.security, two_factor: v } }; setSettings(next); persistSettings(next); }} />
              <SelectField label="Session Timeout (minutes)" value={String(settings.security.session_timeout)}
                options={['15', '30', '60', '120', '240', '480']}
                onChange={(v) => { const next = { ...settings, security: { ...settings.security, session_timeout: parseInt(v, 10) } }; setSettings(next); persistSettings(next); }} />

              <div className="border-t border-slate-800 pt-4">
                <h3 className="font-bold text-white mb-3">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="New Password" type="password" value={passwordForm.next} onChange={(v) => setPasswordForm(s => ({ ...s, next: v }))} />
                  <Field label="Confirm Password" type="password" value={passwordForm.confirm} onChange={(v) => setPasswordForm(s => ({ ...s, confirm: v }))} />
                </div>
                <PrimaryBtn onClick={handleChangePassword} loading={loading}>Update Password</PrimaryBtn>
              </div>
            </div>
          )}

          {tab === 'language' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Language Settings</h2>
              <SelectField label="Interface Language" value={settings.language}
                options={['en', 'es', 'fr', 'de', 'pt', 'ar', 'zh', 'ja', 'ko', 'hi', 'id', 'ms', 'tl']}
                onChange={(v) => { const next = { ...settings, language: v }; setSettings(next); persistSettings(next); }} />
              <p className="text-xs text-slate-500">English (en), Spanish (es), French (fr), German (de), Portuguese (pt), Arabic (ar), Chinese (zh), Japanese (ja), Korean (ko), Hindi (hi), Indonesian (id), Malay (ms), Filipino (tl)</p>
            </div>
          )}

          {tab === 'integrations' && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white">Integrations</h2>
              <p className="text-sm text-slate-400 mb-4">Connect external apps to extend your strategic workflow.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {INTEGRATION_DEFS.map(int => {
                  const Icon = int.icon;
                  const cfg = settings.integrations[int.id] || { enabled: false };
                  return (
                    <div key={int.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <Icon className={`w-6 h-6 ${int.color} flex-shrink-0 mt-0.5`} />
                          <div>
                            <h3 className="font-bold text-white text-sm">{int.name}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{int.desc}</p>
                          </div>
                        </div>
                        <button onClick={() => toggleIntegration(int.id, !cfg.enabled)}
                          className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${cfg.enabled ? 'bg-cyan-500' : 'bg-slate-600'}`}>
                          <span className={`absolute top-0.5 ${cfg.enabled ? 'right-0.5' : 'left-0.5'} w-5 h-5 rounded-full bg-white transition-all`} />
                        </button>
                      </div>
                      {cfg.enabled && (
                        <div className="space-y-2 pt-2 border-t border-slate-700">
                          <input
                            type="text" placeholder="API Key / Token"
                            value={cfg.api_key || ''}
                            onChange={(e) => updateIntegrationField(int.id, 'api_key', e.target.value)}
                            onBlur={() => persistSettings(settings)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                          <input
                            type="text" placeholder="Webhook URL or Account ID (optional)"
                            value={cfg.webhook_url || ''}
                            onChange={(e) => updateIntegrationField(int.id, 'webhook_url', e.target.value)}
                            onBlur={() => persistSettings(settings)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Helpers
const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean }> =
  ({ label, value, onChange, type = 'text', disabled }) => (
  <div>
    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60" />
  </div>
);

const SelectField: React.FC<{ label: string; value: string; options: string[]; onChange: (v: string) => void }> =
  ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Toggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
    <span className="text-sm font-medium text-white capitalize">{label}</span>
    <button onClick={() => onChange(!value)}
      className={`relative w-10 h-6 rounded-full transition-colors ${value ? 'bg-cyan-500' : 'bg-slate-600'}`}>
      <span className={`absolute top-0.5 ${value ? 'right-0.5' : 'left-0.5'} w-5 h-5 rounded-full bg-white transition-all`} />
    </button>
  </div>
);

const PrimaryBtn: React.FC<{ onClick: () => void; loading?: boolean; children: React.ReactNode }> =
  ({ onClick, loading, children }) => (
  <button onClick={onClick} disabled={loading}
    className="mt-4 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 transition-all flex items-center gap-2">
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
    {children}
  </button>
);

export default SettingsPage;
