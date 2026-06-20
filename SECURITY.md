# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Strat Planner Pro, please report it responsibly to our security team.

### Reporting Process

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Email `security@asilvainnovations.com` with:
   - Description of the vulnerability
   - Steps to reproduce (if applicable)
   - Potential impact
   - Suggested fix (optional)
3. Include `[SECURITY]` in the subject line

### Response Timeline

- **Initial Response**: Within 24 hours
- **Investigation**: 3-5 business days
- **Fix Development**: Depends on severity
- **Patch Release**: As soon as fix is ready
- **Public Disclosure**: After 90 days or upon your approval (whichever comes first)

### Severity Levels

- **Critical**: Immediate exploitation possible, affects all users
  - Response: 4 hours, patch within 24 hours
- **High**: Significant impact on security/privacy
  - Response: 8 hours, patch within 1 week
- **Medium**: Limited impact, workaround available
  - Response: 24 hours, patch within 2 weeks
- **Low**: Minimal impact, theoretical exploit
  - Response: 48 hours, patch within 30 days

## Security Best Practices

### Environment Variables

- **Never commit `.env` files** to version control
- Use `.env.local` for local development
- Store secrets in GitHub Secrets for CI/CD
- Rotate API keys regularly (every 90 days)

### Supabase Security

#### Row-Level Security (RLS)

All user-data tables MUST have RLS policies enabled:

```sql
-- Enable RLS on all tables
ALTER TABLE strategic_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE swot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE bsc_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE paps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
Authentication
Email Verification: Require email verification before granting full access
Magic Links: Set TTL to 15 minutes, rate-limit to 3 attempts per hour
Password Policy: Enforce minimum 12 characters, complexity requirements
2FA: Available for all users, required for admin accounts
Session Management: Invalidate sessions after 24 hours of inactivity
API & Edge Functions
All Edge Functions must validate JWT tokens
Implement CSRF token validation for state-changing requests
Use HTTPS only (enforce in Supabase settings)
Implement rate-limiting (100 requests/minute per IP)
Log all API access for audit trails
Frontend Security
XSS Prevention: Use React's built-in escaping, never use dangerouslySetInnerHTML
CSRF Protection: Validate origin headers, use SameSite cookies
Content Security Policy: Implement restrictive CSP headers
Dependency Scanning: Run npm audit weekly
Code Signing: Sign commits with GPG keys
AI & Third-Party Integrations
API Key Management: Store in Supabase secrets, never in code
Model Validation: Whitelist approved AI models server-side
Prompt Injection: Sanitize user inputs before passing to AI
Rate Limiting: Limit AI requests to prevent abuse (10 requests/minute per user)
Data Privacy: Never send sensitive user data to external AI services without consent
Monitoring & Logging
Enable Sentry for error tracking
Log all authentication events
Log all data modifications (audit trail)
Monitor for unusual activity patterns
Set up alerts for security events
Security Checklist Before Deployment
 All secrets are environment variables (never hardcoded)
 RLS policies are enabled on all user-data tables
 HTTPS is enforced
 CORS is properly configured
 Rate limiting is enabled
 2FA is required for admin accounts
 Email verification is required for new accounts
 Dependency audit passes (npm audit)
 ESLint security rules pass
 No console.log statements with sensitive data
 Error messages don't leak system information
 Database backups are configured
 Monitoring & alerting is active
Incident Response Plan
If a Vulnerability is Discovered in Production
Immediate: Disable affected features if necessary
Within 1 hour: Notify all affected users
Within 4 hours: Release security patch
Within 24 hours: Post-mortem analysis
Ongoing: Monitor for exploitation attempts
Dependencies
We regularly update and audit our dependencies:

Automated Scanning: Dependabot checks for updates weekly
Security Audits: GitHub Security Advisory reviews
Snyk Integration: Continuous security monitoring
Manual Reviews: Security team reviews all major updates
Compliance
Strat Planner Pro complies with:

GDPR: Data processing agreements in place
CCPA: Privacy policy updated
SOC 2: Type II certification (in progress)
Contact
Security Team: security@asilvainnovations.com
Privacy Concerns: privacy@asilvainnovations.com
General Issues: support@asilvainnovations.com
Last Updated: 2026-06-20 Next Review: 2026-09-20
