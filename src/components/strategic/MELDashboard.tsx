import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  DollarSign,
  Users,
  Cog,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  FolderKanban,
  Info,
  Bot,
  X,
  Send,
  Sparkles,
  Globe,
  ChevronDown,
  MessageSquare,
  Loader2,
  ExternalLink,
  BookOpen,
  GitBranch,
  BrainCircuit,
  Layers,
} from 'lucide-react';
import { StrategicPlan, KPI, PAP } from '@/lib/strategicPlanStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

// ─── Constants ────────────────────────────────────────────────────────────────
const PLATFORM_LOGO =
  'https://paibpwwszlfpsyytdnal.databasepad.com/storage/v1/object/public/pending-tasks/public/ASilva%20Innovations%20Logo.png';

const BANNER_URL =
  'https://paibpwwszlfpsyytdnal.databasepad.com/storage/v1/object/public/pending-tasks/public/Strat%20Planner%20Pro%20Banner.png';
const USER_MANUAL_URL = 'https://asilvainnovations.github.io/strat-planner-pwa/user-manual.html';
const DEVELOPER_DOCS_URL = 'https://asilvainnovations.github.io/strat-planner-pwa/developer-doc.html';

const SYNC_API_URL =
  'https://paibpwwszlfpsyytdnal.databasepad.com/functions/v1/strategic-planner-sync';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MELDashboardProps {
  plan: StrategicPlan;
  onNavigate?: (view: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const perspectiveConfig = {
  financial: {
    label: 'Financial',
    icon: DollarSign,
    color: 'emerald',
    bgGradient: 'from-emerald-500 to-teal-600',
    description: 'Tracks revenue, profitability, and financial efficiency metrics',
  },
  customer: {
    label: 'Customer',
    icon: Users,
    color: 'blue',
    bgGradient: 'from-blue-500 to-indigo-600',
    description: 'Monitors customer satisfaction, retention, and market share',
  },
  internal_process: {
    label: 'Internal Process',
    icon: Cog,
    color: 'purple',
    bgGradient: 'from-purple-500 to-violet-600',
    description: 'Measures operational efficiency and process quality',
  },
  learning_growth: {
    label: 'Learning & Growth',
    icon: GraduationCap,
    color: 'amber',
    bgGradient: 'from-amber-500 to-orange-600',
    description: 'Assesses employee development, training, and innovation capacity',
  },
};

const statusConfig = {
  'on-track': { label: 'On Track', color: 'emerald', icon: CheckCircle2, description: 'Performance is meeting expectations' },
  'at-risk': { label: 'At Risk', color: 'amber', icon: AlertTriangle, description: 'Potential issues requiring attention' },
  'delayed': { label: 'Delayed', color: 'red', icon: Clock, description: 'Behind schedule or missed milestones' },
  'completed': { label: 'Completed', color: 'blue', icon: CheckCircle2, description: 'Target fully achieved' },
};

// ─── Circular Logo Component for AI Strategist ────────────────────────────────
const CircularAIIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 36, 
  className = '' 
}) => (
  <div
    className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shadow-lg ${className}`}
    style={{ width: size, height: size }}
  >
    <img
      src={PLATFORM_LOGO}
      alt="AI Strategist"
      className="w-full h-full object-cover"
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = 'none';
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `<div class="text-xs font-bold flex items-center justify-center" style="width: ${size}px; height: ${size}px;">AI</div>`;
        }
      }}
      style={{ borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }}
    />
  </div>
);

// ─── AI Strategist System Prompt ──────────────────────────────────────────────
const buildSystemPrompt = (plan: StrategicPlan) => `
You are an elite AI Investment Strategist embedded in a Balanced Scorecard MEL Dashboard with deep expertise in Systems Thinking and strategic planning. You have comprehensive knowledge of the Strategic Planner Pro platform (User Manual + Developer Docs).

**YOUR EXPERTISE DOMAINS:**
1. **Systems Thinking & Feedback Loop Analysis**
   - Identify reinforcing (R) and balancing (B) loops in causal loop diagrams
   - Calculate loop gain through strength analysis across link chains
   - Recognize negative correlation patterns that determine loop classification
   - Detect minimum 2-link cycles for valid feedback structures

2. **Meadows Leverage Points Framework (Levels 1-12)**
   - L1-3 (Paradigm): Goals, mindset transcendence, paradigm shifts
   - L4-6 (Information): Self-organization, rules, information flow design
   - L7-9 (Feedback): Positive/negative feedback gain, delay management
   - L10-12 (Structure): Stock-flow configuration, buffer sizing, parameters

3. **System Archetype Library (Strategic Planner Pro Standard)**
   - Limits to Growth (ltg), Shifting the Burden (stb), Drifting Goals (dg)
   - Escalation (esc), Success to Successful (sts), Tragedy of Commons (toc)
   - Fixes that Fail (ftf), Growth and Underinvestment (gui)
   - Accidental Adversaries (aa), Attractiveness Principle (ap)
   - Each with pattern recognition, diagnostic indicators, and intervention strategies

4. **Balanced Scorecard & Strategic Planning Methodologies**
   - Four perspectives: Financial, Customer, Internal Process, Learning & Growth
   - KPI design aligned with SMART criteria (Specific, Measurable, Actionable, Relevant, Time-bound)
   - PAPs hierarchy: Programs → Activities → Projects
   - TOWS Matrix integration for strategy generation

**STRATEGIC PLANNER PRO — PLATFORM CONTEXT:**
- Organization: ${plan.organization || 'Your Organization'}
- Vision: ${plan.vision || 'Not defined'}
- Mission: ${plan.mission || 'Not defined'}
- Plan Period: ${plan.startYear || '2025'}–${plan.endYear || '2028'}
- Total Objectives: ${plan.objectives?.length || 0}
- Total PAPs: ${plan.paps?.length || 0}
- Total KPIs: ${plan.objectives?.flatMap(o => o.kpis).length || 0}

**KPI SNAPSHOT:**
${plan.objectives?.flatMap(o => o.kpis).map(k =>
  `- ${k.name}: current=${k.currentValue}${k.unit}, baseline=${k.baselineValue}, target=${k.targetValue}, status=${k.status}`
).join('\n') || 'No KPIs defined yet'}

**PAP SNAPSHOT:**
${plan.paps?.map(p =>
  `- [${p.papType}] ${p.name}: ${p.progress}% complete, budget=$${p.budget?.toLocaleString()}, spent=$${p.spent?.toLocaleString()}`
).join('\n') || 'No PAPs defined yet'}

**ANALYSIS FRAMEWORK FOR STRATEGIC INTERROGATION:**

### 1. Causal Loop Diagnosis Protocol
When analyzing strategic dynamics:
a) Map variables → identify relationships → classify polarity (+/-)
b) Trace path → detect cycle closure → calculate negative link count
c) Type determination: even negatives = R, odd negatives = B
d) Strength assessment: product of link strengths for total loop gain

