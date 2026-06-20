-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for AI embeddings (optional)
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Strategic Plans (Main entity)
CREATE TABLE strategic_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  fiscal_year VARCHAR(4),
  planning_horizon INTEGER DEFAULT 3,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'active', 'archived', 'completed')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  organization TEXT,
  job_title TEXT,
  phone TEXT,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  plan_tier VARCHAR(20) DEFAULT 'free' CHECK (plan_tier IN ('free', 'starter', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(10) DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  language VARCHAR(5) DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT true,
  email_on_updates BOOLEAN DEFAULT true,
  email_on_comments BOOLEAN DEFAULT true,
  ai_model VARCHAR(50) DEFAULT 'google/gemini-3-flash',
  ai_temperature NUMERIC DEFAULT 0.7 CHECK (ai_temperature >= 0 AND ai_temperature <= 1),
  ai_auto_suggest BOOLEAN DEFAULT true,
  ai_verbose_mode BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  integrations JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SWOT & STRATEGY TABLES
-- ============================================================================

-- SWOT Items Table
CREATE TABLE swot_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL CHECK (category IN ('strength', 'weakness', 'opportunity', 'threat')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT,
  impact INTEGER CHECK (impact >= 1 AND impact <= 5),
  likelihood INTEGER CHECK (likelihood >= 1 AND likelihood <= 5),
  owner_id UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}',
  source VARCHAR(100),
  verified BOOLEAN DEFAULT false,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategies Table (for TOWS matrix)
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_type VARCHAR(10) NOT NULL CHECK (strategy_type IN ('SO', 'WO', 'ST', 'WT')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT,
  swot_item_ids UUID[] NOT NULL,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  owner_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SYSTEMS THINKING TABLES
-- ============================================================================

-- Causal Loop Diagrams (CLD)
CREATE TABLE causal_loop_diagrams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  diagram_json JSONB NOT NULL,
  loop_type VARCHAR(20) CHECK (loop_type IN ('reinforcing', 'balancing', 'mixed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CLD Variables/Nodes
CREATE TABLE cld_variables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagram_id UUID NOT NULL REFERENCES causal_loop_diagrams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initial_value NUMERIC,
  unit TEXT,
  polarity VARCHAR(10) CHECK (polarity IN ('positive', 'negative')),
  description TEXT,
  source_swot_id UUID REFERENCES swot_items(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CLD Links/Relationships
CREATE TABLE cld_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagram_id UUID NOT NULL REFERENCES causal_loop_diagrams(id) ON DELETE CASCADE,
  from_variable_id UUID NOT NULL REFERENCES cld_variables(id) ON DELETE CASCADE,
  to_variable_id UUID NOT NULL REFERENCES cld_variables(id) ON DELETE CASCADE,
  polarity VARCHAR(10) NOT NULL CHECK (polarity IN ('positive', 'negative')),
  strength INTEGER CHECK (strength >= 1 AND strength <= 5),
  description TEXT,
  delay_period INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Systems Archetypes Library
CREATE TABLE archetypes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archetype_name VARCHAR(100) NOT NULL,
  archetype_type VARCHAR(50) NOT NULL,
  description TEXT,
  diagram_id UUID REFERENCES causal_loop_diagrams(id),
  key_characteristics TEXT[],
  warning_signals TEXT[],
  intervention_points TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meadows Leverage Points
CREATE TABLE leverage_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  leverage_level INTEGER CHECK (leverage_level >= 1 AND leverage_level <= 12),
  leverage_name VARCHAR(100) NOT NULL,
  description TEXT,
  system_element TEXT,
  proposed_intervention TEXT,
  expected_impact TEXT,
  effort_required VARCHAR(20) CHECK (effort_required IN ('low', 'medium', 'high')),
  implementation_timeline INTEGER,
  related_archetype_id UUID REFERENCES archetypes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BALANCED SCORECARD TABLES
-- ============================================================================

-- BSC Objectives
CREATE TABLE bsc_objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  perspective VARCHAR(50) NOT NULL CHECK (perspective IN ('financial', 'customer', 'internal-process', 'learning-growth')),
  title TEXT NOT NULL,
  description TEXT,
  strategy_id UUID REFERENCES strategies(id),
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  owner_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPIs Table
CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  objective_id UUID NOT NULL REFERENCES bsc_objectives(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  baseline NUMERIC NOT NULL,
  target NUMERIC NOT NULL,
  current NUMERIC,
  unit TEXT NOT NULL,
  measurement_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (measurement_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
  data_source TEXT,
  owner_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'on-track' CHECK (status IN ('on-track', 'at-risk', 'behind', 'exceeded')),
  trend VARCHAR(10) CHECK (trend IN ('up', 'down', 'stable')),
  threshold_warning NUMERIC,
  threshold_critical NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI History (for trending)
CREATE TABLE kpi_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id UUID NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PAPS MANAGEMENT TABLES
-- ============================================================================

-- Programs/Activities/Projects (PAPs)
CREATE TABLE paps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_pap_id UUID REFERENCES paps(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('program', 'activity', 'project')),
  name TEXT NOT NULL,
  description TEXT,
  objective_id UUID REFERENCES bsc_objectives(id),
  strategy_id UUID REFERENCES strategies(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  budget NUMERIC NOT NULL DEFAULT 0,
  spent NUMERIC DEFAULT 0,
  progress INTEGER CHECK (progress >= 0 AND progress <= 100) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on-hold', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  milestone_count INTEGER DEFAULT 0,
  risk_level VARCHAR(10) CHECK (risk_level IN ('low', 'medium', 'high')),
  resource_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PAP Milestones
CREATE TABLE pap_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pap_id UUID NOT NULL REFERENCES paps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'delayed')),
  deliverables TEXT[],
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PAP Budget Allocation
CREATE TABLE pap_budget (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pap_id UUID NOT NULL REFERENCES paps(id) ON DELETE CASCADE,
  budget_period VARCHAR(20) NOT NULL,
  allocated NUMERIC NOT NULL,
  spent NUMERIC DEFAULT 0,
  variance NUMERIC GENERATED ALWAYS AS (allocated - spent) STORED,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PAP Resources
CREATE TABLE pap_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pap_id UUID NOT NULL REFERENCES paps(id) ON DELETE CASCADE,
  resource_name TEXT NOT NULL,
  resource_type VARCHAR(50),
  allocation_percentage NUMERIC CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  owner_id UUID REFERENCES auth.users(id),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MEL DASHBOARD TABLES
-- ============================================================================

-- MEL Framework (Monitoring, Evaluation, Learning)
CREATE TABLE mel_frameworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  evaluation_cycle VARCHAR(50),
  learning_approach TEXT,
  data_collection_methods TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MEL Logs (Actual performance data)
CREATE TABLE mel_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  kpi_id UUID REFERENCES kpis(id),
  pap_id UUID REFERENCES paps(id),
  actual_value NUMERIC,
  commentary TEXT,
  attached_evidence TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MEL Insights (Analysis and learning)
CREATE TABLE mel_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  related_kpis UUID[] DEFAULT '{}',
  related_paps UUID[] DEFAULT '{}',
  recommendation TEXT,
  impact_rating INTEGER CHECK (impact_rating >= 1 AND impact_rating <= 5),
  action_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TEAM COLLABORATION TABLES
-- ============================================================================

-- Plan Comments
CREATE TABLE plan_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES plan_comments(id) ON DELETE CASCADE,
  comment_type VARCHAR(50) DEFAULT 'general' CHECK (comment_type IN ('general', 'suggestion', 'issue', 'resolved')),
  entity_type VARCHAR(50),
  entity_id UUID,
  content TEXT NOT NULL,
  attachments TEXT[],
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plan Shares (Collaboration access)
CREATE TABLE plan_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  shared_by_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_level VARCHAR(20) NOT NULL CHECK (access_level IN ('view', 'comment', 'edit', 'admin')),
  share_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiration_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Presence (Live collaboration)
CREATE TABLE user_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cursor_position JSONB,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Members
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TEMPLATES & EXPORT TABLES
-- ============================================================================

-- Plan Templates
CREATE TABLE plan_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  planning_horizon INTEGER DEFAULT 3,
  template_json JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  downloads INTEGER DEFAULT 0,
  average_rating NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Ratings
CREATE TABLE template_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES plan_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Plan Exports
CREATE TABLE plan_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_format VARCHAR(20) NOT NULL CHECK (export_format IN ('pdf', 'html', 'json', 'excel')),
  file_path TEXT,
  file_size INTEGER,
  export_title TEXT,
  include_sections TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Share Links (Public read-only access)
CREATE TABLE share_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  created_by_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token VARCHAR(64) UNIQUE NOT NULL,
  access_level VARCHAR(20) DEFAULT 'view' CHECK (access_level IN ('view', 'comment')),
  is_active BOOLEAN DEFAULT true,
  expiration_date TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ADMIN & AUDIT TABLES
-- ============================================================================

-- Admin Users
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visit Logs (Analytics)
CREATE TABLE visit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  visit_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Log (Audit trail)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES strategic_plans(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_strategic_plans_user_id ON strategic_plans(user_id);
CREATE INDEX idx_strategic_plans_status ON strategic_plans(status);
CREATE INDEX idx_user_profiles_id ON user_profiles(id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_swot_items_plan_id ON swot_items(plan_id);
CREATE INDEX idx_swot_items_category ON swot_items(category);
CREATE INDEX idx_swot_items_user_id ON swot_items(user_id);
CREATE INDEX idx_strategies_plan_id ON strategies(plan_id);
CREATE INDEX idx_strategies_type ON strategies(strategy_type);
CREATE INDEX idx_strategies_user_id ON strategies(user_id);
CREATE INDEX idx_causal_loop_diagrams_plan_id ON causal_loop_diagrams(plan_id);
CREATE INDEX idx_cld_variables_diagram_id ON cld_variables(diagram_id);
CREATE INDEX idx_cld_links_diagram_id ON cld_links(diagram_id);
CREATE INDEX idx_archetypes_plan_id ON archetypes(plan_id);
CREATE INDEX idx_leverage_points_plan_id ON leverage_points(plan_id);
CREATE INDEX idx_bsc_objectives_plan_id ON bsc_objectives(plan_id);
CREATE INDEX idx_bsc_objectives_perspective ON bsc_objectives(perspective);
CREATE INDEX idx_kpis_plan_id ON kpis(plan_id);
CREATE INDEX idx_kpis_objective_id ON kpis(objective_id);
CREATE INDEX idx_kpi_history_kpi_id ON kpi_history(kpi_id);
CREATE INDEX idx_paps_plan_id ON paps(plan_id);
CREATE INDEX idx_paps_status ON paps(status);
CREATE INDEX idx_paps_parent_id ON paps(parent_pap_id);
CREATE INDEX idx_pap_milestones_pap_id ON pap_milestones(pap_id);
CREATE INDEX idx_pap_budget_pap_id ON pap_budget(pap_id);
CREATE INDEX idx_pap_resources_pap_id ON pap_resources(pap_id);
CREATE INDEX idx_mel_frameworks_plan_id ON mel_frameworks(plan_id);
CREATE INDEX idx_mel_logs_plan_id ON mel_logs(plan_id);
CREATE INDEX idx_mel_logs_kpi_id ON mel_logs(kpi_id);
CREATE INDEX idx_mel_logs_pap_id ON mel_logs(pap_id);
CREATE INDEX idx_mel_insights_plan_id ON mel_insights(plan_id);
CREATE INDEX idx_plan_comments_plan_id ON plan_comments(plan_id);
CREATE INDEX idx_plan_comments_user_id ON plan_comments(user_id);
CREATE INDEX idx_plan_shares_plan_id ON plan_shares(plan_id);
CREATE INDEX idx_plan_shares_shared_with_id ON plan_shares(shared_with_id);
CREATE INDEX idx_user_presence_plan_id ON user_presence(plan_id);
CREATE INDEX idx_plan_templates_is_public ON plan_templates(is_public);
CREATE INDEX idx_template_ratings_template_id ON template_ratings(template_id);
CREATE INDEX idx_plan_exports_plan_id ON plan_exports(plan_id);
CREATE INDEX idx_share_links_plan_id ON share_links(plan_id);
CREATE INDEX idx_share_links_token ON share_links(share_token);
CREATE INDEX idx_visit_logs_user_id ON visit_logs(user_id);
CREATE INDEX idx_visit_logs_created_at ON visit_logs(created_at);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_plan_id ON activity_log(plan_id);
