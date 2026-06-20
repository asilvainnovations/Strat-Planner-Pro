import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Shield,
  AlertCircle,
  Lightbulb,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  ChevronRight,
  Check,
  HelpCircle,
  GitBranch,
  Plus,
  Circle,
  ExternalLink,
  X,
  Link as LinkIcon,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Layers,
  Wand2,
  LayoutDashboard,
  PlayCircle,
  BookOpen,
  RefreshCw,
  MousePointerClick,
  Target,
  Crosshair,
  Gauge,
  Workflow,
  Brain,
  Anchor,
  Clock,
  Activity,
  BarChart2,
  Save,
  Download,
  Upload,
  FileText,
  Printer,
  Copy,
  Trash2,
  Eye,
  Bot,
} from 'lucide-react';

// Import your actual hook
import { useStrategicPlan } from '@/hooks/useStrategicPlan';

import { StrategicPlan, SWOTItem, CLDNode, CLDLink, CLDSnapshot } from '@/lib/strategicPlanStore';
import { cn } from '@/lib/utils';

interface SystemsThinkingProps {
  plan: StrategicPlan;
  onUpdateItem?: (id: string, updates: Partial<SWOTItem>) => void;
  planId?: string;
}

// ─── EXTENDED TYPES ───────────────────────────────────────────────────────────

interface ExtendedCLDNode extends CLDNode {
  nodeType?: 'stock' | 'flow' | 'converter' | 'goal' | 'paradigm' | 'default';
  leverageLevel?: number;
}

interface ExtendedCLDLink extends CLDLink {
  delay?: number;
  strength?: number;
}

interface LeveragePoint {
  archetypeId?: string;
  leverageLevel: number;
  meadowsName: string;
  intervention: string;
  targetNodeIds: string[];
  expectedImpact: 'high' | 'medium' | 'low';
  timeHorizon: 'short' | 'medium' | 'long';
  source: 'archetype' | 'cld-analysis';
}

interface DetectedLoop {
  nodeIds: string[];
  type: 'R' | 'B';
  name: string;
  strength: number;
}

// ─── AI ANALYSIS RESPONSE TYPES ────────────────────────────────────────────────

interface AIAnalysisResponse {
  detected_loops: DetectedLoop[];
  dominant_archetypes: Array<{
    archetypeId: string;
    archetypeName: string;
    confidence: number;
    matchedNodes: string[];
  }>;
  ranked_leverage_points: Array<Omit<LeveragePoint, 'source'>>;
  recommendations?: string[];
}

// ─── MEADOWS LEVELS ───────────────────────────────────────────────────────────

const MEADOWS_LEVELS: Record<number, { name: string; icon: React.ElementType; color: string; desc: string }> = {
  12: { name: 'Constants & Parameters',   icon: Gauge,      color: 'text-slate-500 dark:text-slate-400 dark:text-slate-500',    desc: 'Numbers, subsidies, taxes, standards' },
  11: { name: 'Buffer Sizes',             icon: Anchor,     color: 'text-slate-500 dark:text-slate-400 dark:text-slate-500',    desc: 'Sizes of stabilizing stocks' },
  10: { name: 'Stock-Flow Structure',     icon: Workflow,   color: 'text-blue-500',     desc: 'Physical arrangement of stocks and flows' },
  9:  { name: 'Delay Lengths',            icon: Clock,      color: 'text-blue-600',     desc: 'Length of time relative to rates of change' },
  8:  { name: 'Negative Feedback',        icon: Activity,   color: 'text-cyan-600',     desc: 'Strength of balancing feedback loops' },
  7:  { name: 'Positive Feedback Gain',   icon: TrendingUp, color: 'text-emerald-600',  desc: 'Gain around driving reinforcing loops' },
  6:  { name: 'Information Flows',        icon: BarChart2,  color: 'text-yellow-600',   desc: 'Structure of who does and does not have access to information' },
  5:  { name: 'Rules',                    icon: BookOpen,   color: 'text-orange-600',   desc: 'Incentives, punishments, constraints' },
  4:  { name: 'Self-Organization',        icon: Sparkles,   color: 'text-red-500',      desc: 'Power to change, evolve, or self-organize system structure' },
  3:  { name: 'Goals',                    icon: Target,     color: 'text-red-600',      desc: 'Purpose or function of the system' },
  2:  { name: 'Mindset / Paradigm',       icon: Brain,      color: 'text-purple-600',   desc: 'Shared idea from which the system arises' },
  1:  { name: 'Transcend Paradigms',      icon: Crosshair,  color: 'text-violet-700',   desc: 'Ability to rise above paradigms' },
};

// ─── LOOP DETECTION ───────────────────────────────────────────────────────────

const findLoops = (nodes: ExtendedCLDNode[], links: ExtendedCLDLink[]): DetectedLoop[] => {
  const loops: DetectedLoop[] = [];
  const visited = new Set<string>();

  const dfs = (startId: string, currentId: string, path: string[], depth: number) => {
    if (depth > 8) return;
    const outgoing = links.filter(l => l.from === currentId);
    for (const link of outgoing) {
      if (link.to === startId && path.length >= 2) {
        const loopKey = [...path].sort().join('-');
        if (!visited.has(loopKey)) {
          visited.add(loopKey);
          const loopLinks = path.map((nodeId, i) => {
            const nextId = i < path.length - 1 ? path[i + 1] : startId;
            return links.find(l => l.from === nodeId && l.to === nextId);
          }).filter(Boolean) as ExtendedCLDLink[];

          const negCount = loopLinks.filter(l => l.polarity === '-').length;
          const type: 'R' | 'B' = negCount % 2 === 0 ? 'R' : 'B';
          const avgStrength = loopLinks.reduce((s, l) => s + (l.strength || 3), 0) / Math.max(loopLinks.length, 1);
          const nodeLabels = path.map(id => nodes.find(n => n.id === id)?.label || id);

          loops.push({
            nodeIds: [...path],
            type,
            name: `${type}${loops.filter(l => l.type === type).length + 1}: ${nodeLabels[0]} → … → ${nodeLabels[nodeLabels.length - 1]}`,
            strength: Math.round(avgStrength),
          });
        }
      } else if (!path.includes(link.to)) {
        dfs(startId, link.to, [...path, link.to], depth + 1);
      }
    }
  };

  for (const node of nodes) {
    dfs(node.id, node.id, [node.id], 0);
  }

  return loops;
};

// ─── ARCHETYPE CONFIG ──────────────────────────────────────────────────────────

interface SystemArchetype {
  id: string;
  name: string;
  category: string;
  color: string;
  desc: string;
  use: string;
  swotHint: string;
  nodeLabels: string[];
  loops: Array<{ from: string; to: string; polarity: '+' | '-'; label?: string }>;
  loopTypes: string[];
  imageUrl?: string;
}

const systemArchetypes: SystemArchetype[] = [
  {
    id: 'ltg', name: 'Limits to Success', category: 'Reinforcing + Balancing',
    color: 'from-emerald-500 to-teal-600',
    imageUrl: 'https://paibpwwszlfpsyytdnal.databasepad.com/storage/v1/object/public/systems-archetypes/public/Limits-to-Success1.png',
    desc: 'A reinforcing growth process is slowed by a balancing constraint.',
    use: 'Use when growth initiatives stall despite strong investment.',
    swotHint: 'Strength-driven opportunities facing constraint threats.',
    nodeLabels: ['Growing Action', 'Performance', 'Limiting Condition', 'Constraining Action'],
    loops: [
      { from: 'Growing Action',      to: 'Performance',         polarity: '+', label: 'R' },
      { from: 'Performance',         to: 'Growing Action',      polarity: '+', label: 'R' },
      { from: 'Performance',         to: 'Limiting Condition',  polarity: '+', label: 'B' },
      { from: 'Limiting Condition',  to: 'Constraining Action', polarity: '+', label: 'B' },
      { from: 'Constraining Action', to: 'Performance',         polarity: '-', label: 'B' },
    ],
    loopTypes: ['R: Virtuous growth cycle', 'B: Capacity constraint feedback'],
  },
  {
    id: 'stb', name: 'Shifting the Burden', category: 'Balancing + Reinforcing (undermining)',
    color: 'from-amber-500 to-orange-600',
    imageUrl: 'https://paibpwwszlfpsyytdnal.databasepad.com/storage/v1/object/public/systems-archetypes/public/Shifting-the-Burden2.png',
    desc: 'A symptomatic solution relieves pressure but erodes capacity to address fundamental problem.',
    use: 'Use when recurring fixes do not solve root problems.',
    swotHint: 'Repeated weaknesses despite tactical interventions.',
    nodeLabels: ['Problem Symptom', 'Symptomatic Fix', 'Fundamental Solution', 'Side Effect'],
    loops: [
      { from: 'Problem Symptom',     to: 'Symptomatic Fix',      polarity: '+', label: 'B1' },
      { from: 'Symptomatic Fix',     to: 'Problem Symptom',      polarity: '-', label: 'B1' },
      { from: 'Problem Symptom',     to: 'Fundamental Solution', polarity: '+', label: 'B2' },
      { from: 'Fundamental Solution',to: 'Problem Symptom',      polarity: '-', label: 'B2' },
    ],
    loopTypes: ['B1: Symptomatic relief', 'B2: Fundamental solution'],
  },
  {
    id: 'dg', name: 'Drifting Goals', category: 'Two Balancing Loops',
    color: 'from-blue-500 to-indigo-600',
    imageUrl: 'https://paibpwwszlfpsyytdnal.databasepad.com/storage/v1/object/public/systems-archetypes/public/Drifting-Goals2.png',
    desc: 'When performance gaps are uncomfortable, standard is lowered rather than corrective action taken.',
    use: 'Use when targets are consistently missed and expectations erode.',
    swotHint: 'Weaknesses that persist without remediation.',
    nodeLabels: ['Goal / Target', 'Gap', 'Corrective Action', 'Actual Performance'],
    loops: [
      { from: 'Gap',               to: 'Corrective Action',   polarity: '+', label: 'B1' },
      { from: 'Corrective Action', to: 'Actual Performance',  polarity: '+', label: 'B1' },
      { from: 'Actual Performance',to: 'Gap',                 polarity: '-', label: 'B1' },
      { from: 'Goal / Target',     to: 'Gap',                 polarity: '+', label: '' },
    ],
    loopTypes: ['B1: Corrective action closes gap'],
  },
  {
    id: 'esc', name: 'Escalation', category: 'Two Reinforcing Loops',
    color: 'from-red-500 to-rose-600',
    imageUrl: 'https://paibpwwszlfpsyytdnal.databasepad.com/storage/v1/object/public/systems-archetypes/public/Escalation1.png',
    desc: 'Two parties perceive each other as threats and match escalating actions.',
    use: 'Use in competitive, adversarial dynamics where counter-responses spiral.',
    swotHint: 'Multiple external threats from competing entities.',
    nodeLabels: ['Our Relative Advantage', 'Their Actions', 'Their Relative Advantage', 'Our Actions'],
    loops: [
      { from: 'Their Actions',           to: 'Our Relative Advantage',   polarity: '-', label: 'R1' },
      { from: 'Our Relative Advantage',  to: 'Our Actions',              polarity: '+', label: 'R1' },
      { from: 'Our Actions',             to: 'Their Relative Advantage', polarity: '-', label: 'R2' },
    ],
    loopTypes: ['R1: Our escalation', 'R2: Their escalation'],
  },
  {
    id: 'sts', name: 'Success to the Successful', category: 'Two Reinforcing Loops',
    color: 'from-purple-500 to-violet-600',
    imageUrl: 'https://paibpwwszlfpsyytdnal.databasepad.com/storage/v1/object/public/systems-archetypes/public/Success-to-the-Successful1.png',
    desc: 'Two competing activities draw from shared resource pool. Winners keep winning.',
    use: 'Use when winners keep winning regardless of merit.',
    swotHint: 'Dominant strengths concentrating strategic resources.',
    nodeLabels: ['Resources to A', 'Success of A', 'Resources to B', 'Success of B'],
    loops: [
      { from: 'Resources to A', to: 'Success of A',   polarity: '+', label: 'R1' },
      { from: 'Success of A',   to: 'Resources to A', polarity: '+', label: 'R1' },
      { from: 'Resources to B', to: 'Success of B',   polarity: '+', label: 'R2' },
      { from: 'Success of B',   to: 'Resources to B', polarity: '+', label: 'R2' },
    ],
    loopTypes: ['R1: Winner advantage', 'R2: Loser starvation'],
  },
  {
    id: 'toc', name: 'Tragedy of the Commons', category: 'Reinforcing + Multiple Balancing',
    color: 'from-cyan-500 to-sky-600',
    imageUrl: 'https://paibpwwszlfpsyytdnal.databasepad.com/storage/v1/object/public/systems-archetypes/public/Tragedy-of-the-Commons1.png',
    desc: 'Individual actors rationally exploit shared resources, collectively depleting them.',
    use: 'Use when shared assets deteriorate despite rational individual behavior.',
    swotHint: 'Shared market opportunities being over-exploited.',
    nodeLabels: ['Individual Activity', 'Total Shared Activity', 'Commons Capacity', 'Net Gain per User'],
    loops: [
      { from: 'Net Gain per User',     to: 'Individual Activity',    polarity: '+', label: 'R' },
      { from: 'Individual Activity',   to: 'Total Shared Activity',  polarity: '+', label: '' },
      { from: 'Total Shared Activity', to: 'Commons Capacity',       polarity: '-', label: 'B' },
    ],
    loopTypes: ['R: Individual gain attraction', 'B: Overuse degrades commons'],
  },
  {
    id: 'ftf', name: 'Fixes that Fail', category: 'Balancing + Reinforcing (delayed)',
    color: 'from-orange-500 to-red-500',
    imageUrl: 'https://paibpwwszlfpsyytdnal.databasepad.com/storage/v1/object/public/systems-archetypes/public/Fixes-That-Fail2.png',
    desc: 'A fix that alleviates a problem creates unintended consequences that worsen original problem.',
    use: 'Use when solutions create new problems or short-term fixes repeatedly fail.',
    swotHint: 'Repeated tactical fixes not resolving core weaknesses.',
    nodeLabels: ['Problem', 'Fix / Solution', 'Unintended Consequence', 'Delay'],
    loops: [
      { from: 'Problem',         to: 'Fix / Solution',          polarity: '+', label: 'B' },
      { from: 'Fix / Solution',  to: 'Problem',                 polarity: '-', label: 'B' },
      { from: 'Fix / Solution',  to: 'Unintended Consequence',  polarity: '+', label: 'R' },
    ],
    loopTypes: ['B: Short-term fix loop', 'R: Unintended consequence'],
  },
  {
    id: 'gui', name: 'Growth and Underinvestment', category: 'Reinforcing + Multiple Balancing',
    color: 'from-slate-500 to-slate-700',
    imageUrl: 'https://paibpwwszlfpsyytdnal.databasepad.com/storage/v1/object/public/systems-archetypes/public/Growth-and-Underinvestment2.png',
    desc: 'Growth drives demand that strains capacity. Standards are lowered rather than investing to expand.',
    use: 'Use when high-growth initiatives plateau as infrastructure cannot keep pace.',
    swotHint: 'Opportunity growth limited by capacity weaknesses.',
    nodeLabels: ['Growth Engine', 'Demand', 'Capacity Gap', 'Investment', 'Performance Standard'],
    loops: [
      { from: 'Growth Engine', to: 'Demand',        polarity: '+', label: 'R' },
      { from: 'Demand',        to: 'Growth Engine', polarity: '+', label: 'R' },
      { from: 'Demand',        to: 'Capacity Gap',  polarity: '+', label: 'B' },
      { from: 'Capacity Gap',  to: 'Investment',    polarity: '+', label: 'B' },
    ],
    loopTypes: ['R: Self-reinforcing growth', 'B: Capacity investment needed'],
  },
  {
    id: 'aa', name: 'Accidental Adversaries', category: 'Two Reinforcing Loops (degrading)',
    color: 'from-pink-500 to-rose-600',
    desc: 'Two parties working toward compatible goals take actions that inadvertently undermine each other.',
    use: 'Use in partnership contexts where self-interest damages relationships.',
    swotHint: 'Partnership strengths eroding through misalignment.',
    nodeLabels: ['Our Success', 'Our Actions', 'Their Success', 'Their Actions'],
    loops: [
      { from: 'Our Actions',   to: 'Our Success',   polarity: '+', label: 'R1' },
      { from: 'Our Actions',   to: 'Their Success', polarity: '-', label: 'R2' },
      { from: 'Their Success', to: 'Their Actions', polarity: '+', label: 'R2' },
      { from: 'Their Actions', to: 'Our Success',   polarity: '-', label: 'R2' },
    ],
    loopTypes: ['R1: Individual success reinforcement', 'R2: Mutual undermining'],
  },
  {
    id: 'ap', name: 'Attractiveness Principle', category: 'Reinforcing + Balancing',
    color: 'from-violet-500 to-purple-700',
    desc: 'As system attracts more participants due to appeal, congestion reduces quality, eroding attractiveness.',
    use: 'Use when growth from popularity degrades the thing that made it popular.',
    swotHint: 'Rapidly growing opportunities attracting competitors.',
    nodeLabels: ['Attractiveness', 'New Entrants / Demand', 'Congestion / Load', 'Quality / Performance'],
    loops: [
      { from: 'Attractiveness',        to: 'New Entrants / Demand', polarity: '+', label: 'R' },
      { from: 'New Entrants / Demand', to: 'Quality / Performance', polarity: '-', label: 'B' },
      { from: 'Quality / Performance', to: 'Attractiveness',        polarity: '+', label: 'B' },
    ],
    loopTypes: ['R: Growth-from-attractiveness', 'B: Congestion degrades quality'],
  },
];