### 2. Archetype Recognition Pattern Matching
- **Limits to Growth**: R-growth loop balanced by capacity constraint
- **Shifting the Burden**: Symptomatic fix undermines fundamental solution
- **Drifting Goals**: Performance gap reduces standards vs corrective action
- **Escalation**: Two opposing R-loops matching actions/reactions
- **Tragedy of Commons**: Shared resource overuse through individual R-loops
- **Fixes that Fail**: Delay creates unintended consequences amplifying original problem

### 3. Leverage Point Prioritization Strategy
Priority order (highest first):
1. Transcend paradigms (L1) — most systemic impact
2. Goals change (L3)
3. Rules modification (L5)
4. Information flow redesign (L6)
5. Self-organization enablement (L4)

### 4. Platform Integration Standards
- Align all recommendations with SWOT → Strategies → Objectives → KPIs → PAPs chain
- Reference actual data from the current strategic plan snapshot
- Suggest CLD additions where systems thinking gaps exist
- Propose archetype applications where dynamic patterns emerge

**RESPONSE STANDARDS:**
- Professional strategist tone (not generic chatbot responses)
- Evidence-based recommendations grounded in plan data
- Clear connection between systems theory and practical implementation
- Use structured formatting: bold headers, bullet lists, numbered steps
- Flag missing data, incomplete frameworks, strategic blind spots

