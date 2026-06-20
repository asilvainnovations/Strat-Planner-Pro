export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  category: 'builtin' | 'user' | 'shared';
  icon: string;
  color: string;
  tags: string[];
  usage_count: number;
  rating: number;
  rating_count: number;
  organization?: string;
  created_by?: string;
  is_public: boolean;
  plan_data: {
    name: string;
    organization: string;
    vision: string;
    mission: string;
    strategicIntent: string;
    swotItems: Array<{
      category: 'strength' | 'weakness' | 'opportunity' | 'threat';
      description: string;
      impactScore: number;
      likelihoodScore: number;
    }>;
    strategicOptions: Array<{
      optionType: 'SO' | 'ST' | 'WO' | 'WT';
      title: string;
      description: string;
      priorityScore: number;
      feasibilityScore: number;
      selected: boolean;
    }>;
    objectives: Array<{
      perspective: 'financial' | 'customer' | 'internal_process' | 'learning_growth';
      objective: string;
      description: string;
      weight: number;
      kpis: Array<{
        name: string;
        description: string;
        baselineValue: number;
        targetValue: number;
        currentValue: number;
        unit: string;
        frequency: string;
        owner: string;
        status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
      }>;
    }>;
  };
  created_at: string;
  updated_at: string;
}

export const INDUSTRY_OPTIONS = [
  { value: 'all', label: 'All Industries', icon: 'Globe' },
  { value: 'healthcare', label: 'Healthcare', icon: 'Heart' },
  { value: 'technology', label: 'Technology', icon: 'Cpu' },
  { value: 'education', label: 'Education', icon: 'GraduationCap' },
  { value: 'finance', label: 'Finance', icon: 'Landmark' },
  { value: 'manufacturing', label: 'Manufacturing', icon: 'Factory' },
  { value: 'nonprofit', label: 'Non-Profit', icon: 'Heart' },
  { value: 'retail', label: 'Retail', icon: 'ShoppingBag' },
  { value: 'government', label: 'Government', icon: 'Building2' },
  { value: 'energy', label: 'Energy', icon: 'Zap' },
  { value: 'general', label: 'General', icon: 'FileText' },
  { value: 'investment', label: 'Investment & Development', icon: 'TrendingUp' },
];

export const BUILTIN_TEMPLATES: PlanTemplate[] = [
  // ===== 1. HEALTHCARE =====
  {
    id: 'tmpl-healthcare-transformation',
    name: 'Healthcare System Transformation',
    description: 'Comprehensive strategic framework for healthcare organizations navigating digital transformation, patient-centric care models, and value-based reimbursement. Addresses systemic feedback loops between quality outcomes, cost efficiency, and workforce capacity.',
    industry: 'healthcare',
    category: 'builtin',
    icon: 'Heart',
    color: 'rose',
    tags: ['patient-centered care', 'digital health', 'value-based care', 'workforce resilience', 'telemedicine', 'population health'],
    usage_count: 1284,
    rating: 4.8,
    rating_count: 203,
    is_public: true,
    plan_data: {
      name: 'Healthcare System Transformation Plan',
      organization: 'Regional Health System',
      vision: 'To be the most trusted health system in the region — delivering equitable, high-quality, and compassionate care to every patient, every time.',
      mission: 'To improve health outcomes and quality of life by delivering accessible, evidence-based, and patient-centered care through an engaged and resilient workforce.',
      strategicIntent: 'Achieve top-quartile clinical quality scores, reduce cost-per-episode by 18%, expand digital health access to 75% of patients, and attain 90%+ patient satisfaction within 3 years through the Value-Based Care Transformation framework.',
      swotItems: [
        { category: 'strength', description: 'Established clinical reputation with Magnet-designated nursing excellence and Joint Commission accreditation', impactScore: 5, likelihoodScore: 5 },
        { category: 'strength', description: 'Integrated EHR system (Epic) enabling data-driven clinical decisions and care coordination', impactScore: 4, likelihoodScore: 5 },
        { category: 'strength', description: 'Strong community relationships, primary care network of 42 clinics, and broad geographic coverage', impactScore: 4, likelihoodScore: 5 },
        { category: 'strength', description: 'Financial reserves and credit rating supporting capital investment in infrastructure and technology', impactScore: 4, likelihoodScore: 4 },
        { category: 'strength', description: 'Robust graduate medical education programs attracting top clinical talent pipelines', impactScore: 3, likelihoodScore: 4 },
        { category: 'weakness', description: 'Critical nursing and specialist shortage — 18% vacancy rate driving agency staffing costs up 34%', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'Fragmented care transitions between inpatient, outpatient, and post-acute settings causing readmissions', impactScore: 5, likelihoodScore: 4 },
        { category: 'weakness', description: 'Slow digital adoption among clinical staff; telehealth utilization at only 12% of eligible visits', impactScore: 4, likelihoodScore: 4 },
        { category: 'weakness', description: 'High administrative burden consuming 30% of physician time on documentation and billing', impactScore: 4, likelihoodScore: 5 },
        { category: 'weakness', description: 'Limited population health analytics capability inhibiting proactive disease management programs', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Value-based care contracts growth — CMS transitioning 100% of Medicare payments to value-based models by 2030', impactScore: 5, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Remote patient monitoring and AI-assisted diagnostics reducing cost while improving chronic disease management', impactScore: 5, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Behavioral health integration demand surge — 1 in 5 adults with unmet mental health needs post-pandemic', impactScore: 4, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Strategic partnerships with payers for shared-savings programs and care management incentives', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Underserved community expansion funded by HRSA grants and 340B drug pricing program', impactScore: 4, likelihoodScore: 4 },
        { category: 'threat', description: 'Physician group consolidation by private equity creating competing employed networks and price pressure', impactScore: 5, likelihoodScore: 5 },
        { category: 'threat', description: 'Payer reimbursement cuts and prior authorization expansion eroding operating margins below 2%', impactScore: 5, likelihoodScore: 4 },
        { category: 'threat', description: 'Cybersecurity vulnerabilities — healthcare sector averaged $10.9M per breach in 2024', impactScore: 5, likelihoodScore: 4 },
        { category: 'threat', description: 'Workforce burnout and turnover — 47% of nurses considering leaving profession within 2 years', impactScore: 4, likelihoodScore: 5 },
        { category: 'threat', description: 'Regulatory complexity: No Surprises Act, price transparency mandates, and evolving HIPAA requirements', impactScore: 3, likelihoodScore: 5 },
      ],
      strategicOptions: [
        { optionType: 'SO', title: 'Value-Based Care Network Expansion', description: 'Leverage clinical reputation and EHR integration to win ACO shared-savings contracts and expand value-based covered lives by 40%', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'SO', title: 'Digital Health Platform Launch', description: 'Use financial reserves and Epic infrastructure to deploy comprehensive telehealth, remote monitoring, and patient engagement platform', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Workforce Resilience Program', description: 'Combat burnout threats using clinical reputation to implement nurse residency programs, loan forgiveness, and flexible scheduling models', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Cybersecurity Hardening Initiative', description: 'Use financial reserves to deploy zero-trust architecture, staff training, and cyber insurance to protect against escalating breach risk', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'Care Transitions Integration', description: 'Leverage value-based contract incentives to fund care coordinators, post-discharge follow-up protocols, and SNF partnership programs reducing readmissions 25%', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'Population Health Analytics Build-out', description: 'Use CMS data access and payer partnerships to build predictive risk stratification identifying high-cost, preventable admissions', priorityScore: 4, feasibilityScore: 3, selected: true },
        { optionType: 'WT', title: 'AI-Assisted Documentation Automation', description: 'Deploy ambient AI scribing to cut physician documentation time 50%, addressing both burnout and regulatory compliance simultaneously', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'WT', title: 'Behavioral Health Integration Strategy', description: 'Co-locate behavioral health clinicians in primary care and create stepped care pathways reducing ED behavioral health boarding by 40%', priorityScore: 4, feasibilityScore: 3, selected: false },
      ],
      objectives: [
        { perspective: 'financial', objective: 'Achieve Sustainable Operating Margin', description: 'Transition revenue mix toward value-based contracts while reducing agency staffing and administrative costs to sustain ≥3.5% operating margin', weight: 1.5, kpis: [
          { name: 'Operating Margin', description: 'Net operating income as percentage of total revenue', baselineValue: 1.8, targetValue: 3.5, currentValue: 1.8, unit: '%', frequency: 'monthly', owner: 'CFO', status: 'at-risk' },
          { name: 'Agency Staffing Cost Ratio', description: 'Agency labor cost as % of total labor expense', baselineValue: 18, targetValue: 8, currentValue: 18, unit: '%', frequency: 'monthly', owner: 'CHRO', status: 'at-risk' },
          { name: 'Value-Based Revenue Share', description: 'Percentage of net patient revenue from value-based contracts', baselineValue: 22, targetValue: 55, currentValue: 22, unit: '%', frequency: 'quarterly', owner: 'CFO', status: 'on-track' },
        ]},
        { perspective: 'financial', objective: 'Reduce Cost Per Episode', description: 'Improve care efficiency across high-volume DRGs through protocol standardization and care variation reduction', weight: 1.3, kpis: [
          { name: 'Cost Per Episode (Top 10 DRGs)', description: 'Average total cost per admission for top 10 DRGs vs peer benchmark', baselineValue: 112, targetValue: 92, currentValue: 112, unit: '% of benchmark', frequency: 'quarterly', owner: 'CMO', status: 'at-risk' },
          { name: '30-Day Readmission Rate', description: 'All-cause readmission within 30 days of discharge', baselineValue: 14.2, targetValue: 10.5, currentValue: 14.2, unit: '%', frequency: 'monthly', owner: 'CMO', status: 'at-risk' },
        ]},
        { perspective: 'customer', objective: 'Elevate Patient Experience', description: 'Deliver consistently excellent patient-centered care achieving top-decile HCAHPS scores across all service lines', weight: 1.4, kpis: [
          { name: 'HCAHPS Overall Rating', description: 'Percentage of patients rating hospital 9 or 10 out of 10', baselineValue: 68, targetValue: 82, currentValue: 68, unit: '%', frequency: 'monthly', owner: 'CNO', status: 'at-risk' },
          { name: 'Patient Net Promoter Score', description: 'Net Promoter Score across all care settings', baselineValue: 42, targetValue: 65, currentValue: 42, unit: 'NPS', frequency: 'quarterly', owner: 'Chief Patient Experience Officer', status: 'at-risk' },
        ]},
        { perspective: 'customer', objective: 'Expand Access and Health Equity', description: 'Remove barriers to care for underserved populations through telehealth, extended hours, and community health worker programs', weight: 1.3, kpis: [
          { name: 'Telehealth Visit Rate', description: 'Telehealth as percentage of total ambulatory visits', baselineValue: 12, targetValue: 35, currentValue: 12, unit: '%', frequency: 'monthly', owner: 'Chief Digital Officer', status: 'on-track' },
          { name: 'Health Disparity Index', description: 'Gap in clinical outcomes between highest and lowest income patient quartiles', baselineValue: 24, targetValue: 12, currentValue: 24, unit: 'index points', frequency: 'annually', owner: 'Chief Health Equity Officer', status: 'at-risk' },
        ]},
        { perspective: 'internal_process', objective: 'Optimize Clinical Quality and Safety', description: 'Achieve zero preventable harm events and top-quartile clinical quality metrics through evidence-based protocols and safety culture', weight: 1.5, kpis: [
          { name: 'Serious Safety Events', description: 'Preventable serious safety events per 10,000 patient days', baselineValue: 3.2, targetValue: 0.8, currentValue: 3.2, unit: 'events/10K days', frequency: 'monthly', owner: 'CNO', status: 'at-risk' },
          { name: 'Clinical Quality Composite Score', description: 'Weighted composite of core measure performance vs national benchmark', baselineValue: 72, targetValue: 90, currentValue: 72, unit: 'percentile', frequency: 'quarterly', owner: 'CMO', status: 'at-risk' },
          { name: 'Sepsis Bundle Compliance', description: 'Percentage of sepsis patients receiving 3-hour bundle within 1 hour', baselineValue: 61, targetValue: 85, currentValue: 61, unit: '%', frequency: 'monthly', owner: 'CMO', status: 'at-risk' },
        ]},
        { perspective: 'internal_process', objective: 'Streamline Operations and Reduce Waste', description: 'Apply lean methodology and AI tools to eliminate administrative burden, reduce wait times, and optimize OR and bed utilization', weight: 1.2, kpis: [
          { name: 'OR First Case On-Time Start', description: 'Percentage of first surgical cases starting on time', baselineValue: 62, targetValue: 85, currentValue: 62, unit: '%', frequency: 'monthly', owner: 'COO', status: 'at-risk' },
          { name: 'ED Door-to-Provider Time', description: 'Median minutes from ED arrival to provider evaluation', baselineValue: 38, targetValue: 20, currentValue: 38, unit: 'minutes', frequency: 'monthly', owner: 'COO', status: 'at-risk' },
        ]},
        { perspective: 'learning_growth', objective: 'Build a Resilient and Engaged Workforce', description: 'Recruit, develop, and retain top clinical talent through competitive compensation, career pathways, and wellbeing programs', weight: 1.4, kpis: [
          { name: 'Nurse Vacancy Rate', description: 'Percentage of budgeted RN positions currently vacant', baselineValue: 18, targetValue: 7, currentValue: 18, unit: '%', frequency: 'monthly', owner: 'CHRO', status: 'at-risk' },
          { name: 'Physician Engagement Score', description: 'Annual physician engagement survey percentile vs peer benchmark', baselineValue: 45, targetValue: 75, currentValue: 45, unit: 'percentile', frequency: 'annually', owner: 'CMO', status: 'at-risk' },
          { name: 'Annual Voluntary Turnover Rate', description: 'All-staff voluntary turnover rate', baselineValue: 22, targetValue: 12, currentValue: 22, unit: '%', frequency: 'quarterly', owner: 'CHRO', status: 'at-risk' },
        ]},
        { perspective: 'learning_growth', objective: 'Accelerate Digital Capability', description: 'Build organizational AI literacy, data analytics capability, and digital health innovation culture across all levels', weight: 1.2, kpis: [
          { name: 'Digital Health Literacy Score', description: 'Staff digital competency assessment score (100-point scale)', baselineValue: 42, targetValue: 75, currentValue: 42, unit: 'score', frequency: 'annually', owner: 'Chief Digital Officer', status: 'on-track' },
          { name: 'AI Use Cases Deployed', description: 'Number of clinical AI tools in active production use', baselineValue: 3, targetValue: 15, currentValue: 3, unit: 'tools', frequency: 'quarterly', owner: 'CIO', status: 'on-track' },
        ]},
      ],
    },
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
  },

  // ===== 2. TECHNOLOGY =====
  {
    id: 'tmpl-technology-scale',
    name: 'Technology Company Growth & Scale',
    description: 'Systems-based strategic framework for technology companies navigating product-market fit consolidation, platform scaling, and competitive moat building. Addresses reinforcing growth loops, innovation-execution tension, and talent ecosystem dynamics.',
    industry: 'technology',
    category: 'builtin',
    icon: 'Cpu',
    color: 'violet',
    tags: ['product-led growth', 'platform strategy', 'developer ecosystem', 'AI integration', 'SaaS scaling', 'technical debt'],
    usage_count: 1876,
    rating: 4.9,
    rating_count: 318,
    is_public: true,
    plan_data: {
      name: 'Technology Scale-Up Strategic Plan',
      organization: 'Technology Corporation',
      vision: 'To be the operating system of choice for the industries we serve — embedding our platform so deeply into customer workflows that we become indispensable infrastructure.',
      mission: 'To deliver relentlessly innovative software that eliminates complexity, scales with customers, and creates compounding value through data network effects.',
      strategicIntent: 'Grow ARR from $85M to $300M in 4 years by expanding platform depth, activating enterprise upmarket motion, and launching developer ecosystem generating 30% of net new ARR through partner-sourced deals.',
      swotItems: [
        { category: 'strength', description: 'Strong product-market fit with 125% net revenue retention and NPS of +58 in core SMB segment', impactScore: 5, likelihoodScore: 5 },
        { category: 'strength', description: 'Proprietary data network effect — platform value compounds as customer data volume grows, creating switching costs', impactScore: 5, likelihoodScore: 4 },
        { category: 'strength', description: 'Agile engineering culture with 2-week sprint cadence and best-in-class deployment frequency (15 releases/day)', impactScore: 4, likelihoodScore: 5 },
        { category: 'strength', description: 'Strong brand in core vertical with 68% of deals won on referral or organic search', impactScore: 4, likelihoodScore: 5 },
        { category: 'strength', description: 'Founder-led enterprise sales motion closing 7 deals over $500K ARR in past 12 months', impactScore: 4, likelihoodScore: 4 },
        { category: 'weakness', description: 'Accumulated technical debt in core platform — 35% of engineering sprint capacity consumed by maintenance', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'Thin enterprise feature set (SOC 2 Type II partial, no SSO/SAML, limited audit logging) blocking upmarket deals', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'Founder-dependent sales — no repeatable enterprise playbook; average enterprise sales cycle 8.4 months', impactScore: 4, likelihoodScore: 5 },
        { category: 'weakness', description: 'International presence minimal — only 8% of ARR from outside North America despite product suitability', impactScore: 4, likelihoodScore: 4 },
        { category: 'weakness', description: 'Customer success team under-resourced — 1 CSM per 185 accounts vs industry benchmark of 1:80', impactScore: 4, likelihoodScore: 5 },
        { category: 'opportunity', description: 'AI integration wave: customers willing to pay 40–60% premium for AI-native workflow features vs legacy tools', impactScore: 5, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Enterprise upmarket expansion: 1,200 enterprise-qualified accounts in CRM with no active outreach', impactScore: 5, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Developer ecosystem and API marketplace — platform-layer strategy to generate partner-sourced ARR', impactScore: 5, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Vertical SaaS consolidation: 3 complementary tools in adjacent space available for tuck-in acquisition at 4–6x ARR', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'EMEA market entry via channel partner program with 12 pre-qualified regional partners', impactScore: 4, likelihoodScore: 4 },
        { category: 'threat', description: 'Well-funded competitors ($200M+ raised) adding core product features, compressing price and NRR', impactScore: 5, likelihoodScore: 4 },
        { category: 'threat', description: 'Platform risk: dependency on AWS/Azure; single-cloud architecture creates uptime and pricing exposure', impactScore: 4, likelihoodScore: 3 },
        { category: 'threat', description: 'AI commoditization risk: LLM providers building directly into competing categories, collapsing feature differentiation', impactScore: 5, likelihoodScore: 4 },
        { category: 'threat', description: 'Talent war for senior engineers and ML specialists — 40% salary inflation vs 18 months ago in target geographies', impactScore: 4, likelihoodScore: 5 },
        { category: 'threat', description: 'Data privacy regulation: EU AI Act, GDPR enforcement, and state-level laws creating compliance complexity at scale', impactScore: 3, likelihoodScore: 5 },
      ],
      strategicOptions: [
        { optionType: 'SO', title: 'AI-Native Product Differentiation', description: 'Leverage engineering culture and data network effect to ship AI-native workflows competitors cannot replicate — embedding LLM capabilities into core product loops', priorityScore: 5, feasibilityScore: 5, selected: true },
        { optionType: 'SO', title: 'Enterprise Upmarket Motion', description: 'Use existing 7 enterprise reference customers and strong NPS to build repeatable enterprise sales playbook targeting $100K+ ACV deals', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'SO', title: 'Developer Ecosystem Launch', description: 'Capitalize on brand strength and deployment velocity to launch public API, marketplace, and partner program generating 30% partner-sourced ARR', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Technical Platform Modernization', description: 'Address technical debt strategically to prevent competitors from outpacing on reliability and performance while AI features require clean data architecture', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Multi-Cloud Resilience Architecture', description: 'Eliminate AWS single-cloud dependency through active-active multi-cloud to neutralize uptime and pricing threats', priorityScore: 3, feasibilityScore: 3, selected: false },
        { optionType: 'WO', title: 'Enterprise Readiness Completion', description: 'Urgently complete SOC 2 Type II, SSO/SAML, and RBAC to unlock blocked enterprise pipeline worth $12M ARR', priorityScore: 5, feasibilityScore: 5, selected: true },
        { optionType: 'WO', title: 'Customer Success Scaling', description: 'Triple CS team and deploy digital CS platform to reduce churn from 12% to 7% and drive expansion revenue', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'WT', title: 'International Channel Partner Program', description: 'Enter EMEA via pre-qualified channel partners to grow international ARR to 25% without enterprise-level investment', priorityScore: 4, feasibilityScore: 4, selected: true },
      ],
      objectives: [
        { perspective: 'financial', objective: 'Achieve Hyper-Growth ARR Trajectory', description: 'Grow ARR from $85M to $300M through expansion revenue, enterprise new business, and ecosystem-sourced deals', weight: 1.5, kpis: [
          { name: 'Annual Recurring Revenue (ARR)', description: 'Total ARR at end of period', baselineValue: 85, targetValue: 300, currentValue: 85, unit: '$M', frequency: 'monthly', owner: 'CFO', status: 'on-track' },
          { name: 'Net Revenue Retention (NRR)', description: 'Net revenue retention including expansion, contraction, and churn', baselineValue: 125, targetValue: 135, currentValue: 125, unit: '%', frequency: 'monthly', owner: 'Chief Customer Officer', status: 'on-track' },
          { name: 'Enterprise ARR Share', description: 'ARR from customers $100K+ ACV as % of total ARR', baselineValue: 18, targetValue: 45, currentValue: 18, unit: '%', frequency: 'quarterly', owner: 'CRO', status: 'at-risk' },
        ]},
        { perspective: 'financial', objective: 'Achieve Efficient Growth (Rule of 40)', description: 'Balance growth investment with improving unit economics to achieve Rule of 40 score and extend runway to profitability', weight: 1.3, kpis: [
          { name: 'Rule of 40 Score', description: 'Revenue growth rate + FCF margin', baselineValue: 28, targetValue: 42, currentValue: 28, unit: 'score', frequency: 'quarterly', owner: 'CFO', status: 'at-risk' },
          { name: 'CAC Payback Period', description: 'Months to recover customer acquisition cost', baselineValue: 18, targetValue: 12, currentValue: 18, unit: 'months', frequency: 'quarterly', owner: 'CRO', status: 'at-risk' },
        ]},
        { perspective: 'customer', objective: 'Drive Product Stickiness and Expansion', description: 'Increase platform depth and daily active usage to create switching costs and natural expansion pathways', weight: 1.4, kpis: [
          { name: 'Daily Active Users / Monthly Active Users', description: 'DAU/MAU ratio indicating product habituation', baselineValue: 42, targetValue: 65, currentValue: 42, unit: '%', frequency: 'weekly', owner: 'CPO', status: 'at-risk' },
          { name: 'Features Adopted Per Account', description: 'Average number of platform features used per customer account', baselineValue: 3.2, targetValue: 6.5, currentValue: 3.2, unit: 'features', frequency: 'monthly', owner: 'CPO', status: 'on-track' },
          { name: 'Customer Net Promoter Score', description: 'NPS across all customer segments', baselineValue: 58, targetValue: 70, currentValue: 58, unit: 'NPS', frequency: 'quarterly', owner: 'Chief Customer Officer', status: 'on-track' },
        ]},
        { perspective: 'customer', objective: 'Win and Retain Enterprise Accounts', description: 'Build the enterprise motion and customer success capacity to win, onboard, and grow strategic accounts', weight: 1.3, kpis: [
          { name: 'Enterprise Gross Logo Churn', description: 'Annual gross churn rate for $100K+ ACV accounts', baselineValue: 8, targetValue: 3, currentValue: 8, unit: '%', frequency: 'quarterly', owner: 'Chief Customer Officer', status: 'at-risk' },
          { name: 'Enterprise Win Rate', description: 'Competitive win rate in enterprise $100K+ ACV deals', baselineValue: 28, targetValue: 45, currentValue: 28, unit: '%', frequency: 'quarterly', owner: 'CRO', status: 'at-risk' },
        ]},
        { perspective: 'internal_process', objective: 'Accelerate AI-Driven Product Innovation', description: 'Ship AI-native features at a pace that competitors cannot match by leveraging proprietary data and engineering culture', weight: 1.5, kpis: [
          { name: 'AI Feature Adoption Rate', description: 'Percentage of active accounts using at least 1 AI feature', baselineValue: 8, targetValue: 60, currentValue: 8, unit: '%', frequency: 'monthly', owner: 'CPO', status: 'on-track' },
          { name: 'Time-to-Feature Delivery', description: 'Median days from feature spec-complete to production release', baselineValue: 42, targetValue: 21, currentValue: 42, unit: 'days', frequency: 'monthly', owner: 'CTO', status: 'at-risk' },
          { name: 'Technical Debt Ratio', description: 'Engineering sprint capacity consumed by tech debt vs new features', baselineValue: 35, targetValue: 15, currentValue: 35, unit: '%', frequency: 'monthly', owner: 'CTO', status: 'at-risk' },
        ]},
        { perspective: 'internal_process', objective: 'Scale Revenue Engine', description: 'Build repeatable, data-driven sales and marketing motions that scale efficiently without founder dependency', weight: 1.2, kpis: [
          { name: 'Pipeline Coverage Ratio', description: 'Qualified pipeline value vs quarterly ARR target', baselineValue: 2.8, targetValue: 4.0, currentValue: 2.8, unit: 'x', frequency: 'monthly', owner: 'CRO', status: 'at-risk' },
          { name: 'Partner-Sourced ARR %', description: 'Percentage of new ARR influenced or sourced by ecosystem partners', baselineValue: 4, targetValue: 30, currentValue: 4, unit: '%', frequency: 'quarterly', owner: 'VP Partnerships', status: 'on-track' },
        ]},
        { perspective: 'learning_growth', objective: 'Build World-Class Engineering Team', description: 'Attract, retain, and develop elite engineering talent in AI/ML, platform, and security domains', weight: 1.4, kpis: [
          { name: 'Engineering Offer Acceptance Rate', description: 'Percentage of engineering offers accepted', baselineValue: 58, targetValue: 80, currentValue: 58, unit: '%', frequency: 'quarterly', owner: 'CHRO', status: 'at-risk' },
          { name: 'Regrettable Engineering Attrition', description: 'Percentage of high-performer engineers leaving annually', baselineValue: 16, targetValue: 6, currentValue: 16, unit: '%', frequency: 'quarterly', owner: 'CHRO', status: 'at-risk' },
        ]},
        { perspective: 'learning_growth', objective: 'Foster Data-Driven Culture', description: 'Embed data literacy and experimentation mindset across product, sales, and customer success teams', weight: 1.1, kpis: [
          { name: 'A/B Tests Run Per Quarter', description: 'Number of product A/B experiments completed per quarter', baselineValue: 12, targetValue: 45, currentValue: 12, unit: 'tests', frequency: 'quarterly', owner: 'CPO', status: 'on-track' },
          { name: 'Data Literacy Assessment Score', description: 'Average data literacy score across all departments (100-point scale)', baselineValue: 48, targetValue: 78, currentValue: 48, unit: 'score', frequency: 'annually', owner: 'Chief Data Officer', status: 'on-track' },
        ]},
      ],
    },
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-04-05T00:00:00Z',
  },

  // ===== 3. EDUCATION =====
  {
    id: 'tmpl-education-transformation',
    name: 'Education Institution Strategic Transformation',
    description: 'Systems-based strategic framework for higher education institutions navigating enrollment decline, digital disruption, and employability demands. Addresses reinforcing loops between reputation, research output, and student outcomes while exposing enrollment-revenue balance risks.',
    industry: 'education',
    category: 'builtin',
    icon: 'GraduationCap',
    color: 'sky',
    tags: ['higher education', 'micro-credentials', 'industry partnerships', 'digital pedagogy', 'enrollment management', 'student outcomes'],
    usage_count: 943,
    rating: 4.7,
    rating_count: 142,
    is_public: true,
    plan_data: {
      name: 'Education Institution Strategic Transformation Plan',
      organization: 'Regional University System',
      vision: 'To develop critical thinkers and adaptive leaders equipped to thrive and contribute in a rapidly changing knowledge economy — making transformative education accessible to all.',
      mission: 'To provide rigorous, relevant, and responsive education that connects students to meaningful careers, advances knowledge through impactful research, and strengthens communities through engaged scholarship.',
      strategicIntent: 'Achieve 92% graduate employability, grow non-tuition revenue to 20% of budget, reduce curriculum cycle time to 6 months, and establish 5 industry co-design programs within 3 years through the Adaptive Learning and Employability Excellence framework.',
      swotItems: [
        { category: 'strength', description: 'Accredited research programs and research university designation with $28M in annual sponsored research', impactScore: 5, likelihoodScore: 5 },
        { category: 'strength', description: 'Experienced, credentialed faculty with tenure density providing academic quality and stability', impactScore: 4, likelihoodScore: 5 },
        { category: 'strength', description: 'Strong alumni network of 82,000 graduates and $145M endowment providing financial resilience and mentorship capital', impactScore: 4, likelihoodScore: 4 },
        { category: 'strength', description: 'Geographic market position as only comprehensive university within 90-mile radius serving region of 1.2M', impactScore: 5, likelihoodScore: 5 },
        { category: 'strength', description: 'Physical campus infrastructure with laboratories, clinics, and athletic facilities supporting diverse program delivery', impactScore: 3, likelihoodScore: 5 },
        { category: 'weakness', description: 'Rigid curriculum governance — average 18-month cycle from concept to course delivery preventing market responsiveness', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'Enrollment declining 12% over 5 years driven by demographic contraction and intensifying competition from online providers', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'High administrative overhead with cost-per-student 22% above sector median due to duplicated processes across colleges', impactScore: 4, likelihoodScore: 4 },
        { category: 'weakness', description: 'Low digital literacy among 45% of faculty — hybrid pedagogy adoption lagging peer institutions by 2+ years', impactScore: 4, likelihoodScore: 5 },
        { category: 'weakness', description: 'Weak industry-academia linkage — only 23% of programs have active industry advisory board and fewer than 10% of courses co-designed with employers', impactScore: 5, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Micro-credential and lifelong learning market growing 12% annually — estimated $166B global market by 2030', impactScore: 5, likelihoodScore: 5 },
        { category: 'opportunity', description: 'International student partnerships with 14 MOUs signed but only 3 active enrollment pipelines operational', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'AI-assisted personalized learning platforms enabling adaptive instruction at scale without proportional faculty cost', impactScore: 5, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Government workforce development funding (WIOA, Pell expansion) creating reimbursement for non-traditional learners', impactScore: 4, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Research commercialization — 12 patent-pending discoveries with licensing or spin-out potential in health tech and agri-tech', impactScore: 4, likelihoodScore: 3 },
        { category: 'threat', description: 'For-profit and online-only competitors (WGU, Coursera for Business, Udemy Business) offering equivalent credentials at 40-60% lower cost', impactScore: 5, likelihoodScore: 5 },
        { category: 'threat', description: 'Demographic cliff — 18-22 year-old cohort in service region declining 15% by 2030 based on K-12 enrollment projections', impactScore: 5, likelihoodScore: 5 },
        { category: 'threat', description: 'AI tools enabling employer-to-employee direct skill credentialing, potentially disintermediating traditional degrees for some roles', impactScore: 4, likelihoodScore: 4 },
        { category: 'threat', description: 'State funding volatility — per-student state appropriation declined 28% in real terms over past decade with further cuts proposed', impactScore: 5, likelihoodScore: 4 },
        { category: 'threat', description: 'Student loan regulation changes and rising debt aversion reducing willingness to finance graduate programs', impactScore: 4, likelihoodScore: 4 },
      ],
      strategicOptions: [
        { optionType: 'SO', title: 'Research Commercialization Engine', description: 'Leverage research reputation and patent portfolio to establish technology transfer office, spin-out fund, and industry research partnerships generating $5M+ annual revenue', priorityScore: 4, feasibilityScore: 3, selected: true },
        { optionType: 'SO', title: 'Regional Workforce Hub Strategy', description: 'Capitalize on geographic monopoly and alumni network to position university as the definitive regional workforce development partner, securing government and employer contracts', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Micro-Credential Portfolio Launch', description: 'Use faculty expertise to rapidly develop stackable credentials in high-demand fields, creating non-tuition revenue streams resilient to demographic decline', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Online Program Expansion', description: 'Counter online competitor growth by launching fully online degree-completion and graduate programs leveraging accreditation credibility online-only providers lack', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'Industry Co-Design Curriculum Reform', description: 'Address curriculum rigidity and employer alignment gaps by restructuring governance to embed industry advisory boards with co-design authority, reducing cycle to 6 months', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'Faculty Digital Upskilling Program', description: 'Overcome digital literacy weakness by leveraging AI-learning platform partnerships to train 80% of faculty in hybrid and online pedagogy within 18 months', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'WT', title: 'Non-Traditional Learner Recruitment', description: 'Counter enrollment decline by aggressively recruiting adult learners, career-changers, and employer-sponsored students using micro-credentials as entry point', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'WT', title: 'Administrative Consolidation Program', description: 'Reduce overhead ratio by consolidating duplicated administrative functions across colleges, funding reallocation to student-facing services', priorityScore: 4, feasibilityScore: 3, selected: false },
      ],
      objectives: [
        { perspective: 'financial', objective: 'Diversify Revenue and Reduce Tuition Dependency', description: 'Grow non-tuition revenue streams including micro-credentials, research commercialization, corporate training, and philanthropy to 20% of total revenue', weight: 1.4, kpis: [
          { name: 'Non-Tuition Revenue Share', description: 'Non-tuition revenue as % of total operating budget', baselineValue: 9, targetValue: 20, currentValue: 9, unit: '%', frequency: 'annually', owner: 'VP Finance', status: 'at-risk' },
          { name: 'Micro-Credential Revenue', description: 'Annual revenue from micro-credential and continuing education programs', baselineValue: 1.2, targetValue: 8.5, currentValue: 1.2, unit: '$M', frequency: 'quarterly', owner: 'Dean of Innovation', status: 'on-track' },
          { name: 'Research Commercialization Revenue', description: 'Annual revenue from licensing, contracts, and spin-out equity', baselineValue: 0.8, targetValue: 5.0, currentValue: 0.8, unit: '$M', frequency: 'annually', owner: 'VP Research', status: 'at-risk' },
        ]},
        { perspective: 'financial', objective: 'Achieve Administrative Cost Efficiency', description: 'Reduce cost-per-student through process digitization and administrative consolidation to redirect savings to student-facing investment', weight: 1.2, kpis: [
          { name: 'Cost Per Student (vs sector median)', description: 'Institutional cost per FTE student as % of sector median', baselineValue: 122, targetValue: 103, currentValue: 122, unit: '% of median', frequency: 'annually', owner: 'Provost', status: 'at-risk' },
          { name: 'Admin Process Digitization Rate', description: 'Percentage of core administrative processes fully digitized', baselineValue: 38, targetValue: 80, currentValue: 38, unit: '%', frequency: 'quarterly', owner: 'CIO', status: 'on-track' },
        ]},
        { perspective: 'customer', objective: 'Maximize Graduate Employability and Outcomes', description: 'Ensure graduates enter the workforce with the skills, credentials, and networks employers demand, achieving top-quartile outcomes data', weight: 1.5, kpis: [
          { name: 'Graduate Employment Rate (6 months)', description: 'Percentage of graduates employed or enrolled in further study within 6 months', baselineValue: 79, targetValue: 92, currentValue: 79, unit: '%', frequency: 'annually', owner: 'VP Student Affairs', status: 'at-risk' },
          { name: 'Graduate Earnings Premium', description: 'Median graduate salary vs regional median salary at 2 years post-graduation', baselineValue: 118, targetValue: 135, currentValue: 118, unit: '% of regional median', frequency: 'annually', owner: 'VP Academic Affairs', status: 'at-risk' },
          { name: 'Student Net Promoter Score', description: 'NPS of current students and recent graduates', baselineValue: 22, targetValue: 48, currentValue: 22, unit: 'NPS', frequency: 'semester', owner: 'VP Student Affairs', status: 'at-risk' },
        ]},
        { perspective: 'customer', objective: 'Grow Enrollment Through Market Diversification', description: 'Counter demographic decline by accessing new student markets — adult learners, international students, and employer-sponsored professionals', weight: 1.3, kpis: [
          { name: 'Total Headcount Enrollment', description: 'Total student headcount across all modalities and programs', baselineValue: 12400, targetValue: 13800, currentValue: 12400, unit: 'students', frequency: 'semester', owner: 'VP Enrollment Management', status: 'at-risk' },
          { name: 'Non-Traditional Learner Share', description: 'Percentage of enrollment from students over 25 or employer-sponsored', baselineValue: 18, targetValue: 32, currentValue: 18, unit: '%', frequency: 'annually', owner: 'VP Enrollment Management', status: 'on-track' },
          { name: 'Online Program Enrollment', description: 'Students enrolled in 100% online degree programs', baselineValue: 1200, targetValue: 3500, currentValue: 1200, unit: 'students', frequency: 'semester', owner: 'Dean of Online Learning', status: 'on-track' },
        ]},
        { perspective: 'internal_process', objective: 'Accelerate Curriculum Responsiveness', description: 'Redesign curriculum governance to enable rapid market-responsive program development and continuous industry alignment', weight: 1.5, kpis: [
          { name: 'Curriculum Development Cycle Time', description: 'Average months from program concept approval to first student enrollment', baselineValue: 18, targetValue: 6, currentValue: 18, unit: 'months', frequency: 'quarterly', owner: 'Provost', status: 'critical' },
          { name: 'Industry Co-Designed Programs', description: 'Number of programs with active industry co-design and advisory board governance', baselineValue: 2, targetValue: 15, currentValue: 2, unit: 'programs', frequency: 'annually', owner: 'VP Academic Affairs', status: 'on-track' },
          { name: 'Skills Alignment Index', description: 'Percentage of program learning outcomes mapped to top 50 employer-demanded skills', baselineValue: 31, targetValue: 80, currentValue: 31, unit: '%', frequency: 'annually', owner: 'Provost', status: 'at-risk' },
        ]},
        { perspective: 'internal_process', objective: 'Achieve Completion and Retention Excellence', description: 'Improve student retention and 6-year completion rates through early alert systems, financial aid optimization, and academic support scaling', weight: 1.3, kpis: [
          { name: '6-Year Graduation Rate', description: 'Percentage of first-time, full-time students completing degree within 6 years', baselineValue: 58, targetValue: 72, currentValue: 58, unit: '%', frequency: 'annually', owner: 'VP Academic Affairs', status: 'at-risk' },
          { name: 'First-Year Retention Rate', description: 'Percentage of first-year students returning for second year', baselineValue: 74, targetValue: 84, currentValue: 74, unit: '%', frequency: 'annually', owner: 'VP Student Affairs', status: 'at-risk' },
        ]},
        { perspective: 'learning_growth', objective: 'Build Faculty Digital and Pedagogical Excellence', description: 'Develop faculty capacity in hybrid learning design, AI-assisted pedagogy, and evidence-based teaching to elevate educational quality and online capability', weight: 1.3, kpis: [
          { name: 'Faculty Digital Readiness Score', description: 'Percentage of faculty meeting hybrid/online teaching competency standards', baselineValue: 34, targetValue: 80, currentValue: 34, unit: '%', frequency: 'annually', owner: 'Center for Teaching & Learning', status: 'critical' },
          { name: 'Hybrid Course Delivery Rate', description: 'Percentage of courses offered in hybrid or fully online format', baselineValue: 22, targetValue: 55, currentValue: 22, unit: '%', frequency: 'semester', owner: 'Provost', status: 'at-risk' },
        ]},
        { perspective: 'learning_growth', objective: 'Cultivate Innovation and Entrepreneurship Culture', description: 'Foster an institutional culture of experimentation, partnership, and entrepreneurship across faculty, staff, and students', weight: 1.1, kpis: [
          { name: 'Student Startup Launches', description: 'Student ventures launched via university incubator programs annually', baselineValue: 8, targetValue: 30, currentValue: 8, unit: 'ventures', frequency: 'annually', owner: 'VP Research & Innovation', status: 'on-track' },
          { name: 'Industry Partnership Revenue', description: 'Revenue from corporate training, research contracts, and consulting', baselineValue: 2.1, targetValue: 8.0, currentValue: 2.1, unit: '$M', frequency: 'annually', owner: 'VP Academic Affairs', status: 'at-risk' },
        ]},
      ],
    },
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-04-08T00:00:00Z',
  },

  // ===== 4. MANUFACTURING =====
  {
    id: 'tmpl-manufacturing-excellence',
    name: 'Manufacturing Operational Excellence & Industry 4.0',
    description: 'Comprehensive systems-based strategic framework for manufacturers navigating Industry 4.0 transformation, supply chain resilience, and sustainability mandates. Addresses lean-digital integration, workforce capability gaps, and competitive cost pressures through smart factory strategy.',
    industry: 'manufacturing',
    category: 'builtin',
    icon: 'Factory',
    color: 'amber',
    tags: ['Industry 4.0', 'lean manufacturing', 'supply chain resilience', 'smart factory', 'sustainability', 'workforce upskilling'],
    usage_count: 782,
    rating: 4.7,
    rating_count: 128,
    is_public: true,
    plan_data: {
      name: 'Manufacturing Excellence & Industry 4.0 Transformation',
      organization: 'Manufacturing Corporation',
      vision: 'To be recognized as the benchmark for operational excellence and sustainable manufacturing in our sector — a smart factory of the future built on precision, people, and innovation.',
      mission: 'To manufacture world-class products with zero defects, zero harm, and minimal environmental impact — delivering superior value to customers through continuous improvement and digital innovation.',
      strategicIntent: 'Achieve OEE of 85%+, reduce cost-of-poor-quality by 40%, cut Scope 1 & 2 emissions 35%, and digitize 70% of production processes within 4 years through the Smart Factory Transformation program.',
      swotItems: [
        { category: 'strength', description: 'ISO 9001 and IATF 16949 certified quality management systems with 22-year track record of quality excellence', impactScore: 5, likelihoodScore: 5 },
        { category: 'strength', description: 'Proprietary process know-how in precision machining — tolerances competitors cannot achieve without equivalent investment', impactScore: 5, likelihoodScore: 4 },
        { category: 'strength', description: 'Vertically integrated supply chain controlling 65% of critical inputs, reducing dependency and improving margin', impactScore: 4, likelihoodScore: 5 },
        { category: 'strength', description: 'Long-term OEM customer relationships averaging 14 years with renewal rates above 90%', impactScore: 5, likelihoodScore: 5 },
        { category: 'strength', description: 'Strong Kaizen culture and lean foundation — 6,200 improvement suggestions implemented in past 3 years', impactScore: 4, likelihoodScore: 5 },
        { category: 'weakness', description: 'Aging equipment base — 38% of CNC assets beyond economic life, creating maintenance drag and quality variability', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'OEE (Overall Equipment Effectiveness) at 67% — 18 points below world-class benchmark of 85%', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'Digital connectivity gap — 72% of production assets lack IoT sensors or real-time monitoring capability', impactScore: 4, likelihoodScore: 5 },
        { category: 'weakness', description: 'Workforce aging profile — 34% of skilled trades within 5 years of retirement with thin apprenticeship pipeline', impactScore: 5, likelihoodScore: 4 },
        { category: 'weakness', description: 'Siloed ERP and MES systems preventing end-to-end production visibility and predictive maintenance capability', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Industry 4.0 technology cost reduction — IoT sensor costs down 85% since 2015, making retrofitting economically viable', impactScore: 5, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Nearshoring and reshoring wave — OEM customers actively seeking domestic supply chain resilience partners', impactScore: 5, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Green manufacturing premium — customers willing to pay 8-12% premium for verified low-carbon products', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Additive manufacturing and advanced materials enabling new product geometries and weight reduction for aerospace and EV customers', impactScore: 4, likelihoodScore: 3 },
        { category: 'opportunity', description: 'Government manufacturing incentives — CHIPS Act, IRA credits, and state-level capex grants offsetting upgrade investment', impactScore: 4, likelihoodScore: 4 },
        { category: 'threat', description: 'Low-cost country competition with 30-45% labor cost advantage in commodity segments', impactScore: 5, likelihoodScore: 5 },
        { category: 'threat', description: 'Raw material price volatility — steel, aluminum, and rare earth inputs with 40%+ price swings annually', impactScore: 4, likelihoodScore: 5 },
        { category: 'threat', description: 'Customer EV transition reducing demand for traditional ICE components while requiring new EV-specific capabilities', impactScore: 5, likelihoodScore: 4 },
        { category: 'threat', description: 'Cybersecurity exposure — OT/IT convergence creating new attack surface with catastrophic production disruption risk', impactScore: 4, likelihoodScore: 4 },
        { category: 'threat', description: 'Carbon border adjustment mechanisms (CBAM) and scope 3 emission reporting requirements from major OEM customers', impactScore: 4, likelihoodScore: 4 },
      ],
      strategicOptions: [
        { optionType: 'SO', title: 'Smart Factory Digital Transformation', description: 'Leverage Kaizen culture and quality reputation to deploy IIoT, real-time MES, and AI-driven quality control — positioning as Industry 4.0 showcase for OEM partners', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'SO', title: 'Nearshoring Partner Positioning', description: 'Use vertical integration and long customer relationships to win reshoring contracts from OEMs exiting China supply chains', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Critical Equipment Replacement Program', description: 'Systematically retire 38% of aged assets, using government capex incentives to fund modern CNC and automation reducing labor cost gap with LCC competitors', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Green Manufacturing Certification', description: 'Achieve ISO 14064 carbon verification and Science Based Targets commitment to win premium pricing from sustainability-mandated OEM customers', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'ERP/MES System Integration', description: 'Integrate siloed systems into unified digital thread from customer order to shipment — enabling end-to-end visibility and unlocking predictive maintenance', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'Apprenticeship and Trades Pipeline', description: 'Address workforce aging crisis using reshoring opportunity narrative to attract young talent through apprenticeship, community college partnerships, and employer branding', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'WT', title: 'EV Product Portfolio Development', description: 'Invest in EV-adjacent capabilities (battery enclosures, thermal management, lightweight structures) to offset ICE volume decline before it becomes existential', priorityScore: 4, feasibilityScore: 3, selected: true },
        { optionType: 'WT', title: 'OT Cybersecurity Hardening', description: 'Implement OT/IT network segmentation, anomaly detection, and incident response to protect production continuity from escalating cyberattack risk', priorityScore: 4, feasibilityScore: 4, selected: false },
      ],
      objectives: [
        { perspective: 'financial', objective: 'Improve Gross Margin Through Operational Efficiency', description: 'Reduce cost-of-goods-sold through OEE improvement, scrap reduction, and automation offsetting labor and material cost inflation', weight: 1.5, kpis: [
          { name: 'Gross Margin', description: 'Gross profit as percentage of net revenue', baselineValue: 24, targetValue: 32, currentValue: 24, unit: '%', frequency: 'monthly', owner: 'CFO', status: 'at-risk' },
          { name: 'Cost of Poor Quality (COPQ)', description: 'Total cost of internal and external quality failures as % of revenue', baselineValue: 4.8, targetValue: 2.2, currentValue: 4.8, unit: '% revenue', frequency: 'monthly', owner: 'VP Quality', status: 'at-risk' },
          { name: 'Labor Cost Per Unit', description: 'Direct labor cost per unit produced vs prior year benchmark', baselineValue: 100, targetValue: 78, currentValue: 100, unit: 'index', frequency: 'monthly', owner: 'VP Operations', status: 'at-risk' },
        ]},
        { perspective: 'financial', objective: 'Grow Revenue Through New Capability and Markets', description: 'Win reshoring contracts and develop EV-adjacent product lines to diversify revenue and reduce ICE dependency', weight: 1.3, kpis: [
          { name: 'Reshoring Contract Revenue', description: 'Annual revenue from newly won domestic reshoring contracts', baselineValue: 8, targetValue: 35, currentValue: 8, unit: '$M', frequency: 'quarterly', owner: 'VP Sales', status: 'on-track' },
          { name: 'EV Product Revenue Share', description: 'Revenue from EV-adjacent products as % of total revenue', baselineValue: 3, targetValue: 20, currentValue: 3, unit: '%', frequency: 'annually', owner: 'VP Product Development', status: 'at-risk' },
        ]},
        { perspective: 'customer', objective: 'Achieve Delivery and Quality Excellence', description: 'Meet or exceed customer expectations on delivery, quality, and responsiveness to become preferred sole-source supplier', weight: 1.5, kpis: [
          { name: 'On-Time Delivery Rate', description: 'Percentage of customer orders delivered on agreed date', baselineValue: 87, targetValue: 98, currentValue: 87, unit: '%', frequency: 'monthly', owner: 'VP Operations', status: 'at-risk' },
          { name: 'Customer PPM (Parts Per Million defects)', description: 'Customer-reported defective parts per million shipped', baselineValue: 245, targetValue: 25, currentValue: 245, unit: 'PPM', frequency: 'monthly', owner: 'VP Quality', status: 'at-risk' },
          { name: 'Customer Satisfaction Score', description: 'Annual customer satisfaction rating (1-10) across key OEM accounts', baselineValue: 7.2, targetValue: 9.0, currentValue: 7.2, unit: 'score', frequency: 'annually', owner: 'VP Sales', status: 'at-risk' },
        ]},
        { perspective: 'customer', objective: 'Earn Green Manufacturing Recognition', description: 'Achieve sustainability certifications and validated carbon reporting to meet OEM customer sustainability mandates and earn premium positioning', weight: 1.2, kpis: [
          { name: 'ISO 14064 Certification Status', description: 'Achievement of carbon inventory verification (milestone)', baselineValue: 0, targetValue: 1, currentValue: 0, unit: 'certified', frequency: 'annually', owner: 'VP Sustainability', status: 'on-track' },
          { name: 'OEM Sustainability Scorecard Rating', description: 'Average sustainability rating across top 5 OEM customer scorecards', baselineValue: 62, targetValue: 88, currentValue: 62, unit: 'score', frequency: 'annually', owner: 'VP Sustainability', status: 'at-risk' },
        ]},
        { perspective: 'internal_process', objective: 'Achieve World-Class Equipment Effectiveness', description: 'Deploy smart factory technologies and disciplined maintenance programs to reach 85% OEE across all critical production assets', weight: 1.5, kpis: [
          { name: 'Overall Equipment Effectiveness (OEE)', description: 'Composite measure of availability, performance, and quality', baselineValue: 67, targetValue: 85, currentValue: 67, unit: '%', frequency: 'weekly', owner: 'VP Operations', status: 'at-risk' },
          { name: 'Unplanned Downtime Rate', description: 'Unplanned downtime as % of scheduled production time', baselineValue: 12, targetValue: 3, currentValue: 12, unit: '%', frequency: 'weekly', owner: 'VP Maintenance', status: 'at-risk' },
          { name: 'IIoT Asset Connectivity Rate', description: 'Percentage of critical production assets connected to real-time monitoring', baselineValue: 28, targetValue: 90, currentValue: 28, unit: '%', frequency: 'quarterly', owner: 'CTO', status: 'at-risk' },
        ]},
        { perspective: 'internal_process', objective: 'Reduce Scope 1 & 2 Emissions', description: 'Execute energy efficiency, renewable energy, and process decarbonization to achieve Science Based Targets and reduce carbon cost exposure', weight: 1.3, kpis: [
          { name: 'Scope 1 & 2 Carbon Intensity', description: 'tCO₂e per million USD of revenue', baselineValue: 84, targetValue: 55, currentValue: 84, unit: 'tCO₂e/$M', frequency: 'quarterly', owner: 'VP Sustainability', status: 'at-risk' },
          { name: 'Renewable Energy Share', description: 'Percentage of electricity from verified renewable sources', baselineValue: 12, targetValue: 60, currentValue: 12, unit: '%', frequency: 'quarterly', owner: 'VP Facilities', status: 'at-risk' },
        ]},
        { perspective: 'learning_growth', objective: 'Build Digital Manufacturing Workforce', description: 'Develop trades apprenticeship pipeline and upskill existing workforce in automation, data analytics, and CNC programming for smart factory operations', weight: 1.4, kpis: [
          { name: 'Apprenticeship Enrollment', description: 'Number of active registered apprentices in trades programs', baselineValue: 18, targetValue: 75, currentValue: 18, unit: 'apprentices', frequency: 'quarterly', owner: 'CHRO', status: 'on-track' },
          { name: 'Workforce Digital Skills Certification', description: 'Percentage of production workforce with Industry 4.0 skills certification', baselineValue: 8, targetValue: 65, currentValue: 8, unit: '%', frequency: 'annually', owner: 'CHRO', status: 'at-risk' },
          { name: 'Internal Promotion Rate', description: 'Percentage of supervisor and above positions filled internally', baselineValue: 48, targetValue: 72, currentValue: 48, unit: '%', frequency: 'annually', owner: 'CHRO', status: 'on-track' },
        ]},
        { perspective: 'learning_growth', objective: 'Embed Continuous Improvement and Innovation Culture', description: 'Sustain and advance Kaizen culture while adding digital innovation capability to drive ongoing efficiency and product development breakthroughs', weight: 1.2, kpis: [
          { name: 'Kaizen Ideas Implemented Per Employee', description: 'Average improvement ideas implemented per employee per year', baselineValue: 4.2, targetValue: 8.0, currentValue: 4.2, unit: 'ideas/employee', frequency: 'annually', owner: 'VP Operations', status: 'on-track' },
          { name: 'Innovation Investment Rate', description: 'R&D and technology investment as % of revenue', baselineValue: 1.8, targetValue: 3.5, currentValue: 1.8, unit: '%', frequency: 'annually', owner: 'CFO', status: 'at-risk' },
        ]},
      ],
    },
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-04-10T00:00:00Z',
  },

  // ===== 5. NON-PROFIT =====
  {
    id: 'tmpl-nonprofit-impact',
    name: 'Non-Profit Mission Impact & Sustainability',
    description: 'Systems-based strategic framework for mission-driven organizations navigating funding diversification, impact measurement, and organizational sustainability. Addresses reinforcing loops between program outcomes, donor confidence, and mission capacity while managing grant dependency risks.',
    industry: 'nonprofit',
    category: 'builtin',
    icon: 'Heart',
    color: 'pink',
    tags: ['impact measurement', 'funding diversification', 'theory of change', 'community outcomes', 'donor stewardship', 'social enterprise'],
    usage_count: 621,
    rating: 4.6,
    rating_count: 98,
    is_public: true,
    plan_data: {
      name: 'Non-Profit Mission Impact & Sustainability Strategic Plan',
      organization: 'Community Impact Organization',
      vision: 'A community where every person has the opportunity, resources, and support to achieve their full potential — free from the barriers of poverty, inequity, and systemic disadvantage.',
      mission: 'To transform lives and strengthen communities through evidence-based programs, collaborative advocacy, and sustainable investment in human potential.',
      strategicIntent: 'Achieve measurable impact for 25,000 community members annually, diversify revenue to 45% non-grant sources, scale 3 evidence-based programs to new geographies, and reduce single-donor dependency below 15% within 3 years.',
      swotItems: [
        { category: 'strength', description: 'Deep community trust built over 28 years with 94% participant satisfaction and strong neighborhood presence', impactScore: 5, likelihoodScore: 5 },
        { category: 'strength', description: 'Evidence-based program models with peer-reviewed outcome studies demonstrating cost-per-outcome advantages', impactScore: 5, likelihoodScore: 4 },
        { category: 'strength', description: 'Dedicated staff of 45 with average 7-year tenure and exceptional mission alignment reducing turnover costs', impactScore: 4, likelihoodScore: 5 },
        { category: 'strength', description: 'Board of 18 with combined professional networks reaching 4,000+ individual donors and corporate partners', impactScore: 4, likelihoodScore: 4 },
        { category: 'strength', description: 'Strong local government relationships with designated YWCA/backbone organization status in county collective impact table', impactScore: 4, likelihoodScore: 4 },
        { category: 'weakness', description: 'Excessive grant dependency — top 2 foundation grants represent 48% of total operating revenue creating mission vulnerability', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'Underdeveloped impact measurement infrastructure — program data tracked in spreadsheets, no unified database or outcomes framework', impactScore: 5, likelihoodScore: 4 },
        { category: 'weakness', description: 'Limited individual donor cultivation — major gift program reaching only 42 donors vs capacity for 300+', impactScore: 4, likelihoodScore: 5 },
        { category: 'weakness', description: 'Founder-dependent leadership with succession planning incomplete and organizational knowledge highly centralized', impactScore: 4, likelihoodScore: 4 },
        { category: 'weakness', description: 'Technology infrastructure outdated — donor CRM, case management, and financial systems not integrated, limiting reporting efficiency', impactScore: 3, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Corporate ESG and social impact investment surge — $8T in corporate giving projected by 2027 seeking outcome-measured partners', impactScore: 5, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Government social services outsourcing — local and state agencies seeking community-based organizations for direct service delivery contracts', impactScore: 5, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Social enterprise and earned revenue models enabling mission-aligned business activities generating unrestricted income', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Collective impact funding — backbone organization role in county coalition provides access to multi-year systems-change grants', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Digital program delivery expanding geographic reach without proportional cost increase for certain curriculum-based programs', impactScore: 4, likelihoodScore: 4 },
        { category: 'threat', description: 'Government human services funding cuts under fiscal consolidation scenario affecting contracted and indirectly funded programs', impactScore: 5, likelihoodScore: 4 },
        { category: 'threat', description: 'Philanthropic fatigue and cause competition — donors facing increasingly crowded appeals marketplace reducing response rates', impactScore: 4, likelihoodScore: 4 },
        { category: 'threat', description: 'Economic recession risk reducing individual giving, corporate sponsorship, and foundation endowment distributions simultaneously', impactScore: 4, likelihoodScore: 3 },
        { category: 'threat', description: 'Staff compensation competition from government and corporate sector creating retention risk for specialized program staff', impactScore: 4, likelihoodScore: 5 },
        { category: 'threat', description: 'Community needs escalation outpacing resource growth — widening gap between demand and service capacity', impactScore: 4, likelihoodScore: 5 },
      ],
      strategicOptions: [
        { optionType: 'SO', title: 'Evidence-Based Program Scaling', description: 'Leverage peer-reviewed outcomes data and community trust to pursue multi-year scaling grants and government service contracts for proven program models', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'SO', title: 'Corporate Partnership Development', description: 'Use community relationships and evidence base to attract corporate ESG partners seeking verified social impact — transitioning from gifts to multi-year strategic partnerships', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Revenue Diversification Initiative', description: 'Address grant dependency risk by systematically building individual major gifts, earned revenue, and endowment to reduce any single source below 20% of revenue', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Collective Impact Leadership', description: 'Leverage backbone organization status to secure multi-year systems-change funding while building resilience through coalition resource sharing', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'Impact Data Infrastructure Build-out', description: 'Modernize data systems to produce real-time outcome dashboards attracting outcome-focused corporate and government funders requiring verified impact data', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'Major Gift Program Scale-up', description: 'Invest in frontline fundraising capacity to cultivate donor pipeline from 42 to 300+ major donors using evidence-based stewardship and impact reporting', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'WT', title: 'Leadership Succession Planning', description: 'Address founder dependency risk through intentional succession planning, distributed leadership development, and institutional knowledge documentation', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'WT', title: 'Social Enterprise Launch', description: 'Develop mission-aligned earned revenue through social enterprise (workforce training placement fees, consulting, facility rental) generating unrestricted operating income', priorityScore: 4, feasibilityScore: 3, selected: false },
      ],
      objectives: [
        { perspective: 'financial', objective: 'Achieve Financial Resilience Through Diversification', description: 'Reduce grant dependency and build diverse revenue portfolio ensuring organizational sustainability through funding cycles', weight: 1.5, kpis: [
          { name: 'Grant Revenue Concentration', description: 'Revenue from top 2 grants as % of total operating revenue', baselineValue: 48, targetValue: 20, currentValue: 48, unit: '%', frequency: 'annually', owner: 'CFO', status: 'at-risk' },
          { name: 'Individual Giving Revenue', description: 'Total annual revenue from individual donors', baselineValue: 0.8, targetValue: 2.8, currentValue: 0.8, unit: '$M', frequency: 'quarterly', owner: 'VP Development', status: 'at-risk' },
          { name: 'Operating Reserves Ratio', description: 'Months of operating expenses held in unrestricted reserves', baselineValue: 1.8, targetValue: 4.0, currentValue: 1.8, unit: 'months', frequency: 'quarterly', owner: 'CFO', status: 'at-risk' },
        ]},
        { perspective: 'financial', objective: 'Grow Earned and Corporate Revenue', description: 'Develop social enterprise and strategic corporate partnership income generating unrestricted funding for mission delivery', weight: 1.2, kpis: [
          { name: 'Corporate Partnership Revenue', description: 'Annual revenue from strategic corporate partnerships', baselineValue: 320, targetValue: 1200, currentValue: 320, unit: '$K', frequency: 'quarterly', owner: 'VP Development', status: 'on-track' },
          { name: 'Government Contract Revenue', description: 'Revenue from local and state government service delivery contracts', baselineValue: 0.5, targetValue: 2.0, currentValue: 0.5, unit: '$M', frequency: 'annually', owner: 'Executive Director', status: 'at-risk' },
        ]},
        { perspective: 'customer', objective: 'Maximize Mission Impact at Scale', description: 'Deliver measurable, evidence-based outcomes for growing numbers of community members across all program areas', weight: 1.5, kpis: [
          { name: 'Annual Participants Served', description: 'Unduplicated individuals receiving direct program services annually', baselineValue: 14200, targetValue: 25000, currentValue: 14200, unit: 'participants', frequency: 'quarterly', owner: 'VP Programs', status: 'on-track' },
          { name: 'Positive Outcome Achievement Rate', description: 'Percentage of participants achieving defined program outcome within 12 months', baselineValue: 68, targetValue: 82, currentValue: 68, unit: '%', frequency: 'quarterly', owner: 'VP Programs', status: 'at-risk' },
          { name: 'Participant Satisfaction Score', description: 'Participant satisfaction with services received (1-10 scale)', baselineValue: 8.4, targetValue: 9.2, currentValue: 8.4, unit: 'score', frequency: 'quarterly', owner: 'VP Programs', status: 'on-track' },
        ]},
        { perspective: 'customer', objective: 'Deepen Donor and Partner Engagement', description: 'Build long-term relationships with funders, partners, and volunteers who are deeply connected to mission impact and organizational community', weight: 1.3, kpis: [
          { name: 'Donor Retention Rate', description: 'Percentage of prior-year donors giving again in current year', baselineValue: 58, targetValue: 72, currentValue: 58, unit: '%', frequency: 'annually', owner: 'VP Development', status: 'at-risk' },
          { name: 'Major Gift Donor Count ($10K+)', description: 'Number of active donors giving $10,000 or more annually', baselineValue: 42, targetValue: 120, currentValue: 42, unit: 'donors', frequency: 'annually', owner: 'VP Development', status: 'at-risk' },
        ]},
        { perspective: 'internal_process', objective: 'Build World-Class Impact Measurement Capability', description: 'Deploy integrated data systems and outcome measurement frameworks enabling real-time program performance monitoring and funder-grade impact reporting', weight: 1.5, kpis: [
          { name: 'Real-Time Outcome Dashboard Coverage', description: 'Percentage of programs with real-time outcome data available in dashboard', baselineValue: 10, targetValue: 85, currentValue: 10, unit: '%', frequency: 'quarterly', owner: 'Director of Impact', status: 'at-risk' },
          { name: 'Data Collection Completeness Rate', description: 'Percentage of required participant data fields completed at 30 days', baselineValue: 54, targetValue: 90, currentValue: 54, unit: '%', frequency: 'monthly', owner: 'Director of Impact', status: 'at-risk' },
          { name: 'Impact Reports Published', description: 'Annual and quarterly stakeholder impact reports produced and distributed', baselineValue: 1, targetValue: 5, currentValue: 1, unit: 'reports/year', frequency: 'quarterly', owner: 'Communications Director', status: 'on-track' },
        ]},
        { perspective: 'internal_process', objective: 'Scale Program Delivery Excellence', description: 'Standardize and replicate high-performing program models while maintaining quality and cultural responsiveness at greater scale', weight: 1.3, kpis: [
          { name: 'Program Fidelity Score', description: 'Adherence to evidence-based program model elements (100-point scale)', baselineValue: 72, targetValue: 92, currentValue: 72, unit: 'score', frequency: 'quarterly', owner: 'VP Programs', status: 'at-risk' },
          { name: 'New Site Launches', description: 'Number of new program sites or service delivery locations activated', baselineValue: 0, targetValue: 4, currentValue: 0, unit: 'sites', frequency: 'annually', owner: 'VP Programs', status: 'on-track' },
        ]},
        { perspective: 'learning_growth', objective: 'Develop Mission-Driven Leadership Bench', description: 'Build leadership depth, succession readiness, and distributed decision-making capacity to sustain mission through leadership transitions', weight: 1.4, kpis: [
          { name: 'Succession Plan Completion', description: 'Percentage of senior leadership positions with documented succession and development plan', baselineValue: 20, targetValue: 100, currentValue: 20, unit: '%', frequency: 'annually', owner: 'Executive Director', status: 'at-risk' },
          { name: 'Staff Promotion Rate', description: 'Percentage of open positions filled by internal promotion', baselineValue: 32, targetValue: 60, currentValue: 32, unit: '%', frequency: 'annually', owner: 'HR Director', status: 'at-risk' },
          { name: 'Annual Staff Turnover Rate', description: 'Voluntary staff separation rate', baselineValue: 18, targetValue: 10, currentValue: 18, unit: '%', frequency: 'annually', owner: 'HR Director', status: 'at-risk' },
        ]},
        { perspective: 'learning_growth', objective: 'Build Organizational Learning and Adaptive Capacity', description: 'Foster culture of continuous learning, community listening, and evidence-informed program adaptation to remain effective as community needs evolve', weight: 1.1, kpis: [
          { name: 'Community Needs Assessments Conducted', description: 'Annual formal community needs assessment cycles completed', baselineValue: 1, targetValue: 2, currentValue: 1, unit: 'assessments', frequency: 'annually', owner: 'Director of Impact', status: 'on-track' },
          { name: 'Program Adaptations Based on Data', description: 'Number of evidence-informed program modifications implemented annually', baselineValue: 3, targetValue: 12, currentValue: 3, unit: 'adaptations', frequency: 'annually', owner: 'VP Programs', status: 'on-track' },
        ]},
      ],
    },
    created_at: '2026-02-10T00:00:00Z',
    updated_at: '2026-04-10T00:00:00Z',
  },

  // ===== 6. RETAIL =====
  {
    id: 'tmpl-retail-omnichannel',
    name: 'Retail Omnichannel & Customer Experience Transformation',
    description: 'Systems-based strategic framework for retailers navigating e-commerce disruption, margin compression, and shifting consumer expectations. Addresses unified commerce integration, last-mile logistics, and loyalty ecosystem dynamics through customer lifetime value growth strategy.',
    industry: 'retail',
    category: 'builtin',
    icon: 'ShoppingBag',
    color: 'orange',
    tags: ['omnichannel', 'customer lifetime value', 'last-mile logistics', 'personalization', 'private label', 'unified commerce'],
    usage_count: 835,
    rating: 4.6,
    rating_count: 132,
    is_public: true,
    plan_data: {
      name: 'Retail Omnichannel Transformation Strategic Plan',
      organization: 'Multi-Format Retail Corporation',
      vision: 'To be our customers\' most loved retailer — the one they trust for discovery, value, and delight across every channel they choose to shop.',
      mission: 'To create joyful, seamless shopping experiences that deliver genuine value, build lasting customer relationships, and support the communities and suppliers in our ecosystem.',
      strategicIntent: 'Grow Customer Lifetime Value by 35%, achieve 28% digital revenue share, expand private label to 30% of GMV, and reduce last-mile delivery cost by 22% within 3 years through the Unified Commerce Growth strategy.',
      swotItems: [
        { category: 'strength', description: 'Established store network of 340 locations with strong real estate positions in high-traffic suburban corridors', impactScore: 4, likelihoodScore: 5 },
        { category: 'strength', description: '12M loyalty program members with rich purchase history data enabling personalization at scale', impactScore: 5, likelihoodScore: 5 },
        { category: 'strength', description: 'Private label portfolio generating 24% gross margins vs 18% branded — significant competitive moat', impactScore: 4, likelihoodScore: 5 },
        { category: 'strength', description: 'Supply chain relationships with 1,200 domestic suppliers supporting fast replenishment and exclusive products', impactScore: 4, likelihoodScore: 4 },
        { category: 'strength', description: 'Strong brand recognition and heritage in core categories with aided awareness above 85% in served markets', impactScore: 4, likelihoodScore: 5 },
        { category: 'weakness', description: 'E-commerce share at only 14% of revenue vs category benchmark of 28% — significant digital revenue gap', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'Siloed channel operations — separate inventory pools for store and online creating out-of-stocks and markdown waste', impactScore: 5, likelihoodScore: 4 },
        { category: 'weakness', description: 'Last-mile fulfillment costs at 18% of digital revenue vs 12% target — margin destruction on growing e-commerce volume', impactScore: 4, likelihoodScore: 5 },
        { category: 'weakness', description: 'Store associate engagement scores 35th percentile — high turnover (42% annual) creating inconsistent customer experience', impactScore: 4, likelihoodScore: 5 },
        { category: 'weakness', description: 'Technology infrastructure fragmented — 8 separate POS systems, no unified customer profile across channels', impactScore: 5, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Retail media network monetization — first-party data from 12M loyalty members creates $80M+ annual ad revenue opportunity', impactScore: 5, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Same-day delivery demand growth — 64% of consumers pay premium for 2-hour delivery, enabling price recovery on fulfillment cost', impactScore: 4, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Social commerce and live shopping — 18-35 demographic spending 3.4 hours/day on social platforms increasingly open to in-feed purchasing', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Store-as-fulfillment-hub strategy converting 340 stores into micro-fulfillment centers for sub-2-hour delivery economics', impactScore: 5, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Personalization maturity — AI recommendation engines proven to lift basket size 18-32% in A/B tests across comparable retailers', impactScore: 5, likelihoodScore: 5 },
        { category: 'threat', description: 'Amazon, Walmart, and Target with superior logistics infrastructure, AI capability, and pricing power in key categories', impactScore: 5, likelihoodScore: 5 },
        { category: 'threat', description: 'D2C brand emergence cutting out retail middlemen in high-margin categories — specialty brands growing 28% vs retail channel flat', impactScore: 4, likelihoodScore: 5 },
        { category: 'threat', description: 'Consumer price sensitivity at multi-year highs — brand loyalty eroding as economic pressure increases trade-down behavior', impactScore: 4, likelihoodScore: 5 },
        { category: 'threat', description: 'Shrink and theft escalation — organized retail crime increasing shrink from 1.4% to 2.3% of revenue in past 2 years', impactScore: 4, likelihoodScore: 4 },
        { category: 'threat', description: 'Supply chain tariff exposure — 34% of COGS from tariff-exposed import categories with further escalation risk', impactScore: 4, likelihoodScore: 4 },
      ],
      strategicOptions: [
        { optionType: 'SO', title: 'Retail Media Network Launch', description: 'Monetize 12M loyalty member first-party data through retail media advertising platform generating $80M+ high-margin revenue from brand partners', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'SO', title: 'AI Personalization Engine Deployment', description: 'Apply loyalty data to AI recommendation engine lifting basket size and conversion — targeted CLV growth of 35% within 24 months', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'SO', title: 'Private Label Expansion', description: 'Leverage supplier relationships and margin advantage to grow private label to 30% of GMV in underperforming categories', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Store-as-Hub Fulfillment Network', description: 'Convert 200 highest-volume stores into micro-fulfillment hubs enabling sub-2-hour delivery economics that Amazon cannot replicate with central DCs', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Unified Commerce Platform Implementation', description: 'Eliminate channel silos with single inventory, single customer profile, and consistent experience to compete with omnichannel leaders', priorityScore: 5, feasibilityScore: 3, selected: true },
        { optionType: 'WO', title: 'Social Commerce and Live Shopping', description: 'Bridge digital revenue gap by building social commerce capability targeting 18-35 demographic spending on TikTok Shop and Instagram Commerce', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'Store Associate Experience Redesign', description: 'Combat turnover and experience inconsistency by redesigning associate role with technology-assisted tools, performance incentives, and career pathways', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'WT', title: 'Tariff Resilience and Domestic Sourcing', description: 'Reduce tariff exposure and D2C threat by accelerating domestic supplier development and private label sourcing diversification', priorityScore: 4, feasibilityScore: 3, selected: false },
      ],
      objectives: [
        { perspective: 'financial', objective: 'Grow Total Revenue and Improve Margin Mix', description: 'Accelerate total revenue growth through digital channel expansion, retail media, and private label while improving gross margin mix', weight: 1.5, kpis: [
          { name: 'Total Revenue Growth Rate', description: 'Year-over-year total net revenue growth', baselineValue: 3.2, targetValue: 8.5, currentValue: 3.2, unit: '%', frequency: 'monthly', owner: 'CFO', status: 'at-risk' },
          { name: 'Digital Revenue Share', description: 'E-commerce and digital channel as % of total net revenue', baselineValue: 14, targetValue: 28, currentValue: 14, unit: '%', frequency: 'monthly', owner: 'Chief Digital Officer', status: 'on-track' },
          { name: 'Retail Media Revenue', description: 'Annual revenue from retail media advertising network', baselineValue: 4, targetValue: 80, currentValue: 4, unit: '$M', frequency: 'quarterly', owner: 'VP Retail Media', status: 'at-risk' },
        ]},
        { perspective: 'financial', objective: 'Defend and Improve Gross Margin', description: 'Expand private label, improve fulfillment cost efficiency, and reduce markdown waste to protect and grow gross margin in a competitive price environment', weight: 1.3, kpis: [
          { name: 'Gross Margin Rate', description: 'Gross profit as % of net revenue', baselineValue: 32.4, targetValue: 35.8, currentValue: 32.4, unit: '%', frequency: 'monthly', owner: 'CFO', status: 'at-risk' },
          { name: 'Private Label GMV Share', description: 'Private label as % of total gross merchandise value', baselineValue: 24, targetValue: 30, currentValue: 24, unit: '%', frequency: 'quarterly', owner: 'VP Merchandising', status: 'on-track' },
          { name: 'Last-Mile Fulfillment Cost Rate', description: 'Last-mile delivery cost as % of digital revenue', baselineValue: 18, targetValue: 12, currentValue: 18, unit: '%', frequency: 'monthly', owner: 'VP Supply Chain', status: 'at-risk' },
        ]},
        { perspective: 'customer', objective: 'Maximize Customer Lifetime Value', description: 'Deepen loyalty relationships, increase purchase frequency, and expand basket size through personalization and loyalty program enhancement', weight: 1.5, kpis: [
          { name: 'Customer Lifetime Value (CLV)', description: 'Average CLV of loyalty program members vs prior year', baselineValue: 100, targetValue: 135, currentValue: 100, unit: 'index', frequency: 'quarterly', owner: 'Chief Customer Officer', status: 'at-risk' },
          { name: 'Loyalty Active Rate', description: 'Percentage of loyalty members making a purchase in past 90 days', baselineValue: 38, targetValue: 52, currentValue: 38, unit: '%', frequency: 'monthly', owner: 'VP Loyalty', status: 'at-risk' },
          { name: 'Customer NPS', description: 'Net Promoter Score across all shopping channels', baselineValue: 38, targetValue: 55, currentValue: 38, unit: 'NPS', frequency: 'quarterly', owner: 'Chief Customer Officer', status: 'at-risk' },
        ]},
        { perspective: 'customer', objective: 'Deliver Seamless Omnichannel Experience', description: 'Ensure consistent, frictionless shopping experience across store, web, app, and social channels with unified inventory and profile visibility', weight: 1.3, kpis: [
          { name: 'BOPIS Order Fulfillment Rate (2hr)', description: 'Buy Online Pick Up In Store orders ready within 2 hours of order placement', baselineValue: 72, targetValue: 95, currentValue: 72, unit: '%', frequency: 'monthly', owner: 'VP Store Operations', status: 'at-risk' },
          { name: 'Cross-Channel Customer Rate', description: 'Percentage of customers shopping both in-store and online in 90-day period', baselineValue: 22, targetValue: 42, currentValue: 22, unit: '%', frequency: 'quarterly', owner: 'Chief Digital Officer', status: 'at-risk' },
        ]},
        { perspective: 'internal_process', objective: 'Achieve Supply Chain and Inventory Excellence', description: 'Eliminate channel inventory silos, optimize replenishment, and build fulfillment hub network to compete on speed and availability', weight: 1.4, kpis: [
          { name: 'In-Stock Rate (Top 500 SKUs)', description: 'In-stock availability of top 500 highest-velocity SKUs', baselineValue: 88, targetValue: 97, currentValue: 88, unit: '%', frequency: 'weekly', owner: 'VP Supply Chain', status: 'at-risk' },
          { name: 'Inventory Turn Rate', description: 'Annual inventory turnover cycles', baselineValue: 5.2, targetValue: 7.8, currentValue: 5.2, unit: 'turns/year', frequency: 'monthly', owner: 'VP Merchandising', status: 'at-risk' },
          { name: 'Store-as-Hub Fulfillment Centers Activated', description: 'Number of stores configured as local fulfillment hubs', baselineValue: 12, targetValue: 200, currentValue: 12, unit: 'stores', frequency: 'quarterly', owner: 'VP Supply Chain', status: 'at-risk' },
        ]},
        { perspective: 'internal_process', objective: 'Deploy AI-Powered Personalization and Merchandising', description: 'Implement AI-driven product recommendations, dynamic pricing, and assortment optimization to lift conversion and basket across channels', weight: 1.3, kpis: [
          { name: 'Personalized Recommendation Revenue Lift', description: 'Revenue attributable to AI product recommendation engine', baselineValue: 0, targetValue: 8, currentValue: 0, unit: '% of revenue', frequency: 'monthly', owner: 'Chief Digital Officer', status: 'on-track' },
          { name: 'Markdown Rate', description: 'Clearance markdowns as % of total sales', baselineValue: 8.4, targetValue: 5.2, currentValue: 8.4, unit: '%', frequency: 'monthly', owner: 'VP Merchandising', status: 'at-risk' },
        ]},
        { perspective: 'learning_growth', objective: 'Build Digital and Data Capability', description: 'Develop organizational AI literacy, e-commerce capability, and data-driven decision making across merchandising, marketing, and store operations', weight: 1.3, kpis: [
          { name: 'Data Literacy Score (Staff)', description: 'Average data literacy assessment score across all department heads and managers', baselineValue: 38, targetValue: 72, currentValue: 38, unit: 'score', frequency: 'annually', owner: 'Chief Digital Officer', status: 'at-risk' },
          { name: 'Digital-First Decisions Rate', description: 'Percentage of merchandising and marketing decisions informed by digital analytics', baselineValue: 28, targetValue: 75, currentValue: 28, unit: '%', frequency: 'quarterly', owner: 'Chief Data Officer', status: 'on-track' },
        ]},
        { perspective: 'learning_growth', objective: 'Develop High-Performance Store Culture', description: 'Reduce associate turnover, elevate engagement, and build customer service excellence capability that differentiates the in-store experience', weight: 1.2, kpis: [
          { name: 'Store Associate Voluntary Turnover', description: 'Annual voluntary turnover rate for hourly store associates', baselineValue: 42, targetValue: 25, currentValue: 42, unit: '%', frequency: 'quarterly', owner: 'CHRO', status: 'at-risk' },
          { name: 'Associate Engagement Score', description: 'Store associate engagement percentile vs retail benchmark', baselineValue: 35, targetValue: 65, currentValue: 35, unit: 'percentile', frequency: 'annually', owner: 'CHRO', status: 'at-risk' },
        ]},
      ],
    },
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-04-10T00:00:00Z',
  },

  // ===== 7. ENERGY =====
  {
    id: 'tmpl-energy-transition',
    name: 'Energy Company — Clean Transition Strategy',
    description: 'Comprehensive systems-based strategic framework for energy companies navigating the transition from carbon-intensive assets to renewable and distributed energy. Addresses stranded asset risk, regulatory acceleration, grid integration constraints, and workforce transition dynamics.',
    industry: 'energy',
    category: 'builtin',
    icon: 'Zap',
    color: 'green',
    tags: ['energy transition', 'renewables', 'decarbonization', 'grid modernization', 'ESG', 'green hydrogen', 'CCUS'],
    usage_count: 694,
    rating: 4.7,
    rating_count: 110,
    is_public: true,
    plan_data: {
      name: 'Energy Clean Transition Strategic Plan',
      organization: 'Integrated Energy Corporation',
      vision: 'To lead the energy transition in our region — delivering reliable, affordable, and clean energy that powers economic growth while protecting the climate for future generations.',
      mission: 'To provide the energy our customers and communities need today while building the infrastructure and capability to deliver a clean, secure, and resilient energy future.',
      strategicIntent: 'Grow renewable portfolio to 40% of generation capacity by Y5, reduce carbon intensity 35% by Y4, achieve ESG rating upgrade to AA, and commission 2 GW of new renewable capacity by Y3 through the Integrated Energy Transition strategy.',
      swotItems: [
        { category: 'strength', description: 'Established grid infrastructure and transmission assets providing regulated revenue base and market access for renewable development', impactScore: 5, likelihoodScore: 5 },
        { category: 'strength', description: 'Strong regulatory relationships and operating licenses across 6 states enabling project approvals and grid interconnection', impactScore: 4, likelihoodScore: 5 },
        { category: 'strength', description: 'Large investment-grade balance sheet ($8.2B assets) supporting renewable capex and green bond issuance', impactScore: 5, likelihoodScore: 4 },
        { category: 'strength', description: 'Deep technical expertise in energy systems engineering, grid operations, and project management', impactScore: 4, likelihoodScore: 5 },
        { category: 'strength', description: 'Long-term industrial and utility customer base under multi-year power purchase agreements providing revenue stability', impactScore: 4, likelihoodScore: 5 },
        { category: 'weakness', description: 'Carbon-intensive asset base with 68% of generation capacity from coal and gas — highest scope 1 intensity in peer group', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'Slow innovation culture — average time from technology idea to commercial deployment is 7 years vs industry best practice of 3', impactScore: 4, likelihoodScore: 4 },
        { category: 'weakness', description: 'Limited renewable project pipeline — only 800 MW in development vs 4 GW needed to meet 2035 targets', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'Workforce skills mismatch — 65% of engineering workforce with fossil fuel expertise vs emerging need for renewable, storage, and grid software', impactScore: 4, likelihoodScore: 5 },
        { category: 'weakness', description: 'High decommissioning liabilities for coal plants not yet reflected in asset valuations — estimated $1.4B exposure', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Solar and wind LCOE below $30/MWh — 89% cost reduction since 2010 making new renewable capacity cheapest generation available', impactScore: 5, likelihoodScore: 5 },
        { category: 'opportunity', description: 'IRA tax credits generating $3–5/MWh additional economic benefit for domestic renewable development', impactScore: 5, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Grid-scale battery storage market growth enabling renewable firming and creating new ancillary service revenue streams', impactScore: 5, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Green hydrogen emerging as viable long-duration storage and industrial decarbonization solution with $20B federal funding', impactScore: 4, likelihoodScore: 3 },
        { category: 'opportunity', description: 'Corporate PPA demand surge — Fortune 500 companies purchasing 45 GW of renewable capacity annually to meet scope 2 targets', impactScore: 5, likelihoodScore: 5 },
        { category: 'threat', description: 'Carbon pricing and emissions regulation tightening — SEC climate disclosure, EPA power plant rules, state clean energy mandates', impactScore: 5, likelihoodScore: 5 },
        { category: 'threat', description: 'Activist investors and ESG mandates threatening capital access and cost of debt for carbon-heavy utilities', impactScore: 4, likelihoodScore: 5 },
        { category: 'threat', description: 'Distributed energy and prosumer disruption — rooftop solar and battery storage reducing centralized generation need by 12-18% in residential segment', impactScore: 4, likelihoodScore: 4 },
        { category: 'threat', description: 'Grid interconnection queue backlog — 2,000+ GW nationwide waiting for interconnection, creating 5–8 year delays for new projects', impactScore: 5, likelihoodScore: 4 },
        { category: 'threat', description: 'Extreme weather events increasing grid reliability requirements and asset damage costs — 340% increase in weather-related outages in 10 years', impactScore: 4, likelihoodScore: 5 },
      ],
      strategicOptions: [
        { optionType: 'SO', title: 'Utility-Scale Renewable Build Program', description: 'Deploy balance sheet strength and regulatory relationships to fast-track 2 GW solar and wind development using IRA credits to achieve sub-$35/MWh LCOE', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'SO', title: 'Corporate PPA Platform Launch', description: 'Leverage grid infrastructure and technical expertise to offer bundled renewable PPA + grid services to Fortune 500 customers meeting scope 2 targets', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Grid Modernization and Resilience Investment', description: 'Use regulatory relationships and balance sheet to win rate base treatment for grid modernization protecting revenue against distributed energy disruption', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Coal Asset Retirement and Transition Plan', description: 'Proactively plan coal retirements ahead of regulation, capturing stranded asset tax benefits and avoiding regulatory penalties', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'Grid-Scale Battery Storage Portfolio', description: 'Overcome intermittency constraint on renewable growth by co-locating storage with solar/wind — unlocking round-the-clock renewable capability', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'Renewable Workforce Transition Program', description: 'Address skills mismatch by retraining fossil fuel workforce in solar construction, grid software, and storage operations — targeting 70% internal workforce redeployment', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'WT', title: 'Green Hydrogen Pilot Investment', description: 'Position for emerging hydrogen economy by investing $120M in green hydrogen pilot at existing industrial site, building first-mover advantage in future market', priorityScore: 3, feasibilityScore: 3, selected: false },
        { optionType: 'WT', title: 'ESG Disclosure and Investor Engagement', description: 'Proactively publish credible net-zero roadmap and climate scenario analysis to retain institutional investor confidence during transition', priorityScore: 4, feasibilityScore: 5, selected: true },
      ],
      objectives: [
        { perspective: 'financial', objective: 'Maintain Financial Strength Through Transition', description: 'Sustain investment-grade credit rating and dividend while funding renewable capex through disciplined capital allocation and green financing', weight: 1.4, kpis: [
          { name: 'EBITDA Margin', description: 'Adjusted EBITDA as percentage of total revenue', baselineValue: 31, targetValue: 28, currentValue: 31, unit: '%', frequency: 'quarterly', owner: 'CFO', status: 'on-track' },
          { name: 'Renewable Capex Share', description: 'Renewable energy capital expenditure as % of total capex', baselineValue: 8, targetValue: 40, currentValue: 8, unit: '%', frequency: 'annually', owner: 'CFO', status: 'at-risk' },
          { name: 'Green Bond Issuance', description: 'Cumulative green bond proceeds raised for renewable projects', baselineValue: 0, targetValue: 2.0, currentValue: 0, unit: '$B', frequency: 'annually', owner: 'CFO', status: 'on-track' },
        ]},
        { perspective: 'financial', objective: 'Grow Clean Energy Revenue Streams', description: 'Develop renewable PPA, battery storage, and new energy services revenue to replace retiring fossil generation revenue', weight: 1.3, kpis: [
          { name: 'Renewable Energy Revenue Share', description: 'Revenue from renewable energy sources as % of total revenue', baselineValue: 12, targetValue: 38, currentValue: 12, unit: '%', frequency: 'quarterly', owner: 'CFO', status: 'at-risk' },
          { name: 'Corporate PPA Portfolio', description: 'Total contracted corporate PPA capacity in GW', baselineValue: 0.3, targetValue: 2.0, currentValue: 0.3, unit: 'GW', frequency: 'quarterly', owner: 'VP Commercial', status: 'at-risk' },
        ]},
        { perspective: 'customer', objective: 'Achieve Grid Reliability and Clean Energy Service Excellence', description: 'Maintain top-decile reliability while expanding clean energy products meeting customer scope 2 demand', weight: 1.4, kpis: [
          { name: 'Grid Reliability (SAIDI)', description: 'System Average Interruption Duration Index in minutes per customer', baselineValue: 112, targetValue: 65, currentValue: 112, unit: 'minutes/customer', frequency: 'monthly', owner: 'VP Grid Operations', status: 'at-risk' },
          { name: 'Clean Energy Product Customers', description: 'Commercial and industrial customers with renewable energy products', baselineValue: 120, targetValue: 850, currentValue: 120, unit: 'customers', frequency: 'quarterly', owner: 'VP Commercial', status: 'on-track' },
          { name: 'Customer Satisfaction Score', description: 'J.D. Power overall satisfaction score vs utility average', baselineValue: 682, targetValue: 740, currentValue: 682, unit: 'points', frequency: 'annually', owner: 'Chief Customer Officer', status: 'at-risk' },
        ]},
        { perspective: 'internal_process', objective: 'Accelerate Renewable Project Development', description: 'Build renewable project development pipeline and execution capability to commission 2 GW by Y3 and 5 GW by Y6', weight: 1.5, kpis: [
          { name: 'Renewable Capacity Commissioned', description: 'Cumulative new renewable generation capacity commissioned in GW', baselineValue: 0.4, targetValue: 2.0, currentValue: 0.4, unit: 'GW', frequency: 'quarterly', owner: 'VP Project Development', status: 'at-risk' },
          { name: 'Development Pipeline (MW)', description: 'Total MW in active development pipeline (permitted or under construction)', baselineValue: 800, targetValue: 4000, currentValue: 800, unit: 'MW', frequency: 'quarterly', owner: 'VP Project Development', status: 'at-risk' },
          { name: 'Project Delivery On-Budget Rate', description: 'Percentage of renewable projects delivered within 10% of approved budget', baselineValue: 72, targetValue: 90, currentValue: 72, unit: '%', frequency: 'quarterly', owner: 'VP Engineering', status: 'at-risk' },
        ]},
        { perspective: 'internal_process', objective: 'Reduce Carbon Intensity and Meet Climate Commitments', description: 'Execute systematic emissions reductions aligned with Science Based Targets and regulatory requirements, retiring coal assets on schedule', weight: 1.5, kpis: [
          { name: 'Carbon Intensity (tCO₂e/MWh)', description: 'Scope 1 CO₂ equivalent per MWh of electricity generated', baselineValue: 0.58, targetValue: 0.38, currentValue: 0.58, unit: 'tCO₂e/MWh', frequency: 'quarterly', owner: 'Chief Sustainability Officer', status: 'at-risk' },
          { name: 'Coal Capacity Retired', description: 'Cumulative coal generation capacity retired in GW', baselineValue: 0, targetValue: 2.4, currentValue: 0, unit: 'GW', frequency: 'annually', owner: 'VP Asset Management', status: 'on-track' },
          { name: 'ESG Rating (MSCI)', description: 'MSCI ESG rating category', baselineValue: 0, targetValue: 1, currentValue: 0, unit: 'BBB to AA', frequency: 'annually', owner: 'Chief Sustainability Officer', status: 'at-risk' },
        ]},
        { perspective: 'learning_growth', objective: 'Build Renewable Energy Workforce Capability', description: 'Retrain fossil fuel workforce and hire renewable, storage, and grid software talent to execute the clean energy buildout', weight: 1.3, kpis: [
          { name: 'Workforce Retrained in Renewables', description: 'Number of existing employees successfully retrained for renewable energy roles', baselineValue: 120, targetValue: 1200, currentValue: 120, unit: 'employees', frequency: 'annually', owner: 'CHRO', status: 'at-risk' },
          { name: 'Renewable Skills Certification Rate', description: 'Percentage of operations staff with relevant renewable energy certification', baselineValue: 8, targetValue: 55, currentValue: 8, unit: '%', frequency: 'annually', owner: 'CHRO', status: 'at-risk' },
        ]},
        { perspective: 'learning_growth', objective: 'Cultivate Innovation and Technology Leadership', description: 'Build internal innovation capability and external partnerships to stay at the frontier of clean energy technology and grid software', weight: 1.1, kpis: [
          { name: 'Clean Energy Innovation Investment', description: 'Annual investment in R&D and technology innovation programs', baselineValue: 28, targetValue: 120, currentValue: 28, unit: '$M', frequency: 'annually', owner: 'CTO', status: 'at-risk' },
          { name: 'University and Startup Partnerships', description: 'Active research and pilot technology partnerships', baselineValue: 4, targetValue: 18, currentValue: 4, unit: 'partnerships', frequency: 'annually', owner: 'CTO', status: 'on-track' },
        ]},
      ],
    },
    created_at: '2026-02-20T00:00:00Z',
    updated_at: '2026-04-10T00:00:00Z',
  },

  // ===== 8. FINANCE =====
  {
    id: 'tmpl-financial-digital',
    name: 'Financial Corporation — Digital Banking Transformation',
    description: 'Systems-based strategic framework for financial institutions navigating fintech disruption, core system modernization, and open banking transformation. Addresses trust-compounding feedback loops, NPL spiral risks, and the digital flywheel dynamic through platform banking strategy.',
    industry: 'finance',
    category: 'builtin',
    icon: 'Landmark',
    color: 'amber',
    tags: ['digital banking', 'core modernization', 'open banking', 'SME lending', 'fintech partnership', 'ESG finance'],
    usage_count: 1102,
    rating: 4.8,
    rating_count: 178,
    is_public: true,
    plan_data: {
      name: 'Financial Corporation Digital Banking Transformation Plan',
      organization: 'Commercial Banking Corporation',
      vision: 'To be the bank that earns lifelong loyalty — combining the trust and relationships of a community bank with the intelligence and convenience of a world-class digital platform.',
      mission: 'To generate sustainable risk-adjusted returns while enabling economic mobility for our clients and communities through innovative, accessible, and responsible financial services.',
      strategicIntent: 'Reduce cost-to-income ratio from 68% to 55%, grow digital active users to 75%, launch SME digital lending platform capturing 15% market share, and achieve ROE of 13%+ within 3 years through the Digital Banking Transformation program.',
      swotItems: [
        { category: 'strength', description: 'Tier-1 capital adequacy ratio of 14.2% — well above 10.5% regulatory minimum providing substantial growth capacity', impactScore: 5, likelihoodScore: 5 },
        { category: 'strength', description: 'Regulated deposit base of $42B providing stable, low-cost funding advantage over non-bank competitors', impactScore: 5, likelihoodScore: 5 },
        { category: 'strength', description: 'Established risk management systems with sub-2.5% NPL ratio across economic cycles demonstrating credit discipline', impactScore: 4, likelihoodScore: 5 },
        { category: 'strength', description: '340-branch network with geographic coverage creating relationship advantage in small business and retail banking', impactScore: 4, likelihoodScore: 4 },
        { category: 'strength', description: '28-year institutional trust and compliance track record with no major regulatory enforcement actions', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'Legacy core banking system (30-year-old architecture) — API incapability blocking digital product development and partner integration', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'High cost-to-income ratio of 68% driven by branch network, manual processes, and technology debt — 13 points above top-quartile peer', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'Digital active user rate of 48% vs industry benchmark 72% — lagging mobile and online banking adoption', impactScore: 4, likelihoodScore: 5 },
        { category: 'weakness', description: 'Limited API ecosystem — no open banking platform, no fintech partnerships, no embedded finance capability', impactScore: 5, likelihoodScore: 4 },
        { category: 'weakness', description: 'Thin data science team — 8 FTEs vs 45+ at comparable digital-first banks, limiting AI credit decisioning and personalization', impactScore: 4, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Open banking regulation creating BaaS monetization opportunity — banking license as platform generating fee income independent of balance sheet', impactScore: 5, likelihoodScore: 4 },
        { category: 'opportunity', description: 'SME digital lending underserved — $400B market with 45% of SME loan applications abandoned due to slow traditional bank processing', impactScore: 5, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Wealth management democratization — mass affluent segment ($100K–$1M) underserved by both private banking and robo-advisors', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Climate finance and green bond growth — $5T annual green finance market seeking regulated bank partners for verification and distribution', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Real-time payments and embedded finance — FedNow infrastructure enabling new payment products and embedded banking in business software', impactScore: 5, likelihoodScore: 5 },
        { category: 'threat', description: 'Neo-bank and fintech margin erosion — Chime, Nubank, and Wise growing 40%+ annually with 60-70% lower cost structure', impactScore: 5, likelihoodScore: 5 },
        { category: 'threat', description: 'CBDC pilot programs by Fed potentially reducing bank intermediation role in retail payments within 5-7 year horizon', impactScore: 4, likelihoodScore: 3 },
        { category: 'threat', description: 'Cybersecurity and fraud sophistication — $32B in US bank fraud losses in 2025 with AI-generated synthetic identity fraud growing 85% annually', impactScore: 5, likelihoodScore: 5 },
        { category: 'threat', description: 'Basel IV capital requirements increasing by 12-18% for certain lending categories, constraining growth capacity', impactScore: 4, likelihoodScore: 4 },
        { category: 'threat', description: 'Climate credit risk — transition and physical risk affecting $2.8B of loan portfolio in carbon-intensive and coastal sectors', impactScore: 4, likelihoodScore: 4 },
      ],
      strategicOptions: [
        { optionType: 'SO', title: 'Banking-as-a-Service Platform', description: 'Leverage banking license, capital strength, and regulatory relationships to launch BaaS platform — banking infrastructure for fintech and corporate clients generating high-margin fee income', priorityScore: 5, feasibilityScore: 3, selected: true },
        { optionType: 'SO', title: 'SME Digital Lending Platform', description: 'Use regulatory trust and deposit base cost advantage to build automated SME credit decisioning delivering 48-hour approvals vs industry 3-week average', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Core Banking System Modernization', description: 'Replace 30-year legacy core to unlock all digital product development — the single root cause blocking every digital strategy', priorityScore: 5, feasibilityScore: 3, selected: true },
        { optionType: 'ST', title: 'AI Fraud and Cybersecurity Platform', description: 'Deploy ML fraud detection reducing false positives 60% while catching 40% more genuine fraud — turning cybersecurity from cost to competitive differentiator', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'Open Banking API Marketplace', description: 'Address API capability gap by launching developer portal and marketplace enabling 50+ fintech integrations and driving digital active user rate to 75%', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'Data Science and AI Capability Build', description: 'Scale data science team from 8 to 45 FTEs and deploy AI for credit scoring, personalization, and churn prediction — closing 3-year gap to digital-first peers', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'WT', title: 'Green Finance Product Suite', description: 'Develop climate-aligned lending products and ESG scoring to align portfolio with transition risk reduction while meeting growing corporate green finance demand', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'WT', title: 'Branch Network Optimization', description: 'Right-size branch network from 340 to 220 over 3 years — reinvesting savings into digital capability and redeploying staff to advisory and small business roles', priorityScore: 4, feasibilityScore: 3, selected: false },
      ],
      objectives: [
        { perspective: 'financial', objective: 'Achieve Sustainable Profitability Improvement', description: 'Drive ROE above cost of equity through cost reduction, revenue diversification, and portfolio quality management', weight: 1.5, kpis: [
          { name: 'Return on Equity (ROE)', description: 'Net income as % of average shareholders equity', baselineValue: 11.2, targetValue: 13.5, currentValue: 11.2, unit: '%', frequency: 'quarterly', owner: 'CFO', status: 'at-risk' },
          { name: 'Cost-to-Income Ratio', description: 'Operating expenses as % of net revenue', baselineValue: 68, targetValue: 55, currentValue: 68, unit: '%', frequency: 'monthly', owner: 'CFO', status: 'at-risk' },
          { name: 'Fee Income Share', description: 'Non-interest fee income as % of total revenue', baselineValue: 22, targetValue: 35, currentValue: 22, unit: '%', frequency: 'quarterly', owner: 'CFO', status: 'on-track' },
        ]},
        { perspective: 'financial', objective: 'Maintain Credit Quality and Capital Efficiency', description: 'Sustain best-in-class credit discipline while deploying capital efficiently across growing digital and green finance portfolios', weight: 1.3, kpis: [
          { name: 'Non-Performing Loan Ratio', description: 'NPL as % of gross loan portfolio', baselineValue: 3.1, targetValue: 2.2, currentValue: 3.1, unit: '%', frequency: 'monthly', owner: 'Chief Risk Officer', status: 'at-risk' },
          { name: 'Net Interest Margin (NIM)', description: 'Net interest income as % of average earning assets', baselineValue: 3.2, targetValue: 3.6, currentValue: 3.2, unit: '%', frequency: 'monthly', owner: 'CFO', status: 'at-risk' },
        ]},
        { perspective: 'customer', objective: 'Win and Deepen Digital Customer Relationships', description: 'Grow digital active users, increase products per household, and achieve top-quartile NPS by delivering superior digital banking experiences', weight: 1.4, kpis: [
          { name: 'Digital Active User Rate', description: 'Percentage of retail customers active on digital channels monthly', baselineValue: 48, targetValue: 75, currentValue: 48, unit: '%', frequency: 'monthly', owner: 'Chief Digital Officer', status: 'at-risk' },
          { name: 'Retail Banking NPS', description: 'Net Promoter Score for retail banking segment', baselineValue: 18, targetValue: 48, currentValue: 18, unit: 'NPS', frequency: 'quarterly', owner: 'Chief Customer Officer', status: 'at-risk' },
          { name: 'Products Per Household', description: 'Average number of products held per retail banking household', baselineValue: 2.3, targetValue: 3.8, currentValue: 2.3, unit: 'products', frequency: 'quarterly', owner: 'Chief Customer Officer', status: 'at-risk' },
        ]},
        { perspective: 'customer', objective: 'Capture SME and Corporate Digital Lending Market', description: 'Win SME market share through fast, digital-first credit decisions and relationship banking that combines speed with trust', weight: 1.4, kpis: [
          { name: 'SME Loan Portfolio Growth', description: 'Year-over-year growth in SME loan portfolio', baselineValue: 4, targetValue: 22, currentValue: 4, unit: '%', frequency: 'quarterly', owner: 'Head of SME Banking', status: 'at-risk' },
          { name: 'SME Digital Lending Market Share', description: 'Market share of SME loans under $500K in service geography', baselineValue: 5, targetValue: 15, currentValue: 5, unit: '%', frequency: 'annually', owner: 'Head of SME Banking', status: 'at-risk' },
          { name: 'SME Loan Approval Time', description: 'Median days from application to credit decision for SME loans', baselineValue: 18, targetValue: 2, currentValue: 18, unit: 'days', frequency: 'monthly', owner: 'Chief Digital Officer', status: 'at-risk' },
        ]},
        { perspective: 'internal_process', objective: 'Complete Core Banking Modernization', description: 'Execute multi-year core banking replacement enabling API connectivity, real-time processing, and cloud-native product development velocity', weight: 1.5, kpis: [
          { name: 'Core Banking Migration Completion', description: 'Percentage of accounts migrated to modern core banking platform', baselineValue: 0, targetValue: 100, currentValue: 0, unit: '%', frequency: 'quarterly', owner: 'CTO', status: 'at-risk' },
          { name: 'API Endpoints Published', description: 'Number of live, documented API endpoints available to partners', baselineValue: 8, targetValue: 120, currentValue: 8, unit: 'endpoints', frequency: 'quarterly', owner: 'CTO', status: 'on-track' },
          { name: 'Digital Product Time-to-Market', description: 'Average weeks from product concept to customer launch', baselineValue: 24, targetValue: 8, currentValue: 24, unit: 'weeks', frequency: 'quarterly', owner: 'Chief Digital Officer', status: 'at-risk' },
        ]},
        { perspective: 'internal_process', objective: 'Strengthen Risk, Fraud, and Compliance Automation', description: 'Deploy AI-driven risk and fraud detection while automating compliance processes to reduce operational risk and regulatory burden', weight: 1.2, kpis: [
          { name: 'Fraud Loss Rate', description: 'Fraud losses as % of transaction volume', baselineValue: 0.18, targetValue: 0.08, currentValue: 0.18, unit: '%', frequency: 'monthly', owner: 'Chief Risk Officer', status: 'at-risk' },
          { name: 'Compliance Process Automation Rate', description: 'Percentage of compliance monitoring processes automated', baselineValue: 28, targetValue: 72, currentValue: 28, unit: '%', frequency: 'quarterly', owner: 'Chief Compliance Officer', status: 'on-track' },
        ]},
        { perspective: 'learning_growth', objective: 'Build Digital Banking and AI Talent Engine', description: 'Rapidly develop data science, software engineering, product management, and AI capability to close the digital talent gap vs fintech competitors', weight: 1.4, kpis: [
          { name: 'Data Science and ML Team Size', description: 'Total FTEs in data science, machine learning, and AI roles', baselineValue: 8, targetValue: 45, currentValue: 8, unit: 'FTEs', frequency: 'quarterly', owner: 'CHRO', status: 'at-risk' },
          { name: 'Technology Talent Retention Rate', description: 'Annual retention rate for technology and data roles', baselineValue: 72, targetValue: 88, currentValue: 72, unit: '%', frequency: 'quarterly', owner: 'CHRO', status: 'at-risk' },
        ]},
        { perspective: 'learning_growth', objective: 'Embed Agile and Innovation Culture', description: 'Transition from waterfall project delivery to agile product development mindset enabling rapid experimentation and continuous customer feedback loops', weight: 1.1, kpis: [
          { name: 'Agile Team Coverage', description: 'Percentage of technology projects delivered using agile methodology', baselineValue: 22, targetValue: 85, currentValue: 22, unit: '%', frequency: 'quarterly', owner: 'CTO', status: 'at-risk' },
          { name: 'Innovation Lab Experiments', description: 'Number of fintech partnership pilots and innovation experiments per year', baselineValue: 3, targetValue: 18, currentValue: 3, unit: 'experiments', frequency: 'annually', owner: 'Chief Innovation Officer', status: 'on-track' },
        ]},
      ],
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-04-10T00:00:00Z',
  },

  // ===== 9. TRADE & EXPORT =====
  {
    id: 'tmpl-trade-export-growth',
    name: 'Trade & Export Enterprise — Global Market Expansion',
    description: 'Systems-based strategic framework for trade and export enterprises navigating geopolitical fragmentation, supply chain resilience imperatives, and digital trade compliance. Addresses supply chain concentration risks, FTA utilization gaps, and emerging market diversification through the Resilient Trade Growth strategy.',
    industry: 'general',
    category: 'builtin',
    icon: 'TrendingUp',
    color: 'violet',
    tags: ['global trade', 'supply chain resilience', 'FTA optimization', 'emerging markets', 'digital trade', 'export diversification'],
    usage_count: 563,
    rating: 4.6,
    rating_count: 88,
    is_public: true,
    plan_data: {
      name: 'Trade & Export Enterprise Global Expansion Strategic Plan',
      organization: 'International Trade & Export Corporation',
      vision: 'To be a globally respected trade enterprise — known for supply chain resilience, ethical sourcing, and consistent delivery across the markets we serve.',
      mission: 'To capture sustainable global market share through competitive, digitally enabled, and geopolitically resilient trade networks that create value for customers, partners, and communities.',
      strategicIntent: 'Grow export revenue 25% within 3 years, achieve 96% on-time delivery, optimize FTA utilization from 31% to 80%, reduce supply chain concentration index by 55%, and enter 4 new export markets by Y2 through the Resilient Trade Growth framework.',
      swotItems: [
        { category: 'strength', description: 'Established export certifications (ISO, HACCP, product-specific compliance) across 12 product categories and 28 destination markets', impactScore: 4, likelihoodScore: 5 },
        { category: 'strength', description: 'Diversified product portfolio spanning 6 product families with complementary demand seasonality reducing revenue concentration risk', impactScore: 4, likelihoodScore: 5 },
        { category: 'strength', description: 'Established logistics network with carrier contracts in 4 key trade corridors providing preferential freight rates', impactScore: 4, likelihoodScore: 4 },
        { category: 'strength', description: 'Strong brand recognition in core markets with 78% repeat buyer rate and 15-year average customer relationship', impactScore: 5, likelihoodScore: 5 },
        { category: 'strength', description: 'Experienced trade compliance team with institutional knowledge of 28 destination country regulatory requirements', impactScore: 4, likelihoodScore: 5 },
        { category: 'weakness', description: 'Supply chain over-concentration — top 2 source countries represent 71% of procurement volume (HHI 0.41), creating geopolitical vulnerability', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'Manual customs and trade documentation — paper-based processes in 80% of corridors with 5-day average customs clearance vs digital-enabled 1-day', impactScore: 4, likelihoodScore: 5 },
        { category: 'weakness', description: 'FTA utilization at only 31% of eligible transactions despite qualifying for preferences under 8 active free trade agreements', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'Limited market intelligence — no structured geopolitical monitoring capability or emerging market demand tracking system', impactScore: 4, likelihoodScore: 4 },
        { category: 'weakness', description: 'Currency risk management informal — 65% of transactions in USD with no systematic hedging policy for non-USD revenues', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'ASEAN economic growth — 7 ASEAN markets growing 5-7% annually with rising middle class increasing import demand for premium products', impactScore: 5, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Africa Continental Free Trade Area (AfCFTA) creating 1.3B consumer market with simplified cross-border procedures from 2026', impactScore: 5, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Digital trade platforms (Alibaba International, Amazon Business, B2B marketplaces) enabling cost-efficient new market entry', impactScore: 4, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Green supply chain premium — ESG-mandated buyers paying 6-10% premium for verified sustainable sourcing and low-carbon logistics', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'FTA network deepening — 12 new bilateral agreements in negotiation including markets where competitors have no preferential access', impactScore: 4, likelihoodScore: 4 },
        { category: 'threat', description: 'US-China trade decoupling and friend-shoring disruption — tariff escalation affecting supply chains sourced in sanctioned or tariff-exposed countries', impactScore: 5, likelihoodScore: 5 },
        { category: 'threat', description: 'Carbon Border Adjustment Mechanism (CBAM) creating new cost layer for carbon-intensive products exported to EU markets from 2026', impactScore: 4, likelihoodScore: 5 },
        { category: 'threat', description: 'Logistics infrastructure disruption — Panama and Suez Canal capacity constraints, port congestion, and extreme weather adding 8-15 days to transit times', impactScore: 4, likelihoodScore: 4 },
        { category: 'threat', description: 'Currency volatility — 35% average fluctuation in key emerging market currencies creating unpredictable margin compression', impactScore: 4, likelihoodScore: 5 },
        { category: 'threat', description: 'Trade protectionism resurgence — 12 destination markets adding non-tariff barriers (labeling, standards, local content) targeting imported goods', impactScore: 4, likelihoodScore: 4 },
      ],
      strategicOptions: [
        { optionType: 'SO', title: 'ASEAN Market Penetration Program', description: 'Leverage established certifications and brand reputation to systematically enter 4 ASEAN markets over 18 months using digital B2B platforms and local distribution partners', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'SO', title: 'FTA Utilization Optimization', description: 'Deploy systematic rules-of-origin analysis across all eligible shipments to capture estimated $8M annual tariff savings and improve price competitiveness in FTA partner markets', priorityScore: 5, feasibilityScore: 5, selected: true },
        { optionType: 'SO', title: 'Green Supply Chain Premium Strategy', description: 'Achieve verified sustainable sourcing certification and low-carbon logistics documentation enabling premium pricing with ESG-mandated buyers', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Supply Chain Multi-Country Diversification', description: 'Address geopolitical concentration risk by qualifying alternative suppliers in 3+ countries for all top-20 SKUs within 18 months, reducing HHI from 0.41 to 0.18', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Currency Hedging and Risk Management Policy', description: 'Establish formal FX hedging program covering 70% of non-USD revenue exposure to protect margins against currency volatility', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'Digital Trade Documentation Platform', description: 'Deploy e-Bill of Lading, digital customs, and automated compliance documentation reducing clearance time from 5 days to 1 day across 5 key corridors', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'Geopolitical Trade Intelligence Unit', description: 'Build dedicated market intelligence capability monitoring trade policy, tariff changes, and geopolitical risk to enable proactive routing and market strategy adjustments', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'WT', title: 'Carbon Border Adjustment Compliance', description: 'Proactively develop product carbon footprint documentation and CBAM reporting capability ahead of full implementation, avoiding compliance penalties and customer churn', priorityScore: 4, feasibilityScore: 4, selected: false },
      ],
      objectives: [
        { perspective: 'financial', objective: 'Grow Export Revenue and Market Diversification', description: 'Achieve 25% revenue growth through new market entry, increased volume in existing markets, and FTA tariff savings reinvested in competitive pricing', weight: 1.5, kpis: [
          { name: 'Total Export Revenue', description: 'Annual total net export revenue', baselineValue: 145, targetValue: 181, currentValue: 145, unit: '$M', frequency: 'quarterly', owner: 'CFO', status: 'at-risk' },
          { name: 'New Market Revenue Share', description: 'Revenue from markets entered in past 24 months as % of total', baselineValue: 6, targetValue: 20, currentValue: 6, unit: '%', frequency: 'quarterly', owner: 'VP International Sales', status: 'on-track' },
          { name: 'FTA Tariff Savings Realized', description: 'Annual tariff cost reduction through optimized FTA preference utilization', baselineValue: 0.9, targetValue: 8.0, currentValue: 0.9, unit: '$M', frequency: 'quarterly', owner: 'Head of Trade Compliance', status: 'at-risk' },
        ]},
        { perspective: 'financial', objective: 'Improve Gross Margin Through FTA and Cost Efficiency', description: 'Reduce logistics costs, tariff burden, and supply chain waste to protect and improve gross margins despite currency and commodity pressure', weight: 1.3, kpis: [
          { name: 'Gross Margin Rate', description: 'Gross profit as percentage of net export revenue', baselineValue: 18, targetValue: 22, currentValue: 18, unit: '%', frequency: 'monthly', owner: 'CFO', status: 'at-risk' },
          { name: 'Logistics Cost-to-Revenue Ratio', description: 'Total logistics cost including freight and customs as % of revenue', baselineValue: 13, targetValue: 9, currentValue: 13, unit: '%', frequency: 'monthly', owner: 'Chief Supply Chain Officer', status: 'at-risk' },
        ]},
        { perspective: 'customer', objective: 'Achieve Delivery and Service Excellence', description: 'Deliver consistently on-time with zero compliance incidents, making the company the most reliable trade partner in its categories', weight: 1.5, kpis: [
          { name: 'On-Time Delivery Rate (OTD)', description: 'Percentage of shipments delivered on agreed contractual date', baselineValue: 87, targetValue: 96, currentValue: 87, unit: '%', frequency: 'monthly', owner: 'Chief Supply Chain Officer', status: 'at-risk' },
          { name: 'Repeat Buyer Rate', description: 'Percentage of buyers purchasing in both current and prior 12-month periods', baselineValue: 78, targetValue: 88, currentValue: 78, unit: '%', frequency: 'annually', owner: 'VP International Sales', status: 'on-track' },
          { name: 'Trade Compliance Incident Rate', description: 'Number of compliance-related shipment holds, penalties, or rejections annually', baselineValue: 14, targetValue: 2, currentValue: 14, unit: 'incidents', frequency: 'quarterly', owner: 'Head of Trade Compliance', status: 'at-risk' },
        ]},
        { perspective: 'customer', objective: 'Penetrate New Export Markets', description: 'Execute disciplined new market entry across ASEAN and African markets using digital platforms and local partner ecosystem', weight: 1.3, kpis: [
          { name: 'New Export Markets Entered', description: 'Number of distinct new country markets with at least $500K revenue in year 1', baselineValue: 0, targetValue: 4, currentValue: 0, unit: 'markets', frequency: 'annually', owner: 'VP International Sales', status: 'on-track' },
          { name: 'ASEAN Revenue Growth', description: 'Year-over-year revenue growth from ASEAN destination markets', baselineValue: 8, targetValue: 35, currentValue: 8, unit: '%', frequency: 'quarterly', owner: 'Regional Director ASEAN', status: 'at-risk' },
          { name: 'Digital Platform GMV', description: 'Gross merchandise value transacted through B2B digital trade platforms', baselineValue: 3.2, targetValue: 18.0, currentValue: 3.2, unit: '$M', frequency: 'quarterly', owner: 'Chief Digital Officer', status: 'on-track' },
        ]},
        { perspective: 'internal_process', objective: 'Build Supply Chain Resilience and Redundancy', description: 'Eliminate single-country sourcing dependencies and build multi-corridor routing capability to protect delivery reliability against geopolitical and logistics disruption', weight: 1.5, kpis: [
          { name: 'Supply Chain Concentration Index (HHI)', description: 'Herfindahl-Hirschman Index of sourcing country concentration (lower = more resilient)', baselineValue: 0.41, targetValue: 0.18, currentValue: 0.41, unit: 'index', frequency: 'quarterly', owner: 'Chief Supply Chain Officer', status: 'critical' },
          { name: 'Dual-Sourced SKU Rate', description: 'Percentage of top-50 SKUs with at least 2 qualified source suppliers in different countries', baselineValue: 18, targetValue: 85, currentValue: 18, unit: '%', frequency: 'quarterly', owner: 'VP Procurement', status: 'at-risk' },
          { name: 'Supply Chain Disruption Recovery Time', description: 'Average days to restore normal supply after a tier-1 disruption event', baselineValue: 42, targetValue: 14, currentValue: 42, unit: 'days', frequency: 'per incident', owner: 'Chief Supply Chain Officer', status: 'at-risk' },
        ]},
        { perspective: 'internal_process', objective: 'Digitize Trade and Customs Operations', description: 'Deploy digital trade documentation, automated compliance, and real-time shipment visibility across all key trade corridors', weight: 1.3, kpis: [
          { name: 'FTA Utilization Rate', description: 'Percentage of FTA-eligible transactions claiming preferential tariff treatment', baselineValue: 31, targetValue: 80, currentValue: 31, unit: '%', frequency: 'quarterly', owner: 'Head of Trade Compliance', status: 'critical' },
          { name: 'Digital Customs Clearance Rate', description: 'Percentage of shipments using fully electronic documentation and customs submission', baselineValue: 20, targetValue: 85, currentValue: 20, unit: '%', frequency: 'monthly', owner: 'CTO', status: 'at-risk' },
          { name: 'Customs Clearance Cycle Time', description: 'Average days from port arrival to customs clearance completion', baselineValue: 5.2, targetValue: 1.0, currentValue: 5.2, unit: 'days', frequency: 'monthly', owner: 'Head of Trade Compliance', status: 'at-risk' },
        ]},
        { perspective: 'learning_growth', objective: 'Build Trade Intelligence and Geopolitical Capability', description: 'Develop strategic market intelligence capability enabling proactive trade routing, market entry, and regulatory compliance ahead of policy changes', weight: 1.2, kpis: [
          { name: 'Trade Intelligence Reports Produced', description: 'Proactive trade intelligence briefs issued to leadership per quarter', baselineValue: 2, targetValue: 12, currentValue: 2, unit: 'reports/quarter', frequency: 'quarterly', owner: 'VP Strategy', status: 'on-track' },
          { name: 'Policy Change Lead Time', description: 'Average days advance notice of trade policy changes before effective date', baselineValue: 8, targetValue: 45, currentValue: 8, unit: 'days', frequency: 'per event', owner: 'Head of Trade Compliance', status: 'at-risk' },
        ]},
        { perspective: 'learning_growth', objective: 'Develop Trade Finance and Digital Capability', description: 'Build team capabilities in digital trade finance, e-commerce export, and currency risk management to support next-generation trade operations', weight: 1.1, kpis: [
          { name: 'Staff FTA and Trade Compliance Certified', description: 'Number of staff with professional trade compliance certifications (CTCS, CCS)', baselineValue: 4, targetValue: 18, currentValue: 4, unit: 'staff', frequency: 'annually', owner: 'CHRO', status: 'on-track' },
          { name: 'Digital Trade Platform Adoption', description: 'Percentage of export transactions initiated through digital trade platforms', baselineValue: 12, targetValue: 55, currentValue: 12, unit: '%', frequency: 'quarterly', owner: 'Chief Digital Officer', status: 'on-track' },
        ]},
      ],
    },
    created_at: '2026-03-05T00:00:00Z',
    updated_at: '2026-04-10T00:00:00Z',
  },

  // ===== 10. BANGSAMORO INVESTMENT ROADMAP (UPDATED WITH HTML DATA) =====
  {
    id: 'tmpl-bangsamoro-investment',
    name: 'Bangsamoro Investment Roadmap 2026-2035',
    description: 'Comprehensive strategic investment roadmap for regional development focusing on the Bangsamoro Economic & Investment Ecosystem (BEIE). Integrates halal industry ecosystem excellence, infrastructure-energy nexus, and moral governance through systems thinking (CLDs, Archetypes) and a 3-phase implementation architecture (Foundation, Acceleration, Consolidation).',
    industry: 'government',
    category: 'builtin',
    icon: 'Landmark',
    color: 'emerald',
    tags: ['halal industry', 'investment promotion', 'BIMP-EAGA', 'moral governance', 'regional development', 'Islamic finance', 'peacebuilding', 'systems thinking'],
    usage_count: 342,
    rating: 4.9,
    rating_count: 56,
    is_public: true,
    plan_data: {
      name: 'Bangsamoro Investment Roadmap 2026-2035',
      organization: 'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)',
      vision: '"The Emerging Bangsamoro: A Hub for Resilient and Ethical Growth" — transitioning from post-conflict recovery to the Philippines\' premier halal, agro-industrial, and sustainable investment destination.',
      mission: 'To create an empowered, cohesive, and progressive Bangsamoro through moral governance, sustainable investment attraction, and inclusive economic development that consolidates peace and prosperity.',
      strategicIntent: 'Achieve ₱550B GRDP by 2035, secure ₱15B in annual investment approvals, certify 5,000+ halal enterprises, and achieve 100% electrification and 85% broadband connectivity through the Integrated Halal-Driven Investment Strategy and Bangsamoro Economic & Investment Ecosystem (BEIE).',
      swotItems: [
        // Strengths
        { category: 'strength', description: 'Halal Legitimacy & Cultural Credibility: Inherent authenticity derived from Islamic heritage and Moral Governance framework (RI: 5.0)', impactScore: 5, likelihoodScore: 5 },
        { category: 'strength', description: 'Strategic Location in BIMP-EAGA: Permanent geographic asset serving as gateway to 70M+ ASEAN consumers (RI: 4.0)', impactScore: 5, likelihoodScore: 5 },
        { category: 'strength', description: 'Strong Agriculture Base: Vast agricultural lands and fisheries contributing 32.4% of GRDP (PHP 97.2B)', impactScore: 4, likelihoodScore: 5 },
        { category: 'strength', description: 'Growing Policy Recognition: Increasing legislative momentum under Bangsamoro Organic Law (BOL) with 55 autonomous powers', impactScore: 4, likelihoodScore: 4 },
        { category: 'strength', description: 'Domestic Halal Demand: Rapidly expanding internal consumer base of 5.69M with specific religious consumption needs', impactScore: 5, likelihoodScore: 5 },
        { category: 'strength', description: 'Moral Governance Framework: Emphasis on transparency, integrity, and accountability aligning with global ESG criteria', impactScore: 4, likelihoodScore: 4 },
        // Weaknesses
        { category: 'weakness', description: 'Weak Certification System: BHB lacks OIC/SMIIC recognition, limiting international market access (Risk: 20.0)', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'Critical Infrastructure Deficits: Only ~75% electrification and <30% broadband connectivity (Risk: 25.0)', impactScore: 5, likelihoodScore: 5 },
        { category: 'weakness', description: 'Fragmented Policy Frameworks: Coordination gaps between 15 ministries slow investment facilitation', impactScore: 4, likelihoodScore: 4 },
        { category: 'weakness', description: 'Lack of Halal Experts: Shortage of technical personnel, auditors, and skilled labor for certification', impactScore: 4, likelihoodScore: 5 },
        { category: 'weakness', description: 'Skills Mismatch: 59.3% functional literacy rate (lowest nationally) creates human capital constraints', impactScore: 5, likelihoodScore: 4 },
        { category: 'weakness', description: 'Insufficient Local Raw Materials: High dependency on imports limits competitiveness of halal manufacturing', impactScore: 4, likelihoodScore: 4 },
        // Opportunities
        { category: 'opportunity', description: 'Global Halal Market: Massive external demand in USD 2.3T+ global halal economy across food, cosmetics, pharma', impactScore: 5, likelihoodScore: 5 },
        { category: 'opportunity', description: 'Islamic Finance Ecosystem: Development of Shariah-compliant capital sources (banking, Takaful, Sukuk) by 2028', impactScore: 5, likelihoodScore: 4 },
        { category: 'opportunity', description: 'BIMP-EAGA Market Access: Subregional economic cooperation targeting 70M+ consumers through trade corridors', impactScore: 5, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Digital Transformation: Phased ICT expansion under BEGMP 2024–2033 targeting 85% broadband by 2035', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Green Economy & Carbon Markets: Monetizing forest endowments through REDD+ and Payment for Ecosystem Services', impactScore: 4, likelihoodScore: 4 },
        { category: 'opportunity', description: 'Post-Conflict Reconstruction Funding: Access to ODA and international development funding for institution-building', impactScore: 4, likelihoodScore: 3 },
        // Threats
        { category: 'threat', description: 'Climate Change Vulnerabilities: Environmental shocks (typhoons, El Niño) threatening 4.2% AFF contraction (VI: 5.0)', impactScore: 5, likelihoodScore: 5 },
        { category: 'threat', description: 'Competition from Established Halal Hubs: Malaysia, Indonesia, Thailand hold first-mover advantages (VI: 4.0)', impactScore: 5, likelihoodScore: 4 },
        { category: 'threat', description: 'Standards Recognition Risks: Risk of non-acceptance by OIC/SMIIC undermines export market access (VI: 4.0)', impactScore: 5, likelihoodScore: 4 },
        { category: 'threat', description: 'Investment Perception Risks: Residual negative reputation from historical conflict deters cautious investors', impactScore: 4, likelihoodScore: 4 },
        { category: 'threat', description: 'Political Transition Uncertainty: Instability risks associated with shift from BTA to fully elected parliament', impactScore: 4, likelihoodScore: 4 },
        { category: 'threat', description: 'Security Incidents: Sporadic events can trigger rapid investor caution, activating Security-Investment Tensions loop', impactScore: 4, likelihoodScore: 3 },
      ],
      strategicOptions: [
        // SO (Strengths-Opportunities)
        { optionType: 'SO', title: 'Premier Halal Hub Development', description: 'Leverage cultural credibility and BIMP-EAGA location to establish Bangsamoro Halal Park in Matanog as flagship ecozone for halal manufacturing, targeting OIC/SMIIC international accreditation.', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'SO', title: 'BIMP-EAGA Trade Corridor Initiative', description: 'Capitalize on strategic location to establish dedicated trade corridors with BIMP-EAGA partners, targeting PHP 50B intra-regional trade by 2035.', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'SO', title: 'Agri-Halal Value Chain Integration', description: 'Utilize strong agriculture base (32.4% GRDP) and domestic demand to build integrated halal value chains connecting smallholder producers to processing and export markets.', priorityScore: 5, feasibilityScore: 4, selected: true },
        // ST (Strengths-Threats)
        { optionType: 'ST', title: 'Halal Certification Security & Standards', description: 'Strengthen Bangsamoro Halal Board (BHB) credibility and security to differentiate from established hubs while ensuring political transition stability through inclusive governance.', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Climate-Resilient Infrastructure', description: 'Address climate vulnerabilities (VI: 5.0) while leveraging agriculture base through climate-smart agricultural practices and disaster-resilient infrastructure investment.', priorityScore: 4, feasibilityScore: 4, selected: true },
        { optionType: 'ST', title: 'Investor Confidence Assurance', description: 'Mitigate perception risks by leveraging policy recognition to provide transparent governance, clear regulatory frameworks, and sustained peace process commitment.', priorityScore: 4, feasibilityScore: 4, selected: true },
        // WO (Weaknesses-Opportunities)
        { optionType: 'WO', title: 'Digital Infrastructure Leapfrogging', description: 'Address infrastructure gaps by leveraging digital transformation opportunities through BEGMP implementation, targeting 1-day digital business registration and 85% broadband by 2035.', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'WO', title: 'Islamic Finance Ecosystem Build-out', description: 'Overcome lack of experts by partnering with international Islamic finance institutions to establish Shariah-compliant banking, Takaful, and microfinance vehicles by 2028.', priorityScore: 4, feasibilityScore: 3, selected: true },
        { optionType: 'WO', title: 'Green Economy Framework Activation', description: 'Monetize environmental assets by enacting Bangsamoro Forestry Code and operationalizing Carbon Credits, PES, and Eco-tourism User Fees through MENRE-MILG JMC.', priorityScore: 5, feasibilityScore: 4, selected: true },
        // WT (Weaknesses-Threats)
        { optionType: 'WT', title: 'Governance Capacity Building (BICC)', description: 'Establish Bangsamoro Investment Command Center (BICC) for real-time tracking, cross-agency synchronization, and trigger-based budgeting to prevent fragmentation.', priorityScore: 5, feasibilityScore: 4, selected: true },
        { optionType: 'WT', title: 'Security-Investment Safeguards', description: 'Mitigate security risks affecting investment perception through comprehensive risk management, insurance mechanisms, and peacebuilding integration.', priorityScore: 4, feasibilityScore: 3, selected: false },
        { optionType: 'WT', title: 'Sustainable Import Substitution', description: 'Reduce import dependency by developing local alternatives for critical inputs while building climate-resilient supply chains and raw material production scale-up.', priorityScore: 4, feasibilityScore: 4, selected: true },
      ],
      objectives: [
        {
          perspective: 'financial',
          objective: 'Accelerate Investment Inflows & Export Growth',
          description: 'Grow both domestic and foreign direct investment to drive economic expansion, targeting ₱15B annual approvals and ₱40B+ in export value by 2035.',
          weight: 1.5,
          kpis: [
            { name: 'Annual Investment Approvals', description: 'Total investment inflows approved annually', baselineValue: 5.1, targetValue: 15.0, currentValue: 5.1, unit: '₱B', frequency: 'annually', owner: 'BBOI Chair', status: 'on-track' },
            { name: 'Total Export Value', description: 'Total value of halal-certified and agro-industrial exports', baselineValue: 10, targetValue: 40, currentValue: 10, unit: '₱B', frequency: 'annually', owner: 'MTIT Minister', status: 'at-risk' },
            { name: 'Local Revenue to Total Budget', description: 'Percentage of budget from local revenue sources vs block grants', baselineValue: 10, targetValue: 30, currentValue: 10, unit: '%', frequency: 'annually', owner: 'Minister of Finance', status: 'on-track' },
          ],
        },
        {
          perspective: 'customer',
          objective: 'Enhance Investor Satisfaction & Empower MSMEs',
          description: 'Provide world-class investment facilitation services and build capacity for micro, small, and medium enterprises through halal certification and Islamic finance.',
          weight: 1.4,
          kpis: [
            { name: 'Investor Satisfaction Score', description: 'Overall investor satisfaction rating (1-10 scale)', baselineValue: 6.0, targetValue: 8.0, currentValue: 6.0, unit: 'score', frequency: 'annually', owner: 'BBOI Chair', status: 'on-track' },
            { name: 'Halal-Certified Enterprises', description: 'Total number of certified micro, small, and medium enterprises', baselineValue: 500, targetValue: 5000, currentValue: 500, unit: 'enterprises', frequency: 'annually', owner: 'BHB Director', status: 'on-track' },
            { name: 'Intra-EAGA Trade Value', description: 'Total trade value with BIMP-EAGA partner countries', baselineValue: 0, targetValue: 50, currentValue: 0, unit: '₱B', frequency: 'annually', owner: 'MTIT Minister', status: 'on-track' },
          ],
        },
        {
          perspective: 'internal_process',
          objective: 'Streamline Facilitation & Strengthen Halal Standards',
          description: 'Reduce time and complexity of business registration while achieving international OIC/SMIIC accreditation for the Bangsamoro Halal Board (BHB).',
          weight: 1.5,
          kpis: [
            { name: 'Business Registration Time', description: 'Days required to complete digital business name registration', baselineValue: 7, targetValue: 1, currentValue: 7, unit: 'days', frequency: 'monthly', owner: 'BBOI Chair', status: 'on-track' },
            { name: 'BHB International Accreditation', description: 'Achievement of OIC/SMIIC accreditation status (binary milestone)', baselineValue: 0, targetValue: 1, currentValue: 0, unit: 'accredited', frequency: 'annually', owner: 'BHB Director', status: 'on-track' },
            { name: 'Budget Execution Rate', description: 'Percentage of approved budget actually spent on development programs', baselineValue: 80, targetValue: 90, currentValue: 80, unit: '%', frequency: 'quarterly', owner: 'BPDA Executive Dir', status: 'at-risk' },
          ],
        },
        {
          perspective: 'internal_process',
          objective: 'Accelerate Infrastructure & Digital Delivery',
          description: 'Expedite critical infrastructure projects supporting investment, particularly energy (ZBIP) and digital connectivity (BEGMP).',
          weight: 1.3,
          kpis: [
            { name: 'Electrification Rate', description: 'Percentage of households and businesses with electricity access', baselineValue: 75, targetValue: 100, currentValue: 75, unit: '%', frequency: 'annually', owner: 'MENRE Minister', status: 'on-track' },
            { name: 'Broadband Connectivity', description: 'Percentage of population with high-speed internet access', baselineValue: 30, targetValue: 85, currentValue: 30, unit: '%', frequency: 'annually', owner: 'MTIT Minister', status: 'at-risk' },
          ],
        },
        {
          perspective: 'learning_growth',
          objective: 'Build Halal Expertise & Institutional Capacity',
          description: 'Develop technical capacity in halal certification, establish the Bangsamoro Investment Command Center (BICC), and foster a data-driven culture.',
          weight: 1.2,
          kpis: [
            { name: 'Halal Certification Officers Trained', description: 'Number of professionally trained and accredited halal auditors', baselineValue: 10, targetValue: 100, currentValue: 10, unit: 'officers', frequency: 'annually', owner: 'BHB Director', status: 'on-track' },
            { name: 'BICC Operationalization Status', description: 'Establishment and activation of Bangsamoro Investment Command Center', baselineValue: 0, targetValue: 1, currentValue: 0, unit: 'operational', frequency: 'annually', owner: 'BPDA Executive Dir', status: 'on-track' },
            { name: 'Islamic Finance Professionals', description: 'Number of certified Islamic finance practitioners in the region', baselineValue: 5, targetValue: 50, currentValue: 5, unit: 'professionals', frequency: 'annually', owner: 'BBOI Chair', status: 'on-track' },
          ],
        },
      ],
    },
    created_at: '2026-04-14T00:00:00Z',
    updated_at: '2026-06-20T00:00:00Z',
  },
];

export const getTemplatesByIndustry = (industry: string): PlanTemplate[] => {
  if (industry === 'all') return BUILTIN_TEMPLATES;
  return BUILTIN_TEMPLATES.filter(t => t.industry === industry);
};

export const getTemplateById = (id: string): PlanTemplate | undefined => {
  return BUILTIN_TEMPLATES.find(t => t.id === id);
};

export const COLOR_MAP: Record<string, { bg: string; text: string; border: string; light: string; gradient: string }> = {
  rose: { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200', light: 'bg-rose-50', gradient: 'from-rose-500 to-pink-600' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-600', border: 'border-violet-200', light: 'bg-violet-50', gradient: 'from-violet-500 to-purple-600' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50', gradient: 'from-amber-500 to-orange-600' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50', gradient: 'from-emerald-500 to-green-600' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200', light: 'bg-orange-50', gradient: 'from-orange-500 to-red-600' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-600', border: 'border-pink-200', light: 'bg-pink-50', gradient: 'from-pink-500 to-rose-600' },
  sky: { bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-200', light: 'bg-sky-50', gradient: 'from-sky-500 to-blue-600' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50', gradient: 'from-blue-500 to-indigo-600' },
  yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200', light: 'bg-yellow-50', gradient: 'from-yellow-500 to-amber-600' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200', light: 'bg-cyan-50', gradient: 'from-cyan-500 to-blue-600' },
  green: { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200', light: 'bg-green-50', gradient: 'from-green-500 to-emerald-600' },
};
