# crm-golive-polish - Work Plan

## TL;DR (For humans)

**What you'll get:** Reps log in with their name (e.g. "Ashba") instead of an email, each with a unique auto-generated password. The notification bell shows real unread counts, the manager dashboard shows real recent call activity instead of fake mock data, and email sequences can send real emails via SMTP.

**Why this approach:** Backend stays backward-compatible (login accepts both email and name in the same field) so nothing breaks. The activity feed already has a rep-version pulling real call logs — we mirror that pattern for the manager view. SMTP is already wired in the code; it just needs credentials in the deployed env file.

**What it will NOT do:** It will NOT change the database schema, NOT add username migration, NOT remove email-based login (email still works as fallback), NOT build a password-reset UI, and NOT set up a third-party email service.

**Effort:** Short
**Risk:** Low — small surface area, backward-compatible changes, no schema migrations.
**Decisions to sanity-check:** Auto-generated passwords (see below), keeping email as a valid login fallback, CORS fix approach.

Your next move: approve to start implementation. Full execution detail follows below.

---

> TL;DR (machine): Short, Low risk — 4 tracks: username login (backend+frontend), custom passwords (DB update), CORS fix (.env on PA), real activity feed (backend endpoint+frontend wiring), SMTP creds.

## Scope
### Must have
1. Login accepts either a rep's name (e.g. "Ashba") or their email (e.g. "ashba@agency.com") — backward compatible.
2. Each rep gets a unique auto-generated password (see Decisions below).
3. Notification bell CORS error fixed — unread-count endpoint returns proper CORS headers.
4. Manager dashboard "Recent Activity" shows real call-log data from the API instead of mock/fake entries.
5. Email sequences can send real emails — SMTP credentials configured in the PythonAnywhere `.env`.

### Must NOT have (guardrails, anti-slop, scope boundaries)
- NO database schema migration (no new column `username`, no losing `email` uniqueness).
- NO removal of email-based login — email must still work as a fallback.
- NO password-reset UI or self-service password flow.
- NO third-party email service (SendGrid, Postmark, etc.) — use the existing `smtplib` path.
- NO changes to the JWT token structure or auth middleware (`get_current_user`).
- NO new npm dependencies.
- NO changes to the rep dashboard (it already has real activity).

## Verification strategy
> Zero human intervention — all verification is agent-executed.
- Test decision: tests-after (backend pytest) + manual browser QA (Playwright)
- Evidence: attempts logged to `.omo/evidence/` directory

## Execution strategy
### Parallel execution waves

**Wave 1 (parallel — 4 independent tracks):**
- Task 1: Backend auth changes (username login)
- Task 3: CORS fix on PythonAnywhere `.env`
- Task 4: Backend recent-activity endpoint
- Task 5: SMTP credentials setup on PythonAnywhere `.env`

**Wave 2 (after Task 1 completes):**
- Task 2: Frontend auth changes (username login form)

**Wave 3 (after Task 4 completes):**
- Task 6: Frontend activity feed wiring

**Wave 4 (after Tasks 1+2 complete):**
- Task 7: Update passwords in production DB

**Wave 5 (after all above):**
- Task 8: Redeploy backend to PythonAnywhere + frontend CI/CD trigger
- Task 9: Browser QA verification

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Backend auth (username) | — | 2, 7 | 3, 4, 5 |
| 2. Frontend auth (username) | 1 | 8 | 6 (if 1 done), 7 |
| 3. CORS fix on PA `.env` | — | 9 | 1, 4, 5 |
| 4. Backend activity endpoint | — | 6 | 1, 3, 5 |
| 5. SMTP creds on PA `.env` | — | 9 | 1, 3, 4 |
| 6. Frontend activity wiring | 4 | 8 | 2 (if 4 done), 7 |
| 7. Password update in DB | 1 | 9 | 6 (if 1 done) |
| 8. Deploy + push | 1,2,3,4,5,6,7 | 9 | — |
| 9. Browser QA | 8 | — | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

