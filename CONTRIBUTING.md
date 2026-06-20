# Contributing to Strat Planner Pro

Thank you for your interest in contributing to Strat Planner Pro! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Git

### Setup Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Strat-Planner-Pro.git
   cd Strat-Planner-Pro
Add upstream remote:
bash
git remote add upstream https://github.com/asilvainnovations/Strat-Planner-Pro.git
Create a local .env.local file (copy from .env.example):
bash
cp .env.example .env.local
Fill in required environment variables (ask maintainers for dev keys)
Install dependencies:
bash
npm ci
Start development server:
bash
npm run dev
Branch Strategy
Branch Naming Convention
Code
<type>/<description>
Types:

feature/ — New functionality
bugfix/ — Bug fixes
chore/ — Build, CI, documentation
refactor/ — Code refactoring without functional change
perf/ — Performance improvements
security/ — Security updates
test/ — Test-related changes
Examples:

feature/add-mel-dashboard
bugfix/fix-swot-validation
security/upgrade-supabase-auth
test/add-e2e-tests-for-auth
Branch Management
Create feature branch from develop:
bash
git checkout develop
git pull upstream develop
git checkout -b feature/my-feature
Keep branch updated:
bash
git fetch upstream
git rebase upstream/develop
Before merging, squash commits:
bash
git rebase -i upstream/develop
Commit Guidelines
Commit Message Format 
<type>(<scope>): <subject>

<body>

<footer>
Type: Must be one of:

feat — A new feature
fix — A bug fix
docs — Documentation only changes
style — Changes that don't affect code meaning (formatting, missing semicolons, etc.)
refactor — Code change that neither fixes a bug nor adds a feature
perf — Code change that improves performance
test — Adding missing tests or correcting existing tests
ci — Changes to CI configuration files and scripts
chore — Other changes that don't modify src or test files
Scope: The area of the codebase affected (optional)

Subject:

Use imperative mood ("add" not "adds" or "added")
Don't capitalize first letter
No period (.) at the end
Limit to 50 characters
Body:

Explain what and why, not how
Wrap at 72 characters
Reference issues: "Fixes #123"
Footer:

Reference issues and PRs
Breaking changes: "BREAKING CHANGE: description"
Examples

feat(swot): add bulk SWOT generation with AI

Implement AI-powered bulk generation for SWOT items.
Users can now generate strengths, weaknesses, opportunities,
and threats in batch using the AI Strategist.

Fixes #42

fix(mel): correct KPI aggregation logic

The KPI aggregation was incorrectly summing values
from deleted plans. Now filters by plan status first.

Fixes #87
Pull Request Process
Before Opening a PR
Ensure all tests pass:
bash
npm run test -- --run
Lint and fix issues:
bash
npm run lint:fix
Type check:
bash
npm run type-check
Build for production:
bash
npm run build
Run formatting:
bash
npm run format
PR Title Format
Same as commit messages:


<type>(<scope>): <description>
PR Description Template
Markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123
Related to #456

## How Has This Been Tested?
Describe testing approach:
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Build passes locally

## Screenshots (if applicable)
Add screenshots for UI changes.
PR Review Process
At least 1 maintainer approval required
All CI checks must pass
No merge conflicts
Branch must be up-to-date with develop
Testing Guidelines
Unit Tests
TypeScript
// src/hooks/useStrategicPlan.test.ts
import { renderHook, act } from "@testing-library/react";
import { useStrategicPlan } from "./useStrategicPlan";

describe("useStrategicPlan", () => {
  it("should initialize with empty plan", () => {
    const { result } = renderHook(() => useStrategicPlan());
    expect(result.current.plan.swotItems).toEqual([]);
  });

  it("should add SWOT item", async () => {
    const { result } = renderHook(() => useStrategicPlan());
    await act(async () => {
      await result.current.addSwotItem({
        category: "strength",
        description: "Test strength",
      });
    });
    expect(result.current.plan.swotItems).toHaveLength(1);
  });
});
E2E Tests
TypeScript
// src/e2e/auth.e2e.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should sign up and create plan", async ({ page }) => {
    await page.goto("/");
    await page.click('button:has-text("Sign In")');
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "SecurePassword123!");
    await page.click('button:has-text("Sign Up")');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
Coverage Requirements
Lines: >= 80%
Functions: >= 80%
Branches: >= 80%
Statements: >= 80%
View coverage:

bash
npm run test:coverage
Code Style
TypeScript
Use strict mode (strict: true)
Avoid any types
Use explicit return types for functions
Use interfaces for object shapes
React
Use functional components and hooks
Memoize expensive components with React.memo
Avoid prop drilling; use context when needed
Name custom hooks with use prefix
Formatting
Code is formatted with Prettier. Auto-format before committing:

bash
npm run format
Or configure your IDE to format on save (VS Code example in .vscode/settings.json).

Documentation
Code Comments
TypeScript
/**
 * Generates strategic options from SWOT analysis.
 * @param swotItems - Array of SWOT items to analyze
 * @returns Array of derived strategic options
 * @throws {Error} If swotItems is empty
 */
function generateStrategicOptions(swotItems: SwotItem[]): StrategicOption[] {
  if (swotItems.length === 0) {
    throw new Error("SWOT items required");
  }
  // Implementation...
}
README Updates
Update README.md if you:

Add new modules or features
Change architecture
Add new environment variables
Update setup instructions
API Documentation
Document Edge Functions in supabase/functions/*/README.md

Performance Considerations
Guidelines
Bundle Size: Monitor with npm run build and check dist/ size
Render Performance: Use React DevTools Profiler
Database: Use indexes for frequently queried fields
Caching: Use React Query with appropriate staleTime
Images: Lazy load with loading="lazy" attribute
Lighthouse Targets
Performance: >= 90
Accessibility: >= 95
Best Practices: >= 95
SEO: >= 95
Security
Review Checklist
 No hardcoded secrets
 No dangerouslySetInnerHTML usage
 No unvalidated user input passed to queries
 Proper error handling (no info leakage)
 HTTPS enforced
 CORS properly configured
See SECURITY.md for detailed guidelines.

Questions?
Check existing Issues
Start a Discussion
Email us at support@asilvainnovations.com
Recognition
Contributors are recognized in:

CONTRIBUTORS.md
GitHub contributors page
Release notes
Thank you for contributing! 🚀
