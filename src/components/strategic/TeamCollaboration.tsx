import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Users,
  Building2,
  Plus,
  X,
  Mail,
  Shield,
  Eye,
  Edit3,
  Crown,
  UserPlus,
  Settings,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  MessageSquare,
  Activity,
  Share2,
  Copy,
  ExternalLink,
  Clock,
  User,
  Send,
  RefreshCw,
  Link2,
  Info,
  Bell,
  Target,
  Trophy,
  Zap,
  Calendar,
  Video,
  MessageCircle,
  Award,
  FolderKanban,
  Search,
  LayoutDashboard,
  Bookmark,
  Phone,
  Filter,
  Tag,
  TrendingUp,
  AlertTriangle,
  Flag,
  CheckCircle2,
  BarChart3,
  Megaphone,
  MoreHorizontal,
  ChevronDown,
  Play,
  FileText,
  Globe,
  RotateCcw,
  Pencil,
} from 'lucide-react';
import { StrategicPlan } from '@/lib/strategicPlanStore';
import { PresenceUser, CursorPosition } from '@/hooks/useStrategicPlan';
import { cn } from '@/lib/utils';

interface TeamCollaborationProps {
  plan: StrategicPlan;
  userId?: string;
  userEmail?: string;
  userName?: string;
  presenceUsers?: Record<string, PresenceUser[]>;
  cursors?: Record<string, CursorPosition>;
  onCursorUpdate?: (x: number, y: number) => void;
}

interface Organization {
  id: string;
  name: string;
  description?: string;
  owner_id?: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
}

interface Member {
  id: string;
  user_id?: string;
  user_email: string;
  user_name: string;
  role: 'viewer' | 'editor' | 'admin' | 'owner';
  joined_at: string;
  status?: 'active' | 'pending' | 'invited';
}

interface PlanShare {
  id: string;
  shared_with_email: string;
  permission: 'viewer' | 'editor' | 'admin';
  created_at: string;
}

interface Comment {
  id: string;
  user_name: string;
  user_email: string;
  user_id: string;
  content: string;
  is_resolved: boolean;
  created_at: string;
  pap_item_id?: string;
  pap_item_name?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  importance?: 'low' | 'medium' | 'high' | 'critical';
  mentions?: string[];
}

interface KpiItem {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  status: 'on_track' | 'at_risk' | 'off_track' | 'critical';
  owner?: string;
  due_date?: string;
  description?: string;
}

interface ActivityItem {
  id: string;
  user_name: string;
  description: string;
  created_at: string;
  type: 'comment' | 'share' | 'member' | 'kpi' | 'system';
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  read: boolean;
  created_at: string;
  link?: string;
}

interface PapItem {
  id: string;
  name: string;
  priority: number;
  status: string;
}

interface ResourceItem {
  id: number;
  title: string;
  url: string;
  type: 'video' | 'article' | 'prototype';
  category: string;
  description: string;
}

type TabType = 'team' | 'sharing' | 'comments' | 'activity' | 'kpis' | 'resources';
type CommentFilter = 'all' | 'urgent' | 'important' | 'pap_related' | 'unresolved';

const getWindowProperty = <T,>(name: string, defaultValue: T): T => {
  if (typeof window !== 'undefined') {
    const value = (window as any)[name];
    return value !== undefined ? value : defaultValue;
  }
  return defaultValue;
};

const RESOURCES: ResourceItem[] = [
  { id: 1, title: 'The Iceberg Model: Why SWOT Listing Is Not Enough', url: 'https://youtu.be/y6h2_EcOOcM?si=3DWAm3dMJ7LzOjAS', type: 'video', category: 'Systems Thinking', description: 'Understand why surface-level analysis fails and how to see deeper systemic structures.' },
  { id: 2, title: 'How Systems Thinking is Used to Manage Complexity', url: 'https://youtu.be/Eklkuy4RBOo?si=-jLNBvPQUpKU2BU0', type: 'video', category: 'Systems Thinking', description: 'MIT instructors, faculty and industry experts break down how systems thinking is used to manage complexity.' },
  { id: 3, title: 'Introduction to Systems Thinking In Local Government Finance', url: 'https://youtu.be/gsogqS__Ljo?si=Ttlck54LP1puxJYW', type: 'video', category: 'Systems Thinking', description: 'Applying systems thinking frameworks to public financial management.' },
  { id: 4, title: 'Systems Story', url: 'https://youtu.be/rDxOyJxgJeA?si=5BEduhhg-0t9ER1S', type: 'video', category: 'Systems Thinking', description: 'Narrative approach to understanding complex adaptive systems.' },
  { id: 5, title: 'Causal Loop Diagrams', url: 'https://youtu.be/tTo06jbSZ4M?si=mSyIfuUvpeXPsrW', type: 'video', category: 'Systems Thinking', description: 'Visual tools for mapping feedback loops and system behavior.' },
  { id: 6, title: 'Systems Archetypes', url: 'https://youtu.be/zRmEh-PMvWo?si=DnxR-3n4I-382hKT', type: 'video', category: 'Systems Thinking', description: 'Common recurring systemic patterns and their dynamics.' },
  { id: 7, title: 'Systems Mapping', url: 'https://youtu.be/fXxFz-Tr6Zg?si=ex8z5t7u3HtmBrbW', type: 'video', category: 'Systems Thinking', description: 'Methodologies for creating comprehensive system maps.' },
  { id: 8, title: 'Leverage Points', url: 'https://youtu.be/ZKdyIz14Niw?si=i6J-8SNjFSuPzDMz', type: 'video', category: 'Systems Thinking', description: 'Identifying high-impact intervention points in complex systems.' },
  { id: 9, title: 'Leverage Points (Readings)', url: 'https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/', type: 'article', category: 'Systems Thinking', description: 'Donella Meadows\' seminal essay on intervention hierarchy.' },
  { id: 10, title: 'Systems Innovation', url: 'https://youtu.be/rVGoeFAW0FM?si=yOgB50q26R_G389G', type: 'video', category: 'Innovation', description: 'How to drive transformative change through systemic innovation.' },
  { id: 11, title: 'What is a Balanced Scorecard', url: 'https://youtu.be/OLdlpeMVmuk?si=mhHAWJr-UisjyV8P', type: 'video', category: 'BSC', description: 'Foundational overview of the Balanced Scorecard framework.' },
  { id: 12, title: 'Prototype of BIRD 2026 - 2035', url: 'https://asilvainnovations.github.io/barmm-investment-roadmap/roadmap.html', type: 'prototype', category: 'Prototype', description: 'Interactive strategic roadmap prototype for reference and inspiration.' },
  { id: 13, title: 'Strat Plan Pro User Manual', url: 'https://asilvainnovations.github.io/strat-planner-pwa/user-manual.html', type: 'document', category: 'Strat Plan Pro', description: 'The complete guide to AI-powered strategic planning — from your first SWOT to print-ready board reports. Designed for leaders who demand precision and results.' },
];

