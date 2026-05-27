import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Users,
  Cog,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Target,
  TrendingUp,
  Sparkles,
  Loader2,
  Check,
  X,
  Info,
  ArrowRight,
  Link2,
  AlertCircle,
} from 'lucide-react';
import { BSCObjective, KPI, StrategicPlan, StrategicOption } from '@/lib/strategicPlanStore';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface BalancedScorecardProps {
  plan: StrategicPlan;
  onAddObjective: (objective: Omit<BSCObjective, 'id' | 'kpis'>) => void;
  onUpdateObjective: (id: string, updates: Partial<BSCObjective>) => void;
  onRemoveObjective: (id: string) => void;
  onAddKPI: (objectiveId: string, kpi: Omit<KPI, 'id' | 'objectiveId'>) => void;
  onUpdateKPI: (objectiveId: string, kpiId: string, updates: Partial<KPI>) => void;
  onRemoveKPI: (objectiveId: string, kpiId: string) => void;
}

const perspectiveConfig = {
  financial: {
    label: 'Financial',
    icon: DollarSign,
    color: 'emerald',
    bgGradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-700',
    description: 'How do we look to shareholders?',
    placeholder: 'e.g., Increase revenue by 20% annually',
  },
  customer: {
    label: 'Customer',
    icon: Users,
    color: 'blue',
    bgGradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    textColor: 'text-blue-700',
    description: 'How do customers see us?',
    placeholder: 'e.g., Achieve 90% customer satisfaction',
  },
  internal_process: {
    label: 'Internal Process',
    icon: Cog,
    color: 'purple',
    bgGradient: 'from-purple-500 to-violet-600',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    textColor: 'text-purple-700',
    description: 'What must we excel at?',
    placeholder: 'e.g., Reduce operational costs by 15%',
  },
  learning_growth: {
    label: 'Learning & Growth',
    icon: GraduationCap,
    color: 'amber',
    bgGradient: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    textColor: 'text-amber-700',
    description: 'Can we continue to improve?',
    placeholder: 'e.g., Train all staff on new technologies',
  },
};

