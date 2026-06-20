-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all user-data tables
ALTER TABLE strategic_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE swot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE causal_loop_diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE cld_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE cld_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE leverage_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE bsc_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE paps ENABLE ROW LEVEL SECURITY;
ALTER TABLE pap_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pap_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE pap_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE mel_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mel_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STRATEGIC PLANS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own plans"
  ON strategic_plans FOR SELECT
  USING (user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid()));

CREATE POLICY "Users can create plans"
  ON strategic_plans FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own plans"
  ON strategic_plans FOR UPDATE
  USING (user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid() AND access_level IN ('edit', 'admin')))
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own plans"
  ON strategic_plans FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- USER SETTINGS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- SWOT ITEMS POLICIES
-- ============================================================================

CREATE POLICY "Users can view swot_items from shared plans"
  ON swot_items FOR SELECT
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid())));

CREATE POLICY "Users can insert swot_items in own plans"
  ON swot_items FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can update swot_items in shared plans"
  ON swot_items FOR UPDATE
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid() AND access_level IN ('edit', 'admin'))))
  WITH CHECK (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete swot_items from own plans"
  ON swot_items FOR DELETE
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

-- ============================================================================
-- STRATEGIES POLICIES
-- ============================================================================

CREATE POLICY "Users can view strategies from shared plans"
  ON strategies FOR SELECT
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid())));

CREATE POLICY "Users can insert strategies in own plans"
  ON strategies FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can update strategies in shared plans"
  ON strategies FOR UPDATE
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid() AND access_level IN ('edit', 'admin'))))
  WITH CHECK (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete strategies from own plans"
  ON strategies FOR DELETE
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

-- ============================================================================
-- CAUSAL LOOP DIAGRAMS POLICIES
-- ============================================================================

CREATE POLICY "Users can view cld from shared plans"
  ON causal_loop_diagrams FOR SELECT
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid())));

CREATE POLICY "Users can insert cld in own plans"
  ON causal_loop_diagrams FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can update cld in shared plans"
  ON causal_loop_diagrams FOR UPDATE
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid() AND access_level IN ('edit', 'admin'))))
  WITH CHECK (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete cld from own plans"
  ON causal_loop_diagrams FOR DELETE
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

-- ============================================================================
-- CLD VARIABLES & LINKS POLICIES
-- ============================================================================

CREATE POLICY "Users can view cld_variables"
  ON cld_variables FOR SELECT
  USING (diagram_id IN (SELECT id FROM causal_loop_diagrams WHERE plan_id IN (
    SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
    id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid()))));

CREATE POLICY "Users can insert cld_variables"
  ON cld_variables FOR INSERT
  WITH CHECK (diagram_id IN (SELECT id FROM causal_loop_diagrams WHERE plan_id IN (
    SELECT id FROM strategic_plans WHERE user_id = auth.uid())));

CREATE POLICY "Users can view cld_links"
  ON cld_links FOR SELECT
  USING (diagram_id IN (SELECT id FROM causal_loop_diagrams WHERE plan_id IN (
    SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
    id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid()))));

CREATE POLICY "Users can insert cld_links"
  ON cld_links FOR INSERT
  WITH CHECK (diagram_id IN (SELECT id FROM causal_loop_diagrams WHERE plan_id IN (
    SELECT id FROM strategic_plans WHERE user_id = auth.uid())));

-- ============================================================================
-- ARCHETYPES & LEVERAGE POINTS POLICIES
-- ============================================================================

CREATE POLICY "Users can view archetypes"
  ON archetypes FOR SELECT
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid())));

CREATE POLICY "Users can insert archetypes"
  ON archetypes FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can view leverage_points"
  ON leverage_points FOR SELECT
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid())));

CREATE POLICY "Users can insert leverage_points"
  ON leverage_points FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

-- ============================================================================
-- BSC & KPI POLICIES
-- ============================================================================

CREATE POLICY "Users can view bsc_objectives"
  ON bsc_objectives FOR SELECT
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid())));

CREATE POLICY "Users can insert bsc_objectives"
  ON bsc_objectives FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can view kpis"
  ON kpis FOR SELECT
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid())));

CREATE POLICY "Users can insert kpis"
  ON kpis FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can view kpi_history"
  ON kpi_history FOR SELECT
  USING (kpi_id IN (SELECT id FROM kpis WHERE plan_id IN (
    SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
    id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid()))));

