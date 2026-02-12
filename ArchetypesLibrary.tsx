import { useState } from 'react';
import { systemArchetypes } from '../data/archetypes';
import { useStore } from '../store/useStore';
import { CldNode, CausalLink } from '../types';
import { BookOpen, Play, Info, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function ArchetypesLibrary() {
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);
  const { addCldNode, addCausalLink } = useStore();
  
  const archetype = selectedArchetype 
    ? systemArchetypes.find(a => a.id === selectedArchetype) 
    : null;
  
  const applyArchetype = () => {
    if (!archetype) return;
    
    const nodeIdMap = new Map<number, string>();
    
    // Add nodes
    archetype.template.nodes.forEach((nodeTemplate, idx) => {
      const newNode: CldNode = {
        id: `node-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
        label: nodeTemplate.label,
        category: nodeTemplate.category,
        nodeType: nodeTemplate.nodeType,
        x: nodeTemplate.x,
        y: nodeTemplate.y
      };
      addCldNode(newNode);
      nodeIdMap.set(idx, newNode.id);
    });
    
    // Add links (simplified - would need proper mapping in real implementation)
    archetype.template.links.forEach((linkTemplate, idx) => {
      if (idx < archetype.template.nodes.length - 1) {
        const newLink: CausalLink = {
          id: `link-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
          sourceId: nodeIdMap.get(idx)!,
          targetId: nodeIdMap.get(idx + 1)!,
          polarity: linkTemplate.polarity,
          hasDelay: linkTemplate.hasDelay
        };
        addCausalLink(newLink);
      }
    });
    
    alert(`Applied ${archetype.name} archetype! Navigate to CLD Builder to view and customize.`);
  };
  
  // Generate sample behavior-over-time data
  const generateBehaviorData = (archetypeId: string) => {
    const timePoints = Array.from({ length: 20 }, (_, i) => i);
    
    switch (archetypeId) {
      case 'fixes-that-fail':
        return timePoints.map(t => ({
          time: t,
          problem: 100 - Math.min(t * 10, 50) + Math.max(0, (t - 10) * 8),
          quickFix: t < 10 ? t * 5 : Math.max(0, 50 - (t - 10) * 3)
        }));
      
      case 'escalation':
        return timePoints.map(t => ({
          time: t,
          partyA: 20 + t * 3,
          partyB: 15 + t * 3.5
        }));
      
      case 'limits-to-growth':
        return timePoints.map(t => ({
          time: t,
          growth: 100 * (1 - Math.exp(-0.3 * t)) * Math.exp(-0.05 * Math.max(0, t - 10))
        }));
      
      default:
        return timePoints.map(t => ({
          time: t,
          value: 50 + Math.sin(t * 0.5) * 20
        }));
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl">Systems Archetypes Library</h2>
            <p className="text-sm text-slate-600">Pre-built templates for common development dynamics</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemArchetypes.map(arch => (
            <button
              key={arch.id}
              onClick={() => setSelectedArchetype(arch.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-lg ${
                selectedArchetype === arch.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <h3 className="text-sm mb-2">{arch.name}</h3>
              <p className="text-xs text-slate-600 line-clamp-3">{arch.description}</p>
            </button>
          ))}
        </div>
      </div>
      
      {archetype && (
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl mb-2">{archetype.name}</h3>
              <p className="text-slate-700 mb-4">{archetype.description}</p>
            </div>
            <button
              onClick={applyArchetype}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Apply Template
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Development Context Application
              </h4>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">{archetype.developmentContext}</p>
              </div>
              
              <h4 className="text-sm font-medium mt-6 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Key Structural Elements
              </h4>
              <div className="space-y-2">
                {archetype.structuralElements.map((element, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-700">{element}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">Behavior Over Time</h4>
              <div className="p-4 bg-slate-50 rounded-lg">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={generateBehaviorData(archetype.id)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: 'Time', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Value', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    {Object.keys(generateBehaviorData(archetype.id)[0])
                      .filter(key => key !== 'time')
                      .map((key, idx) => (
                        <Line 
                          key={key}
                          type="monotone" 
                          dataKey={key} 
                          stroke={['#3b82f6', '#ef4444', '#10b981', '#f97316'][idx % 4]} 
                          strokeWidth={2}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="text-sm font-medium text-yellow-900 mb-2">💡 Strategic Insight</h5>
                <p className="text-sm text-yellow-800">
                  {archetype.id === 'fixes-that-fail' && 'Quick fixes provide short-term relief but worsen the underlying problem. Focus on root causes rather than symptoms.'}
                  {archetype.id === 'shifting-the-burden' && 'Over-reliance on symptomatic solutions weakens fundamental solutions. Invest in long-term capacity building.'}
                  {archetype.id === 'escalation' && 'Competitive dynamics create lose-lose spirals. Introduce shared goals or reframe the competition.'}
                  {archetype.id === 'tragedy-of-the-commons' && 'Individual incentives lead to collective collapse. Establish governance mechanisms for shared resources.'}
                  {archetype.id === 'growth-and-underinvestment' && 'Delayed investment in capacity leads to performance collapse. Invest proactively during growth periods.'}
                  {archetype.id === 'success-to-the-successful' && 'Winner-take-all dynamics starve alternatives. Ensure equitable resource allocation mechanisms.'}
                  {archetype.id === 'limits-to-growth' && 'All growth eventually hits constraints. Identify and address limiting factors early.'}
                  {archetype.id === 'drifting-goals' && 'Lowering standards normalizes poor performance. Maintain rigorous goals and invest in improvement.'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-100 rounded-lg">
            <h4 className="text-sm font-medium mb-3">Template Structure Preview</h4>
            <div className="flex flex-wrap gap-2">
              {archetype.template.nodes.map((node, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-lg text-xs ${
                    node.category === 'strength' ? 'bg-green-100 text-green-800' :
                    node.category === 'weakness' ? 'bg-red-100 text-red-800' :
                    node.category === 'opportunity' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`}
                >
                  {node.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg mb-3 text-purple-900">Understanding Systems Archetypes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">What are Archetypes?</h4>
            <p className="text-sm text-slate-600">
              Systems archetypes are recurring patterns of behavior found in complex systems. 
              They help identify common dysfunctional dynamics and suggest high-leverage intervention points.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">How to Use Them</h4>
            <p className="text-sm text-slate-600">
              Match your situation to an archetype, apply the template, then customize nodes and links 
              to reflect your specific context. Focus on breaking problematic feedback loops.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
