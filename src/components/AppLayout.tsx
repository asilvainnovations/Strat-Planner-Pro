import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useStrategicPlan } from '@/hooks/useStrategicPlan';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { StratLogo } from '@/components/branding/Logo';

// ─── LAZY LOADED COMPONENTS ───────────────────────────────────────────────────
// Sidebar & Topbar load first (shell), content components load after
const Sidebar = lazy(() => import('./strategic/Sidebar'));
const Topbar  = lazy(() => import('./strategic/Topbar'));
const AuthModal        = lazy(() => import('./auth/AuthModal'));
const UserProfileModal = lazy(() => import('./auth/UserProfileModal'));
const SettingsPage     = lazy(() => import('./settings/SettingsPage'));

// ─── HERO loads immediately (it's the first thing users see)
const HeroSection = lazy(() => import('./strategic/HeroSection'));

// ─── Content views — each chunk is a separate JS bundle loaded on demand
const MELDashboard     = lazy(() => import('./strategic/MELDashboard'));
const SWOTAnalysis     = lazy(() => import('./strategic/SWOTAnalysis'));
const SystemsThinking  = lazy(() => import('./strategic/SystemsThinking'));
const StrategyMatrix   = lazy(() => import('./strategic/StrategyMatrix'));
const BalancedScorecard = lazy(() => import('./strategic/BalancedScorecard'));
const PAPsManagement   = lazy(() => import('./strategic/PAPsManagement'));
const PlanExport       = lazy(() => import('./strategic/PlanExport'));
const TeamCollaboration = lazy(() => import('./strategic/TeamCollaboration'));
const TemplatesLibrary  = lazy(() => import('./strategic/TemplatesLibrary'));
const NavigationTutorial = lazy(() => import('./strategic/NavigationTutorial'));

import { PlanTemplate } from '@/lib/templateData';
import { Loader2 } from 'lucide-react';

// ─── LOADERS ──────────────────────────────────────────────────────────────────

const GlobalLoader = React.memo(({ message }: { message: string }) => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
    <div className="relative mb-6">
      <StratLogo size="xl" withGlow className="animate-pulse" />
      <Loader2 className="absolute -bottom-2 -right-2 w-8 h-8 text-primary animate-spin" />
    </div>
    <h2 className="text-foreground font-bold text-xl mb-2">{message}</h2>
    <p className="text-muted-foreground text-sm">Initializing strategic workspace…</p>
  </div>
));

const LazyFallback = React.memo(() => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
  </div>
));

// ─── PATH / VIEW MAPS (shared constants, no re-creation) ─────────────────────
const VIEW_TO_PATH: Record<string, string> = {
  dashboard: '/mel-dashboard',
  swot:      '/swot-analysis',
  systems:   '/systems-thinking',
  strategy:  '/strategy-matrix',
  scorecard: '/balanced-scorecard',
  paps:      '/paps-management',
  templates: '/templates-library',
  team:      '/team-collaboration',
  settings:  '/settings',
  export:    '/export-plan',
};

const PATH_TO_VIEW: Record<string, string> = Object.fromEntries(
  Object.entries(VIEW_TO_PATH).map(([v, p]) => [p, v])
);

const COMPONENT_TO_VIEW: Record<string, string> = {
  SWOTAnalysis: 'swot', MELDashboard: 'dashboard', StrategicPlanning: 'strategy',
  SystemsThinking: 'systems', BalancedScorecard: 'scorecard', PAPsManagement: 'paps',
  TemplatesLibrary: 'templates', TeamCollaboration: 'team', Settings: 'settings', PlanExport: 'export',
};

// ─── MAIN LAYOUT ──────────────────────────────────────────────────────────────

