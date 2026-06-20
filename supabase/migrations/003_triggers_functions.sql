-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create audit trail entry function
CREATE OR REPLACE FUNCTION create_activity_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_log (
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    severity
  ) VALUES (
    auth.uid(),
    TG_ARGV[0],
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    'info'
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update KPI status based on current vs target
CREATE OR REPLACE FUNCTION update_kpi_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current >= NEW.target THEN
    NEW.status = 'exceeded';
  ELSIF NEW.current >= (NEW.target * 0.9) THEN
    NEW.status = 'on-track';
  ELSIF NEW.current >= (NEW.target * 0.75) THEN
    NEW.status = 'at-risk';
  ELSE
    NEW.status = 'behind';
  END IF;

  IF NEW.current > COALESCE(OLD.current, 0) THEN
    NEW.trend = 'up';
  ELSIF NEW.current < COALESCE(OLD.current, 0) THEN
    NEW.trend = 'down';
  ELSE
    NEW.trend = 'stable';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update PAP aggregates
CREATE OR REPLACE FUNCTION update_pap_aggregates()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'paps' THEN
    UPDATE paps
    SET
      milestone_count = (SELECT COUNT(*) FROM pap_milestones WHERE pap_id = NEW.id),
      resource_count = (SELECT COUNT(*) FROM pap_resources WHERE pap_id = NEW.id),
      spent = (SELECT COALESCE(SUM(spent), 0) FROM pap_budget WHERE pap_id = NEW.id)
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up stale user presence
CREATE OR REPLACE FUNCTION cleanup_stale_presence()
RETURNS void AS $$
BEGIN
  DELETE FROM user_presence
  WHERE last_activity < NOW() - INTERVAL '1 hour'
  AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_strategic_plans_updated_at
  BEFORE UPDATE ON strategic_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swot_items_updated_at
  BEFORE UPDATE ON swot_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at
  BEFORE UPDATE ON strategies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_causal_loop_diagrams_updated_at
  BEFORE UPDATE ON causal_loop_diagrams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_archetypes_updated_at
  BEFORE UPDATE ON archetypes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leverage_points_updated_at
  BEFORE UPDATE ON leverage_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bsc_objectives_updated_at
  BEFORE UPDATE ON bsc_objectives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpis_updated_at
  BEFORE UPDATE ON kpis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paps_updated_at
  BEFORE UPDATE ON paps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pap_milestones_updated_at
  BEFORE UPDATE ON pap_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pap_budget_updated_at
  BEFORE UPDATE ON pap_budget
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mel_frameworks_updated_at
  BEFORE UPDATE ON mel_frameworks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mel_insights_updated_at
  BEFORE UPDATE ON mel_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_comments_updated_at
  BEFORE UPDATE ON plan_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_templates_updated_at
  BEFORE UPDATE ON plan_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGERS FOR AUDIT LOGGING
-- ============================================================================

CREATE TRIGGER audit_strategic_plans
  AFTER INSERT OR UPDATE OR DELETE ON strategic_plans
  FOR EACH ROW EXECUTE FUNCTION create_activity_log('plan_modified');

CREATE TRIGGER audit_swot_items
  AFTER INSERT OR UPDATE OR DELETE ON swot_items
  FOR EACH ROW EXECUTE FUNCTION create_activity_log('swot_modified');

CREATE TRIGGER audit_strategies
  AFTER INSERT OR UPDATE OR DELETE ON strategies
  FOR EACH ROW EXECUTE FUNCTION create_activity_log('strategy_modified');

CREATE TRIGGER audit_kpis
  AFTER INSERT OR UPDATE OR DELETE ON kpis
  FOR EACH ROW EXECUTE FUNCTION create_activity_log('kpi_modified');

CREATE TRIGGER audit_paps
  AFTER INSERT OR UPDATE OR DELETE ON paps
  FOR EACH ROW EXECUTE FUNCTION create_activity_log('pap_modified');

CREATE TRIGGER audit_pap_milestones
  AFTER INSERT OR UPDATE OR DELETE ON pap_milestones
  FOR EACH ROW EXECUTE FUNCTION create_activity_log('milestone_modified');

-- ============================================================================
-- TRIGGERS FOR STATUS UPDATES
-- ============================================================================

CREATE TRIGGER calculate_kpi_status
  BEFORE INSERT OR UPDATE ON kpis
  FOR EACH ROW EXECUTE FUNCTION update_kpi_status();

-- ============================================================================
-- TRIGGERS FOR AGGREGATES
-- ============================================================================

CREATE TRIGGER update_pap_stats_on_milestone
  AFTER INSERT OR UPDATE OR DELETE ON pap_milestones
  FOR EACH ROW EXECUTE FUNCTION update_pap_aggregates();

CREATE TRIGGER update_pap_stats_on_resource
  AFTER INSERT OR UPDATE OR DELETE ON pap_resources
  FOR EACH ROW EXECUTE FUNCTION update_pap_aggregates();

CREATE TRIGGER update_pap_stats_on_budget
  AFTER INSERT OR UPDATE OR DELETE ON pap_budget
  FOR EACH ROW EXECUTE FUNCTION update_pap_aggregates();

-- ============================================================================
-- SCHEDULED FUNCTIONS (via pg_cron if available)
-- ============================================================================

-- Note: Uncomment if pg_cron extension is installed
-- SELECT cron.schedule('cleanup_stale_presence', '0 * * * *', 'SELECT cleanup_stale_presence()');
