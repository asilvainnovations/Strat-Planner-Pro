import React from 'react';
import {
  LayoutDashboard,
  Target,
  Sparkles,
  Network,
  BarChart3,
  FolderKanban, 
  FileText,
  Wifi,
  ArrowRight,
  Play,
  LogIn,
  User,
  Recycle,
  Leaf,
  TrendingUp,
  Users,
} from 'lucide-react';

interface HeroSectionProps {
  onStartPlanning: () => void;
  onViewDemo: () => void;
  onSignIn?: () => void;
  isAuthenticated?: boolean;
  userName?: string;
}

const features = [
  {
    icon: LayoutDashboard,
    title: 'Circular Economy MEL Dashboard',
    description: 'Monitor waste diversion, recycling rates, carbon footprint reduction, and green job creation in real-time.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Target,
    title: 'LGU Circular Readiness Assessment',
    description: 'Structured diagnostics for plastics management, organic waste systems, and green tourism capacity.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Network,
    title: 'Waste Systems Mapping',
    description: 'Visualize non-linear relationships in material flows, informal waste picker integration, and collection systems.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Sparkles,
    title: 'Circular Strategy Generator',
    description: 'AI-powered strategies for MRF optimization, composting programs, plastic reduction, and eco-tourism initiatives.',
    color: 'from-emerald-400 to-green-600',
  },
  {
    icon: BarChart3,
    title: 'Environmental & Economic Scorecard',
    description: 'Track KPIs across environmental impact, green jobs created, local revenue from circular enterprises, and community participation.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: FolderKanban,
    title: 'Circular Projects Management',
    description: 'Track Programs, Activities, and Projects for waste diversion, recycling facilities, and sustainability initiatives.',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    icon: FileText,
    title: 'DENR/DILG Compliance Reports',
    description: 'Generate print-ready Circular Economy Transition Roadmaps and sustainability reports for LGU councils and national agencies.',
    color: 'from-slate-500 to-slate-700',
  },
  {
    icon: Wifi,
    title: 'Field-Ready Offline PWA',
    description: 'Progressive Web App capabilities allow ENRO staff and field teams to plan and monitor anywhere, even without connectivity.',
    color: 'from-purple-500 to-violet-600',
  },
];

const HeroSection: React.FC<HeroSectionProps> = ({ 
  onStartPlanning, 
  onViewDemo, 
  onSignIn, 
  isAuthenticated,
  userName 
}) => {
  return (
    <div className="min-h-screen bg-slate-900 selection:bg-emerald-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Navigation Bar */}
        <nav className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-sm tracking-tight text-white">STRAT PLANNER<span className="text-emerald-400 font-black">PRO</span></h1>
                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Circular LGU Edition</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">EU-PH Green Economy Ready</span>
              </div>
              
              {isAuthenticated ? (
                <button 
                  onClick={onStartPlanning}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-all border border-slate-700"
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  {userName || 'Dashboard'}
                </button>
              ) : (
                <button 
                  onClick={onSignIn}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 hover:bg-emerald-50 rounded-lg text-sm font-bold transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Body */}
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Leaf className="w-3.5 h-3.5" />
            Digital Enabling Platform for Circular Economy Transitions
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-[1.1]">
            Empowering LGUs to Lead <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-500 to-teal-400">
              Inclusive Circular Economy Transitions
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            A systems-thinking platform customized for Cagayan de Oro, Maasin, San Carlos, and Sorsogon Cities 
            to plan, visualize, and track their transition to circular economies—reducing plastic and organic waste, 
            creating green jobs, and building climate-resilient local systems.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              onClick={onStartPlanning}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Start Circular Planning
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onViewDemo}
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 text-white rounded-xl font-bold text-lg border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 text-emerald-400" />
              View Demo for LGUs
            </button>
          </div>

          {/* Interactive Preview Mockup */}
          <div className="relative max-w-5xl mx-auto mt-12 group">
             <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
             <div className="relative bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                  <span className="ml-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Circular Economy Dashboard · Cagayan de Oro City</span>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                  <div className="col-span-2 space-y-6">
                    <div className="h-40 bg-slate-800/50 rounded-xl border border-slate-700 p-4 flex flex-col justify-between">
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400">Waste Diversion Trend</span>
                          <span className="text-xs text-emerald-400 font-bold">+24.7%</span>
                       </div>
                       <div className="flex items-end gap-1.5 h-20">
                          {[35, 48, 52, 61, 58, 73, 69, 78, 85, 92].map((h, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-emerald-600 to-cyan-400 rounded-sm" style={{height: `${h}%`}} />
                          ))}
                       </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Plastic Diverted</span>
                          <div className="text-2xl font-black text-emerald-400 mt-1">142T</div>
                       </div>
                       <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Green Jobs</span>
                          <div className="text-2xl font-black text-cyan-400 mt-1">48</div>
                       </div>
                       <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Organic Waste</span>
                          <div className="text-2xl font-black text-amber-400 mt-1">89%</div>
                       </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4" />
                    <span className="text-sm font-bold text-white">Calculating Impact...</span>
                    <p className="text-[10px] text-slate-500 mt-2">Real-time carbon footprint reduction based on waste diversion</p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group p-6 rounded-2xl hover:bg-slate-800/50 transition-all duration-300 border border-transparent hover:border-slate-700"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-3xl mx-auto px-6 pb-32 text-center">
           <div className="p-12 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 shadow-3xl">
              <h2 className="text-3xl font-black text-white mb-4">Ready to Accelerate Your City's Circular Transition?</h2>
              <p className="text-slate-400 mb-10">
                Join ASilva Innovations and empower your LGU with the digital tools to reduce waste, create green jobs, 
                and build climate-resilient local economies rooted in sustainability.
              </p>
              <button 
                onClick={onStartPlanning}
                className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-2xl font-black text-xl hover:shadow-2xl hover:shadow-emerald-500/40 transition-all hover:scale-105 active:scale-95"
              >
                Launch Circular Planning
              </button>
           </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-12 bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
                   <Recycle className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white tracking-tight">STRAT PLANNER PRO</span>
              </div>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">ASilva Innovations © 2026</p>
            </div>
            
            <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">System Status</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HeroSection;