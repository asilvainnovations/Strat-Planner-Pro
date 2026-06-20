import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  BUILTIN_TEMPLATES,
  INDUSTRY_OPTIONS,
  COLOR_MAP,
  PlanTemplate,
} from '@/lib/templateData';
import { StrategicPlan, generateId } from '@/lib/strategicPlanStore';
import {
  Search,
  Star,
  Users,
  Download,
  Plus,
  X,
  Sparkles,
  Globe,
  Heart,
  Cpu,
  GraduationCap,
  Landmark,
  Factory,
  ShoppingBag,
  Building2,
  Zap,
  FileText,
  BookOpen,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  Target,
  BarChart3,
  Layers,
  Clock,
  Tag,
  Bookmark,
  BookmarkCheck,
  Loader2,
  AlertCircle,
  Upload,
  MapPin,
  Leaf,
  Shield,
  Briefcase,
  Phone,
  Mail,
  CheckCircle2,
  ThumbsUp,
  Lightbulb,
  GitCompare,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Icon mapping for dynamic rendering
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Globe, Heart, Cpu, GraduationCap, Landmark, Factory,
  ShoppingBag, Building2, Zap, FileText, BookOpen,
  TrendingUp, MapPin, Leaf, Shield, Briefcase,
};

// Phase configuration for roadmap templates
const ROADMAP_PHASES = [
  { id: 'foundation', label: 'Foundation Building', years: '2026-2028', color: 'bg-emerald-500' },
  { id: 'acceleration', label: 'Acceleration', years: '2029-2032', color: 'bg-blue-500' },
  { id: 'consolidation', label: 'Consolidation', years: '2033-2035', color: 'bg-violet-500' },
];

interface TemplatesLibraryProps {
  currentPlan: StrategicPlan | null;
  onCreateFromTemplate: (templateData: PlanTemplate['plan_data']) => void;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userOrganization?: string;
  isAuthenticated: boolean;
}

type TabType = 'browse' | 'my-templates' | 'shared' | 'save';
type SortOption = 'popular' | 'rating' | 'newest' | 'name';