// ── Presence Ribbon (exportable for Topbar) ──────────────
export function PresenceRibbon({
  presenceUsers,
  currentUserId,
  maxAvatars = 5,
}: {
  presenceUsers: Record<string, PresenceUser[]>;
  currentUserId?: string;
  maxAvatars?: number;
}) {
  const users = useMemo(() => {
    return Object.values(presenceUsers)
      .flat()
      .filter((u, i, arr) => arr.findIndex((x) => x.user_id === u.user_id) === i)
      .filter((u) => u.user_id !== currentUserId);
  }, [presenceUsers, currentUserId]);

  const displayUsers = users.slice(0, maxAvatars);
  const remaining = users.length - maxAvatars;

  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-1" aria-label={`${users.length} collaborators online`}>
      <span className="text-xs text-slate-500 mr-1.5 font-medium hidden lg:inline">Live</span>
      {displayUsers.map((u) => (
        <div
          key={u.user_id}
          className="relative group"
          title={u.user_name}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm transition-transform hover:scale-110"
            style={{ backgroundColor: u.color }}
          >
            {u.user_name?.charAt(0).toUpperCase()}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {u.user_name}
          </div>
        </div>
      ))}
      {remaining > 0 && (
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold border-2 border-white">
          +{remaining}
        </div>
      )}
    </div>
  );
}

