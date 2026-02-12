import { Link } from 'react-router';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowRight, TrendingUp, AlertTriangle, Target } from 'lucide-react';

export function Dashboard() {
  const { swotItems, cldNodes, causalLinks, feedbackLoops, strategicOptions } = useStore();
  
  const swotData = [
    { name: 'Strengths', count: swotItems.filter(i => i.category === 'strength').length, color: '#10b981' },
    { name: 'Weaknesses', count: swotItems.filter(i => i.category === 'weakness').length, color: '#ef4444' },
    { name: 'Opportunities', count: swotItems.filter(i => i.category === 'opportunity').length, color: '#3b82f6' },
    { name: 'Threats', count: swotItems.filter(i => i.category === 'threat').length, color: '#f97316' },
  ];
  
  const systemMetrics = [
    { label: 'SWOT Variables', value: swotItems.length, icon: Target, color: 'text-blue-600' },
    { label: 'CLD Nodes', value: cldNodes.length, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Causal Links', value: causalLinks.length, icon: ArrowRight, color: 'text-purple-600' },
    { label: 'Feedback Loops', value: feedbackLoops.length, icon: AlertTriangle, color: 'text-orange-600' },
  ];
  
  const reinforcingLoops = feedbackLoops.filter(l => l.type === 'reinforcing').length;
  const balancingLoops = feedbackLoops.filter(l => l.type === 'balancing').length;
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <h2 className="text-2xl mb-2">Welcome to Strategy AI Planner</h2>
        <p className="text-blue-100 mb-6">Transform static SWOT analysis into dynamic systems mapping for strategic development planning</p>
        <div className="flex gap-4">
          <Link 
            to="/swot-input" 
            className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Start SWOT Analysis
          </Link>
          <Link 
            to="/archetypes" 
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-400 transition-colors"
          >
            Explore Archetypes
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{metric.label}</p>
                  <p className="text-3xl mt-2">{metric.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${metric.color}`} />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="mb-4">SWOT Distribution</h3>
          {swotItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={swotData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6">
                  {swotData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <p className="mb-2">No SWOT data yet</p>
                <Link to="/swot-input" className="text-blue-600 hover:underline">
                  Add your first SWOT item →
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="mb-4">Feedback Loop Analysis</h3>
          {feedbackLoops.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Reinforcing', value: reinforcingLoops, color: '#ef4444' },
                      { name: 'Balancing', value: balancingLoops, color: '#10b981' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#ef4444" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700">
                  {reinforcingLoops > balancingLoops ? (
                    <span className="text-orange-600">⚠ System dominated by reinforcing loops - potential for runaway effects</span>
                  ) : balancingLoops > reinforcingLoops ? (
                    <span className="text-green-600">✓ System has self-correcting mechanisms in place</span>
                  ) : (
                    <span className="text-blue-600">⚖ Balanced system with equal reinforcing and balancing dynamics</span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <p className="mb-2">No feedback loops detected</p>
                <Link to="/cld-builder" className="text-blue-600 hover:underline">
                  Build causal loop diagram →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {strategicOptions.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="mb-4">Recent Strategic Options</h3>
          <div className="space-y-3">
            {strategicOptions.slice(0, 3).map(option => (
              <div key={option.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm mb-1">{option.title}</h4>
                    <p className="text-sm text-slate-600">{option.description.slice(0, 150)}...</p>
                  </div>
                  <span className={`ml-4 px-3 py-1 rounded-full text-xs ${
                    option.feasibility === 'high' ? 'bg-green-100 text-green-700' :
                    option.feasibility === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {option.feasibility} feasibility
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/strategic-options" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
            View all strategic options →
          </Link>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-blue-900 mb-2">Getting Started</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl mb-2">1️⃣</div>
            <h4 className="text-sm mb-1">Input SWOT Variables</h4>
            <p className="text-sm text-slate-600">Define strengths, weaknesses, opportunities, and threats with metadata</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl mb-2">2️⃣</div>
            <h4 className="text-sm mb-1">Build Causal Links</h4>
            <p className="text-sm text-slate-600">Map relationships and feedback loops in the CLD builder</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl mb-2">3️⃣</div>
            <h4 className="text-sm mb-1">Generate Strategy</h4>
            <p className="text-sm text-slate-600">Discover leverage points and strategic intervention options</p>
          </div>
        </div>
      </div>
    </div>
  );
}
