import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Loader2,
  Check,
  Star,
  ArrowRight,
  Shield,
  AlertCircle,
  Lightbulb,
  Zap,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
  Info,
  Target,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Brain,
  Layers,
  TrendingUp,
  Activity,
  BookOpen,
  Gauge,
  Clock,
  Workflow,
  Crosshair,
  Anchor,
  BarChart2,
  Link as LinkIcon,
} from 'lucide-react';
import { StrategicOption, StrategicPlan, SWOTItem } from '@/lib/strategicPlanStore';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

// ─── SHARED TYPES (mirrored from SystemsThinking) ─────────────────────────────

export interface LeveragePoint {
  archetypeId?: string;
  leverageLevel: number;
  meadowsName: string;
  intervention: string;
  targetNodeIds: string[];
  expectedImpact: 'high' | 'medium' | 'low';
  timeHorizon: 'short' | 'medium' | 'long';
  source: 'archetype' | 'cld-analysis';
}

export interface CLDNode {
  id: string;
  label: string;
  category?: string;
}

export interface CLDLink {
  from: string;
  to: string;
  polarity: '+' | '-';
  strength?: number;
}

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface StrategyMatrixProps {
  plan: StrategicPlan;
  onAddOption: (option: Omit<StrategicOption, 'id'>) => void;
  onUpdateOption: (id: string, updates: Partial<StrategicOption>) => void;
  onRemoveOption: (id: string) => void;
  onBulkAdd: (options: Omit<StrategicOption, 'id'>[]) => void;
  // ── Systems Thinking bridge ──
  leveragePoints?: LeveragePoint[];
  selectedArchetypeId?: string | null;
  selectedArchetypeName?: string | null;
  activeArchetypeDescription?: string | null;
  cldNodes?: CLDNode[];
  cldLinks?: CLDLink[];
}

// ─── QUADRANT CONFIG ──────────────────────────────────────────────────────────

const QUADRANT_TYPES = ['SO', 'ST', 'WO', 'WT'] as const;
type QuadrantType = typeof QUADRANT_TYPES[number];

const quadrantConfig = {
  SO: {
    label: 'SO Strategies',
    subtitle: 'Strengths + Opportunities',
    description: 'Use strengths to capitalize on opportunities',
    color: 'emerald',
    bgGradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-700',
    icons: [Shield, Lightbulb],
    leverageLevels: [7, 4, 8],         // Positive feedback, self-org, balancing boost
    leverageRationale: 'Amplify reinforcing growth loops & self-organizing capabilities',
  },
  ST: {
    label: 'ST Strategies',
    subtitle: 'Strengths + Threats',
    description: 'Use strengths to mitigate threats',
    color: 'blue',
    bgGradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    textColor: 'text-blue-700',
    icons: [Shield, Zap],
    leverageLevels: [8, 5, 6],         // Negative feedback, rules, information flows
    leverageRationale: 'Strengthen balancing loops, governance rules & information access',
  },
  WO: {
    label: 'WO Strategies',
    subtitle: 'Weaknesses + Opportunities',
    description: 'Overcome weaknesses by pursuing opportunities',
    color: 'purple',
    bgGradient: 'from-purple-500 to-violet-600',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    textColor: 'text-purple-700',
    icons: [AlertCircle, Lightbulb],
    leverageLevels: [3, 6, 9],         // Goals, information flows, delay reduction
    leverageRationale: 'Redefine goals, expose information gaps & reduce structural delays',
  },
  WT: {
    label: 'WT Strategies',
    subtitle: 'Weaknesses + Threats',
    description: 'Minimize weaknesses and avoid threats',
    color: 'amber',
    bgGradient: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    textColor: 'text-amber-700',
    icons: [AlertCircle, Zap],
    leverageLevels: [2, 5, 10],        // Paradigm shift, rules, stock-flow structure
    leverageRationale: 'Challenge paradigms, restructure stock-flow & establish defensive rules',
  },
};

// ─── MEADOWS ICON MAP ─────────────────────────────────────────────────────────

const MEADOWS_ICONS: Record<number, React.ElementType> = {
  12: Gauge, 11: Anchor, 10: Workflow, 9: Clock,
  8: Activity, 7: TrendingUp, 6: BarChart2, 5: BookOpen,
  4: Sparkles, 3: Target, 2: Brain, 1: Crosshair,
};

const MEADOWS_LEVEL_COLORS: Record<string, string> = {
  high: 'bg-violet-600 text-white',
  mid: 'bg-red-500 text-white',
  feedback: 'bg-amber-500 text-white',
  params: 'bg-slate-400 text-white',
};

const getMeadowsBadgeColor = (level: number) => {
  if (level <= 3) return MEADOWS_LEVEL_COLORS.high;
  if (level <= 6) return MEADOWS_LEVEL_COLORS.mid;
  if (level <= 9) return MEADOWS_LEVEL_COLORS.feedback;
  return MEADOWS_LEVEL_COLORS.params;
};

// ─── SCORE SCALES ─────────────────────────────────────────────────────────────

