import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { CldNode, CausalLink, SwotCategory } from '../types';
import { Plus, Trash2, RefreshCw, ZoomIn, ZoomOut, Info } from 'lucide-react';

export function CldBuilder() {
  const { swotItems, cldNodes, causalLinks, feedbackLoops, addCldNode, updateCldNode, deleteCldNode, addCausalLink, deleteCausalLink, detectFeedbackLoops } = useStore();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [linkingMode, setLinkingMode] = useState(false);
  const [linkSource, setLinkSource] = useState<string | null>(null);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const categoryColors: Record<SwotCategory, { bg: string; border: string }> = {
    strength: { bg: 'bg-green-100', border: 'border-green-500' },
    weakness: { bg: 'bg-red-100', border: 'border-red-500' },
    opportunity: { bg: 'bg-blue-100', border: 'border-blue-500' },
    threat: { bg: 'bg-orange-100', border: 'border-orange-500' }
  };
  
  const addNodeFromSwot = (swotItemId: string) => {
    const swotItem = swotItems.find(s => s.id === swotItemId);
    if (!swotItem) return;
    
    const newNode: CldNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      swotItemId,
      label: swotItem.text.slice(0, 50),
      category: swotItem.category,
      nodeType: swotItem.variableType === 'decision' ? 'decision' : swotItem.variableType,
      x: 200 + Math.random() * 300,
      y: 200 + Math.random() * 200
    };
    
    addCldNode(newNode);
    setShowNodeDialog(false);
  };
  
  const handleNodeClick = (nodeId: string) => {
    if (linkingMode) {
      if (!linkSource) {
        setLinkSource(nodeId);
      } else if (linkSource !== nodeId) {
        // Create link
        const newLink: CausalLink = {
          id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sourceId: linkSource,
          targetId: nodeId,
          polarity: 'same',
          hasDelay: false
        };
        addCausalLink(newLink);
        setLinkSource(null);
        setLinkingMode(false);
      }
    } else {
      setSelectedNode(nodeId === selectedNode ? null : nodeId);
    }
  };
  
  const toggleLinkPolarity = (linkId: string) => {
    const link = causalLinks.find(l => l.id === linkId);
    if (link) {
      const store = useStore.getState();
      store.updateCausalLink(linkId, { 
        polarity: link.polarity === 'same' ? 'opposite' : 'same' 
      });
    }
  };
  
  const toggleLinkDelay = (linkId: string) => {
    const link = causalLinks.find(l => l.id === linkId);
    if (link) {
      const store = useStore.getState();
      store.updateCausalLink(linkId, { hasDelay: !link.hasDelay });
    }
  };
  
  useEffect(() => {
    if (causalLinks.length > 0 && cldNodes.length > 0) {
      detectFeedbackLoops();
    }
  }, [causalLinks.length, cldNodes.length]);
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl mb-1">Causal Loop Diagram Builder</h2>
            <p className="text-sm text-slate-600">Map relationships between SWOT variables</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNodeDialog(!showNodeDialog)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Node
            </button>
            <button
              onClick={() => {
                setLinkingMode(!linkingMode);
                setLinkSource(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                linkingMode 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {linkingMode ? 'Cancel Linking' : 'Create Link'}
            </button>
            <button
              onClick={detectFeedbackLoops}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Detect Loops
            </button>
          </div>
        </div>
        
        {showNodeDialog && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-sm mb-3">Select SWOT Variable to Add</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {swotItems.filter(item => !cldNodes.some(n => n.swotItemId === item.id)).map(item => (
                <button
                  key={item.id}
                  onClick={() => addNodeFromSwot(item.id)}
                  className={`p-3 text-left rounded-lg border-2 hover:shadow-md transition-all ${categoryColors[item.category].bg} ${categoryColors[item.category].border}`}
                >
                  <span className="text-xs px-2 py-1 bg-white rounded">{item.category.toUpperCase()}</span>
                  <p className="text-sm mt-2">{item.text.slice(0, 100)}</p>
                </button>
              ))}
              {swotItems.length === cldNodes.length && (
                <p className="text-sm text-slate-500 col-span-2 text-center py-4">
                  All SWOT variables have been added to the diagram
                </p>
              )}
            </div>
          </div>
        )}
        
        {linkingMode && linkSource && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              🔗 Linking mode: Click target node to create causal link from "{cldNodes.find(n => n.id === linkSource)?.label.slice(0, 30)}..."
            </p>
          </div>
        )}
        
        <div 
          ref={canvasRef}
          className="relative border-2 border-slate-300 rounded-lg bg-slate-50"
          style={{ height: '600px', overflow: 'hidden' }}
        >
          {/* Render links */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {causalLinks.map(link => {
              const source = cldNodes.find(n => n.id === link.sourceId);
              const target = cldNodes.find(n => n.id === link.targetId);
              if (!source || !target) return null;
              
              const dx = target.x - source.x;
              const dy = target.y - source.y;
              const angle = Math.atan2(dy, dx);
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              // Arrow at target
              const arrowSize = 10;
              const targetRadius = 40;
              const arrowX = target.x - Math.cos(angle) * targetRadius;
              const arrowY = target.y - Math.sin(angle) * targetRadius;
              
              const color = link.polarity === 'same' ? '#3b82f6' : '#ef4444';
              
              return (
                <g key={link.id}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={arrowX}
                    y2={arrowY}
                    stroke={color}
                    strokeWidth="2"
                    markerEnd={`url(#arrow-${link.polarity})`}
                    strokeDasharray={link.hasDelay ? '5,5' : '0'}
                  />
                  {link.hasDelay && (
                    <text
                      x={(source.x + target.x) / 2}
                      y={(source.y + target.y) / 2 - 10}
                      fill="#64748b"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      ⏱ delay
                    </text>
                  )}
                  <text
                    x={(source.x + target.x) / 2}
                    y={(source.y + target.y) / 2 + 5}
                    fill={color}
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {link.polarity === 'same' ? '+' : '−'}
                  </text>
                </g>
              );
            })}
            
            <defs>
              <marker id="arrow-same" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
              </marker>
              <marker id="arrow-opposite" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
              </marker>
            </defs>
          </svg>
          
          {/* Render nodes */}
          {cldNodes.map(node => {
            const nodeShape = node.nodeType === 'stock' ? 'circle' : node.nodeType === 'flow' ? 'rect' : 'diamond';
            const isInLoop = feedbackLoops.some(loop => loop.nodes.includes(node.id));
            
            return (
              <div
                key={node.id}
                className={`absolute cursor-pointer transition-all ${categoryColors[node.category].bg} border-2 ${categoryColors[node.category].border} ${
                  selectedNode === node.id ? 'ring-4 ring-blue-300' : ''
                } ${isInLoop ? 'shadow-lg' : 'shadow-md'} hover:shadow-xl`}
                style={{
                  left: `${node.x - 40}px`,
                  top: `${node.y - 40}px`,
                  width: nodeShape === 'diamond' ? '90px' : '80px',
                  height: nodeShape === 'diamond' ? '90px' : '80px',
                  borderRadius: nodeShape === 'circle' ? '50%' : nodeShape === 'rect' ? '8px' : '0',
                  transform: nodeShape === 'diamond' ? 'rotate(45deg)' : 'none',
                  zIndex: selectedNode === node.id ? 10 : 2
                }}
                onClick={() => handleNodeClick(node.id)}
              >
                <div 
                  className="flex items-center justify-center h-full p-2"
                  style={{
                    transform: nodeShape === 'diamond' ? 'rotate(-45deg)' : 'none'
                  }}
                >
                  <p className="text-xs text-center leading-tight">{node.label.slice(0, 40)}</p>
                </div>
                {selectedNode === node.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCldNode(node.id);
                      setSelectedNode(null);
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 z-20"
                    style={{ transform: nodeShape === 'diamond' ? 'rotate(-45deg)' : 'none' }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
          
          {cldNodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Add SWOT variables to start building your causal loop diagram</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 border-2 border-green-500 rounded-full"></div>
            <span className="text-slate-600">Strength</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 border-2 border-red-500 rounded-full"></div>
            <span className="text-slate-600">Weakness</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 border-2 border-blue-500 rounded-full"></div>
            <span className="text-slate-600">Opportunity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 border-2 border-orange-500 rounded-full"></div>
            <span className="text-slate-600">Threat</span>
          </div>
        </div>
      </div>
      
      {causalLinks.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="mb-4">Causal Links ({causalLinks.length})</h3>
          <div className="space-y-2">
            {causalLinks.map(link => {
              const source = cldNodes.find(n => n.id === link.sourceId);
              const target = cldNodes.find(n => n.id === link.targetId);
              if (!source || !target) return null;
              
              return (
                <div key={link.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{source.label.slice(0, 30)}</span>
                      <span className={`mx-2 px-2 py-1 rounded ${link.polarity === 'same' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {link.polarity === 'same' ? '+ (same)' : '− (opposite)'}
                      </span>
                      <span className="font-medium">{target.label.slice(0, 30)}</span>
                      {link.hasDelay && <span className="ml-2 text-xs text-slate-500">⏱ with delay</span>}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleLinkPolarity(link.id)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                    >
                      Toggle Polarity
                    </button>
                    <button
                      onClick={() => toggleLinkDelay(link.id)}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs"
                    >
                      {link.hasDelay ? 'Remove Delay' : 'Add Delay'}
                    </button>
                    <button
                      onClick={() => deleteCausalLink(link.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {feedbackLoops.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="mb-4">Detected Feedback Loops ({feedbackLoops.length})</h3>
          <div className="space-y-3">
            {feedbackLoops.map(loop => (
              <div key={loop.id} className={`p-4 rounded-lg border-2 ${
                loop.type === 'reinforcing' 
                  ? 'bg-orange-50 border-orange-300' 
                  : 'bg-green-50 border-green-300'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        loop.type === 'reinforcing' 
                          ? 'bg-orange-200 text-orange-800' 
                          : 'bg-green-200 text-green-800'
                      }`}>
                        {loop.type === 'reinforcing' ? 'R' : 'B'} - {loop.type}
                      </span>
                      <span className="text-xs text-slate-600">{loop.nodes.length} variables</span>
                    </div>
                    <p className="text-sm text-slate-700">{loop.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {loop.nodes.map((nodeId, idx) => {
                        const node = cldNodes.find(n => n.id === nodeId);
                        return node ? (
                          <span key={nodeId} className="text-xs px-2 py-1 bg-white rounded border border-slate-200">
                            {idx > 0 && '→ '}{node.label.slice(0, 20)}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>R (Reinforcing)</strong> loops amplify change - they can create virtuous or vicious cycles. 
              <strong className="ml-2">B (Balancing)</strong> loops resist change - they create stability and self-correction.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