CREATE POLICY "Users can insert kpi_history"
  ON kpi_history FOR INSERT
  WITH CHECK (kpi_id IN (SELECT id FROM kpis WHERE plan_id IN (
    SELECT id FROM strategic_plans WHERE user_id = auth.uid())));

-- ============================================================================
-- PAPS POLICIES
-- ============================================================================

CREATE POLICY "Users can view paps"
  ON paps FOR SELECT
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid())));

CREATE POLICY "Users can insert paps"
  ON paps FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can view pap_milestones"
  ON pap_milestones FOR SELECT
  USING (pap_id IN (SELECT id FROM paps WHERE plan_id IN (
    SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
    id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid()))));

CREATE POLICY "Users can insert pap_milestones"
  ON pap_milestones FOR INSERT
  WITH CHECK (pap_id IN (SELECT id FROM paps WHERE plan_id IN (
    SELECT id FROM strategic_plans WHERE user_id = auth.uid())));

CREATE POLICY "Users can view pap_budget"
  ON pap_budget FOR SELECT
  USING (pap_id IN (SELECT id FROM paps WHERE plan_id IN (
    SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
    id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid()))));

CREATE POLICY "Users can insert pap_budget"
  ON pap_budget FOR INSERT
  WITH CHECK (pap_id IN (SELECT id FROM paps WHERE plan_id IN (
    SELECT id FROM strategic_plans WHERE user_id = auth.uid())));

CREATE POLICY "Users can view pap_resources"
  ON pap_resources FOR SELECT
  USING (pap_id IN (SELECT id FROM paps WHERE plan_id IN (
    SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
    id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid()))));

CREATE POLICY "Users can insert pap_resources"
  ON pap_resources FOR INSERT
  WITH CHECK (pap_id IN (SELECT id FROM paps WHERE plan_id IN (
    SELECT id FROM strategic_plans WHERE user_id = auth.uid())));

-- ============================================================================
-- MEL POLICIES
-- ============================================================================

CREATE POLICY "Users can view mel_frameworks"
  ON mel_frameworks FOR SELECT
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid())));

CREATE POLICY "Users can insert mel_frameworks"
  ON mel_frameworks FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can view mel_logs"
  ON mel_logs FOR SELECT
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid())));

CREATE POLICY "Users can insert mel_logs"
  ON mel_logs FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can view mel_insights"
  ON mel_insights FOR SELECT
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid())));

CREATE POLICY "Users can insert mel_insights"
  ON mel_insights FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

-- ============================================================================
-- COLLABORATION POLICIES
-- ============================================================================

CREATE POLICY "Users can view comments from shared plans"
  ON plan_comments FOR SELECT
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid())));

CREATE POLICY "Users can insert comments in shared plans"
  ON plan_comments FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid())) AND user_id = auth.uid());

CREATE POLICY "Users can view their shares"
  ON plan_shares FOR SELECT
  USING (shared_by_id = auth.uid() OR shared_with_id = auth.uid());

CREATE POLICY "Users can create shares from own plans"
  ON plan_shares FOR INSERT
  WITH CHECK (shared_by_id = auth.uid() AND plan_id IN (
    SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can view presence in shared plans"
  ON user_presence FOR SELECT
  USING (plan_id IN (SELECT id FROM strategic_plans WHERE user_id = auth.uid() OR 
         id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid())));

CREATE POLICY "Users can update own presence"
  ON user_presence FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TEMPLATES & EXPORT POLICIES
-- ============================================================================

CREATE POLICY "Users can view own templates and public templates"
  ON plan_templates FOR SELECT
  USING (creator_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can view all ratings"
  ON template_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can rate templates"
  ON template_ratings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own exports"
  ON plan_exports FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create exports from own plans"
  ON plan_exports FOR INSERT
  WITH CHECK (user_id = auth.uid() AND plan_id IN (
    SELECT id FROM strategic_plans WHERE user_id = auth.uid()));

CREATE POLICY "Public can view shared plans via share links"
  ON share_links FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- ADMIN & AUDIT POLICIES
-- ============================================================================

CREATE POLICY "Admins can view all visit logs"
  ON visit_logs FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "Admins can view all activity logs"
  ON activity_log FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "System can insert activity logs"
  ON activity_log FOR INSERT
  WITH CHECK (true);
