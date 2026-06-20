# Setup Instructions

## Local Development

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Supabase CLI (optional, for local Edge Function development)
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/asilvainnovations/Strat-Planner-Pro.git
cd Strat-Planner-Pro
Step 2: Install Dependencies
bash
npm ci
Step 3: Environment Setup
Copy the example environment file:

bash
cp .env.example .env.local
Fill in required variables:

env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PWA_EXTERNAL_URL=https://asilvainnovations.github.io/strat-planner-pwa/index.html
Step 4: Start Development Server
bash
npm run dev
Open http://localhost:5173 in your browser.

Step 5: Set Up Local Supabase (Optional)
For local Edge Function development:

bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Update env variables to local instance
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=local-key
Database Setup
Apply RLS Policies
Connect to your Supabase database and run:

bash
psql $SUPABASE_DB_URL < supabase/policies/rls.sql
Or copy/paste the contents of supabase/policies/rls.sql into the SQL editor in Supabase.

Verify Tables Exist
Ensure all required tables are created:

SQL
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
Expected tables:

strategic_plans
swot_items
strategic_options
bsc_objectives
kpis
paps
user_settings
user_profiles
plan_comments
user_presence
mel_logs
Testing
Run Unit Tests
bash
npm run test
With coverage:

bash
npm run test:coverage
Run E2E Tests
bash
npm run test:e2e
With UI:

bash
npm run test:e2e:ui
Linting & Code Quality
Check for Issues
bash
npm run lint
npm run type-check
Auto-Fix Issues
bash
npm run lint:fix
npm run format
Build for Production
bash
npm run build
Output is in dist/ directory.

Preview production build:

bash
npm run preview
Troubleshooting
Environment Variables Not Loading
Ensure .env.local exists (not .env)
Variables must start with VITE_ to be available in browser
Restart dev server after changing .env.local
Supabase Connection Error
Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
Check Supabase project is active
Ensure firewall allows connections
Port 5173 Already in Use
bash
# Use different port
npm run dev -- --port 5174
Tests Failing Locally
Clear cache: rm -rf .next .vite node_modules/.vite
Reinstall dependencies: npm ci
Run tests with update snapshots: npm run test -- -u
Next Steps
Review CONTRIBUTING.md for development guidelines
Check SECURITY.md for security best practices
Read README.md for feature overview
