import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { AppProvider } from '@/contexts/AppContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

// ─── Core Pages (lazy loaded) ──────────────────────────────────────────────
const Index = lazy(() => import('@/pages/Index'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const SharedPlanView = lazy(() => import('@/pages/SharedPlanView'));

// ─── Loading Fallback ───────────────────────────────────────────────────────
const AppLoadingFallback = React.memo(() => (
  <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center p-6">
    <div className="relative mb-6">
      <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-cyan-400 shadow-2xl border border-white/20 animate-pulse">
        <img
          src="https://paibpwwszlfpsyytdnal.databasepad.com/storage/v1/object/public/pending-tasks/public/Strat%20Planner%20Pro%20logo.png"
          alt="Strat Planner Pro"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute -bottom-2 -right-2 w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
    </div>
    <h2 className="text-white font-bold text-xl mb-2">Loading Strat Planner Pro</h2>
    <p className="text-slate-400 text-sm">Initializing your strategic workspace...</p>
  </div>
));

// ─── Error Boundary for Better Error Handling ────────────────────────────────
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A1628] text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
            <p className="text-slate-400 mb-4">We're sorry, but an unexpected error occurred.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Query Client Setup ──────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      suspense: false,
    },
    mutations: { retry: 1 },
  },
});

// ─── Main Application Component ───────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="strat-planner-theme">
        <AppProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <Suspense fallback={<AppLoadingFallback />}>
                <Routes>
                  {/* Landing page + All authenticated routes handled by Index/AppLayout */}
                  <Route path="/*" element={<Index />} />
                  
                  {/* Admin Dashboard */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  
                  {/* Shared Plan View (public sharing) */}
                  <Route path="/shared/:shareId" element={<SharedPlanView />} />
                  
                  {/* 404 Not Found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            
            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(222.2 84% 8% / 0.9)',
                  color: 'hsl(210 40% 98%)',
                  border: '1px solid hsl(210 40% 98% / 0.1)',
                  backdropFilter: 'blur(16px) saturate(180%)',
                  borderRadius: '1rem',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
                },
              }}
            />
            
            <Sonner richColors position="top-right" duration={4000} closeButton theme="dark" />
          </BrowserRouter>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default React.memo(App);