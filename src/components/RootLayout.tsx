import { Outlet, Link, useLocation } from 'react-router';
import { Network, FileText, GitBranch, Lightbulb, LayoutDashboard } from 'lucide-react';

export function RootLayout() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/swot-input', label: 'SWOT Input', icon: FileText },
    { path: '/cld-builder', label: 'CLD Builder', icon: Network },
    { path: '/archetypes', label: 'Archetypes', icon: GitBranch },
    { path: '/strategic-options', label: 'Strategic Options', icon: Lightbulb },
  ];
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Network className="w-8 h-8 text-blue-600" />
              <h1 className="font-semibold text-slate-900">Strategy AI Planner</h1>
            </div>
            <p className="text-sm text-slate-600">Systems Thinking for Strategic Development</p>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex gap-2 mb-6 border-b border-slate-200">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
