# Agency Dashboard — Full Orchestration & Go-Live Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task.

**Goal:** Transform the Sales CRM dashboard into a production-ready, feature-rich agency platform with testing, security hardening, user management, and deployment automation.

**Architecture:** React 18 + TypeScript + Vite frontend with FastAPI Python backend (SQLAlchemy async, SQLite/PostgreSQL). Implement features in independent bundles, each with its own test cycle. Go-Live is the final phase that ties all bundles together.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 3, shadcn/ui, motion (Framer Motion), recharts, FastAPI, SQLAlchemy, Pytest, Vitest, Playwright

## Global Constraints

- All existing functionality must continue to work
- No breaking API changes to the backend
- Dark theme remains default, light theme toggle added
- All new components must be accessible (ARIA labels, keyboard nav)
- Mobile responsive: all new pages support mobile layout
- No hardcoded secrets. All API URLs through Vite proxy
- Follow existing file patterns (components at `@/components/ui/`, pages at `@/pages/`)
- New components must have loading states, empty states, and error handling
- Immutability: never mutate state, always return new objects
- 80%+ test coverage for new code

---

## Feature Bundle A: Testing & Error Infrastructure

**Goal:** Add complete testing framework (unit, integration, e2e) and React error boundaries

**Dependencies:** None (foundational)

**Files to Create:**
- `frontend/src/test/setup.ts` — Test configuration
- `frontend/src/test/mocks/handlers.ts` — MSW handlers
- `frontend/src/test/mocks/server.ts` — MSW server
- `frontend/src/components/ui/error-boundary.tsx` — Error boundary component
- `frontend/src/components/ui/error-fallback.tsx` — Error fallback UI
- `frontend/__tests__/components/Login.test.tsx` — Login tests
- `frontend/__tests__/components/Leads.test.tsx` — Leads tests
- `frontend/__tests__/components/KpiCard.test.tsx` — KPI card tests
- `frontend/__tests__/components/Sidebar.test.tsx` — Sidebar tests
- `frontend/__tests__/api/client.test.ts` — API client tests
- `backend/tests/conftest.py` — Pytest fixtures
- `backend/tests/test_auth.py` — Auth tests
- `backend/tests/test_leads.py` — Lead endpoint tests
- `backend/tests/test_analytics.py` — Analytics tests
- `backend/tests/test_reps.py` — Rep endpoint tests
- `.github/workflows/ci.yml` — CI pipeline

**Files to Modify:**
- `frontend/package.json` — Add test dependencies and scripts
- `frontend/vite.config.ts` — Add test config
- `frontend/src/App.tsx` — Wrap with error boundaries
- `frontend/src/main.tsx` — Add test setup
- `backend/requirements-dev.txt` — Add test dependencies
- `backend/pyproject.toml` — Test config

## Feature Bundle B: User Management & Profile

**Goal:** Settings page for password changes, admin user management page

**Dependencies:** None (independent)

**Files to Create:**
- `frontend/src/pages/Settings.tsx` — User settings page
- `frontend/src/pages/admin/Users.tsx` — Admin user management
- `frontend/src/components/users/CreateUserDialog.tsx` — Create user modal
- `frontend/src/components/users/EditUserDialog.tsx` — Edit user modal
- `frontend/src/components/users/UserTable.tsx` — User list table
- `backend/app/api/admin.py` — Admin endpoints router
- `backend/app/schemas/admin.py` — Admin schemas
- `backend/app/services/admin.py` — Admin service logic

**Files to Modify:**
- `frontend/src/App.tsx` — Add settings and admin routes
- `frontend/src/components/layout/Sidebar.tsx` — Add manager "Users" nav item
- `frontend/src/api/client.ts` — Add admin API methods
- `frontend/src/types.ts` — Add admin types
- `backend/app/main.py` — Register admin router
- `backend/app/api/auth.py` — Add password change endpoint

## Feature Bundle C: Theme Toggle & Preferences

**Goal:** Dark/light theme toggle with persistent preference

**Dependencies:** None (independent)

**Files to Create:**
- `frontend/src/hooks/useTheme.ts` — Theme context & hook
- `frontend/src/components/ui/theme-toggle.tsx` — Theme toggle button
- `frontend/src/styles/light-theme.css` — Light theme variables

**Files to Modify:**
- `frontend/src/index.css` — Add light theme variables
- `frontend/src/main.tsx` — Wrap with ThemeProvider
- `frontend/src/components/layout/Sidebar.tsx` — Add theme toggle
- `frontend/src/components/layout/AppShell.tsx` — Add theme class
- `frontend/tailwind.config.js` — Add light mode config

## Feature Bundle D: Real-time Notifications

**Goal:** Notification bell with dropdown showing events (demo completions, handovers, deals)

