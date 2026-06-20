# Database Schema Documentation

## Overview

Strat Planner Pro uses PostgreSQL with Row-Level Security (RLS) policies to ensure secure, multi-user access to strategic planning data. The schema is organized into logical modules corresponding to the application's major features.

## Core Tables

### `strategic_plans`
Main entity representing an organization's strategic plan.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Plan creator (references auth.users) |
| organization_id | UUID | Associated organization |
| name | TEXT | Plan name |
| description | TEXT | Plan description |
| industry | VARCHAR(100) | Industry classification |
| fiscal_year | VARCHAR(4) | Fiscal year |
| planning_horizon | INTEGER | Number of years in plan (default: 3) |
| status | VARCHAR(20) | draft, active, archived, completed |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Key Relationships:**
- Owner: user_id → auth.users
- Contains: swot_items, strategies, paps, objectives
- Shared with: plan_shares

---

### `user_profiles`
User account information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | References auth.users(id) |
| full_name | TEXT | User's full name |
| avatar_url | TEXT | Profile picture URL |
| organization | TEXT | Organization name |
| job_title | TEXT | Job title |
| phone | TEXT | Contact phone |
| verification_status | VARCHAR(20) | pending, verified, rejected |
| plan_tier | VARCHAR(20) | free, starter, pro, enterprise |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

---

### `user_settings`
User preferences and configuration.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users(id) UNIQUE |
| theme | VARCHAR(10) | light, dark |
| language | VARCHAR(5) | Language code (e.g., 'en', 'es') |
| notifications_enabled | BOOLEAN | Global notifications toggle |
| ai_model | VARCHAR(50) | Selected AI model |
| ai_temperature | NUMERIC | Model temperature (0-1) |
| ai_auto_suggest | BOOLEAN | Auto-suggest features toggle |
| two_factor_enabled | BOOLEAN | 2FA status |
| integrations | JSONB | Integration credentials and configs |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

---

## SWOT & Strategy Module

### `swot_items`
Strengths, Weaknesses, Opportunities, Threats.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Foreign key to strategic_plans |
| user_id | UUID | Creator |
| category | VARCHAR(20) | strength, weakness, opportunity, threat |
| title | TEXT | Item title |
| description | TEXT | Detailed description |
| evidence | TEXT | Supporting evidence |
| impact | INTEGER | Impact rating (1-5) |
| likelihood | INTEGER | Likelihood rating (1-5) |
| owner_id | UUID | Assigned owner |
| tags | TEXT[] | Categorization tags |
| source | VARCHAR(100) | Data source |
| verified | BOOLEAN | Verification status |
| ai_generated | BOOLEAN | Auto-generated flag |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

**Indexes:**
- plan_id, category, user_id

---

### `strategies` (TOWS Matrix)
Strategic options derived from SWOT analysis.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Foreign key to strategic_plans |
| user_id | UUID | Creator |
| strategy_type | VARCHAR(10) | SO, WO, ST, WT |
| title | TEXT | Strategy title |
| description | TEXT | Detailed description |
| rationale | TEXT | Why this strategy |
| swot_item_ids | UUID[] | Related SWOT items |
| priority | INTEGER | Priority (1-5) |
| owner_id | UUID | Assigned owner |
| status | VARCHAR(20) | draft, approved, active, completed |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

**Relationships:**
- References swot_items (one-to-many)
- Referenced by bsc_objectives

---

## Systems Thinking Module

### `causal_loop_diagrams`
Captures system dynamics and feedback loops.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Foreign key to strategic_plans |
| user_id | UUID | Creator |
| name | TEXT | Diagram name |
| description | TEXT | Description |
| diagram_json | JSONB | Visual diagram data |
| loop_type | VARCHAR(20) | reinforcing, balancing, mixed |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

**Child Tables:**
- cld_variables (variables/nodes)
- cld_links (relationships)

---

### `cld_variables`
Variables/nodes in a causal loop diagram.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| diagram_id | UUID | Parent diagram |
| name | TEXT | Variable name |
| initial_value | NUMERIC | Starting value |
| unit | TEXT | Measurement unit |
| polarity | VARCHAR(10) | positive, negative |
| description | TEXT | Variable description |
| source_swot_id | UUID | Linked SWOT item |
| created_at | TIMESTAMP | Creation time |

---

