# Strat Planner Pro

> **AI-Driven Strategic Planning Platform** — by **ASilva Innovations**
> Live PWA: <https://asilvainnovations.github.io/strat-planner-pwa/index.html>

Strat Planner Pro turns strategic planning into a science. It guides organisations from environmental diagnosis (SWOT) through systems-thinking analysis (CLDs, archetypes, Meadows leverage points), strategy formulation (TOWS matrix, Balanced Scorecard), execution planning (PAPs with budgets), and real-time monitoring and learning (MEL). The AI Strategist provides contextual advice at every stage.

The web app is mobile-first, dark-themed, fully offline-capable, and syncs to Supabase whenever the user is online.

---

## 1. Feature Matrix

| Module | What it does | Where it lives |
|---|---|---|
| **Dynamic Topbar** | Brand mark + external-link to the PWA, global search across plan + modules, working theme toggle, plan selector, share, sign-in / account menu | `src/components/strategic/Topbar.tsx` |
| **MEL Dashboard** | Real-time Monitoring, Evaluation & Learning across KPIs and PAPs, target-vs-actual + budget charts, embedded AI Strategist chat | `src/components/strategic/MELDashboard.tsx` |
| **SWOT Analysis** | Structured Strengths / Weaknesses / Opportunities / Threats capture, AI-augmented bulk generation | `src/components/strategic/SWOTAnalysis.tsx` |
| **Systems Thinking** | Causal Loop Diagram canvas, 10 archetypes library, Meadows leverage-point analysis, snapshot history | `src/components/strategic/SystemsThinking.tsx` |
| **Strategy Matrix (TOWS)** | Auto-derived SO / ST / WO / WT options from your SWOT | `src/components/strategic/StrategyMatrix.tsx` |
| **Balanced Scorecard** | Objectives & KPIs across 4 perspectives with target tracking | `src/components/strategic/BalancedScorecard.tsx` |
| **PAPs Management** | Programs, Activities & Projects with budget + progress + Gantt rollups | `src/components/strategic/PAPsManagement.tsx` |
| **Plan Generator / Export** | Print-ready PDF / HTML / JSON reports | `src/components/strategic/PlanExport.tsx` |
| **Templates Library** | Pre-built industry plans + community templates with ratings | `src/components/strategic/TemplatesLibrary.tsx` |
| **Team Collaboration** | Multi-user editing, comments, live presence | `src/components/strategic/TeamCollaboration.tsx` |
| **Settings** | Profile · Notifications · Theme · AI Configuration · Security · Language · Integrations | `src/components/settings/SettingsPage.tsx` |
| **Auth Modal** | Email + password, magic-link, password reset, profile editing | `src/components/auth/AuthModal.tsx` |
| **Public Share Links** | Read-only `/shared/:shareId` URLs with revoke | `src/pages/SharedPlanView.tsx` |
| **Super Admin Dashboard** | `/admin` — signups, visits, devices, revenue, verification approval | `src/pages/AdminDashboard.tsx` |

---

## 2. Data Flow — Non-linear Interdependence

Each module both **consumes** and **feeds back into** the others through a single shared `StrategicPlan` object in the `useStrategicPlan` hook. The result is a coherent web of interrelationships.

               ┌────────────────────────────────────┐
               │   SWOT Analysis  (swotItems)       │
               └─────┬──────────────────────┬───────┘
                     │                      │
                     ▼                      ▼
          ┌────────────────────┐   ┌────────────────────┐
          │  Systems Thinking  │   │  Strategy Matrix   │
          │  (CLD nodes/links, │◄──┤  (TOWS options:    │
          │   archetypes)      │   │   SO/ST/WO/WT)     │
          └─────┬──────────────┘   └─────────┬──────────┘
                │                            │
                └────────┬───────────────────┘
                         ▼
              ┌─────────────────────────────────┐
              │  Balanced Scorecard             │
              │  (objectives → KPIs)            │
              └──────────────┬──────────────────┘
                             ▼
              ┌─────────────────────────────────┐
              │  PAPs Management                │
              │  (Programs/Activities/Projects) │
              └──────────────┬──────────────────┘
                             ▼
              ┌─────────────────────────────────┐
              │  MEL Dashboard                  │
              │  • Live KPI status              │
              │  • Budget utilisation           │
              │  • Target vs Actual charts      │
              │  • Pie of PAP budget allocation │
              │  • AI Strategist context        │
              │  • Tutorial deep-link           │
              └─────────────────────────────────┘