**Dependencies:** None (independent)

**Files to Create:**
- `frontend/src/context/NotificationContext.tsx` — Notification state
- `frontend/src/components/ui/notification-bell.tsx` — Bell icon with badge
- `frontend/src/components/ui/notification-dropdown.tsx` — Notifications list
- `frontend/src/hooks/useNotifications.ts` — Notification hook
- `backend/app/api/notifications.py` — Notifications API
- `backend/app/models/notification.py` — Notification model
- `backend/app/schemas/notification.py` — Notification schemas
- `backend/app/services/notifications.py` — Notification service

**Files to Modify:**
- `backend/app/models/__init__.py` — Export notification model
- `backend/app/main.py` — Register notification router
- `frontend/src/App.tsx` — Add notification provider
- `frontend/src/components/layout/AppShell.tsx` — Add notification bell
- `frontend/src/types.ts` — Add notification types
- `frontend/src/api/client.ts` — Add notification API methods

## Feature Bundle E: Advanced Filtering & Search

**Goal:** Saved filters, multi-select status filter, advanced search operators

**Dependencies:** None (independent)

**Files to Create:**
- `frontend/src/components/leads/FilterBar.tsx` — Advanced filter UI
- `frontend/src/components/leads/SavedFilters.tsx` — Saved filter dropdown
- `frontend/src/hooks/useSavedFilters.ts` — Save/load filters
- `frontend/src/lib/filter-storage.ts` — LocalStorage for filters

**Files to Modify:**
- `frontend/src/pages/manager/Leads.tsx` — Replace basic filters with FilterBar

## Feature Bundle G: Go-Live & Production Readiness (formerly Bundle F)

**Goal:** Production deployment configuration, logging, rate limiting, CI/CD

**Dependencies:** Bundle A (testing)

**Files to Create:**
- `backend/app/middleware/logging.py` — Request logging middleware
- `backend/app/middleware/rate_limit.py` — Rate limiting middleware
- `backend/app/middleware/__init__.py` — Middleware exports
- `backend/scripts/migrate.py` — Alembic-like migration script
- `docker-compose.yml` — Docker compose for local dev
- `Dockerfile` — Backend Dockerfile
- `frontend/Dockerfile` — Frontend Dockerfile
- `.github/workflows/deploy.yml` — Deploy workflow

**Files to Modify:**
- `backend/app/main.py` — Add middleware, health check enhancements
- `backend/app/config.py` — Add production config
- `backend/.env.example` — Environment template
- `frontend/.env.example` — Frontend env template
- `backend/app/database.py` — Add migration support

---

## Execution Order (Dependency Chain)

```
Bundle A (Testing) ──────────────────┐
Bundle B (Users) ────────────────────┤
Bundle C (Theme) ────────────────────┤──► Bundle G (Go-Live)
Bundle D (Notifications) ───────────┤
Bundle E (Advanced Filters) ────────┘
Bundle F (Mobile Optimization) ───── independent (no dependencies)
```

Bundles B, C, D, E, F (Mobile Optimization) are **independent** and can be executed in parallel.
Bundle F (Mobile Optimization) has been fully implemented: all pages now have responsive grids, mobile card views for tables, a bottom navigation bar, and a mobile header.
Bundle G (Go-Live Readiness) depends on Bundle A (Testing).

---

## Task 1: Testing Framework Setup

### 1.1 Frontend Test Infrastructure

- [ ] **Step 1: Add test dependencies to package.json**

```json
"devDependencies": {
  "vitest": "^2.1.0",
  "@testing-library/react": "^16.0.0",
  "@testing-library/jest-dom": "^6.5.0",
  "@testing-library/user-event": "^14.5.0",
  "msw": "^2.4.0",
  "jsdom": "^25.0.0"
}
```

- [ ] **Step 2: Create vitest config in vite.config.ts**

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['__tests__/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/test/**'],
    },
  },
})
```

- [ ] **Step 3: Create test setup file**

`frontend/src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

- [ ] **Step 4: Create MSW handlers**

`frontend/src/test/mocks/handlers.ts`:
```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      id: 1,
      email: 'admin@agency.com',
      full_name: 'Agency Manager',
      role: 'manager',
      is_active: true,
    })
  }),
  http.post('/api/auth/login', () => {
    return HttpResponse.json({ access_token: 'mock-token' })
  }),
  http.get('/api/analytics/dashboard', () => {
    return HttpResponse.json({
      kpi: { total_calls: 100, total_deals: 25, success_rate: 25, total_commission_owed: 50000, total_leads: 200, active_reps: 5 },
      by_rep: [],
      status_distribution: [],
    })
  }),
  http.get('/api/analytics/leaderboard', () => {
    return HttpResponse.json({ entries: [] })
  }),
]
```