// ─── CATEGORY CONFIG ──────────────────────────────────────────────────────────

const categoryConfig = {
  strength:    { label: 'Strength',    icon: Shield,      color: 'emerald', bgColor: 'bg-emerald-500', lightBg: 'bg-emerald-50',  textColor: 'text-emerald-700', borderColor: 'border-emerald-200', defaultCLDPolarity: '+' as '+' | '-' },
  weakness:    { label: 'Weakness',    icon: AlertCircle, color: 'red',     bgColor: 'bg-red-500',     lightBg: 'bg-red-50',      textColor: 'text-red-700',     borderColor: 'border-red-200',     defaultCLDPolarity: '-' as '+' | '-' },
  opportunity: { label: 'Opportunity', icon: Lightbulb,   color: 'blue',    bgColor: 'bg-blue-500',    lightBg: 'bg-blue-50',     textColor: 'text-blue-700',    borderColor: 'border-blue-200',    defaultCLDPolarity: '+' as '+' | '-' },
  threat:      { label: 'Threat',      icon: Zap,         color: 'amber',   bgColor: 'bg-amber-500',   lightBg: 'bg-amber-50',    textColor: 'text-amber-700',   borderColor: 'border-amber-200',   defaultCLDPolarity: '-' as '+' | '-' },
};

// ─── SCORE BUTTON ─────────────────────────────────────────────────────────────

const ScoreButton: React.FC<{
  value: number; selectedValue: number; onSelect: (v: number) => void;
  type: 'impact' | 'likelihood'; category: keyof typeof categoryConfig;
}> = ({ value, selectedValue, onSelect, type, category }) => {
  const config = categoryConfig[category];
  const isSelected = value <= selectedValue;
  return (
    <button onClick={() => onSelect(value)}
      className={cn('w-7 h-7 rounded-full border-2 transition-all duration-150 flex items-center justify-center',
        isSelected
          ? type === 'impact'
            ? config.defaultCLDPolarity === '+' ? 'border-emerald-500 bg-emerald-500' : 'border-red-500 bg-red-500'
            : 'border-cyan-500 bg-cyan-500'
          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 hover:bg-slate-50 dark:bg-slate-900'
      )} aria-label={`${type} score ${value}`}>
      {isSelected && <Check className='w-3.5 h-3.5 text-white' />}
    </button>
  );
};

const ScoreRow: React.FC<{
  label: string; score: number; onChange: (v: number) => void;
  type: 'impact' | 'likelihood'; category: keyof typeof categoryConfig;
  readOnly?: boolean; labelColor?: string;
}> = ({ label, score, onChange, type, category, readOnly, labelColor }) => (
  <div className='flex items-center gap-2 flex-wrap'>
    <span className={cn('text-xs font-semibold w-16 shrink-0', labelColor || 'text-slate-500 dark:text-slate-400 dark:text-slate-500')}>{label}</span>
    <div className='flex gap-1'>
      {[1, 2, 3, 4, 5].map(n => (
        <ScoreButton key={n} value={n} selectedValue={score} onSelect={readOnly ? () => {} : onChange} type={type} category={category} />
      ))}
    </div>
    <span className={cn('text-xs font-bold tabular-nums', labelColor || 'text-slate-600 dark:text-slate-400 dark:text-slate-500')}>{score}/5</span>
  </div>
);

const PriorityBadge: React.FC<{ totalScore: number; category: keyof typeof categoryConfig }> = ({ totalScore, category }) => {
  const PRIORITY_GUIDE = [
    { level: 'Low',      range: '1–9',   color: 'text-slate-600 dark:text-slate-400 dark:text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700' },
    { level: 'Medium',   range: '10–15', color: 'text-blue-600',  bg: 'bg-blue-100',  border: 'border-blue-200' },
    { level: 'High',     range: '16–20', color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
    { level: 'Critical', range: '21–25', color: 'text-red-600',   bg: 'bg-red-100',   border: 'border-red-200' },
  ];

  const getPriorityInfo = (score: number) => {
    if (score <= 9)  return PRIORITY_GUIDE[0];
    if (score <= 15) return PRIORITY_GUIDE[1];
    if (score <= 20) return PRIORITY_GUIDE[2];
    return PRIORITY_GUIDE[3];
  };

  const priority = getPriorityInfo(totalScore);
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold border', priority.bg, priority.color, priority.border)}>
      {priority.level} · {totalScore}
    </span>
  );
};

// ─── SWOT CARD ────────────────────────────────────────────────────────────────