// Progress calculation helper
const calculateProgress = (kpi: KPI): number => {
  if (kpi.targetValue === kpi.baselineValue) return 0;
  const progress = ((kpi.currentValue - kpi.baselineValue) / (kpi.targetValue - kpi.baselineValue)) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

// Status colors
const STATUS_COLORS = {
  'on-track': 'bg-emerald-100 text-emerald-700',
  'at-risk': 'bg-amber-100 text-amber-700',
  delayed: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

const StatusBadge: React.FC<{ status: KPI['status']; children: React.ReactNode }> = ({ status, children }) => (
  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", STATUS_COLORS[status])}>
    {children}
  </span>
);

const ProgressMeter: React.FC<{ value: number }> = ({ value }) => {
  const getColor = () => {
    if (value >= 100) return 'bg-emerald-500';
    if (value >= 70) return 'bg-cyan-500';
    if (value >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{Math.round(value)}%</span>
            <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-300", getColor())}
                style={{ width: `${Math.max(value, 0)}%` }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] z-50">
          <div className="space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Progress Tracking</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 dark:text-slate-500">Track achievement against targets</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const KPIRow: React.FC<{
  kpi: KPI;
  onUpdate: (updates: Partial<KPI>) => void;
  onRemove: () => void;
}> = ({ kpi, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(kpi);
  const progress = calculateProgress(kpi);

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(kpi);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <tr className="bg-cyan-50 animate-in fade-in slide-in-from-top-2">
        <td className="px-4 py-3">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="KPI name"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            value={editData.baselineValue}
            onChange={(e) => setEditData((prev) => ({ ...prev, baselineValue: parseFloat(e.target.value) || 0 }))}
            className="w-20 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            value={editData.targetValue}
            onChange={(e) => setEditData((prev) => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
            className="w-20 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            value={editData.currentValue}
            onChange={(e) => setEditData((prev) => ({ ...prev, currentValue: parseFloat(e.target.value) || 0 }))}
            className="w-20 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="text"
            value={editData.unit}
            onChange={(e) => setEditData((prev) => ({ ...prev, unit: e.target.value }))}
            className="w-16 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </td>
        <td className="px-4 py-3">
          <select
            value={editData.status}
            onChange={(e) => setEditData((prev) => ({ ...prev, status: e.target.value as KPI['status'] }))}
            className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="on-track">On Track</option>
            <option value="at-risk">At Risk</option>
            <option value="delayed">Delayed</option>
            <option value="completed">Completed</option>
          </select>
        </td>
        <td className="px-4 py-3">
          <input
            type="text"
            value={editData.owner}
            onChange={(e) => setEditData((prev) => ({ ...prev, owner: e.target.value }))}
            className="w-24 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Owner"
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg">
                    <Check className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Save changes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleCancel} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Cancel editing</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-slate-50 dark:bg-slate-900 group transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{kpi.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">{kpi.baselineValue}</td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">{kpi.targetValue}</td>
      <td className="px-4 py-3">
        <ProgressMeter value={progress} />
      </td>
      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">{kpi.unit}</td>
      <td className="px-4 py-3">
        <StatusBadge status={kpi.status}>{kpi.status.replace('-', ' ')}</StatusBadge>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">{kpi.owner || 'Unassigned'}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Edit KPI</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={onRemove} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Delete KPI</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </td>
    </tr>
  );
};

const ObjectiveCard: React.FC<{
  objective: BSCObjective;
  config: typeof perspectiveConfig.financial;
  linkedStrategies: StrategicOption[];
  onUpdate: (updates: Partial<BSCObjective>) => void;
  onRemove: () => void;
  onAddKPI: (kpi: Omit<KPI, 'id' | 'objectiveId'>) => void;
  onUpdateKPI: (kpiId: string, updates: Partial<KPI>) => void;
  onRemoveKPI: (kpiId: string) => void;
}> = ({ objective, config, linkedStrategies, onUpdate, onRemove, onAddKPI, onUpdateKPI, onRemoveKPI }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingKPI, setIsAddingKPI] = useState(false);
  const [isEditingObjective, setIsEditingObjective] = useState(false);
  const [editObjectiveData, setEditObjectiveData] = useState(objective);
  const [newKPI, setNewKPI] = useState({
    name: '',
    description: '',
    baselineValue: 0,
    targetValue: 0,
    currentValue: 0,
    unit: '',
    frequency: 'monthly' as const,
    owner: '',
    status: 'on-track' as KPI['status'],
  });
  const [isGeneratingKPIs, setIsGeneratingKPIs] = useState(false);

  // Calculate overall progress for this objective
  const averageProgress = objective.kpis.length > 0
    ? objective.kpis.reduce((sum, kpi) => sum + calculateProgress(kpi), 0) / objective.kpis.length
    : 0;

  const handleSaveObjective = () => {
    onUpdate({ objective: editObjectiveData.objective, description: editObjectiveData.description });
    setIsEditingObjective(false);
  };

  const handleAddKPI = () => {
    if (!newKPI.name.trim()) return;
    onAddKPI(newKPI);
    setNewKPI({
      name: '',
      description: '',
      baselineValue: 0,
      targetValue: 0,
      currentValue: 0,
      unit: '',
      frequency: 'monthly',
      owner: '',
      status: 'on-track',
    });
    setIsAddingKPI(false);
  };

  const handleGenerateKPIs = async () => {
    setIsGeneratingKPIs(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-strategy-assistant', {
        body: {
          action: 'generate_kpis',
          data: {
            perspective: config.label,
            objective: objective.objective,
            context: objective.description,
          },
        },
      });

      if (error) throw error;

      if (data?.success && Array.isArray(data?.data)) {
        data.data.forEach((kpi: any) => {
          onAddKPI({
            name: kpi.name,
            description: kpi.description || '',
            baselineValue: kpi.baseline_value || 0,
            targetValue: kpi.target_value || 0,
            currentValue: kpi.baseline_value || 0,
            unit: kpi.unit || '',
            frequency: kpi.frequency || 'monthly',
            owner: '',
            status: 'on-track',
          });
        });
      }
    } catch (error) {
      console.error('Failed to generate KPIs:', error);
    } finally {
      setIsGeneratingKPIs(false);
    }
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "bg-white dark:bg-slate-800/60 rounded-xl border overflow-hidden shadow-sm transition-shadow hover:shadow-md",
        config.border
      )}>
        {/* Header */}
        <div
          className={cn(`${config.lightBg} px-4 py-3 flex items-center gap-3 cursor-pointer`)}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400 dark:text-slate-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-500 dark:text-slate-400 dark:text-slate-500" />
          )}
          <Target className={`w-5 h-5 ${config.textColor}`} />
          <div className="flex-1 min-w-0">
            {isEditingObjective ? (
              <input
                type="text"
                value={editObjectiveData.objective}
                onChange={(e) => setEditObjectiveData((prev) => ({ ...prev, objective: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            ) : (
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{objective.objective}</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsEditingObjective(true); }}
                      className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-200 rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Edit objective</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
            {isEditingObjective ? (
              <textarea
                value={editObjectiveData.description}
                onChange={(e) => setEditObjectiveData((prev) => ({ ...prev, description: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none mt-1"
                rows={1}
              />
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{objective.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {linkedStrategies.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                      <Link2 className="w-3 h-3" />
                      <span className="font-medium">{linkedStrategies.length}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold text-xs">Linked Strategies:</p>
                      {linkedStrategies.slice(0, 3).map((strategy) => (
                        <p key={strategy.id} className="text-xs text-slate-600 dark:text-slate-400 dark:text-slate-500">• {strategy.title}</p>
                      ))}
                      {linkedStrategies.length > 3 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 italic">+{linkedStrategies.length - 3} more</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {averageProgress > 0 && (
              <div className="hidden md:flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-cyan-600" />
                <span className="font-medium">{Math.round(averageProgress)}% avg</span>
              </div>
            )}
            <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">{objective.kpis.length} KPIs</span>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            {/* Show linked strategies if any */}
            {linkedStrategies.length > 0 && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="w-4 h-4 text-purple-600" />
                  <h5 className="text-sm font-semibold text-purple-800">Supporting Strategies</h5>
                </div>
                <div className="space-y-1">
                  {linkedStrategies.map((strategy) => (
                    <div key={strategy.id} className="text-xs text-purple-700 flex items-start gap-2">
                      <span className="px-1.5 py-0.5 bg-purple-200 rounded text-[10px] font-bold mt-0.5">
                        {strategy.optionType}
                      </span>
                      <span className="flex-1">{strategy.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {objective.kpis.length > 0 && (
              <div className="overflow-x-auto mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase">KPI</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase">Baseline</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase">Target</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase">Current</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase">Unit</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase">Owner</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {objective.kpis.map((kpi) => (
                      <KPIRow
                        key={kpi.id}
                        kpi={kpi}
                        onUpdate={(updates) => onUpdateKPI(kpi.id, updates)}
                        onRemove={() => onRemoveKPI(kpi.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pb-4">
              {!isAddingKPI && (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setIsAddingKPI(true)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:bg-slate-900 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add KPI
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Create a new KPI for this objective</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleGenerateKPIs}
                          disabled={isGeneratingKPIs}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                        >
                          {isGeneratingKPIs ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          AI Suggest KPIs
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Generate KPI suggestions using AI based on your objective</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>

            {/* Add KPI Form */}
            {isAddingKPI && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="col-span-1 md:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-1">KPI Name *</label>
                    <input
                      type="text"
                      value={newKPI.name}
                      onChange={(e) => setNewKPI((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g., Customer Satisfaction Rate"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-1">Baseline</label>
                    <input
                      type="number"
                      value={newKPI.baselineValue}
                      onChange={(e) => setNewKPI((prev) => ({ ...prev, baselineValue: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-1">Target</label>
                    <input
                      type="number"
                      value={newKPI.targetValue}
                      onChange={(e) => setNewKPI((prev) => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-1">Unit</label>
                    <input
                      type="text"
                      value={newKPI.unit}
                      onChange={(e) => setNewKPI((prev) => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="% or $"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-1">Frequency</label>
                    <select
                      value={newKPI.frequency}
                      onChange={(e) => setNewKPI((prev) => ({ ...prev, frequency: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-1">Owner</label>
                    <input
                      type="text"
                      value={newKPI.owner}
                      onChange={(e) => setNewKPI((prev) => ({ ...prev, owner: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g., CFO"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsAddingKPI(false)}
                    className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddKPI}
                    disabled={!newKPI.name.trim()}
                    className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                  >
                    Add KPI
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

const BalancedScorecard: React.FC<BalancedScorecardProps> = ({
  plan,
  onAddObjective,
  onUpdateObjective,
  onRemoveObjective,
  onAddKPI,
  onUpdateKPI,
  onRemoveKPI,
}) => {
  const [newObjective, setNewObjective] = useState<{
    perspective: BSCObjective['perspective'] | null;
    objective: string;
    description: string;
  }>({ perspective: null, objective: '', description: '' });
  const [isGeneratingObjectives, setIsGeneratingObjectives] = useState(false);

  // Get selected strategies from the plan
  const selectedStrategies = useMemo(() => 
    (plan.strategicOptions || []).filter(opt => opt.selected),
    [plan.strategicOptions]
  );

  // Link strategies to objectives based on keywords/similarity
  const getLinkedStrategies = (objective: BSCObjective): StrategicOption[] => {
    return selectedStrategies.filter(strategy => {
      const objText = `${objective.objective} ${objective.description}`.toLowerCase();
      const stratText = `${strategy.title} ${strategy.description}`.toLowerCase();
      
      // Simple keyword matching - can be enhanced with better NLP
      const objWords = objText.split(/\s+/);
      const stratWords = stratText.split(/\s+/);
      const commonWords = objWords.filter(w => w.length > 3 && stratWords.includes(w));
      
      return commonWords.length > 0;
    });
  };

  const handleAddObjective = () => {
    if (!newObjective.perspective || !newObjective.objective.trim()) return;
    onAddObjective({
      perspective: newObjective.perspective,
      objective: newObjective.objective.trim(),
      description: newObjective.description.trim(),
      weight: 1,
    });
    setNewObjective({ perspective: null, objective: '', description: '' });
  };

  const handleGenerateObjectives = async () => {
    setIsGeneratingObjectives(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-strategy-assistant', {
        body: {
          action: 'generate_objectives',
          data: {
            planStrategicIntent: plan.strategicIntent,
            swotSummary: plan.swotItems || [],
            selectedStrategies: selectedStrategies.map(s => ({ title: s.title, description: s.description })),
          },
        },
      });

      if (error) throw error;

      if (data?.success && Array.isArray(data?.data)) {
        data.data.forEach((obj: any) => {
          onAddObjective({
            perspective: obj.perspective as BSCObjective['perspective'],
            objective: obj.objective,
            description: obj.description || '',
            weight: obj.weight || 1,
          });
        });
      }
    } catch (error) {
      console.error('Failed to generate objectives:', error);
    } finally {
      setIsGeneratingObjectives(false);
    }
  };

  const getObjectivesByPerspective = (perspective: BSCObjective['perspective']) =>
    (plan.objectives || []).filter((obj) => obj.perspective === perspective);

  const totalKPICount = (plan.objectives || []).reduce((sum, obj) => sum + (obj.kpis?.length || 0), 0);
  const avgProgress = (plan.objectives || []).reduce((sum, obj) => 
    sum + ((obj.kpis?.length || 0) > 0 
      ? obj.kpis.reduce((kSum, kpi) => kSum + calculateProgress(kpi), 0) / obj.kpis.length 
      : 0), 0) / Math.max((plan.objectives || []).length, 1);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Balanced Scorecard</h1>
            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Define strategic objectives and measurable KPIs across four perspectives</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-cyan-600" />
                <span className="text-slate-600 dark:text-slate-400 dark:text-slate-500">
                  <span className="font-medium text-cyan-600">{(plan.objectives || []).length}</span> objectives
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
                <span className="text-slate-600 dark:text-slate-400 dark:text-slate-500">
                  <span className="font-medium text-cyan-600">{totalKPICount}</span> KPIs
                </span>
              </div>
              {avgProgress > 0 && (
                <>
                  <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <div className="flex items-center gap-1">
                    <span className="text-slate-600 dark:text-slate-400 dark:text-slate-500">Avg:</span>
                    <span className="font-medium text-cyan-600">{Math.round(avgProgress)}%</span>
                  </div>
                </>
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleGenerateObjectives}
                    disabled={isGeneratingObjectives}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isGeneratingObjectives ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        AI Generate Objectives
                      </>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Generate strategic objectives using AI based on your SWOT analysis and selected strategies</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Strategy Link Info */}
        {selectedStrategies.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
            <Link2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-800 mb-1">
                {selectedStrategies.length} Selected Strateg{selectedStrategies.length === 1 ? 'y' : 'ies'} Available
              </h4>
              <p className="text-sm text-purple-700">
                Your objectives will be automatically linked to relevant strategies from the Strategy Matrix.
                This helps track how strategic options translate into measurable outcomes.
              </p>
            </div>
          </div>
        )}

        {/* Guide for users without objectives */}
        {(plan.objectives || []).length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Getting Started with Balanced Scorecard</h4>
              <p className="text-sm text-blue-700 mb-3">
                Strategic Objectives define what you want to achieve across four key perspectives. 
                Each objective should be specific, actionable, and aligned with your overall strategy.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-700">
                <div>
                  <p className="font-semibold mb-1">💰 Financial Perspective:</p>
                  <p className="text-blue-600">Focus on financial performance and shareholder value</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">👥 Customer Perspective:</p>
                  <p className="text-blue-600">Focus on customer satisfaction and market position</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">⚙️ Internal Process:</p>
                  <p className="text-blue-600">Focus on operational excellence and efficiency</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">📚 Learning & Growth:</p>
                  <p className="text-blue-600">Focus on innovation and organizational capability</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Perspectives */}
        <div className="space-y-8">
          {(Object.entries(perspectiveConfig) as [BSCObjective['perspective'], typeof perspectiveConfig.financial][]).map(
            ([perspective, config]) => {
              const Icon = config.icon;
              const objectives = getObjectivesByPerspective(perspective);

              return (
                <TooltipProvider key={perspective}>
                  <div className="space-y-4">
                    {/* Perspective Header */}
                    <div className={cn(`bg-gradient-to-r ${config.bgGradient} rounded-xl px-6 py-4 shadow-sm`)}>
                      <div className="flex items-center gap-3">
                        <Icon className="w-6 h-6 text-white" />
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-white">{config.label}</h2>
                          <p className="text-sm text-white/70">{config.description}</p>
                        </div>
                        <span className="ml-auto bg-white dark:bg-slate-800/60/20 px-3 py-1 rounded-full text-sm text-white backdrop-blur-sm">
                          {objectives.length} objective{objectives.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Objectives List */}
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-4">
                      {objectives.map((objective) => (
                        <ObjectiveCard
                          key={objective.id}
                          objective={objective}
                          config={config}
                          linkedStrategies={getLinkedStrategies(objective)}
                          onUpdate={(updates) => onUpdateObjective(objective.id, updates)}
                          onRemove={() => onRemoveObjective(objective.id)}
                          onAddKPI={(kpi) => onAddKPI(objective.id, kpi)}
                          onUpdateKPI={(kpiId, updates) => onUpdateKPI(objective.id, kpiId, updates)}
                          onRemoveKPI={(kpiId) => onRemoveKPI(objective.id, kpiId)}
                        />
                      ))}

                      {/* Add Objective Button */}
                      {newObjective.perspective === perspective ? (
                        <div className={cn("bg-white dark:bg-slate-800/60 rounded-xl border p-4 space-y-3 animate-in fade-in slide-in-from-top-2", config.border)}>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-1">
                              Strategic Objective *
                            </label>
                            <input
                              type="text"
                              value={newObjective.objective}
                              onChange={(e) => setNewObjective((prev) => ({ ...prev, objective: e.target.value }))}
                              className="w-full px-3 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              placeholder={config.placeholder}
                              autoFocus
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-1">
                              Description / Context
                            </label>
                            <textarea
                              value={newObjective.description}
                              onChange={(e) => setNewObjective((prev) => ({ ...prev, description: e.target.value }))}
                              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                              rows={2}
                              placeholder="Provide context about why this objective is important and how it supports your strategy..."
                            />
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <p className="text-xs text-blue-700">
                              After creating the objective, you'll be able to add KPIs (Key Performance Indicators) to measure progress.
                            </p>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setNewObjective({ perspective: null, objective: '', description: '' })}
                              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-slate-100 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleAddObjective}
                              disabled={!newObjective.objective.trim()}
                              className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                            >
                              Add Objective
                            </button>
                          </div>
                        </div>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setNewObjective({ perspective, objective: '', description: '' })}
                                className={cn(
                                  "w-full py-3 border-2 border-dashed rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200 hover:border-slate-400 transition-colors flex items-center justify-center gap-2",
                                  config.lightBg
                                )}
                              >
                                <Plus className="w-4 h-4" />
                                Add {config.label} Objective
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Create a new strategic objective for the {config.label} perspective</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </TooltipProvider>
              );
            }
          )}
        </div>

        {/* Scoring Guide */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-slate-600 dark:text-slate-400 dark:text-slate-500" />
            KPI Progress Tracking Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-2">On Track</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-2 bg-emerald-500 rounded-full" />
                <span className="text-sm font-medium text-emerald-700">≥70% progress</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-2">At Risk</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-2 bg-amber-500 rounded-full" />
                <span className="text-sm font-medium text-amber-700">40-69% progress</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-2">Delayed</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-2 bg-red-500 rounded-full" />
                <span className="text-sm font-medium text-red-700">&lt;40% progress</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-2">Completed</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm font-medium text-blue-700">100%+ progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BalancedScorecard;