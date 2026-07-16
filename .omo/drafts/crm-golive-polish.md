---
slug: crm-golive-polish
status: awaiting-approval
intent: clear
review_required: false
pending-action: user approval to start implementation
approach: 4 parallel tracks (username login backend+frontend, CORS fix, real activity feed, SMTP creds) + password DB update + deploy + QA
---

# Draft: crm-golive-polish

## Components (topology ledger)
| id | outcome | status | evidence |
| --- | --- | --- | --- |
| auth | Login accepts name or email | active | backend app/services/auth.py:48-52 |
| frontend-auth | Login form uses "Name or Email" | active | frontend/src/pages/Login.tsx:19,77,82 |
| cors | Notifications endpoint has CORS headers | active | backend/.env:5, backend/app/main.py:34-40 |
| activity | Manager dashboard shows real call activity | active | frontend/src/pages/manager/Dashboard.tsx:97-117 |
| smtp | Email sequences can send real emails | active | backend/app/services/email_sender.py:1-41 |
| passwords | Each rep has unique custom password | active | backend/app/seed.py:13-18 |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
| --- | --- | --- | --- |
| Auto-generated passwords | Ashba742!, Jupiter83@, Agnas651# | User said "auto-generate"; meets 8+ char / uppercase / lowercase / digit requirements in auth.py:14-28 | Yes — user can change |
| Email still works as login fallback | Keep email valid | Backward compat; no DB migration needed | Yes — can remove later |
| Admin password unchanged | admin keeps admin123 | User didn't ask to change admin | Yes |
| SMTP credentials | Placeholder until user provides | User hasn't specified SMTP provider | Yes — needs user input |

## Findings (cited - path:lines)
- `backend/app/schemas/auth.py:11-13` — LoginRequest has `email: str` field
- `backend/app/services/auth.py:48-52` — authenticate_user queries `User.email == email` only
- `backend/app/api/auth.py:41-48` — login endpoint passes `req.email` to authenticate_user
- `frontend/src/pages/Login.tsx:19,77,82,85` — email state, "Email" label, type=email, placeholder
- `frontend/src/api/client.ts:33-34` — authApi.login sends {email, password}
- `frontend/src/context/AuthContext.tsx:8,30-31` — login function signature + call
- `frontend/src/pages/manager/Dashboard.tsx:97-117` — mock recent activity built from rep data
- `backend/app/services/analytics.py:192-208` — rep dashboard already has real recent_activity pattern to mirror
- `backend/app/services/email_sender.py:15-20` — reads settings.smtp_* and returns "SMTP not configured" if empty
- `backend/app/config.py:17-20` — smtp_host/port/user/password settings with empty defaults
- `backend/.env:5` — CORS_ORIGINS includes sales-crm-cmg.pages.dev locally
- PythonAnywhere deployed `.env` may not match — need to verify/update
- `.github/workflows/deploy.yml` — CI/CD only deploys frontend; backend is manual

## Decisions (with rationale)
1. **Keep email as fallback in LoginRequest** — use Pydantic Field alias so `{"email": "x"}` and `{"username": "x"}` both work. Avoids breaking existing API consumers.
2. **Query OR email/full_name case-insensitive** — use `func.lower(User.email) == value.lower() OR func.lower(User.full_name) == value.lower()`. Unique constraint on email stays intact.
3. **New endpoint /api/analytics/recent-activity** instead of adding to DashboardResponse — cleaner separation, doesn't change existing dashboard contract.
4. **Password update via DB directly** — no admin password-management UI in this scope. Download SQLite, update hashes, re-upload.
5. **SMTP is user-dependent** — user needs to provide SMTP credentials. Plan includes placeholder + documentation.

## Scope IN
- Username (name OR email) login
- 3 custom rep passwords (auto-generated)
- CORS fix on PythonAnywhere .env
- Real recent activity for manager dashboard
- SMTP env var configuration on PythonAnywhere

## Scope OUT (Must NOT have)
- DB schema migration (no username column)
- Password reset UI
- Third-party email service
- JWT token changes
- Rep dashboard changes (already works)

## Open questions
- SMTP credentials: user needs to provide host/port/user/password (or choose a provider like Gmail, SendGrid)

## Approval gate
status: awaiting-approval
<!-- Plan is complete. Waiting for user's explicit okay to authorize implementation. -->