const SCORE_DESCRIPTIONS = {
  1: { priority: 'Lowest priority — minimal strategic impact',       feasibility: 'Very difficult — major barriers exist' },
  2: { priority: 'Low priority — not a key focus area',             feasibility: 'Difficult — significant resources required' },
  3: { priority: 'Medium priority — moderate importance',           feasibility: 'Moderate — feasible with reasonable effort' },
  4: { priority: 'High priority — important strategic move',        feasibility: 'Easy — can be implemented with good prospects' },
  5: { priority: 'Highest priority — critical strategic initiative', feasibility: 'Very easy — highly achievable with minimal barriers' },
};

const TOTAL_SCORE_GUIDE = [
  { range: '9-10', color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Excellent' },
  { range: '7-8',  color: 'text-cyan-700',    bg: 'bg-cyan-100',    label: 'Good'      },
  { range: '5-6',  color: 'text-amber-700',   bg: 'bg-amber-100',   label: 'Fair'      },
  { range: '<5',   color: 'text-slate-600',   bg: 'bg-slate-100',   label: 'Low'       },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const getTotalScoreTier = (total: number) =>
  TOTAL_SCORE_GUIDE.find(t => {
    if (t.range.includes('<')) return total < parseInt(t.range.substring(1));
    const [min, max] = t.range.split('-').map(Number);
    return total >= min && total <= max;
  }) ?? TOTAL_SCORE_GUIDE[3];

/**
 * Returns leverage points from the provided list that are most relevant
 * to a given TOWS quadrant, based on Meadows level affinity.
 */
const getLeveragePointsForQuadrant = (
  leveragePoints: LeveragePoint[],
  quadrant: QuadrantType,
): LeveragePoint[] => {
  const affinityLevels = quadrantConfig[quadrant].leverageLevels;
  const exact   = leveragePoints.filter(lp => affinityLevels.includes(lp.leverageLevel));
  const highImp = leveragePoints.filter(
    lp => !affinityLevels.includes(lp.leverageLevel) && lp.expectedImpact === 'high',
  );
  return [...exact, ...highImp].slice(0, 3);
};

/**
 * Builds a rich, structured systems-context string to embed in the AI prompt.
 */
const buildSystemsContext = (
  leveragePoints: LeveragePoint[],
  archetypeName: string | null | undefined,
  archetypeDescription: string | null | undefined,
  cldNodes: CLDNode[],
  cldLinks: CLDLink[],
): string => {
  const lines: string[] = [];

  if (archetypeName) {
    lines.push(`ACTIVE SYSTEMS ARCHETYPE: "${archetypeName}"`);
    if (archetypeDescription) lines.push(`  Description: ${archetypeDescription}`);
    lines.push('');
  }

  if (cldNodes.length > 0) {
    lines.push('CAUSAL LOOP DIAGRAM (CLD) VARIABLES:');
    cldNodes.forEach(n => lines.push(`  - ${n.label}${n.category ? ` [${n.category}]` : ''}`));
    lines.push('');

    if (cldLinks.length > 0) {
      lines.push('CLD CAUSAL RELATIONSHIPS:');
      cldLinks.forEach(l => {
        const fromNode = cldNodes.find(n => n.id === l.from)?.label ?? l.from;
        const toNode   = cldNodes.find(n => n.id === l.to)?.label   ?? l.to;
        const arrow    = l.polarity === '+' ? '→(+)' : '→(−)';
        lines.push(`  ${fromNode} ${arrow} ${toNode}${(l.strength ?? 0) >= 4 ? ' [HIGH GAIN]' : ''}`);
      });
      lines.push('');
    }
  }

  if (leveragePoints.length > 0) {
    lines.push('MEADOWS LEVERAGE POINTS (ranked highest to lowest leverage):');
    [...leveragePoints]
      .sort((a, b) => a.leverageLevel - b.leverageLevel)
      .forEach(lp => {
        lines.push(`  [L${lp.leverageLevel} — ${lp.meadowsName}] (${lp.expectedImpact} impact / ${lp.timeHorizon}-term)`);
        lines.push(`    Intervention: ${lp.intervention}`);
      });
    lines.push('');

    lines.push('LEVERAGE ↔ TOWS QUADRANT MAPPING GUIDANCE:');
    QUADRANT_TYPES.forEach(q => {
      const qLPs = getLeveragePointsForQuadrant(leveragePoints, q);
      if (qLPs.length > 0) {
        lines.push(`  ${q} Strategies — ${quadrantConfig[q].leverageRationale}:`);
        qLPs.forEach(lp => lines.push(`    • [L${lp.leverageLevel}] ${lp.intervention}`));
      }
    });
  }

  return lines.join('\n');
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const ScoreButton: React.FC<{
  value: number;
  selectedValue: number;
  onSelect: (value: number) => void;
  type: 'priority' | 'feasibility';
  Icon?: React.ElementType;
}> = ({ value, selectedValue, onSelect, type, Icon = Check }) => {
  const description = SCORE_DESCRIPTIONS[value as keyof typeof SCORE_DESCRIPTIONS];
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onSelect(value)}
            className={cn('transition-all duration-200 transform hover:scale-110 active:scale-95')}
            aria-label={`${type} score of ${value}`}
          >
            {Icon === Star ? (
              <Star className={cn('w-4 h-4 transition-colors', value <= selectedValue ? 'text-amber-400 fill-current' : 'text-slate-300 hover:text-slate-400')} />
            ) : (
              <div className={cn('w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
                value <= selectedValue ? 'border-cyan-500 bg-cyan-500' : 'border-slate-300 hover:border-cyan-300 hover:bg-slate-50')}>
                {value <= selectedValue && <Check className="w-3 h-3 text-white" />}
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] z-50">
          <p className="font-semibold text-cyan-700">{type === 'priority' ? 'Priority' : 'Feasibility'} Level {value}</p>
          <p className="text-xs text-slate-600">{type === 'priority' ? description.priority : description.feasibility}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ─── LEVERAGE CONTEXT BADGE (inline in quadrant header) ───────────────────────

const LeverageBadge: React.FC<{ lp: LeveragePoint }> = ({ lp }) => {
  const Icon = MEADOWS_ICONS[lp.leverageLevel] ?? Target;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold cursor-help', getMeadowsBadgeColor(lp.leverageLevel))}>
            <Icon className="w-3 h-3" />
            L{lp.leverageLevel}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[260px] z-50 space-y-1">
          <p className="font-semibold text-violet-700">[L{lp.leverageLevel}] {lp.meadowsName}</p>
          <p className="text-xs text-slate-600 leading-relaxed">{lp.intervention}</p>
          <div className="flex gap-2 pt-1">
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium',
              lp.expectedImpact === 'high' ? 'bg-red-100 text-red-700' : lp.expectedImpact === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600')}>
              {lp.expectedImpact} impact
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-blue-100 text-blue-700">
              {lp.timeHorizon}-term
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ─── STRATEGY CARD ────────────────────────────────────────────────────────────

const StrategyCard: React.FC<{
  option: StrategicOption;
  config: typeof quadrantConfig.SO;
  onUpdate: (updates: Partial<StrategicOption>) => void;
  onRemove: () => void;
}> = ({ option, config, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(option.title);
  const [editDesc,  setEditDesc]  = useState(option.description);

  const handleSave = () => { onUpdate({ title: editTitle, description: editDesc }); setIsEditing(false); };

  const total     = (option.priorityScore || 3) + (option.feasibilityScore || 3);
  const scoreTier = getTotalScoreTier(total);

  return (
    <div className={cn(
      `${config.lightBg} ${config.border} border rounded-xl p-4 group hover:shadow-md transition-all`,
      option.selected && 'ring-2 ring-cyan-500 ring-offset-2',
    )}>
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text" value={editTitle} autoFocus
            onChange={e => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Strategy title"
          />
          <textarea
            value={editDesc} rows={3}
            onChange={e => setEditDesc(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            placeholder="Strategy description"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => { setEditTitle(option.title); setEditDesc(option.description); setIsEditing(false); }} className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">Save</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                onClick={() => onUpdate({ selected: !option.selected })}
                aria-label={option.selected ? 'Deselect strategy' : 'Select strategy'}
                className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
                  option.selected ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-slate-300 hover:border-cyan-400')}>
                {option.selected && <Check className="w-3 h-3" />}
              </button>
              <h4 className="font-semibold text-slate-800 truncate">{option.title}</h4>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100" aria-label="Edit strategy">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left"><p>Edit strategy details</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={onRemove} className="p-1.5 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50" aria-label="Delete strategy">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left"><p>Delete this strategy</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{option.description}</p>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Priority */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-600">Priority:</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <ScoreButton key={n} value={n} selectedValue={option.priorityScore || 3} onSelect={val => onUpdate({ priorityScore: val })} type="priority" Icon={Star} />
                  ))}
                </div>
                <span className={cn('text-xs font-semibold w-5 text-center', (option.priorityScore || 3) >= 4 ? 'text-amber-600' : 'text-slate-500')}>
                  {option.priorityScore || 3}
                </span>
              </div>

              {/* Feasibility */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-600">Feasibility:</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <ScoreButton key={n} value={n} selectedValue={option.feasibilityScore || 3} onSelect={val => onUpdate({ feasibilityScore: val })} type="feasibility" />
                  ))}
                </div>
                <span className={cn('text-xs font-semibold w-5 text-center', (option.feasibilityScore || 3) >= 4 ? 'text-cyan-600' : 'text-slate-500')}>
                  {option.feasibilityScore || 3}
                </span>
              </div>
            </div>

            {/* Total Score Badge */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn('px-3 py-1.5 rounded-full text-xs font-bold', scoreTier.bg, scoreTier.color)}>
                    Score: {total}/10
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px] z-50">
                  <p className="font-semibold text-slate-800 mb-2">Total Score Guide</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {TOTAL_SCORE_GUIDE.map(guide => {
                      const isActive = guide.range.includes('<')
                        ? total < parseInt(guide.range.substring(1))
                        : total >= parseInt(guide.range.split('-')[0]) && total <= parseInt(guide.range.split('-')[1]);
                      return (
                        <div key={guide.range} className={cn('p-1.5 rounded border',
                          isActive ? cn(guide.bg, guide.color, 'font-bold border-transparent') : 'bg-slate-50 text-slate-400 border-slate-200')}>
                          <span>{guide.range} pts</span>: {guide.label}
                        </div>
                      );
                    })}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </>
      )}
    </div>
  );
};