### `cld_links`
Relationships between CLD variables.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| diagram_id | UUID | Parent diagram |
| from_variable_id | UUID | Source variable |
| to_variable_id | UUID | Target variable |
| polarity | VARCHAR(10) | positive, negative |
| strength | INTEGER | Strength (1-5) |
| description | TEXT | Relationship description |
| delay_period | INTEGER | Time delay (periods) |
| created_at | TIMESTAMP | Creation time |

---

### `archetypes`
Systems thinking archetypes library.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Plan this applies to |
| user_id | UUID | Creator |
| archetype_name | VARCHAR(100) | e.g., "Tragedy of the Commons" |
| archetype_type | VARCHAR(50) | Category |
| description | TEXT | Description |
| diagram_id | UUID | Associated CLD |
| key_characteristics | TEXT[] | Defining features |
| warning_signals | TEXT[] | Early warning indicators |
| intervention_points | TEXT[] | Points to intervene |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

---

### `leverage_points`
Meadows leverage points for system intervention.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Plan this applies to |
| user_id | UUID | Creator |
| leverage_level | INTEGER | Level 1-12 (1=highest leverage) |
| leverage_name | VARCHAR(100) | Lever name |
| description | TEXT | Description |
| system_element | TEXT | What system element to change |
| proposed_intervention | TEXT | How to intervene |
| expected_impact | TEXT | Predicted outcome |
| effort_required | VARCHAR(20) | low, medium, high |
| implementation_timeline | INTEGER | Months to implement |
| related_archetype_id | UUID | Associated archetype |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

---

## Balanced Scorecard Module

### `bsc_objectives`
Balanced scorecard objectives across 4 perspectives.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Parent plan |
| user_id | UUID | Creator |
| perspective | VARCHAR(50) | financial, customer, internal-process, learning-growth |
| title | TEXT | Objective title |
| description | TEXT | Objective description |
| strategy_id | UUID | Linked strategy |
| priority | INTEGER | Priority (1-5) |
| owner_id | UUID | Assigned owner |
| status | VARCHAR(20) | draft, approved, active, completed |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

**Child Tables:**
- kpis (one-to-many)

---

### `kpis`
Key Performance Indicators for objectives.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| objective_id | UUID | Parent objective |
| plan_id | UUID | Parent plan |
| user_id | UUID | Creator |
| name | TEXT | KPI name |
| description | TEXT | Description |
| baseline | NUMERIC | Starting value |
| target | NUMERIC | Target value |
| current | NUMERIC | Current value |
| unit | TEXT | Measurement unit |
| measurement_frequency | VARCHAR(20) | daily, weekly, monthly, quarterly, annually |
| data_source | TEXT | Where data comes from |
| owner_id | UUID | Assigned owner |
| status | VARCHAR(20) | on-track, at-risk, behind, exceeded |
| trend | VARCHAR(10) | up, down, stable |
| threshold_warning | NUMERIC | Warning level |
| threshold_critical | NUMERIC | Critical level |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

**Auto-Calculated Fields:**
- `status` is calculated by comparing current vs target
- `trend` tracks directional movement

**Child Tables:**
- kpi_history (one-to-many)

---

### `kpi_history`
Historical tracking of KPI values.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| kpi_id | UUID | Parent KPI |
| value | NUMERIC | Recorded value |
| recorded_at | TIMESTAMP | When measured |
| notes | TEXT | Measurement notes |
| created_at | TIMESTAMP | Creation time |

---

## PAPs Management Module

### `paps` (Programs/Activities/Projects)
Initiatives to execute strategy.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Parent plan |
| user_id | UUID | Creator |
| parent_pap_id | UUID | Parent PAP (for hierarchy) |
| type | VARCHAR(20) | program, activity, project |
| name | TEXT | PAP name |
| description | TEXT | Description |
| objective_id | UUID | Linked objective |
| strategy_id | UUID | Linked strategy |
| owner_id | UUID | Assigned owner |
| budget | NUMERIC | Total budget |
| spent | NUMERIC | Amount spent (auto-calculated) |
| progress | INTEGER | Progress (0-100%) |
| status | VARCHAR(20) | planning, active, on-hold, completed, cancelled |
| start_date | DATE | Start date |
| end_date | DATE | End date |
| milestone_count | INTEGER | Number of milestones |
| risk_level | VARCHAR(10) | low, medium, high |
| resource_count | INTEGER | Number of resources |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

