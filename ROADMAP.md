# Roadmap

## Near-term (would come next)
- Frontend UI for RBAC/invitations, GitHub import, and AI productivity features (backend is built; UI mostly isn't yet)
- Integration test suite against a real database
- Full user-journey E2E tests with seeded data

## Mid-term
- PR-level diff-only AI review (currently full-file review only)
- Diagram types beyond architecture flowcharts (sequence, class, ER)
- Per-endpoint rate limiting tuning, especially for AI-calling routes
- Object storage (S3/Supabase) instead of local disk for uploads

## Long-term / exploratory
- Self-hosted/local LLM provider option (architecture already supports swapping `AIProvider`)
- Multi-language AST-based parsing (tree-sitter) instead of regex extraction
- Real-time collaborative review (WebSocket-based live findings updates)