// ─── SYSTEMS CONTEXT PANEL ────────────────────────────────────────────────────

const SystemsContextPanel: React.FC<{
  leveragePoints: LeveragePoint[];
  archetypeName?: string | null;
  archetypeDescription?: string | null;
  cldNodes: CLDNode[];
  cldLinks: CLDLink[];
}> = ({ leveragePoints, archetypeName, archetypeDescription, cldNodes, cldLinks }) => {
  const [expanded, setExpanded] = useState(true);

  const highLPs = leveragePoints.filter(lp => lp.leverageLevel <= 4);
  const midLPs  = leveragePoints.filter(lp => lp.leverageLevel >= 5 && lp.leverageLevel <= 7);
  const lowLPs  = leveragePoints.filter(lp => lp.leverageLevel >= 8);

  return (
    <div className="rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-violet-900 text-sm">Systems Thinking Context</h3>
            <p className="text-[11px] text-violet-600">
              {archetypeName ? `Archetype: ${archetypeName}` : 'No archetype active'} ·{' '}
              {leveragePoints.length} leverage point{leveragePoints.length !== 1 ? 's' : ''} ·{' '}
              {cldNodes.length} CLD variable{cldNodes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {leveragePoints.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold">
              {leveragePoints.length} LP{leveragePoints.length !== 1 ? 's' : ''}
            </span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-violet-500" /> : <ChevronDown className="w-4 h-4 text-violet-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-violet-200/60">

          {/* Archetype pill */}
          {archetypeName && (
            <div className="flex items-start gap-3 pt-3">
              <div className="w-6 h-6 rounded bg-violet-200 flex items-center justify-center shrink-0 mt-0.5">
                <Layers className="w-3.5 h-3.5 text-violet-700" />
              </div>
              <div>
                <p className="text-xs font-semibold text-violet-800">{archetypeName}</p>
                {archetypeDescription && <p className="text-[11px] text-violet-600 leading-relaxed mt-0.5">{archetypeDescription}</p>}
              </div>
            </div>
          )}

          {/* Leverage point tiers */}
          {leveragePoints.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">Identified Leverage Points</p>

              {/* Tier legend */}
              <div className="flex flex-wrap gap-1.5 text-[9px] font-bold">
                <span className="px-2 py-0.5 rounded bg-violet-600 text-white">L1–3: Paradigm</span>
                <span className="px-2 py-0.5 rounded bg-red-500 text-white">L4–6: Info/Rules</span>
                <span className="px-2 py-0.5 rounded bg-amber-500 text-white">L7–9: Feedback</span>
                <span className="px-2 py-0.5 rounded bg-slate-400 text-white">L10–12: Parameters</span>
                <span className="text-violet-400 self-center">← more leverage</span>
              </div>

              {[
                { label: 'High Leverage (Paradigm & Goals)',    lps: highLPs },
                { label: 'Mid Leverage (Information & Rules)',  lps: midLPs  },
                { label: 'Lower Leverage (Feedback & Params)', lps: lowLPs  },
              ].map(({ label, lps }) => lps.length > 0 && (
                <div key={label}>
                  <p className="text-[10px] text-slate-500 font-medium mb-1.5">{label}</p>
                  <div className="space-y-1.5">
                    {lps.map((lp, i) => {
                      const Icon = MEADOWS_ICONS[lp.leverageLevel] ?? Target;
                      return (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/70 border border-violet-100">
                          <span className={cn('shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded mt-0.5', getMeadowsBadgeColor(lp.leverageLevel))}>
                            L{lp.leverageLevel}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-slate-700 truncate">{lp.meadowsName}</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{lp.intervention}</p>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0 items-end">
                            <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded',
                              lp.expectedImpact === 'high' ? 'bg-red-100 text-red-700' : lp.expectedImpact === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500')}>
                              {lp.expectedImpact}
                            </span>
                            <span className="text-[9px] text-slate-400">{lp.timeHorizon}-term</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quadrant mapping */}
          {leveragePoints.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500 mb-2">Leverage → TOWS Mapping</p>
              <div className="grid grid-cols-2 gap-2">
                {QUADRANT_TYPES.map(q => {
                  const qLPs = getLeveragePointsForQuadrant(leveragePoints, q);
                  const cfg  = quadrantConfig[q];
                  return (
                    <div key={q} className={cn('rounded-lg p-2.5 border', cfg.lightBg, cfg.border)}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={cn('text-[10px] font-bold', cfg.textColor)}>{q}</span>
                        <div className="flex gap-0.5 flex-wrap justify-end">
                          {qLPs.map((lp, i) => <LeverageBadge key={i} lp={lp} />)}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">{cfg.leverageRationale}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CLD Variables Summary */}
          {cldNodes.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500 mb-1.5">CLD Variables in Context</p>
              <div className="flex flex-wrap gap-1">
                {cldNodes.slice(0, 12).map(n => (
                  <span key={n.id} className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium',
                    n.category === 'strength'    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    n.category === 'weakness'    ? 'bg-red-50 border-red-200 text-red-700' :
                    n.category === 'opportunity' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    n.category === 'threat'      ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    'bg-slate-50 border-slate-200 text-slate-600')}>
                    {n.label}
                  </span>
                ))}
                {cldNodes.length > 12 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">+{cldNodes.length - 12} more</span>
                )}
              </div>
            </div>
          )}

          <p className="text-[10px] text-violet-400 border-t border-violet-200/60 pt-2">
            This context is automatically embedded into AI strategy generation to produce systems-aware, leverage-informed options.
          </p>
        </div>
      )}
    </div>
  );
};

// ─── QUADRANT LEVERAGE HINT BAR ───────────────────────────────────────────────

const QuadrantLeverageHint: React.FC<{
  quadrant: QuadrantType;
  leveragePoints: LeveragePoint[];
}> = ({ quadrant, leveragePoints }) => {
  const qLPs = getLeveragePointsForQuadrant(leveragePoints, quadrant);
  if (qLPs.length === 0) return null;

  return (
    <div className="px-4 py-2 bg-white/60 border-t border-b border-slate-200/60 flex items-center gap-2 overflow-x-auto">
      <span className="text-[10px] font-bold text-slate-400 shrink-0">LP hints:</span>
      {qLPs.map((lp, i) => <LeverageBadge key={i} lp={lp} />)}
      <span className="text-[10px] text-slate-400 shrink-0 ml-auto hidden sm:block">{quadrantConfig[quadrant].leverageRationale}</span>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const StrategyMatrix: React.FC<StrategyMatrixProps> = ({
  plan,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onBulkAdd,
  leveragePoints      = [],
  selectedArchetypeId = null,
  selectedArchetypeName = null,
  activeArchetypeDescription = null,
  cldNodes            = [],
  cldLinks            = [],
}) => {
  const [isGenerating,    setIsGenerating]    = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [newStrategy, setNewStrategy] = useState<{
    quadrant: QuadrantType | null; title: string; description: string;
  }>({ quadrant: null, title: '', description: '' });

  const hasSystemsContext = leveragePoints.length > 0 || cldNodes.length > 0 || !!selectedArchetypeName;

  // ── Build the AI generation context ──────────────────────────────────────────

  const handleGenerateStrategies = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const strengths     = (plan.swotItems || []).filter(i => i.category === 'strength').map(i => ({ description: i.description, impactScore: i.impactScore || 3, likelihoodScore: i.likelihoodScore || 3 }));
      const weaknesses    = (plan.swotItems || []).filter(i => i.category === 'weakness').map(i => ({ description: i.description, impactScore: i.impactScore || 3, likelihoodScore: i.likelihoodScore || 3 }));
      const opportunities = (plan.swotItems || []).filter(i => i.category === 'opportunity').map(i => ({ description: i.description, impactScore: i.impactScore || 3, likelihoodScore: i.likelihoodScore || 3 }));
      const threats       = (plan.swotItems || []).filter(i => i.category === 'threat').map(i => ({ description: i.description, impactScore: i.impactScore || 3, likelihoodScore: i.likelihoodScore || 3 }));

      // Build rich systems context string for the AI prompt
      const systemsContext = hasSystemsContext
        ? buildSystemsContext(leveragePoints, selectedArchetypeName, activeArchetypeDescription, cldNodes, cldLinks)
        : null;

      // Construct the per-quadrant leverage summaries to attach as guidance
      const quadrantLeverageGuide = QUADRANT_TYPES.reduce<Record<string, any>>((acc, q) => {
        const qLPs = getLeveragePointsForQuadrant(leveragePoints, q);
        acc[q] = {
          leverageRationale: quadrantConfig[q].leverageRationale,
          relevantLeveragePoints: qLPs.map(lp => ({
            level: lp.leverageLevel,
            meadowsName: lp.meadowsName,
            intervention: lp.intervention,
            expectedImpact: lp.expectedImpact,
            timeHorizon: lp.timeHorizon,
          })),
        };
        return acc;
      }, {} as Record<string, any>);

      const { data, error } = await supabase.functions.invoke('ai-strategy-assistant', {
        body: {
          action: 'generate_strategies',
          data: {
            // ── SWOT factors (enriched with scores) ──
            strengths,
            weaknesses,
            opportunities,
            threats,

            // ── Strategic intent ──
            strategicIntent: plan.strategicIntent,

            // ── Systems Thinking context ──
            systemsContext,                        // Full structured text for prompt embedding
            activeArchetype: selectedArchetypeName ? {
              id:          selectedArchetypeId,
              name:        selectedArchetypeName,
              description: activeArchetypeDescription,
            } : null,
            leveragePoints: leveragePoints.map(lp => ({
              level:        lp.leverageLevel,
              meadowsName:  lp.meadowsName,
              intervention: lp.intervention,
              impact:       lp.expectedImpact,
              horizon:      lp.timeHorizon,
              source:       lp.source,
            })),
            cldVariables: cldNodes.map(n => ({ label: n.label, category: n.category })),
            cldRelationships: cldLinks.map(l => ({
              from:     cldNodes.find(n => n.id === l.from)?.label ?? l.from,
              to:       cldNodes.find(n => n.id === l.to)?.label   ?? l.to,
              polarity: l.polarity,
              strength: l.strength,
            })),

            // ── Per-quadrant leverage mapping ──
            quadrantLeverageGuide,

            // ── Generation instructions embedded for the edge function ──
            generationInstructions: buildGenerationInstructions(
              strengths.map(s => s.description),
              weaknesses.map(w => w.description),
              opportunities.map(o => o.description),
              threats.map(t => t.description),
              plan.strategicIntent,
              systemsContext,
              selectedArchetypeName,
              leveragePoints,
              quadrantLeverageGuide,
            ),
          },
        },
      });

      if (error) throw new Error(error.message || 'Failed to generate strategies');
      if (!data?.success || !data?.data) throw new Error('Invalid response from AI service');

      const options: Omit<StrategicOption, 'id'>[] = [];
      QUADRANT_TYPES.forEach(type => {
        const strategies = data.data[type] || [];
        strategies.forEach((s: any) => {
          options.push({
            optionType:       type,
            title:            s.title || s.name || 'Strategy',
            description:      s.description || '',
            priorityScore:    s.priority_score    || 3,
            feasibilityScore: s.feasibility_score || 3,
            selected:         false,
          });
        });
      });

      if (options.length > 0) onBulkAdd(options);
      else setGenerationError('No strategies were generated. Please try again.');
    } catch (error) {
      console.error('Failed to generate strategies:', error);
      setGenerationError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddStrategy = () => {
    if (!newStrategy.quadrant || !newStrategy.title.trim()) return;
    onAddOption({
      optionType:       newStrategy.quadrant,
      title:            newStrategy.title.trim(),
      description:      newStrategy.description.trim(),
      priorityScore:    3,
      feasibilityScore: 3,
      selected:         false,
    });
    setNewStrategy({ quadrant: null, title: '', description: '' });
  };

  const getOptionsByType = (type: QuadrantType) =>
    (plan.strategicOptions || []).filter(opt => opt.optionType === type);

  const selectedCount = (plan.strategicOptions || []).filter(opt => opt.selected).length;

  const swotCounts = useMemo(() => ({
    strengths:     (plan.swotItems || []).filter(i => i.category === 'strength').length,
    weaknesses:    (plan.swotItems || []).filter(i => i.category === 'weakness').length,
    opportunities: (plan.swotItems || []).filter(i => i.category === 'opportunity').length,
    threats:       (plan.swotItems || []).filter(i => i.category === 'threat').length,
  }), [plan.swotItems]);

  const canGenerate = swotCounts.strengths > 0 && swotCounts.weaknesses > 0 &&
    swotCounts.opportunities > 0 && swotCounts.threats > 0;

  return (
    <TooltipProvider>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Strategy Matrix</h1>
            <p className="text-slate-500">Generate and prioritize SO/ST/WO/WT strategic options{hasSystemsContext ? ' · systems-informed' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600">
              <span className="font-medium text-cyan-600">{selectedCount}</span> strategies selected
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleGenerateStrategies}
                    disabled={isGenerating || !canGenerate}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> AI Generate{hasSystemsContext ? ' (Systems-Aware)' : ''}</>
                    )}
                  </button>
                </TooltipTrigger>
                {hasSystemsContext && (
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-semibold text-violet-700 mb-1">Systems-Aware Generation Active</p>
                    <p className="text-xs text-slate-600">
                      {leveragePoints.length} leverage point{leveragePoints.length !== 1 ? 's' : ''},
                      {selectedArchetypeName ? ` "${selectedArchetypeName}" archetype,` : ''}
                      {cldNodes.length > 0 ? ` ${cldNodes.length} CLD variables` : ''} will inform strategy generation.
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* ── Systems Context Panel ── */}
        {hasSystemsContext && (
          <SystemsContextPanel
            leveragePoints={leveragePoints}
            archetypeName={selectedArchetypeName}
            archetypeDescription={activeArchetypeDescription}
            cldNodes={cldNodes}
            cldLinks={cldLinks}
          />
        )}

        {/* ── SWOT Warning ── */}
        {!canGenerate && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Complete SWOT Analysis First</p>
              <p className="text-xs text-amber-600">
                Add at least one item to each SWOT category to enable AI strategy generation.
                Current: {swotCounts.strengths}S, {swotCounts.weaknesses}W, {swotCounts.opportunities}O, {swotCounts.threats}T
              </p>
            </div>
          </div>
        )}

        {/* ── Generation Error ── */}
        {generationError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Strategy Generation Failed</p>
              <p className="text-xs text-red-600">{generationError}</p>
            </div>
          </div>
        )}

        {/* ── TOWS Matrix Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {QUADRANT_TYPES.map(type => {
            const config  = quadrantConfig[type];
            const options = getOptionsByType(type);
            const [Icon1, Icon2] = config.icons;

            return (
              <div key={type} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

                {/* Quadrant header */}
                <div className={`bg-gradient-to-r ${config.bgGradient} px-4 py-3`}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Icon1 className="w-5 h-5 text-white/80" />
                      <ArrowRight className="w-4 h-4 text-white/60" />
                      <Icon2 className="w-5 h-5 text-white/80" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{config.label}</h3>
                      <p className="text-xs text-white/70">{config.description}</p>
                    </div>
                    <span className="ml-auto bg-white/20 px-2 py-1 rounded-full text-sm text-white">{options.length}</span>
                  </div>
                </div>

                {/* Leverage hint bar */}
                <QuadrantLeverageHint quadrant={type} leveragePoints={leveragePoints} />

                {/* Strategy cards */}
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {options.map(option => (
                    <StrategyCard
                      key={option.id}
                      option={option}
                      config={config}
                      onUpdate={updates => onUpdateOption(option.id, updates)}
                      onRemove={() => onRemoveOption(option.id)}
                    />
                  ))}

                  {/* Add new strategy form */}
                  {newStrategy.quadrant === type ? (
                    <div className={cn(`${config.lightBg} ${config.border} border rounded-xl p-4 space-y-3`)}>
                      <input
                        type="text" autoFocus
                        value={newStrategy.title}
                        onChange={e => setNewStrategy(p => ({ ...p, title: e.target.value }))}
                        className="w-full px-3 py-2 text-sm font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Strategy title"
                      />
                      <textarea
                        value={newStrategy.description} rows={2}
                        onChange={e => setNewStrategy(p => ({ ...p, description: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                        placeholder="Strategy description"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setNewStrategy({ quadrant: null, title: '', description: '' })} className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 rounded-lg">Cancel</button>
                        <button onClick={handleAddStrategy} disabled={!newStrategy.title.trim()} className="px-3 py-1.5 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-colors">Add Strategy</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setNewStrategy({ quadrant: type, title: '', description: '' })}
                      className={cn('w-full py-3 border-2 border-dashed rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-400 transition-colors flex items-center justify-center gap-2', config.lightBg)}>
                      <Plus className="w-4 h-4" />
                      Add {type} Strategy
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Selected Strategies Summary ── */}
        {selectedCount > 0 && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6">
            <h3 className="font-semibold text-cyan-800 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Selected Strategic Options ({selectedCount})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(plan.strategicOptions || [])
                .filter(opt => opt.selected)
                .sort((a, b) => ((b.priorityScore || 3) + (b.feasibilityScore || 3)) - ((a.priorityScore || 3) + (a.feasibilityScore || 3)))
                .map(opt => {
                  const total = (opt.priorityScore || 3) + (opt.feasibilityScore || 3);
                  const tier  = getTotalScoreTier(total);
                  return (
                    <div key={opt.id} className="bg-white rounded-lg p-3 border border-cyan-200 flex items-start gap-3 hover:shadow-sm transition-shadow">
                      <span className={cn('px-2 py-1 rounded text-xs font-bold text-white shrink-0',
                        opt.optionType === 'SO' ? 'bg-emerald-500' :
                        opt.optionType === 'ST' ? 'bg-blue-500' :
                        opt.optionType === 'WO' ? 'bg-purple-500' : 'bg-amber-500')}>
                        {opt.optionType}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">{opt.title}</p>
                        <p className={cn('text-xs font-semibold', tier.color)}>Score: {total}/10 ({tier.label})</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── Scoring Reference ── */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Scoring Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Priority Scoring', type: 'priority' as const, desc: 'Rate how strategically important this initiative is for achieving objectives.', highlight: 'text-amber-600' },
              { title: 'Feasibility Scoring', type: 'feasibility' as const, desc: 'Rate how achievable this initiative is given available resources, time, and capabilities.', highlight: 'text-cyan-600' },
            ].map(({ title, type, desc, highlight }) => (
              <div key={type}>
                <h4 className="font-medium text-slate-700 mb-2">{title}</h4>
                <p className="text-xs text-slate-600 mb-3">{desc}</p>
                <div className="space-y-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} className="flex items-center gap-2 text-xs">
                      <span className={cn('font-bold w-4', n >= 4 ? highlight : 'text-slate-400')}>{n}.</span>
                      <span className="text-slate-600">{SCORE_DESCRIPTIONS[n as keyof typeof SCORE_DESCRIPTIONS][type]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </TooltipProvider>
  );
};

// ─── AI GENERATION PROMPT BUILDER ─────────────────────────────────────────────
//
// This function constructs the rich, structured prompt that gets embedded into
// the Supabase edge function body. The edge function should read
// data.generationInstructions and use it as the user turn (or system context)
// when calling the LLM, producing coherent, context-aware strategies.

function buildGenerationInstructions(
  strengths:     string[],
  weaknesses:    string[],
  opportunities: string[],
  threats:       string[],
  strategicIntent: string | undefined,
  systemsContext: string | null,
  archetypeName:  string | null | undefined,
  leveragePoints: LeveragePoint[],
  quadrantLeverageGuide: Record<string, any>,
): string {
  const lines: string[] = [];

  lines.push('=== STRATEGY GENERATION TASK ===');
  lines.push('');
  lines.push('You are an expert strategic advisor applying the TOWS matrix methodology. Your task is to generate');
  lines.push('2–3 CONCRETE, ACTIONABLE, and SPECIFIC strategic options for each of the four TOWS quadrants.');
  lines.push('');
  lines.push('CRITICAL REQUIREMENTS:');
  lines.push('  1. Each strategy MUST directly reference at least one strength/weakness AND one opportunity/threat from the SWOT below.');
  lines.push('  2. Each strategy title should be a clear verb phrase (e.g., "Leverage X to capture Y").');
  lines.push('  3. Each strategy description must be 2–3 sentences: what, why, and how it leverages the SWOT pair.');
  lines.push('  4. Assign priority_score (1–5) based on strategic importance to the stated intent.');
  lines.push('  5. Assign feasibility_score (1–5) based on realistic implementation capability.');
  lines.push('  6. DO NOT produce generic strategies — every option must be traceable to specific SWOT items.');
  lines.push('');

  if (strategicIntent) {
    lines.push(`STRATEGIC INTENT: "${strategicIntent}"`);
    lines.push('  (All strategies must align with and advance this intent.)');
    lines.push('');
  }

  lines.push('─── SWOT INVENTORY ───');
  lines.push('');

  if (strengths.length > 0) {
    lines.push('STRENGTHS (internal capabilities to build upon):');
    strengths.forEach((s, i) => lines.push(`  S${i + 1}: ${s}`));
    lines.push('');
  }
  if (weaknesses.length > 0) {
    lines.push('WEAKNESSES (internal gaps to address or work around):');
    weaknesses.forEach((w, i) => lines.push(`  W${i + 1}: ${w}`));
    lines.push('');
  }
  if (opportunities.length > 0) {
    lines.push('OPPORTUNITIES (external conditions to capitalize on):');
    opportunities.forEach((o, i) => lines.push(`  O${i + 1}: ${o}`));
    lines.push('');
  }
  if (threats.length > 0) {
    lines.push('THREATS (external risks to mitigate or avoid):');
    threats.forEach((t, i) => lines.push(`  T${i + 1}: ${t}`));
    lines.push('');
  }

  if (systemsContext) {
    lines.push('─── SYSTEMS THINKING CONTEXT ───');
    lines.push('');
    lines.push('The following causal loop diagram (CLD) analysis and Meadows leverage point framework');
    lines.push('has been completed for this organization. Use this to make strategies SYSTEMS-AWARE:');
    lines.push('  • Strategies should target or exploit the identified leverage points wherever possible.');
    lines.push('  • Reference specific causal dynamics (reinforcing/balancing loops, delays) in strategy rationale.');
    lines.push('  • Higher Meadows levels (L1–L4) indicate deeper, more durable interventions — favour them.');
    lines.push('');
    lines.push(systemsContext);
    lines.push('');
  }

  if (leveragePoints.length > 0) {
    lines.push('─── PER-QUADRANT LEVERAGE GUIDANCE ───');
    lines.push('');
    lines.push('Use the following Meadows leverage points to enrich each quadrant\'s strategies:');
    lines.push('');

    QUADRANT_TYPES.forEach(q => {
      const guide = quadrantLeverageGuide[q];
      const cfg   = quadrantConfig[q];
      lines.push(`${q} STRATEGIES — ${cfg.description.toUpperCase()}`);
      lines.push(`  Leverage rationale: ${guide.leverageRationale}`);
      if (guide.relevantLeveragePoints.length > 0) {
        lines.push('  Relevant leverage points to incorporate:');
        guide.relevantLeveragePoints.forEach((lp: any) => {
          lines.push(`    [L${lp.level} — ${lp.meadowsName}] (${lp.expectedImpact} impact, ${lp.timeHorizon}-term)`);
          lines.push(`      → ${lp.intervention}`);
        });
      } else {
        lines.push('  (No quadrant-specific leverage points identified; use SWOT pairs directly.)');
      }
      lines.push('');
    });
  }

  lines.push('─── OUTPUT FORMAT ───');
  lines.push('');
  lines.push('Return a JSON object with keys "SO", "ST", "WO", "WT". Each key maps to an array of strategy objects:');
  lines.push('{');
  lines.push('  "SO": [');
  lines.push('    {');
  lines.push('      "title": "Verb-phrase strategy title (max 10 words)",');
  lines.push('      "description": "2–3 sentence description referencing specific SWOT items and leverage points.",');
  lines.push('      "priority_score": 4,     // 1–5, how critical for strategic intent');
  lines.push('      "feasibility_score": 3   // 1–5, how achievable given resources');
  lines.push('    }');
  lines.push('  ],');
  lines.push('  "ST": [...], "WO": [...], "WT": [...]');
  lines.push('}');
  lines.push('');
  lines.push('Aim for 2–3 strategies per quadrant. Prioritize quality and specificity over quantity.');
  lines.push('Every strategy description should feel like it was written by someone who deeply understands');
  lines.push('both the SWOT context AND the systems dynamics at play.');

  return lines.join('\n');
}

export default StrategyMatrix;