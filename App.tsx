import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  ShieldAlert, 
  TrendingUp, 
  Briefcase, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Save, 
  ChevronRight, 
  BarChart3, 
  PieChart, 
  ArrowRight,
  Settings,
  DollarSign,
  Users,
  Zap,
  BookOpen,
  Network,
  Workflow,
  Lightbulb,
  X,
  RefreshCw,
  MoveRight,
  GitBranch,
  Scale
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

// --- Types & Interfaces ---

type View = 'dashboard' | 'foundation' | 'swot' | 'strategy' | 'bsc' | 'map' | 'systems' | 'actions';

interface SwotItem {
  id: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  text: string;
}

interface StrategyItem {
  id: string;
  type: 'SO' | 'WO' | 'ST' | 'WT'; // TOWS Matrix types
  title: string;
  description: string;
  relatedSwotIds: string[];
}

interface Objective {
  id: string;
  perspective: 'financial' | 'customer' | 'internal' | 'learning';
  text: string;
}

interface KPI {
  id: string;
  objectiveId: string;
  name: string;
  target: number;
  current: number;
  unit: string;
}

interface ActionPlan {
  id: string;
  strategyId: string;
  title: string;
  owner: string;
  budget: number;
  deadline: string;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
}

interface StrategyMapLink {
  id: string;
  sourceId: string;
  targetId: string;
}

interface SystemArchetype {
  id: string;
  type: 'fixes_that_fail' | 'limits_to_growth' | 'shifting_the_burden' | 'drifting_goals' | 'success_to_the_successful' | 'escalation' | 'growth_and_underinvestment' | 'tragedy_of_the_commons';
  title: string;
  variables: Record<string, string>; // Dynamic keys based on archetype
  analysis: string;
}

interface StrategicData {
  companyName: string;
  vision: string;
  mission: string;
  values: string[];
  swot: SwotItem[];
  strategies: StrategyItem[];
  objectives: Objective[];
  kpis: KPI[];
  actions: ActionPlan[];
  strategyMapLinks: StrategyMapLink[];
  archetypes: SystemArchetype[];
}

// --- Constants ---
const LOGO_URL = "https://appimize.app/assets/apps/user_1097/images/af83c19720de_707_1097.png";

// --- Initial Data ---

const INITIAL_DATA: StrategicData = {
  companyName: "ASilva Innovations",
  vision: "To be the global leader in sustainable innovation.",
  mission: "Delivering high-quality, eco-friendly solutions that empower communities.",
  values: ["Innovation", "Integrity", "Sustainability", "Customer Focus"],
  swot: [
    { id: 's1', type: 'strength', text: 'Strong brand recognition' },
    { id: 's2', type: 'strength', text: 'Proprietary technology' },
    { id: 'w1', type: 'weakness', text: 'High operational costs' },
    { id: 'o1', type: 'opportunity', text: 'Emerging markets in Asia' },
    { id: 't1', type: 'threat', text: 'New regulatory changes' }
  ],
  strategies: [
    { id: 'st1', type: 'SO', title: 'Asian Expansion', description: 'Leverage brand to enter Asian markets', relatedSwotIds: ['s1', 'o1'] }
  ],
  objectives: [
    { id: 'obj1', perspective: 'financial', text: 'Increase Revenue Growth' },
    { id: 'obj2', perspective: 'customer', text: 'Improve Customer Retention' },
    { id: 'obj3', perspective: 'internal', text: 'Streamline Production' },
    { id: 'obj4', perspective: 'learning', text: 'Upskill Workforce' }
  ],
  kpis: [
    { id: 'kpi1', objectiveId: 'obj1', name: 'Annual Revenue', target: 5000000, current: 4200000, unit: 'USD' },
    { id: 'kpi2', objectiveId: 'obj2', name: 'NPS Score', target: 75, current: 68, unit: 'Score' }
  ],
  actions: [
    { id: 'act1', strategyId: 'st1', title: 'Launch Singapore Office', owner: 'Sarah Chen', budget: 150000, deadline: '2024-12-01', status: 'in-progress', progress: 45 }
  ],
  strategyMapLinks: [
    { id: 'link1', sourceId: 'obj4', targetId: 'obj3' },
    { id: 'link2', sourceId: 'obj3', targetId: 'obj1' },
    { id: 'link3', sourceId: 'obj2', targetId: 'obj1' }
  ],
  archetypes: []
};

// --- Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = 'primary', className = "", disabled = false }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:opacity-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