- **SWOT → Strategy Matrix** : strategic options are seeded from SWOT items (`bulkAddStrategicOptions`).
- **SWOT → Systems Thinking** : SWOT items become CLD variables with default polarity.
- **Strategy Matrix → BSC** : strategic options translate into objectives across the 4 perspectives.
- **BSC → MEL Dashboard** : every objective and KPI is aggregated, classified by status, and rendered as live KPI cards + bar charts.
- **PAPs → MEL Dashboard** : program/activity/project budget + progress feeds the doughnut + summary cards.
- **MEL Dashboard → AI Strategist** : the system prompt is rebuilt on every render from the current plan snapshot, so all advice is grounded in live data.
- **Plan Generator** : consumes the full plan and emits a publication-ready report.

This means a change anywhere (e.g. updating a SWOT item) propagates through every downstream module without any explicit "sync" button — the single `currentPlan` source of truth handles it.

---

## 3. Architecture

- **Frontend:** React 18 · Vite · TypeScript · Tailwind CSS · shadcn/ui · framer-motion · recharts
- **State:** Custom hooks (`useStrategicPlan`, `useAuth`) + React Query
- **Backend:** Supabase (Postgres + Auth + Edge Functions + Storage)
- **AI:** Famous AI Gateway (default `google/gemini-3-flash`; supports Claude 4 & GPT-5 families)
- **Routing:** React Router v6 — `/*` (app), `/admin`, `/shared/:shareId`
- **PWA:** Hosted static build at <https://asilvainnovations.github.io/strat-planner-pwa/index.html>

### 3.1 Database tables

| Table | Purpose |
|---|---|
| `user_profiles` | Account, organisation, verification_status, plan tier |
| `user_settings` | Notifications, AI config, integrations, theme, security, language (RLS: `auth.uid() = user_id`) |
| `strategic_plans` | Top-level plan records (one user → many plans) |
| `swot_items` | Each SWOT entry tied to a plan |
| `strategic_options` | TOWS-matrix-derived strategies |
| `bsc_objectives` | Balanced Scorecard objectives across 4 perspectives |
| `kpis` | KPIs (current/target/baseline) attached to objectives |
| `paps` | Programs, Activities & Projects with budget + progress |
| `share_links` | Public read/comment-only links |
| `plan_templates` | Reusable industry templates + ratings |
| `template_ratings` | Community ratings for templates |
| `plan_comments` | Threaded comments per plan |
| `plan_shares` | Per-user share grants (collaboration) |
| `organization_members` | Org-level multi-user grouping |
| `admins` | Emails authorised for `/admin` |
| `visit_logs` | Page-view analytics |
| `activity_log` | Audit trail surfacing issues to admin |
| `user_presence` | Live cursor / presence for collaboration |
| `mel_logs` | MEL run history per plan |

### 3.2 Edge Functions

- **`ai-strategy-assistant`** — multi-action AI endpoint. Actions: `generate_swot`, `generate_strategies`, `generate_kpis`, `generate_objectives`, `generate_paps`, `generate_insights`, `analyze_loops`.

---

## 4. Getting Started

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production bundle
4.1 Environment
Copy .env.example to .env.local and fill in:

env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PWA_EXTERNAL_URL=https://asilvainnovations.github.io/strat-planner-pwa/index.html
See README_SETUP.md for detailed setup instructions.

## 5. Topbar (per spec v1.1)
The Topbar (src/components/strategic/Topbar.tsx) is fully wired and mobile-first:

