import { useState } from 'react';
import { useStore } from '../store/useStore';
import { SwotCategory, VariableType, TimeHorizon, PoliticalEconomyDimension } from '../types';
import { Plus, Trash2, Save, Sparkles } from 'lucide-react';

export function SwotInput() {
  const { swotItems, addSwotItem, deleteSwotItem } = useStore();
  const [formData, setFormData] = useState({
    category: 'strength' as SwotCategory,
    text: '',
    variableType: 'stock' as VariableType,
    timeHorizon: 'medium-term' as TimeHorizon,
    politicalDimension: 'institutions' as PoliticalEconomyDimension,
    stakeholder: ''
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) return;
    
    addSwotItem({
      id: `swot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...formData
    });
    
    setFormData({
      ...formData,
      text: '',
      stakeholder: ''
    });
  };
  
  const categoryColors: Record<SwotCategory, string> = {
    strength: 'bg-green-100 text-green-800 border-green-300',
    weakness: 'bg-red-100 text-red-800 border-red-300',
    opportunity: 'bg-blue-100 text-blue-800 border-blue-300',
    threat: 'bg-orange-100 text-orange-800 border-orange-300'
  };
  
  const suggestRelationships = () => {
    // AI-assisted suggestion simulation
    alert('AI suggestion feature would analyze semantic relationships between SWOT items and propose causal connections. For example: "Weak institutional capacity" (W) → "Donor dependency" (T) with opposite polarity.');
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl mb-1">SWOT Variable Input</h2>
            <p className="text-sm text-slate-600">Define strategic variables with systems thinking metadata</p>
          </div>
          <button
            onClick={suggestRelationships}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            AI Suggest Links
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-700 mb-2">SWOT Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as SwotCategory })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="strength">Strength</option>
                <option value="weakness">Weakness</option>
                <option value="opportunity">Opportunity</option>
                <option value="threat">Threat</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-700 mb-2">Variable Type</label>
              <select
                value={formData.variableType}
                onChange={(e) => setFormData({ ...formData, variableType: e.target.value as VariableType })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="stock">Stock (accumulates over time)</option>
                <option value="flow">Flow (rate of change)</option>
                <option value="auxiliary">Auxiliary (supporting variable)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-700 mb-2">Time Horizon</label>
              <select
                value={formData.timeHorizon}
                onChange={(e) => setFormData({ ...formData, timeHorizon: e.target.value as TimeHorizon })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="short-term">Short-term (&lt; 6 months)</option>
                <option value="medium-term">Medium-term (6-18 months)</option>
                <option value="long-term">Long-term (&gt; 18 months)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-700 mb-2">Political Economy Dimension</label>
              <select
                value={formData.politicalDimension}
                onChange={(e) => setFormData({ ...formData, politicalDimension: e.target.value as PoliticalEconomyDimension })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="power">Power (authority & influence)</option>
                <option value="institutions">Institutions (rules & norms)</option>
                <option value="incentives">Incentives (motivations)</option>
                <option value="resources">Resources (capacity & assets)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-slate-700 mb-2">Variable Description</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="e.g., 'Weak institutional capacity for policy implementation' or 'Growing civil society engagement'"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-700 mb-2">Stakeholder Attribution</label>
            <input
              type="text"
              value={formData.stakeholder}
              onChange={(e) => setFormData({ ...formData, stakeholder: e.target.value })}
              placeholder="e.g., 'Ministry of Finance', 'Local NGOs', 'Donor Community'"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add SWOT Variable
          </button>
        </form>
      </div>
      
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <h3 className="mb-4">SWOT Variables ({swotItems.length})</h3>
        
        {swotItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Save className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No SWOT variables yet. Add your first variable above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {swotItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg ${categoryColors[item.category]}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-white/50 rounded text-xs">
                        {item.category.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-white/50 rounded text-xs">
                        {item.variableType}
                      </span>
                      <span className="px-2 py-1 bg-white/50 rounded text-xs">
                        {item.timeHorizon}
                      </span>
                      <span className="px-2 py-1 bg-white/50 rounded text-xs">
                        {item.politicalDimension}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{item.text}</p>
                    {item.stakeholder && (
                      <p className="text-xs opacity-75">Stakeholder: {item.stakeholder}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteSwotItem(item.id)}
                    className="ml-4 p-2 hover:bg-white/50 rounded-lg transition-colors"
                    title="Delete variable"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm text-blue-900 mb-2">💡 Systems Thinking Tip</h4>
        <p className="text-sm text-blue-800">
          When defining variables, think about accumulations (stocks) vs. rates of change (flows). 
          For example: "Institutional capacity" is a stock that accumulates, while "reform initiatives per year" is a flow.
        </p>
      </div>
    </div>
  );
}
