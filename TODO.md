# Agency Dashboard — Complete TODO List

**Last Updated:** 2026-07-13
**Total Items:** 36 (6 Critical 🔴, 12 High 🟡, 10 Medium 🟢, 8 Low 🔵)

## How to Use
- ✅ = Complete
- 🔴 = In progress
- ⬜ = Not started

---

## 🔴 CRITICAL (Must Do Before Go-Live)

### Go-Live Safety
- [ ] ⬜ **1. Change JWT Secret** — `backend/app/config.py` — Replace default `"change-this-to-a-long-random-secret-key"` with secure env var. Add startup validation.
- [ ] ⬜ **2. Add Error Boundaries** — `frontend/src/App.tsx` — Wrap all routes with `<ErrorBoundary>` to prevent total app crashes.
- [ ] ⬜ **3. Add Rate Limiting** — `backend/app/middleware/rate_limit.py` — Protect all API endpoints, especially auth.
- [ ] ⬜ **4. Configure Production CORS** — `backend/app/main.py` — Dynamic CORS origins from environment variable.
- [ ] ⬜ **5. Add API Request Timeout** — `frontend/src/api/client.ts` — Add `timeout: 15000` to axios config.
- [ ] ⬜ **6. Add Password Strength Validation** — `backend/app/api/auth.py` — Minimum 8 chars, require uppercase.

---

## 🟡 HIGH (First Sprint After Go-Live)

### Testing
- [ ] ⬜ **7. Setup Frontend Test Infrastructure** — Vitest + Testing Library + MSW
- [ ] ⬜ **8. Setup Backend Test Infrastructure** — Pytest + pytest-asyncio + httpx
- [ ] ⬜ **9. Write Auth Tests** — Login, token refresh, unauthorized access
- [ ] ⬜ **10. Write Lead CRUD Tests** — List, create, update, delete, bulk operations
- [ ] ⬜ **11. Write Analytics Tests** — Dashboard, leaderboard, pipeline

### User Management
- [ ] ⬜ **12. Settings Page** — Password change, profile view
- [ ] ⬜ **13. Admin Users Page** — Create/edit/deactivate team members

### Security Hardening
- [ ] ⬜ **14. Add Logging Middleware** — Request logging with duration
- [ ] ⬜ **15. Add Security Headers** — CSP, X-Frame-Options, HSTS
- [ ] ⬜ **16. Add File Upload Limits** — Max 10MB for CSV/Excel uploads
- [ ] ⬜ **17. Validate Lead Status Input** — Pydantic validator in `StatusUpdateRequest`

### UX Improvements
- [ ] ⬜ **18. Theme Toggle** — Dark/light mode with localStorage persistence
- [ ] ⬜ **19. Notification System** — Bell icon with badge, dropdown list
- [ ] ⬜ **20. Fix Loading States** — Demo create dialog needs loading indicator

---

## 🟢 MEDIUM (Second Sprint)

### Features
- [ ] ⬜ **21. Advanced Lead Filtering** — Saved filters, multi-status, FilterBar component
- [ ] ⬜ **22. Pipeline Drag & Drop** — Kanban board for pipeline stages
- [ ] ⬜ **23. Activity Audit Log** — Track all user actions in a searchable log
- [ ] ⬜ **24. Export to PDF** — Generate proposal PDFs for leads
- [ ] ⬜ **25. Calendar View for Demos** — Monthly/weekly calendar of scheduled demos

### Infrastructure
- [ ] ⬜ **26. Docker Compose** — Containerized local development
- [ ] ⬜ **27. CI/CD Pipeline** — GitHub Actions for test + deploy
- [ ] ⬜ **28. Database Migration Script** — Proper migration system (not `create_all`)

### Code Quality
- [ ] ⬜ **29. Split Large Components** — Refactor Ledas.tsx (548 lines), Leaderboard.tsx (383 lines)
- [ ] ⬜ **30. Add TypeScript Strictness** — Type all API responses
- [ ] ⬜ **31. Add ESLint + Prettier** — Code formatting standards

---

## 🔵 LOW (Backlog)

### Nice-to-Haves
- [ ] ⬜ **32. Keyboard Shortcuts** — `g d` for dashboard, `g l` for leads, etc.
- [ ] ⬜ **33. Task/To-Do System** — Lightweight task management for reps
- [ ] ⬜ **34. SMS Integration** — Send SMS to leads directly from UI
- [ ] ⬜ **35. Bulk Email Campaigns** — Email multiple leads at once
- [ ] ⬜ **36. WebSocket Live Updates** — Real-time notifications without polling

### Maintenance
- [ ] ⬜ **37. Remove Hardcoded Commission Rate** — Move 20% to settings
- [ ] ⬜ **38. Remove Mock Data** — Replace `mockTrendData` with real API data
- [ ] ⬜ **39. Add ARIA Labels** — Accessibility pass on icon buttons

---

## Progress Tracking

| Priority | Total | Not Started | In Progress | Complete |
|----------|-------|-------------|-------------|----------|
| 🔴 Critical | 6 | 6 | 0 | 0 |
| 🟡 High | 12 | 12 | 0 | 0 |
| 🟢 Medium | 11 | 11 | 0 | 0 |
| 🔵 Low | 10 | 10 | 0 | 0 |
| **TOTAL** | **39** | **39** | **0** | **0** |

---

## Plan Files Created

| File | Description |
|------|-------------|
| `docs/superpowers/plans/2026-07-13-full-orchestration-go-live.md` | Full implementation plan with 6 feature bundles |
| `docs/superpowers/code-review-2026-07-13.md` | Code review with 20 findings (4 critical, 10 warnings, 6 info) |
| `docs/superpowers/security-review-2026-07-13.md` | Security audit with 20 findings (4 critical, 6 high, 6 medium, 4 low) |
| `TODO.md` | This file — complete project TODO list |

---

## Quick Start — What to Work On Next

### If you're implementing features:
1. Start with **Bundle A** (Testing & Error Boundaries) — foundational for all other work
2. Then **Bundle B** (User Management) and **Bundle C** (Theme Toggle) in parallel
3. Then **Bundle D** (Notifications) and **Bundle E** (Advanced Filters) in parallel
4. Then **Bundle F** (Mobile Optimization) — done, responsive across all pages
5. Finish with **Bundle G** (Go-Live Readiness)

### If you're reviewing:
1. Run through the 4 🔴 Critical code review issues
2. Address the 4 🔴 Critical security findings
3. Verify all ✅ Go-Live checklist items in the full plan