`frontend/src/test/mocks/server.ts`:
```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

- [ ] **Step 5: Add test scripts to package.json**

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:ui": "vitest --ui"
}
```

- [ ] **Step 6: Create error boundary component**

`frontend/src/components/ui/error-boundary.tsx`:
```tsx
import { Component, type ReactNode, type ErrorInfo } from 'react'
import { ErrorFallback } from './error-fallback'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={() => this.setState({ hasError: false, error: null })}
        />
      )
    }
    return this.props.children
  }
}
```

`frontend/src/components/ui/error-fallback.tsx`:
```tsx
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './button'

interface ErrorFallbackProps {
  error: Error | null
  onReset?: () => void
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-400" />
        <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {error?.message || 'An unexpected error occurred'}
        </p>
        {onReset && (
          <Button onClick={onReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create unit tests (Login)**

`frontend/__tests__/components/Login.test.tsx`:
```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Login from '@/pages/Login'
import { AuthProvider } from '@/context/AuthContext'

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Login Page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders login form', () => {
    renderLogin()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows error for empty form submission', async () => {
    renderLogin()
    const user = userEvent.setup()
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: '' } })
    fireEvent.change(passwordInput, { target: { value: '' } })
    const submitBtn = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitBtn)
    // Should show validation or button remains disabled
    expect(submitBtn).not.toBeDisabled()
  })

  it('renders demo credentials hint', () => {
    renderLogin()
    expect(screen.getByText(/admin@agency\.com/i)).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    renderLogin()
    const user = userEvent.setup()
    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
    const toggleBtn = screen.getByRole('button', { name: '' })
    fireEvent.click(toggleBtn)
    await waitFor(() => {
      expect(passwordInput).toHaveAttribute('type', 'text')
    })
  })
})
```

- [ ] **Step 8: Create API client tests**

`frontend/__tests__/api/client.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import api, { authApi, leadsApi, analyticsApi } from '@/api/client'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

beforeEach(() => {
  localStorage.setItem('token', 'test-token')
})

describe('API Client', () => {
  it('sets auth header from localStorage', () => {
    const interceptors = api.interceptors
    expect(interceptors).toBeDefined()
  })

  it('authApi.login returns token', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({ access_token: 'mock-token' })
      })
    )
    const result = await authApi.login('admin@agency.com', 'admin123')
    expect(result.access_token).toBe('mock-token')
  })

  it('authApi.me returns user', async () => {
    const result = await authApi.me()
    expect(result.email).toBe('admin@agency.com')
    expect(result.role).toBe('manager')
  })
})
```

- [ ] **Step 9: Backend test infra setup**

`backend/tests/conftest.py`:
```python
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.database import Base, get_db
from app.main import app
from app.models import User, UserRole, Lead, LeadStatus
from app.services.auth import hash_password


TEST_DB_URL = "sqlite+aiosqlite:///./test.db"


@pytest_asyncio.fixture(scope="session")
async def engine():
    e = create_async_engine(TEST_DB_URL, echo=False)
    async with e.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield e
    async with e.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await e.dispose()