const AppLayout: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── AUTH ─────────────────────────────────────────────────────────────────
  const {
    user, profile, isAuthenticated, isAdmin, isLoading: authLoading,
    signUp, signIn, signOut, resetPassword, updatePassword, updateProfile, signInWithMagicLink,
  } = useAuth();

  // ─── STRATEGIC PLAN ───────────────────────────────────────────────────────
  const {
    plans, currentPlan, activeView, isOnline, lastSynced, isLoading: plansLoading,
    setActiveView, setCurrentPlan, createPlan,
    addSWOTItem, updateSWOTItem, removeSWOTItem, bulkAddSWOTItems,
    addStrategicOption, updateStrategicOption, removeStrategicOption, bulkAddStrategicOptions,
    addObjective, updateObjective, removeObjective,
    addKPI, updateKPI, removeKPI,
    addPAP, updatePAP, removePAP,
  } = useStrategicPlan();

  // ─── UI STATE ─────────────────────────────────────────────────────────────
  const [uiState, setUiState] = useState({
    showLanding: true,
    sidebarCollapsed: false,
    isMobileMenuOpen: false,
    showPlanSelector: false,
    showAuthModal: false,
    showProfileModal: false,
    showAccountMenu: false,
    showTutorial: false,
    activeShareLink: null as string | null,
  });

  const updateUiState = useCallback((updates: Partial<typeof uiState>) =>
    setUiState(prev => ({ ...prev, ...updates })), []);

  // ─── URL SYNC ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const view = PATH_TO_VIEW[location.pathname];
    if (view) setActiveView(view);
  }, [location.pathname, setActiveView]);

  // ─── TUTORIAL ─────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      if (!localStorage.getItem('strategic-planner-tutorial-seen') && !uiState.showLanding)
        updateUiState({ showTutorial: true });
    } catch {}
  }, [uiState.showLanding, updateUiState]);

  const handleTutorialComplete = useCallback(() => {
    try { localStorage.setItem('strategic-planner-tutorial-seen', '1'); } catch {}
  }, []);

  // ─── USER INFO ────────────────────────────────────────────────────────────
  const userDisplayInfo = useMemo(() => {
    const email   = user?.email || '';
    const name    = profile?.full_name || email.split('@')[0] || 'User';
    const initials = profile?.full_name
      ? profile.full_name.split(' ').map((n: string) => n[0]?.toUpperCase()).filter(Boolean).join('').slice(0, 2)
      : (email.charAt(0).toUpperCase() || 'U');
    return { name, initials };
  }, [profile?.full_name, user?.email]);

  // ─── HANDLERS ─────────────────────────────────────────────────────────────
  const goToView = useCallback((view: string) => {
    setActiveView(view);
    navigate(VIEW_TO_PATH[view] || '/mel-dashboard');
  }, [setActiveView, navigate]);

  const handleExportData = useCallback(() => {
    if (!currentPlan) return;
    const a = document.createElement('a');
    a.href = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentPlan, null, 2));
    a.download = `${currentPlan.name.replace(/\s+/g, '_')}_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }, [currentPlan]);

  const handleImportData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    const fr = new FileReader();
    fr.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        createPlan({ name: `${imported.name || 'Imported Plan'} (Imported)`, organization: imported.organization || profile?.organization || 'My Organization' });
      } catch { alert("Invalid file format."); }
    };
    fr.readAsText(files[0]);
    event.target.value = '';
  }, [createPlan, profile?.organization]);

  const handleStartPlanning = useCallback(() => {
    updateUiState({ showLanding: false });
    if (!currentPlan) {
      if (plans.length > 0) setCurrentPlan(plans[0].id);
      else createPlan({ name: 'New Strategic Plan', organization: profile?.organization || 'My Organization' });
    }
    navigate('/mel-dashboard');
  }, [currentPlan, plans, setCurrentPlan, createPlan, profile?.organization, navigate, updateUiState]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    updateUiState({ showAccountMenu: false, showProfileModal: false, showLanding: true });
    navigate('/admin');
  }, [signOut, navigate, updateUiState]);

  const handleCreateFromTemplate = useCallback((templateData: PlanTemplate['plan_data']) => {
    const newPlan = createPlan({
      name: `${templateData.name} (from template)`,
      organization: templateData.organization || profile?.organization || '',
      vision: templateData.vision, mission: templateData.mission,
      strategicIntent: templateData.strategicIntent,
    });
    if (newPlan?.id) {
      if (templateData.swotItems?.length)      bulkAddSWOTItems(templateData.swotItems.map(item => ({ ...item, aiGenerated: false })));
      if (templateData.strategicOptions?.length) bulkAddStrategicOptions(templateData.strategicOptions);
      if (templateData.objectives?.length)
        templateData.objectives.forEach(obj => addObjective({ perspective: obj.perspective, objective: obj.objective, description: obj.description, weight: obj.weight }));
      goToView('dashboard');
    }
  }, [createPlan, profile?.organization, bulkAddSWOTItems, bulkAddStrategicOptions, addObjective, goToView]);

  const handleShare = useCallback(async () => {
    if (!currentPlan || !user) { alert('Sign in and select a plan to share'); return; }
    try {
      const shareId = `${currentPlan.id.slice(0, 8)}-${Math.random().toString(36).substring(2, 10)}`;
      await supabase.from('share_links').insert({ share_id: shareId, plan_id: currentPlan.id, owner_id: user.id, owner_email: user.email, plan_data: currentPlan, public_access: 'view' });
      const url = `${window.location.origin}/shared/${shareId}`;
      updateUiState({ activeShareLink: url });
      navigator.clipboard?.writeText(url);
    } catch (e: any) { alert(e?.message || 'Failed to create share link'); }
  }, [currentPlan, user, updateUiState]);

  const handleRevokeShare = useCallback(async () => {
    if (!uiState.activeShareLink) return;
    const shareId = uiState.activeShareLink.split('/shared/')[1];
    await supabase.from('share_links').update({ revoked: true }).eq('share_id', shareId);
    updateUiState({ activeShareLink: null });
    alert('Share link revoked');
  }, [uiState.activeShareLink, updateUiState]);

  const navigateToView = useCallback((viewId: string) => {
    const view = COMPONENT_TO_VIEW[viewId] || viewId;
    goToView(view);
  }, [goToView]);

  // ─── CONTENT RENDERER ─────────────────────────────────────────────────────
  const renderContent = useCallback(() => {
    const common = { plan: currentPlan, onNavigate: navigateToView };
    switch (activeView) {
      case 'dashboard':  return <MELDashboard {...common} />;
      case 'swot':       return <SWOTAnalysis {...common} onUpdateItem={updateSWOTItem} onBulkAdd={bulkAddSWOTItems} />;
      case 'systems':    return <SystemsThinking {...common} onUpdateItem={updateSWOTItem} />;
      case 'strategy':   return <StrategyMatrix {...common} onUpdateOption={updateStrategicOption} onRemoveOption={removeStrategicOption} onBulkAdd={bulkAddStrategicOptions} />;
      case 'scorecard':  return <BalancedScorecard {...common} onUpdateObjective={updateObjective} onAddKPI={addKPI} onUpdateKPI={updateKPI} onRemoveKPI={removeKPI} />;
      case 'paps':       return <PAPsManagement {...common} onUpdatePAP={updatePAP} removePAP={removePAP} />;
      case 'templates':  return <TemplatesLibrary currentPlan={currentPlan} onCreateFromTemplate={handleCreateFromTemplate} userId={user?.id} userEmail={user?.email} userName={userDisplayInfo.name} userOrganization={profile?.organization || ''} isAuthenticated={isAuthenticated} />;
      case 'team':       return <TeamCollaboration {...common} userId={user?.id} userEmail={user?.email} userName={userDisplayInfo.name} />;
      case 'settings':   return <SettingsPage />;
      case 'export':     return <PlanExport {...common} />;
      default:           return <MELDashboard {...common} />;
    }
  }, [activeView, currentPlan, user, profile, isAuthenticated, userDisplayInfo.name,
    updateSWOTItem, bulkAddSWOTItems, updateStrategicOption, removeStrategicOption,
    bulkAddStrategicOptions, updateObjective, addKPI, updateKPI, removeKPI,
    updatePAP, removePAP, handleCreateFromTemplate, navigateToView]);

  const isLoading = authLoading || (isAuthenticated && plansLoading);

  // ─── LANDING ──────────────────────────────────────────────────────────────
  if (uiState.showLanding && !currentPlan) {
    return (
      <Suspense fallback={<GlobalLoader message="Loading experience…" />}>
        <HeroSection
          onStartPlanning={handleStartPlanning}
          onViewDemo={() => updateUiState({ showLanding: false })}
          onSignIn={() => updateUiState({ showAuthModal: true })}
          isAuthenticated={isAuthenticated}
          userName={userDisplayInfo.name}
        />
      </Suspense>
    );
  }

  // ─── MAIN LAYOUT ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden transition-colors duration-300">
      <Suspense fallback={<div className={`w-16 lg:w-64 bg-sidebar shrink-0`} />}>
        <Sidebar
          activeView={activeView}
          onViewChange={goToView}
          isCollapsed={uiState.sidebarCollapsed}
          onToggleCollapse={() => updateUiState({ sidebarCollapsed: !uiState.sidebarCollapsed })}
          isOnline={isOnline}
          lastSynced={lastSynced}
          planName={currentPlan?.name}
          isMobileMenuOpen={uiState.isMobileMenuOpen}
          onCloseMobileMenu={() => updateUiState({ isMobileMenuOpen: false })}
          onShowTutorial={() => updateUiState({ showTutorial: true })}
          onShowProfile={() => updateUiState({ showProfileModal: true })}
        />
      </Suspense>

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${uiState.sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* TOPBAR */}
        <Suspense fallback={<div className="h-14 bg-background/80 border-b border-border" />}>
          <Topbar
            plans={plans}
            currentPlan={currentPlan}
            onSelectPlan={(id) => setCurrentPlan(id)}
            onExport={handleExportData}
            onImportClick={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            onImportFile={handleImportData}
            onOpenMobileMenu={() => updateUiState({ isMobileMenuOpen: true })}
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            userEmail={user?.email}
            userName={userDisplayInfo.name}
            userInitials={userDisplayInfo.initials}
            onSignIn={() => updateUiState({ showAuthModal: true })}
            onSignOut={handleSignOut}
            onOpenProfile={() => updateUiState({ showProfileModal: true })}
            onOpenSettings={() => goToView('settings')}
            onOpenAdmin={() => navigate('/admin')}
            onShare={handleShare}
            onRevokeShare={handleRevokeShare}
            activeShareLink={uiState.activeShareLink}
            onNavigateView={goToView}
          />
        </Suspense>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<LazyFallback />}>{renderContent()}</Suspense>
          </div>
        </main>
      </div>

      {/* MODALS — deferred until needed */}
      {uiState.showAuthModal && (
        <Suspense fallback={null}>
          <AuthModal isOpen onClose={() => updateUiState({ showAuthModal: false })} onSuccess={() => updateUiState({ showAuthModal: false })} signUp={signUp} signIn={signIn} resetPassword={resetPassword} signInWithMagicLink={signInWithMagicLink} />
        </Suspense>
      )}
      {uiState.showProfileModal && (
        <Suspense fallback={null}>
          <UserProfileModal isOpen onClose={() => updateUiState({ showProfileModal: false })} profile={profile} userEmail={user?.email || ''} onUpdateProfile={updateProfile} onSignOut={handleSignOut} onUpdatePassword={updatePassword} />
        </Suspense>
      )}
      {uiState.showTutorial && (
        <Suspense fallback={null}>
          <NavigationTutorial isOpen onClose={() => updateUiState({ showTutorial: false })} onComplete={handleTutorialComplete} />
        </Suspense>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <GlobalLoader message="Syncing your strategy…" />
        </div>
      )}
    </div>
  );
};

export default React.memo(AppLayout);
