import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Menu, FileText, ChevronDown, Search, Download, Upload, Moon, Sun,
  Settings as SettingsIcon, LogOut, Share2, Copy, ShieldAlert, User as UserIcon,
  ExternalLink, X,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { StratLogo } from '@/components/branding/Logo';
import { StrategicPlan } from '@/lib/strategicPlanStore';

// External brand link (per spec)
const BRAND_EXTERNAL_URL = 'https://asilvainnovations.github.io/strat-planner-pwa/index.html';

interface TopbarProps {
  // Plans
  plans: StrategicPlan[];
  currentPlan: StrategicPlan | null;
  onSelectPlan: (id: string) => void;
  onExport: () => void;
  onImportClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // Mobile menu
  onOpenMobileMenu: () => void;

  // Auth
  isAuthenticated: boolean;
  isAdmin: boolean;
  userEmail?: string;
  userName: string;
  userInitials: string;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;

  // Share
  onShare: () => void;
  onRevokeShare: () => void;
  activeShareLink: string | null;

  // Search / navigation
  onNavigateView: (view: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({
  plans, currentPlan, onSelectPlan, onExport, onImportClick, fileInputRef, onImportFile,
  onOpenMobileMenu,
  isAuthenticated, isAdmin, userEmail, userName, userInitials,
  onSignIn, onSignOut, onOpenProfile, onOpenSettings, onOpenAdmin,
  onShare, onRevokeShare, activeShareLink,
  onNavigateView,
}) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme !== 'light';

  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const accountRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setShowAccountMenu(false);
      if (planRef.current && !planRef.current.contains(e.target as Node)) setShowPlanSelector(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Build searchable index from current plan
  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [] as { id: string; label: string; view: string; section: string }[];
    const out: { id: string; label: string; view: string; section: string }[] = [];

    // Static navigation targets — always searchable
    const navTargets = [
      { id: 'nav-dashboard', label: 'MEL Dashboard', view: 'dashboard', section: 'Navigation' },
      { id: 'nav-swot', label: 'SWOT Analysis', view: 'swot', section: 'Navigation' },
      { id: 'nav-systems', label: 'Systems Thinking', view: 'systems', section: 'Navigation' },
      { id: 'nav-strategy', label: 'Strategy Matrix (TOWS)', view: 'strategy', section: 'Navigation' },
      { id: 'nav-scorecard', label: 'Balanced Scorecard', view: 'scorecard', section: 'Navigation' },
      { id: 'nav-paps', label: 'PAPs Management', view: 'paps', section: 'Navigation' },
      { id: 'nav-templates', label: 'Templates Library', view: 'templates', section: 'Navigation' },
      { id: 'nav-team', label: 'Team Collaboration', view: 'team', section: 'Navigation' },
      { id: 'nav-export', label: 'Plan Export / Generator', view: 'export', section: 'Navigation' },
      { id: 'nav-settings', label: 'Settings', view: 'settings', section: 'Navigation' },
    ];
    navTargets.forEach(n => { if (n.label.toLowerCase().includes(term)) out.push(n); });

    if (!currentPlan) return out.slice(0, 12);

    // SWOT items (property is `description`, not `text`)
    (currentPlan.swotItems || []).forEach(s => {
      if ((s.description || '').toLowerCase().includes(term)) {
        out.push({
          id: s.id,
          label: `[${(s.category || '').toUpperCase()}] ${s.description}`,
          view: 'swot',
          section: 'SWOT',
        });
      }
    });
    // Strategic options
    (currentPlan.strategicOptions || []).forEach(o => {
      const hay = `${o.title || ''} ${o.description || ''}`.toLowerCase();
      if (hay.includes(term)) out.push({
        id: o.id,
        label: `[${o.optionType}] ${o.title || o.description || 'Option'}`,
        view: 'strategy',
        section: 'Strategy Matrix',
      });
    });
    // Objectives + KPIs
    (currentPlan.objectives || []).forEach(o => {
      if ((o.objective || '').toLowerCase().includes(term)) {
        out.push({ id: o.id, label: `Objective: ${o.objective}`, view: 'scorecard', section: 'Balanced Scorecard' });
      }
      (o.kpis || []).forEach(k => {
        if ((k.name || '').toLowerCase().includes(term)) {
          out.push({ id: k.id, label: `KPI: ${k.name}`, view: 'scorecard', section: 'KPIs' });
        }
      });
    });
    // PAPs
    (currentPlan.paps || []).forEach(p => {
      if ((p.name || '').toLowerCase().includes(term)) {
        out.push({ id: p.id, label: `PAP: ${p.name}`, view: 'paps', section: 'Initiatives' });
      }
    });

    return out.slice(0, 12);
  }, [searchTerm, currentPlan]);


