# Security Policy

## Reporting a Vulnerability

If you find a security vulnerability in Codentra, please do not open a public issue. Instead, report it privately via GitHub's private vulnerability reporting (Security tab → Report a vulnerability) so it can be assessed and patched before public disclosure.

## Current Security Posture (honest as of this writing)

Implemented:
- Session-based auth (Auth.js + server-side session validation, not JWT-only — supports revocation)
- RBAC with a documented permission matrix
- Input validation on every API boundary (`class-validator`, `whitelist: true`)
- File upload validation: extension allowlist, size limits, filename sanitization against path traversal
- GitHub webhook HMAC-SHA256 signature verification with timing-safe comparison
- Rate limiting (basic, single global tier)
- Security headers via Helmet, including a Content Security Policy
- Secrets loaded from environment variables, never committed

Not yet implemented (known gaps, tracked honestly rather than hidden):
- No automated dependency vulnerability scanning beyond `pnpm audit` in CI (which currently warns, not blocks)
- No formal penetration test or third-party security audit
- No token rotation policy for GitHub OAuth tokens
- Rate limiting is a single global tier, not per-endpoint tuned (e.g. AI endpoints should likely be stricter)
- No Web Application Firewall / DDoS protection layer (would typically come from the hosting platform, e.g. Cloudflare, not yet configured)

## Supported Versions

Pre-1.0 — no formal version support policy yet. Security fixes go to `main`.