Logo + app name — anchor element with target="_blank" linking to the official PWA at https://asilvainnovations.github.io/strat-planner-pwa/index.html. Hover reveals an ExternalLink icon.
Plan selector — dropdown with create / switch / export / import.
Search bar — fuzzy search across navigation modules, SWOT items, strategic options, objectives, KPIs and PAPs. Clicking a result navigates to the right module. Collapses to an icon on mobile.
Theme toggle — switches between dark, light via next-themes. Persists in localStorage.
Share button — visible only when authenticated + a plan exists. Generates a /shared/:shareId URL and copies it to the clipboard.
Account menu / Sign In — Sign-in modal opens for anonymous users; for authenticated users a dropdown exposes Settings, Profile, Share, Admin (if eligible), PWA link and Sign out.
The whole bar collapses gracefully on narrow viewports (down to ~320 px) — every element uses Tailwind's sm: and md: breakpoints; long plan names truncate; mobile search opens in a popover.

## 6. Settings (fully functional)
Tabs: Profile · Notifications · Theme · AI Configuration · Security · Language · Integrations

Every control is wired to either:

useAuth().updateProfile / updatePassword (profile + security), or
A direct upsert into public.user_settings (notifications, AI config, theme, integrations, language, security flags) — protected by per-user RLS.
Supported integrations (toggle + per-integration API key + webhook): WhatsApp Business · Google Email (Gmail) · Google Analytics · Google Drive · Google Sheets · Zapier · Trello · Slack · GitHub · Google Calendar.

AI Configuration lets users pick the model (Gemini 3 Flash / Pro, GPT-5.4 family, Claude 4 family), persona, temperature, auto-suggest, verbose mode.

## 7. Authentication
Email + password sign-up / sign-in
Magic-link sign-in (passwordless)
Password reset via email
Profile editing modal (avatar URL, full name, organisation, job title, phone)
Admin emails (in admins table) unlock /admin

## 8. Public Share Links
Account dropdown → Share Plan Link generates a unique /shared/:shareId URL and copies it to the clipboard. The hosted read-only viewer renders the plan summary, SWOT, CLD overview and objectives.

## 9. Super Admin Dashboard (/admin)
Signup, visit, location, device & bounce statistics
14-day signups line chart
Plan-revenue stacked bars (Free / Starter / Pro / Enterprise)
Filterable + sortable signups table with Approve / Reject verification controls
Activity log surfacing issues

## 10. AI Strategist
Investment-grade contextual prompts grounded in the live plan snapshot
New analyze_loops action: detects reinforcing/balancing loops, classifies archetypes, ranks leverage points and ties them to selected strategic options
Round-trip JSON enforcement and graceful extraction
Pluggable models via the Famous AI Gateway

## 11. Branding
The platform uses a circular Strat Planner Pro logo across header, sidebar, auth modal, share viewer and loaders. The AI Strategist avatar uses the ASilva Innovations circular mark. Brand palette: deep navy (#0f172a), accent teal (#06b6d4), chart rainbow.

## 12. Mobile-First Design Notes
All layouts use a mobile-first Tailwind ordering (base → sm: → md: → lg:).
The Topbar collapses search into an icon below md.
The Sidebar becomes a slide-over drawer on mobile.
Plan dropdowns cap their max-width and use truncate to avoid horizontal scroll on small screens.
Touch targets are ≥ 36 px.
Charts (recharts) use ResponsiveContainer so they reflow on any screen size.

## 13. Testing
Run all tests:

bash
npm run test
npm run test:coverage
npm run test:e2e
Target: ≥ 80% coverage on lines, functions, branches, statements. See CONTRIBUTING.md for testing guidelines.

## 14. Contributing
See CONTRIBUTING.md for branch strategy, commit format, PR process, and testing guidelines.

## 15. Security
See SECURITY.md for security policy, vulnerability reporting, and best practices.

## 16. License
© 2026 ASilva Innovations. All rights reserved.