// ── Live Cursors Overlay ─────────────────────────────────
function LiveCursors({
  cursors,
  currentUserId,
}: {
  cursors: Record<string, CursorPosition>;
  currentUserId?: string;
}) {
  const activeCursors = useMemo(() => {
    return Object.values(cursors).filter((c) => c.user_id !== currentUserId);
  }, [cursors, currentUserId]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden" aria-hidden="true">
      {activeCursors.map((cursor) => (
        <div
          key={cursor.user_id}
          className="absolute transition-all duration-150 ease-out"
          style={{ left: cursor.x, top: cursor.y }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: cursor.color }}>
            <path
              d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z"
              fill="currentColor"
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
          <span
            className="absolute left-4 top-4 px-2 py-1 rounded-md text-xs font-semibold text-white whitespace-nowrap shadow-sm"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.user_name}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────
const TeamCollaboration: React.FC<TeamCollaborationProps> = ({
  plan,
  userId = 'demo-user',
  userEmail = 'demo@example.com',
  userName = 'Demo User',
  presenceUsers,
  cursors,
  onCursorUpdate,
}) => {
  // Core states
  const [activeTab, setActiveTab] = useState<TabType>('team');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [planShares, setPlanShares] = useState<PlanShare[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [kpis, setKpis] = useState<KpiItem[]>([]);
  const [papItems, setPapItems] = useState<PapItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [commentFilter, setCommentFilter] = useState<CommentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isManagingCustomUrl, setIsManagingCustomUrl] = useState(false);
  const [showKpiDetail, setShowKpiDetail] = useState<string | null>(null);

  // Admin Org Management States
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);
  const [resettingOrg, setResettingOrg] = useState<Organization | null>(null);

  // Form States
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [newComment, setNewComment] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customUrlSuccess, setCustomUrlSuccess] = useState('');

  // Comment context
  const [selectedPapItem, setSelectedPapItem] = useState<string>('');
  const [commentUrgency, setCommentUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [commentImportance, setCommentImportance] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [kpiAlerts, setKpiAlerts] = useState(true);
  const [mentionAlerts, setMentionAlerts] = useState(true);

  const notifRef = useRef<HTMLDivElement>(null);
  const createOrgInputRef = useRef<HTMLInputElement>(null);
  const editOrgInputRef = useRef<HTMLInputElement>(null);

  // Determine current user's role in selected org
  const currentUserOrgRole = useMemo(() => {
    const member = members.find((m) => (m.user_id && m.user_id === userId) || m.user_email === userEmail);
    return member?.role || 'viewer';
  }, [members, userId, userEmail]);

  const canManageOrg = useCallback((role?: string) => {
    return role === 'owner' || role === 'admin';
  }, []);

  // ── Realtime cursor tracking ───────────────────────────
  useEffect(() => {
    if (!onCursorUpdate) return;
    const handleMouseMove = (e: MouseEvent) => {
      onCursorUpdate(e.clientX, e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [onCursorUpdate]);

  // ── Sync KPIs / PAPs from realtime plan updates ──────────
  useEffect(() => {
    if (plan?.objectives) {
      const planKpis = plan.objectives.flatMap((obj: any) => obj.kpis || []);
      if (planKpis.length > 0) {
        setKpis(planKpis);
      }
    }
  }, [plan?.objectives]);

  useEffect(() => {
    if (plan?.paps && plan.paps.length > 0) {
      setPapItems(
        plan.paps.map((p: any) => ({
          id: p.id,
          name: p.name,
          priority: p.priority ?? 1,
          status: p.status ?? 'pending',
        }))
      );
    }
  }, [plan?.paps]);

  // Initialize Custom URL
  useEffect(() => {
    if (plan.custom_share_url) {
      setCustomUrl(plan.custom_share_url);
    } else {
      const origin = getWindowProperty('location.origin', 'https://example.com');
      const safeName = plan.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      setCustomUrl(`${origin}/p/${safeName}`);
    }
  }, [plan.id, plan.custom_share_url, plan.name]);

  // Clear messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (customUrlSuccess) {
      const timer = setTimeout(() => setCustomUrlSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [customUrlSuccess]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key to close modals
  useEffect(() => {
    const anyModalOpen = showCreateOrgModal || showInviteModal || showShareModal || editingOrg || deletingOrg || resettingOrg;
    if (!anyModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCreateOrgModal(false);
        setShowInviteModal(false);
        setShowShareModal(false);
        setEditingOrg(null);
        setDeletingOrg(null);
        setResettingOrg(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCreateOrgModal, showInviteModal, showShareModal, editingOrg, deletingOrg, resettingOrg]);

  // Focus first input when modals open
  useEffect(() => {
    if (showCreateOrgModal && createOrgInputRef.current) {
      setTimeout(() => createOrgInputRef.current?.focus(), 50);
    }
    if (editingOrg && editOrgInputRef.current) {
      setTimeout(() => editOrgInputRef.current?.focus(), 50);
    }
  }, [showCreateOrgModal, editingOrg]);

  // === DATA LOADING ===

  const loadOrganizations = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('organizations').select('*');
      if (error) throw error;
      setOrganizations(data || []);
      if (data && data.length > 0 && !selectedOrg) {
        setSelectedOrg(data[0]);
        await loadMembers(data[0].id);
      }
    } catch (err: any) {
      console.warn('Orgs error:', err.message);
    }
  }, [selectedOrg]);

  const loadMembers = useCallback(async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', orgId);
      if (error) throw error;
      setMembers(data || []);
    } catch (err: any) {
      console.warn('Members error:', err.message);
    }
  }, []);

  const loadPlanShares = useCallback(async () => {
    if (!plan?.id) return;
    try {
      const { data, error } = await supabase
        .from('plan_shares')
        .select('*')
        .eq('plan_id', plan.id);
      if (error) throw error;
      setPlanShares(data || []);
    } catch (err: any) {
      console.warn('Shares error:', err.message);
    }
  }, [plan?.id]);

  const loadComments = useCallback(async () => {
    if (!plan?.id) return;
    try {
      const { data, error } = await supabase
        .from('plan_comments')
        .select('*')
        .eq('plan_id', plan.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setComments(data || []);
    } catch (err: any) {
      console.warn('Comments error:', err.message);
    }
  }, [plan?.id]);

  const loadActivities = useCallback(async () => {
    if (!plan?.id) return;
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('plan_id', plan.id)
        .limit(50);
      if (error) throw error;
      setActivities(data || []);
    } catch (err: any) {
      console.warn('Activities error:', err.message);
    }
  }, [plan?.id]);

  const loadKpis = useCallback(async () => {
    if (!plan?.id) return;
    try {
      const { data, error } = await supabase
        .from('kpis')
        .select('*')
        .eq('plan_id', plan.id);
      if (error) throw error;
      setKpis(data || []);
    } catch (err: any) {
      console.warn('KPIs error:', err.message);
      // Demo data fallback
      setKpis([
        { id: '1', name: 'Revenue Growth', target: 100, current: 78, unit: '%', status: 'on_track', owner: 'Finance Team', due_date: '2026-12-31', description: 'Annual revenue growth target' },
        { id: '2', name: 'Customer Satisfaction', target: 90, current: 82, unit: 'NPS', status: 'at_risk', owner: 'CX Team', due_date: '2026-06-30', description: 'Net Promoter Score target' },
        { id: '3', name: 'Operational Efficiency', target: 85, current: 60, unit: '%', status: 'off_track', owner: 'Operations', due_date: '2026-09-30', description: 'Process automation rate' },
      ]);
    }
  }, [plan?.id]);

  const loadPapItems = useCallback(async () => {
    if (!plan?.id) return;
    try {
      const { data, error } = await supabase
        .from('pap_items')
        .select('id, name, priority, status')
        .eq('plan_id', plan.id);
      if (error) throw error;
      setPapItems(data || []);
    } catch (err: any) {
      console.warn('PAP error:', err.message);
      setPapItems([
        { id: 'p1', name: 'Digital Transformation Initiative', priority: 1, status: 'in_progress' },
        { id: 'p2', name: 'Stakeholder Engagement Program', priority: 2, status: 'pending' },
        { id: 'p3', name: 'Risk Mitigation Protocol', priority: 1, status: 'urgent' },
      ]);
    }
  }, [plan?.id]);

  const loadNotifications = useCallback(async () => {
    // Simulated notifications - in production, fetch from Supabase
    setNotifications([
      { id: '1', title: 'KPI Alert', message: 'Customer Satisfaction is at risk (82/90)', type: 'warning', read: false, created_at: new Date(Date.now() - 3600000).toISOString(), link: '#kpis' },
      { id: '2', title: 'New Comment', message: 'Alex mentioned you in "Digital Transformation Initiative"', type: 'info', read: false, created_at: new Date(Date.now() - 7200000).toISOString(), link: '#comments' },
      { id: '3', title: 'Member Joined', message: 'Sarah Chen joined as Editor', type: 'success', read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
    ]);
  }, []);

  useEffect(() => {
    loadOrganizations();
    loadPlanShares();
    loadComments();
    loadActivities();
    loadKpis();
    loadPapItems();
    loadNotifications();
  }, [loadOrganizations, loadPlanShares, loadComments, loadActivities, loadKpis, loadPapItems, loadNotifications]);

  // === ACTIONS ===

  const createOrganization = useCallback(async () => {
    if (!newOrgName.trim()) { setError('Organization name is required'); return; }
    setIsLoading(true); setError(null);
    try {
      const { data, error } = await supabase.from('organizations').insert({
        name: newOrgName,
        description: newOrgDescription,
        owner_id: userId
      }).select().single();
      if (error) throw error;
      await supabase.from('organization_members').insert({
        organization_id: data.id, user_id: userId, user_email: userEmail, user_name: userName, role: 'owner',
      });
      setOrganizations([data, ...organizations]);
      setSelectedOrg(data);
      setShowCreateOrgModal(false);
      setNewOrgName('');
      setNewOrgDescription('');
      setSuccess('Organization created successfully!');
      await loadMembers(data.id);
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  }, [newOrgName, newOrgDescription, userId, userEmail, userName, organizations, loadMembers]);

  const updateOrganization = useCallback(async () => {
    if (!editingOrg) return;
    if (!editingOrg.name.trim()) { setError('Organization name is required'); return; }
    if (!canManageOrg(currentUserOrgRole)) { setError('You do not have permission to edit this organization.'); return; }

    setIsLoading(true); setError(null);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: editingOrg.name,
          description: editingOrg.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingOrg.id);
      if (error) throw error;

      setOrganizations(prev => prev.map(o => o.id === editingOrg.id ? { ...o, ...editingOrg } : o));
      if (selectedOrg?.id === editingOrg.id) {
        setSelectedOrg(prev => prev ? { ...prev, ...editingOrg } : prev);
      }
      setEditingOrg(null);
      setSuccess('Organization updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update organization.');
    } finally {
      setIsLoading(false);
    }
  }, [editingOrg, currentUserOrgRole, selectedOrg]);

  const deleteOrganization = useCallback(async () => {
    if (!deletingOrg) return;
    if (!canManageOrg(currentUserOrgRole)) {
      setError('You do not have permission to delete this organization.');
      setDeletingOrg(null);
      return;
    }

    setIsLoading(true); setError(null);
    try {
      // Delete members first to avoid FK constraints if no cascade
      await supabase.from('organization_members').delete().eq('organization_id', deletingOrg.id);
      const { error } = await supabase.from('organizations').delete().eq('id', deletingOrg.id);
      if (error) throw error;

      setOrganizations(prev => prev.filter(o => o.id !== deletingOrg.id));
      if (selectedOrg?.id === deletingOrg.id) {
        setSelectedOrg(null);
        setMembers([]);
      }
      setDeletingOrg(null);
      setSuccess('Organization deleted successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to delete organization.');
    } finally {
      setIsLoading(false);
    }
  }, [deletingOrg, currentUserOrgRole, selectedOrg]);

  const resetOrganization = useCallback(async () => {
    if (!resettingOrg) return;
    if (!canManageOrg(currentUserOrgRole)) {
      setError('You do not have permission to reset this organization.');
      setResettingOrg(null);
      return;
    }

    setIsLoading(true); setError(null);
    try {
      // Remove all non-owner members
      const { error: memberError } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', resettingOrg.id)
        .neq('role', 'owner');
      if (memberError) throw memberError;

      // Ensure owner is active
      await supabase
        .from('organization_members')
        .update({ status: 'active' })
        .eq('organization_id', resettingOrg.id)
        .eq('role', 'owner');

      // Clear plan shares for this org's plans if needed, or reset other data
      // For now we just reset the team membership

      await loadMembers(resettingOrg.id);
      setResettingOrg(null);
      setSuccess('Organization reset successfully. All non-owner members have been removed.');
    } catch (err: any) {
      setError(err.message || 'Failed to reset organization.');
    } finally {
      setIsLoading(false);
    }
  }, [resettingOrg, currentUserOrgRole, loadMembers]);

  const inviteMember = useCallback(async () => {
    if (!inviteEmail.trim() || !selectedOrg) { setError('Email is required'); return; }
    setIsLoading(true); setError(null);
    try {
      await supabase.from('organization_members').insert({
        organization_id: selectedOrg.id, user_email: inviteEmail, user_name: inviteEmail.split('@')[0], role: inviteRole, status: 'invited',
      });
      // Send email notification
      if (emailNotifications) {
        sendEmailNotification(inviteEmail, `You've been invited to ${selectedOrg.name}`, `Join as ${inviteRole}`);
      }
      setShowInviteModal(false);
      setInviteEmail(''); setInviteRole('viewer');
      setSuccess(`Invitation sent to ${inviteEmail}`);
      await loadMembers(selectedOrg.id);
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  }, [inviteEmail, selectedOrg, inviteRole, loadMembers, emailNotifications]);

  const sharePlan = useCallback(async () => {
    if (!shareEmail.trim() || !plan?.id) { setError('Email is required'); return; }
    setIsLoading(true); setError(null);
    try {
      await supabase.from('plan_shares').insert({
        plan_id: plan.id, shared_with_email: shareEmail, permission: sharePermission,
      });
      if (emailNotifications) {
        sendEmailNotification(shareEmail, `Shared: ${plan.name}`, `Access level: ${sharePermission}`);
      }
      setShowShareModal(false);
      setShareEmail(''); setSharePermission('viewer');
      setSuccess(`Plan shared with ${shareEmail}`);
      await loadPlanShares();
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  }, [shareEmail, sharePermission, plan?.id, loadPlanShares, emailNotifications, plan?.name]);

  const addComment = useCallback(async () => {
    if (!newComment.trim() || !plan?.id) { setError('Comment is required'); return; }
    setIsLoading(true); setError(null);
    try {
      const papItem = papItems.find(p => p.id === selectedPapItem);
      await supabase.from('plan_comments').insert({
        plan_id: plan.id, user_id: userId, user_name: userName, user_email: userEmail,
        content: newComment, pap_item_id: selectedPapItem || null,
        pap_item_name: papItem?.name || null,
        urgency: commentUrgency, importance: commentImportance,
      });
      setNewComment(''); setSelectedPapItem(''); setCommentUrgency('medium'); setCommentImportance('medium');
      setSuccess('Comment added!');
      await loadComments();
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  }, [newComment, userId, userName, userEmail, plan?.id, selectedPapItem, papItems, commentUrgency, commentImportance, loadComments]);

  const resolveComment = useCallback(async (commentId: string) => {
    try {
      await supabase.from('plan_comments').update({ is_resolved: true }).eq('id', commentId);
      await loadComments();
      setSuccess('Comment resolved');
    } catch (err: any) { console.error('Resolve error:', err.message); }
  }, [loadComments]);

  const removeMember = useCallback(async (memberId: string, memberEmail: string) => {
    if (!confirm(`Remove ${memberEmail}?`)) return;
    try {
      await supabase.from('organization_members').delete().eq('id', memberId);
      setMembers(members.filter((m) => m.id !== memberId));
      setSuccess('Member removed');
    } catch (err: any) { setError('Failed to remove member'); }
  }, [members]);

  const removeShare = useCallback(async (shareId: string, email: string) => {
    if (!confirm(`Remove access for ${email}?`)) return;
    try {
      await supabase.from('plan_shares').delete().eq('id', shareId);
      setPlanShares(planShares.filter((s) => s.id !== shareId));
      setSuccess('Share removed');
    } catch (err: any) { setError('Failed to remove share'); }
  }, [planShares]);

  const saveCustomUrl = useCallback(async () => {
    if (!customUrl.trim()) { setCustomUrlSuccess('URL cannot be empty'); return; }
    try {
      await supabase.from('strategic_plans').update({ custom_share_url: customUrl }).eq('id', plan.id);
      setCustomUrlSuccess('Custom URL saved!');
      setIsManagingCustomUrl(false);
    } catch (err: any) { console.error('Save error:', err.message); }
  }, [customUrl, plan.id]);

  const getPlanShareUrl = useCallback((org?: Organization) => {
    if (!plan) return '';
    if (plan.custom_share_url && plan.custom_share_url.startsWith('http')) return plan.custom_share_url;
    const orgSlug = org?.slug || 'default';
    const planSlug = plan.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const origin = getWindowProperty('location.origin', 'https://example.com');
    return `${origin}/organization/${orgSlug}/plan/${planSlug}`;
  }, [plan]);

  const copyToClipboard = useCallback(async (text: string) => {
    try { await navigator.clipboard.writeText(text); setSuccess('Copied to clipboard!'); }
    catch { setError('Failed to copy'); }
  }, []);

  const shareViaWhatsApp = useCallback((text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }, []);

  const sendEmailNotification = (to: string, subject: string, body: string) => {
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\n---\nSent from Strategic Planning Platform')}`;
    window.open(mailto, '_blank');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // === UTILITY ===

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'editor': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getUrgencyColor = (level?: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getKpiStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-emerald-600';
      case 'at_risk': return 'bg-amber-500';
      case 'off_track': return 'bg-orange-500';
      case 'critical': return 'bg-red-600';
      default: return 'bg-slate-500';
    }
  };

  const getKpiStatusText = (status: string) => {
    switch (status) {
      case 'on_track': return 'On Track';
      case 'at_risk': return 'At Risk';
      case 'off_track': return 'Off Track';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };

  const filteredComments = comments.filter(c => {
    if (searchQuery) {
      return c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
             c.pap_item_name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    switch (commentFilter) {
      case 'urgent': return c.urgency === 'high' || c.urgency === 'critical';
      case 'important': return c.importance === 'high' || c.importance === 'critical';
      case 'pap_related': return !!c.pap_item_id;
      case 'unresolved': return !c.is_resolved;
      default: return true;
    }
  });

  // === TABS CONFIG ===

  const tabs = [
    { id: 'team' as TabType, label: 'Team', icon: Users },
    { id: 'sharing' as TabType, label: 'Sharing', icon: Share2 },
    { id: 'comments' as TabType, label: 'Discussions', icon: MessageSquare },
    { id: 'kpis' as TabType, label: 'Critical KPIs', icon: Target },
    { id: 'activity' as TabType, label: 'Activity', icon: Activity },
    { id: 'resources' as TabType, label: 'Resources', icon: Bookmark },
  ];

  // === RENDER: TEAM ===

  const renderTeamTab = () => (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Organizations</h2>
          <p className="text-base text-slate-600 mt-1 leading-relaxed">Manage teams and access control</p>
        </div>
        <button
          onClick={() => setShowCreateOrgModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-cyan-700 text-white rounded-xl text-base font-medium hover:bg-cyan-800 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          aria-label="Create new organization"
        >
          <Plus className="w-5 h-5" aria-hidden="true" /> Create Organization
        </button>
      </div>

      <div className="grid gap-4 mb-8" role="list" aria-label="Organizations list">
        {organizations.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" aria-hidden="true" />
            <p className="text-slate-700 font-medium text-base">No organizations yet</p>
            <p className="text-base text-slate-600 mt-2 leading-relaxed">Create one to start collaborating</p>
          </div>
        ) : (
          organizations.map((org) => (
            <div
              key={org.id}
              onClick={() => { setSelectedOrg(org); loadMembers(org.id); }}
              className={cn(
                "p-5 rounded-xl border-2 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-cyan-500",
                selectedOrg?.id === org.id
                  ? 'border-cyan-600 bg-cyan-50/60 shadow-sm'
                  : 'border-slate-200 hover:border-slate-400 hover:shadow-sm bg-white'
              )}
              role="listitem"
              aria-selected={selectedOrg?.id === org.id}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedOrg(org);
                  loadMembers(org.id);
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0" aria-hidden="true">
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-base truncate">{org.name}</p>
                  <p className="text-sm text-slate-600 truncate leading-relaxed">{org.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedOrg?.id === org.id && <Check className="w-5 h-5 text-cyan-700" aria-hidden="true" />}

                  {canManageOrg(currentUserOrgRole) && (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setEditingOrg(org)}
                        className="p-2 text-slate-500 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        aria-label={`Edit organization ${org.name}`}
                        title="Edit organization"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setResettingOrg(org)}
                        className="p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                        aria-label={`Reset organization ${org.name}`}
                        title="Reset organization"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingOrg(org)}
                        className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label={`Delete organization ${org.name}`}
                        title="Delete organization"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedOrg && (
        <div className="border-t-2 border-slate-200 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Team Members</h3>
              <p className="text-base text-slate-600 mt-1">{members.length} member{members.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => shareViaWhatsApp(`Join our strategic plan team: ${getPlanShareUrl(selectedOrg)}`)}
                className="flex items-center gap-2 px-4 py-3 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-sm font-medium hover:bg-emerald-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                aria-label="Share team invite via WhatsApp"
              >
                <Phone className="w-4 h-4" aria-hidden="true" /> WhatsApp
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                aria-label="Invite team member"
              >
                <UserPlus className="w-4 h-4" aria-hidden="true" /> Invite
              </button>
            </div>
          </div>

          <div className="space-y-3" role="list" aria-label="Team members">
            {members.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" aria-hidden="true" />
                <p className="text-slate-700 text-base">No members yet</p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-cyan-500"
                  role="listitem"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" aria-hidden="true">
                    {member.user_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-base">{member.user_name}</p>
                    <p className="text-sm text-slate-600">{member.user_email}</p>
                  </div>
                  <span className={cn(getRoleBadgeColor(member.role), "px-3 py-1 rounded-full text-xs font-semibold border")}>
                    {member.role}
                  </span>
                  {member.status === 'invited' && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">Pending</span>
                  )}
                  {member.role !== 'owner' && canManageOrg(currentUserOrgRole) && (
                    <button
                      onClick={() => removeMember(member.id, member.user_email)}
                      className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Remove member ${member.user_name}`}
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  // === RENDER: SHARING ===

  const renderSharingTab = () => (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Plan Sharing</h2>
          <p className="text-base text-slate-600 mt-1 leading-relaxed">Share &quot;{plan?.name}&quot; with stakeholders</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isManagingCustomUrl && (
            <button
              onClick={() => setIsManagingCustomUrl(true)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              aria-label="Customize share URL"
            >
              <Settings className="w-4 h-4" aria-hidden="true" /> Customize URL
            </button>
          )}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-cyan-700 text-white rounded-xl text-sm font-medium hover:bg-cyan-800 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            aria-label="Share plan"
          >
            <Share2 className="w-4 h-4" aria-hidden="true" /> Share Plan
          </button>
        </div>
      </div>

      <div className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <p className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Link2 className="w-4 h-4" aria-hidden="true" /> Share Link
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => shareViaWhatsApp(`Check out our strategic plan: ${getPlanShareUrl(selectedOrg || undefined)}`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              aria-label="Share via WhatsApp"
            >
              <Phone className="w-4 h-4" aria-hidden="true" /> WhatsApp
            </button>
            <button
              onClick={() => sendEmailNotification('', `Strategic Plan: ${plan?.name}`, `View here: ${getPlanShareUrl(selectedOrg || undefined)}`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Share via Email"
            >
              <Mail className="w-4 h-4" aria-hidden="true" /> Email
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={getPlanShareUrl(selectedOrg || undefined)}
            className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Shareable plan URL"
          />
          <button
            onClick={() => copyToClipboard(getPlanShareUrl(selectedOrg || undefined))}
            className="p-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Copy link to clipboard"
            title="Copy link"
          >
            <Copy className="w-5 h-5 text-slate-600" aria-hidden="true" />
          </button>
          <button
            onClick={() => window.open(getPlanShareUrl(selectedOrg || undefined), '_blank')}
            className="p-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Open share link in new tab"
            title="Open link"
          >
            <ExternalLink className="w-5 h-5 text-slate-600" aria-hidden="true" />
          </button>
        </div>
      </div>

      {isManagingCustomUrl && (
        <div className="mb-6 p-5 bg-cyan-50 border-2 border-cyan-200 rounded-xl">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-5 h-5 text-cyan-700 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="font-semibold text-cyan-900 text-base">Custom URL</h3>
              <p className="text-sm text-cyan-800 mt-1 leading-relaxed">Set a memorable link for easy access</p>
            </div>
            <button
              onClick={() => setIsManagingCustomUrl(false)}
              className="p-1 hover:bg-cyan-100 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Close custom URL editor"
            >
              <X className="w-5 h-5 text-cyan-800" aria-hidden="true" />
            </button>
          </div>
          <label htmlFor="custom-url" className="sr-only">Custom URL</label>
          <input
            id="custom-url"
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setIsManagingCustomUrl(false)}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={saveCustomUrl}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Save URL
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-slate-900 mb-4 text-base flex items-center gap-2">
          <Shield className="w-5 h-5" aria-hidden="true" /> Shared With
        </h3>
        <div className="space-y-3" role="list" aria-label="External shares">
          {planShares.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <Share2 className="w-10 h-10 text-slate-400 mx-auto mb-2" aria-hidden="true" />
              <p className="text-slate-700 text-base">Not shared externally yet</p>
            </div>
          ) : (
            planShares.map((share) => (
              <div
                key={share.id}
                className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-cyan-500"
                role="listitem"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" aria-hidden="true">
                  {share.shared_with_email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-base truncate">{share.shared_with_email}</p>
                  <span className={cn(getRoleBadgeColor(share.permission), "px-2.5 py-1 rounded-full text-xs font-semibold border inline-block mt-1")}>
                    {share.permission}
                  </span>
                </div>
                <button
                  onClick={() => removeShare(share.id, share.shared_with_email)}
                  className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label={`Revoke access for ${share.shared_with_email}`}
                  title="Revoke access"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // === RENDER: COMMENTS ===

  const renderCommentsTab = () => (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Discussions</h2>
          <p className="text-base text-slate-600 mt-1 leading-relaxed">Conversations on PAP items, KPIs, and strategy</p>
        </div>
        <button
          onClick={() => loadComments()}
          className="p-3 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 self-start"
          aria-label="Refresh discussions"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5 text-slate-600" aria-hidden="true" />
        </button>
      </div>

      {/* Comment Input */}
      <div className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" aria-hidden="true">
            {userName.charAt(0).toUpperCase()}
          </div>
          <label htmlFor="new-comment" className="sr-only">New comment</label>
          <input
            id="new-comment"
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Start a discussion... Use @ to mention"
            className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600 text-base placeholder:text-slate-500"
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && addComment()}
          />
          <button
            onClick={addComment}
            disabled={isLoading || !newComment.trim()}
            className="px-5 py-3 bg-cyan-700 text-white rounded-xl font-medium hover:bg-cyan-800 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            aria-label="Send comment"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Send className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 pl-12">
          <label htmlFor="pap-select" className="sr-only">Link to PAP item</label>
          <select
            id="pap-select"
            value={selectedPapItem}
            onChange={(e) => setSelectedPapItem(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Link to PAP Item (optional)</option>
            {papItems.map(pap => (
              <option key={pap.id} value={pap.id}>{pap.name}</option>
            ))}
          </select>

          <label htmlFor="urgency-select" className="sr-only">Urgency level</label>
          <select
            id="urgency-select"
            value={commentUrgency}
            onChange={(e) => setCommentUrgency(e.target.value as any)}
            className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="low">Urgency: Low</option>
            <option value="medium">Urgency: Medium</option>
            <option value="high">Urgency: High</option>
            <option value="critical">Urgency: Critical</option>
          </select>

          <label htmlFor="importance-select" className="sr-only">Importance level</label>
          <select
            id="importance-select"
            value={commentImportance}
            onChange={(e) => setCommentImportance(e.target.value as any)}
            className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="low">Importance: Low</option>
            <option value="medium">Importance: Medium</option>
            <option value="high">Importance: High</option>
            <option value="critical">Importance: Critical</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-4 py-3 flex-1 min-w-[200px] focus-within:ring-2 focus-within:ring-cyan-500">
          <Search className="w-5 h-5 text-slate-500" aria-hidden="true" />
          <label htmlFor="comment-search" className="sr-only">Search discussions</label>
          <input
            id="comment-search"
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-base outline-none text-slate-800 placeholder:text-slate-500 bg-transparent"
          />
        </div>
        {(['all', 'urgent', 'important', 'pap_related', 'unresolved'] as CommentFilter[]).map(filter => (
          <button
            key={filter}
            onClick={() => setCommentFilter(filter)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1",
              commentFilter === filter
                ? 'bg-slate-900 text-white border-slate-900 focus:ring-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 focus:ring-slate-400'
            )}
            aria-pressed={commentFilter === filter}
          >
            {filter === 'pap_related' ? 'PAP Linked' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Comments List */}
      <div className="space-y-4" role="feed" aria-label="Discussion comments">
        {filteredComments.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
            <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" aria-hidden="true" />
            <p className="text-slate-700 font-medium text-base">No discussions yet</p>
            <p className="text-base text-slate-600 mt-2 leading-relaxed">Start the conversation above</p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <article
              key={comment.id}
              className={cn(
                "p-5 rounded-xl border transition-all focus-within:ring-2 focus-within:ring-cyan-500",
                comment.is_resolved ? 'bg-slate-50 opacity-70 border-slate-200' : 'bg-white border-slate-200 hover:shadow-sm'
              )}
              aria-label={`Comment by ${comment.user_name}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" aria-hidden="true">
                  {comment.user_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-slate-900 text-sm">{comment.user_name}</span>
                    <time className="text-xs text-slate-500" dateTime={comment.created_at}>{formatTimeAgo(comment.created_at)}</time>
                    {comment.pap_item_name && (
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 border border-indigo-300 rounded-full text-xs font-semibold flex items-center gap-1">
                        <FolderKanban className="w-3 h-3" aria-hidden="true" /> {comment.pap_item_name}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-800 text-base leading-relaxed">{comment.content}</p>
                  <div className="flex items-center gap-2 mt-3">
                    {comment.urgency && (
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1", getUrgencyColor(comment.urgency))}>
                        <AlertTriangle className="w-3 h-3" aria-hidden="true" /> {comment.urgency}
                      </span>
                    )}
                    {comment.importance && (
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1", getUrgencyColor(comment.importance))}>
                        <Flag className="w-3 h-3" aria-hidden="true" /> {comment.importance}
                      </span>
                    )}
                  </div>
                </div>
                {!comment.is_resolved && (
                  <button
                    onClick={() => resolveComment(comment.id)}
                    className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label="Mark comment as resolved"
                    title="Mark resolved"
                  >
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );

  // === RENDER: KPIS ===

  const renderKpisTab = () => (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Critical KPIs</h2>
          <p className="text-base text-slate-600 mt-1 leading-relaxed">Track performance and strategic health</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadKpis()}
            className="p-3 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            aria-label="Refresh KPIs"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid gap-5" role="list" aria-label="Key performance indicators">
        {kpis.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
            <Target className="w-12 h-12 text-slate-400 mx-auto mb-3" aria-hidden="true" />
            <p className="text-slate-700 font-medium text-base">No KPIs configured</p>
          </div>
        ) : (
          kpis.map((kpi) => {
            const progress = Math.min(100, Math.round((kpi.current / kpi.target) * 100));
            return (
              <div
                key={kpi.id}
                className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all cursor-pointer focus-within:ring-2 focus-within:ring-cyan-500"
                onClick={() => setShowKpiDetail(showKpiDetail === kpi.id ? null : kpi.id)}
                role="listitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowKpiDetail(showKpiDetail === kpi.id ? null : kpi.id);
                  }
                }}
                aria-expanded={showKpiDetail === kpi.id}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 text-base">{kpi.name}</h3>
                      <span className={cn("px-3 py-1 rounded-full text-xs font-bold text-white", getKpiStatusColor(kpi.status))}>
                        {getKpiStatusText(kpi.status)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{kpi.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{kpi.current}<span className="text-sm text-slate-500 font-normal">/{kpi.target} {kpi.unit}</span></p>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${kpi.name} progress`}>
                  <div className={cn("h-full rounded-full transition-all", getKpiStatusColor(kpi.status))} style={{ width: `${progress}%` }} />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600 gap-2">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5"><User className="w-4 h-4" aria-hidden="true" /> {kpi.owner}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" aria-hidden="true" /> Due {kpi.due_date}</span>
                  </div>
                  <span className="font-semibold">{progress}% complete</span>
                </div>

                {showKpiDetail === kpi.id && (
                  <div className="mt-5 pt-5 border-t border-slate-200">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveTab('comments'); setSelectedPapItem(''); setNewComment(`Regarding KPI "${kpi.name}": `); }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        <MessageSquare className="w-4 h-4" aria-hidden="true" /> Discuss
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); shareViaWhatsApp(`KPI Update: ${kpi.name} is at ${kpi.current}/${kpi.target} ${kpi.unit} (${getKpiStatusText(kpi.status)})`); }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <Phone className="w-4 h-4" aria-hidden="true" /> Share on WhatsApp
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); sendEmailNotification('', `KPI Alert: ${kpi.name}`, `Current: ${kpi.current}/${kpi.target} ${kpi.unit}\nStatus: ${getKpiStatusText(kpi.status)}`); }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <Mail className="w-4 h-4" aria-hidden="true" /> Email Update
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // === RENDER: ACTIVITY ===

  const renderActivityTab = () => (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Activity Log</h2>
          <p className="text-base text-slate-600 mt-1 leading-relaxed">Recent changes and updates</p>
        </div>
        <button
          onClick={() => loadActivities()}
          className="p-3 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          aria-label="Refresh activity log"
        >
          <RefreshCw className="w-5 h-5 text-slate-600" aria-hidden="true" />
        </button>
      </div>
      <div className="space-y-2" role="list" aria-label="Activity items">
        {activities.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
            <Activity className="w-12 h-12 text-slate-400 mx-auto mb-3" aria-hidden="true" />
            <p className="text-slate-700 font-medium text-base">No activity recorded yet</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors focus-within:ring-2 focus-within:ring-cyan-500"
              role="listitem"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                {activity.type === 'comment' ? <MessageSquare className="w-5 h-5 text-slate-600" /> :
                 activity.type === 'share' ? <Share2 className="w-5 h-5 text-slate-600" /> :
                 activity.type === 'kpi' ? <Target className="w-5 h-5 text-slate-600" /> :
                 <Activity className="w-5 h-5 text-slate-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base text-slate-800 leading-relaxed">
                  <span className="font-semibold">{activity.user_name}</span>{' '}
                  <span className="text-slate-700">{activity.description}</span>
                </p>
                <time className="text-sm text-slate-500 mt-1 block" dateTime={activity.created_at}>{formatTimeAgo(activity.created_at)}</time>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // === RENDER: RESOURCES ===

  const renderResourcesTab = () => (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Strategic Planning Resources</h2>
        <p className="text-base text-slate-600 mt-1 leading-relaxed">Curated learning materials for systems thinking and strategy</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2" role="list" aria-label="Learning resources">
        {RESOURCES.map((resource) => (
          <article
            key={resource.id}
            className="group p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-cyan-400 transition-all focus-within:ring-2 focus-within:ring-cyan-500"
            role="listitem"
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  resource.type === 'video' ? 'bg-red-100 text-red-700' :
                  resource.type === 'article' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                )}
                aria-hidden="true"
              >
                {resource.type === 'video' ? <Play className="w-6 h-6" /> :
                 resource.type === 'article' ? <FileText className="w-6 h-6" /> :
                 <Globe className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">{resource.category}</span>
                  <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-md text-xs font-medium capitalize">{resource.type}</span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base leading-snug mb-2 group-hover:text-cyan-800 transition-colors">{resource.title}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">{resource.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                  >
                    <ExternalLink className="w-4 h-4" aria-hidden="true" /> Open
                  </a>
                  <button
                    onClick={() => copyToClipboard(resource.url)}
                    className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                    aria-label={`Copy link for ${resource.title}`}
                    title="Copy link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => shareViaWhatsApp(`Check out this resource: ${resource.title} - ${resource.url}`)}
                    className="p-2.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label={`Share ${resource.title} via WhatsApp`}
                    title="Share via WhatsApp"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => sendEmailNotification('', `Resource: ${resource.title}`, `${resource.description}\n\n${resource.url}`)}
                    className="p-2.5 text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Share ${resource.title} via Email`}
                    title="Share via Email"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );

  // === MODALS ===

  const CreateOrgModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="create-org-title">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowCreateOrgModal(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button
          onClick={() => setShowCreateOrgModal(false)}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
          aria-label="Close create organization modal"
        >
          <X className="w-5 h-5 text-slate-500" aria-hidden="true" />
        </button>
        <h2 id="create-org-title" className="text-xl font-bold mb-1 text-slate-900">Create Organization</h2>
        <p className="text-base text-slate-600 mb-5 leading-relaxed">Set up a new team workspace</p>

        <label htmlFor="org-name" className="block text-sm font-medium text-slate-700 mb-2">Organization Name</label>
        <input
          ref={createOrgInputRef}
          id="org-name"
          value={newOrgName}
          onChange={(e) => setNewOrgName(e.target.value)}
          placeholder="e.g., Strategy Team 2026"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600 text-base placeholder:text-slate-500"
        />

        <label htmlFor="org-desc" className="block text-sm font-medium text-slate-700 mt-4 mb-2">Description <span className="text-slate-500 font-normal">(optional)</span></label>
        <input
          id="org-desc"
          value={newOrgDescription}
          onChange={(e) => setNewOrgDescription(e.target.value)}
          placeholder="Brief description of this organization"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600 text-base placeholder:text-slate-500"
        />

        <button
          onClick={createOrganization}
          disabled={isLoading || !newOrgName.trim()}
          className="w-full py-3.5 bg-cyan-700 text-white rounded-xl mt-6 hover:bg-cyan-800 disabled:opacity-50 font-semibold transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Plus className="w-5 h-5" aria-hidden="true" />} Create Organization
        </button>
      </div>
    </div>
  );

  const EditOrgModal = () => {
    if (!editingOrg) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="edit-org-title">
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setEditingOrg(null)} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <button
            onClick={() => setEditingOrg(null)}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            aria-label="Close edit organization modal"
          >
            <X className="w-5 h-5 text-slate-500" aria-hidden="true" />
          </button>
          <h2 id="edit-org-title" className="text-xl font-bold mb-1 text-slate-900">Edit Organization</h2>
          <p className="text-base text-slate-600 mb-5 leading-relaxed">Update organization details</p>

          <label htmlFor="edit-org-name" className="block text-sm font-medium text-slate-700 mb-2">Organization Name</label>
          <input
            ref={editOrgInputRef}
            id="edit-org-name"
            value={editingOrg.name}
            onChange={(e) => setEditingOrg({...editingOrg, name: e.target.value})}
            placeholder="Organization Name"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600 text-base placeholder:text-slate-500"
          />

          <label htmlFor="edit-org-desc" className="block text-sm font-medium text-slate-700 mt-4 mb-2">Description <span className="text-slate-500 font-normal">(optional)</span></label>
          <input
            id="edit-org-desc"
            value={editingOrg.description || ''}
            onChange={(e) => setEditingOrg({...editingOrg, description: e.target.value})}
            placeholder="Brief description"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600 text-base placeholder:text-slate-500"
          />

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setEditingOrg(null)}
              className="flex-1 py-3.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={updateOrganization}
              disabled={isLoading || !editingOrg.name.trim()}
              className="flex-1 py-3.5 bg-cyan-700 text-white rounded-xl text-sm font-semibold hover:bg-cyan-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Check className="w-5 h-5" aria-hidden="true" />} Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DeleteOrgModal = () => {
    if (!deletingOrg) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-org-title">
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setDeletingOrg(null)} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <button
            onClick={() => setDeletingOrg(null)}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            aria-label="Close delete confirmation"
          >
            <X className="w-5 h-5 text-slate-500" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-700" aria-hidden="true" />
            </div>
            <h2 id="delete-org-title" className="text-xl font-bold text-slate-900">Delete Organization</h2>
          </div>
          <p className="text-base text-slate-700 mb-2 leading-relaxed">
            Are you sure you want to delete <strong>{deletingOrg.name}</strong>?
          </p>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            This action cannot be undone. All members and associated data will be permanently removed.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setDeletingOrg(null)}
              className="flex-1 py-3.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={deleteOrganization}
              disabled={isLoading}
              className="flex-1 py-3.5 bg-red-700 text-white rounded-xl text-sm font-semibold hover:bg-red-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Trash2 className="w-5 h-5" aria-hidden="true" />} Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ResetOrgModal = () => {
    if (!resettingOrg) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="reset-org-title">
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setResettingOrg(null)} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <button
            onClick={() => setResettingOrg(null)}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            aria-label="Close reset confirmation"
          >
            <X className="w-5 h-5 text-slate-500" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <RotateCcw className="w-6 h-6 text-amber-700" aria-hidden="true" />
            </div>
            <h2 id="reset-org-title" className="text-xl font-bold text-slate-900">Reset Organization</h2>
          </div>
          <p className="text-base text-slate-700 mb-2 leading-relaxed">
            Reset <strong>{resettingOrg.name}</strong>?
          </p>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            This will remove all members except the owner and clear all pending invitations. Organization settings and name will be preserved.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setResettingOrg(null)}
              className="flex-1 py-3.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={resetOrganization}
              disabled={isLoading}
              className="flex-1 py-3.5 bg-amber-700 text-white rounded-xl text-sm font-semibold hover:bg-amber-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <RotateCcw className="w-5 h-5" aria-hidden="true" />} Reset Organization
            </button>
          </div>
        </div>
      </div>
    );
  };

  const InviteModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="invite-title">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button
          onClick={() => setShowInviteModal(false)}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
          aria-label="Close invite modal"
        >
          <X className="w-5 h-5 text-slate-500" aria-hidden="true" />
        </button>
        <h2 id="invite-title" className="text-xl font-bold mb-1 text-slate-900">Invite Team Member</h2>
        <p className="text-base text-slate-600 mb-5 leading-relaxed">Add colleagues to {selectedOrg?.name}</p>

        <label htmlFor="invite-email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
        <input
          id="invite-email"
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="colleague@company.com"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600 text-base placeholder:text-slate-500 mb-4"
        />

        <label htmlFor="invite-role" className="block text-sm font-medium text-slate-700 mb-2">Role</label>
        <select
          id="invite-role"
          value={inviteRole}
          onChange={(e) => setInviteRole(e.target.value as any)}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-cyan-600 text-slate-800"
        >
          <option value="viewer">Viewer — Can view only</option>
          <option value="editor">Editor — Can edit content</option>
          <option value="admin">Admin — Full management access</option>
        </select>

        <div className="flex items-center gap-3 mt-5 p-4 bg-slate-50 rounded-xl">
          <input
            type="checkbox"
            id="sendEmail"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="w-4 h-4 rounded text-cyan-700 border-slate-300 focus:ring-cyan-600"
          />
          <label htmlFor="sendEmail" className="text-base text-slate-700">Send email notification</label>
        </div>

        <button
          onClick={inviteMember}
          disabled={isLoading || !inviteEmail.trim()}
          className="w-full py-3.5 bg-cyan-700 text-white rounded-xl mt-6 hover:bg-cyan-800 disabled:opacity-50 font-semibold transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <UserPlus className="w-5 h-5" aria-hidden="true" />} Send Invitation
        </button>
      </div>
    </div>
  );

  const ShareModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="share-title">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button
          onClick={() => setShowShareModal(false)}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
          aria-label="Close share modal"
        >
          <X className="w-5 h-5 text-slate-500" aria-hidden="true" />
        </button>
        <h2 id="share-title" className="text-xl font-bold mb-1 text-slate-900">Share Plan</h2>
        <p className="text-base text-slate-600 mb-5 leading-relaxed">Grant access to external stakeholders</p>

        <label htmlFor="share-email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
        <input
          id="share-email"
          type="email"
          value={shareEmail}
          onChange={(e) => setShareEmail(e.target.value)}
          placeholder="stakeholder@example.com"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600 text-base placeholder:text-slate-500 mb-4"
        />

        <label htmlFor="share-permission" className="block text-sm font-medium text-slate-700 mb-2">Permission Level</label>
        <select
          id="share-permission"
          value={sharePermission}
          onChange={(e) => setSharePermission(e.target.value as any)}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-cyan-600 text-slate-800"
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => shareViaWhatsApp(`Check out our strategic plan "${plan?.name}": ${getPlanShareUrl(selectedOrg || undefined)}`)}
            className="flex-1 py-3.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <Phone className="w-4 h-4" aria-hidden="true" /> WhatsApp
          </button>
          <button
            onClick={sharePlan}
            disabled={isLoading || !shareEmail.trim()}
            className="flex-[2] py-3.5 bg-cyan-700 text-white rounded-xl text-sm font-semibold hover:bg-cyan-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Share2 className="w-4 h-4" aria-hidden="true" />} Share via Email
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team Collaboration</h1>
          <p className="text-base text-slate-700 mt-2 leading-relaxed">Manage your team, track KPIs, and collaborate in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Presence Ribbon */}
          {presenceUsers && Object.keys(presenceUsers).length > 0 && (
            <div className="hidden sm:flex items-center gap-2 mr-1">
              <div className="h-6 w-px bg-slate-300 mx-1" />
              <PresenceRibbon presenceUsers={presenceUsers} currentUserId={userId} />
            </div>
          )}

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label={`Notifications, ${unreadCount} unread`}
              aria-expanded={showNotifications}
            >
              <Bell className="w-5 h-5 text-slate-700" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-base text-slate-900">Notifications</h3>
                  <button
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    className="text-sm text-cyan-700 hover:text-cyan-800 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-base text-slate-600 text-center">No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={cn(
                          "p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors",
                          !n.read ? 'bg-cyan-50/40' : ''
                        )}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && markNotificationRead(n.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0",
                              n.type === 'warning' ? 'bg-amber-500' : n.type === 'urgent' ? 'bg-red-600' : n.type === 'success' ? 'bg-emerald-600' : 'bg-blue-600'
                            )}
                            aria-hidden="true"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                            <time className="text-xs text-slate-500 mt-1 block" dateTime={n.created_at}>{formatTimeAgo(n.created_at)}</time>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
                  <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-700 border-slate-300 focus:ring-cyan-600"
                    />
                    Email notifications
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsappNotifications}
                      onChange={(e) => setWhatsappNotifications(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-700 border-slate-300 focus:ring-cyan-600"
                    />
                    WhatsApp alerts for critical KPIs
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mentionAlerts}
                      onChange={(e) => setMentionAlerts(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-700 border-slate-300 focus:ring-cyan-600"
                    />
                    @mention alerts
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Live region for screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {success ? `Success: ${success}` : error ? `Error: ${error}` : ''}
      </div>

      {/* Visual Alerts */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <span className="text-base font-medium">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto p-1 hover:bg-red-100 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-800" role="alert">
          <Check className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <span className="text-base font-medium">{success}</span>
        </div>
      )}
      {customUrlSuccess && (
        <div className="flex items-center gap-3 p-4 bg-cyan-50 border-2 border-cyan-200 rounded-xl text-cyan-800" role="alert">
          <Check className="w-5 h-5" aria-hidden="true" />
          <span className="text-base font-medium">{customUrlSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <nav aria-label="Collaboration sections">
        <div
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          role="tablist"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2",
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg focus:ring-slate-900'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 focus:ring-slate-400'
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{tab.label}</span>
                {tab.id === 'comments' && comments.filter(c => !c.is_resolved).length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                    {comments.filter(c => !c.is_resolved).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <section
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
      >
        {activeTab === 'team' && renderTeamTab()}
        {activeTab === 'sharing' && renderSharingTab()}
        {activeTab === 'comments' && renderCommentsTab()}
        {activeTab === 'kpis' && renderKpisTab()}
        {activeTab === 'activity' && renderActivityTab()}
        {activeTab === 'resources' && renderResourcesTab()}
      </section>

      {/* Live Cursors Overlay */}
      {cursors && <LiveCursors cursors={cursors} currentUserId={userId} />}

      {/* Modals */}
      {showCreateOrgModal && <CreateOrgModal />}
      {editingOrg && <EditOrgModal />}
      {deletingOrg && <DeleteOrgModal />}
      {resettingOrg && <ResetOrgModal />}
      {showInviteModal && <InviteModal />}
      {showShareModal && <ShareModal />}
    </main>
  );
};

export default TeamCollaboration;