const TemplatesLibrary: React.FC<TemplatesLibraryProps> = ({
  currentPlan,
  onCreateFromTemplate,
  userId,
  userEmail,
  userName,
  userOrganization,
  isAuthenticated,
}) => {
  // State
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [userTemplates, setUserTemplates] = useState<PlanTemplate[]>([]);
  const [sharedTemplates, setSharedTemplates] = useState<PlanTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingComment, setRatingComment] = useState('');

  // Save template form state
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateIndustry, setTemplateIndustry] = useState('general');
  const [templateTags, setTemplateTags] = useState('');
  const [shareWithTeam, setShareWithTeam] = useState(false);
  const [makePublic, setMakePublic] = useState(false);

  // Load user templates from Supabase
  const loadUserTemplates = useCallback(async () => {
    if (!isAuthenticated || !userId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('plan_templates')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserTemplates((data || []).map(mapDbToTemplate));
    } catch (err) {
      console.error('Failed to load user templates:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId]);

  // Load shared templates
  const loadSharedTemplates = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data, error } = await supabase
        .from('plan_templates')
        .select('*')
        .eq('category', 'shared')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setSharedTemplates((data || []).map(mapDbToTemplate));
    } catch (err) {
      console.error('Failed to load shared templates:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserTemplates();
      loadSharedTemplates();
    }
  }, [isAuthenticated, loadUserTemplates, loadSharedTemplates]);

  // Map DB row to PlanTemplate
  const mapDbToTemplate = (row: any): PlanTemplate => ({
    id: row.id,
    name: row.name,
    description: row.description || '',
    industry: row.industry,
    category: row.category,
    icon: row.icon || 'FileText',
    color: row.color || 'cyan',
    tags: row.tags || [],
    usage_count: row.usage_count || 0,
    rating: parseFloat(row.rating) || 0,
    rating_count: row.rating_count || 0,
    organization: row.organization,
    created_by: row.created_by,
    is_public: row.is_public,
    plan_data: row.plan_data,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  // Sort and filter templates
  const filteredTemplates = useMemo(() => {
    let templates = [...BUILTIN_TEMPLATES];

    if (selectedIndustry !== 'all') {
      templates = templates.filter(t => t.industry === selectedIndustry);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q)) ||
        t.industry.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        templates.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        templates.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        break;
      case 'name':
        templates.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popular':
      default:
        templates.sort((a, b) => b.usage_count - a.usage_count);
        break;
    }

    return templates;
  }, [selectedIndustry, searchQuery, sortBy]);

  // Handle using a template
  const handleUseTemplate = (template: PlanTemplate) => {
    onCreateFromTemplate(template.plan_data);
    setShowPreview(false);
    setSelectedTemplate(null);
    // Increment usage count (fire and forget)
    if (template.category !== 'builtin') {
      supabase
        .from('plan_templates')
        .update({ usage_count: (template.usage_count || 0) + 1 })
        .eq('id', template.id)
        .then(() => {});
    }
  };

  // Handle saving current plan as template
  const handleSaveAsTemplate = async () => {
    if (!currentPlan || !isAuthenticated || !userId) return;
    if (!templateName.trim()) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const planData = {
        name: currentPlan.name,
        organization: currentPlan.organization || '',
        vision: currentPlan.vision || '',
        mission: currentPlan.mission || '',
        strategicIntent: currentPlan.strategicIntent || '',
        swotItems: (currentPlan.swotItems || []).map(({ id, ...rest }) => rest),
        strategicOptions: (currentPlan.strategicOptions || []).map(({ id, ...rest }) => rest),
        objectives: (currentPlan.objectives || []).map(({ id, kpis, ...rest }) => ({
          ...rest,
          kpis: (kpis || []).map(({ id: kpiId, objectiveId, ...kpiRest }) => kpiRest),
        })),
      };

      const tags = templateTags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const industryOption = INDUSTRY_OPTIONS.find(o => o.value === templateIndustry);

      const { error } = await supabase.from('plan_templates').insert({
        name: templateName.trim(),
        description: templateDescription.trim(),
        industry: templateIndustry,
        category: shareWithTeam ? 'shared' : 'user',
        plan_data: planData,
        created_by: userId,
        organization: userOrganization || '',
        is_public: makePublic,
        tags,
        icon: industryOption?.icon || 'FileText',
        color: 'cyan',
        usage_count: 0,
        rating: 0,
        rating_count: 0,
      });

      if (error) throw error;

      setSaveSuccess(true);
      setTemplateName('');
      setTemplateDescription('');
      setTemplateTags('');
      setShareWithTeam(false);
      setMakePublic(false);

      loadUserTemplates();
      if (shareWithTeam) loadSharedTemplates();

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save template:', err);
      alert('Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting a user template
  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      const { error } = await supabase
        .from('plan_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      setUserTemplates(prev => prev.filter(t => t.id !== templateId));
      setSharedTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  };

  // Toggle bookmark
  const toggleBookmark = (templateId: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  };

  // Toggle compare
  const toggleCompare = (templateId: string) => {
    setCompareList(prev => {
      if (prev.includes(templateId)) {
        return prev.filter(id => id !== templateId);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 templates at a time');
        return prev;
      }
      return [...prev, templateId];
    });
  };

  // Share template via WhatsApp
  const shareViaWhatsApp = (template: PlanTemplate) => {
    const text = `Check out this strategic plan template: "${template.name}" - ${template.description}. Perfect for ${template.industry}!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Share template via Email
  const shareViaEmail = (template: PlanTemplate) => {
    const subject = `Strategic Plan Template: ${template.name}`;
    const body = `I found this excellent strategic plan template that might be useful for our organization:

Name: ${template.name}
Industry: ${template.industry}
Description: ${template.description}

Key Features:
${template.tags.map(tag => `- ${tag}`).join('\n')}

Check it out in our Templates Library!`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  // Submit rating
  const submitRating = async () => {
    if (!selectedTemplate || userRating === 0) return;

    try {
      console.log('Rating submitted:', {
        templateId: selectedTemplate.id,
        rating: userRating,
        comment: ratingComment,
        userId,
      });

      setShowRatingForm(false);
      setUserRating(0);
      setRatingComment('');
      alert('Thank you for your feedback!');
    } catch (err) {
      console.error('Failed to submit rating:', err);
    }
  };

  // Render star rating
  const renderStars = (rating: number, size = 'w-4 h-4', interactive = false) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setUserRating(i)}
            onMouseEnter={() => interactive && setRatingHover(i)}
            onMouseLeave={() => interactive && setRatingHover(0)}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          >
            <Star
              className={`${size} ${
                i <= (interactive ? ratingHover || userRating : Math.round(rating))
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Check if template is a roadmap/investment template
  const isRoadmapTemplate = (template: PlanTemplate) => {
    return template.id === 'tmpl-bangsamoro-investment' || 
           template.tags.includes('investment promotion') ||
           template.name.toLowerCase().includes('roadmap');
  };

  // Get template complexity level
  const getComplexityLevel = (template: PlanTemplate) => {
    const score = template.plan_data.objectives.length + template.plan_data.swotItems.length;
    if (score > 20) return { label: 'Advanced', color: 'bg-red-100 text-red-700' };
    if (score > 12) return { label: 'Intermediate', color: 'bg-amber-100 text-amber-700' };
    return { label: 'Beginner', color: 'bg-green-100 text-green-700' };
  };

  // Get estimated completion time
  const getEstimatedTime = (template: PlanTemplate) => {
    const items = template.plan_data.objectives.length + 
                  template.plan_data.swotItems.length + 
                  template.plan_data.strategicOptions.length;
    if (items > 25) return '4-6 hours';
    if (items > 15) return '2-3 hours';
    return '1-2 hours';
  };

  // Render roadmap phases for preview
  const renderRoadmapPhases = (template: PlanTemplate) => {
    if (!isRoadmapTemplate(template)) return null;

    return (
      <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          Implementation Roadmap (2026-2035)
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {ROADMAP_PHASES.map((phase, idx) => (
            <div key={phase.id} className="relative">
              <div className={`${phase.color} text-white rounded-lg p-3 text-center`}>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">{phase.label}</p>
                <p className="text-xs font-black">{phase.years}</p>
              </div>
              {idx < ROADMAP_PHASES.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-slate-300" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-slate-500 text-center">
          Three-phase approach: Foundation → Acceleration → Consolidation
        </div>
      </div>
    );
  };

  // Render strategic pillars for roadmap templates
  const renderStrategicPillars = (template: PlanTemplate) => {
    if (!isRoadmapTemplate(template)) return null;

    const pillars = [
      { 
        title: 'Halal Industry Ecosystem', 
        icon: Leaf,
        items: ['BHB International Accreditation', 'Halal Park Development', 'Value Chain Integration', 'OIC/SMIIC Alignment'],
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
      },
      { 
        title: 'Enabling Infrastructure', 
        icon: Zap,
        items: ['Energy Infrastructure (100% by 2030)', 'Digital Connectivity (70% by 2030)', 'Farm-to-Market Roads', 'Polloc Freeport Modernization'],
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      },
      { 
        title: 'Governance Strengthening', 
        icon: Shield,
        items: ['One-Stop Investment Centers', 'Moral Governance Framework', 'Business Registration Reform', 'Transparency Systems'],
        color: 'text-violet-600 bg-violet-50 border-violet-200'
      },
    ];

    return (
      <div className="mb-6">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Three Strategic Pillars</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className={`rounded-xl p-3 border ${pillar.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <pillar.icon className="w-4 h-4" />
                <h5 className="text-xs font-bold">{pillar.title}</h5>
              </div>
              <ul className="space-y-1">
                {pillar.items.map((item, idx) => (
                  <li key={idx} className="text-[10px] opacity-90 flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-current mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render use case section
  const renderUseCase = (template: PlanTemplate) => {
    const useCases: Record<string, string[]> = {
      'government': ['Regional development authorities', 'Investment promotion agencies', 'Public sector reform initiatives', 'Infrastructure planning departments'],
      'healthcare': ['Hospital administration', 'Clinic network management', 'Public health departments', 'Healthcare system planning'],
      'education': ['University strategic planning', 'K-12 district administration', 'Vocational training institutes', 'Education ministry planning'],
      'technology': ['IT department strategy', 'Digital transformation initiatives', 'SaaS product planning', 'Technology startup growth'],
      'manufacturing': ['Plant operations', 'Supply chain optimization', 'Quality management systems', 'Lean transformation projects'],
      'finance': ['Bank strategic planning', 'Insurance product development', 'Fintech growth strategy', 'Wealth management planning'],
      'nonprofit': ['NGO program planning', 'Social enterprise development', 'Foundation strategy', 'Community organization planning'],
      'general': ['Corporate strategy', 'SMB growth planning', 'Divisional planning', 'New business unit launch'],
    };

    const bestFor = useCases[template.industry] || useCases['general'];
    const complexity = getComplexityLevel(template);
    const estimatedTime = getEstimatedTime(template);

    return (
      <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5" />
            Best For
          </h4>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${complexity.color}`}>
              {complexity.label}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {estimatedTime}
            </span>
          </div>
        </div>
        <ul className="space-y-1.5">
          {bestFor.map((useCase, idx) => (
            <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              {useCase}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Render template card
  const renderTemplateCard = (template: PlanTemplate, showActions = true) => {
    const colors = COLOR_MAP[template.color] || COLOR_MAP.cyan;
    const IconComponent = ICON_MAP[template.icon] || FileText;
    const isBookmarked = bookmarkedIds.has(template.id);
    const isRoadmap = isRoadmapTemplate(template);
    const isInCompare = compareList.includes(template.id);
    const complexity = getComplexityLevel(template);

    return (
      <div
        key={template.id}
        className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer relative"
        onClick={() => {
          setSelectedTemplate(template);
          setShowPreview(true);
          setShowRatingForm(false);
        }}
      >
        {/* Compare checkbox */}
        {showCompare && (
          <div 
            className="absolute top-3 left-3 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => toggleCompare(template.id)}
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                isInCompare 
                  ? 'bg-cyan-500 border-cyan-500 text-white' 
                  : 'bg-white border-slate-300 hover:border-cyan-400'
              }`}
            >
              {isInCompare && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Card Header with gradient */}
        <div className={`relative h-32 bg-gradient-to-br ${colors.gradient} p-5 overflow-hidden`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id={`grid-${template.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${template.id})`} />
            </svg>
          </div>

          {/* Special badge for roadmap templates */}
          {isRoadmap && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider border border-white/30">
                10-Year Roadmap
              </span>
            </div>
          )}

          <div className="relative z-10 flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            {showActions && (
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    shareViaWhatsApp(template);
                  }}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                  title="Share via WhatsApp"
                >
                  <Phone className="w-3.5 h-3.5 text-white/80" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    shareViaEmail(template);
                  }}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                  title="Share via Email"
                >
                  <Mail className="w-3.5 h-3.5 text-white/80" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(template.id);
                  }}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-white" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-white/70" />
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
              {template.industry}
            </span>
            <span className={`px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold`}>
              {complexity.label}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <h3 className="font-bold text-slate-800 text-base mb-2 line-clamp-1 group-hover:text-slate-900 transition-colors">
            {template.name}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
            {template.description}
          </p>

          {/* Special indicators for roadmap */}
          {isRoadmap && (
            <div className="flex items-center gap-2 mb-3 text-xs text-slate-600">
              <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
              <span>PHP 50B Target</span>
              <span className="text-slate-300">•</span>
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>BIMP-EAGA</span>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {template.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className={`px-2 py-0.5 rounded-full ${colors.light} ${colors.text} text-[10px] font-semibold`}
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
                +{template.tags.length - 3}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1">
              {renderStars(template.rating, 'w-3.5 h-3.5')}
              <span className="text-xs text-slate-500 ml-1">{template.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Download className="w-3.5 h-3.5" />
                {template.usage_count.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {getEstimatedTime(template)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render template preview modal
  const renderPreviewModal = () => {
    if (!selectedTemplate || !showPreview) return null;
    const template = selectedTemplate;
    const colors = COLOR_MAP[template.color] || COLOR_MAP.cyan;
    const IconComponent = ICON_MAP[template.icon] || FileText;
    const pd = template.plan_data;
    const isRoadmap = isRoadmapTemplate(template);
    const complexity = getComplexityLevel(template);

    const swotCounts = {
      strengths: pd.swotItems.filter(i => i.category === 'strength').length,
      weaknesses: pd.swotItems.filter(i => i.category === 'weakness').length,
      opportunities: pd.swotItems.filter(i => i.category === 'opportunity').length,
      threats: pd.swotItems.filter(i => i.category === 'threat').length,
    };

    const totalKPIs = pd.objectives.reduce((sum, obj) => sum + (obj.kpis?.length || 0), 0);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className={`relative bg-gradient-to-br ${colors.gradient} p-8 pb-6`}>
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                    {template.industry}
                  </span>
                  {isRoadmap && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 text-[10px] font-bold uppercase tracking-wider border border-emerald-400/30">
                      10-Year Strategic Roadmap
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold`}>
                    {complexity.label}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white mb-1">{template.name}</h2>
                <p className="text-white/80 text-sm leading-relaxed">{template.description}</p>
              </div>
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-6 mt-5 pt-4 border-t border-white/20 flex-wrap">
              <div className="flex items-center gap-1.5">
                {renderStars(template.rating, 'w-4 h-4')}
                <span className="text-white/80 text-sm ml-1">{template.rating.toFixed(1)} ({template.rating_count} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/70 text-sm">
                <Download className="w-4 h-4" />
                {template.usage_count.toLocaleString()} uses
              </div>
              {isRoadmap && (
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Target className="w-4 h-4" />
                  PHP 50B Target
                </div>
              )}
              <div className="flex items-center gap-1.5 text-white/70 text-sm">
                <Clock className="w-4 h-4" />
                {getEstimatedTime(template)}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => shareViaWhatsApp(template)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-white rounded-lg text-xs font-semibold transition-colors border border-emerald-400/30"
              >
                <Phone className="w-3.5 h-3.5" />
                WhatsApp
              </button>
              <button
                onClick={() => shareViaEmail(template)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-white rounded-lg text-xs font-semibold transition-colors border border-blue-400/30"
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </button>
              <button
                onClick={() => toggleBookmark(template.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors border border-white/20"
              >
                {bookmarkedIds.has(template.id) ? (
                  <><BookmarkCheck className="w-3.5 h-3.5" /> Saved</>
                ) : (
                  <><Bookmark className="w-3.5 h-3.5" /> Save</>
                )}
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-8">

            {/* Use Case Section */}
            {renderUseCase(template)}

            {/* Roadmap-specific sections */}
            {isRoadmap && renderRoadmapPhases(template)}
            {isRoadmap && renderStrategicPillars(template)}

            {/* Vision & Mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Vision</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{pd.vision}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mission</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{pd.mission}</p>
              </div>
            </div>

            {/* Strategic Intent */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-100 mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Strategic Intent</h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{pd.strategicIntent}</p>
            </div>

            {/* Template Contents Overview */}
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Template Contents</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                <Target className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-emerald-700">{pd.swotItems.length}</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase">SWOT Items</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-4 text-center border border-violet-100">
                <Sparkles className="w-5 h-5 text-violet-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-violet-700">{pd.strategicOptions.length}</p>
                <p className="text-[10px] font-bold text-violet-500 uppercase">Strategies</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                <BarChart3 className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-blue-700">{pd.objectives.length}</p>
                <p className="text-[10px] font-bold text-blue-500 uppercase">Objectives</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                <TrendingUp className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-amber-700">{totalKPIs}</p>
                <p className="text-[10px] font-bold text-amber-500 uppercase">KPIs</p>
              </div>
            </div>

            {/* SWOT Breakdown */}
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">SWOT Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <p className="text-xs font-bold text-green-700 mb-1">Strengths</p>
                <p className="text-lg font-black text-green-800">{swotCounts.strengths}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-xs font-bold text-red-700 mb-1">Weaknesses</p>
                <p className="text-lg font-black text-red-800">{swotCounts.weaknesses}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-bold text-blue-700 mb-1">Opportunities</p>
                <p className="text-lg font-black text-blue-800">{swotCounts.opportunities}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs font-bold text-amber-700 mb-1">Threats</p>
                <p className="text-lg font-black text-amber-800">{swotCounts.threats}</p>
              </div>
            </div>

            {/* Sample Objectives */}
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Balanced Scorecard Objectives</h3>
            <div className="space-y-2 mb-6">
              {pd.objectives.slice(0, 4).map((obj, idx) => {
                const perspectiveColors: Record<string, string> = {
                  financial: 'bg-emerald-100 text-emerald-700',
                  customer: 'bg-blue-100 text-blue-700',
                  internal_process: 'bg-violet-100 text-violet-700',
                  learning_growth: 'bg-amber-100 text-amber-700',
                };
                const perspectiveLabels: Record<string, string> = {
                  financial: 'Financial',
                  customer: 'Stakeholder',
                  internal_process: 'Internal Process',
                  learning_growth: 'Learning & Growth',
                };
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${perspectiveColors[obj.perspective] || 'bg-slate-100 text-slate-600'} flex-shrink-0 mt-0.5`}>
                      {perspectiveLabels[obj.perspective] || obj.perspective}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700">{obj.objective}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{obj.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{obj.kpis?.length || 0} KPIs defined</p>
                    </div>
                  </div>
                );
              })}
              {pd.objectives.length > 4 && (
                <p className="text-xs text-slate-400 text-center">+{pd.objectives.length - 4} more objectives</p>
              )}
            </div>

            {/* Rating Section */}
            <div className="mb-6">
              <button
                onClick={() => setShowRatingForm(!showRatingForm)}
                className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-cyan-600 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                Rate this Template
                {showRatingForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showRatingForm && (
                <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-600 mb-2">How would you rate this template?</p>
                  <div className="mb-3">
                    {renderStars(0, 'w-6 h-6', true)}
                  </div>
                  <textarea
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    placeholder="Share your experience with this template..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={submitRating}
                      disabled={userRating === 0}
                      className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-bold hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                    >
                      Submit Review
                    </button>
                    <button
                      onClick={() => { setShowRatingForm(false); setUserRating(0); setRatingComment(''); }}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {template.tags.map(tag => (
                <span key={tag} className={`px-3 py-1 rounded-full ${colors.light} ${colors.text} text-xs font-semibold`}>
                  <Tag className="w-3 h-3 inline mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-slate-200 p-6 bg-slate-50 flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(false)}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => toggleCompare(template.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
                  compareList.includes(template.id)
                    ? 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <GitCompare className="w-4 h-4" />
                {compareList.includes(template.id) ? 'Added to Compare' : 'Compare'}
              </button>
            </div>
            <button
              onClick={() => handleUseTemplate(template)}
              className={`px-6 py-2.5 bg-gradient-to-r ${colors.gradient} text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg flex items-center gap-2`}
            >
              <Copy className="w-4 h-4" />
              Use This Template
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render comparison view
  const renderComparison = () => {
    if (compareList.length === 0) return null;

    const templatesToCompare = BUILTIN_TEMPLATES.filter(t => compareList.includes(t.id));

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Compare Templates</h2>
              <p className="text-sm text-slate-500">Side-by-side comparison of selected templates</p>
            </div>
            <button
              onClick={() => setShowCompare(false)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className={`grid gap-6 ${templatesToCompare.length === 2 ? 'grid-cols-2' : templatesToCompare.length === 3 ? 'grid-cols-3' : 'grid-cols-1'}`}>
              {templatesToCompare.map(template => {
                const colors = COLOR_MAP[template.color] || COLOR_MAP.cyan;
                const IconComponent = ICON_MAP[template.icon] || FileText;
                const pd = template.plan_data;
                const totalKPIs = pd.objectives.reduce((sum, obj) => sum + (obj.kpis?.length || 0), 0);

                return (
                  <div key={template.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div className={`bg-gradient-to-br ${colors.gradient} p-4 text-white`}>
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-2">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm">{template.name}</h3>
                      <p className="text-white/70 text-xs">{template.industry}</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Rating</span>
                        <span className="font-semibold">{template.rating.toFixed(1)}/5</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Uses</span>
                        <span className="font-semibold">{template.usage_count.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">SWOT Items</span>
                        <span className="font-semibold">{pd.swotItems.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Strategies</span>
                        <span className="font-semibold">{pd.strategicOptions.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Objectives</span>
                        <span className="font-semibold">{pd.objectives.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Total KPIs</span>
                        <span className="font-semibold">{totalKPIs}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className={`w-full py-2 bg-gradient-to-r ${colors.gradient} text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity`}
                        >
                          Use Template
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render browse tab
  const renderBrowseTab = () => (
    <div>
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates by name, industry, or tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="name">Name A-Z</option>
          </select>
          <button
            onClick={() => setShowCompare(!showCompare)}
            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              showCompare 
                ? 'bg-cyan-500 text-white shadow-lg' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            {showCompare ? 'Done' : 'Compare'}
            {compareList.length > 0 && (
              <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
                {compareList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Compare bar */}
      {showCompare && compareList.length > 0 && (
        <div className="mb-6 p-4 bg-cyan-50 border border-cyan-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-600" />
            <span className="text-sm text-cyan-700">
              {compareList.length} template{compareList.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCompareList([])}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setShowCompare(true)}
              disabled={compareList.length < 2}
              className="px-4 py-1.5 bg-cyan-500 text-white rounded-lg text-sm font-bold hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              View Comparison
            </button>
          </div>
        </div>
      )}

      {/* Industry Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {INDUSTRY_OPTIONS.map(option => {
          const isActive = selectedIndustry === option.value;
          const IconComp = ICON_MAP[option.icon] || Globe;
          return (
            <button
              key={option.value}
              onClick={() => setSelectedIndustry(option.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <IconComp className="w-4 h-4" />
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Featured Roadmap Banner (only when government selected or all) */}
      {(selectedIndustry === 'all' || selectedIndustry === 'government') && !searchQuery && (
        <div 
          className="mb-8 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition-all"
          onClick={() => {
            const roadmapTemplate = BUILTIN_TEMPLATES.find(t => t.id === 'tmpl-bangsamoro-investment');
            if (roadmapTemplate) {
              setSelectedTemplate(roadmapTemplate);
              setShowPreview(true);
            }
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                  Featured Template
                </span>
                <span className="px-2 py-1 rounded-full bg-emerald-400/20 text-emerald-100 text-[10px] font-bold uppercase tracking-wider border border-emerald-400/30">
                  New
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Bangsamoro Investment Roadmap 2026-2035</h3>
              <p className="text-emerald-100 text-sm max-w-2xl mb-4">
                Comprehensive strategic roadmap for regional development featuring the Integrated Halal-Driven Investment Strategy. 
                Includes three implementation phases, Balanced Scorecard KPIs, and BIMP-EAGA integration framework.
              </p>
              <div className="flex items-center gap-4 text-xs text-emerald-200">
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  16 Strategic Objectives
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  26 KPIs
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  10-Year Horizon
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm">
              <Landmark className="w-12 h-12 text-white/80" />
            </div>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => renderTemplateCard(template))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">No templates found</h3>
          <p className="text-sm text-slate-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );

  // Render my templates tab
  const renderMyTemplatesTab = () => {
    if (!isAuthenticated) {
      return (
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">Sign in Required</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Sign in to save and manage your custom templates. Your templates will be securely stored in the cloud.
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-cyan-500 mx-auto mb-4 animate-spin" />
          <p className="text-sm text-slate-500">Loading your templates...</p>
        </div>
      );
    }

    if (userTemplates.length === 0) {
      return (
        <div className="text-center py-16">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">No saved templates yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Save your current strategic plan as a reusable template to quickly start new plans with the same structure.
          </p>
          {currentPlan && (
            <button
              onClick={() => setActiveTab('save')}
              className="px-5 py-2.5 bg-cyan-500 text-white rounded-xl text-sm font-bold hover:bg-cyan-600 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Save Current Plan as Template
            </button>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">{userTemplates.length} template{userTemplates.length !== 1 ? 's' : ''} saved</p>
          {currentPlan && (
            <button
              onClick={() => setActiveTab('save')}
              className="px-4 py-2 bg-cyan-500 text-white rounded-xl text-sm font-bold hover:bg-cyan-600 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Save New Template
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTemplates.map(template => (
            <div key={template.id} className="relative group">
              {renderTemplateCard(template, false)}
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTemplate(template.id);
                  }}
                  className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                  title="Delete template"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render shared tab
  const renderSharedTab = () => {
    if (!isAuthenticated) {
      return (
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">Sign in Required</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Sign in to access templates shared by your team members.
          </p>
        </div>
      );
    }

    if (sharedTemplates.length === 0) {
      return (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">No shared templates</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            When team members share templates with your organization, they'll appear here. You can also share your templates when saving them.
          </p>
        </div>
      );
    }

    return (
      <div>
        <p className="text-sm text-slate-500 mb-6">{sharedTemplates.length} shared template{sharedTemplates.length !== 1 ? 's' : ''} available</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedTemplates.map(template => renderTemplateCard(template))}
        </div>
      </div>
    );
  };

  // Render save tab
  const renderSaveTab = () => {
    if (!isAuthenticated) {
      return (
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">Sign in Required</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Sign in to save your plans as reusable templates.
          </p>
        </div>
      );
    }

    if (!currentPlan) {
      return (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">No Active Plan</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Create or select a strategic plan first, then you can save it as a reusable template.
          </p>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Save as Template</h3>
                <p className="text-white/80 text-sm">Create a reusable template from "{currentPlan.name}"</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            {/* Template Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Template Name *</label>
              <input
                type="text"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="e.g., Healthcare Digital Transformation"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
              <textarea
                value={templateDescription}
                onChange={e => setTemplateDescription(e.target.value)}
                placeholder="Describe what this template is best used for..."
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Industry</label>
              <select
                value={templateIndustry}
                onChange={e => setTemplateIndustry(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
              >
                {INDUSTRY_OPTIONS.filter(o => o.value !== 'all').map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Tags (comma-separated)</label>
              <input
                type="text"
                value={templateTags}
                onChange={e => setTemplateTags(e.target.value)}
                placeholder="e.g., digital health, telemedicine, patient care"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Plan Contents Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Plan Contents to Include</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <p className="text-xl font-black text-slate-700">{currentPlan.swotItems?.length || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">SWOT Items</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-slate-700">{currentPlan.strategicOptions?.length || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Strategies</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-slate-700">{currentPlan.objectives?.length || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Objectives</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-slate-700">
                    {currentPlan.objectives?.reduce((sum, obj) => sum + (obj.kpis?.length || 0), 0) || 0}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">KPIs</p>
                </div>
              </div>
            </div>

            {/* Sharing Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-700">Sharing Options</h4>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={shareWithTeam}
                  onChange={e => setShareWithTeam(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 rounded border-slate-300 focus:ring-cyan-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Share with my organization</p>
                  <p className="text-xs text-slate-400">Team members in {userOrganization || 'your organization'} can use this template</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={makePublic}
                  onChange={e => setMakePublic(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 rounded border-slate-300 focus:ring-cyan-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Make publicly available</p>
                  <p className="text-xs text-slate-400">Anyone can discover and use this template</p>
                </div>
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              {saveSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-semibold">Template saved successfully!</span>
                </div>
              )}
              <button
                onClick={handleSaveAsTemplate}
                disabled={isSaving || !templateName.trim()}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Template...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Template
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'browse', label: 'Browse Templates', icon: Globe, count: BUILTIN_TEMPLATES.length },
    { id: 'my-templates', label: 'My Templates', icon: BookOpen, count: userTemplates.length },
    { id: 'shared', label: 'Team Shared', icon: Users, count: sharedTemplates.length },
    { id: 'save', label: 'Save as Template', icon: Plus },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Templates Library</h1>
            <p className="text-sm text-slate-500">Pre-built strategic plan templates for every industry</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4">
        {tabs.map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'browse' && renderBrowseTab()}
      {activeTab === 'my-templates' && renderMyTemplatesTab()}
      {activeTab === 'shared' && renderSharedTab()}
      {activeTab === 'save' && renderSaveTab()}

      {/* Preview Modal */}
      {renderPreviewModal()}

      {/* Comparison Modal */}
      {renderComparison()}
    </div>
  );
};

export default TemplatesLibrary;