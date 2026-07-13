# Code Review Report — Sales Dashboard CRM

**Date:** 2026-07-13
**Reviewer:** Automated orchestration agent
**Files Analyzed:** 45+ source files across frontend and backend

---

## Severity Legend
- 🔴 **Critical** — Bug, security risk, or data loss risk
- 🟡 **Warning** — Maintainability, performance, or anti-pattern
- 🔵 **Info** — Suggestion, style, or minor improvement

---

## 🔴 Critical Issues

### CRIT-1: No Error Boundaries in React App
**File:** `frontend/src/App.tsx` (lines 14-27, 29-58)
**Issue:** The entire application lacks React error boundaries. If any component throws during render, the whole app crashes with a white screen. The `ProtectedRoute` component only handles auth loading, not render errors.
**Impact:** Any runtime error in a page or component causes total app failure with no recovery path.
**Fix:** Wrap each `<Route>` element with `<ErrorBoundary>` component.

### CRIT-2: Hardcoded JWT Secret in Config
**File:** `backend/app/config.py` (line 9)
**Issue:** Default JWT secret is `"change-this-to-a-long-random-secret-key"`. If this isn't overridden in production, tokens can be forged.
**Impact:** Any attacker who knows this default can create valid JWT tokens and impersonate any user.
**Fix:** Validate at startup that `JWT_SECRET` has been changed from default.

### CRIT-3: No Input Validation for Lead Status Transitions
**File:** `backend/app/api/leads.py` (lines 71-109)
**Issue:** The `StatusUpdateRequest` accepts any status string without validating it's a proper `LeadStatus` enum value. Invalid statuses will cause a 500 error.
**Impact:** Potential data corruption or server crashes from malformed requests.
**Fix:** Add Pydantic validation to ensure status is a valid `LeadStatus`.

### CRIT-4: SQL Injection Possible via Search Parameter
**File:** `backend/app/services/leads.py` (search parameter handling)
**Issue:** Search uses `LIKE` with user input. While SQLAlchemy provides parameterized queries, ensure no raw SQL concatenation happens.
**Verification needed:** Confirm all queries use parameterized bindings, not f-strings.

---

## 🟡 Warning-Level Issues

### WARN-1: No Loading State for Demo Create Dialog
**File:** `frontend/src/pages/rep/DemoRequests.tsx` (line 72-80)
**Issue:** The `openCreate` function doesn't show a loading state while fetching leads. User clicks the button and sees nothing until data arrives.
**Impact:** Poor UX — user may click multiple times thinking nothing happened.

### WARN-2: Missing Type Safety in API Responses
**File:** `frontend/src/api/client.ts` (lines throughout)
**Issue:** All `.then(r => r.data)` calls lose TypeScript typing. Response types are not enforced.
**Impact:** Runtime errors from mismatched types that could be caught at compile time.
**Fix:** Type the axios response: `api.get<ResponseType>(...)`.

### WARN-3: Unhandled API Errors in Multiple Pages
**Files:**
- `frontend/src/pages/rep/Dashboard.tsx` (line 35-38) — No `.catch()` on dashboard API call
- `frontend/src/pages/manager/Dashboard.tsx` (line 67-75) — Only `.catch(() => {})` on pipeline overview
- `frontend/src/pages/rep/CallingView.tsx` (line 100-110) — `.catch(() => {})` on call logs
**Impact:** Silent failures — user won't know when API calls fail.

### WARN-4: Auth Token Stored in Plain localStorage
**File:** `frontend/src/context/AuthContext.tsx` (lines 31, 38)
**Issue:** JWT tokens stored in `localStorage` without httpOnly protection. Vulnerable to XSS attacks.
**Impact:** Any XSS vulnerability can steal auth tokens.
**Mitigation:** While httpOnly cookies would be ideal (requires backend changes), at minimum ensure CSP headers prevent script injection.

### WARN-5: No Request Timeout on API Client
**File:** `frontend/src/api/client.ts` (lines 5-8)
**Issue:** Axios instance created without timeout configuration. Slow API calls hang indefinitely.
**Impact:** User sees infinite loading spinner if backend hangs.
**Fix:** Add `timeout: 15000` to axios config.

### WARN-6: Database Schema Reset on Every Startup
**File:** `backend/app/database.py` (lines 23-26)
**Issue:** `Base.metadata.create_all` only creates tables if they don't exist. However, `init_db` doesn't import all models consistently. Currently only imports `User, Lead, CallLog` — missing `DemoRequest`, `Handover`, `Notification`.
**Impact:** New tables won't be created automatically if models added to `__init__.py` but not imported in `init_db`.

### WARN-7: Hardcoded Commission Rate
**File:** `backend/app/services/leads.py` (line 88 — `round(float(deal_val) * 0.20, 2)`)
**Issue:** 20% commission rate is hardcoded. Should be configurable.
**Fix:** Move to config/settings.

### WARN-8: No Cache Headers on API Responses
**File:** `backend/app/main.py`
**Issue:** No caching strategy. Dashboard data (which changes infrequently) gets fetched on every page load.

### WARN-9: Mock Data Mixed with Real Data
**File:** `frontend/src/pages/manager/Dashboard.tsx` (lines 49-57)
**Issue:** `mockTrendData` is static mock data used alongside real API data. This is misleading.
**Impact:** Charts show data that doesn't reflect reality.

### WARN-10: Large Component File Sizes
**Files:**
- `frontend/src/pages/manager/Leads.tsx` — 548 lines (too large)
- `frontend/src/pages/manager/Dashboard.tsx` — 370 lines
- `frontend/src/pages/manager/Leaderboard.tsx` — 383 lines
**Impact:** Hard to maintain and test.

---

## 🔵 Info-Level Issues

### INFO-1: Inline Arrow Functions in JSX Props
**Files:** Multiple components use inline arrow functions as event handlers, causing unnecessary re-renders.

### INFO-2: Missing ARIA Labels on Icon Buttons
**Files:** Several icon buttons lack `aria-label` attributes for accessibility.

### INFO-3: No `alt` Text on Avatar Image
**File:** `frontend/src/components/ui/avatar.tsx` (line 335)

### INFO-4: Console Log Left in Code
**File:** Various — check for stray `console.log` statements.

### INFO-5: Inconsistent Import Style
**Issue:** Mix of `@/` path aliases and relative imports in some files.

### INFO-6: No Prettier/ESLint Configuration
**Issue:** No code formatting standards enforced.

---

## Summary

| Severity | Count | Action Required |
|----------|-------|-----------------|
| 🔴 Critical | 4 | Fix before production |
| 🟡 Warning | 10 | Fix within first sprint |
| 🔵 Info | 6 | Address when convenient |

**Top 3 Priorities:**
1. Add error boundaries to all routes (CRIT-1)
2. Change JWT secret and add startup validation (CRIT-2)
3. Add request timeout to API client (WARN-5)