**Child Tables:**
- pap_milestones
- pap_budget
- pap_resources
- paps (self-referencing for hierarchy)

---

### `pap_milestones`
Checkpoints in PAP execution.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| pap_id | UUID | Parent PAP |
| name | TEXT | Milestone name |
| description | TEXT | Description |
| due_date | DATE | Due date |
| completed_date | DATE | Actual completion date |
| status | VARCHAR(20) | pending, in-progress, completed, delayed |
| deliverables | TEXT[] | Deliverable list |
| owner_id | UUID | Assigned owner |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

---

### `pap_budget`
Budget tracking by period.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| pap_id | UUID | Parent PAP |
| budget_period | VARCHAR(20) | Q1, Q2, etc. |
| allocated | NUMERIC | Allocated budget |
| spent | NUMERIC | Actual spending |
| variance | NUMERIC | Difference (auto-calculated) |
| currency | VARCHAR(3) | Currency code |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

---

### `pap_resources`
Human and material resources for PAPs.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| pap_id | UUID | Parent PAP |
| resource_name | TEXT | Resource name |
| resource_type | VARCHAR(50) | Personnel, equipment, etc. |
| allocation_percentage | NUMERIC | % allocated (0-100) |
| owner_id | UUID | Resource owner |
| start_date | DATE | Assignment start |
| end_date | DATE | Assignment end |
| created_at | TIMESTAMP | Creation time |

---

## MEL Dashboard Module

### `mel_frameworks`
Monitoring, Evaluation & Learning framework.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Parent plan |
| user_id | UUID | Creator |
| name | TEXT | Framework name |
| description | TEXT | Description |
| evaluation_cycle | VARCHAR(50) | Frequency of evaluation |
| learning_approach | TEXT | How learning is captured |
| data_collection_methods | TEXT[] | Methods used |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

---

### `mel_logs`
Actual performance data and measurements.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Parent plan |
| user_id | UUID | Creator |
| log_date | TIMESTAMP | When measured |
| kpi_id | UUID | Associated KPI |
| pap_id | UUID | Associated PAP |
| actual_value | NUMERIC | Measured value |
| commentary | TEXT | Analysis and notes |
| attached_evidence | TEXT[] | Supporting documents |
| created_by | UUID | Who entered data |
| created_at | TIMESTAMP | Creation time |

---

### `mel_insights`
Analysis and learning from MEL data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Parent plan |
| user_id | UUID | Creator |
| insight_type | VARCHAR(50) | performance, risk, learning, etc. |
| title | TEXT | Insight title |
| description | TEXT | Detailed insight |
| related_kpis | UUID[] | Associated KPIs |
| related_paps | UUID[] | Associated PAPs |
| recommendation | TEXT | Recommended action |
| impact_rating | INTEGER | Potential impact (1-5) |
| action_required | BOOLEAN | Requires action |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

---

## Team Collaboration Module

### `plan_comments`
Threaded comments on plans and entities.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Parent plan |
| user_id | UUID | Author |
| parent_comment_id | UUID | Parent comment (for threads) |
| comment_type | VARCHAR(50) | general, suggestion, issue, resolved |
| entity_type | VARCHAR(50) | Type of entity being commented on |
| entity_id | UUID | ID of entity |
| content | TEXT | Comment text |
| attachments | TEXT[] | File attachments |
| mentions | UUID[] | Mentioned users |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

---

### `plan_shares`
Collaboration access grants.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Shared plan |
| shared_by_id | UUID | User granting access |
| shared_with_id | UUID | User receiving access |
| access_level | VARCHAR(20) | view, comment, edit, admin |
| share_date | TIMESTAMP | When shared |
| expiration_date | TIMESTAMP | When access expires |
| created_at | TIMESTAMP | Creation time |

---

### `user_presence`
Live user presence for real-time collaboration.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Current plan |
| user_id | UUID | User |
| cursor_position | JSONB | Cursor location |
| last_activity | TIMESTAMP | Last activity time |
| is_active | BOOLEAN | Currently active |
| created_at | TIMESTAMP | Creation time |

---

## Templates & Export Module