- [x] 1. Backend: Login accepts name or email
  What to do: Modify the login endpoint to accept a `username` field that matches either the user's `email` column OR `full_name` column (case-insensitive). Update the Pydantic schema, the service function, and the API endpoint. Keep backward compatibility — if the old `email` field is sent, still works.
  Must NOT do: Do NOT add a `username` column to the DB. Do NOT remove the `email` field from `LoginRequest` — rename to `username` but accept `email` as an alias. Do NOT change JWT token structure. Do NOT modify `register_user`.
  Parallelization: Wave 1 | Blocked by: none | Blocks: 2, 7
  References:
    - `backend/app/schemas/auth.py:11-13` — `LoginRequest` has `email: str` field; rename to `username: str`, add `email` as Pydantic alias so old clients still work
    - `backend/app/services/auth.py:48-52` — `authenticate_user(db, email, password)` queries `User.email == email`; change to query `OR(User.email == value, User.full_name == value)` case-insensitive (`func.lower`)
    - `backend/app/api/auth.py:41-48` — `login` endpoint calls `authenticate_user(db, req.email, req.password)`; update to `req.username`
  Acceptance criteria: `POST /api/auth/login` with body `{"username": "Ashba", "password": "Ashba742!"}` returns 200 + `access_token`. Also `{"username": "ashba@agency.com", "password": "Ashba742!"}` returns 200. Invalid name returns 401.
  QA scenarios: pytest `tests/test_auth.py` add test for name-based login + fallback email login. Evidence: pytest output.
  Commit: Y | feat(auth): accept name or email for login

- [x] 2. Frontend: Login form uses "Name or Email"
  What to do: Update the login page to use a generic `username` field instead of `email`. Change label, placeholder, input type, autoComplete, and the AuthContext `login` function signature. Update `client.ts` to send `{ username, password }` instead of `{ email, password }`. Update the demo hint text. Change the `Mail` icon to a `User` icon.
  Must NOT do: Do NOT remove the email field from the `UserResponse` type. Do NOT change the register form. Do NOT change localStorage key names.
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 8
  References:
    - `frontend/src/pages/Login.tsx:19` — `email` state, line 77 `Label` says "Email", line 82 `type="email"`, line 85 `placeholder="you@agency.com"`, line 32 `login(email, password)`, line 138 demo hint text
    - `frontend/src/api/client.ts:33-34` — `authApi.login` sends `{ email, password }`; change to `{ username, password }`
    - `frontend/src/context/AuthContext.tsx:8` — `login: (email: string, password: string)`; rename param to `username`
    - `frontend/src/pages/Login.tsx:8` — import `Mail` icon; change to `User` from lucide-react
  Acceptance criteria: Login page shows "Name or Email" label, plain text input (not email type). Can log in with "Ashba" + password. Demo hint shows the new credentials.
  QA scenarios: Browser QA via Playwright — navigate to login, type "admin", type password, click Sign In, verify redirect to dashboard. Evidence: Playwright snapshot.
  Commit: Y | feat(frontend): login by name or email

- [x] 3. Fix CORS on PythonAnywhere `.env`
  What to do: Update the `.env` file on PythonAnywhere at `/home/jeremy2562321/sales-crm/backend/.env` to include `https://sales-crm-cmg.pages.dev` in the `CORS_ORIGINS` environment variable. Download the current `.env`, verify/update the CORS line, re-upload via the PythonAnywhere Files API, then reload the webapp. Also update the local `.env` if needed.
  Must NOT do: Do NOT change the CORS middleware code in `main.py`. Do NOT add wildcard origins (`*`). Do NOT remove existing origins.
  Parallelization: Wave 1 | Blocked by: none | Blocks: 9
  References:
    - `backend/.env:5` — local `.env` has `CORS_ORIGINS=...https://sales-crm.pages.dev,https://sales-crm-cmg.pages.dev`
    - `backend/app/config.py:16` — `cors_origins` setting reads from env; `cors_origin_list` property splits by comma
    - `backend/app/main.py:34-40` — `CORSMiddleware` uses `settings.cors_origin_list`
    - PythonAnywhere `.env` path: `/home/jeremy2562321/sales-crm/backend/.env`
    - PythonAnywhere Files API: `GET/POST /api/v0/user/{user}/files/path{path}` with Token auth
    - PythonAnywhere reload: `POST /api/v0/user/{user}/webapps/{domain}/reload/` (or touch WSGI file)
  Acceptance criteria: `curl -H "Origin: https://sales-crm-cmg.pages.dev" -I https://jeremy2562321.pythonanywhere.com/api/notifications/unread-count` returns `Access-Control-Allow-Origin: https://sales-crm-cmg.pages.dev` in headers. No CORS console errors in browser.
  QA scenarios: Playwright browser — load dashboard, check console for 0 CORS errors on notifications endpoint. Evidence: console logs.
  Commit: N (infra/config change, not code)