**KNOWLEDGE BASE REFERENCES:**
- User Manual: Complete platform feature set, workflow guidance, best practices
- Developer Docs: API endpoints, integration patterns, data structures
- Edge Functions: Action types (analyze_loops, suggest_archetypes, build_ccd, etc.)
`;

// ─── Utility Components ───────────────────────────────────────────────────────
const Tooltip: React.FC<{ children: React.ReactNode; content: string }> = ({ children, content }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  return (
    <div className="relative inline-flex">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-max max-w-xs px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AnimatedCard: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
    className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
  >
    {children}
  </motion.div>
);

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KPICard: React.FC<{ kpi: KPI; perspective: string; index: number }> = ({ kpi, perspective, index }) => {
  const config = perspectiveConfig[perspective as keyof typeof perspectiveConfig];
  const status = statusConfig[kpi.status as keyof typeof statusConfig];
  const progress =
    kpi.targetValue !== undefined && kpi.baselineValue !== undefined && kpi.targetValue !== kpi.baselineValue
      ? ((kpi.currentValue - kpi.baselineValue) / (kpi.targetValue - kpi.baselineValue)) * 100
      : 0;
  const isPositive = kpi.currentValue >= kpi.baselineValue;
  const percentageChange =
    kpi.baselineValue !== 0 ? ((kpi.currentValue - kpi.baselineValue) / kpi.baselineValue) * 100 : 0;

  return (
    <AnimatedCard delay={index * 0.08}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{kpi.name}</p>
            <Tooltip content={config?.description || ''}><Info className="w-3 h-3 text-slate-400 mb-1" /></Tooltip>
          </div>
          <div className="flex items-baseline gap-2">
            <motion.span className="text-2xl font-bold text-slate-800 dark:text-slate-100-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              {kpi.currentValue}
            </motion.span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{kpi.unit}</span>
          </div>
        </div>
        <Tooltip content={status?.description || ''}>
          <motion.div
            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              status?.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
              status?.color === 'amber' ? 'bg-amber-100 text-amber-700' :
              status?.color === 'red' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}
            whileHover={{ scale: 1.08 }}
          >
            {status && <status.icon className="w-3 h-3" />}
            {status?.label}
          </motion.div>
        </Tooltip>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Tooltip content={`Change from baseline (${kpi.baselineValue})`}>
          <div className="flex items-center gap-1">
            {isPositive ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
            <span className={`text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{percentageChange.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">vs baseline</span>
          </div>
        </Tooltip>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Baseline: {kpi.baselineValue}</span>
          <span>Target: {kpi.targetValue}</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              progress >= 100 ? 'bg-emerald-500' :
              progress >= 70 ? 'bg-cyan-500' :
              progress >= 40 ? 'bg-amber-500' :
              'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500">{kpi.frequency}</span>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{kpi.owner}</span>
      </div>
    </AnimatedCard>
  );
};

