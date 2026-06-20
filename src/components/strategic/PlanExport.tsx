import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Target,
  BarChart3,
  FolderKanban,
  Eye,
  Network,
  BrainCircuit,
  TrendingUp,
  Info,
  Clock,
  GitBranch} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StrategicPlan, CLDNode, CLDLink, CLDSnapshot } from '@/lib/strategicPlanStore';

interface PlanExportProps {
  plan: StrategicPlan;
}

// Systems Archetypes Reference Data
const ARCHETYPE_DATA = {
  fixesThatFail: {
    name: 'Fixes that Fail',
    description: 'Short-term fixes create long-term negative side effects',
    leverage_points: ['Address root causes', 'Implement monitoring', 'System-wide solutions'],
    diagram_note: 'Reinforcing loop (R1) with balancing loop (B1) creating delayed consequences',
  },
  shiftingBurden: {
    name: 'Shifting the Burden',
    description: 'Dependency on symptomatic solutions prevents fundamental fixes',
    leverage_points: ['Build capability', 'Reduce dependency', 'Dual approach'],
    diagram_note: 'Reinforcing loop reinforcing dependency',
  },
  limitsToGrowth: {
    name: 'Limits to Growth',
    description: 'Growth processes eventually hit capacity constraints',
    leverage_points: ['Expand capacity', 'Slow growth pace', 'Add supporting resources'],
    diagram_note: 'Balancing loop limiting reinforcing growth',
  },
  tragedyOfCommons: {
    name: 'Tragedy of the Commons',
    description: 'Shared resources become depleted by individual use',
    leverage_points: ['Establish regulations', 'Create awareness', 'Monitor usage'],
    diagram_note: 'Multiple reinforcing loops competing for shared resource',
  },
};