- [x] 4. Backend: Add recent-activity endpoint for manager
  What to do: Add a `GET /api/analytics/recent-activity` endpoint that returns the last 20 call logs across all reps, joined with lead business_name and user full_name. Add the schema, service function, and API route. The response should match the frontend `Activity` interface shape: `{id, type, repName, businessName, timestamp}`.
  Must NOT do: Do NOT modify the existing `get_dashboard` function or `DashboardResponse` schema. Do NOT add it to the rep dashboard. Do NOT change the rep `/reps/dashboard` endpoint (already has `recent_activity`).
  Parallelization: Wave 1 | Blocked by: none | Blocks: 6
  References:
    - `backend/app/api/analytics.py:10-27` — router with `/dashboard` and `/leaderboard`; add new route here
    - `backend/app/services/analytics.py:152-219` — `get_rep_dashboard` already has `recent_activity` logic (lines 192-208) with CallLog join; mirror this pattern for all reps
    - `backend/app/models/call_log.py:1-18` — `CallLog` model: `id, lead_id, rep_id, status_after, created_at`
    - `frontend/src/components/dashboard/ActivityFeed.tsx:17-23` — `Activity` interface: `{id, type, repName, businessName, timestamp}`
    - `frontend/src/types.ts:72-76` — `DashboardData` interface (do NOT modify)
    - `backend/app/schemas/analytics.py:29-32` — `DashboardResponse` (do NOT modify)
  Acceptance criteria: `GET /api/analytics/recent-activity` (with manager token) returns `[{id, type, repName, businessName, timestamp}]` from real call_logs. If 0 call logs, returns `[]`.
  QA scenarios: pytest add test for endpoint with mocked call logs. Evidence: pytest output.
  Commit: Y | feat(api): add recent-activity endpoint for manager

- [x] 5. Configure SMTP credentials on PythonAnywhere `.env`
  What to do: Add SMTP settings to the PythonAnywhere `.env` file. The user needs to provide an SMTP host, port, username, and password. Until the user provides these, add placeholder values and document what's needed. The backend already has the `send_email` function wired — it just needs env vars.
  Must NOT do: Do NOT change the `email_sender.py` code. Do NOT add a new email service. Do NOT hardcode SMTP credentials in source code.
  Parallelization: Wave 1 | Blocked by: none | Blocks: 9
  References:
    - `backend/app/services/email_sender.py:1-41` — `send_email()` reads `settings.smtp_host, smtp_port, smtp_user, smtp_password`; returns "SMTP not configured" if empty
    - `backend/app/config.py:17-20` — Settings has `smtp_host, smtp_port, smtp_user, smtp_password` with empty defaults
    - `backend/.env` — local `.env` does NOT have SMTP vars; needs `SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD`
  Acceptance criteria: `.env` on PythonAnywhere has SMTP_* vars. `send_email` no longer returns "SMTP not configured".
  QA scenarios: `POST /api/email-sequences/{id}/trigger` or similar; verify email log shows "sent" not "SMTP not configured". Evidence: API response + email log.
  Commit: N (config change; requires user-provided SMTP credentials)

- [x] 6. Frontend: Wire real activity feed to API
  What to do: Remove the mock activity generation code from `Dashboard.tsx` (lines 97-117). Add a new API call to fetch real recent activity from `/api/analytics/recent-activity` and pass it to the `ActivityFeed` component. Add the API method to `client.ts` and the response type to `types.ts`. Handle loading and empty states.
  Must NOT do: Do NOT change the `ActivityFeed` component itself (it's fine as-is). Do NOT change the rep dashboard. Do NOT remove the `RepMetric` import.
  Parallelization: Wave 3 | Blocked by: 4 | Blocks: 8
  References:
    - `frontend/src/pages/manager/Dashboard.tsx:97-117` — mock activity code to remove
    - `frontend/src/pages/manager/Dashboard.tsx:216` — `<ActivityFeed activities={recentActivity} />`
    - `frontend/src/api/client.ts:97-100` — `analyticsApi` object; add `recentActivity` method
    - `frontend/src/types.ts` — add `RecentActivityItem` interface
    - `frontend/src/components/dashboard/ActivityFeed.tsx:17-23` — `Activity` interface shape to match
  Acceptance criteria: Manager dashboard "Recent Activity" shows real call data from the API. Empty state shows "No recent activity" when no calls exist.
  QA scenarios: Browser QA — fresh dashboard shows "No recent activity" (since DB was reset). After making a call via rep login, manager dashboard shows it. Evidence: Playwright snapshot.
  Commit: Y | feat(frontend): real recent activity on manager dashboard

- [ ] 7. Update rep passwords in production database
  What to do: Generate bcrypt hashes for the new passwords and update the `users` table on the PythonAnywhere SQLite database via the Files API (download db → update → upload db → reload). The auto-generated passwords are:
    - **Ashba**: `Ashba742!`
    - **Jai**: `Jupiter83@`
    - **Agnas**: `Agnas651#`
  Also update the admin password to keep it consistent? No — admin keeps `admin123` (user didn't ask to change it). Update the seed file locally too for consistency.
  Must NOT do: Do NOT change the admin password. Do NOT store plaintext passwords anywhere. Do NOT change emails.
  Parallelization: Wave 4 | Blocked by: 1 (backend must accept new login format) | Blocks: 9
  References:
    - `backend/app/services/auth.py:10-14` — `pwd_context = CryptContext(schemes=["bcrypt"])`, `hash_password()` function
    - `backend/app/seed.py:13-18` — USERS list with old passwords; update for local consistency
    - PythonAnywhere DB path: `/home/jeremy2562321/sales-crm/backend/sales_dashboard.db`
    - PythonAnywhere Files API for download/upload
  Acceptance criteria: Login with `{"username": "Ashba", "password": "Ashba742!"}` returns 200. Old password `ashba123` returns 401.
  QA scenarios: API login test for all 3 reps with new passwords. Evidence: curl/API responses.
  Commit: Y (seed.py only) | chore(seed): update rep passwords

- [ ] 8. Deploy: Push code to GitHub + update PythonAnywhere backend
  What to do: Push all backend code changes to the `main` branch on GitHub (triggers CI/CD for frontend deploy). Then manually update the backend code on PythonAnywhere (since CI/CD only deploys frontend). Upload modified backend files via PythonAnywhere Files API and reload the webapp.
  Must NOT do: Do NOT deploy the database file. Do NOT overwrite the `.env` on PythonAnywhere with the local one (they have different CORS/SMTP configs).
  Parallelization: Wave 5 | Blocked by: 1,2,3,4,5,6,7 | Blocks: 9
  References:
    - `.github/workflows/deploy.yml` — CI/CD pipeline (push to main → test → deploy frontend to Cloudflare Pages)
    - `backend/pa_wsgi.py` — WSGI entry point on PythonAnywhere
    - PythonAnywhere git pull or Files API for backend deploy
  Acceptance criteria: Frontend deployed to `sales-crm-cmg.pages.dev` via CI/CD. Backend running with new code on `jeremy2562321.pythonanywhere.com`.
  QA scenarios: `curl https://jeremy2562321.pythonanywhere.com/api/health` returns 200. GitHub Actions run passes.
  Commit: N (deployment step)

- [ ] 9. Browser QA: Verify all 4 fixes end-to-end
  What to do: Open `https://sales-crm-cmg.pages.dev` in the browser and verify:
    a. Login with "admin" + "admin123" works → manager dashboard loads
    b. Notification bell shows 0 unread (no CORS error in console)
    c. Recent Activity shows "No recent activity" (empty state, since DB was reset)
    d. Login with "Ashba" + "Ashba742!" works → rep dashboard loads
    e. Logout, login with "Jai" + "Jupiter83@" works
    f. Logout, login with "Agnas" + "Agnas651#" works
    g. Old passwords (ashba123, jai123, agnas123) return 401
  Must NOT do: Do NOT skip any step. Do NOT test with email addresses only — must test with names.
  Parallelization: Wave 5 | Blocked by: 8 | Blocks: —
  References: All previous tasks.
  Acceptance criteria: All 7 sub-checks pass. Zero CORS console errors.
  QA scenarios: Playwright browser automation — full login flow for each user. Evidence: Playwright snapshots + console logs.
  Commit: N (verification only)

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit — verify all 9 todos completed per spec
- [ ] F2. Code quality review — no dead code, no security issues, proper error handling
- [ ] F3. Real manual QA — Playwright browser test of all 4 features
- [ ] F4. Scope fidelity — nothing added beyond the 5 Must Have items

## Commit strategy
- Push all backend + frontend changes in one commit to `main`
- CI/CD auto-deploys frontend to Cloudflare Pages
- Backend deployed manually to PythonAnywhere via Files API
- Database password update is a separate step (no code push needed)

## Success criteria
1. Reps can log in with their name (e.g. "Ashba") + their unique password
2. Email login still works as fallback
3. Notification bell shows real unread count with zero CORS errors
4. Manager dashboard Recent Activity shows real call-log data (or "No recent activity" when empty)
5. Email sequences can send real emails when SMTP credentials are provided
6. Platform URL: https://sales-crm-cmg.pages.dev