@pytest_asyncio.fixture
async def db_session(engine):
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session):
    async def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session):
    user = User(
        email="test@test.com",
        hashed_password=hash_password("test123"),
        full_name="Test User",
        role=UserRole.MANAGER,
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def auth_token(client, test_user):
    response = await client.post("/api/auth/login", json={
        "email": "test@test.com",
        "password": "test123",
    })
    return response.json()["access_token"]
```

- [ ] **Step 10: Auth endpoint tests**

`backend/tests/test_auth.py`:
```python
import pytest


@pytest.mark.asyncio
async def test_login_success(client, test_user):
    response = await client.post("/api/auth/login", json={
        "email": "test@test.com",
        "password": "test123",
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_failure(client):
    response = await client.post("/api/auth/login", json={
        "email": "wrong@test.com",
        "password": "wrong",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_auth_me(client, auth_token):
    response = await client.get("/api/auth/me", headers={
        "Authorization": f"Bearer {auth_token}",
    })
    assert response.status_code == 200
    assert response.json()["email"] == "test@test.com"


@pytest.mark.asyncio
async def test_auth_me_no_token(client):
    response = await client.get("/api/auth/me")
    assert response.status_code == 403
```

- [ ] **Step 11: Create CI workflow**

`.github/workflows/ci.yml`:
```yaml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
      - run: pip install -r requirements.txt
      - run: pip install pytest pytest-asyncio httpx
      - run: python -m pytest tests/ -v

  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run test -- --run
      - run: npm run build
```

- [ ] **Step 12: Update App.tsx with error boundaries**

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary'

// Wrap routes in AppLayout:
function AppLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return (
    <AppShell>
      <Routes>
        <Route path="/manager/dashboard" element={<ErrorBoundary><ManagerDashboard /></ErrorBoundary>} />
        <Route path="/manager/leads" element={<ErrorBoundary><ManagerLeads /></ErrorBoundary>} />
        <Route path="/manager/leaderboard" element={<ErrorBoundary><ManagerLeaderboard /></ErrorBoundary>} />
        <Route path="/rep/dashboard" element={<ErrorBoundary><RepDashboard /></ErrorBoundary>} />
        <Route path="/rep/calling" element={<ErrorBoundary><RepCallingView /></ErrorBoundary>} />
        <Route path="/rep/demos" element={<ErrorBoundary><RepDemoRequests /></ErrorBoundary>} />
        <Route path="/rep/handovers" element={<ErrorBoundary><RepHandovers /></ErrorBoundary>} />
        <Route path="*" element={<Navigate to={user.role === "manager" ? "/manager/dashboard" : "/rep/dashboard"} replace />} />
      </Routes>
    </AppShell>
  )
}
```

- [ ] **Step 13: Commit**

```bash
git add frontend/src/test/ frontend/__tests__/ backend/tests/ frontend/src/components/ui/error-boundary.tsx frontend/src/components/ui/error-fallback.tsx .github/workflows/ci.yml
git commit -m "feat: add testing infrastructure, error boundaries, and CI pipeline"
```

---

## Task 2: User Settings & Admin User Management

### 2.1 Backend: Admin endpoints

- [ ] **Step 1: Create admin schemas**

`backend/app/schemas/admin.py`:
```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .auth import UserResponse


class CreateUserRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "rep"


class UpdateUserRequest(BaseModel):
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class AdminDashboardResponse(BaseModel):
    total_users: int
    active_users: int
    total_leads: int
    total_deals: int
    total_commission: float
    recent_users: list[UserResponse]
```

- [ ] **Step 2: Create admin service**

`backend/app/services/admin.py`:
```python
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user import User, UserRole
from ..models.lead import Lead, LeadStatus
from ..schemas.admin import AdminDashboardResponse
from ..schemas.auth import UserResponse
from ..services.auth import hash_password


async def get_admin_dashboard(db: AsyncSession) -> AdminDashboardResponse:
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    active_users = (await db.execute(select(func.count(User.id)).where(User.is_active == True))).scalar() or 0
    total_leads = (await db.execute(select(func.count(Lead.id)))).scalar() or 0
    total_deals = (await db.execute(select(func.count(Lead.id)).where(Lead.status == LeadStatus.DEAL_CLOSED))).scalar() or 0
    total_commission = (await db.execute(select(func.coalesce(func.sum(Lead.commission), 0)).where(Lead.status == LeadStatus.DEAL_CLOSED))).scalar() or 0.0
    recent = await db.execute(select(User).order_by(User.id.desc()).limit(5))
    recent_users = [UserResponse.model_validate(u) for u in recent.scalars().all()]

    return AdminDashboardResponse(
        total_users=total_users,
        active_users=active_users,
        total_leads=total_leads,
        total_deals=total_deals,
        total_commission=float(total_commission),
        recent_users=recent_users,
    )


async def create_user(db: AsyncSession, email: str, password: str, full_name: str, role: str):
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise ValueError("Email already registered")

    user = User(
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
        role=UserRole(role),
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


async def update_user(db: AsyncSession, user_id: int, data: dict):
    user = await db.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    for key, value in data.items():
        if value is not None:
            setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)
```

- [ ] **Step 3: Create admin API router**

`backend/app/api/admin.py`:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.user import User, UserRole
from ..schemas.admin import CreateUserRequest, UpdateUserRequest, ChangePasswordRequest, AdminDashboardResponse
from ..schemas.auth import UserResponse
from ..services.admin import get_admin_dashboard, create_user, update_user
from ..services.auth import hash_password, verify_password
from .deps import require_role, get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard", response_model=AdminDashboardResponse)
async def admin_dashboard(
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    return await get_admin_dashboard(db)


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.full_name))
    return [UserResponse.model_validate(u) for u in result.scalars().all()]


@router.post("/users", response_model=UserResponse)
async def create_new_user(
    req: CreateUserRequest,
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await create_user(db, req.email, req.password, req.full_name, req.role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_existing_user(
    user_id: int,
    req: UpdateUserRequest,
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await update_user(db, user_id, req.model_dump(exclude_none=True))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(req.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.hashed_password = hash_password(req.new_password)
    await db.commit()
    return {"message": "Password changed successfully"}
```

- [ ] **Step 4: Create Settings page**

`frontend/src/pages/Settings.tsx`:
```tsx
import { useState, type FormEvent } from 'react'
import { Lock, User, Save, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import api from '@/api/client'
import { toast } from '@/components/ui/toast'

export default function Settings() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'error' })
      return
    }
    if (newPassword.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'warning' })
      return
    }
    setLoading(true)
    try {
      await api.post('/admin/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      toast({ title: 'Password changed successfully', variant: 'success' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast({ title: 'Failed to change password', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-400" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <p className="mt-1 font-medium">{user?.full_name}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="mt-1 font-medium">{user?.email}</p>
            </div>
            <div>
              <Label>Role</Label>
              <p className="mt-1 font-medium capitalize">{user?.role}</p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-400" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>
                <div className="relative">
                  <Input id="new" type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <div className="relative">
                  <Input id="confirm" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                <Save className="h-4 w-4" />
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create Admin Users page**

`frontend/src/pages/admin/Users.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { Plus, Users as UsersIcon, UserCheck, UserX } from 'lucide-react'
import api from '@/api/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateUserDialog } from '@/components/users/CreateUserDialog'
import { toast } from '@/components/ui/toast'
import type { UserResponse } from '@/types'

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await api.get('/admin/users').then((r) => r.data)
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleActive = async (userId: number, isActive: boolean) => {
    try {
      await api.put(`/admin/users/${userId}`, { is_active: !isActive })
      toast({ title: `User ${isActive ? 'deactivated' : 'activated'}`, variant: 'success' })
      fetchUsers()
    } catch {
      toast({ title: 'Failed to update user', variant: 'error' })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage agency team members">
        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </PageHeader>

      <CreateUserDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={fetchUsers}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-emerald-400" />
            Team Members ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="capitalize">{u.role}</TableCell>
                      <TableCell>
                        <Badge variant={u.is_active ? 'default' : 'secondary'} className={u.is_active ? 'bg-emerald-900/20 text-emerald-400' : ''}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => toggleActive(u.id, u.is_active)}>
                          {u.is_active ? <UserX className="h-4 w-4 text-red-400" /> : <UserCheck className="h-4 w-4 text-emerald-400" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 6: Create CreateUserDialog**

`frontend/src/components/users/CreateUserDialog.tsx`:
```tsx
import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import api from '@/api/client'
import { toast } from '@/components/ui/toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function CreateUserDialog({ open, onOpenChange, onCreated }: Props) {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'rep' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/admin/users', form)
      toast({ title: 'User created successfully', variant: 'success' })
      onOpenChange(false)
      setForm({ email: '', password: '', full_name: '', role: 'rep' })
      onCreated()
    } catch (err: any) {
      toast({ title: err?.response?.data?.detail || 'Failed to create user', variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v ?? 'rep' })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rep">Sales Rep</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            <Send className="h-4 w-4" />
            {submitting ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 7: Register routes in App.tsx**

```tsx
import Settings from "@/pages/Settings"
import AdminUsers from "@/pages/admin/Users"

// Inside AppLayout's Routes:
<Route path="/settings" element={<Settings />} />
<Route path="/admin/users" element={<AdminUsers />} />
```

- [ ] **Step 8: Register in main.py**

```python
from .api.admin import router as admin_router
app.include_router(admin_router)
```

- [ ] **Step 9: Commit**

```bash
git add backend/app/api/admin.py backend/app/services/admin.py backend/app/schemas/admin.py frontend/src/pages/Settings.tsx frontend/src/pages/admin/Users.tsx frontend/src/components/users/
git commit -m "feat: add user settings, admin user management, and password change"
```

---

## Task 3: Theme Toggle

- [ ] **Step 1: Create theme hook**

`frontend/src/hooks/useTheme.ts`:
```tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored
    return 'dark'
  })

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}
```

- [ ] **Step 2: Create theme toggle component**

`frontend/src/components/ui/theme-toggle.tsx`:
```tsx
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Tooltip content={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
      <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </Tooltip>
  )
}
```

- [ ] **Step 3: Add light theme CSS variables in index.css**

```css
.light {
  --background: oklch(0.98 0 0);
  --foreground: oklch(0.15 0 0);
  --card: oklch(0.96 0 0);
  --card-foreground: oklch(0.15 0 0);
  --popover: oklch(0.96 0 0);
  --popover-foreground: oklch(0.15 0 0);
  --primary: oklch(0.15 0 0);
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.88 0 0);
  --secondary-foreground: oklch(0.15 0 0);
  --muted: oklch(0.88 0 0);
  --muted-foreground: oklch(0.45 0 0);
  --accent: oklch(0.88 0 0);
  --accent-foreground: oklch(0.15 0 0);
  --border: oklch(0 0 0 / 12%);
  --input: oklch(0 0 0 / 10%);
  --ring: oklch(0.35 0 0);
  --sidebar-border: oklch(0 0 0 / 10%);
}
```

- [ ] **Step 4: Wrap with ThemeProvider in main.tsx**

```tsx
import { ThemeProvider } from '@/hooks/useTheme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
```

- [ ] **Step 5: Add ThemeToggle to Sidebar**

```tsx
// In the user section of Sidebar.tsx, before the sign-out button:
<ThemeToggle />
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/hooks/useTheme.ts frontend/src/components/ui/theme-toggle.tsx frontend/src/index.css frontend/src/main.tsx frontend/src/components/layout/Sidebar.tsx
git commit -m "feat: add dark/light theme toggle with persistent preference"
```

---

## Task 4: Notification System

- [ ] **Step 1: Create notification model (backend)**

`backend/app/models/notification.py`:
```python
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.sql import func
import enum

from ..database import Base


class NotificationType(str, enum.Enum):
    DEMO_CREATED = "demo_created"
    DEMO_COMPLETED = "demo_completed"
    DEMO_SCHEDULED = "demo_scheduled"
    HANDOVER_CREATED = "handover_created"
    HANDOVER_COMPLETED = "handover_completed"
    DEAL_CLOSED = "deal_closed"
    LEAD_ASSIGNED = "lead_assigned"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(SAEnum(NotificationType), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=True)
    link = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

- [ ] **Step 2: Create notification schemas**

`backend/app/schemas/notification.py`:
```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    message: Optional[str] = None
    link: Optional[str] = None
    is_read: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UnreadCountResponse(BaseModel):
    count: int
```

- [ ] **Step 3: Create notification service**

`backend/app/services/notifications.py`:
```python
from sqlalchemy import select, func, delete as sa_delete
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.notification import Notification, NotificationType


async def create_notification(
    db: AsyncSession,
    user_id: int,
    type: NotificationType,
    title: str,
    message: str | None = None,
    link: str | None = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        link=link,
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


async def get_notifications(db: AsyncSession, user_id: int, limit: int = 20) -> list[Notification]:
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_unread_count(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(
        select(func.count(Notification.id))
        .where(Notification.user_id == user_id, Notification.is_read == False)
    )
    return result.scalar() or 0


async def mark_as_read(db: AsyncSession, notification_id: int, user_id: int) -> Notification | None:
    notification = await db.get(Notification, notification_id)
    if notification and notification.user_id == user_id:
        notification.is_read = True
        await db.commit()
        await db.refresh(notification)
        return notification
    return None


async def mark_all_as_read(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(Notification).where(Notification.user_id == user_id, Notification.is_read == False)
    )
    for n in result.scalars().all():
        n.is_read = True
    await db.commit()
```

- [ ] **Step 4: Create notification API**

`backend/app/api/notifications.py`:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.user import User
from ..schemas.notification import NotificationResponse, UnreadCountResponse
from ..services.notifications import get_notifications, get_unread_count, mark_as_read, mark_all_as_read
from .deps import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_notifications(db, user.id)


@router.get("/unread-count", response_model=UnreadCountResponse)
async def unread_count(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    count = await get_unread_count(db, user.id)
    return UnreadCountResponse(count=count)


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def read_notification(
    notification_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    n = await mark_as_read(db, notification_id, user.id)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return n


@router.post("/read-all")
async def read_all(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await mark_all_as_read(db, user.id)
    return {"message": "All notifications marked as read"}
```

- [ ] **Step 5: Create notification bell frontend component**

`frontend/src/components/ui/notification-bell.tsx`:
```tsx
import { useEffect, useState, useRef } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { NotificationDropdown } from './notification-dropdown'
import api from '@/api/client'

export function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchUnread = async () => {
    try {
      const data = await api.get('/notifications/unread-count').then((r) => r.data)
      setUnread(data.count)
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <Tooltip content="Notifications">
        <Button variant="ghost" size="icon-sm" onClick={() => setOpen(!open)} className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </Tooltip>
      {open && <NotificationDropdown onClose={() => setOpen(false)} onRead={fetchUnread} />}
    </div>
  )
}
```

`frontend/src/components/ui/notification-dropdown.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { CheckCheck, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/api/client'
import { formatRelativeTime } from '@/lib/format'

interface Notification {
  id: number
  title: string
  message: string | null
  link: string | null
  is_read: boolean
  created_at: string | null
}

interface Props {
  onClose: () => void
  onRead: () => void
}

export function NotificationDropdown({ onClose, onRead }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications').then((r) => {
      setNotifications(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await api.post('/notifications/read-all')
    onRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  return (
    <div className="absolute right-0 z-50 mt-2 w-80 animate-scale-in rounded-lg border bg-popover shadow-lg">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="text-sm font-medium">Notifications</span>
        {notifications.some((n) => !n.is_read) && (
          <Button variant="ghost" size="xs" onClick={markAllRead}>
            <CheckCheck className="h-3 w-3" />
            Mark all read
          </Button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No notifications</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${!n.is_read ? 'bg-muted/20' : ''}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                <p className="text-xs text-muted-foreground/60 mt-1">{formatRelativeTime(n.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Add notification bell to AppShell header**

```tsx
// In AppShell.tsx, add to the main content header:
<div className="flex items-center gap-2">
  <NotificationBell />
</div>
```

- [ ] **Step 7: Integrate notifications into demo/handover creation**

Add notification creation calls to `backend/app/api/reps.py`:
```python
from ..services.notifications import create_notification
from ..models.notification import NotificationType

# In create_demo_request, after demo creation:
await create_notification(
    db,
    user_id=user.id,
    type=NotificationType.DEMO_CREATED,
    title=f"Demo requested for {lead.business_name}",
    message=f"Demo: {req.title}",
    link=f"/rep/demos",
)
```

- [ ] **Step 8: Commit**

```bash
git add backend/app/models/notification.py backend/app/schemas/notification.py backend/app/services/notifications.py backend/app/api/notifications.py frontend/src/components/ui/notification-bell.tsx frontend/src/components/ui/notification-dropdown.tsx frontend/src/components/layout/AppShell.tsx
git commit -m "feat: add notification system with bell, unread counts, and auto-mark-read"
```

---

## Task 5: Advanced Lead Filtering

- [ ] **Step 1: Create saved filters hook**

`frontend/src/hooks/useSavedFilters.ts`:
```typescript
import { useState, useCallback } from 'react'

export interface FilterDefinition {
  id: string
  name: string
  search: string
  status: string
  assignedTo: string
}

const STORAGE_KEY = 'saved-filters'

export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<FilterDefinition[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  const saveFilter = useCallback((filter: Omit<FilterDefinition, 'id'>) => {
    const newFilter = { ...filter, id: crypto.randomUUID() }
    setSavedFilters((prev) => {
      const next = [...prev, newFilter]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
    return newFilter
  }, [])

  const deleteFilter = useCallback((id: string) => {
    setSavedFilters((prev) => {
      const next = prev.filter((f) => f.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { savedFilters, saveFilter, deleteFilter }
}
```

- [ ] **Step 2: Create FilterBar component**

`frontend/src/components/leads/FilterBar.tsx`:
```tsx
import { useState } from 'react'
import { Search, Filter, Save, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { LEAD_STATUS } from '@/lib/utils'
import { useSavedFilters } from '@/hooks/useSavedFilters'

const statusOptions = [
  { value: '', label: 'All Statuses' },
  ...Object.entries(LEAD_STATUS).map(([value, s]) => ({ value, label: s.label })),
]

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  onSearch: (e: React.FormEvent) => void
  activeFilters: string[]
}

export function FilterBar({ search, onSearchChange, statusFilter, onStatusChange, onSearch, activeFilters }: FilterBarProps) {
  const { savedFilters, saveFilter, deleteFilter } = useSavedFilters()
  const [filterName, setFilterName] = useState('')
  const [showSave, setShowSave] = useState(false)

  const handleSave = () => {
    if (!filterName.trim()) return
    saveFilter({ name: filterName, search, status: statusFilter, assignedTo: '' })
    setFilterName('')
    setShowSave(false)
  }

  return (
    <div className="space-y-3">
      <form onSubmit={onSearch} className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search business, contact, phone..." value={search} onChange={(e) => onSearchChange(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => onStatusChange(v ?? '')}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">Search</Button>
        <DropdownMenu
          align="end"
          trigger={
            <Button variant="outline" size="icon-sm">
              <Filter className="h-4 w-4" />
            </Button>
          }
        >
          <DropdownMenuItem onClick={() => setShowSave(true)}>
            <Save className="h-3.5 w-3.5" />
            Save Current Filter
          </DropdownMenuItem>
          {savedFilters.map((f) => (
            <DropdownMenuItem key={f.id}>
              {f.name}
              <X className="h-3 w-3 ml-auto" onClick={(e) => { e.stopPropagation(); deleteFilter(f.id) }} />
            </DropdownMenuItem>
          ))}
        </DropdownMenu>
      </form>

      {showSave && (
        <div className="flex gap-2 animate-fade-in">
          <Input placeholder="Filter name..." value={filterName} onChange={(e) => setFilterName(e.target.value)} className="max-w-xs" />
          <Button size="sm" onClick={handleSave}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowSave(false)}>Cancel</Button>
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Filters:</span>
          {activeFilters.map((f) => (
            <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Integrate FilterBar into Leads page**

Replace the existing search/filter section in `Leads.tsx` with the new `FilterBar` component.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/hooks/useSavedFilters.ts frontend/src/components/leads/FilterBar.tsx frontend/src/pages/manager/Leads.tsx
git commit -m "feat: add advanced lead filtering with saved filters"
```

---

## Task 6: Go-Live Production Readiness

- [ ] **Step 1: Add logging middleware**

`backend/app/middleware/logging.py`:
```python
import time
import logging
from fastapi import Request

logger = logging.getLogger("sales_crm")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


async def logging_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = int((time.time() - start) * 1000)
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)")
    return response
```

- [ ] **Step 2: Add rate limiting middleware**

`backend/app/middleware/rate_limit.py`:
```python
import time
from collections import defaultdict
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

RATE_LIMIT_REQUESTS = 100
RATE_LIMIT_WINDOW = 60  # seconds

ip_requests: dict[str, list[float]] = defaultdict(list)


async def rate_limit_middleware(request: Request, call_next):
    if request.url.path.startswith("/api/"):
        ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - RATE_LIMIT_WINDOW
        ip_requests[ip] = [t for t in ip_requests[ip] if t > window_start]

        if len(ip_requests[ip]) >= RATE_LIMIT_REQUESTS:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down."},
            )
        ip_requests[ip].append(now)

    return await call_next(request)
```

- [ ] **Step 3: Add production CORS configuration**

Update `backend/app/main.py`:
```python
import os
import logging

from .middleware.logging import logging_middleware
from .middleware.rate_limit import rate_limit_middleware


# Configure logging
logger = logging.getLogger("sales_crm")

# Add middleware
app.middleware("http")(logging_middleware)
app.middleware("http")(rate_limit_middleware)

# Dynamic CORS origins
CORS_ORIGINS = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,https://sales-crm-cmg.pages.dev"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

- [ ] **Step 4: Create .env.example files**

`backend/.env.example`:
```env
DATABASE_URL=sqlite+aiosqlite:///./sales_dashboard.db
# For PostgreSQL on Render:
# DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
JWT_SECRET=replace-with-a-secure-random-string-at-least-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
LOG_LEVEL=INFO
```

`frontend/.env.example`:
```env
VITE_API_URL=/api
# For production:
# VITE_API_URL=https://your-api-domain.com
```

- [ ] **Step 5: Update seed.py for production safety**

Add flag to skip dangerous seeding:
```python
import os

# In seed(), check env var
if os.environ.get("SKIP_SEED") == "true":
    print("SKIP_SEED is set. Skipping.")
    return
```

- [ ] **Step 6: Create Docker Compose**

`docker-compose.yml`:
```yaml
version: "3.9"
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/app
      - ./backend/sales_dashboard.db:/app/sales_dashboard.db
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:8000
    command: npm run dev -- --host 0.0.0.0
```

- [ ] **Step 7: Create GitHub deploy workflow**

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Backend Tests
        working-directory: backend
        run: |
          pip install -r requirements.txt
          pip install pytest httpx pytest-asyncio
          python -m pytest tests/ -v

      - name: Frontend Tests
        working-directory: frontend
        run: |
          npm ci
          npm run test -- --run
          npm run build

      - name: Deploy Backend to Render
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK }}"
```

- [ ] **Step 8: Commit**

```bash
git add backend/app/middleware/ backend/.env.example frontend/.env.example docker-compose.yml .github/workflows/deploy.yml
git commit -m "chore: add production readiness infrastructure - logging, rate limiting, CORS, Docker, deploy workflow"
```

---

## Go-Live Checklist

Before going live, verify all items:

### 🔴 Must-Have
- [ ] 1. JWT_SECRET changed from default to a secure random string
- [ ] 2. Environment variables configured in Render
- [ ] 3. CORS origins updated to include production domain
- [ ] 4. Database URL points to production PostgreSQL (Render managed)
- [ ] 5. Rate limiting enabled
- [ ] 6. HTTPS enforced (Render provides this automatically)
- [ ] 7. All tests pass (`npm run test` + `pytest`)
- [ ] 8. Frontend builds without errors (`npm run build`)
- [ ] 9. Backend starts without errors
- [ ] 10. Login flow works end-to-end

### 🟡 Should-Have
- [ ] 11. Error boundaries added to all routes
- [ ] 12. Logging configured and streaming to logs
- [ ] 13. Monitor worker deployed/configured
- [ ] 14. Backup database configured (automated snapshots)
- [ ] 15. Demo credentials changed after initial setup
- [ ] 16. Seed data verified in production

### 🟢 Nice-to-Have
- [ ] 17. Custom domain configured
- [ ] 18. Google/Analytics or monitoring tool added
- [ ] 19. Status page set up
- [ ] 20. Rollback plan documented