const PlanExport: React.FC<PlanExportProps> = ({ plan }) => {
  const [editablePlan, setEditablePlan] = useState<StrategicPlan>(plan);
  const [selectedSections, setSelectedSections] = useState({
    coverPage: true,
    executiveSummary: true,
    swotAnalysis: true,
    strategyMatrix: true,
    balancedScorecard: true,
    papsOverview: true,
    systemsThinking: false, // NEW: Systems thinking section
    appendix: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setEditablePlan(plan);
  }, [plan]);

  const sections = [
    { id: 'coverPage', label: 'Cover Page', icon: FileText, description: 'Title, organization, and planning period' },
    { id: 'executiveSummary', label: 'Executive Summary', icon: Target, description: 'Vision, mission, and strategic intent' },
    { id: 'swotAnalysis', label: 'SWOT Analysis', icon: BarChart3, description: 'Environmental analysis with impact scores' },
    { id: 'strategyMatrix', label: 'Strategy Matrix', icon: CheckCircle2, description: 'SO/ST/WO/WT strategic options' },
    { id: 'balancedScorecard', label: 'Balanced Scorecard', icon: Target, description: 'Objectives and KPIs by perspective' },
    { id: 'papsOverview', label: 'PAPs Overview', icon: FolderKanban, description: 'Programs, activities, and projects' },
    { id: 'systemsThinking', label: 'Systems Thinking', icon: Network, description: 'Causal Loops & Archetypes', isNew: true },
    { id: 'appendix', label: 'Appendix', icon: FileSpreadsheet, description: 'Detailed data tables and charts' },
  ];

  const toggleSection = (sectionId: string) => {
    setSelectedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId as keyof typeof prev],
    }));
  };

  const handleTextChange = (field: string, value: string) => {
    setEditablePlan((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getActiveSnapshotInfo = (): { snapshot?: CLDSnapshot; isActiveFromCanvas: boolean } => {
    const snapshot = plan.activeCLDSnapshotId 
      ? plan.cldSnapshots?.find(s => s.id === plan.activeCLDSnapshotId)
      : undefined;
    
    return {
      snapshot,
      isActiveFromCanvas: plan.activeCLDSnapshotId === undefined,
    };
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'xlsx') => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const content = generateExportContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editablePlan.name.replace(/\s+/g, '_')}_Strategic_Plan.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsGenerating(false);
  };

  const getCycleTypeName = (polarity: '+' | '-' | 'positive' | 'negative'): string => {
    if (polarity === '+' || polarity === 'positive') return 'Positive';
    if (polarity === '-' || polarity === 'negative') return 'Negative';
    return polarity.toString();
  };

  const generateExportContent = () => {
    let content = '';
    const p = editablePlan;
    const { snapshot, isActiveFromCanvas } = getActiveSnapshotInfo();

    if (selectedSections.coverPage) {
      content += `${'='.repeat(60)}\n`;
      content += `STRATEGIC PLAN\n`;
      content += `${'='.repeat(60)}\n\n`;
      content += `${p.name}\n`;
      content += `${p.organization}\n\n`;
      content += `Planning Period: ${p.planningPeriodStart || '2025'} to ${p.planningPeriodEnd || '2028'}\n`;
      content += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    }

    if (selectedSections.executiveSummary) {
      content += `${'='.repeat(60)}\n`;
      content += `EXECUTIVE SUMMARY\n`;
      content += `${'='.repeat(60)}\n\n`;
      content += `VISION:\n${p.vision || 'Not defined'}\n\n`;
      content += `MISSION:\n${p.mission || 'Not defined'}\n\n`;
      content += `STRATEGIC INTENT:\n${p.strategicIntent || 'Not defined'}\n\n`;
    }

    if (selectedSections.swotAnalysis) {
      content += `${'='.repeat(60)}\n`;
      content += `SWOT ANALYSIS\n`;
      content += `${'='.repeat(60)}\n\n`;
      
      ['strength', 'weakness', 'opportunity', 'threat'].forEach((category) => {
        const items = p.swotItems.filter((i) => i.category === category);
        content += `${category.toUpperCase()}S (${items.length}):\n`;
        items.forEach((item, idx) => {
          content += `  ${idx + 1}. ${item.description} (Impact: ${item.impactScore}/5, Likelihood: ${item.likelihoodScore}/5)\n`;
        });
        content += '\n';
      });
    }

    if (selectedSections.strategyMatrix) {
      content += `${'='.repeat(60)}\n`;
      content += `STRATEGY MATRIX\n`;
      content += `${'='.repeat(60)}\n\n`;
      
      ['SO', 'ST', 'WO', 'WT'].forEach((type) => {
        const options = p.strategicOptions.filter((o) => o.optionType === type);
        content += `${type} STRATEGIES (${options.length}):\n`;
        options.forEach((opt, idx) => {
          content += `  ${idx + 1}. ${opt.title}${opt.selected ? ' [SELECTED]' : ''}\n`;
          content += `     ${opt.description}\n`;
          content += `     Priority: ${opt.priorityScore}/5, Feasibility: ${opt.feasibilityScore}/5\n`;
        });
        content += '\n';
      });
    }

    if (selectedSections.balancedScorecard) {
      content += `${'='.repeat(60)}\n`;
      content += `BALANCED SCORECARD\n`;
      content += `${'='.repeat(60)}\n\n`;
      
      const perspectives = ['financial', 'customer', 'internal_process', 'learning_growth'];
      perspectives.forEach((perspective) => {
        const objectives = p.objectives.filter((o) => o.perspective === perspective);
        content += `${perspective.replace('_', ' ').toUpperCase()} PERSPECTIVE:\n`;
        objectives.forEach((obj) => {
          content += `  Objective: ${obj.objective}\n`;
          obj.kpis.forEach((kpi) => {
            content += `    - ${kpi.name}: ${kpi.currentValue} ${kpi.unit} (Target: ${kpi.targetValue})\n`;
          });
        });
        content += '\n';
      });
    }

    if (selectedSections.papsOverview) {
      content += `${'='.repeat(60)}\n`;
      content += `PROGRAMS, ACTIVITIES & PROJECTS\n`;
      content += `${'='.repeat(60)}\n\n`;
      
      const totalBudget = p.paps.reduce((sum, pap) => sum + pap.budget, 0);
      const totalSpent = p.paps.reduce((sum, pap) => sum + pap.spent, 0);
      content += `Total Budget: $${totalBudget.toLocaleString()}\n`;
      content += `Total Spent: $${totalSpent.toLocaleString()}\n\n`;
      
      p.paps.forEach((pap, idx) => {
        content += `${idx + 1}. ${pap.name} (${pap.papType})\n`;
        content += `   Owner: ${pap.owner}\n`;
        content += `   Status: ${pap.status}, Progress: ${pap.progress}%\n`;
        content += `   Budget: $${pap.budget.toLocaleString()}, Spent: $${pap.spent.toLocaleString()}\n`;
        content += `   Timeline: ${pap.startDate} to ${pap.endDate}\n\n`;
      });
    }

    // NEW: Systems Thinking Section WITH SNAPSHOT INFO
    if (selectedSections.systemsThinking) {
      content += `${'='.repeat(60)}\n`;
      content += `SYSTEMS THINKING ANALYSIS\n`;
      content += `${'='.repeat(60)}\n\n`;

      // ACTIVE SNAPSHOT INFO
      content += `CURRENT CLD STATE:\n`;
      if (snapshot) {
        content += `  ✓ Loaded from Snapshot: "${snapshot.label}"\n`;
        content += `  Timestamp: ${new Date(snapshot.createdAt).toLocaleString()}\n`;
        content += `  Nodes in Snapshot: ${snapshot.nodes.length}\n`;
        content += `  Links in Snapshot: ${snapshot.links.length}\n`;
      } else if (isActiveFromCanvas) {
        content += `  ⚠ Current Canvas State (Not Saved as Snapshot)\n`;
        content += `  Note: Save your CLD work before exporting!\n`;
      } else {
        content += `  ℹ No CLD data available\n`;
      }
      content += `\n`;

      // CLD Nodes
      if (p.cldNodes && p.cldNodes.length > 0) {
        content += `CAUSAL LOOP DIAGRAM NODES (${p.cldNodes.length}):\n`;
        p.cldNodes.forEach((node, idx) => {
          content += `  ${idx + 1}. ${node.label}\n`;
          content += `     ID: ${node.id}\n`;
          content += `     Type: ${node.type || 'variable'}\n`;
          content += `     Description: ${node.description || 'None'}\n\n`;
        });
      } else {
        content += `NO CAUSAL LOOP DIAGRAM NODES AVAILABLE\n\n`;
      }

      // CLD Links
      if (p.cldLinks && p.cldLinks.length > 0) {
        content += `CAUSAL LOOP LINKS (${p.cldLinks.length}):\n`;
        p.cldLinks.forEach((link, idx) => {
          content += `  ${idx + 1}. ${link.from} → ${link.to}\n`;
          content += `     Polarity: ${getCycleTypeName(link.direction || link.polarity)}\n`;
          content += `     Strength: ${link.strength || 3}/5\n`;
          if (link.delay && link.delay > 0) {
            content += `     Delay: ${link.delay} time units\n`;
          }
          content += `\n`;
        });
      } else {
        content += `NO CAUSAL LOOP LINKS DEFINED\n\n`;
      }

      // Applied Archetypes
      if (p.appliedArchetypes && p.appliedArchetypes.length > 0) {
        content += `IDENTIFIED SYSTEMS ARCHETYPES (${p.appliedArchetypes.length}):\n`;
        p.appliedArchetypes.forEach((archetypeId, idx) => {
          const archetype = ARCHETYPE_DATA[archetypeId as keyof typeof ARCHETYPE_DATA];
          if (archetype) {
            content += `${idx + 1}. ${archetype.name}\n`;
            content += `   Description: ${archetype.description}\n`;
            content += `   Leverage Points: ${archetype.leverage_points.join(', ')}\n`;
            content += `   System Pattern: ${archetype.diagram_note}\n\n`;
          }
        });
      } else {
        content += `NO SYSTEMS ARCHETYPES IDENTIFIED\n\n`;
      }

      // Recommendations
      if (p.appliedArchetypes && p.appliedArchetypes.length > 0) {
        content += `STRATEGIC RECOMMENDATIONS BASED ON ARCHETYPES:\n`;
        p.appliedArchetypes.forEach((archetypeId, idx) => {
          const archetype = ARCHETYPE_DATA[archetypeId as keyof typeof ARCHETYPE_DATA];
          if (archetype) {
            content += `   For "${archetype.name}":\n`;
            archetype.leverage_points.forEach((point, pointIdx) => {
              content += `     ${pointIdx + 1}. ${point}\n`;
            });
          }
        });
        content += '\n';
      }

      // Historical Snapshots List (if any)
      if (p.cldSnapshots && p.cldSnapshots.length > 0) {
        content += `PREVIOUS CLD SNAPSHOTS:\n`;
        p.cldSnapshots.forEach((snap, idx) => {
          const isCurrent = snap.id === p.activeCLDSnapshotId ? ' [ACTIVE]' : '';
          content += `  ${idx + 1}. ${snap.label}${isCurrent}\n`;
          content += `     Created: ${new Date(snap.createdAt).toLocaleString()}\n`;
          content += `     Nodes: ${snap.nodes.length}, Links: ${snap.links.length}\n\n`;
        });
      }
    }

    content += `\n${'='.repeat(60)}\n`;
    content += `Generated by Strategic Planner Pro\n`;
    content += `ASilva Innovations\n`;
    content += `${'='.repeat(60)}\n`;

    return content;
  };

  const handlePrint = () => {
    setShowPreview(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Plan Generator</h1>
          <p className="text-slate-500">Export professional strategic plans with systems thinking integration</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Select Sections</h3>
            <div className="space-y-3">
              {sections.map((section) => {
                const Icon = section.icon;
                const isSelected = selectedSections[section.id as keyof typeof selectedSections];
                return (
                  <label
                    key={section.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors relative ${
                      isSelected ? 'bg-cyan-50 border border-cyan-200' : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {section.isNew && (
                      <span className="absolute top-2 right-2 text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full">NEW</span>
                    )}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSection(section.id)}
                      className="mt-1 w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-600' : 'text-slate-400'}`} />
                        <span className={`font-medium ${isSelected ? 'text-cyan-800' : 'text-slate-700'}`}>
                          {section.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{section.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Export Format</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('pdf')}
                disabled={isGenerating}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                <FileText className="w-5 h-5" />
                <span>Export as PDF</span>
                <Download className="w-4 h-4 ml-auto" />
              </button>
              <button
                onClick={() => handleExport('docx')}
                disabled={isGenerating}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                <FileText className="w-5 h-5" />
                <span>Export as Word</span>
                <Download className="w-4 h-4 ml-auto" />
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                disabled={isGenerating}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Export as Excel</span>
                <Download className="w-4 h-4 ml-auto" />
              </button>
            </div>
            {isGenerating && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                Generating document...
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden print:border-0 print:shadow-none">
            <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between print:hidden">
              <h3 className="font-semibold text-slate-700">Document Preview</h3>
              <span className="text-xs text-slate-500">
                {Object.values(selectedSections).filter(Boolean).length} sections selected
              </span>
            </div>
            
            <div className="p-8 space-y-8 max-h-[800px] overflow-y-auto print:max-h-none print:overflow-visible">
              {/* Cover Page */}
              {selectedSections.coverPage && (
                <div className="text-center py-12 border-b border-slate-200 print:break-after-page">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 19h20L12 2z" />
                      <path d="M12 6L5 17h14L12 6z" />
                      <path d="M12 10L8 15h8L12 10z" />
                    </svg>
                  </div>
                  <h1 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange('name', e.currentTarget.innerText)}
                    className="text-3xl font-bold text-slate-800 mb-2 focus:outline-cyan-500 rounded px-1"
                  >
                    {editablePlan.name}
                  </h1>
                  <p 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange('organization', e.currentTarget.innerText)}
                    className="text-xl text-slate-600 mb-6 focus:outline-cyan-500 rounded px-1"
                  >
                    {editablePlan.organization}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextChange('planningPeriodStart', e.currentTarget.innerText)}
                    >
                      {editablePlan.planningPeriodStart || '2025'}
                    </span> 
                    <span>—</span>
                    <span 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => handleTextChange('planningPeriodEnd', e.currentTarget.innerText)}
                    >
                      {editablePlan.planningPeriodEnd || '2028'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-8">
                    Generated on {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              )}

              {/* Executive Summary */}
              {selectedSections.executiveSummary && (
                <div className="print:break-after-page">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-600" />
                    Executive Summary
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-700 mb-2">Vision</h3>
                      <p 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => handleTextChange('vision', e.currentTarget.innerText)}
                        className="text-slate-600 focus:outline-cyan-500 rounded px-1"
                      >
                        {editablePlan.vision || 'Vision statement not defined'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-700 mb-2">Mission</h3>
                      <p 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => handleTextChange('mission', e.currentTarget.innerText)}
                        className="text-slate-600 focus:outline-cyan-500 rounded px-1"
                      >
                        {editablePlan.mission || 'Mission statement not defined'}
                      </p>
                    </div>
                    <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                      <h3 className="font-semibold text-cyan-800 mb-2">Strategic Intent</h3>
                      <p 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => handleTextChange('strategicIntent', e.currentTarget.innerText)}
                        className="text-cyan-700 focus:outline-cyan-500 rounded px-1"
                      >
                        {editablePlan.strategicIntent || 'Strategic intent not defined'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SWOT Summary */}
              {selectedSections.swotAnalysis && (
                <div className="print:break-after-page">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-600" />
                    SWOT Analysis Summary
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {['strength', 'weakness', 'opportunity', 'threat'].map((category) => {
                      const items = editablePlan.swotItems.filter((i) => i.category === category);
                      const colors = {
                        strength: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                        weakness: 'bg-red-50 border-red-200 text-red-800',
                        opportunity: 'bg-blue-50 border-blue-200 text-blue-800',
                        threat: 'bg-amber-50 border-amber-200 text-amber-800',
                      };
                      return (
                        <div key={category} className={`rounded-lg p-4 border ${colors[category as keyof typeof colors]}`}>
                          <h3 className="font-semibold capitalize mb-2">{category}s ({items.length})</h3>
                          <ul className="text-sm space-y-1">
                            {items.slice(0, 4).map((item, idx) => (
                              <li 
                                key={idx} 
                                className="truncate focus:outline-cyan-500 rounded px-1"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                    const newSwot = [...editablePlan.swotItems];
                                    const index = newSwot.findIndex(i => i.id === item.id);
                                    newSwot[index].description = e.currentTarget.innerText;
                                    setEditablePlan({...editablePlan, swotItems: newSwot});
                                }}
                              >
                                • {item.description}
                              </li>
                            ))}
                            {items.length > 4 && (
                              <li className="text-slate-500">...and {items.length - 4} more</li>
                            )}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* NEW: Systems Thinking Section WITH SNAPSHOT INFO */}
              {selectedSections.systemsThinking && (
                <div className="print:break-after-page">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Network className="w-5 h-5 text-purple-600" />
                    Systems Thinking Analysis
                  </h2>
                  
                  {/* ACTIVE CLD SNAPSHOT INFORMATION */}
                  <div className="mb-6">
                    <div className={cn(
                      "rounded-lg p-4 border",
                      getActiveSnapshotInfo().snapshot 
                        ? "bg-green-50 border-green-200" 
                        : getActiveSnapshotInfo().isActiveFromCanvas
                        ? "bg-amber-50 border-amber-200"
                        : "bg-slate-50 border-slate-200"
                    )}>
                      <div className="flex items-start gap-3">
                        {getActiveSnapshotInfo().snapshot ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : getActiveSnapshotInfo().isActiveFromCanvas ? (
                          <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                        ) : (
                          <Info className="w-5 h-5 text-slate-400 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 mb-1">Current CLD State</h3>
                          {getActiveSnapshotInfo().snapshot ? (
                            <div>
                              <p className="text-sm text-green-700 mb-1">
                                ✓ Loaded from Snapshot: <strong>"{getActiveSnapshotInfo().snapshot.label}"</strong>
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(getActiveSnapshotInfo().snapshot!.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <GitBranch className="w-3 h-3" />
                                  <span>Nodes: {getActiveSnapshotInfo().snapshot!.nodes.length}, Links: {getActiveSnapshotInfo().snapshot!.links.length}</span>
                                </div>
                              </div>
                            </div>
                          ) : getActiveSnapshotInfo().isActiveFromCanvas ? (
                            <div>
                              <p className="text-sm text-amber-700 mb-1">
                                ⚠ Current Canvas State (Not Saved as Snapshot)
                              </p>
                              <p className="text-xs text-amber-600">
                                Note: Save your CLD work before exporting!
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-600">ℹ No CLD data available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* CLD Nodes Summary */}
                  {editablePlan.cldNodes && editablePlan.cldNodes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" />
                        Causal Loop Diagram Elements
                      </h3>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="text-sm text-slate-600 mb-2">
                          <strong>{editablePlan.cldNodes.length}</strong> nodes and{' '}
                          <strong>{editablePlan.cldLinks?.length || 0}</strong> links mapping causal relationships
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">Variables / States</h4>
                            <ul className="text-xs space-y-1">
                              {editablePlan.cldNodes.slice(0, 5).map((node, idx) => (
                                <li key={node.id} className="text-slate-600">• {node.label}</li>
                              ))}
                              {editablePlan.cldNodes.length > 5 && (
                                <li className="text-slate-500">+{editablePlan.cldNodes.length - 5} more variables</li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">Relationships</h4>
                            <ul className="text-xs space-y-1">
                              {(editablePlan.cldLinks || []).slice(0, 5).map((link, idx) => (
                                <li key={idx} className="text-slate-600">• {link.from} → {link.to} ({getCycleTypeName(link.direction || link.polarity)})</li>
                              ))}
                              {(editablePlan.cldLinks || []).length > 5 && (
                                <li className="text-slate-500">+{(editablePlan.cldLinks || []).length - 5} more connections</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Applied Archetypes */}
                  {editablePlan.appliedArchetypes && editablePlan.appliedArchetypes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Identified Systems Archetypes
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {editablePlan.appliedArchetypes.map((archetypeId, idx) => {
                          const archetype = ARCHETYPE_DATA[archetypeId as keyof typeof ARCHETYPE_DATA];
                          if (!archetype) return null;
                          return (
                            <div key={archetypeId} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                              <div className="flex items-start gap-2 mb-2">
                                <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded">
                                  #{idx + 1}
                                </span>
                                <h4 className="font-bold text-slate-800">{archetype.name}</h4>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{archetype.description}</p>
                              <div className="space-y-1 text-xs">
                                <p><strong>Pattern:</strong> {archetype.diagram_note}</p>
                                <p><strong>Leverage Points:</strong></p>
                                <ul className="list-disc list-inside text-slate-500">
                                  {archetype.leverage_points.map((point, pIdx) => (
                                    <li key={pIdx}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Recommendations */}
                      <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Strategic Recommendations Based on Archetypes
                        </h4>
                        <ul className="text-sm space-y-2">
                          {editablePlan.appliedArchetypes.map((archetypeId, idx) => {
                            const archetype = ARCHETYPE_DATA[archetypeId as keyof typeof ARCHETYPE_DATA];
                            if (!archetype) return null;
                            return (
                              <li key={archetypeId} className="pl-2 border-l-2 border-green-300">
                                <span className="font-medium text-green-900">{archetype.name}:</span>{' '}
                                <span className="text-slate-700">{archetype.leverage_points.join('; ')}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Strategy Summary */}
              {selectedSections.strategyMatrix && (
                <div className="print:break-after-page">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                    Selected Strategic Options
                  </h2>
                  <div className="space-y-3">
                    {editablePlan.strategicOptions
                      .filter((opt) => opt.selected)
                      .map((opt, idx) => (
                        <div key={opt.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                            opt.optionType === 'SO' ? 'bg-emerald-500' :
                            opt.optionType === 'ST' ? 'bg-blue-500' :
                            opt.optionType === 'WO' ? 'bg-purple-500' :
                            'bg-amber-500'
                          }`}>
                            {opt.optionType}
                          </span>
                          <div className="flex-1">
                            <p 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                    const newOpts = [...editablePlan.strategicOptions];
                                    const index = newOpts.findIndex(o => o.id === opt.id);
                                    newOpts[index].title = e.currentTarget.innerText;
                                    setEditablePlan({...editablePlan, strategicOptions: newOpts});
                                }}
                                className="font-medium text-slate-800 focus:outline-cyan-500 rounded px-1"
                            >
                                {opt.title}
                            </p>
                            <p 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                    const newOpts = [...editablePlan.strategicOptions];
                                    const index = newOpts.findIndex(o => o.id === opt.id);
                                    newOpts[index].description = e.currentTarget.innerText;
                                    setEditablePlan({...editablePlan, strategicOptions: newOpts});
                                }}
                                className="text-sm text-slate-600 focus:outline-cyan-500 rounded px-1"
                            >
                                {opt.description}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* BSC Summary */}
              {selectedSections.balancedScorecard && (
                <div className="print:break-after-page">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-600" />
                    Balanced Scorecard Overview
                  </h2>
                  <p className="text-slate-600 mb-4">
                    {editablePlan.objectives.length} objectives with {editablePlan.objectives.reduce((sum, obj) => sum + obj.kpis.length, 0)} KPIs
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {['financial', 'customer', 'internal_process', 'learning_growth'].map((perspective) => {
                      const objectives = editablePlan.objectives.filter((o) => o.perspective === perspective);
                      return (
                        <div key={perspective} className="bg-slate-50 rounded-lg p-4">
                          <h3 className="font-semibold text-slate-700 capitalize mb-2">
                            {perspective.replace('_', ' ')}
                          </h3>
                          <p className="text-2xl font-bold text-cyan-600">{objectives.length}</p>
                          <p className="text-sm text-slate-500">objectives</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PAPs Summary */}
              {selectedSections.papsOverview && (
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-cyan-600" />
                    Programs, Activities & Projects
                  </h2>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {editablePlan.paps.filter((p) => p.papType === 'program').length}
                      </p>
                      <p className="text-sm text-purple-700">Programs</p>
                    </div>
                    <div className="bg-cyan-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-cyan-600">
                        {editablePlan.paps.filter((p) => p.papType === 'project').length}
                      </p>
                      <p className="text-sm text-cyan-700">Projects</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {editablePlan.paps.filter((p) => p.papType === 'activity').length}
                      </p>
                      <p className="text-sm text-blue-700">Activities</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Budget:</span>
                      <span className="font-bold text-slate-800">
                        ${editablePlan.paps.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-slate-600">Total Spent:</span>
                      <span className="font-bold text-emerald-600">
                        ${editablePlan.paps.reduce((sum, p) => sum + p.spent, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
                <p>Generated by Strategic Planner Pro</p>
                <p className="text-xs mt-1">ASilva Innovations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanExport;