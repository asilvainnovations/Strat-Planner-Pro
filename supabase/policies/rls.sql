-- ==========================================
-- Row Level Security (RLS) Policies
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE swot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE bsc_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE paps ENABLE ROW LEVEL SECURITY;
ALTER TABLE mel_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- user_profiles policies
-- ==========================================
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ==========================================
-- strategic_plans policies
-- ==========================================
CREATE POLICY "Users can view own plans"
  ON strategic_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans"
  ON strategic_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON strategic_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON strategic_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- Helper function to check plan ownership
-- ==========================================
CREATE OR REPLACE FUNCTION is_plan_owner(plan_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM strategic_plans
    WHERE id = plan_uuid AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ==========================================
-- Dependent tables policies (SWOT, KPIs, PAPs, etc.)
-- ==========================================
CREATE POLICY "Users can manage own plan SWOT items"
  ON swot_items FOR ALL
  USING (is_plan_owner(plan_id))
  WITH CHECK (is_plan_owner(plan_id));

CREATE POLICY "Users can manage own plan strategic options"
  ON strategic_options FOR ALL
  USING (is_plan_owner(plan_id))
  WITH CHECK (is_plan_owner(plan_id));

CREATE POLICY "Users can manage own plan BSC objectives"
  ON bsc_objectives FOR ALL
  USING (is_plan_owner(plan_id))
  WITH CHECK (is_plan_owner(plan_id));

CREATE POLICY "Users can manage own plan KPIs"
  ON kpis FOR ALL
  USING (is_plan_owner(plan_id))
  WITH CHECK (is_plan_owner(plan_id));

CREATE POLICY "Users can manage own plan PAPs"
  ON paps FOR ALL
  USING (is_plan_owner(plan_id))
  WITH CHECK (is_plan_owner(plan_id));

CREATE POLICY "Users can manage own plan MEL logs"
  ON mel_logs FOR ALL
  USING (is_plan_owner(plan_id))
  WITH CHECK (is_plan_owner(plan_id));
