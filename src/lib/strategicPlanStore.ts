// ============================================================================
// STRATEGIC PLAN STORE - User-Aware Version WITH PUBLIC ACCESS
// ============================================================================
export interface UserInfo {
id: string;
email: string;
name: string;
avatar?: string;
role?: 'owner' | 'admin' | 'editor' | 'viewer';
}
export interface Comment {
id: string;
planId: string;
itemType: 'general' | 'swot' | 'strategy' | 'objective' | 'kpi' | 'pap' | 'cld-node' | 'archetype';
itemId: string;
userId: string;
userName: string;
userEmail: string;
content: string;
isResolved: boolean;
createdAt: string;
updatedAt?: string;
replies?: Comment[];
}
export interface ActivityLogEntry {
id: string;
planId: string;
organizationId?: string;
userId: string;
userName: string;
userEmail: string;
actionType: 'create' | 'update' | 'delete' | 'share' | 'invite' | 'comment' | 'resolve' | 'apply_archetype' | 'modify_cld' | 'score_swot' | 'unshare' | 'remove';
itemType: 'plan' | 'organization' | 'member' | 'swot' | 'strategy' | 'objective' | 'kpi' | 'pap' | 'cld' | 'archetype' | 'comment';
itemId?: string;
description: string;
metadata?: Record<string, any>;
createdAt: string;
}
export interface CLDNodeData {
id: string;
label: string;
x: number;
y: number;
category?: 'strength' | 'weakness' | 'opportunity' | 'threat' | 'custom';
createdBy?: string;
createdByName?: string;
createdAt?: string;
modifiedBy?: string;
modifiedAt?: string;
comments?: Comment[];
}
export interface CLDLinkData {
from: string;
to: string;
polarity: '+' | '-';
createdBy?: string;
createdAt?: string;
}
export interface CLDSnapshot {
id: string;
planId: string;
name: string;
nodes: CLDNodeData[];
links: CLDLinkData[];
appliedArchetypeId?: string;
createdBy: string;
createdByName: string;
createdAt: string;
notes?: string;
}
export interface SWOTItem {
id: string;
category: 'strength' | 'weakness' | 'opportunity' | 'threat';
description: string;
impactScore: number;
likelihoodScore: number;
aiGenerated: boolean;
// User tracking
createdBy?: string;
createdByEmail?: string;
createdByName?: string;
createdAt?: string;
modifiedBy?: string;
modifiedByEmail?: string;
modifiedByName?: string;
modifiedAt?: string;
// Collaboration
comments?: Comment[];
assignedTo?: string; // User ID for accountability
}
export interface StrategicOption {
id: string;
optionType: 'SO' | 'ST' | 'WO' | 'WT';
title: string;
description: string;
priorityScore: number;
feasibilityScore: number;
selected: boolean;
// User tracking
createdBy?: string;
createdByEmail?: string;
createdByName?: string;
createdAt?: string;
modifiedBy?: string;
modifiedByEmail?: string;
modifiedByName?: string;
modifiedAt?: string;
proposedBy?: string; // User who suggested this option
approvedBy?: string; // User who approved/selected
approvedAt?: string;
}
export interface KPI {
id: string;
objectiveId: string;
name: string;
description: string;
baselineValue: number;
targetValue: number;
currentValue: number;
unit: string;
frequency: string;
owner: string; // User ID responsible
ownerName?: string;
ownerEmail?: string;
status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
// User tracking
updatedBy?: string;
updatedByName?: string;
updatedAt?: string;
updates?: {
value: number;
updatedBy: string;
updatedByName: string;
updatedAt: string;
note?: string;
}[];
}
export interface BSCObjective {
id: string;
perspective: 'financial' | 'customer' | 'internal_process' | 'learning_growth';
objective: string;
description: string;
weight: number;
kpis: KPI[];
// User tracking
createdBy?: string;
createdByName?: string;
createdAt?: string;
modifiedBy?: string;
modifiedByName?: string;
modifiedAt?: string;
champion?: string; // User ID accountable for this objective
championName?: string;
}
export interface PAP {
id: string;
objectiveId?: string;
papType: 'program' | 'activity' | 'project';
name: string;
description: string;
owner: string; // User ID
ownerName?: string;
ownerEmail?: string;
budget: number;
spent: number;
startDate: string;
endDate: string;
progress: number;
status: 'planned' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
// User tracking
createdBy?: string;
createdByName?: string;
createdAt?: string;
modifiedBy?: string;
modifiedByName?: string;
modifiedAt?: string;
progressUpdates?: {
progress: number;
spent: number;
updatedBy: string;
updatedByName: string;
updatedAt: string;
note?: string;
}[];
teamMembers?: string[]; // User IDs
}
export interface PlanVersion {
version: number;
savedBy: string;
savedByName: string;
savedAt: string;
changes: string[];
snapshot: Partial<StrategicPlan>;
}
export interface PlanShare {
id: string;
planId: string;
sharedWithEmail: string;
sharedWithName?: string;
sharedWithUserId?: string;
permission: 'viewer' | 'editor' | 'admin';
sharedBy: string;
sharedByName: string;
createdAt: string;
expiresAt?: string;
permissions?: {
canEditCLD: boolean;
canApplyArchetypes: boolean;
canModifySWOT: boolean;
canViewComments: boolean;
canAddComments: boolean;
};
}
export interface PresenceUser {
userId: string;
userName: string;
userEmail: string;
currentSection: string;
currentSubSection?: string;
editingItemId?: string;
editingItemType?: string;
isEditing: boolean;
cursorX?: number;
cursorY?: number;
lastSeen: string;
}
export interface StrategicPlan {
id: string;
name: string;
organization: string;
vision: string;
mission: string;
strategicIntent: string;
planningPeriodStart: string;
planningPeriodEnd: string;
status: 'draft' | 'active' | 'archived';
swotItems: SWOTItem[];
strategicOptions: StrategicOption[];
objectives: BSCObjective[];
paps: PAP[];
// User tracking
createdBy: string;
createdByEmail: string;
createdByName: string;
createdAt: string;
updatedBy?: string;
updatedByEmail?: string;
updatedByName?: string;
updatedAt: string;
// Collaboration
contributors: string[]; // User IDs who've contributed
version?: number;
versionHistory?: PlanVersion[];
// --- PUBLIC SHARING FIELDS ---
custom_share_url?: string; // Slug for public route /p/{slug}
public_access?: 'none' | 'view' | 'comment'; // Permission level for non-auth users
// Systems Thinking
cldSnapshots?: CLDSnapshot[];
appliedArchetypes?: {
archetypeId: string;
appliedBy: string;
appliedByName: string;
appliedAt: string;
notes?: string;
}[];
}
// ============================================================================
// STORAGE FUNCTIONS - User-Aware
// ============================================================================
const getStorageKey = (userId?: string) =>
userId ? `strategic-planner-data-${userId}` : 'strategic-planner-data';
export const generateId = () => crypto.randomUUID();

// Generates a URL-safe slug (uuid-based for uniqueness)
export const generateSlug = (): string => {
const uuid = crypto.randomUUID().replace(/-/g, '');
return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}`;
};

export const loadFromStorage = (userId?: string): {
plans: StrategicPlan[];
currentPlanId: string | null;
userPreferences?: Record<string, any>;
} => {
try {
const data = localStorage.getItem(getStorageKey(userId));
if (data) {
return JSON.parse(data);
}
} catch (e) {
console.error('Failed to load from storage:', e);
}
return { plans: [], currentPlanId: null };
};
export const saveToStorage = (
plans: StrategicPlan[],
currentPlanId: string | null,
userId?: string,
userPreferences?: Record<string, any>
) => {
try {
localStorage.setItem(getStorageKey(userId), JSON.stringify({
plans,
currentPlanId,
userPreferences,
savedAt: new Date().toISOString()
}));
} catch (e) {
console.error('Failed to save to storage:', e);
}
};
export const exportPlanForSharing = (plan: StrategicPlan, userInfo: UserInfo): string => {
const exportData = {
...plan,
_exportedBy: userInfo,
_exportedAt: new Date().toISOString(),
_exportVersion: '2.0'
};
return btoa(JSON.stringify(exportData));
};
export const importPlanFromShare = (base64Data: string, userInfo: UserInfo): StrategicPlan | null => {
try {
const data = JSON.parse(atob(base64Data));
const plan: StrategicPlan = {
...createEmptyPlan({ name: `${data.name} (Imported)` }),
...data,
id: generateId(),
createdBy: userInfo.id,
createdByEmail: userInfo.email,
createdByName: userInfo.name,
createdAt: new Date().toISOString(),
updatedBy: userInfo.id,
updatedByEmail: userInfo.email,
updatedByName: userInfo.name,
updatedAt: new Date().toISOString(),
contributors: [userInfo.id],
status: 'draft'
};
return plan;
} catch (e) {
console.error('Failed to import plan:', e);
return null;
}
};
// ============================================================================
// FACTORY FUNCTIONS - User-Aware
// ============================================================================
export const createEmptyPlan = (
  data: Partial<StrategicPlan> = {},
  userInfo?: UserInfo
): StrategicPlan => {
const now = new Date().toISOString();
const userId = userInfo?.id || 'anonymous';
const userEmail = userInfo?.email || 'anonymous@example.com';
const userName = userInfo?.name || 'Anonymous User';
return {
id: generateId(),
name: data.name || 'New Strategic Plan',
organization: data.organization || '',
vision: data.vision || '',
mission: data.mission || '',
strategicIntent: data.strategicIntent || '',
planningPeriodStart: data.planningPeriodStart || new Date().toISOString().split('T')[0],
planningPeriodEnd:
data.planningPeriodEnd ||
new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
status: 'draft',
swotItems: [],
strategicOptions: [],
objectives: [],
paps: [],
createdBy: userId,
createdByEmail: userEmail,
createdByName: userName,
createdAt: now,
updatedBy: userId,
updatedByEmail: userEmail,
updatedByName: userName,
updatedAt: now,
contributors: [userId],
version: 1,
// --- DEFAULT SHARING CONFIG ---
custom_share_url: undefined,
public_access: 'none',
...data,
};
};
// ============================================================================
// SAMPLE PLAN - Bangsamoro Investment Roadmap 2026-2035
// ============================================================================
export const createSamplePlan = (userInfo?: UserInfo): StrategicPlan => {
const userId = userInfo?.id || 'demo-user';
const userEmail = userInfo?.email || 'demo@example.com';
const userName = userInfo?.name || 'Demo User';
const plan = createEmptyPlan({
name: 'Bangsamoro Investment Roadmap 2026–2035',
organization: 'Ministry of Trade, Investments and Tourism (MTIT) – BARMM',
vision:
'Everyone enjoys the benefits of inclusive and resilient economic development propelled by sustainable trade, investments, and tourism in the Bangsamoro.',
mission:
"To develop and promote industrialization effectively controlled by the region's inhabitants and to act as catalyst for intensified private sector activity in order to accelerate and sustain economic growth.",
strategicIntent:
'The Ministry of Trade, Investments and Tourism (MTIT) is the primary government agency mandated to implement laws, programs, and projects on trade, investments, and tourism. Towards this end, it shall promote and develop an industrialization program effectively controlled by inhabitants of the Bangsamoro Autonomous Region and shall act as catalyst for intensified private sector activity in order to accelerate and sustain economic growth through: (a) a Comprehensive Industrial Growth Strategy; (b) a Progressive and Socially Responsible Liberalization Program; and (c) Policies designed for the expansion and diversification of trade.',
planningPeriodStart: '2026-01-01',
planningPeriodEnd: '2035-12-31',
}, userInfo);
// Helper to create user-attributed items
const createItem = (item: T): T & {
createdBy: string;
createdByEmail: string;
createdByName: string;
createdAt: string;
} => ({
...item,
createdBy: userId,
createdByEmail: userEmail,
createdByName: userName,
createdAt: new Date().toISOString(),
});
// ── SWOT Items ──────────────────────────────────────────────────────────────
plan.swotItems = [
// Strengths
createItem({
id: generateId(),
category: 'strength' as const,
description:
"Halal legitimacy and cultural credibility derived from the region's Islamic heritage and \"Moral Governance\" framework.",
impactScore: 5,
likelihoodScore: 5,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'strength' as const,
description:
'Strategic location within BIMP-EAGA, serving as a gateway to a market of over 70 million ASEAN consumers.',
impactScore: 5,
likelihoodScore: 5,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'strength' as const,
description:
'Strong agriculture base with vast agricultural lands and fisheries forming the backbone of the regional economy.',
impactScore: 4,
likelihoodScore: 5,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'strength' as const,
description:
'Growing policy recognition through increasing legislative momentum and authority granted by the Bangsamoro Organic Law (BOL).',
impactScore: 4,
likelihoodScore: 4,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'strength' as const,
description:
'Expanding domestic halal demand from a rapidly growing internal consumer base of 5.69 million with specific religious consumption needs.',
impactScore: 4,
likelihoodScore: 4,
aiGenerated: false,
}),
// Weaknesses
createItem({
id: generateId(),
category: 'weakness' as const,
description:
`Weak halal certification system — a deficit in standardized certification that currently limits international market access.`,
impactScore: 5,
likelihoodScore: 4,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'weakness' as const,
description:
`Fragmented policy frameworks with coordination gaps among 15 ministries that slow down investment facilitation.`,
impactScore: 4,
likelihoodScore: 4,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'weakness' as const,
description:
`Limited infrastructure — critical deficits in electrification (39% rate as of 2024), digital connectivity, and transport hubs.`,
impactScore: 5,
likelihoodScore: 5,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'weakness' as const,
description:
`Lack of halal experts — shortage of technical personnel, auditors, and skilled labor for modern agri-processing.`,
impactScore: 4,
likelihoodScore: 5,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'weakness' as const,
description:
`Insufficient local raw material production — high dependency on imports for industrial inputs due to gaps in the local value chain.`,
impactScore: 4,
likelihoodScore: 4,
aiGenerated: false,
}),

// Opportunities
createItem({
id: generateId(),
category: 'opportunity' as const,
description:
`Expanding global halal market (USD 2 trillion+) with massive external demand for halal-compliant goods and services worldwide.`,
impactScore: 5,
likelihoodScore: 5,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'opportunity' as const,
description:
`ASEAN integration enabling regional standards alignment for seamless cross-border trade facilitation.`,
impactScore: 4,
likelihoodScore: 4,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'opportunity' as const,
description:
`Islamic finance ecosystem development through Shariah-compliant capital sources including Islamic banking and Takaful.`,
impactScore: 4,
likelihoodScore: 4,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'opportunity' as const,
description:
`BIMP-EAGA market — subregional economic cooperation initiative targeting over 70 million consumers.`,
impactScore: 4,
likelihoodScore: 5,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'opportunity' as const,
description:
`Digital transformation through phased ICT infrastructure expansion targeting 70% internet penetration by 2030.`,
impactScore: 4,
likelihoodScore: 3,
aiGenerated: false,
}),

// Threats
createItem({
id: generateId(),
category: 'threat' as const,
description:
`Competition from established halal hubs (e.g., Malaysia) that may capture investors and resources first.`,
impactScore: 4,
likelihoodScore: 4,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'threat' as const,
description:
`Standards recognition risk — non-acceptance of BARMM certifications by international bodies like OIC/SMIIC.`,
impactScore: 5,
likelihoodScore: 3,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'threat' as const,
description:
`Investment perception risks — residual negative reputation from historical conflict that deters cautious investors.`,
impactScore: 5,
likelihoodScore: 4,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'threat' as const,
description:
`Climate vulnerabilities — environmental shocks like typhoons and flooding that threaten agricultural assets.`,
impactScore: 4,
likelihoodScore: 4,
aiGenerated: false,
}),
createItem({
id: generateId(),
category: 'threat' as const,
description:
`Political transition uncertainty — instability risks associated with the shift to a regular, elected parliament.`,
impactScore: 4,
likelihoodScore: 3,
aiGenerated: false,
}),
];
// ── Strategic Options ────────────────────────────────────────────────────────
plan.strategicOptions = [
// SO Strategies
createItem({
id: generateId(),
optionType: 'SO',
title: 'Integrated Halal-Driven Investment Strategy (Recommended)',
description:
`Integrate halal industry development, infrastructure enablement, and governance strengthening into a coherent framework. The halal industry serves as the primary value proposition; infrastructure prioritized for halal value chains; governance reforms focused on certification and trade facilitation. Maximizes synergies and triggers virtuous cycles of growth.`,
priorityScore: 5,
feasibilityScore: 5,
selected: true,
approvedBy: userId,
approvedAt: new Date().toISOString(),
}),
createItem({
id: generateId(),
optionType: 'SO',
title: 'Halal Hub Rapid Development',
description:
"Leverage Bangsamoro's unique cultural authenticity to rapidly develop the halal industry ecosystem. Focus on certification capacity, Bangsamoro Halal Park development in Matanog, and value chain integration targeting the USD 2T global halal market.",
priorityScore: 5,
feasibilityScore: 4,
selected: true,
approvedBy: userId,
approvedAt: new Date().toISOString(),
}),
createItem({
id: generateId(),
optionType: 'SO',
title: 'BIMP-EAGA Trade Corridor Expansion',
description:
`Leverage strategic geographic location within BIMP-EAGA and strong agricultural base to expand subregional trade. Modernize Polloc Freeport and Economic Zone (PFEZ) as gateway to the 70M+ consumer market across Brunei, Indonesia, Malaysia, and Philippines.`,
priorityScore: 4,
feasibilityScore: 4,
selected: true,
approvedBy: userId,
approvedAt: new Date().toISOString(),
}),
createItem({
id: generateId(),
optionType: 'SO',
title: 'Islamic Finance Ecosystem Development',
description:
"Utilize Bangsamoro's halal legitimacy and growing policy recognition to develop Shariah-compliant financial services. Establish Islamic banking operations, Takaful, and Sukuk instruments by 2028 to provide financing for MSMEs and attract ethical investors globally.",
priorityScore: 4,
feasibilityScore: 3,
selected: true,
approvedBy: userId,
approvedAt: new Date().toISOString(),
}),
// ST Strategies
createItem({
id: generateId(),
optionType: 'ST',
title: 'Governance-Centered Confidence Building',
description:
`Prioritize regulatory clarity, transparency, and institutional strengthening to counter negative investment perception. Streamline business registration and permitting, enhance anti-corruption measures, and establish one-stop investment facilitation centers with clear service standards.`,
priorityScore: 4,
feasibilityScore: 4,
selected: true,
approvedBy: userId,
approvedAt: new Date().toISOString(),
}),
createItem({
id: generateId(),
optionType: 'ST',
title: 'OIC/SMIIC Halal Accreditation Fast-Track',
description:
`Align Bangsamoro Halal Board certification processes with international OIC/SMIIC standards to mitigate standards recognition risk and compete with established halal hubs. Obtain mutual recognition agreements with Malaysia and GCC countries.`,
priorityScore: 5,
feasibilityScore: 3,
selected: true,
approvedBy: userId,
approvedAt: new Date().toISOString(),
}),
createItem({
id: generateId(),
optionType: 'ST',
title: 'Climate-Smart Agribusiness Program',
description:
"Deploy climate-resilient agricultural practices and disaster-proof infrastructure to protect the region's strong agricultural base from growing climate vulnerabilities. Integrate disaster risk reduction into farm-to-market road and cold chain logistics development.",
priorityScore: 3,
feasibilityScore: 4,
selected: false,
}),

// WO Strategies
createItem({
id: generateId(),
optionType: 'WO',
title: 'Infrastructure-First Foundation Building',
description:
`Address infrastructure deficits (energy, connectivity, transport) before aggressive investment promotion. Achieve 80% electrification by 2028 and 100% by 2030 per BSEMP. Expand digital connectivity through BEGMP to reach 70% internet penetration by 2030 — raising the overall growth ceiling.`,
priorityScore: 5,
feasibilityScore: 3,
selected: true,
approvedBy: userId,
approvedAt: new Date().toISOString(),
}),
createItem({
id: generateId(),
optionType: 'WO',
title: 'Halal Human Capital Development Program',
description:
`Close the halal expertise gap by establishing a Halal Training Academy in partnership with OIC institutions and regional universities. Target 100 certified halal officers and 50 Islamic finance professionals by 2035 to support the expanding global halal market.`,
priorityScore: 4,
feasibilityScore: 4,
selected: true,
approvedBy: userId,
approvedAt: new Date().toISOString(),
}),
createItem({
id: generateId(),
optionType: 'WO',
title: 'Digital MSME Market Access Platform',
description:
`Deploy e-commerce platforms and agritech solutions to connect Bangsamoro MSMEs to national and BIMP-EAGA markets, overcoming fragmented policy frameworks through digital integration. Implement digital halal traceability systems for certification and quality assurance.`,
priorityScore: 3,
feasibilityScore: 4,
selected: false,
}),

// WT Strategies
createItem({
id: generateId(),
optionType: 'WT',
title: 'Institutional Coordination & Policy Integration Reform',
description:
`Address fragmented policy frameworks and political transition uncertainty through systemic inter-agency coordination reforms. Strengthen BEDC as the apex coordination body; implement results-based M&E systems; and institutionalize adaptive planning to maintain investment continuity across governance transitions.`,
priorityScore: 4,
feasibilityScore: 3,
selected: true,
approvedBy: userId,
approvedAt: new Date().toISOString(),
}),
createItem({
id: generateId(),
optionType: 'WT',
title: 'Local Raw Material Value Chain Integration',
description:
`Reduce dependency on imported industrial inputs by investing in local agricultural value chains, food processing, and raw material production. Mitigates both the weakness of insufficient local raw materials and the threat of competition from established halal hubs with deeper supply chains.`,
priorityScore: 3,
feasibilityScore: 3,
selected: false,
}),
];
// [Objectives and PAPs would follow same pattern with user attribution...]
// For brevity, I'll include a sample of each:
const obj1Id = generateId();
plan.objectives = [
{
id: obj1Id,
perspective: 'financial',
objective: 'Increase Investment Inflows to PHP 50 Billion by 2035',
description:
'Grow both domestic and foreign direct investment to drive economic expansion and job creation, from PHP 3.5B (2024) to PHP 50B (2035).',
weight: 1.5,
kpis: [
{
id: generateId(),
objectiveId: obj1Id,
name: 'Total Investment Generated',
description: 'Cumulative annual investment inflows into BARMM priority sectors',
baselineValue: 3.5,
targetValue: 50,
currentValue: 5.2,
unit: 'PHP Billion',
frequency: 'annually',
owner: userId,
ownerName: userName,
status: 'on-track',
},
],
createdBy: userId,
createdByName: userName,
createdAt: new Date().toISOString(),
champion: userId,
championName: userName,
},
// ... additional objectives
];
plan.paps = [
{
id: generateId(),
objectiveId: obj1Id,
papType: 'program',
name: 'Bangsamoro Halal Board (BHB) Operationalization',
description:
'Establish and operationalize the BHB as a credible, internationally recognized halal certification body aligned with OIC/SMIIC standards.',
owner: userId,
ownerName: userName,
ownerEmail: userEmail,
budget: 500000000,
spent: 125000000,
startDate: '2026-01-01',
endDate: '2028-12-31',
progress: 25,
status: 'in-progress',
createdBy: userId,
createdByName: userName,
createdAt: new Date().toISOString(),
teamMembers: [userId],
},
// ... additional PAPs
];
return plan;
};
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
export const getUserInitials = (name: string) =>
name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
export const getUserColor = (userId: string) => {
const colors = [
'from-blue-500 to-cyan-500',
'from-emerald-500 to-teal-500',
'from-violet-500 to-purple-500',
'from-amber-500 to-orange-600',
'from-rose-500 to-pink-500',
'from-indigo-500 to-blue-600',
];
let hash = 0;
for (let i = 0; i < userId.length; i++) {
hash = userId.charCodeAt(i) + ((hash << 5) - hash);
}
return colors[Math.abs(hash) % colors.length];
};
export const canEdit = (plan: StrategicPlan, userId: string, userRole?: string) => {
if (plan.createdBy === userId) return true;
if (userRole === 'admin' || userRole === 'owner') return true;
return false;
};
export const canDelete = (plan: StrategicPlan, userId: string, userRole?: string) => {
if (plan.createdBy === userId) return true;
if (userRole === 'owner') return true;
return false;
};