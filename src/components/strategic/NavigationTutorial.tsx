import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  Layers,
  GitBranch,
  Target,
  BarChart3,
  FolderKanban,
  FileText,
  Users,
  BookOpen,
  Settings,
  Check,
  Lightbulb,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TutorialStep {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  viewId: string | null; // null = welcome screen (no navigation target)
  highlight: string;
  highlightColor: string;
  tips: string[];
  gradient: string;
  accentFrom: string;
  accentTo: string;
  phase?: string;
  phaseColor?: string;
}

// ─── Tutorial Content ────────────────────────────────────────────────────────
// Content derived from the User Manual — one step per sidebar module

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to Strat Planner Pro',
    subtitle: 'AI-Powered Strategic Planning Platform',
    description:
      'A comprehensive workspace to design, diagnose, score, and execute strategic plans. This quick tour walks you through every module — from environmental scanning to board-ready reports.',
    icon: Sparkles,
    viewId: null,
    highlight: 'Get started in minutes',
    highlightColor: 'text-cyan-300',
    tips: [
      'Five planning phases: Diagnostics → Strategy → Scorecard → Execution → Reports',
      'AI assistance is available in every module to accelerate your work',
      'Your plan auto-saves locally and syncs to the cloud in real time',
      'Use the sidebar at any time to jump between modules',
    ],
    gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    accentFrom: '#06b6d4',
    accentTo: '#6366f1',
  },
  {
    title: 'MEL Dashboard',
    subtitle: 'Monitor · Evaluate · Learn',
    description:
      'Your strategic command center. Track KPIs, PAP progress, and plan health in real time. The hero section shows live status, summary cards, charts, and a floating AI Strategist you can consult at any time.',
    icon: LayoutDashboard,
    viewId: 'dashboard',
    highlight: 'Start here every session',
    highlightColor: 'text-blue-300',
    tips: [
      'Four gradient summary cards: On Track, At Risk, Avg. Progress, Budget Utilized',
      'Strategy Performance bar chart — Target vs. Actual across all BSC perspectives',
      'Budget Allocation donut chart for Programs, Projects, and Activities',
      'Floating AI Strategist (bottom-right) for context-aware strategic intelligence',
    ],
    gradient: 'from-blue-500 via-blue-600 to-blue-700',
    accentFrom: '#3b82f6',
    accentTo: '#1d4ed8',
    phase: 'Continuous',
    phaseColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  {
    title: 'SWOT Analysis',
    subtitle: 'Phase 1 Diagnostics — Environmental Scanning',
    description:
      'Capture Strengths, Weaknesses, Opportunities, and Threats. Score each item by Impact and Likelihood (1–5) to auto-calculate Priority scores. Use the AI Generator to suggest context-aware items from your organization description.',
    icon: Layers,
    viewId: 'swot',
    highlight: 'The foundation of your plan',
    highlightColor: 'text-emerald-300',
    tips: [
      'Aim for 3–5 items per quadrant — balance matters as much as quantity',
      'Priority Score = Impact × Likelihood; range 1–25 (Critical, High, Medium, Low)',
      'AI Generator analyzes your org context for relevant SWOT suggestions',
      'Use "Find Interdependencies" to discover cross-quadrant relationships',
    ],
    gradient: 'from-emerald-500 via-teal-600 to-teal-700',
    accentFrom: '#10b981',
    accentTo: '#0d9488',
    phase: 'Phase 1',
    phaseColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    title: 'Systems Thinking',
    subtitle: 'Phase 1 Diagnostics — Causal Dynamics & Leverage',
    description:
      'Map Causal Loop Diagrams (CLDs), apply systems archetypes, and discover leverage points using the Meadows framework. Move beyond listing problems to understanding the structures that generate them.',
    icon: GitBranch,
    viewId: 'systems',
    highlight: 'See the bigger picture',
    highlightColor: 'text-purple-300',
    tips: [
      'Three views: Matrix (scoring), Impact (ranking), CLD (causal mapping)',
      '"Build from SWOT" auto-generates nodes and links from your scored factors',
      '10 system archetypes: Limits to Growth, Shifting the Burden, Escalation, and more',
      'Meadows Leverage Points L1–L12: paradigm shifts have the highest leverage',
    ],
    gradient: 'from-purple-500 via-violet-600 to-violet-700',
    accentFrom: '#a855f7',
    accentTo: '#7c3aed',
    phase: 'Phase 1',
    phaseColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  {
    title: 'Strategy Matrix',
    subtitle: 'Phase 2 — TOWS Strategic Options',
    description:
      'Generate SO, ST, WO, and WT strategies from your SWOT using the TOWS methodology. Score each option by Priority and Feasibility, then select the top performers to feed into your Balanced Scorecard.',
    icon: Target,
    viewId: 'strategy',
    highlight: 'Turn insights into action',
    highlightColor: 'text-amber-300',
    tips: [
      'SO (Maxi-Maxi): use strengths to seize opportunities — offensive growth moves',
      'ST (Maxi-Mini): use strengths to counter threats — competitive defense',
      'WO (Mini-Maxi): overcome weaknesses to capture opportunities — turnaround',
      'WT (Mini-Mini): minimize weaknesses & avoid threats — survival plays',
    ],
    gradient: 'from-amber-500 via-orange-500 to-orange-600',
    accentFrom: '#f59e0b',
    accentTo: '#ea580c',
    phase: 'Phase 2',
    phaseColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    title: 'Balanced Scorecard',
    subtitle: 'Phase 3 — Objectives & KPIs',
    description:
      'Define strategic objectives and KPIs across the four BSC perspectives: Financial, Customer, Internal Process, and Learning & Growth. AI can suggest relevant KPIs from your objective text.',
    icon: BarChart3,
    viewId: 'scorecard',
    highlight: 'Measure what matters',
    highlightColor: 'text-rose-300',
    tips: [
      'Each objective should link to 1–3 focused KPIs — avoid vanity metrics',
      'Set Baseline (start), Target (goal), and Current values for each KPI',
      'Status auto-calculates: On Track ≥70%, At Risk 40–69%, Delayed <40%',
      'At-Risk and Delayed KPIs trigger automated email alerts to plan owners',
    ],
    gradient: 'from-rose-500 via-pink-600 to-pink-700',
    accentFrom: '#f43f5e',
    accentTo: '#db2777',
    phase: 'Phase 3',
    phaseColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  {
    title: 'PAPs Management',
    subtitle: 'Phase 4 — Programs, Activities & Projects',
    description:
      'Build and track the execution layer of your strategy. Create Programs (large-scale), Activities (tasks/events), and Projects (time-bound deliverables), each linked to a Balanced Scorecard objective for full traceability.',
    icon: FolderKanban,
    viewId: 'paps',
    highlight: 'Execute with precision',
    highlightColor: 'text-cyan-300',
    tips: [
      'Link every PAP to a BSC objective — "no link, no traceability"',
      'Track owner, timeline, budget, and real-time progress per PAP',
      'Budget bars: green <90%, amber 90–100%, red glow = over budget',
      'Analytics snapshot shows Total Budget, Utilized, Remaining, and Burn Rate',
    ],
    gradient: 'from-cyan-500 via-sky-600 to-blue-600',
    accentFrom: '#06b6d4',
    accentTo: '#2563eb',
    phase: 'Phase 4',
    phaseColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  {
    title: 'Templates Library',
    subtitle: 'Pre-built Industry Frameworks',
    description:
      'Start faster with 12+ industry templates — Government/LGU, Healthcare, Technology Startup, K-12, Higher Education, Finance, Nonprofit, and more. Compare templates side-by-side, or save your own plans as reusable templates.',
    icon: Layers,
    viewId: 'templates',
    highlight: 'Skip the blank page',
    highlightColor: 'text-indigo-300',
    tips: [
      'Filter by industry, sort by rating, popularity, or newest',
      'Preview modal shows full SWOT, objectives, and KPI previews before applying',
      'Compare up to 3 templates side-by-side via the GitCompare button',
      'Save any completed plan as Private, Organization, or Public template',
    ],
    gradient: 'from-indigo-500 via-indigo-600 to-violet-700',
    accentFrom: '#6366f1',
    accentTo: '#7c3aed',
    phase: 'Library',
    phaseColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
  {
    title: 'Team Collaboration',
    subtitle: 'Real-Time Presence & Discussions',
    description:
      'Invite teammates with Viewer, Editor, or Admin roles. See live presence indicators and cursors. Comment on any SWOT item, KPI, or PAP with urgency tags. Full activity audit trail keeps everyone accountable.',
    icon: Users,
    viewId: 'team',
    highlight: 'Align your whole team',
    highlightColor: 'text-teal-300',
    tips: [
      'Viewer: read-only · Editor: add/edit content · Admin: full control',
      'Live cursors show who is editing which section in real time',
      'Discussion urgency: Low (green) → Medium (yellow) → High (orange) → Critical (red)',
      'Org invitations expire after 7 days — resend from the Team tab if needed',
    ],
    gradient: 'from-teal-500 via-emerald-600 to-green-700',
    accentFrom: '#14b8a6',
    accentTo: '#16a34a',
    phase: 'Collaboration',
    phaseColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  },
  {
    title: 'Plan Generator',
    subtitle: 'Phase 5 — Export & Share',
    description:
      'Generate a board-ready strategic plan document in PDF, Word (DOCX), or Excel (XLSX). Toggle sections on/off, edit content inline in the preview, and print directly from the browser — no extra software needed.',
    icon: FileText,
    viewId: 'export',
    highlight: 'Deliver to stakeholders',
    highlightColor: 'text-slate-300',
    tips: [
      'Toggle sections: Cover, SWOT, Strategies, Scorecard, PAPs, Systems Thinking',
      'Inline editing in the preview updates live plan data simultaneously',
      'PDF for formal distribution · DOCX for collaborative review · XLSX for analysis',
      'Print tip: enable "Background graphics" in browser print settings for color headers',
    ],
    gradient: 'from-slate-500 via-slate-600 to-slate-700',
    accentFrom: '#64748b',
    accentTo: '#334155',
    phase: 'Phase 5',
    phaseColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface NavigationTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onNavigate?: (view: string) => void; // Wires into MELDashboard / Sidebar navigation
}

// ─── Component ────────────────────────────────────────────────────────────────

const NavigationTutorial: React.FC<NavigationTutorialProps> = ({
  isOpen,
  onClose,
  onComplete,
  onNavigate,
}) => {
  const [step, setStep] = useState(0);
  const [animDir, setAnimDir] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset to first step whenever the modal opens
  useEffect(() => {
    if (isOpen) setStep(0);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const transition = useCallback((newStep: number, dir: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimDir(dir);
    setTimeout(() => {
      setStep(newStep);
      setIsAnimating(false);
    }, 180);
  }, [isAnimating]);

  const goNext = useCallback(() => {
    const isLast = step === TUTORIAL_STEPS.length - 1;
    if (isLast) {
      onComplete?.();
      onClose();
    } else {
      transition(step + 1, 'next');
    }
  }, [step, onComplete, onClose, transition]);

  const goPrev = useCallback(() => {
    if (step > 0) transition(step - 1, 'prev');
  }, [step, transition]);

  const handleSkip = () => {
    onComplete?.();
    onClose();
  };

  const handleNavigate = () => {
    const current = TUTORIAL_STEPS[step];
    if (current.viewId && onNavigate) {
      onNavigate(current.viewId);
      onComplete?.();
      onClose();
    }
  };

  if (!isOpen) return null;

  const current = TUTORIAL_STEPS[step];
  const Icon = current.icon;
  const isFirst = step === 0;
  const isLast = step === TUTORIAL_STEPS.length - 1;
  const totalSteps = TUTORIAL_STEPS.length;

  // Progress percentage
  const progress = ((step) / (totalSteps - 1)) * 100;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(5, 14, 31, 0.80)', backdropFilter: 'blur(6px)' }}
    >
      {/* ── Modal shell ──────────────────────────────────────────────────── */}
      <div
        className="relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(165deg, #0d1f3c 0%, #0a1628 60%, #07111e 100%)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset',
        }}
      >
        {/* ── Ambient glow behind header ────────────────────────────────── */}
        <div
          className="absolute inset-x-0 top-0 h-48 opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${current.accentFrom}55 0%, transparent 70%)`,
            transition: 'background 0.4s ease',
          }}
        />

        {/* ── Close button ─────────────────────────────────────────────── */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          aria-label="Close tutorial"
        >
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="relative px-7 pt-7 pb-5">
          <div className="flex items-start gap-4">
            {/* Icon badge */}
            <div
              className={cn(
                'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
                `bg-gradient-to-br ${current.gradient}`
              )}
              style={{ boxShadow: `0 8px 24px ${current.accentFrom}55` }}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Title block */}
            <div className="flex-1 min-w-0 pt-0.5">
              {/* Phase badge */}
              {current.phase && (
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-1.5',
                    current.phaseColor
                  )}
                >
                  {current.phase}
                </span>
              )}
              <h2 className="text-lg font-bold text-white leading-tight">{current.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{current.subtitle}</p>
            </div>

            {/* Step counter */}
            <div className="flex-shrink-0 text-right pt-0.5">
              <span className="text-xs font-bold text-slate-500 tabular-nums">
                {step + 1} / {totalSteps}
              </span>
            </div>
          </div>

          {/* Thin progress bar */}
          <div
            className="mt-5 h-0.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${current.accentFrom}, ${current.accentTo})`,
              }}
            />
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div
          className={cn(
            'px-7 pb-6 transition-all duration-[180ms]',
            isAnimating
              ? animDir === 'next'
                ? 'opacity-0 translate-x-3'
                : 'opacity-0 -translate-x-3'
              : 'opacity-100 translate-x-0'
          )}
        >
          {/* Highlight pill */}
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className={cn('w-3.5 h-3.5 flex-shrink-0', current.highlightColor)} />
            <span className={cn('text-xs font-semibold', current.highlightColor)}>
              {current.highlight}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-400 leading-relaxed mb-5">{current.description}</p>

          {/* Tips */}
          <div
            className="rounded-xl p-4 mb-5 space-y-2.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Key Features
            </p>
            {current.tips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5"
                style={{
                  animation: isAnimating ? 'none' : `fadeSlideIn 0.3s ease both`,
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <div
                  className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: `${current.accentFrom}22`,
                    border: `1px solid ${current.accentFrom}44`,
                  }}
                >
                  <Check className="w-2.5 h-2.5" style={{ color: current.accentFrom }} strokeWidth={3} />
                </div>
                <span className="text-xs text-slate-400 leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>

          {/* ── Actions ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            {/* Skip / Back */}
            <div className="flex items-center gap-2">
              {isFirst ? (
                <button
                  onClick={handleSkip}
                  className="text-xs font-medium text-slate-600 hover:text-slate-400 transition-colors"
                >
                  Skip tour
                </button>
              ) : (
                <button
                  onClick={goPrev}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 transition-all hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}
            </div>

            {/* Dot navigation */}
            <div className="flex items-center gap-1 flex-1 justify-center">
              {TUTORIAL_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => transition(i, i > step ? 'next' : 'prev')}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === step ? 20 : 6,
                    height: 6,
                    background:
                      i === step
                        ? current.accentFrom
                        : i < step
                        ? `${current.accentFrom}55`
                        : 'rgba(255,255,255,0.12)',
                  }}
                  aria-label={`Go to step ${i + 1}: ${TUTORIAL_STEPS[i].title}`}
                />
              ))}
            </div>

            {/* Navigate to module + Next */}
            <div className="flex items-center gap-2">
              {/* "Go to module" — only shown for non-welcome, non-last steps when onNavigate is provided */}
              {current.viewId && onNavigate && !isLast && (
                <button
                  onClick={handleNavigate}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white/70 hover:text-white transition-all"
                  style={{
                    background: `${current.accentFrom}18`,
                    border: `1px solid ${current.accentFrom}33`,
                  }}
                  title={`Open ${current.title}`}
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </button>
              )}

              {/* Next / Get Started / Open Module */}
              <button
                onClick={isLast && current.viewId && onNavigate ? handleNavigate : goNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${current.accentFrom}, ${current.accentTo})`,
                  boxShadow: `0 4px 16px ${current.accentFrom}44`,
                }}
              >
                {isLast ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    {current.viewId && onNavigate ? `Open ${current.title}` : 'Get Started'}
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Footer strip ─────────────────────────────────────────────── */}
        <div
          className="px-7 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <a
            href="https://asilvainnovations.github.io/strat-planner-pwa/user-manual.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 hover:text-slate-400 transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            Full User Manual
          </a>
          <span className="text-[11px] text-slate-700">
            Use ← → arrow keys to navigate
          </span>
        </div>
      </div>

      {/* ── CSS animation keyframe injected via style tag ─────────────── */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NavigationTutorial;