import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Lightbulb, Target, Users, Clock, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

export function StrategicOptions() {
  const { 
    cldNodes, 
    causalLinks, 
    leveragePoints, 
    strategicOptions, 
    identifyLeveragePoints, 
    generateStrategicOptions 
  } = useStore();
  
  useEffect(() => {
    if (cldNodes.length > 0 && causalLinks.length > 0) {
      identifyLeveragePoints();
      generateStrategicOptions();
    }
  }, [cldNodes.length, causalLinks.length]);
  
  const impactColors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-green-100 text-green-700 border-green-300'
  };
  
  const feasibilityColors = {
    high: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-red-100 text-red-700'
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-8 h-8" />
          <h2 className="text-2xl">Strategic Options Generator</h2>
        </div>
        <p className="text-purple-100">
          Leverage systems thinking insights to identify high-impact intervention strategies 
          grounded in political economy analysis
        </p>
      </div>
      
      {leveragePoints.length === 0 && strategicOptions.length === 0 ? (
        <div className="bg-white rounded-lg p-12 border border-slate-200 text-center">
          <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg mb-2 text-slate-700">No Analysis Available</h3>
          <p className="text-slate-600 mb-6">
            Build a causal loop diagram first to generate strategic options and identify leverage points.
          </p>
          <div className="flex gap-3 justify-center">
            <a 
              href="/swot-input" 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Input SWOT Variables
            </a>
            <a 
              href="/cld-builder" 
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Build CLD
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg">Leverage Points ({leveragePoints.length})</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              High-impact intervention points identified through structural analysis of feedback loops
            </p>
            
            {leveragePoints.length > 0 ? (
              <div className="space-y-3">
                {leveragePoints.map(point => {
                  const node = cldNodes.find(n => n.id === point.nodeId);
                  return (
                    <div 
                      key={point.id}
                      className={`p-4 rounded-lg border-2 ${impactColors[point.impact]}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4" />
                            <span className="font-medium text-sm">{node?.label}</span>
                            <span className="px-2 py-1 bg-white rounded text-xs">
                              {point.type.replace(/-/g, ' ')}
                            </span>
                          </div>
                          <p className="text-sm">{point.description}</p>
                        </div>
                        <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${impactColors[point.impact]}`}>
                          {point.impact} impact
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p>No leverage points detected. Create more feedback loops in the CLD builder.</p>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg">Strategic Intervention Options ({strategicOptions.length})</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Actionable strategies derived from systems structure analysis and political economy considerations
            </p>
            
            {strategicOptions.length > 0 ? (
              <div className="space-y-4">
                {strategicOptions.map(option => (
                  <div 
                    key={option.id}
                    className="p-5 border-2 border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-base font-medium text-slate-900">{option.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs ${feasibilityColors[option.feasibility]}`}>
                        {option.feasibility} feasibility
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-700 mb-4">{option.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-medium text-slate-700">Power Alignment</span>
                        </div>
                        <p className="text-xs text-slate-600">{option.politicalEconomy.powerAlignment}</p>
                      </div>
                      
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-slate-700">Institutional Capacity</span>
                        </div>
                        <p className="text-xs text-slate-600">{option.politicalEconomy.institutionalCapacity}</p>
                      </div>
                      
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-slate-700">Time Horizon</span>
                        </div>
                        <p className="text-xs text-slate-600">{option.politicalEconomy.timeHorizon}</p>
                      </div>
                      
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-medium text-slate-700">Stakeholder Coalition</span>
                        </div>
                        <p className="text-xs text-slate-600">{option.politicalEconomy.stakeholderCoalition}</p>
                      </div>
                    </div>
                    
                    {option.leveragePoints.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-500">
                          Addresses {option.leveragePoints.length} leverage point(s)
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p>No strategic options generated yet. Add more SWOT variables and causal links.</p>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-blue-900 mb-3">Political Economy Analysis Framework</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2 text-blue-900">Power</h4>
                <p className="text-xs text-slate-600">
                  Which actors have authority and influence? What coalitions are needed?
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2 text-blue-900">Institutions</h4>
                <p className="text-xs text-slate-600">
                  What formal and informal rules govern behavior? What capacity exists?
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2 text-blue-900">Incentives</h4>
                <p className="text-xs text-slate-600">
                  What motivates stakeholders? How can incentives be aligned with goals?
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2 text-blue-900">Resources</h4>
                <p className="text-xs text-slate-600">
                  What financial, human, and technical resources are available?
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