const ProgressBar = ({ value, max, color = "bg-blue-600" }: { value: number, max: number, color?: string }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [data, setData] = useState<StrategicData>(() => {
    const saved = localStorage.getItem('strategicPlanData');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('strategicPlanData', JSON.stringify(data));
  }, [data]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const updateData = (updates: Partial<StrategicData>) => {
    setData(prev => ({ ...prev, ...updates }));
    showNotification("Changes saved successfully");
  };

  // --- Views ---

  const DashboardView = () => {
    const kpiProgress = data.kpis.map(k => ({
      name: k.name,
      progress: (k.current / k.target) * 100
    }));

    const statusCounts = data.actions.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = [
      { name: 'Completed', value: statusCounts['completed'] || 0, color: '#22c55e' },
      { name: 'In Progress', value: statusCounts['in-progress'] || 0, color: '#3b82f6' },
      { name: 'Planned', value: statusCounts['planned'] || 0, color: '#94a3b8' },
      { name: 'Delayed', value: statusCounts['delayed'] || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Strategies</div>
            <div className="text-3xl font-bold text-slate-800 mt-2">{data.strategies.length}</div>
          </Card>
          <Card className="p-6 border-l-4 border-l-emerald-500">
            <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">KPIs On Track</div>
            <div className="text-3xl font-bold text-slate-800 mt-2">
              {data.kpis.filter(k => (k.current / k.target) >= 0.9).length}
              <span className="text-sm text-slate-400 font-normal ml-2">/ {data.kpis.length}</span>
            </div>
          </Card>
          <Card className="p-6 border-l-4 border-l-purple-500">
            <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">Active Actions</div>
            <div className="text-3xl font-bold text-slate-800 mt-2">
              {data.actions.filter(a => a.status === 'in-progress').length}
            </div>
          </Card>
          <Card className="p-6 border-l-4 border-l-amber-500">
            <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">Budget Utilized</div>
            <div className="text-3xl font-bold text-slate-800 mt-2">
              {Math.round(data.actions.reduce((acc, curr) => acc + (curr.progress/100 * curr.budget), 0) / 1000)}k
              <span className="text-sm text-slate-400 font-normal ml-2">USD</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" /> KPI Performance Overview
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiProgress}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
                  <YAxis unit="%" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" /> Action Plan Status
            </h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-800">{data.actions.length}</span>
                <span className="text-xs text-slate-500 uppercase">Actions</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const StrategyMapView = () => {
    const [linkMode, setLinkMode] = useState<{ active: boolean, source: string | null }>({ active: false, source: null });
    
    // Perspectives layout order (top to bottom)
    const perspectiveOrder: Objective['perspective'][] = ['financial', 'customer', 'internal', 'learning'];
    const perspectiveConfig = {
      financial: { label: 'Financial', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: DollarSign },
      customer: { label: 'Customer', color: 'bg-blue-50 border-blue-200 text-blue-800', icon: Users },
      internal: { label: 'Internal Process', color: 'bg-slate-50 border-slate-200 text-slate-800', icon: Settings },
      learning: { label: 'Learning & Growth', color: 'bg-purple-50 border-purple-200 text-purple-800', icon: BookOpen }
    };

    const handleNodeClick = (id: string) => {
      if (!linkMode.active) return;
      
      if (linkMode.source === null) {
        setLinkMode({ ...linkMode, source: id });
      } else {
        if (linkMode.source !== id) {
          // Check if link already exists
          const exists = data.strategyMapLinks.find(
            l => (l.sourceId === linkMode.source && l.targetId === id) || 
                 (l.sourceId === id && l.targetId === linkMode.source)
          );
          
          if (!exists) {
            updateData({
              strategyMapLinks: [
                ...data.strategyMapLinks, 
                { id: Math.random().toString(36).substr(2, 9), sourceId: linkMode.source, targetId: id }
              ]
            });
          }
        }
        setLinkMode({ active: false, source: null });
      }
    };

    const deleteLink = (id: string) => {
      updateData({ strategyMapLinks: data.strategyMapLinks.filter(l => l.id !== id) });
    };

    // Calculate node positions for SVG lines
    // This is a simplified calculation - in a real app we'd use refs to get exact coordinates
    const getNodePosition = (objId: string, perspectives: typeof perspectiveOrder, objectives: Objective[]) => {
      const obj = objectives.find(o => o.id === objId);
      if (!obj) return { x: 0, y: 0 };
      
      const pIndex = perspectives.indexOf(obj.perspective);
      const rowObjs = objectives.filter(o => o.perspective === obj.perspective);
      const colIndex = rowObjs.findIndex(o => o.id === objId);
      
      // Assume layout: 4 rows, evenly spaced items
      // Row height approx 160px, Item width approx 250px
      // Center of item
      return {
        x: (colIndex * 300) + 150, // Base offset + spacing
        y: (pIndex * 180) + 80     // Header offset + spacing
      };
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Strategy Map</h2>
            <p className="text-slate-500">Visualize cause-and-effect relationships between objectives.</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={linkMode.active ? 'danger' : 'secondary'}
              onClick={() => setLinkMode(prev => ({ active: !prev.active, source: null }))}
            >
              {linkMode.active ? 'Cancel Linking' : 'Link Objectives'}
              <Network className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {linkMode.active && (
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm animate-pulse">
            <Lightbulb className="w-4 h-4" />
            {linkMode.source ? "Select the target objective to complete the link." : "Select the source objective to start linking."}
          </div>
        )}

        <div className="relative overflow-x-auto pb-10">
          <div className="min-w-[800px] space-y-8 relative">
            {/* SVG Layer for Arrows */}
            <svg className="absolute inset-0 pointer-events-none w-full h-full z-10" style={{ minHeight: '800px' }}>
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                </marker>
              </defs>
              {data.strategyMapLinks.map(link => {
                const start = getNodePosition(link.sourceId, perspectiveOrder, data.objectives);
                const end = getNodePosition(link.targetId, perspectiveOrder, data.objectives);
                // Only render if valid coordinates
                if (start.x === 0 || end.x === 0) return null;
                
                // Draw curve
                const path = `M ${start.x} ${start.y + 40} C ${start.x} ${start.y + 100}, ${end.x} ${end.y - 100}, ${end.x} ${end.y - 40}`;

                return (
                  <g key={link.id} className="group cursor-pointer pointer-events-auto" onClick={() => deleteLink(link.id)}>
                    <path 
                      d={path} 
                      stroke="#cbd5e1" 
                      strokeWidth="2" 
                      fill="none" 
                      markerEnd="url(#arrowhead)"
                      className="group-hover:stroke-red-400 transition-colors"
                    />
                    {/* Invisible thicker path for easier clicking */}
                    <path d={path} stroke="transparent" strokeWidth="15" fill="none" />
                  </g>
                );
              })}
            </svg>

            {perspectiveOrder.map((perspective) => {
              const config = perspectiveConfig[perspective];
              const objectives = data.objectives.filter(o => o.perspective === perspective);

              return (
                <div key={perspective} className="relative z-20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}`}>
                      <config.icon className={`w-5 h-5 ${config.color.split(' ').pop()}`} />
                    </div>
                    <h3 className="font-bold text-slate-700">{config.label}</h3>
                  </div>
                  
                  <div className="flex gap-8 p-4 bg-slate-50/50 rounded-xl min-h-[140px] items-center">
                    {objectives.map((obj, idx) => (
                      <div 
                        key={obj.id}
                        onClick={() => handleNodeClick(obj.id)}
                        className={`
                          w-[250px] p-4 rounded-xl border-2 bg-white shadow-sm cursor-pointer transition-all hover:-translate-y-1 relative
                          ${linkMode.active && linkMode.source === obj.id ? 'border-blue-500 ring-4 ring-blue-100' : 'border-slate-200 hover:border-blue-300'}
                          ${linkMode.active && !linkMode.source ? 'hover:ring-2 hover:ring-blue-100' : ''}
                        `}
                      >
                        <div className="text-sm font-bold text-slate-800 text-center">{obj.text}</div>
                        {data.strategyMapLinks.filter(l => l.sourceId === obj.id).length > 0 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold border border-white">
                            {data.strategyMapLinks.filter(l => l.sourceId === obj.id).length}
                          </div>
                        )}
                      </div>
                    ))}
                    {objectives.length === 0 && (
                      <div className="w-full text-center text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-xl p-4">
                        No objectives in this perspective
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const SystemsThinkingView = () => {
    const [wizard, setWizard] = useState<{ active: boolean, type: SystemArchetype['type'] | null }>({ active: false, type: null });
    const [newItem, setNewItem] = useState<Partial<SystemArchetype>>({ variables: {} });
    
    // Extended templates list based on standard archetypes
    const templates = [
      { id: 'fixes_that_fail', title: 'Fixes That Fail', desc: 'A quick fix solves the symptom but creates a long-term consequence that brings the symptom back.' },
      { id: 'limits_to_growth', title: 'Limits to Growth', desc: 'A process grows for a while, but then runs into a limiting condition (resource, capacity, etc.).' },
      { id: 'shifting_the_burden', title: 'Shifting the Burden', desc: 'A symptomatic solution is used, reducing the pressure to implement a fundamental solution.' },
      { id: 'drifting_goals', title: 'Drifting Goals', desc: 'A gap between goal and reality is closed by lowering the goal rather than improving reality.' },
      { id: 'success_to_the_successful', title: 'Success to the Successful', desc: 'Two activities compete for limited resources. The more successful one gets more resources, fueling further success.' },
      { id: 'growth_and_underinvestment', title: 'Growth & Underinvestment', desc: 'Growth approaches a limit which can be eliminated by investment, but investment is not made fast enough.' },
      { id: 'escalation', title: 'Escalation', desc: 'Two parties compete for superiority, and every action by one is met by a counter-action from the other.' },
      { id: 'tragedy_of_the_commons', title: 'Tragedy of the Commons', desc: 'Individuals use a commonly available resource for personal gain, leading to the depletion of that resource.' },
    ];

    const handleCreate = () => {
      if (newItem.title && wizard.type) {
        updateData({
          archetypes: [...data.archetypes, {
            id: Math.random().toString(36).substr(2, 9),
            type: wizard.type,
            title: newItem.title,
            variables: newItem.variables || {},
            analysis: newItem.analysis || ''
          }]
        });
        setWizard({ active: false, type: null });
        setNewItem({ variables: {} });
      }
    };

    const renderLoopVisualization = (arch: SystemArchetype) => {
      const Arrow = () => (
        <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
        </marker>
      );
      
      const Node = ({ x, y, text, color = "bg-white border-slate-200" }: any) => (
        <g transform={`translate(${x},${y})`}>
          <foreignObject width="100" height="60" x="-50" y="-30">
            <div className={`w-full h-full flex items-center justify-center p-2 text-center text-[10px] font-bold leading-tight rounded border ${color} shadow-sm`}>
              {text}
            </div>
          </foreignObject>
        </g>
      );

      const LoopLabel = ({ x, y, type }: any) => (
        <g transform={`translate(${x},${y})`}>
          <circle r="12" fill={type === 'R' ? '#fef2f2' : '#eff6ff'} stroke={type === 'R' ? '#ef4444' : '#3b82f6'} />
          <text y="4" textAnchor="middle" className="text-xs font-bold" fill={type === 'R' ? '#ef4444' : '#3b82f6'}>{type}</text>
        </g>
      );

      switch(arch.type) {
        case 'fixes_that_fail':
          return (
            <svg viewBox="0 0 400 200" className="w-full max-w-md mx-auto my-4 bg-white rounded-lg">
              <defs><Arrow /></defs>
              <Node x={100} y={100} text={arch.variables.symptom || "Symptom"} color="bg-red-50 border-red-200" />
              <Node x={250} y={50} text={arch.variables.fix || "Fix"} color="bg-blue-50 border-blue-200" />
              <Node x={350} y={150} text={arch.variables.consequence || "Consequence"} color="bg-slate-50 border-slate-200" />
              
              <path d="M 110 80 Q 175 40 200 50" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <path d="M 240 60 Q 175 110 140 105" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <LoopLabel x={175} y={80} type="B" />

              <path d="M 290 50 Q 350 40 350 120" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <path d="M 340 160 Q 200 180 140 120" fill="none" stroke="#64748b" strokeDasharray="4" markerEnd="url(#arrow)" />
              <LoopLabel x={300} y={130} type="R" />
            </svg>
          );

        case 'limits_to_growth':
          return (
             <svg viewBox="0 0 400 200" className="w-full max-w-md mx-auto my-4 bg-white rounded-lg">
              <defs><Arrow /></defs>
              <Node x={200} y={100} text={arch.variables.condition || "Performance"} color="bg-emerald-50 border-emerald-200" />
              <Node x={60} y={100} text={arch.variables.action || "Growing Action"} color="bg-blue-50 border-blue-200" />
              <Node x={340} y={100} text={arch.variables.limit || "Limiting Condition"} color="bg-red-50 border-red-200" />
              
              {/* Growth Loop (R) */}
              <path d="M 70 80 Q 135 40 180 80" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <path d="M 180 120 Q 135 160 70 120" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <LoopLabel x={125} y={100} type="R" />

              {/* Limiting Loop (B) */}
              <path d="M 220 80 Q 270 40 320 80" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <path d="M 320 120 Q 270 160 220 120" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <LoopLabel x={270} y={100} type="B" />
            </svg>
          );

        case 'shifting_the_burden':
          return (
             <svg viewBox="0 0 400 250" className="w-full max-w-md mx-auto my-4 bg-white rounded-lg">
              <defs><Arrow /></defs>
              <Node x={200} y={40} text={arch.variables.symptom || "Problem Symptom"} color="bg-red-50 border-red-200" />
              <Node x={80} y={140} text={arch.variables.symptomatic_solution || "Symptomatic Solution"} color="bg-blue-50 border-blue-200" />
              <Node x={320} y={140} text={arch.variables.fundamental_solution || "Fundamental Solution"} color="bg-emerald-50 border-emerald-200" />
              <Node x={200} y={220} text={arch.variables.side_effect || "Side Effect"} color="bg-slate-50 border-slate-200" />
              
              {/* Symptomatic Loop (B) */}
              <path d="M 180 50 Q 80 50 80 110" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <path d="M 90 120 Q 180 120 180 70" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <LoopLabel x={130} y={80} type="B" />

              {/* Fundamental Loop (B) */}
              <path d="M 220 50 Q 320 50 320 110" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <path d="M 310 120 Q 220 120 220 70" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <LoopLabel x={270} y={80} type="B" />

              {/* Side Effect Loop (R) */}
              <path d="M 100 170 Q 140 220 160 220" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <path d="M 240 220 Q 300 220 320 170" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
            </svg>
          );

        case 'success_to_the_successful':
           return (
             <svg viewBox="0 0 400 200" className="w-full max-w-md mx-auto my-4 bg-white rounded-lg">
              <defs><Arrow /></defs>
              <Node x={200} y={100} text={arch.variables.resource || "Resources / Allocation"} color="bg-slate-100 border-slate-300" />
              
              {/* Loop A */}
              <Node x={80} y={50} text={arch.variables.success_a || "Success A"} color="bg-blue-50 border-blue-200" />
              <path d="M 160 80 Q 120 80 110 70" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <path d="M 100 40 Q 150 20 190 70" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <LoopLabel x={140} y={50} type="R" />

              {/* Loop B */}
              <Node x={320} y={150} text={arch.variables.success_b || "Success B"} color="bg-red-50 border-red-200" />
              <path d="M 210 130 Q 250 150 280 150" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <path d="M 300 140 Q 250 120 240 120" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <LoopLabel x={260} y={130} type="R" />
            </svg>
          );

        case 'drifting_goals':
          return (
             <svg viewBox="0 0 400 200" className="w-full max-w-md mx-auto my-4 bg-white rounded-lg">
              <defs><Arrow /></defs>
              <Node x={200} y={100} text={arch.variables.gap || "Gap"} color="bg-slate-50 border-slate-200" />
              <Node x={60} y={100} text={arch.variables.pressure || "Pressure to Lower Goal"} color="bg-red-50 border-red-200" />
              <Node x={340} y={100} text={arch.variables.action || "Corrective Action"} color="bg-blue-50 border-blue-200" />
              <Node x={200} y={20} text={arch.variables.goal || "Goal"} color="bg-emerald-50 border-emerald-200" />
              
              {/* Goal Erosion Loop (B) */}
              <path d="M 160 90 Q 100 80 80 90" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <path d="M 70 80 Q 120 40 160 40" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <LoopLabel x={120} y={70} type="B" />

              {/* Action Loop (B) */}
              <path d="M 240 90 Q 300 80 320 90" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <path d="M 330 130 Q 250 160 210 130" fill="none" stroke="#64748b" markerEnd="url(#arrow)" />
              <LoopLabel x={280} y={110} type="B" />
            </svg>
          );

        default:
          return <div className="h-32 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm">Diagram visualization coming soon for this archetype.</div>;
      }
    };

    const renderInputs = () => {
      switch(wizard.type) {
        case 'fixes_that_fail':
          return (
            <>
               <input placeholder="Symptom (e.g. Low Cash)" className="w-full p-2 border rounded mb-2" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, symptom: e.target.value } })} />
               <input placeholder="Quick Fix (e.g. Borrowing)" className="w-full p-2 border rounded mb-2" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, fix: e.target.value } })} />
               <input placeholder="Consequence (e.g. Interest Payments)" className="w-full p-2 border rounded" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, consequence: e.target.value } })} />
            </>
          );
        case 'limits_to_growth':
          return (
            <>
               <input placeholder="Growing Action (e.g. Marketing)" className="w-full p-2 border rounded mb-2" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, action: e.target.value } })} />
               <input placeholder="Condition/State (e.g. Sales)" className="w-full p-2 border rounded mb-2" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, condition: e.target.value } })} />
               <input placeholder="Limiting Condition (e.g. Market Saturation)" className="w-full p-2 border rounded" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, limit: e.target.value } })} />
            </>
          );
        case 'shifting_the_burden':
          return (
            <>
               <input placeholder="Problem Symptom" className="w-full p-2 border rounded mb-2" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, symptom: e.target.value } })} />
               <input placeholder="Symptomatic Solution (Quick Fix)" className="w-full p-2 border rounded mb-2" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, symptomatic_solution: e.target.value } })} />
               <input placeholder="Fundamental Solution (Root Cause Fix)" className="w-full p-2 border rounded mb-2" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, fundamental_solution: e.target.value } })} />
               <input placeholder="Side Effect (Why Fundamental is delayed)" className="w-full p-2 border rounded" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, side_effect: e.target.value } })} />
            </>
          );
        case 'drifting_goals':
          return (
            <>
               <input placeholder="Goal" className="w-full p-2 border rounded mb-2" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, goal: e.target.value } })} />
               <input placeholder="Gap / Pressure to Lower Goal" className="w-full p-2 border rounded mb-2" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, pressure: e.target.value } })} />
               <input placeholder="Corrective Action (if goal was held)" className="w-full p-2 border rounded" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, action: e.target.value } })} />
            </>
          );
        case 'success_to_the_successful':
           return (
            <>
               <input placeholder="Shared Resource" className="w-full p-2 border rounded mb-2" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, resource: e.target.value } })} />
               <input placeholder="Success of Party A" className="w-full p-2 border rounded mb-2" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, success_a: e.target.value } })} />
               <input placeholder="Success of Party B" className="w-full p-2 border rounded" onChange={e => setNewItem({ ...newItem, variables: { ...newItem.variables, success_b: e.target.value } })} />
            </>
          );
        default:
          return <div className="text-sm text-slate-500 italic p-2 bg-slate-50 rounded">Generic analysis mode selected. Enter details below.</div>;
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Systems Thinking</h2>
            <p className="text-slate-500">Analyze complex problems using system archetypes.</p>
          </div>
          <Button onClick={() => setWizard({ active: true, type: null })}><Plus className="w-4 h-4" /> New Analysis</Button>
        </div>

        {wizard.active && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="text-xl font-bold">Systems Analysis Wizard</h3>
                <button onClick={() => setWizard({ active: false, type: null })}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {!wizard.type ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map(t => (
                      <button 
                        key={t.id}
                        onClick={() => setWizard({ active: true, type: t.id as SystemArchetype['type'] })}
                        className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left flex flex-col h-full"
                      >
                        <div className="flex items-center gap-2 mb-2 text-blue-600">
                          <Workflow className="w-6 h-6" />
                          <h4 className="font-bold text-slate-800">{t.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto">
                    <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-2 text-blue-800 text-sm">
                      <Workflow className="w-4 h-4" />
                      Creating: <span className="font-bold">{templates.find(t => t.id === wizard.type)?.title}</span>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Analysis Title</label>
                      <input 
                        className="w-full p-2 border rounded-lg"
                        placeholder="e.g., The Innovation Trap"
                        value={newItem.title || ''}
                        onChange={e => setNewItem({...newItem, title: e.target.value})}
                      />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <h4 className="font-bold text-sm text-slate-700 mb-3 uppercase tracking-wider">System Variables</h4>
                      {renderInputs()}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Strategic Insight & Leverage Points</label>
                      <textarea 
                        className="w-full p-2 border rounded-lg"
                        rows={4}
                        placeholder="Where can we intervene to change the system behavior?"
                        value={newItem.analysis || ''}
                        onChange={e => setNewItem({...newItem, analysis: e.target.value})}
                      />
                    </div>
                  </div>
                )}
              </div>

              {wizard.type && (
                <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                  <Button variant="ghost" onClick={() => setWizard({ active: true, type: null })}>Back to Menu</Button>
                  <Button onClick={handleCreate}>Generate Archetype</Button>
                </div>
              )}
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {data.archetypes.map(arch => (
            <Card key={arch.id} className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {templates.find(t => t.id === arch.type)?.title}
                    </span>
                    <h3 className="text-xl font-bold text-slate-800">{arch.title}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => updateData({ archetypes: data.archetypes.filter(a => a.id !== arch.id) })}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 border border-slate-100 rounded-xl p-6 bg-slate-50/50 shadow-inner flex items-center justify-center min-h-[300px]">
                  {renderLoopVisualization(arch)}
                </div>
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                    <h4 className="flex items-center gap-2 font-bold text-amber-800 mb-2">
                      <Lightbulb className="w-4 h-4" /> Strategic Analysis
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{arch.analysis}</p>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-xl p-5">
                     <h4 className="font-bold text-slate-700 mb-3 text-xs uppercase">Defined Variables</h4>
                     <ul className="space-y-2">
                       {Object.entries(arch.variables).map(([key, value]) => (
                         <li key={key} className="text-sm flex flex-col">
                           <span className="text-xs text-slate-400 capitalize">{key.replace('_', ' ')}</span>
                           <span className="font-medium text-slate-800">{value}</span>
                         </li>
                       ))}
                     </ul>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {data.archetypes.length === 0 && (
            <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
              <Workflow className="w-16 h-16 mx-auto mb-4 text-slate-200" />
              <h3 className="text-lg font-bold text-slate-700">No Systems Analysis Yet</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">Start by identifying recurring problems or patterns in your organization using the standard system archetypes.</p>
              <Button onClick={() => setWizard({ active: true, type: null })}>
                <Plus className="w-4 h-4" /> Start Analysis Wizard
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const FoundationView = () => {
    const [newValue, setNewValue] = useState("");
    
    const addValue = () => {
      if (newValue.trim()) {
        updateData({ values: [...data.values, newValue.trim()] });
        setNewValue("");
      }
    };

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Strategic Foundation</h2>
          <p className="text-slate-500 mt-2">Define the core identity and north star of the organization.</p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Organization Name</label>
              <input 
                type="text" 
                value={data.companyName}
                onChange={(e) => updateData({ companyName: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Vision Statement</label>
              <textarea 
                value={data.vision}
                onChange={(e) => updateData({ vision: e.target.value })}
                rows={3}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Where do we want to be in the future?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mission Statement</label>
              <textarea 
                value={data.mission}
                onChange={(e) => updateData({ mission: e.target.value })}
                rows={3}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="What do we do, for whom, and how?"
              />
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Core Values</h3>
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addValue()}
              placeholder="Add a new core value..."
              className="flex-1 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Button onClick={addValue}><Plus className="w-5 h-5" /> Add</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {data.values.map((val, idx) => (
              <div key={idx} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full flex items-center gap-2 group">
                <span className="font-medium">{val}</span>
                <button 
                  onClick={() => updateData({ values: data.values.filter((_, i) => i !== idx) })}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {data.values.length === 0 && <p className="text-slate-400 italic">No values defined yet.</p>}
          </div>
        </Card>
      </div>
    );
  };

  const SwotView = () => {
    const quadrants = [
      { type: 'strength', title: 'Strengths', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
      { type: 'weakness', title: 'Weaknesses', icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
      { type: 'opportunity', title: 'Opportunities', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
      { type: 'threat', title: 'Threats', icon: Target, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    ];

    const addItem = (type: SwotItem['type']) => {
      const text = prompt(`Add new ${type}:`);
      if (text) {
        updateData({ 
          swot: [...data.swot, { id: Math.random().toString(36).substr(2, 9), type, text }] 
        });
      }
    };

    const deleteItem = (id: string) => {
      updateData({ swot: data.swot.filter(i => i.id !== id) });
    };

    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">SWOT Analysis</h2>
          <span className="text-sm text-slate-500">Analyze internal and external factors</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {quadrants.map((q) => (
            <Card key={q.type} className={`p-4 h-full flex flex-col border-t-4 ${q.border}`}>
              <div className={`flex justify-between items-center mb-4 pb-2 border-b border-slate-100`}>
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${q.bg}`}>
                    <q.icon className={`w-5 h-5 ${q.color}`} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-700">{q.title}</h3>
                </div>
                <Button variant="ghost" onClick={() => addItem(q.type as SwotItem['type'])}>
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {data.swot.filter(item => item.type === q.type).map(item => (
                  <div key={item.id} className="group flex justify-between items-start p-3 bg-slate-50 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
                    <p className="text-slate-700 text-sm leading-relaxed">{item.text}</p>
                    <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {data.swot.filter(item => item.type === q.type).length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm italic">
                    Click + to add item
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const StrategyView = () => {
    const [newStrat, setNewStrat] = useState<Partial<StrategyItem>>({ type: 'SO' });
    const [isCreating, setIsCreating] = useState(false);

    const getSwotItems = (types: string[]) => data.swot.filter(s => types.includes(s.type));

    const handleCreate = () => {
      if (newStrat.title && newStrat.description) {
        updateData({
          strategies: [...data.strategies, {
            id: Math.random().toString(36).substr(2, 9),
            type: newStrat.type as StrategyItem['type'],
            title: newStrat.title,
            description: newStrat.description,
            relatedSwotIds: newStrat.relatedSwotIds || []
          }]
        });
        setIsCreating(false);
        setNewStrat({ type: 'SO' });
      }
    };

    const getTypeLabel = (type: string) => {
      const map: Record<string, string> = { 
        'SO': 'Maxi-Maxi (Expansive)', 
        'WO': 'Mini-Maxi (Developmental)', 
        'ST': 'Maxi-Mini (Maintenance)', 
        'WT': 'Mini-Mini (Defensive)' 
      };
      return map[type];
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">TOWS Strategy Matrix</h2>
            <p className="text-slate-500">Derive strategies from SWOT combinations.</p>
          </div>
          <Button onClick={() => setIsCreating(true)}><Plus className="w-4 h-4" /> New Strategy</Button>
        </div>

        {isCreating && (
          <Card className="p-6 border-blue-200 border-2">
            <h3 className="font-bold text-lg mb-4">Define New Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Strategy Type</label>
                  <select 
                    className="w-full p-2 border rounded-lg bg-white"
                    value={newStrat.type}
                    onChange={(e) => setNewStrat({...newStrat, type: e.target.value as StrategyItem['type']})}
                  >
                    <option value="SO">SO (Strengths + Opportunities)</option>
                    <option value="WO">WO (Weaknesses + Opportunities)</option>
                    <option value="ST">ST (Strengths + Threats)</option>
                    <option value="WT">WT (Weaknesses + Threats)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Title</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-lg" 
                    placeholder="E.g., Market Penetration in Asia"
                    value={newStrat.title || ''}
                    onChange={e => setNewStrat({...newStrat, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Description</label>
                  <textarea 
                    className="w-full p-2 border rounded-lg" 
                    rows={3}
                    placeholder="Describe the strategic initiative..."
                    value={newStrat.description || ''}
                    onChange={e => setNewStrat({...newStrat, description: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreate}>Save Strategy</Button>
                  <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm text-slate-500 uppercase mb-2">Reference SWOT Items</h4>
                <div className="space-y-4 h-64 overflow-y-auto">
                  {newStrat.type?.includes('S') && (
                    <div>
                      <p className="text-xs font-bold text-emerald-600 mb-1">Strengths</p>
                      {getSwotItems(['strength']).map(s => (
                        <div key={s.id} className="text-xs bg-white p-2 border mb-1 rounded">{s.text}</div>
                      ))}
                    </div>
                  )}
                  {newStrat.type?.includes('W') && (
                    <div>
                      <p className="text-xs font-bold text-amber-600 mb-1">Weaknesses</p>
                      {getSwotItems(['weakness']).map(s => (
                        <div key={s.id} className="text-xs bg-white p-2 border mb-1 rounded">{s.text}</div>
                      ))}
                    </div>
                  )}
                  {newStrat.type?.includes('O') && (
                    <div>
                      <p className="text-xs font-bold text-blue-600 mb-1">Opportunities</p>
                      {getSwotItems(['opportunity']).map(s => (
                        <div key={s.id} className="text-xs bg-white p-2 border mb-1 rounded">{s.text}</div>
                      ))}
                    </div>
                  )}
                  {newStrat.type?.includes('T') && (
                    <div>
                      <p className="text-xs font-bold text-red-600 mb-1">Threats</p>
                      {getSwotItems(['threat']).map(s => (
                        <div key={s.id} className="text-xs bg-white p-2 border mb-1 rounded">{s.text}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['SO', 'WO', 'ST', 'WT'].map(type => (
            <Card key={type} className="flex flex-col h-full">
              <div className="p-4 border-b bg-slate-50 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">{type} Strategies</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-white border rounded text-slate-500">
                    {getTypeLabel(type)}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3 flex-1">
                {data.strategies.filter(s => s.type === type).map(s => (
                  <div key={s.id} className="p-3 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-800">{s.title}</h4>
                      <button onClick={() => updateData({ strategies: data.strategies.filter(x => x.id !== s.id) })} className="text-slate-300 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600">{s.description}</p>
                  </div>
                ))}
                {data.strategies.filter(s => s.type === type).length === 0 && (
                  <p className="text-sm text-slate-400 italic text-center py-4">No strategies defined.</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const BscView = () => {
    const [activeTab, setActiveTab] = useState<Objective['perspective']>('financial');
    
    const perspectives = [
      { id: 'financial', label: 'Financial', icon: DollarSign, color: 'text-emerald-600' },
      { id: 'customer', label: 'Customer', icon: Users, color: 'text-blue-600' },
      { id: 'internal', label: 'Internal Process', icon: Settings, color: 'text-slate-600' },
      { id: 'learning', label: 'Learning & Growth', icon: BookOpen, color: 'text-purple-600' },
    ];

    const addObjective = () => {
      const text = prompt('Enter new objective:');
      if (text) {
        updateData({ 
          objectives: [...data.objectives, { id: Math.random().toString(36).substr(2, 9), perspective: activeTab, text }] 
        });
      }
    };

    const addKPI = (objId: string) => {
      // Simplified for this demo - normally a modal
      const name = prompt('KPI Name:');
      if (!name) return;
      const target = Number(prompt('Target Value:'));
      const unit = prompt('Unit (e.g. $, %, #):') || '';
      
      if (name && !isNaN(target)) {
        updateData({
          kpis: [...data.kpis, {
            id: Math.random().toString(36).substr(2, 9),
            objectiveId: objId,
            name,
            target,
            current: 0,
            unit
          }]
        });
      }
    };

    const updateKPI = (kpiId: string, current: number) => {
      updateData({
        kpis: data.kpis.map(k => k.id === kpiId ? { ...k, current } : k)
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Balanced Scorecard</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {perspectives.map(p => (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id as Objective['perspective'])}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === p.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <p.icon className="w-4 h-4" />
                <span className="hidden md:inline">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              {perspectives.find(p => p.id === activeTab)?.label} Objectives
            </h3>
            <Button onClick={addObjective}><Plus className="w-4 h-4" /> Add Objective</Button>
          </div>

          <div className="space-y-6">
            {data.objectives.filter(o => o.perspective === activeTab).map(obj => (
              <div key={obj.id} className="border border-slate-200 rounded-xl p-6 bg-slate-50/50">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-lg text-slate-800">{obj.text}</h4>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="text-xs h-8" onClick={() => addKPI(obj.id)}>+ Add KPI</Button>
                    <button 
                      onClick={() => updateData({ objectives: data.objectives.filter(x => x.id !== obj.id) })}
                      className="text-slate-300 hover:text-red-500 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {data.kpis.filter(k => k.objectiveId === obj.id).map(kpi => (
                    <div key={kpi.id} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-slate-700">{kpi.name}</span>
                        <div className="text-xs text-slate-500">Target: {kpi.target} {kpi.unit}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <ProgressBar value={kpi.current} max={kpi.target} />
                        </div>
                        <div className="w-24">
                          <input 
                            type="number" 
                            className="w-full text-right p-1 border rounded text-sm"
                            value={kpi.current}
                            onChange={(e) => updateKPI(kpi.id, Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.kpis.filter(k => k.objectiveId === obj.id).length === 0 && (
                    <div className="text-center text-sm text-slate-400 py-2">No KPIs tracked for this objective.</div>
                  )}
                </div>
              </div>
            ))}
             {data.objectives.filter(o => o.perspective === activeTab).length === 0 && (
               <div className="text-center py-12 text-slate-400">
                 <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
                 <p>No objectives defined for this perspective yet.</p>
               </div>
             )}
          </div>
        </Card>
      </div>
    );
  };

  const ActionView = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Action Plans</h2>
          <Button onClick={() => {
            if(data.strategies.length === 0) {
              alert("Create a strategy first!");
              return;
            }
            // Add logic to add action
            const title = prompt("Action Title:");
            if (title) {
               updateData({
                 actions: [...data.actions, {
                   id: Math.random().toString(36).substr(2, 9),
                   strategyId: data.strategies[0].id,
                   title,
                   owner: 'Unassigned',
                   budget: 0,
                   deadline: new Date().toISOString().split('T')[0],
                   status: 'planned',
                   progress: 0
                 }]
               })
            }
          }}><Plus className="w-4 h-4" /> New Initiative</Button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="p-4">Initiative</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.actions.map(action => (
                  <tr key={action.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-medium text-slate-800">{action.title}</td>
                    <td className="p-4">
                       <input 
                        className="bg-transparent border-none focus:ring-0 p-0 w-full"
                        value={action.owner} 
                        onChange={(e) => updateData({
                          actions: data.actions.map(a => a.id === action.id ? {...a, owner: e.target.value} : a)
                        })}
                      />
                    </td>
                    <td className="p-4 text-slate-500">{action.deadline}</td>
                    <td className="p-4 font-mono text-slate-600">
                      $<input 
                        type="number"
                        className="bg-transparent w-20 border-b border-dotted border-slate-300"
                        value={action.budget}
                        onChange={(e) => updateData({
                          actions: data.actions.map(a => a.id === action.id ? {...a, budget: Number(e.target.value)} : a)
                        })}
                      />
                    </td>
                    <td className="p-4">
                      <select 
                        value={action.status}
                        onChange={(e) => updateData({
                          actions: data.actions.map(a => a.id === action.id ? {...a, status: e.target.value as any} : a)
                        })}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-none outline-none cursor-pointer
                          ${action.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                            action.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            action.status === 'delayed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                          }`}
                      >
                        <option value="planned">Planned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="delayed">Delayed</option>
                      </select>
                    </td>
                    <td className="p-4 w-48">
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={action.progress}
                          onChange={(e) => updateData({
                            actions: data.actions.map(a => a.id === action.id ? {...a, progress: Number(e.target.value)} : a)
                          })}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full"
                        />
                        <span className="text-xs w-8 text-right">{action.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => updateData({ actions: data.actions.filter(a => a.id !== action.id) })}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.actions.length === 0 && (
              <div className="text-center py-12 text-slate-400">No action plans created yet.</div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // --- Layout ---

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white mb-2">
            <img src={LOGO_URL} alt="StratPlan Logo" className="w-10 h-10 object-contain bg-white/10 rounded-lg p-1" />
            <span className="font-bold text-lg tracking-tight">StratPlan Pro</span>
          </div>
          <p className="text-xs text-slate-500 ml-1">Strategic Management Suite</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'foundation', label: 'Foundation', icon: Briefcase },
            { id: 'swot', label: 'SWOT Analysis', icon: Target },
            { id: 'strategy', label: 'Strategy Options', icon: CheckCircle2 },
            { id: 'bsc', label: 'Balanced Scorecard', icon: BarChart3 },
            { id: 'map', label: 'Strategy Map', icon: Network },
            { id: 'systems', label: 'Systems Thinking', icon: Workflow },
            { id: 'actions', label: 'Action Plans', icon: Zap },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
              JD
            </div>
            <div>
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center lg:hidden gap-3">
             <img src={LOGO_URL} alt="StratPlan Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-slate-800">StratPlan</span>
          </div>
          <h1 className="hidden lg:block text-xl font-bold text-slate-800 capitalize">
            {activeView === 'bsc' ? 'Balanced Scorecard' : activeView.replace('-', ' ')}
          </h1>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden md:inline">Last saved: Just now</span>
            <Button variant="primary" className="text-sm h-9" onClick={() => showNotification("Plan exported to PDF (Demo)")}>
              <Save className="w-4 h-4" /> Export Report
            </Button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 relative">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'foundation' && <FoundationView />}
          {activeView === 'swot' && <SwotView />}
          {activeView === 'strategy' && <StrategyView />}
          {activeView === 'bsc' && <BscView />}
          {activeView === 'map' && <StrategyMapView />}
          {activeView === 'systems' && <SystemsThinkingView />}
          {activeView === 'actions' && <ActionView />}
        </div>

        {/* Toast Notification */}
        {notification && (
          <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 z-50">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-medium">{notification}</span>
          </div>
        )}
      </main>

      {/* Mobile Nav (Bottom) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-40 pb-safe overflow-x-auto">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'swot', icon: Target },
          { id: 'bsc', icon: BarChart3 },
          { id: 'map', icon: Network },
          { id: 'systems', icon: Workflow },
          { id: 'actions', icon: Zap },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as View)}
            className={`p-2 rounded-lg flex-shrink-0 ${activeView === item.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </div>
    </div>
  );
}