  const handleSearchSelect = (view: string) => {
    setSearchOpen(false);
    setSearchTerm('');
    onNavigateView(view);
  };

  const ThemeIcon = isDark ? Moon : Sun;

  return (
    <header className="bg-[#0A1628]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 gap-2">

        {/* LEFT: hamburger + brand + plan selector */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-300 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand mark + name — external link */}
          <a
            href={BRAND_EXTERNAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0 group"
            title="Open Strat Planner PWA in new tab"
          >
            <StratLogo size="sm" />
            <span className="hidden xs:inline sm:inline font-black text-xs sm:text-sm tracking-tight text-white whitespace-nowrap">
              STRAT PLANNER<span className="text-cyan-400"> PRO</span>
            </span>
            <ExternalLink className="hidden sm:block w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </a>

          {/* Plan selector */}
          <div className="relative min-w-0" ref={planRef}>
            <button
              onClick={() => setShowPlanSelector(v => !v)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg sm:rounded-xl transition-all border border-white/10 min-w-0"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#3B82F6] flex-shrink-0" />
              <span className="font-semibold text-slate-100 text-xs sm:text-sm max-w-[80px] sm:max-w-[150px] lg:max-w-[200px] truncate">
                {currentPlan?.name || 'Select Plan'}
              </span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
            </button>

            {showPlanSelector && (
              <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-[#1E293B] rounded-2xl shadow-2xl border border-white/10 py-2 z-50 backdrop-blur-xl">
                <div className="max-h-60 overflow-y-auto px-2">
                  {plans.length === 0 && (
                    <p className="text-xs text-slate-500 px-3 py-2">No plans yet — create one to get started.</p>
                  )}
                  {plans.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { onSelectPlan(p.id); setShowPlanSelector(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        p.id === currentPlan?.id ? 'bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/30' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-semibold truncate text-sm">{p.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-medium tracking-tight truncate">{p.organization}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-3 pt-2 mt-2 border-t border-white/10 flex flex-col gap-1">
                  <button onClick={onExport} className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-white/10 rounded-lg text-xs font-medium">
                    <Download className="w-4 h-4" /> Export Backup
                  </button>
                  <button onClick={onImportClick} className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-white/10 rounded-lg text-xs font-medium">
                    <Upload className="w-4 h-4" /> Import Backup
                  </button>
                  <input type="file" ref={fileInputRef} onChange={onImportFile} className="hidden" accept=".json" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: search, share, theme, account */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

          {/* Share button (desktop only) */}
          {isAuthenticated && currentPlan && (
            <button
              onClick={onShare}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl text-xs font-bold border border-cyan-500/30 transition-colors"
              title="Create a public share link"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          )}

          {/* Search — collapsible on mobile */}
          <div className="relative" ref={searchRef}>
            {/* Mobile: icon-only toggle */}
            <button
              onClick={() => setSearchOpen(v => !v)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/10 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Desktop: always-visible input */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl border border-white/10 focus-within:border-cyan-500/50 transition-colors">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search plan, KPIs, modules…"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                className="bg-transparent border-none outline-none text-sm w-32 lg:w-56 text-slate-100 placeholder:text-slate-500"
              />
              {searchTerm && (
                <button onClick={() => { setSearchTerm(''); setSearchOpen(false); }} className="text-slate-500 hover:text-slate-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile popover input */}
            {searchOpen && (
              <div className="md:hidden absolute right-0 top-full mt-2 w-72 bg-[#1E293B] rounded-2xl shadow-2xl border border-white/10 p-3 z-50">
                <div className="flex items-center gap-2 px-2 py-1.5 bg-white/10 rounded-lg border border-white/10">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-full text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-64 overflow-y-auto">
                    {searchResults.map(r => (
                      <button
                        key={r.id}
                        onClick={() => handleSearchSelect(r.view)}
                        className="w-full text-left px-2 py-2 hover:bg-white/10 rounded-lg"
                      >
                        <p className="text-xs font-semibold text-white truncate">{r.label}</p>
                        <p className="text-[10px] text-cyan-400 uppercase tracking-wider">{r.section}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Desktop results dropdown */}
            {searchOpen && searchTerm && searchResults.length > 0 && (
              <div className="hidden md:block absolute right-0 top-full mt-2 w-80 bg-[#1E293B] rounded-2xl shadow-2xl border border-white/10 p-2 z-50 max-h-80 overflow-y-auto">
                {searchResults.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleSearchSelect(r.view)}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg group"
                  >
                    <p className="text-sm font-semibold text-white truncate">{r.label}</p>
                    <p className="text-[10px] text-cyan-400 uppercase tracking-wider">{r.section}</p>
                  </button>
                ))}
              </div>
            )}
            {searchOpen && searchTerm && searchResults.length === 0 && (
              <div className="hidden md:block absolute right-0 top-full mt-2 w-80 bg-[#1E293B] rounded-2xl shadow-2xl border border-white/10 p-4 z-50">
                <p className="text-xs text-slate-400">No results for "{searchTerm}"</p>
              </div>
            )}
          </div>

          {/* Theme toggle — actually functional now */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-lg text-slate-300 hover:text-[#FCD34D] hover:bg-white/10 transition-all"
            aria-label="Toggle theme"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <ThemeIcon className="w-5 h-5" />
          </button>

          {/* Account / Sign In */}
          {isAuthenticated ? (
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setShowAccountMenu(v => !v)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-white text-xs font-bold shadow-lg hover:scale-105 transition-transform border border-white/20"
                aria-label="Account menu"
              >
                {userInitials}
              </button>
              {showAccountMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#1E293B] rounded-2xl shadow-2xl border border-white/10 py-2 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-bold text-white truncate">{userName}</p>
                    <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 text-[9px] font-black px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                        SUPER ADMIN
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { onOpenSettings(); setShowAccountMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                  >
                    <SettingsIcon className="w-4 h-4" /> Settings
                  </button>
                  <button
                    onClick={() => { onOpenProfile(); setShowAccountMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                  >
                    <UserIcon className="w-4 h-4" /> Edit Profile
                  </button>
                  {currentPlan && (
                    <>
                      <button
                        onClick={onShare}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                      >
                        <Share2 className="w-4 h-4" /> Share Plan Link
                      </button>
                      {activeShareLink && (
                        <div className="mx-4 my-2 p-2 bg-slate-800 rounded-lg space-y-1">
                          <p className="text-[10px] text-cyan-400 font-bold">ACTIVE LINK</p>
                          <p className="text-[10px] text-slate-400 truncate">{activeShareLink}</p>
                          <div className="flex gap-1">
                            <button
                              onClick={() => navigator.clipboard?.writeText(activeShareLink)}
                              className="flex-1 text-[10px] py-1 bg-cyan-500/20 text-cyan-300 rounded flex items-center justify-center gap-1"
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                            <button
                              onClick={onRevokeShare}
                              className="flex-1 text-[10px] py-1 bg-rose-500/20 text-rose-300 rounded"
                            >
                              Revoke
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => { onOpenAdmin(); setShowAccountMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:bg-white/10"
                    >
                      <ShieldAlert className="w-4 h-4" /> Admin Dashboard
                    </button>
                  )}
                  <a
                    href={BRAND_EXTERNAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                  >
                    <ExternalLink className="w-4 h-4" /> Open PWA Site
                  </a>
                  <div className="border-t border-white/10 my-1" />
                  <button
                    onClick={() => { onSignOut(); setShowAccountMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-colors border border-[#3B82F6]/50 shadow-lg shadow-[#3B82F6]/20"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default React.memo(Topbar);
