# Security Review Report — Sales Dashboard CRM

**Date:** 2026-07-13
**Review Type:** Full codebase security audit (frontend + backend)
**Severity Levels:** 🔴 Critical | 🟡 High | 🟢 Medium | 🔵 Low

---

## Executive Summary

The Sales Dashboard CRM has several security vulnerabilities that must be addressed before production deployment. The most critical issue is a hardcoded JWT secret in the default configuration, which could allow complete authentication bypass if not changed. Additional concerns include missing rate limiting, plaintext token storage, and lack of input validation on critical endpoints.

**Overall Risk Level: 🟡 HIGH** — Multiple critical and high-severity issues found.

---

## 🔴 Critical Findings

### SEC-001: Default JWT Secret in Source Code
**File:** `backend/app/config.py`, line 9
**Severity:** 🔴 Critical
**Impact:** Attacker can forge valid JWT tokens and impersonate any user.
**Code:**
```python
jwt_secret: str = "change-this-to-a-long-random-secret-key"
```
**Recommendation:**
1. Move this to environment-only (no default)
2. Add startup validation that fails loudly if default is used:
```python
if settings.jwt_secret == "change-this-to-a-long-random-secret-key":
    raise RuntimeError("CRITICAL: JWT_SECRET must be changed from default!")
```

### SEC-002: No Rate Limiting on Authentication Endpoints
**File:** `backend/app/api/auth.py`, lines 23-30
**Severity:** 🔴 Critical
**Impact:** Brute force attacks on login are trivial. No account lockout, no rate limiting.
**Recommendation:**
1. Add rate limiting to `/api/auth/login` (max 5 attempts per IP per minute)
2. Consider adding account lockout after 10 failed attempts

### SEC-003: JWT Token Stored in localStorage (XSS Vulnerable)
**File:** `frontend/src/context/AuthContext.tsx`, lines 31, 38
**Severity:** 🔴 Critical
**Impact:** Any XSS vulnerability can steal auth tokens, leading to account takeover.
**Recommendation:**
1. Switch to httpOnly cookies for token storage
2. Add Content-Security-Policy headers
3. Implement XSS protection headers

### SEC-004: No Password Strength Validation
**File:** `backend/app/api/auth.py`, lines 14-20
**Severity:** 🔴 Critical
**Impact:** Users can register with weak passwords like "123456"
**Recommendation:**
```python
# Add validation:
if len(req.password) < 8:
    raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
if not any(c.isupper() for c in req.password):
    raise HTTPException(status_code=400, detail="Password must contain uppercase letter")
```

---

## 🟡 High Findings

### SEC-005: No HTTPS Enforcement
**Severity:** 🟡 High
**Impact:** Credentials transmitted in plaintext on non-HTTPS connections.
**Note:** Render provides HTTPS by default. Ensure the frontend only connects over HTTPS.

### SEC-006: Missing CORS Restriction in Production
**File:** `backend/app/main.py`, lines 24-28
**Severity:** 🟡 High
**Impact:** Currently allows specific origins, but no wildcard. This is good, but needs to be dynamic per environment.

### SEC-007: No Input Sanitization on Notes/Description Fields
**Files:**
- `backend/app/api/leads.py` — Notes field
- `backend/app/api/reps.py` — Notes, description fields
**Severity:** 🟡 High
**Impact:** Stored XSS if these values are rendered without sanitization in the frontend.

### SEC-008: Sequential Integer IDs for Users and Leads
**Files:** All models use auto-increment `Integer` primary keys
**Severity:** 🟡 High
**Impact:** Attackers can enumerate total users/leads and iterate through IDs.
**Recommendation:** Use UUID for public-facing IDs.

### SEC-009: No CSRF Protection
**Severity:** 🟡 High
**Impact:** While JWT in localStorage offers some protection, there's no CSRF token mechanism for state-changing requests.
**Recommendation:** Add CSRF protection for session-based flows.

### SEC-010: Error Messages Leak Information
**File:** `backend/app/api/auth.py`, line 29
**Severity:** 🟡 High
**Impact:** The error message `"Invalid email or password"` is good (doesn't reveal which is wrong). However, registration error `"Email already registered"` reveals which emails exist in the system.
**Recommendation:** Use generic error messages for registration too.

---

## 🟢 Medium Findings

### SEC-011: No Request Logging
**Issue:** No audit trail of API requests for forensic analysis.
**Recommendation:** Add structured logging with request IDs.

### SEC-012: SQL Injection Risk in Search
**File:** `backend/app/services/leads.py` (search implementation)
**Issue:** Verify all queries use parameterized SQL through SQLAlchemy.

### SEC-013: No API Key Rotation Policy
**Issue:** JWT tokens last 24 hours with no refresh token mechanism.

### SEC-014: Missing Security Headers
**Issue:** No `X-Content-Type-Options`, `X-Frame-Options`, or `Strict-Transport-Security` headers.

### SEC-015: Hardcoded Demo Credentials
**File:** `backend/app/seed.py`, lines 14-18
**Issue:** Demo credentials `admin@agency.com / admin123` are hardcoded and well-known.
**Recommendation:** Force password change on first login for production.

### SEC-016: No Data at Rest Encryption
**Issue:** SQLite database file is unencrypted on disk.

---

## 🔵 Low Findings

### SEC-017: Inactive Users Not Properly Handled
**File:** `backend/app/api/deps.py`, line 27
**Issue:** Inactive users get 401, but the check could be more nuanced.

### SEC-018: No File Upload Size Limit
**File:** `backend/app/api/leads.py`, line 31-55
**Issue:** CSV upload has no size limit, could be used for DoS.

### SEC-019: No Access Log Retention Policy
**Issue:** No policy for how long logs are retained.

### SEC-020: Missing Security.txt
**Issue:** No security contact information published.

---

## Prioritized Fix Plan

### Immediate (Before Go-Live)
1. ✅ **SEC-001** — Change JWT secret from default, add validation
2. ✅ **SEC-002** — Add rate limiting middleware
3. ✅ **SEC-003** — Move to httpOnly cookies (or add CSP headers)
4. ✅ **SEC-004** — Add password strength validation
5. ✅ **SEC-005** — Verify HTTPS in production

### First Week
6. ✅ **SEC-007** — Add input sanitization for notes/descriptions
7. ✅ **SEC-009** — Add CSRF protection
8. ✅ **SEC-011** — Add request logging (already in middleware plan)
9. ✅ **SEC-014** — Add security headers
10. ✅ **SEC-018** — Add file upload size limit

### First Month
11. ✅ **SEC-008** — Migrate to UUID-based IDs
12. ✅ **SEC-013** — Implement refresh token rotation
13. ✅ **SEC-015** — Force password change on first login
14. ✅ **SEC-016** — Database encryption