const SWOTCard: React.FC<{
  item: SWOTItem; config: typeof categoryConfig.strength;
  onUpdate?: (id: string, updates: Partial<SWOTItem>) => void;
  onAddToCLD?: (item: SWOTItem) => void; compact?: boolean;
}> = ({ item, config, onUpdate, onAddToCLD, compact }) => {
  const imp = item.impactScore || 3;
  const lik = item.likelihoodScore || 3;
  const total = imp * lik;
  if (compact) {
    return (
      <div className={cn('rounded-lg p-3 border transition-all', config.lightBg, config.borderColor)}>
        <p className={cn('text-sm font-medium mb-2 leading-snug', config.textColor)}>{item.description}</p>
        <div className='flex items-center justify-between flex-wrap gap-2'>
          <div className='flex gap-3 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500'>
            <span>Impact <span className={cn('font-bold', config.textColor)}>{imp}</span></span>
            <span>Likelihood <span className='font-bold text-cyan-600'>{lik}</span></span>
          </div>
          <div className='flex items-center gap-2'>
            <PriorityBadge totalScore={total} category={item.category} />
            {onAddToCLD && (
              <button onClick={() => onAddToCLD(item)} title='Add to CLD'
                className='p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors'>
                <Plus className='w-3 h-3' />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={cn('rounded-xl p-4 border transition-all', config.lightBg, config.borderColor)}>
      <div className='flex items-start justify-between gap-2 mb-3'>
        <p className={cn('text-sm font-medium leading-relaxed', config.textColor)}>{item.description}</p>
        <span className={cn('px-2 py-0.5 rounded text-xs font-bold text-white shrink-0', config.bgColor)}>
          {config.defaultCLDPolarity === '+' ? '+' : '−'}{total}
        </span>
      </div>
      <div className='space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700/60'>
        <ScoreRow label='Impact' score={imp} onChange={v => onUpdate?.(item.id, { impactScore: v })} type='impact' category={item.category} labelColor={config.textColor} />
        <ScoreRow label='Likelihood' score={lik} onChange={v => onUpdate?.(item.id, { likelihoodScore: v })} type='likelihood' category={item.category} />
        <div className='flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700/40'>
          <span className='text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500'>Impact × Likelihood</span>
          <div className='flex items-center gap-2'>
            <PriorityBadge totalScore={total} category={item.category} />
            {onAddToCLD && (
              <button onClick={() => onAddToCLD(item)}
                className='flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors font-medium'>
                <GitBranch className='w-3 h-3' /> Add to CLD
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SWOT QUADRANT ────────────────────────────────────────────────────────────

const SWOTQuadrant: React.FC<{
  title: string; count: number; icon: React.ElementType; items: SWOTItem[];
  config: typeof categoryConfig.strength;
  onUpdate?: (id: string, updates: Partial<SWOTItem>) => void;
  onAddToCLD?: (item: SWOTItem) => void;
}> = ({ title, count, icon: Icon, items, config, onUpdate, onAddToCLD }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className={cn('rounded-xl border overflow-hidden', config.borderColor)}>
      <button onClick={() => setOpen(v => !v)} className={cn('w-full flex items-center justify-between px-4 py-3', config.lightBg)}>
        <div className='flex items-center gap-2'>
          <Icon className={cn('w-4 h-4', config.textColor)} />
          <h4 className={cn('font-semibold text-sm', config.textColor)}>{title}</h4>
          <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', config.bgColor, 'text-white')}>{count}</span>
        </div>
        {open ? <ChevronUp className='w-4 h-4 text-slate-400 dark:text-slate-500' /> : <ChevronDown className='w-4 h-4 text-slate-400 dark:text-slate-500' />}
      </button>
      {open && (
        <div className='p-3 space-y-2 bg-white dark:bg-slate-800/60/60'>
          {items.length === 0
            ? <p className='text-xs text-slate-400 dark:text-slate-500 text-center py-4'>No items yet</p>
            : items.map(item => <SWOTCard key={item.id} item={item} config={config} onUpdate={onUpdate} onAddToCLD={onAddToCLD} compact />)
          }
        </div>
      )}
    </div>
  );
};

// ─── EDUCATIONAL RESOURCES ────────────────────────────────────────────────────

const EducationalResources: React.FC = () => (
  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 p-4 space-y-4">
    <div className="flex items-center gap-2 mb-3">
      <PlayCircle className="w-4 h-4 text-blue-600" />
      <h3 className="text-sm font-semibold text-blue-800">Learning Resources</h3>
    </div>
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <iframe
        src="https://www.youtube.com/embed/fXxFz-Tr6Zg"
        title="Systems Mapping"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full rounded-lg"
      />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[
        { title: 'Causal Loop Diagrams', url: 'https://youtu.be/tTo06jbSZ4M?si=mSyIfuUvpeXPsrW' },
        { title: 'Systems Archetypes',   url: 'https://youtu.be/zRmEh-PMvWo?si=DnxR-3n4I-382hKT' },
      ].map(r => (
        <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
          className="group flex items-center gap-3 px-4 py-3 rounded-lg bg-white dark:bg-slate-800/60 border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <PlayCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-700 transition-colors">{r.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">External video tutorial</p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors" />
        </a>
      ))}
    </div>
  </div>
);

// ─── ARCHETYPE IMAGE TOOLTIP ──────────────────────────────────────────────────

const ArchetypeImageTooltip: React.FC<{ imageUrl: string; archetypeName: string }> = ({
  imageUrl,
  archetypeName,
}) => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos]         = useState<{ top: number; left: number } | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError]   = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHide = () => { if (hideTimer.current) clearTimeout(hideTimer.current); };

  const show = () => {
    clearHide();
    if (triggerRef.current) {
      const rect         = triggerRef.current.getBoundingClientRect();
      const spaceBelow   = window.innerHeight - rect.bottom;
      const spaceRight   = window.innerWidth  - rect.right;
      const tooltipW     = 268;
      const tooltipH     = 260;
      setPos({
        top:  spaceBelow > tooltipH + 12 ? rect.bottom + 6 : rect.top - tooltipH - 6,
        left: spaceRight > tooltipW + 8  ? rect.left       : Math.max(8, rect.right - tooltipW),
      });
    }
    setVisible(true);
  };

  const hide = () => {
    hideTimer.current = setTimeout(() => setVisible(false), 120);
  };

  // Clean up timer on unmount
  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={e => {
          e.stopPropagation();
          visible ? setVisible(false) : show();
        }}
        className={cn(
          'shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150',
          visible
            ? 'bg-blue-500 text-white shadow-md scale-110'
            : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 text-slate-400 dark:text-slate-500 hover:text-blue-500 hover:scale-110',
        )}
        title={`Preview ${archetypeName} diagram`}
        aria-label={`Preview ${archetypeName} diagram`}
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      {visible && pos && !imgError && (
        <div
          className="fixed z-50 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{ top: pos.top, left: pos.left, width: 268 }}
          onMouseEnter={() => { clearHide(); setVisible(true); }}
          onMouseLeave={hide}
        >
          {/* Tooltip header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 dark:border-slate-700">
            <GitBranch className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{archetypeName}</span>
            <span className="ml-auto text-[9px] text-slate-400 dark:text-slate-500 shrink-0">archetype diagram</span>
          </div>

          {/* Image area */}
          <div className="relative bg-slate-50 dark:bg-slate-900" style={{ minHeight: 180 }}>
            {/* Skeleton loader */}
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="space-y-2 w-full px-6">
                  <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4 mx-auto" />
                  <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2 mx-auto" />
                  <div className="h-24 bg-slate-200 rounded-lg animate-pulse mt-3" />
                </div>
              </div>
            )}
            <img
              src={imageUrl}
              alt={`${archetypeName} systems archetype diagram`}
              className={cn(
                'w-full object-contain p-2 transition-opacity duration-300',
                imgLoaded ? 'opacity-100' : 'opacity-0',
              )}
              style={{ maxHeight: 220 }}
              onLoad={() => setImgLoaded(true)}
              onError={() => { setImgError(true); setVisible(false); }}
            />
          </div>

          {/* Footer hint */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700/60">
            <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center">Hover to keep open · click eye to pin</p>
          </div>
        </div>
      )}
    </>
  );
};

// ─── LEVERAGE POINTS PANEL ────────────────────────────────────────────────────

const impactColors = {
  high:   { badge: 'bg-red-100 text-red-700 border-red-200',       dot: 'bg-red-500'    },
  medium: { badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500'  },
  low:    { badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400'  },
};

const horizonColors = {
  short:  'text-emerald-600 bg-emerald-50 border-emerald-200',
  medium: 'text-blue-600 bg-blue-50 border-blue-200',
  long:   'text-purple-600 bg-purple-50 border-purple-200',
};

const LeveragePointsPanel: React.FC<{
  nodes: ExtendedCLDNode[];
  links: ExtendedCLDLink[];
  selectedArchId: string | null;
  highlightedNodeIds: string[];
  onHighlightNodes: (ids: string[]) => void;
}> = ({ nodes, links, selectedArchId, highlightedNodeIds, onHighlightNodes }) => {

  const generateArchetypeLeveragePoints = (archetypeId: string, nodes: ExtendedCLDNode[], links: ExtendedCLDLink[]): LeveragePoint[] => {
    const base: (Omit<LeveragePoint, 'targetNodeIds'> & { targetFilter: (label: string) => boolean })[] = [];

    const push = (
      leverageLevel: number,
      intervention: string,
      expectedImpact: 'high' | 'medium' | 'low',
      timeHorizon: 'short' | 'medium' | 'long',
      targetFilter: (label: string) => boolean,
    ) => base.push({ archetypeId, leverageLevel, meadowsName: MEADOWS_LEVELS[leverageLevel]?.name || '', intervention, expectedImpact, timeHorizon, source: 'archetype', targetFilter });

    switch (archetypeId) {
      case 'ltg':
        push(10, 'Remove structural constraint: invest in capacity expansion before growth stalls', 'high',   'medium', l => /limit|constrain|capacit/i.test(l));
        push(7,  'Strengthen growth engine: accelerate virtuous cycle while constraint is still loose', 'high', 'short',  l => /growing|growth|perform/i.test(l));
        push(8,  'Increase balancing feedback sensitivity to identify bottlenecks earlier', 'medium', 'medium', l => /constrain|limit/i.test(l));
        break;
      case 'stb':
        push(5,  'Change incentive rules: make symptomatic fixes more costly; reward root-cause solutions', 'high', 'medium', l => /symptom|fix/i.test(l));
        push(8,  'Strengthen B2 loop: resource fundamental solutions, reduce symptomatic fix dependency', 'high', 'long',   l => /fundamental/i.test(l));
        push(6,  'Improve information flow: make root causes more visible to decision-makers', 'medium', 'short', l => /problem|symptom/i.test(l));
        break;
      case 'dg':
        push(3,  'Hold goal firm: make goal-setting process independent of performance pressure', 'high',   'medium', l => /goal|target/i.test(l));
        push(8,  'Strengthen corrective action loop: reduce response time to performance gaps', 'medium', 'short',  l => /corrective|action/i.test(l));
        push(6,  'Improve performance visibility: make gap transparent and undeniable', 'high',   'short',  l => /gap|perform/i.test(l));
        break;
      case 'esc':
        push(2,  'Paradigm shift: reframe from zero-sum to mutual-gain; seek win-win agreements', 'high',   'long',   _ => true);
        push(7,  'Reduce gain: unilateral de-escalation to break the reinforcing cycle', 'medium', 'short',  l => /actions|advantage/i.test(l));
        push(5,  'Establish rules: mutual escalation caps or third-party arbitration', 'high',   'medium', _ => true);
        break;
      case 'sts':
        push(7,  'Reduce positive feedback gain: diversify resource allocation away from winner', 'high',   'medium', l => /resource/i.test(l));
        push(5,  'Level playing field: create rules that redistribute advantage periodically', 'high',   'long',   _ => true);
        push(6,  'Improve information flow: make resource concentration visible and measurable', 'medium', 'short',  l => /success/i.test(l));
        break;
      case 'toc':
        push(5,  'Establish shared governance rules: quotas, agreements, mutual restraint', 'high',   'medium', _ => true);
        push(4,  'Enable self-organization: allow actors to collectively set and enforce limits', 'high',   'long',   l => /commons|shared/i.test(l));
        push(6,  'Add information flows: make total usage and depletion rate visible to all actors', 'high', 'short',  l => /total|commons/i.test(l));
        break;
      case 'ftf':
        push(9,  'Shorten delay: make unintended consequences visible faster', 'medium', 'short',  l => /delay|unintended/i.test(l));
        push(6,  'Add feedback: create early warning system for side effects before they compound', 'high', 'medium', l => /unintended|consequence/i.test(l));
        push(3,  'Redefine success metrics to include long-term side effects', 'high',   'long',   l => /problem|fix/i.test(l));
        break;
      case 'gui':
        push(10, 'Invest ahead of demand: build capacity infrastructure before gap widens', 'high',   'medium', l => /capacit|invest/i.test(l));
        push(3,  'Hold performance standards firm: resist lowering goals when capacity lags', 'high',   'medium', l => /standard|perform/i.test(l));
        push(7,  'Moderate growth engine temporarily to allow capacity to catch up', 'medium', 'short',  l => /growth|demand/i.test(l));
        break;
      case 'aa':
        push(2,  'Paradigm shift: make partnership goals explicit and align incentive structures', 'high',   'long',   _ => true);
        push(6,  'Create shared information flows: transparent reporting on mutual impacts', 'high',   'medium', l => /success|action/i.test(l));
        push(5,  'Establish coordination rules: joint decision-making for actions with cross-impact', 'high', 'medium', _ => true);
        break;
      case 'ap':
        push(10, 'Expand capacity infrastructure to absorb new entrants without quality loss', 'high',   'medium', l => /congestion|load/i.test(l));
        push(8,  'Strengthen quality feedback: make congestion impact on attractiveness more responsive', 'medium', 'short', l => /quality|perform/i.test(l));
        push(5,  'Manage entry rules: metered access, waitlists, or capacity-linked growth', 'high',   'medium', l => /entrant|demand/i.test(l));
        break;
      default:
        break;
    }

    return base.map(b => ({ ...b, targetNodeIds: nodes.filter(n => b.targetFilter(n.label)).map(n => n.id) }));
  };

  const generateCLDLeveragePoints = (nodes: ExtendedCLDNode[], links: ExtendedCLDLink[]): LeveragePoint[] => {
    const pts: LeveragePoint[] = [];
    const loops = findLoops(nodes, links);

    loops.filter(l => l.type === 'R' && l.strength >= 4).forEach(loop => {
      pts.push({
        leverageLevel: 7, meadowsName: MEADOWS_LEVELS[7].name,
        intervention: `Slow positive feedback in "${loop.name}" — high gain risks runaway dynamics`,
        targetNodeIds: loop.nodeIds, expectedImpact: 'high', timeHorizon: 'short', source: 'cld-analysis',
      });
    });

    loops.filter(l => l.type === 'B' && l.strength < 3).forEach(loop => {
      pts.push({
        leverageLevel: 8, meadowsName: MEADOWS_LEVELS[8].name,
        intervention: `Strengthen balancing loop "${loop.name}" — weak feedback leaves system uncontrolled`,
        targetNodeIds: loop.nodeIds, expectedImpact: 'medium', timeHorizon: 'medium', source: 'cld-analysis',
      });
    });

    return pts;
  };

  const leveragePoints = useMemo(() => {
    const pts: LeveragePoint[] = [];
    if (selectedArchId) pts.push(...generateArchetypeLeveragePoints(selectedArchId, nodes, links));
    pts.push(...generateCLDLeveragePoints(nodes, links));
    const seen = new Set<string>();
    return pts
      .filter(p => { const k = `${p.leverageLevel}-${p.intervention.slice(0, 40)}`; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => a.leverageLevel - b.leverageLevel);
  }, [nodes, links, selectedArchId]);

  if (leveragePoints.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-6 text-center">
        <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">No leverage points yet</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Apply an archetype or build a CLD to generate Meadows-based interventions</p>
      </div>
    );
  }

  const archPts = leveragePoints.filter(p => p.source === 'archetype');
  const cldPts  = leveragePoints.filter(p => p.source === 'cld-analysis');

  const renderGroup = (pts: LeveragePoint[], title: string, subtitle: string, headerClass: string) => {
    if (pts.length === 0) return null;
    return (
      <div className="space-y-2">
        <div className={cn('rounded-lg px-3 py-2 flex items-center gap-2', headerClass)}>
          <span className="text-[10px] opacity-70 ml-auto">{subtitle}</span>
        </div>
        {pts.map((point, idx) => {
          const meadow     = MEADOWS_LEVELS[point.leverageLevel];
          const MeadowIcon = meadow?.icon || Target;
          const ic         = impactColors[point.expectedImpact];
          const isHighlighted = point.targetNodeIds.length > 0 && point.targetNodeIds.every(id => highlightedNodeIds.includes(id));
          return (
            <div key={idx}
              className={cn(
                'rounded-xl border p-3 transition-all cursor-pointer group',
                isHighlighted ? 'border-violet-400 bg-violet-50 shadow-md' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-violet-300 hover:shadow-sm',
              )}
              onClick={() => onHighlightNodes(isHighlighted ? [] : point.targetNodeIds)}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                    point.leverageLevel <= 3 ? 'bg-violet-100' : point.leverageLevel <= 6 ? 'bg-red-100' : point.leverageLevel <= 9 ? 'bg-amber-100' : 'bg-slate-100 dark:bg-slate-800')}>
                    <MeadowIcon className={cn('w-3.5 h-3.5', meadow?.color || 'text-slate-500 dark:text-slate-400 dark:text-slate-500')} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn('text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded',
                        point.leverageLevel <= 3 ? 'bg-violet-600 text-white' :
                        point.leverageLevel <= 6 ? 'bg-red-500 text-white' :
                        point.leverageLevel <= 9 ? 'bg-amber-500 text-white' : 'bg-slate-400 text-white')}>
                        L{point.leverageLevel}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500">{meadow?.name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold border', ic.badge)}>{point.expectedImpact}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold border', horizonColors[point.timeHorizon])}>{point.timeHorizon}</span>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-100 leading-relaxed mb-1.5">{point.intervention}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{point.targetNodeIds.length} target node{point.targetNodeIds.length !== 1 ? 's' : ''}</span>
                {point.targetNodeIds.length > 0 && (
                  <span className={cn('text-[10px] font-medium', isHighlighted ? 'text-violet-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-violet-500')}>
                    {isHighlighted ? '✓ highlighted' : 'click to highlight'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-3.5 h-3.5 text-violet-600" />
          <span className="text-xs font-semibold text-violet-800">Meadows' Leverage Hierarchy</span>
          <span className="text-[10px] text-violet-500 ml-auto">lower level = more leverage</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-medium">
          {['L1–3\nParadigm', 'L4–6\nInformation', 'L7–9\nFeedback', 'L10–12\nParameters'].map((label, i) => {
            const colors = ['bg-violet-600 text-white', 'bg-red-500 text-white', 'bg-amber-500 text-white', 'bg-slate-400 text-white'];
            return (
              <div key={i} className={cn('flex-1 rounded px-1.5 py-1 text-center leading-tight', colors[i])}>
                {label.split('\n').map((l, j) => <div key={j}>{l}</div>)}
              </div>
            );
          })}
          <div className="ml-1 text-slate-400 dark:text-slate-500 self-center">→ least</div>
        </div>
      </div>

      {renderGroup(archPts, 'Archetype Interventions', 'from selected template', 'bg-violet-100 text-violet-800')}
      {renderGroup(cldPts,  'CLD-Derived Points',      'from diagram analysis',  'bg-blue-100 text-blue-800')}

      <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
        Based on Donella Meadows' <em>Thinking in Systems</em> (2008). Click a card to highlight target nodes in the CLD.
      </p>
    </div>
  );
};

// ─── CLD CANVAS ───────────────────────────────────────────────────────────────

const CLDCanvas: React.FC<{
  nodes: ExtendedCLDNode[];
  links: ExtendedCLDLink[];
  highlightedNodeIds?: string[];
  onUpdateNodes?: (n: ExtendedCLDNode[]) => void;
  onUpdateLinks?: (l: ExtendedCLDLink[]) => void;
}> = ({ nodes, links, highlightedNodeIds = [], onUpdateNodes, onUpdateLinks }) => {
  const svgRef   = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Interaction state ────────────────────────────────────────────────────
  const [editingNodeId,  setEditingNodeId]  = useState<string | null>(null);
  const [hoveredNodeId,  setHoveredNodeId]  = useState<string | null>(null);
  const [hoveredLinkKey, setHoveredLinkKey] = useState<string | null>(null);
  const [showHelp,       setShowHelp]       = useState(false);

  // Arrow-drawing state: dragging from a node to draw a new link
  const [arrowDraw, setArrowDraw] = useState<{
    fromId: string; fromX: number; fromY: number;
    curX: number; curY: number; active: boolean;
  } | null>(null);

  // Node-dragging state
  const [draggingNode, setDraggingNode] = useState<{
    id: string; startMouseX: number; startMouseY: number;
    startNodeX: number; startNodeY: number;
  } | null>(null);

  // Link polarity edit dialog
  const [linkDialog, setLinkDialog] = useState<{
    from: string; to: string; polarity: '+' | '-'; strength: number; isNew: boolean;
  } | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getSVGPoint = (e: React.MouseEvent | MouseEvent): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    };
  };

  const getNodeAt = (x: number, y: number): ExtendedCLDNode | undefined =>
    nodes.find(n => Math.hypot(Number(n.x) - x, Number(n.y) - y) < 6);

  // ── Node management ─────────────────────────────────────────────────────
  const addNode = useCallback(() => {
    // Place new nodes in a spiral to avoid collisions
    const angle = nodes.length * 137.5 * (Math.PI / 180);
    const r     = 12 + nodes.length * 4;
    const n: ExtendedCLDNode = {
      id: `node-${Date.now()}`, label: 'New Variable',
      x: 50 + Math.cos(angle) * Math.min(r, 35),
      y: 50 + Math.sin(angle) * Math.min(r, 30),
      nodeType: 'default',
    };
    onUpdateNodes?.([...nodes, n]);
    setEditingNodeId(n.id);
  }, [nodes, onUpdateNodes]);

  const deleteNode = useCallback((id: string) => {
    onUpdateNodes?.(nodes.filter(n => n.id !== id));
    onUpdateLinks?.(links.filter(l => l.from !== id && l.to !== id));
  }, [nodes, links, onUpdateNodes, onUpdateLinks]);

  const updateLabel = useCallback((id: string, label: string) =>
    onUpdateNodes?.(nodes.map(n => n.id === id ? { ...n, label } : n)), [nodes, onUpdateNodes]);

  // ── Link management ─────────────────────────────────────────────────────
  const confirmLink = useCallback(() => {
    if (!linkDialog?.to || !linkDialog?.from) return;
    const exists = links.find(l => l.from === linkDialog.from && l.to === linkDialog.to);
    if (exists) {
      // Update existing link polarity/strength
      onUpdateLinks?.(links.map(l =>
        l.from === linkDialog.from && l.to === linkDialog.to
          ? { ...l, polarity: linkDialog.polarity, strength: linkDialog.strength } : l));
    } else {
      onUpdateLinks?.([...links, {
        from: linkDialog.from, to: linkDialog.to,
        polarity: linkDialog.polarity, strength: linkDialog.strength,
      }]);
    }
    setLinkDialog(null);
  }, [linkDialog, links, onUpdateLinks]);

  const deleteLink = useCallback((from: string, to: string) =>
    onUpdateLinks?.(links.filter(l => !(l.from === from && l.to === to))),
  [links, onUpdateLinks]);

  const editLink = useCallback((from: string, to: string) => {
    const lnk = links.find(l => l.from === from && l.to === to);
    if (lnk) setLinkDialog({ from, to, polarity: lnk.polarity, strength: lnk.strength || 3, isNew: false });
  }, [links]);

  // ── Arrow path calculation ────────────────────────────────────────────────
  // Uses cubic bezier with perpendicular offset for curved arrows (CLD convention)
  const getArrowPath = useCallback((
    fx: number, fy: number, tx: number, ty: number, offset = 8
  ) => {
    const dx   = tx - fx, dy = ty - fy;
    const len  = Math.sqrt(dx * dx + dy * dy) || 1;
    const cx   = (fx + tx) / 2 - (dy / len) * offset;
    const cy   = (fy + ty) / 2 + (dx / len) * offset;
    // Shorten endpoint so arrow doesn't overlap circle
    const nx = tx - (dx / len) * 5.5;
    const ny = ty - (dy / len) * 5.5;
    return { d: `M ${fx} ${fy} Q ${cx} ${cy} ${nx} ${ny}`, mx: cx, my: cy };
  }, []);

  // ── Mouse event handlers ─────────────────────────────────────────────────

  // Start dragging a node OR start drawing an arrow (shift+drag)
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (editingNodeId) return;
    const pt = getSVGPoint(e);

    if (e.shiftKey || e.altKey) {
      // Shift/Alt+drag = draw arrow FROM this node
      setArrowDraw({ fromId: nodeId, fromX: pt.x, fromY: pt.y, curX: pt.x, curY: pt.y, active: true });
    } else {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      setDraggingNode({
        id: nodeId,
        startMouseX: pt.x, startMouseY: pt.y,
        startNodeX: Number(node.x), startNodeY: Number(node.y),
      });
    }
  }, [editingNodeId, nodes]);

  const handleSVGMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const pt = getSVGPoint(e);

    if (arrowDraw?.active) {
      setArrowDraw(prev => prev ? { ...prev, curX: pt.x, curY: pt.y } : null);
    }

    if (draggingNode) {
      const dx = pt.x - draggingNode.startMouseX;
      const dy = pt.y - draggingNode.startMouseY;
      onUpdateNodes?.(nodes.map(n =>
        n.id === draggingNode.id
          ? { ...n,
              x: Math.max(5, Math.min(95, draggingNode.startNodeX + dx)),
              y: Math.max(5, Math.min(90, draggingNode.startNodeY + dy)) }
          : n));
    }
  }, [arrowDraw, draggingNode, nodes, onUpdateNodes]);

  const handleSVGMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (arrowDraw?.active) {
      const pt = getSVGPoint(e);
      const targetNode = getNodeAt(pt.x, pt.y);
      if (targetNode && targetNode.id !== arrowDraw.fromId) {
        // Check if link already exists
        const existing = links.find(l => l.from === arrowDraw.fromId && l.to === targetNode.id);
        setLinkDialog({
          from: arrowDraw.fromId, to: targetNode.id,
          polarity: existing?.polarity || '+',
          strength: existing?.strength || 3,
          isNew: !existing,
        });
      }
      setArrowDraw(null);
    }
    setDraggingNode(null);
  }, [arrowDraw, links, getNodeAt]);

  // ── Render helpers ───────────────────────────────────────────────────────
  const isEmpty = nodes.length === 0;

  const nodeColorClass = (node: ExtendedCLDNode) => {
    if (node.category) return categoryConfig[node.category]?.bgColor || 'bg-slate-500';
    return 'bg-gradient-to-br from-slate-500 to-slate-700';
  };

  // Loop labels derived from findLoops for display
  const detectedLoops = useMemo(() => findLoops(nodes, links), [nodes, links]);

  return (
    <div
      ref={canvasRef}
      className="relative rounded-xl cld-canvas-bg overflow-hidden"
      style={{ minHeight: 500, userSelect: draggingNode ? 'none' : 'auto' }}
    >
      {/* Dot-grid background */}
      <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* ── SVG layer (links + arrow-draw preview) ─────────────────────── */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 2, cursor: arrowDraw?.active ? 'crosshair' : draggingNode ? 'grabbing' : 'default' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        onMouseMove={handleSVGMouseMove}
        onMouseUp={handleSVGMouseUp}
        onMouseLeave={handleSVGMouseUp}
      >
        <defs>
          {/* Arrow markers — four variants: pos/neg × normal/highlighted */}
          {[
            { id: 'arrow-pos',      fill: '#059669' },
            { id: 'arrow-neg',      fill: '#dc2626' },
            { id: 'arrow-pos-hl',   fill: '#7c3aed' },
            { id: 'arrow-neg-hl',   fill: '#db2777' },
            { id: 'arrow-preview',  fill: '#6366f1' },
          ].map(({ id, fill }) => (
            <marker key={id} id={id} viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={fill} />
            </marker>
          ))}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Render links */}
        {links.map((link) => {
          const f = nodes.find(n => n.id === link.from);
          const t = nodes.find(n => n.id === link.to);
          if (!f || !t) return null;
          const key   = `${link.from}-${link.to}`;
          const isHL  = highlightedNodeIds.includes(link.from) && highlightedNodeIds.includes(link.to);
          const isHov = hoveredLinkKey === key;
          const color = isHL ? (link.polarity === '+' ? '#7c3aed' : '#db2777') :
                        link.polarity === '+' ? '#059669' : '#dc2626';
          const markerId = isHL ? (link.polarity === '+' ? 'arrow-pos-hl' : 'arrow-neg-hl') :
                                  (link.polarity === '+' ? 'arrow-pos'    : 'arrow-neg');

          const { d, mx, my } = getArrowPath(Number(f.x), Number(f.y), Number(t.x), Number(t.y));

          return (
            <g key={key}
              onMouseEnter={() => setHoveredLinkKey(key)}
              onMouseLeave={() => setHoveredLinkKey(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Invisible wider hit zone */}
              <path d={d} stroke="transparent" strokeWidth="4" fill="none"
                vectorEffect="non-scaling-stroke" />
              {/* Visible link */}
              <path d={d} stroke={color} strokeWidth={isHov || isHL ? "1.2" : "0.7"} fill="none"
                strokeLinecap="round" vectorEffect="non-scaling-stroke"
                markerEnd={`url(#${markerId})`}
                style={{ filter: isHL ? 'url(#glow)' : 'none', opacity: isHov ? 1 : 0.85, transition: 'all 0.15s' }}
              />
              {/* Polarity badge on midpoint */}
              <g onClick={() => editLink(link.from, link.to)}>
                <circle cx={`${mx}`} cy={`${my}`} r="3.2" fill={color} vectorEffect="non-scaling-stroke"
                  style={{ transition: 'r 0.15s' }} />
                <text x={`${mx}`} y={`${my}`} textAnchor="middle" dominantBaseline="central"
                  fill="white" fontSize="3.5" fontWeight="bold" style={{ userSelect: 'none', pointerEvents: 'none' }}>
                  {link.polarity}
                </text>
              </g>
              {/* Delay indicator */}
              {(link as ExtendedCLDLink).delay ? (
                <g transform={`translate(${mx + 2}, ${my - 2})`}>
                  <circle r="2" fill="#f59e0b" vectorEffect="non-scaling-stroke" />
                  <text textAnchor="middle" dominantBaseline="central" fill="white" fontSize="2.5"
                    style={{ userSelect: 'none', pointerEvents: 'none' }}>‖</text>
                </g>
              ) : null}
              {/* Delete hit area on hover */}
              {isHov && (
                <g transform={`translate(${mx - 6}, ${my - 4})`}
                  onClick={(e) => { e.stopPropagation(); deleteLink(link.from, link.to); }}
                  style={{ cursor: 'pointer' }}>
                  <circle cx="4" cy="4" r="3.5" fill="#ef4444" vectorEffect="non-scaling-stroke" />
                  <text x="4" y="4" textAnchor="middle" dominantBaseline="central"
                    fill="white" fontSize="4" style={{ userSelect: 'none' }}>×</text>
                </g>
              )}
            </g>
          );
        })}

        {/* Arrow-draw preview line */}
        {arrowDraw?.active && (() => {
          const f = nodes.find(n => n.id === arrowDraw.fromId);
          if (!f) return null;
          const { d } = getArrowPath(Number(f.x), Number(f.y), arrowDraw.curX, arrowDraw.curY, 4);
          return (
            <path d={d} stroke="#6366f1" strokeWidth="0.8" strokeDasharray="2 1"
              fill="none" markerEnd="url(#arrow-preview)"
              vectorEffect="non-scaling-stroke" style={{ opacity: 0.8 }} />
          );
        })()}

        {/* Loop labels (R1, B1, etc.) — render near detected loops */}
        {detectedLoops.slice(0, 4).map((loop, idx) => {
          const loopNodes = loop.nodeIds.map(id => nodes.find(n => n.id === id)).filter(Boolean) as ExtendedCLDNode[];
          if (loopNodes.length === 0) return null;
          const cx = loopNodes.reduce((s, n) => s + Number(n.x), 0) / loopNodes.length;
          const cy = loopNodes.reduce((s, n) => s + Number(n.y), 0) / loopNodes.length;
          const fill = loop.type === 'R' ? '#059669' : '#d97706';
          return (
            <g key={`loop-${idx}`}>
              <circle cx={cx} cy={cy} r="3" fill={fill} opacity="0.15" vectorEffect="non-scaling-stroke" />
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                fill={fill} fontSize="2.8" fontWeight="bold"
                style={{ userSelect: 'none', pointerEvents: 'none' }}>
                {loop.type}{idx + 1}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ── Node layer (HTML absolutely positioned) ─────────────────────── */}
      {nodes.map((node, idx) => {
        const isHL   = highlightedNodeIds.includes(node.id);
        const isHov  = hoveredNodeId === node.id;
        const isEdit = editingNodeId === node.id;
        const isDrg  = draggingNode?.id === node.id;
        const isArrowSrc = arrowDraw?.fromId === node.id;

        return (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{
              left: `${node.x}%`, top: `${node.y}%`, zIndex: isDrg ? 20 : 10,
              animation: isDrg ? 'none' : `cldNodeIn 0.35s ease-out ${Math.min(idx * 0.04, 0.4)}s both`,
            }}
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
          >
            {/* Main node pill */}
            <div
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onClick={() => !draggingNode && setEditingNodeId(node.id)}
              title={
                isEdit ? '' :
                'Click to edit label • Shift+drag to draw arrow • Drag to move'
              }
              className={cn(
                'min-w-[72px] max-w-[120px] rounded-full px-3 py-2 shadow-md border-2',
                'flex items-center justify-center text-white text-[11px] font-semibold text-center',
                'transition-all duration-150 select-none',
                isDrg ? 'cursor-grabbing scale-105 shadow-xl' : 'cursor-grab hover:scale-105 hover:shadow-lg',
                isHL
                  ? 'border-violet-400 ring-4 ring-violet-300/50 ring-offset-1 scale-110'
                  : isArrowSrc
                  ? 'border-indigo-400 ring-2 ring-indigo-300'
                  : 'border-white/70',
                node.category
                  ? categoryConfig[node.category]?.bgColor
                  : 'bg-gradient-to-br from-slate-500 to-slate-700',
              )}
            >
              {isEdit ? (
                <input
                  autoFocus
                  value={node.label}
                  onChange={e => updateLabel(node.id, e.target.value)}
                  onBlur={() => setEditingNodeId(null)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingNodeId(null); }}
                  className="bg-white text-slate-900 rounded px-1 py-0.5 text-[11px] text-center w-full outline-none ring-2 ring-cyan-400"
                  onClick={e => e.stopPropagation()}
                  style={{ minWidth: 60, maxWidth: 100 }}
                />
              ) : (
                <span className="leading-tight break-words hyphens-auto">{node.label}</span>
              )}
            </div>

            {/* Leverage badge */}
            {isHL && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
                <span className="text-[9px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded-full shadow">⚡ leverage</span>
              </div>
            )}

            {/* Hover action bar — draw arrow, delete */}
            {isHov && !isEdit && !isDrg && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex gap-1 items-center animate-in fade-in duration-100">
                <button
                  onMouseDown={e => {
                    e.stopPropagation();
                    const pt = getSVGPoint(e);
                    setArrowDraw({ fromId: node.id, fromX: Number(node.x), fromY: Number(node.y), curX: Number(node.x), curY: Number(node.y), active: true });
                  }}
                  className="w-6 h-6 bg-indigo-500 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-[10px] font-bold"
                  title="Draw arrow (or Shift+drag)"
                >→</button>
                <button
                  onClick={e => { e.stopPropagation(); deleteNode(node.id); }}
                  className="w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  title="Delete node"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none" style={{ zIndex: 1 }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center mb-3 animate-pulse">
            <GitBranch className="w-8 h-8 text-blue-500" />
          </div>
          <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Map your causal system</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-2">
            Click <strong className="text-blue-600">Build from SWOT</strong> to auto-generate, apply an archetype, or <strong className="text-blue-600">Add Node</strong> to start from scratch.
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs">
            <span className="font-semibold">Shift+drag</span> a node to draw an arrow. <span className="font-semibold">Drag</span> to reposition. Click the <span className="font-semibold text-emerald-600">+</span> / <span className="font-semibold text-red-600">−</span> badge to edit polarity.
          </p>
        </div>
      )}

      {/* ── Toolbar: top-left ────────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 flex gap-2 flex-wrap" style={{ zIndex: 15 }}>
        <button onClick={() => setShowHelp(v => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all">
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          {showHelp ? 'Hide guide' : 'How to use'}
        </button>
        {detectedLoops.length > 0 && (
          <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
            <GitBranch className="w-3 h-3" />
            {detectedLoops.filter(l => l.type === 'R').length}R · {detectedLoops.filter(l => l.type === 'B').length}B loops
          </span>
        )}
      </div>

      {/* ── Help panel ──────────────────────────────────────────────────── */}
      {showHelp && (
        <div className="absolute top-14 left-3 right-3 md:right-auto md:max-w-[340px] bg-white/97 dark:bg-slate-800/97 backdrop-blur rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-20 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-500" /> CLD Builder Guide
            </h4>
            <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">Adding nodes</p>
                <p>Click <strong>"Add Node"</strong> (bottom-right) or <strong>"Build from SWOT"</strong> to auto-populate.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">Drawing arrows</p>
                <p><strong>Shift+drag</strong> from a node, or hover → click the <span className="text-indigo-500 font-bold">→</span> button.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">Moving nodes</p>
                <p>Just <strong>drag</strong> any node to reposition it freely on the canvas.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">Editing arrows</p>
                <p>Click the <span className="text-emerald-600 font-bold">+</span>/<span className="text-red-500 font-bold">−</span> badge to toggle polarity or change strength. Hover → <span className="text-red-500">×</span> to delete.</p>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 border border-blue-100 dark:border-blue-800">
              <p className="font-semibold text-blue-700 dark:text-blue-300 mb-0.5">CLD conventions</p>
              <p><span className="text-emerald-600 font-bold">+ (reinforcing)</span> — A↑ causes B↑. <span className="text-red-500 font-bold">− (balancing)</span> — A↑ causes B↓. Even number of (−) in a loop = <strong>Reinforcing loop (R)</strong>. Odd = <strong>Balancing loop (B)</strong>.</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 rounded inline-block"/><span className="w-0 h-0 border-l-2 border-r-0 border-t-2 border-b-2 border-transparent border-l-emerald-500 inline-block -ml-0.5 mr-1"/>Reinforcing (+)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 rounded inline-block"/><span className="w-0 h-0 border-l-2 border-r-0 border-t-2 border-b-2 border-transparent border-l-red-500 inline-block -ml-0.5 mr-1"/>Balancing (−)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/>Delay</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Legend: bottom-left ──────────────────────────────────────────── */}
      <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg px-3 py-2 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap gap-3 shadow-md border border-slate-200 dark:border-slate-700" style={{ zIndex: 15 }}>
        <span className="flex items-center gap-1.5 font-medium"><span className="w-3 h-0.5 bg-emerald-500 rounded" />Reinforcing (+)</span>
        <span className="flex items-center gap-1.5 font-medium"><span className="w-3 h-0.5 bg-red-500 rounded" />Balancing (−)</span>
        {highlightedNodeIds.length > 0 && (
          <span className="flex items-center gap-1.5 font-medium text-violet-600 dark:text-violet-400">
            <Circle className="w-2.5 h-2.5 fill-violet-500 text-violet-500" />Leverage target
          </span>
        )}
        {arrowDraw?.active && (
          <span className="flex items-center gap-1.5 font-medium text-indigo-600 dark:text-indigo-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />Drawing arrow…
          </span>
        )}
      </div>

      {/* ── Add node button: bottom-right ───────────────────────────────── */}
      <button
        onClick={addNode}
        className="absolute bottom-3 right-3 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        style={{ zIndex: 15 }}
      >
        <Plus className="w-3.5 h-3.5" /> Add Node
      </button>

      {/* ── Link dialog ──────────────────────────────────────────────────── */}
      {linkDialog && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 dark:bg-slate-900/50 backdrop-blur-sm" style={{ zIndex: 30 }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-5 border border-slate-200 dark:border-slate-700 w-full max-w-xs mx-3 animate-in zoom-in-95 duration-200">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2 text-sm">
              <LinkIcon className="w-4 h-4 text-blue-500" />
              {linkDialog.isNew ? 'Create Relationship' : 'Edit Relationship'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
              <strong>{nodes.find(n => n.id === linkDialog.from)?.label}</strong>
              {' → '}
              <strong>{nodes.find(n => n.id === linkDialog.to)?.label}</strong>
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                  Polarity — how does the cause affect the effect?
                </label>
                <div className="flex gap-2">
                  {(['+', '-'] as const).map(p => (
                    <button key={p}
                      onClick={() => setLinkDialog({ ...linkDialog, polarity: p })}
                      className={cn('flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all',
                        linkDialog.polarity === p
                          ? p === '+' ? 'bg-emerald-500 text-white shadow-md' : 'bg-red-500 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      )}>
                      {p === '+' ? '+ Reinforcing (same direction)' : '− Balancing (opposite direction)'}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  {linkDialog.polarity === '+'
                    ? 'When cause increases, effect also increases (and vice versa).'
                    : 'When cause increases, effect decreases (and vice versa).'}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                  Link Strength (1 = weak, 5 = strong)
                </label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(v => (
                    <button key={v}
                      onClick={() => setLinkDialog({ ...linkDialog, strength: v })}
                      className={cn('flex-1 py-1.5 rounded text-xs font-bold transition-all border',
                        v <= linkDialog.strength
                          ? 'bg-indigo-500 text-white border-indigo-600'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600'
                      )}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={confirmLink}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg transition-all">
                  {linkDialog.isNew ? 'Add Arrow' : 'Update'}
                </button>
                {!linkDialog.isNew && (
                  <button onClick={() => { deleteLink(linkDialog.from, linkDialog.to); setLinkDialog(null); }}
                    className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium transition-colors">
                    Delete
                  </button>
                )}
                <button onClick={() => setLinkDialog(null)}
                  className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes cldNodeIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
};

const SnapshotsPanel: React.FC<{
  snapshots: CLDSnapshot[];
  activeSnapshotId: string | undefined;
  onSaveSnapshot: (name: string) => void;
  onLoadSnapshot: (id: string) => void;
  onDeleteSnapshot: (id: string) => void;
  renameSnapshot?: (id: string, newName: string) => void;
}> = ({ snapshots, activeSnapshotId, onSaveSnapshot, onLoadSnapshot, onDeleteSnapshot, renameSnapshot }) => {
  const [showSaveDialog,   setShowSaveDialog]   = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState<string | null>(null);
  const [newSnapshotName,  setNewSnapshotName]  = useState('');

  const handleSave = useCallback(() => {
    if (newSnapshotName.trim()) {
      onSaveSnapshot(newSnapshotName.trim());
      setNewSnapshotName('');
      setShowSaveDialog(false);
    }
  }, [newSnapshotName, onSaveSnapshot]);

  const handleRename = useCallback(() => {
    if (showRenameDialog && newSnapshotName.trim()) {
      renameSnapshot?.(showRenameDialog, newSnapshotName.trim());
      setNewSnapshotName('');
      setShowRenameDialog(null);
    }
  }, [showRenameDialog, newSnapshotName, renameSnapshot]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={() => setShowSaveDialog(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors shadow-sm">
          <Save className="w-3.5 h-3.5" /> Save Snapshot
        </button>

        <div className="relative">
          <select value="" onChange={(e) => { if (e.target.value) { onLoadSnapshot(e.target.value); e.target.value = ''; } }}
            className="appearance-none flex items-center gap-1.5 px-3 pr-8 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-xs font-medium transition-colors cursor-pointer border border-slate-200 dark:border-slate-700">
            <option value="">Load Snapshot...</option>
            {snapshots.map(snap => (
              <option key={snap.id} value={snap.id}>
                {snap.id === activeSnapshotId ? '• ' : ''}{snap.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
        </div>
      </div>

      {snapshots.length > 0 && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 p-2 max-h-32 overflow-y-auto">
          {snapshots.map(snap => (
            <div key={snap.id} className="flex items-center justify-between px-2 py-1 text-xs text-slate-600 dark:text-slate-400 dark:text-slate-500">
              <span className={cn('truncate flex-1', snap.id === activeSnapshotId && 'text-blue-600 font-semibold')}
                title={snap.id === activeSnapshotId ? 'Active' : ''}>
                {snap.id === activeSnapshotId ? '✓ ' : ''}{snap.label}
              </span>
              {snap.id !== activeSnapshotId && (
                <div className="flex items-center gap-1">
                  <button onClick={() => { setShowRenameDialog(snap.id); setNewSnapshotName(snap.label); }}
                    className="text-slate-400 dark:text-slate-500 hover:text-blue-500" title="Rename">
                    <FileText className="w-3 h-3" />
                  </button>
                  <button onClick={() => onDeleteSnapshot(snap.id)}
                    className="text-slate-400 dark:text-slate-500 hover:text-red-500" title="Delete">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showSaveDialog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-2xl p-5 border border-slate-200 dark:border-slate-700 w-full max-w-sm mx-3 animate-in zoom-in-95 duration-200">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><Save className="w-5 h-5 text-blue-500" /> Save CLD Snapshot</h3>
            <input autoFocus value={newSnapshotName} onChange={e => setNewSnapshotName(e.target.value)}
              placeholder="Enter snapshot name..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setShowSaveDialog(false); }} />
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={!newSnapshotName.trim()} className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold disabled:opacity-50">Save</button>
              <button onClick={() => setShowSaveDialog(false)} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showRenameDialog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-2xl p-5 border border-slate-200 dark:border-slate-700 w-full max-w-sm mx-3 animate-in zoom-in-95 duration-200">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500" /> Rename Snapshot</h3>
            <input autoFocus value={newSnapshotName} onChange={e => setNewSnapshotName(e.target.value)}
              placeholder="Enter new name..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setShowRenameDialog(null); }} />
            <div className="flex gap-2">
              <button onClick={handleRename} disabled={!newSnapshotName.trim()} className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold disabled:opacity-50">Rename</button>
              <button onClick={() => setShowRenameDialog(null)} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── AI ANALYSIS SIDE PANEL ────────────────────────────────────────────────────

interface AnalysisSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: ExtendedCLDNode[];
  links: ExtendedCLDLink[];
  selectedStrategies: string[];
  onExecute: (nodes: ExtendedCLDNode[], links: ExtendedCLDLink[], strategies: string[]) => Promise<AIAnalysisResponse>;
}

const AnalysisSidePanel: React.FC<AnalysisSidePanelProps> = ({
  isOpen, onClose, nodes, links, selectedStrategies, onExecute,
}) => {
  const [analysisData, setAnalysisData] = useState<AIAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) { setAnalysisData(null); setLoading(false); setError(null); }
  }, [isOpen]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await onExecute(nodes, links, selectedStrategies);
      setAnalysisData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-white dark:bg-slate-800/60 shadow-2xl border-l border-slate-200 dark:border-slate-700 z-50 flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">AI Strategy Assistant</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500"><X className="w-5 h-5" /></button>
      </div>

      {!analysisData && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Brain className="w-12 h-12 text-slate-300 mb-3" />
          <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Ready to Analyze</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-4">Build your CLD, select strategies, then click "Analyze Loops"</p>
          <button onClick={handleAnalyze} disabled={nodes.length < 2} className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50">
            Analyze Loops
          </button>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">Analyzing your strategy model...</p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-3" />
          <p className="text-sm text-red-600 font-medium mb-2">Analysis Failed</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-4">{error}</p>
          <button onClick={handleAnalyze} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">Try Again</button>
        </div>
      )}

      {analysisData && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <section>
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-500" /> Detected Loops ({analysisData.detected_loops.length})
            </h4>
            <div className="space-y-2">
              {analysisData.detected_loops.map((loop, idx) => (
                <div key={idx} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${loop.type === 'R' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {loop.type}
                    </span>
                    <span className="text-xs text-slate-700 dark:text-slate-200 truncate flex-1">{loop.name}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    <span>Strength: {loop.strength}/5</span>
                    <span>{loop.nodeIds.length} nodes</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-500" /> Dominant Archetypes ({analysisData.dominant_archetypes.length})
            </h4>
            <div className="space-y-2">
              {analysisData.dominant_archetypes.map((arch, idx) => (
                <div key={idx} className="rounded-lg border border-violet-200 bg-violet-50 p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-violet-800">{arch.archetypeName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-200 text-violet-700">{Math.round(arch.confidence * 100)}%</span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 dark:text-slate-500 mt-1">Matched nodes: {arch.matchedNodes.length}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-red-500" /> Ranked Leverage Points ({analysisData.ranked_leverage_points.length})
            </h4>
            <div className="space-y-2">
              {analysisData.ranked_leverage_points.slice(0, 5).map((point, idx) => (
                <div key={idx} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-500 text-white">L{point.leverageLevel}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500">{MEADOWS_LEVELS[point.leverageLevel]?.name || ''}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{point.intervention}</p>
                </div>
              ))}
            </div>
          </section>

          {analysisData.recommendations && analysisData.recommendations.length > 0 && (
            <section>
              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> AI Recommendations
              </h4>
              <ul className="space-y-2">
                {analysisData.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 dark:text-slate-500 flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const SystemsThinking: React.FC<SystemsThinkingProps> = ({ plan, onUpdateItem, planId }) => {
  const {
    saveCLDSnapshot,
    loadCLDSnapshot,
    renameCLDSnapshot,
    deleteCLDSnapshot,
    toggleArchetype,
  } = useStrategicPlan();

  const [viewMode,           setViewMode]           = useState<'matrix' | 'impact' | 'cld'>('matrix');
  const [showGuide,          setShowGuide]          = useState(false);
  const [selectedArchId,     setSelectedArchId]     = useState<string | null>(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [cldSubView,         setCldSubView]         = useState<'diagram' | 'leverage'>('diagram');
  const [analysisPanelOpen,  setAnalysisPanelOpen]  = useState(false);

  const [localCldNodes, setLocalCldNodes] = useState<ExtendedCLDNode[]>([]);
  const [localCldLinks, setLocalCldLinks] = useState<ExtendedCLDLink[]>([]);

  useEffect(() => {
    if (plan.cldNodes && plan.cldNodes.length > 0) setLocalCldNodes(plan.cldNodes);
    if (plan.cldLinks && plan.cldLinks.length > 0) setLocalCldLinks(plan.cldLinks);
  }, [plan.cldNodes, plan.cldLinks, planId]);

  const buildFromSWOT = useCallback(() => {
    const allItems = plan.swotItems || [];
    const colCount = Math.min(3, allItems.length);
    const nodes = allItems.map((item, i) => ({
      id: `swot-${item.id}`,
      label: item.description.length > 28 ? item.description.slice(0, 28) + '…' : item.description,
      x: 15 + (i % colCount) * (70 / Math.max(colCount - 1, 1)),
      y: 15 + Math.floor(i / colCount) * 30,
      category: item.category,
      nodeType: 'default' as const,
    }));

    const links: ExtendedCLDLink[] = [];
    const s = nodes.filter(n => n.category === 'strength');
    const w = nodes.filter(n => n.category === 'weakness');
    const o = nodes.filter(n => n.category === 'opportunity');
    const t = nodes.filter(n => n.category === 'threat');
    s.slice(0, 2).forEach((sn, i) => { const opp = o[i % Math.max(o.length, 1)]; if (opp) links.push({ from: sn.id, to: opp.id, polarity: '+', strength: 3 }); });
    w.slice(0, 2).forEach((wn, i) => { const th  = t[i % Math.max(t.length, 1)];  if (th)  links.push({ from: wn.id, to: th.id,  polarity: '+', strength: 3 }); });
    t.slice(0, 1).forEach(tn => { const sn = s[0]; if (sn) links.push({ from: tn.id, to: sn.id, polarity: '-', strength: 2 }); });
    o.slice(0, 1).forEach(on => { const wn = w[0]; if (wn) links.push({ from: on.id, to: wn.id, polarity: '-', strength: 2 }); });

    setLocalCldNodes(nodes);
    setLocalCldLinks(links);
    setViewMode('cld');
  }, [plan.swotItems]);

  const applyArchetype = useCallback((archId: string) => {
    const arch = systemArchetypes.find(a => a.id === archId);
    if (!arch) return;
    const nodes: ExtendedCLDNode[] = arch.nodeLabels.map((label, i) => ({
      id: `arch-${arch.id}-${i}`, label,
      x: 15 + (i % 3) * 35, y: 20 + Math.floor(i / 3) * 35, nodeType: 'default' as const,
    }));
    const nodeMap = Object.fromEntries(arch.nodeLabels.map((l, i) => [l, nodes[i].id]));
    const links: ExtendedCLDLink[] = arch.loops
      .filter(l => nodeMap[l.from] && nodeMap[l.to])
      .map(l => ({ from: nodeMap[l.from], to: nodeMap[l.to], polarity: l.polarity, strength: 3 }));
    setLocalCldNodes(nodes);
    setLocalCldLinks(links);
    setSelectedArchId(archId);
    setHighlightedNodeIds([]);
  }, []);

  // Leverage point generators (mirrored for leverageCount badge)
  const generateArchetypeLeveragePoints = (archetypeId: string, nodes: ExtendedCLDNode[], links: ExtendedCLDLink[]): LeveragePoint[] => {
    const base: (Omit<LeveragePoint, 'targetNodeIds'> & { targetFilter: (label: string) => boolean })[] = [];
    const push = (leverageLevel: number, intervention: string, expectedImpact: 'high' | 'medium' | 'low', timeHorizon: 'short' | 'medium' | 'long', targetFilter: (label: string) => boolean) =>
      base.push({ archetypeId, leverageLevel, meadowsName: MEADOWS_LEVELS[leverageLevel]?.name || '', intervention, expectedImpact, timeHorizon, source: 'archetype', targetFilter });

    switch (archetypeId) {
      case 'ltg': push(10,'Remove structural constraint: invest in capacity expansion before growth stalls','high','medium',l=>/limit|constrain|capacit/i.test(l)); push(7,'Strengthen growth engine: accelerate virtuous cycle while constraint is still loose','high','short',l=>/growing|growth|perform/i.test(l)); push(8,'Increase balancing feedback sensitivity to identify bottlenecks earlier','medium','medium',l=>/constrain|limit/i.test(l)); break;
      case 'stb': push(5,'Change incentive rules: make symptomatic fixes more costly; reward root-cause solutions','high','medium',l=>/symptom|fix/i.test(l)); push(8,'Strengthen B2 loop: resource fundamental solutions, reduce symptomatic fix dependency','high','long',l=>/fundamental/i.test(l)); push(6,'Improve information flow: make root causes more visible to decision-makers','medium','short',l=>/problem|symptom/i.test(l)); break;
      case 'dg':  push(3,'Hold goal firm: make goal-setting process independent of performance pressure','high','medium',l=>/goal|target/i.test(l)); push(8,'Strengthen corrective action loop: reduce response time to performance gaps','medium','short',l=>/corrective|action/i.test(l)); push(6,'Improve performance visibility: make gap transparent and undeniable','high','short',l=>/gap|perform/i.test(l)); break;
      case 'esc': push(2,'Paradigm shift: reframe from zero-sum to mutual-gain; seek win-win agreements','high','long',_=>true); push(7,'Reduce gain: unilateral de-escalation to break the reinforcing cycle','medium','short',l=>/actions|advantage/i.test(l)); push(5,'Establish rules: mutual escalation caps or third-party arbitration','high','medium',_=>true); break;
      case 'sts': push(7,'Reduce positive feedback gain: diversify resource allocation away from winner','high','medium',l=>/resource/i.test(l)); push(5,'Level playing field: create rules that redistribute advantage periodically','high','long',_=>true); push(6,'Improve information flow: make resource concentration visible and measurable','medium','short',l=>/success/i.test(l)); break;
      case 'toc': push(5,'Establish shared governance rules: quotas, agreements, mutual restraint','high','medium',_=>true); push(4,'Enable self-organization: allow actors to collectively set and enforce limits','high','long',l=>/commons|shared/i.test(l)); push(6,'Add information flows: make total usage and depletion rate visible to all actors','high','short',l=>/total|commons/i.test(l)); break;
      case 'ftf': push(9,'Shorten delay: make unintended consequences visible faster','medium','short',l=>/delay|unintended/i.test(l)); push(6,'Add feedback: create early warning system for side effects before they compound','high','medium',l=>/unintended|consequence/i.test(l)); push(3,'Redefine success metrics to include long-term side effects','high','long',l=>/problem|fix/i.test(l)); break;
      case 'gui': push(10,'Invest ahead of demand: build capacity infrastructure before gap widens','high','medium',l=>/capacit|invest/i.test(l)); push(3,'Hold performance standards firm: resist lowering goals when capacity lags','high','medium',l=>/standard|perform/i.test(l)); push(7,'Moderate growth engine temporarily to allow capacity to catch up','medium','short',l=>/growth|demand/i.test(l)); break;
      case 'aa':  push(2,'Paradigm shift: make partnership goals explicit and align incentive structures','high','long',_=>true); push(6,'Create shared information flows: transparent reporting on mutual impacts','high','medium',l=>/success|action/i.test(l)); push(5,'Establish coordination rules: joint decision-making for actions with cross-impact','high','medium',_=>true); break;
      case 'ap':  push(10,'Expand capacity infrastructure to absorb new entrants without quality loss','high','medium',l=>/congestion|load/i.test(l)); push(8,'Strengthen quality feedback: make congestion impact on attractiveness more responsive','medium','short',l=>/quality|perform/i.test(l)); push(5,'Manage entry rules: metered access, waitlists, or capacity-linked growth','high','medium',l=>/entrant|demand/i.test(l)); break;
      default: break;
    }
    return base.map(b => ({ ...b, targetNodeIds: nodes.filter(n => b.targetFilter(n.label)).map(n => n.id) }));
  };

  const generateCLDLeveragePoints = (nodes: ExtendedCLDNode[], links: ExtendedCLDLink[]): LeveragePoint[] => {
    const pts: LeveragePoint[] = [];
    const loops = findLoops(nodes, links);
    loops.filter(l => l.type === 'R' && l.strength >= 4).forEach(loop => {
      pts.push({ leverageLevel: 7, meadowsName: MEADOWS_LEVELS[7].name, intervention: `Slow positive feedback in "${loop.name}" — high gain risks runaway dynamics`, targetNodeIds: loop.nodeIds, expectedImpact: 'high', timeHorizon: 'short', source: 'cld-analysis' });
    });
    loops.filter(l => l.type === 'B' && l.strength < 3).forEach(loop => {
      pts.push({ leverageLevel: 8, meadowsName: MEADOWS_LEVELS[8].name, intervention: `Strengthen balancing loop "${loop.name}" — weak feedback leaves system uncontrolled`, targetNodeIds: loop.nodeIds, expectedImpact: 'medium', timeHorizon: 'medium', source: 'cld-analysis' });
    });
    const isolated = nodes.filter(n => !links.some(l => l.to === n.id) && !links.some(l => l.from === n.id));
    if (isolated.length > 0) pts.push({ leverageLevel: 6, meadowsName: MEADOWS_LEVELS[6].name, intervention: `Add information flows to ${isolated.length} unconnected variable(s)`, targetNodeIds: isolated.map(n => n.id), expectedImpact: 'high', timeHorizon: 'short', source: 'cld-analysis' });
    const delayedLinks = links.filter(l => l.delay && l.delay > 0);
    if (delayedLinks.length > 0) {
      const delayedNodeIds = [...new Set(delayedLinks.flatMap(l => [l.from, l.to]))];
      pts.push({ leverageLevel: 9, meadowsName: MEADOWS_LEVELS[9].name, intervention: `Reduce ${delayedLinks.length} link delay(s)`, targetNodeIds: delayedNodeIds, expectedImpact: 'medium', timeHorizon: 'medium', source: 'cld-analysis' });
    }
    return pts;
  };

  const handleUpdateNodes = useCallback((newNodes: ExtendedCLDNode[]) => setLocalCldNodes(newNodes), []);
  const handleUpdateLinks = useCallback((newLinks: ExtendedCLDLink[]) => setLocalCldLinks(newLinks), []);

  const executeAIAnalysis = useCallback(async (
    nodes: ExtendedCLDNode[], links: ExtendedCLDLink[], strategies: string[],
  ): Promise<AIAnalysisResponse> => {
    try {
      const databaseFunctions = (window as any).database?.functions;
      if (!databaseFunctions) throw new Error('Database functions not available. Ensure database integration is configured.');
      const response = await databaseFunctions.invoke('ai-strategy-assistant', {
        body: { action: 'analyze_loops', data: { nodes, links, selectedStrategies: strategies } },
      });
      return response as AIAnalysisResponse;
    } catch (err) {
      console.error('AI analysis error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to analyze loops');
    }
  }, []);

  const swot = useMemo(() => ({
    strengths:     plan.swotItems?.filter(i => i.category === 'strength')     || [],
    weaknesses:    plan.swotItems?.filter(i => i.category === 'weakness')     || [],
    opportunities: plan.swotItems?.filter(i => i.category === 'opportunity')  || [],
    threats:       plan.swotItems?.filter(i => i.category === 'threat')       || [],
  }), [plan.swotItems]);

  const allItems = plan.swotItems || [];

  const sortedImpact = useMemo(() =>
    allItems.map(item => ({ ...item, total: (item.impactScore || 3) * (item.likelihoodScore || 3) }))
      .sort((a, b) => b.total - a.total),
  [allItems]);

  const recommendArchetypes = useMemo(() => {
    const s = allItems.filter(i => i.category === 'strength');
    const w = allItems.filter(i => i.category === 'weakness');
    const o = allItems.filter(i => i.category === 'opportunity');
    const t = allItems.filter(i => i.category === 'threat');
    const recs: Array<{ archetypeId: string; reason: string; confidence: 'high' | 'medium' | 'low'; matchedCategories: string[] }> = [];
    if (o.length > 0 && (w.length > 0 || t.length > 0)) recs.push({ archetypeId: 'ltg', confidence: 'high',   matchedCategories: ['opportunity', 'weakness'], reason: `${o.length} growth opportunities constrained by ${w.length + t.length} limiting factors.` });
    if (w.length >= 2)                                   recs.push({ archetypeId: 'stb', confidence: w.length >= 3 ? 'high' : 'medium', matchedCategories: ['weakness'],            reason: `${w.length} recurring weaknesses may mask root causes.` });
    if (t.length >= 2)                                   recs.push({ archetypeId: 'esc', confidence: 'medium', matchedCategories: ['threat'],               reason: `${t.length} competing threats suggest adversarial dynamics.` });
    if (s.filter(x => (x.impactScore || 3) >= 4).length >= 2) recs.push({ archetypeId: 'sts', confidence: 'medium', matchedCategories: ['strength'],        reason: `Multiple high-impact strengths may concentrate resources.` });
    if (w.length >= 2 && t.length >= 1)                  recs.push({ archetypeId: 'ftf', confidence: 'medium', matchedCategories: ['weakness', 'threat'],   reason: `Persisting weaknesses alongside threats suggests problematic fixes.` });
    return recs.slice(0, 4);
  }, [allItems]);

  const addItemToCLD = useCallback((item: SWOTItem) => {
    if (localCldNodes.find(n => n.id === `swot-${item.id}`)) return;
    const newNode: ExtendedCLDNode = {
      id: `swot-${item.id}`,
      label: item.description.length > 28 ? item.description.slice(0, 28) + '…' : item.description,
      x: 20 + (localCldNodes.length % 4) * 20,
      y: 25 + Math.floor(localCldNodes.length / 4) * 30,
      category: item.category, nodeType: 'default',
    };
    setLocalCldNodes(prev => [...prev, newNode]);
    setViewMode('cld');
  }, [localCldNodes]);

  const leverageCount = useMemo(() => {
    const pts: LeveragePoint[] = [];
    if (selectedArchId) pts.push(...generateArchetypeLeveragePoints(selectedArchId, localCldNodes, localCldLinks));
    pts.push(...generateCLDLeveragePoints(localCldNodes, localCldLinks));
    const seen = new Set<string>();
    return pts.filter(p => { const k = `${p.leverageLevel}-${p.intervention.slice(0, 40)}`; if (seen.has(k)) return false; seen.add(k); return true; }).length;
  }, [localCldNodes, localCldLinks, selectedArchId]);

  return (
    <div className="space-y-5 max-w-5xl mx-auto relative">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Systems Thinking</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Score SWOT factors, map causal loops, and apply systems archetypes</p>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 overflow-x-auto">
        {[
          { id: 'matrix', label: 'Matrix', Icon: LayoutDashboard },
          { id: 'impact', label: 'Impact', Icon: AlertTriangle },
          { id: 'cld',    label: 'CLD',    Icon: GitBranch },
        ].map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setViewMode(id as typeof viewMode)}
            className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center',
              viewMode === id ? 'bg-white dark:bg-slate-800/60 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200')}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Guide Toggle */}
      <button onClick={() => setShowGuide(v => !v)} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200 transition-colors">
        <HelpCircle className="w-3.5 h-3.5" />
        {showGuide ? 'Hide' : 'Show'} Scoring Guide
        {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {showGuide && (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
          <h4 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm"><HelpCircle className="w-4 h-4 text-slate-500 dark:text-slate-400 dark:text-slate-500" /> Scoring Guide</h4>
          <div className="text-xs text-slate-600 dark:text-slate-400 dark:text-slate-500 space-y-1.5">
            <p><span className="font-semibold text-emerald-700">Strengths / Opportunities</span> — higher score = more valuable</p>
            <p><span className="font-semibold text-red-700">Weaknesses / Threats</span> — higher score = more harmful</p>
          </div>
        </div>
      )}

      {/* ── MATRIX VIEW ── */}
      {viewMode === 'matrix' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SWOTQuadrant title="Strengths"     count={swot.strengths.length}     icon={Shield}      items={swot.strengths}     config={categoryConfig.strength}    onUpdate={onUpdateItem} onAddToCLD={addItemToCLD} />
            <SWOTQuadrant title="Weaknesses"    count={swot.weaknesses.length}    icon={AlertCircle} items={swot.weaknesses}    config={categoryConfig.weakness}    onUpdate={onUpdateItem} onAddToCLD={addItemToCLD} />
            <SWOTQuadrant title="Opportunities" count={swot.opportunities.length} icon={Lightbulb}   items={swot.opportunities} config={categoryConfig.opportunity} onUpdate={onUpdateItem} onAddToCLD={addItemToCLD} />
            <SWOTQuadrant title="Threats"       count={swot.threats.length}       icon={Zap}         items={swot.threats}       config={categoryConfig.threat}      onUpdate={onUpdateItem} onAddToCLD={addItemToCLD} />
          </div>
        </div>
      )}

      {/* ── IMPACT VIEW ── */}
      {viewMode === 'impact' && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Ranked by Priority Score</h3>
          {sortedImpact.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No SWOT items to display yet.</p>
          ) : sortedImpact.map((item, idx) => {
            const cfg  = categoryConfig[item.category];
            const Icon = cfg.icon;
            return (
              <div key={item.id} className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-6 shrink-0 mt-0.5">#{idx + 1}</span>
                  <div className={cn('p-1.5 rounded-lg shrink-0', cfg.bgColor)}><Icon className="w-3.5 h-3.5 text-white" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <span className={cn('text-xs font-semibold', cfg.textColor)}>{cfg.label}</span>
                      <PriorityBadge totalScore={item.total} category={item.category} />
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{item.description}</p>
                  </div>
                </div>
                <div className="pl-9 space-y-2">
                  <ScoreRow label="Impact"     score={item.impactScore     || 3} onChange={v => onUpdateItem?.(item.id, { impactScore: v })}     type="impact"     category={item.category} labelColor={cfg.textColor} />
                  <ScoreRow label="Likelihood" score={item.likelihoodScore || 3} onChange={v => onUpdateItem?.(item.id, { likelihoodScore: v })} type="likelihood" category={item.category} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CLD VIEW ── */}
      {viewMode === 'cld' && (
        <div className="space-y-4">
          {/* Build Actions */}
          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={buildFromSWOT}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors shadow-sm">
              <Wand2 className="w-3.5 h-3.5" /> Build from SWOT
            </button>
            <button onClick={() => { setLocalCldNodes([]); setLocalCldLinks([]); setHighlightedNodeIds([]); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-xs font-medium transition-colors">
              <X className="w-3.5 h-3.5" /> Clear Canvas
            </button>

            <div className="hidden sm:block">
              <SnapshotsPanel
                snapshots={plan.cldSnapshots || []}
                activeSnapshotId={plan.activeCLDSnapshotId}
                onSaveSnapshot={saveCLDSnapshot}
                onLoadSnapshot={loadCLDSnapshot}
                onDeleteSnapshot={deleteCLDSnapshot}
                renameSnapshot={renameCLDSnapshot}
              />
            </div>

            <button onClick={() => setAnalysisPanelOpen(true)} disabled={localCldNodes.length < 2}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ml-auto">
              <Bot className="w-3.5 h-3.5" /> Analyze Loops
            </button>
          </div>

          {/* Mobile Snapshots */}
          <div className="sm:hidden">
            <SnapshotsPanel
              snapshots={plan.cldSnapshots || []}
              activeSnapshotId={plan.activeCLDSnapshotId}
              onSaveSnapshot={saveCLDSnapshot}
              onLoadSnapshot={loadCLDSnapshot}
              onDeleteSnapshot={deleteCLDSnapshot}
              renameSnapshot={renameCLDSnapshot}
            />
          </div>

          {/* Suggested Archetypes */}
          {recommendArchetypes.length > 0 && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-violet-800 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Suggested Archetypes</h4>
              <div className="space-y-2">
                {recommendArchetypes.map(rec => {
                  const arch = systemArchetypes.find(a => a.id === rec.archetypeId);
                  if (!arch) return null;
                  return (
                    <div key={rec.archetypeId} className="bg-white dark:bg-slate-800/60 rounded-lg p-3 border border-violet-200/60">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">{arch.name}</span>
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">{rec.confidence} match</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed">{rec.reason}</p>
                        </div>
                        <button onClick={() => applyArchetype(rec.archetypeId)}
                          className="shrink-0 px-2.5 py-1.5 rounded-lg bg-violet-500 text-white text-xs font-medium hover:bg-violet-600 transition-colors">
                          Apply
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Educational Resources */}
          <EducationalResources />

          {/* CLD Sub-nav */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button onClick={() => setCldSubView('diagram')}
              className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center',
                cldSubView === 'diagram' ? 'bg-white dark:bg-slate-800/60 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200')}>
              <GitBranch className="w-3.5 h-3.5" /> CLD Diagram
            </button>
            <button onClick={() => setCldSubView('leverage')}
              className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center relative',
                cldSubView === 'leverage' ? 'bg-white dark:bg-slate-800/60 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200')}>
              <Target className="w-3.5 h-3.5" /> Leverage Points
              {leverageCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                  {leverageCount > 9 ? '9+' : leverageCount}
                </span>
              )}
            </button>
          </div>

          {cldSubView === 'diagram' && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-500" /> Causal Loop Diagram
              </h3>
              <CLDCanvas
                nodes={localCldNodes}
                links={localCldLinks}
                highlightedNodeIds={highlightedNodeIds}
                onUpdateNodes={handleUpdateNodes}
                onUpdateLinks={handleUpdateLinks}
              />
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-2">
                  <strong>Active CLD Snapshot:</strong>{' '}
                  {plan.activeCLDSnapshotId
                    ? `Loaded from "${(plan.cldSnapshots || []).find(s => s.id === plan.activeCLDSnapshotId)?.label}" (${new Date((plan.cldSnapshots || []).find(s => s.id === plan.activeCLDSnapshotId)?.createdAt || '').toLocaleDateString()})`
                    : 'Current canvas state (not saved as snapshot)'
                  }
                </p>
              </div>
            </div>
          )}

          {cldSubView === 'leverage' && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-red-500" /> Generated Leverage Points
                <span className="text-xs font-normal text-slate-400 dark:text-slate-500">— Meadows' framework</span>
              </h3>
              <LeveragePointsPanel
                nodes={localCldNodes}
                links={localCldLinks}
                selectedArchId={selectedArchId}
                highlightedNodeIds={highlightedNodeIds}
                onHighlightNodes={ids => { setHighlightedNodeIds(ids); if (ids.length > 0) setCldSubView('diagram'); }}
              />
            </div>
          )}

          {/* ── ARCHETYPES LIBRARY ── */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400 dark:text-slate-500" /> Systems Archetypes
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">{systemArchetypes.length} templates</span>
            </h3>
            <div className="space-y-2">
              {systemArchetypes.map(arch => (
                <div key={arch.id}
                  className={cn('rounded-xl border-2 transition-all cursor-pointer',
                    selectedArchId === arch.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-blue-300')}>

                  {/* ── Card header row ── */}
                  <div
                    className="flex items-center gap-3 p-3"
                    onClick={() => setSelectedArchId(s => s === arch.id ? null : arch.id)}
                  >
                    {/* Colour chip */}
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0 bg-gradient-to-br', arch.color)}>
                      {arch.id.slice(0, 2).toUpperCase()}
                    </div>

                    {/* Name + category */}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm text-slate-900 leading-tight">{arch.name}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">{arch.category}</p>
                    </div>

                    {/* 👁 Image tooltip — only for archetypes that have a diagram URL */}
                    {arch.imageUrl && (
                      <ArchetypeImageTooltip
                        imageUrl={arch.imageUrl}
                        archetypeName={arch.name}
                      />
                    )}

                    {/* Expand chevron */}
                    <ChevronDown className={cn('w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform', selectedArchId === arch.id && 'rotate-180')} />
                  </div>

                  {/* ── Expanded body ── */}
                  {selectedArchId === arch.id && (
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-200 dark:border-slate-700/60 pt-3">
                      {/* Diagram preview inside expanded panel */}
                      {arch.imageUrl && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <GitBranch className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500">Archetype Diagram</span>
                          </div>
                          <img
                            src={arch.imageUrl}
                            alt={`${arch.name} archetype diagram`}
                            className="w-full object-contain p-3"
                            style={{ maxHeight: 240 }}
                            onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                          />
                        </div>
                      )}

                      <p className="text-xs text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-relaxed">{arch.desc}</p>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">When to apply</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-relaxed">{arch.use}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={e => { e.stopPropagation(); applyArchetype(arch.id); }}
                          className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                          <Wand2 className="w-3.5 h-3.5" /> Apply Template to CLD
                        </button>
                        <button onClick={e => { e.stopPropagation(); applyArchetype(arch.id); setCldSubView('leverage'); }}
                          className="px-3 py-2 rounded-lg bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                          <Target className="w-3.5 h-3.5" /> Leverage
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Side Panel */}
      <AnalysisSidePanel
        isOpen={analysisPanelOpen}
        onClose={() => setAnalysisPanelOpen(false)}
        nodes={localCldNodes}
        links={localCldLinks}
        selectedStrategies={[]}
        onExecute={executeAIAnalysis}
      />

      {/* Info Strip */}
      {viewMode !== 'cld' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Use <strong>Impact × Likelihood</strong> (1–25) to score each factor. Switch to <strong>CLD Builder</strong> to map causal relationships and generate Meadows leverage points.
          </p>
        </div>
      )}
    </div>
  );
};

export default SystemsThinking;