### `plan_templates`
Reusable plan templates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| creator_id | UUID | Template creator |
| name | TEXT | Template name |
| description | TEXT | Description |
| industry | VARCHAR(100) | Target industry |
| planning_horizon | INTEGER | Planning period |
| template_json | JSONB | Template structure |
| is_public | BOOLEAN | Publicly available |
| downloads | INTEGER | Download count |
| average_rating | NUMERIC | Avg rating (0-5) |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

---

### `template_ratings`
Community ratings for templates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| template_id | UUID | Rated template |
| user_id | UUID | Rater |
| rating | INTEGER | Rating (1-5) |
| review | TEXT | Review text |
| created_at | TIMESTAMP | Creation time |

**Constraint:** One rating per user per template (UNIQUE)

---

### `plan_exports`
Export history and generated reports.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Exported plan |
| user_id | UUID | Exporter |
| export_format | VARCHAR(20) | pdf, html, json, excel |
| file_path | TEXT | Storage path |
| file_size | INTEGER | File size in bytes |
| export_title | TEXT | Report title |
| include_sections | TEXT[] | Included sections |
| created_at | TIMESTAMP | Creation time |

---

### `share_links`
Public read-only access links.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | Shared plan |
| created_by_id | UUID | Creator |
| share_token | VARCHAR(64) | Unique token UNIQUE |
| access_level | VARCHAR(20) | view, comment |
| is_active | BOOLEAN | Active status |
| expiration_date | TIMESTAMP | Expiration time |
| view_count | INTEGER | Number of views |
| created_at | TIMESTAMP | Creation time |

---

## Admin & Audit Module

### `admins`
System administrators.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Admin user |
| role | VARCHAR(20) | admin, super_admin |
| permissions | TEXT[] | Permission list |
| created_at | TIMESTAMP | Creation time |

---

### `visit_logs`
Page view analytics.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Visiting user |
| page_path | TEXT | Page URL path |
| referrer | TEXT | Referring page |
| user_agent | TEXT | Browser info |
| ip_address | INET | IP address |
| visit_duration | INTEGER | Duration in seconds |
| created_at | TIMESTAMP | Visit time |

---

### `activity_log`
Complete audit trail.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Acting user |
| plan_id | UUID | Related plan |
| action | VARCHAR(100) | Action performed |
| entity_type | VARCHAR(50) | Entity type modified |
| entity_id | UUID | Entity ID |
| old_values | JSONB | Previous values |
| new_values | JSONB | New values |
| ip_address | INET | IP address |
| user_agent | TEXT | Browser info |
| severity | VARCHAR(20) | info, warning, error |
| created_at | TIMESTAMP | Log time |

---

## Row-Level Security (RLS) Policies

All user-data tables have RLS policies enforcing:

1. **Owner Access**: Users can access their own plans
2. **Shared Access**: Users can access plans shared with them based on access_level
3. **Cascading Access**: Access to plans cascades to all related entities

Example policy for `swot_items`:
```sql
CREATE POLICY "Users can view swot_items from shared plans"
  ON swot_items FOR SELECT
  USING (plan_id IN (
    SELECT id FROM strategic_plans 
    WHERE user_id = auth.uid() OR 
          id IN (SELECT plan_id FROM plan_shares WHERE shared_with_id = auth.uid())
  ));
Performance Indexes
All tables have indexes on:

Foreign keys (user_id, plan_id, etc.)
Frequently queried columns (status, category, perspective)
Sorting columns (created_at, updated_at)
Relationships Diagram
Code
strategic_plans (root)
├── swot_items
├── strategies
├── causal_loop_diagrams
│   ├── cld_variables
│   └── cld_links
├── archetypes
├── leverage_points
├── bsc_objectives
│   └── kpis
│       └── kpi_history
├── paps
│   ├── pap_milestones
│   ├── pap_budget
│   └── pap_resources
├── mel_frameworks
├── mel_logs
├── mel_insights
├── plan_comments
├── plan_shares
├── user_presence
└── plan_exports

user_profiles
user_settings
plan_templates
  └── template_ratings
share_links
admins
visit_logs
activity_log
Maintenance & Operations
Cleanup Procedures
cleanup_stale_presence(): Removes user presence entries older than 1 hour
Audit logs should be archived periodically
Old kpi_history entries can be aggregated for reporting
Monitoring
Track table growth rates
Monitor index usage
Alert on RLS policy violations
Monitor trigger performance
Backup Strategy
Full backups: Daily
Transaction logs: Hourly
Point-in-time recovery: 30 days