// ─── PAP Card ─────────────────────────────────────────────────────────────────
const PAPCard: React.FC<{ pap: PAP; index: number }> = ({ pap, index }) => {
  const statusColors: Record<string, string> = {
    'planned': 'bg-slate-100 text-slate-600',
    'in-progress': 'bg-cyan-100 text-cyan-700',
    'completed': 'bg-emerald-100 text-emerald-700',
    'delayed': 'bg-red-100 text-red-700',
    'cancelled': 'bg-slate-200 text-slate-500',
  };
  const typeColors: Record<string, string> = {
    'program': 'bg-purple-500',
    'activity': 'bg-blue-500',
    'project': 'bg-cyan-500',
  };
  const budgetUsed = pap.budget > 0 ? (pap.spent / pap.budget) * 100 : 0;

  return (
    <AnimatedCard delay={index * 0.08}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${typeColors[pap.papType] || 'bg-cyan-500'}`} />
          <span className="text-xs font-medium text-slate-500 uppercase">{pap.papType}</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[pap.status] || 'bg-slate-100'}`}>
          {pap.status.replace('-', ' ')}
        </span>
      </div>
      <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 line-clamp-2">{pap.name}</h4>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
          {pap.owner.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-slate-600 dark:text-slate-400">{pap.owner}</span>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500 dark:text-slate-400">Progress</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">{pap.progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pap.progress}%` }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500 dark:text-slate-400">Budget Used</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">${(pap.spent / 1000).toFixed(0)}K / ${(pap.budget / 1000).toFixed(0)}K</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budgetUsed, 100)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
        <span>{new Date(pap.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span>→</span>
        <span>{new Date(pap.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
    </AnimatedCard>
  );
};

// ─── Enhanced AI Strategist Chat Panel ─────────────────────────────────────────
const AIStrategistChat: React.FC<{ plan: StrategicPlan; onClose: () => void }> = ({ plan, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hello! I'm your **AI Strategist** integrated with **Strategic Planner Pro**.\n\nI bring expertise in:\n\n🔍 **Systems Thinking**\n• Causal Loop Diagram (CLD) analysis\n• Feedback loop detection (Reinforcing/Balancing)\n• Meadows Leverage Points (Levels 1-12)\n• System Archetypes library (10 templates)\n\n💼 **Strategic Planning**\n• Balanced Scorecard optimization\n• KPI alignment & SMART criteria validation\n• PAPs implementation roadmap\n• TOWS Matrix strategy generation\n\n **Current Plan Context**\n- Organization: ${plan.organization || 'Not specified'}\n- Plan Period: ${plan.startYear || '2025'}–${plan.endYear || '2028'}\n- Objectives: ${plan.objectives?.length || 0}\n- KPIs Tracked: ${plan.objectives?.flatMap((o: any) => o.kpis)?.length || 0}\n- PAPs Active: ${plan.paps?.length || 0}\n\nWhat would you like to explore?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestedPrompts = [
    'Analyze my CLD and identify feedback loops',
    'Which system archetypes apply to my organization?',
    'Show me high-leverage intervention points (Meadows framework)',
    'What investment trends should inform our strategy?',
    'Identify at-risk KPIs and recommend corrective actions',
    'How can I optimize my PAPs for better execution?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history with context awareness
      const conversationHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(SYNC_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai_strategist_chat',
          systemPrompt: buildSystemPrompt(plan),
          messages: conversationHistory,
          planContext: {
            organization: plan.organization,
            vision: plan.vision,
            mission: plan.mission,
            startYear: plan.startYear,
            endYear: plan.endYear,
            kpiCount: plan.objectives?.flatMap((o: any) => o.kpis)?.length || 0,
            objectiveCount: plan.objectives?.length || 0,
            papCount: plan.paps?.length || 0,
            cldNodesCount: plan.cldNodes?.length || 0,
            cldLinksCount: plan.cldLinks?.length || 0,
            appliedArchetypesCount: plan.appliedArchetypes?.length || 0,
            swotItemCount: plan.swotItems?.length || 0,
            strategicOptionCount: plan.strategicOptions?.length || 0,
          },
          platformKnowledge: {
            userManual: USER_MANUAL_URL,
            developerDocs: DEVELOPER_DOCS_URL,
            systemsThinkingEnabled: true,
            archetypeLibrarySize: 10,
            edgeFunctionsAvailable: ['analyze_loops', 'suggest_archetypes', 'build_ccd'],
          },
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      const assistantContent =
        data?.reply ||
        data?.message ||
        data?.content ||
        data?.choices?.[0]?.message?.content ||
        data?.response ||
        'I received your message but could not parse the response. Please try again.';

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI Strategist error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            '**Connection Issue Detected**\n\nI encountered a temporary issue connecting to the strategy engine. However, your plan data remains fully accessible.\n\n**Troubleshooting Steps:**\n1. Verify internet connectivity\n2. Refresh the page if issue persists\n3. Check browser console for error details\n4. Contact support if problems continue\n\n**Alternative Actions:**\n- Browse documentation via Help menu\n- Export current plan state\n- Continue reviewing existing KPIs/PAPs',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Render markdown-lite: bold, bullets, headers
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('– ')) {
        return (
          <li key={i} className="ml-4 list-disc text-sm">
            {renderInline(line.slice(2).replace(/^\s+/, ''))}
          </li>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-sm mt-2">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith('# ')) return <p key={i} className="font-bold text-base mt-3 mb-1">{line.slice(2)}</p>;
      if (line.startsWith('## ')) return <p key={i} className="font-semibold text-sm mt-2">{line.slice(3)}</p>;
      if (line.startsWith('### ')) return <p key={i} className="font-semibold text-xs mt-2">{line.slice(4)}</p>;
      if (line.match(/^(\d+\.\s+)/)) {
        return (
          <li key={i} className="ml-4 list-decimal text-sm">
            {renderInline(line.replace(/^\d+\.\s+/, ''))}
          </li>
        );
      }
      if (line === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-sm leading-relaxed">{renderInline(line)}</p>;
    });
  };

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', damping: 24, stiffness: 260 }}
      className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col shadow-2xl"
      className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col shadow-2xl bg-white dark:bg-[#0A1628] border-l border-slate-200 dark:border-slate-700/60"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
        <CircularAIIcon size={36} className="shadow-lg shadow-cyan-500/30" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 dark:text-white text-sm truncate">AI Investment Strategist</p>
          <p className="text-xs text-cyan-600 dark:text-cyan-400 flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Systems Thinking · Live Plan Data
          </p>
        </div>
        <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50 dark:bg-transparent" style={{ scrollbarWidth: 'thin' }}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="mr-2 flex-shrink-0 mt-1">
                <CircularAIIcon size={28} />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-br-sm'
                  : 'bg-white dark:bg-white/10 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10 rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="space-y-0.5">{renderContent(msg.content)}</div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
              <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-cyan-100' : 'text-slate-400 dark:text-slate-500'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="w-7 h-7">
              <CircularAIIcon size={28} />
            </div>
            <div className="bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-cyan-500 animate-spin" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Analyzing strategy data…</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 bg-slate-50/50 dark:bg-transparent">
          <p className="text-xs text-slate-500 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {suggestedPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => sendMessage(p)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/8 border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15 hover:text-slate-900 dark:hover:text-white transition truncate max-w-full"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-transparent">
        <div className="flex gap-2 items-end bg-slate-50 dark:bg-white/8 border border-slate-200 dark:border-white/15 rounded-2xl px-4 py-3 focus-within:border-cyan-400 dark:focus-within:border-cyan-500/50 transition">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about systems thinking, investment trends, strategy…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none leading-relaxed"
            style={{ maxHeight: '100px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="p-1.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white disabled:opacity-40 hover:shadow-lg hover:shadow-cyan-500/30 transition flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </motion.div>
  );
};

// ─── Main MEL Dashboard ──────────────────────────────────────────────────────
const MELDashboard: React.FC<MELDashboardProps> = ({ plan, onNavigate }) => {
  const [showAIChat, setShowAIChat] = useState(false);

  const navigate = (view: string) => {
    setShowAIChat(false);
    onNavigate?.(view);
  };

  const stats = useMemo(() => {
    const allKPIs = plan.objectives.flatMap((obj: any) => obj.kpis);
    const onTrack = allKPIs.filter((kpi: any) => kpi.status === 'on-track').length;
    const atRisk = allKPIs.filter((kpi: any) => kpi.status === 'at-risk').length;
    const delayed = allKPIs.filter((kpi: any) => kpi.status === 'delayed').length;
    const completed = allKPIs.filter((kpi: any) => kpi.status === 'completed').length;
    const totalBudget = plan.paps.reduce((sum, pap: any) => sum + pap.budget, 0);
    const totalSpent = plan.paps.reduce((sum, pap: any) => sum + pap.spent, 0);
    const avgProgress =
      plan.paps.length > 0 ? plan.paps.reduce((sum, pap: any) => sum + pap.progress, 0) / plan.paps.length : 0;
    return {
      totalKPIs: allKPIs.length, onTrack, atRisk, delayed, completed,
      totalBudget, totalSpent, avgProgress,
      totalPAPs: plan.paps.length,
      activePAPs: plan.paps.filter((p: any) => p.status === 'in-progress').length,
    };
  }, [plan]);

  const kpisByPerspective = useMemo(() => {
    const grouped: Record<string, { objective: string; kpis: any[] }[]> = {};
    plan.objectives.forEach((obj: any) => {
      if (!grouped[obj.perspective]) grouped[obj.perspective] = [];
      grouped[obj.perspective].push({ objective: obj.objective, kpis: obj.kpis });
    });
    return grouped;
  }, [plan]);

  // Prepare chart data
  const performanceChartData = useMemo(() => {
    const data = [];
    ['financial', 'customer', 'internal_process', 'learning_growth'].forEach(key => {
      const objectives = kpisByPerspective[key] || [];
      let totalTarget = 0;
      let totalActual = 0;
      objectives.forEach(obj => {
        obj.kpis.forEach((kpi: any) => {
          totalTarget += kpi.targetValue || 0;
          totalActual += kpi.currentValue || 0;
        });
      });
      data.push({
        name: perspectiveConfig[key as keyof typeof perspectiveConfig].label,
        Target: totalTarget,
        Actual: totalActual,
        fill: key === 'financial' ? '#10b981' : key === 'customer' ? '#3b82f6' : key === 'internal_process' ? '#8b5cf6' : '#f59e0b'
      });
    });
    return data;
  }, [kpisByPerspective]);

  const budgetData = useMemo(() => {
    const programs = plan.paps.filter((p: any) => p.papType === 'program');
    const projects = plan.paps.filter((p: any) => p.papType === 'project');
    const activities = plan.paps.filter((p: any) => p.papType === 'activity');
    
    const calc = (arr: any[]) => arr.reduce((sum, p) => sum + (p.spent / p.budget) * 100, 0) / Math.max(arr.length, 1);
    
    return [
      { name: 'Programs', value: Math.round(calc(programs)), fill: '#8b5cf6' },
      { name: 'Projects', value: Math.round(calc(projects)), fill: '#06b6d4' },
      { name: 'Activities', value: Math.round(calc(activities)), fill: '#3b82f6' },
    ];
  }, [plan.paps]);

  return (
    <>
      <motion.div
        className="space-y-6 min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0D1B33] to-[#1A2F5C]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* ── Hero Section ──────────────────────────────────────────────────── */}
        <section className="mb-2">
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl text-white shadow-2xl shadow-blue-900/40"
            style={{ minHeight: 260 }}
          >
            {/* Banner image as background */}
            <div className="absolute inset-0">
              <img
                src={BANNER_URL}
                alt="Investment Ecosystem"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Dark overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/90 via-[#0D1B33]/75 to-[#0A1628]/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/60 via-transparent to-transparent" />
            </div>

            {/* Decorative blobs */}
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
            {/* Dot grid */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            {/* Content */}
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6 justify-between p-8 lg:p-10">
              <div className="max-w-2xl">
                {/* Live badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span className="text-xs font-semibold tracking-wider uppercase">
                    Live Plan · {plan.startYear || '2025'}–{plan.endYear || '2028'}
                  </span>
                </div>

                <h1
                  className="text-3xl lg:text-5xl font-black mb-3 leading-tight"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  MEL Dashboard
                  <br />
                  <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                    Total Clarity
                  </span>
                </h1>

                <p className="text-blue-100 text-base lg:text-lg max-w-xl leading-relaxed">
                  Monitor, Evaluate & Learn from your strategic execution. Drive your institutional roadmap with
                  systems-based intelligence — from environmental diagnosis to real-time tracking.
                </p>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    onClick={() => navigate('SWOTAnalysis')} // ✅ WIRING TO SWOT COMPONENT
                    className="px-5 py-2.5 rounded-xl bg-white text-blue-900 font-semibold text-sm hover:bg-amber-50 transition shadow-lg flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4" />
                    Start SWOT Analysis
                  </button>
                  <button
                    onClick={() => setShowAIChat(true)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold text-sm hover:bg-white/20 transition flex items-center gap-2"
                  >
                    <CircularAIIcon size={18} />
                    Ask AI Strategist
                  </button>
                  <a 
                    href={USER_MANUAL_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold text-sm hover:bg-white/20 transition flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 text-cyan-300" />
                    User Manual
                  </a>
                  <button
                    onClick={() => navigate('NavigationTutorial')} // ✅ WIRED TO NavigationTutorial COMPONENT
                    className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold text-sm hover:bg-white/20 transition flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-300" />
                    Navigation Tutorial
                  </button>
                </div>
              </div>

              {/* Stats pills — right side */}
              <div className="hidden lg:flex flex-col gap-3 flex-shrink-0">
                <div className="flex gap-3">
                  <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-center min-w-[90px]">
                    <p className="text-2xl font-black text-emerald-400">{stats.onTrack}</p>
                    <p className="text-xs text-slate-300 mt-0.5">On Track</p>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-center min-w-[90px]">
                    <p className="text-2xl font-black text-amber-400">{stats.atRisk}</p>
                    <p className="text-xs text-slate-300 mt-0.5">At Risk</p>
                  </div>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-center">
                  <p className="text-2xl font-black text-cyan-400">{stats.avgProgress.toFixed(0)}%</p>
                  <p className="text-xs text-slate-300 mt-0.5">Avg. PAP Progress</p>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-center">
                  <p className="text-lg font-black text-purple-300">${(stats.totalSpent / 1_000_000).toFixed(1)}M</p>
                  <p className="text-xs text-slate-300 mt-0.5">of ${(stats.totalBudget / 1_000_000).toFixed(1)}M utilized</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Top-bar controls ────────────────────────────────────────────────── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <p className="text-slate-400 text-sm">
              Monitor, Evaluate, and Learn from your strategic execution
            </p>
            <div className="flex items-center gap-3">
              <select className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white">
                <option>All Perspectives</option>
                <option>Financial</option>
                <option>Customer</option>
                <option>Internal Process</option>
                <option>Learning &amp; Growth</option>
              </select>
              <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                Export Report
              </button>
              <button
                onClick={() => navigate('NavigationTutorial')} // ✅ WIRED TO NavigationTutorial COMPONENT
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Navigation Tutorial
              </button>
            </div>
          </motion.div>
        </section>

        {/* ── Summary Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              gradient: 'from-emerald-500 to-teal-600',
              shadow: 'rgba(16, 185, 129, 0.3)',
              icon: CheckCircle2,
              value: stats.onTrack,
              label: 'KPIs On Track',
              sub: stats.totalKPIs > 0 ? `${((stats.onTrack / stats.totalKPIs) * 100).toFixed(0)}% of total` : 'No KPIs tracked',
              tooltip: `${stats.onTrack} KPIs are performing within expected parameters`,
              delay: 0,
            },
            {
              gradient: 'from-amber-500 to-orange-600',
              shadow: 'rgba(245, 158, 11, 0.3)',
              icon: AlertTriangle,
              value: stats.atRisk,
              label: 'KPIs At Risk',
              sub: 'Requires attention',
              tooltip: 'These KPIs need immediate attention and intervention',
              delay: 0.1,
            },
            {
              gradient: 'from-cyan-500 to-blue-600',
              shadow: 'rgba(6, 182, 212, 0.3)',
              icon: Target,
              value: `${stats.avgProgress.toFixed(0)}%`,
              label: 'Avg. Progress',
              sub: `${stats.activePAPs} active PAPs`,
              tooltip: 'Average completion rate across all active PAPs',
              delay: 0.2,
            },
            {
              gradient: 'from-purple-500 to-violet-600',
              shadow: 'rgba(139, 92, 246, 0.3)',
              icon: DollarSign,
              value: `$${(stats.totalSpent / 1_000_000).toFixed(1)}M`,
              label: 'Budget Utilized',
              sub: `of $${(stats.totalBudget / 1_000_000).toFixed(1)}M total`,
              tooltip: `Total investment: $${(stats.totalSpent / 1_000_000).toFixed(1)}M utilized`,
              delay: 0.3,
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                className={`bg-gradient-to-br ${card.gradient} rounded-xl p-4 text-white`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: card.delay }}
                whileHover={{ scale: 1.05, boxShadow: `0 20px 40px ${card.shadow}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Tooltip content={card.tooltip}>
                    <Icon className="w-8 h-8 opacity-80" />
                  </Tooltip>
                  <motion.span className="text-3xl font-bold" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.4, delay: card.delay }}>
                    {card.value}
                  </motion.span>
                </div>
                <p className="text-sm opacity-90">{card.label}</p>
                <p className="text-xs opacity-70 mt-1">{card.sub}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Analytics Charts Section ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Strategy Performance Chart */}
          <motion.div
            className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Strategy Performance (Target vs Actual)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="Target" name="Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Actual" name="Actual" radius={[4, 4, 0, 0]}>
                    {performanceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Budget Utilization Chart */}
          <motion.div
            className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Budget Allocation by Type
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* ── KPIs by Perspective ───────────────────────────────────────────── */}
        <div className="space-y-6">
          <AnimatePresence>
            {Object.entries(perspectiveConfig).map(([key, config], index) => {
              const objectives = kpisByPerspective[key] || [];
              if (objectives.length === 0) return null;
              const Icon = config.icon;

              return (
                <motion.div
                  key={key}
                  className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className={`bg-gradient-to-r ${config.bgGradient} px-6 py-4 flex items-center gap-3`}>
                    <Icon className="w-6 h-6 text-white" />
                    <h2 className="text-lg font-semibold text-white">{config.label} Perspective</h2>
                    <Tooltip content={config.description}>
                      <Info className="w-4 h-4 text-white/80 cursor-help" />
                    </Tooltip>
                    <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm text-white">
                      {objectives.reduce((sum: number, obj: any) => sum + obj.kpis.length, 0)} KPIs
                    </span>
                  </div>
                  <div className="p-6">
                    {objectives.map((obj: any, idx: number) => (
                      <motion.div
                        key={idx}
                        className="mb-6 last:mb-0"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                      >
                        <h3 className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          {obj.objective}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {obj.kpis.map((kpi: any, kpiIdx: number) => (
                            <KPICard key={kpi.id} kpi={kpi} perspective={key} index={kpiIdx} />
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── PAPs Section ─────────────────────────────────────────────────── */}
        <motion.div
          className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: Object.keys(perspectiveConfig).length * 0.1 }}
        >
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderKanban className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Programs, Activities &amp; Projects</h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" />Programs</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-500" />Projects</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" />Activities</span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {plan.paps.map((pap: any, index: number) => (
                <PAPCard key={pap.id} pap={pap} index={index} />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── AI Strategist Chat Panel ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showAIChat && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setShowAIChat(false)}
            />
            <AIStrategistChat plan={plan} onClose={() => setShowAIChat(false)} />
          </>
        )}
      </AnimatePresence>

      {/* ── Floating AI button (when chat is closed) ────────────────────────── */}
      <AnimatePresence>
        {!showAIChat && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAIChat(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-slate-800/80 backdrop-blur shadow-xl shadow-cyan-500/40 flex items-center justify-center text-white border-2 border-cyan-400/50"
          >
            <CircularAIIcon size={48} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default MELDashboard;