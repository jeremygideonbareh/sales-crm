# Mobile Optimization — New Bundle F Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Sales CRM dashboard into a fully mobile-optimized experience for sales reps on the go. Add bottom navigation, responsive card-based tables, mobile-first layouts across all pages.

**Architecture:** React 18 + TypeScript + Tailwind CSS responsive utilities. Build reusable mobile components (MobileBottomNav, ResponsiveTable) and incrementally apply mobile-first patterns to every page. No backend changes needed.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 3, shadcn/ui, lucide-react

**Bundle Renaming:** Current Bundle F (Go-Live Readiness) → renamed to Bundle G. This is the new Bundle F.

---

## Global Constraints

- All existing functionality must continue to work unchanged
- No breaking API changes to backend
- Dark theme remains default; mobile styles must work in both dark and light
- All new components must be accessible (ARIA labels, keyboard nav)
- Use Tailwind responsive prefixes exclusively (`sm:`, `md:`, `lg:`, `xl:`)
- Mobile breakpoint: 768px (matches `useIsMobile` hook)
- Touch targets minimum 44x44px (Apple HIG / Material Design)
- Tables must collapse to card views on mobile, not just horizontal scroll
- Bottom nav must only show on mobile (< 768px), hidden on desktop
- Immutability: never mutate state, always return new objects
- Follow existing file patterns (components at `@/components/ui/`, `@/components/layout/`)

---

## File Structure

### New Files
| File | Purpose |
|------|---------|
| `frontend/src/components/layout/MobileBottomNav.tsx` | Bottom navigation bar for mobile with 5 key nav items |
| `frontend/src/components/layout/MobileHeader.tsx` | Mobile top header with page title, hamburger, notifications |
| `frontend/src/components/ui/responsive-table.tsx` | Table that renders as card list on mobile, table on desktop |

### Modified Files
| File | Purpose |
|------|---------|
| `frontend/src/components/layout/AppShell.tsx` | Add bottom nav, mobile header, bottom padding |
| `frontend/src/components/layout/Sidebar.tsx` | Refine mobile overlay behavior |
| `frontend/src/pages/manager/Dashboard.tsx` | Mobile charts stacking, smaller KPIs |
| `frontend/src/pages/rep/Dashboard.tsx` | Mobile pipeline layout, touch targets |
| `frontend/src/pages/manager/Leads.tsx` | Mobile card view for leads, filter bar stacking |
| `frontend/src/pages/manager/Leaderboard.tsx` | Mobile leaderboard cards |
| `frontend/src/pages/rep/CallingView.tsx` | Mobile-optimized call controls |
| `frontend/src/pages/rep/DemoRequests.tsx` | Mobile demo cards |
| `frontend/src/pages/rep/Handovers.tsx` | Mobile handover cards |
| `frontend/src/pages/Settings.tsx` | Mobile settings layout |
| `frontend/src/pages/admin/Users.tsx` | Mobile user cards |
| `frontend/src/index.css` | Add mobile utility animations |
| `HANDOFF.md` | Update bundle references (F→G, add F) |
| `TODO.md` | Add mobile optimization items |

---

## Task 1: Create MobileBottomNav Component

**Files:**
- Create: `frontend/src/components/layout/MobileBottomNav.tsx`

**Interfaces:**
- Consumes: `useAuth` context for role-based nav items
- Produces: `<MobileBottomNav />` component

- [ ] **Step 1: Write the component**

```tsx
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  BarChart3,
  Calendar,
  ArrowRightLeft,
  Settings,
} from "lucide-react"

export function MobileBottomNav() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return null

  const isManager = user.role === "manager"

  const items = isManager
    ? [
        { to: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/manager/leads", label: "Leads", icon: Users },
        { to: "/manager/leaderboard", label: "Board", icon: BarChart3 },
        { to: "/admin/users", label: "Users", icon: Users },
        { to: "/settings", label: "Settings", icon: Settings },
      ]
    : [
        { to: "/rep/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/rep/calling", label: "Calling", icon: PhoneCall },
        { to: "/rep/demos", label: "Demos", icon: Calendar },
        { to: "/rep/handovers", label: "Handover", icon: ArrowRightLeft },
        { to: "/settings", label: "Settings", icon: Settings },
      ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden safe-area-bottom">
      <div className="flex items-center justify-around">
        {items.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium transition-colors",
                "min-h-[56px] min-w-[64px]", // 44px touch target minimum
                isActive
                  ? "text-emerald-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/layout/MobileBottomNav.tsx
git commit -m "feat: add mobile bottom navigation bar"
```

---

## Task 2: Create MobileHeader Component

**Files:**
- Create: `frontend/src/components/layout/MobileHeader.tsx`

**Interfaces:**
- Produces: `<MobileHeader title={...} />`

- [ ] **Step 1: Write the component**

```tsx
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/ui/notification-bell"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface MobileHeaderProps {
  title?: string
  onMenuClick: () => void
}

export function MobileHeader({ title, onMenuClick }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur-md md:hidden">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="h-9 w-9"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {title && (
          <h1 className="text-base font-semibold truncate max-w-[180px]">
            {title}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/layout/MobileHeader.tsx
git commit -m "feat: add mobile header with menu, theme, and notifications"
```

---

## Task 3: Create Mobile-Responsive Table Wrapper

**Files:**
- Create: `frontend/src/components/ui/responsive-table.tsx`

**Interfaces:**
- Produces: `<ResponsiveTable headers={...} rows={...} mobileCard={(row) => ...} />`

- [ ] **Step 1: Write the responsive table component**

```tsx
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/useMediaQuery"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export interface Column<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  className?: string
  hideOnMobile?: boolean
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  loading?: boolean
  loadingRows?: number
  emptyMessage?: string
  mobileCard?: boolean // auto-card on mobile, default true
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  loadingRows = 3,
  emptyMessage = "No data found",
  mobileCard = true,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile()

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: loadingRows }).map((_, i) => (
          <Card key={i} className={cn("overflow-hidden", isMobile ? "block" : "hidden")}>
            <CardContent className="p-4 space-y-2">
              {columns.slice(0, 3).map((col) => (
                <Skeleton key={col.key} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
        <div className={cn("rounded-lg border", isMobile ? "hidden" : "block")}>
          <table className="w-full">
            <tbody>
              {Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={i} className="border-b">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  // Mobile card view
  if (isMobile && mobileCard) {
    return (
      <div className="space-y-3">
        {data.map((item) => (
          <Card key={keyExtractor(item)} className="overflow-hidden">
            <CardContent className="divide-y divide-border/50">
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col) => (
                  <div
                    key={col.key}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="text-xs font-medium text-muted-foreground">
                      {col.header}
                    </span>
                    <span className={cn("text-right", col.className)}>
                      {col.render(item)}
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Desktop table view
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="border-b last:border-0 transition-colors hover:bg-muted/30"
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-sm", col.className)}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ui/responsive-table.tsx
git commit -m "feat: add responsive table component with mobile card view"
```

---

## Task 4: Enhance AppShell with Mobile Layout

**Files:**
- Modify: `frontend/src/components/layout/AppShell.tsx`

- [ ] **Step 1: Update AppShell to include MobileBottomNav and MobileHeader**

```tsx
import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { MobileBottomNav } from "./MobileBottomNav"
import { MobileHeader } from "./MobileHeader"
import { useIsMobile } from "@/hooks/useMediaQuery"
import { NotificationBell } from "@/components/ui/notification-bell"
import { cn } from "@/lib/utils"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={isMobile ? false : sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Desktop top bar */}
        {!isMobile && (
          <div className="flex items-center justify-end gap-2 px-4 py-2 sm:px-6 lg:px-8">
            <NotificationBell />
          </div>
        )}

        {/* Main content */}
        <main
          className={cn(
            "flex-1 overflow-auto transition-all duration-300",
            "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface via-background to-background",
            isMobile && "pb-20" // space for bottom nav
          )}
        >
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && <MobileBottomNav />}
    </div>
  )
}
```

- [ ] **Step 2: Update Sidebar to accept mobileOpen props**

Edit `frontend/src/components/layout/Sidebar.tsx` — update interface to accept `mobileOpen` and `onMobileClose` props:

```tsx
interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}
```

Replace the mobile overlay section (around line 150-173):

```tsx
  // Mobile: overlay sidebar
  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div className="fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={onMobileClose}
            />
            <aside className="relative h-full w-64 animate-slide-in-right border-r bg-card">
              {sidebarContent}
            </aside>
          </div>
        )}
      </>
    )
  }
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/layout/AppShell.tsx frontend/src/components/layout/Sidebar.tsx
git commit -m "feat: integrate mobile header, bottom nav, and improved sidebar overlay"
```

---

## Task 5: Mobile-Optimize Manager Dashboard

**Files:**
- Modify: `frontend/src/pages/manager/Dashboard.tsx`

- [ ] **Step 1: Update KPI grid for mobile**
Replace the grid classes (line 129):

```tsx
<div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
```

- [ ] **Step 2: Stack charts vertically on mobile**
Replace the charts grid (line 163):

```tsx
<div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
```

And the trend/pie grid (line 218):

```tsx
<div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
```

- [ ] **Step 3: Make rep performance table cards on mobile**
Wrap the table with responsive-table or add mobile card view. Add a mobile card rendering section after the table header section.

- [ ] **Step 4: Pipeline stages responsive grid**
Change the pipeline grid (line 327):

```tsx
<div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/manager/Dashboard.tsx
git commit -m "feat: mobile-optimize manager dashboard with responsive grids and charts"
```

---

## Task 6: Mobile-Optimize Rep Dashboard

**Files:**
- Modify: `frontend/src/pages/rep/Dashboard.tsx`

- [ ] **Step 1: KPI grid responsive**
Line 70: change to:
```tsx
<div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
```

- [ ] **Step 2: Pipeline stages responsive**
Line 140: change to:
```tsx
<div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
```

- [ ] **Step 3: Recent activity mobile layout**
Ensure activity items wrap properly on mobile (already flex, just ensure no overflow).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/rep/Dashboard.tsx
git commit -m "feat: mobile-optimize rep dashboard with responsive grids"
```

---

## Task 7: Mobile-Optimize Leads Page

**Files:**
- Modify: `frontend/src/pages/manager/Leads.tsx`

- [ ] **Step 1: Make filter bar stacked on mobile**
The FilterBar already uses `flex-wrap` and `gap-3` — ensure search input is full-width on mobile. Add a `w-full md:w-auto` to the search wrapper.

- [ ] **Step 2: Add mobile card view for leads table**
Wrap the existing leads table section with a mobile card alternative. After the table section (around line 100-300), add a mobile card rendering that shows leads as cards instead of table rows:

```tsx
// Inside the leads rendering section, add mobile card variant
import { useIsMobile } from "@/hooks/useMediaQuery"

// Mobile card view for leads
{isMobile && (
  <div className="space-y-3 md:hidden">
    {leads.map((lead) => (
      <Card key={lead.id} className="overflow-hidden cursor-pointer" onClick={() => { setSelectedLead(lead); setShowDetail(true) }}>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{lead.business_name}</span>
            <Badge variant="secondary" className={`${LEAD_STATUS[lead.status as keyof typeof LEAD_STATUS]?.bg || 'bg-muted'} ${LEAD_STATUS[lead.status as keyof typeof LEAD_STATUS]?.color || ''}`}>
              {LEAD_STATUS[lead.status as keyof typeof LEAD_STATUS]?.label || lead.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{lead.contact_name}</span>
            <span>·</span>
            <span>{lead.phone}</span>
          </div>
          {lead.assigned_to_name && (
            <div className="text-xs text-muted-foreground">
              Assigned to: {lead.assigned_to_name}
            </div>
          )}
          {lead.deal_value && (
            <div className="text-xs font-medium text-emerald-400">
              ${lead.deal_value.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    ))}
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/manager/Leads.tsx
git commit -m "feat: mobile-optimize leads page with card view on mobile"
```

---

## Task 8: Mobile-Optimize Calling View

**Files:**
- Modify: `frontend/src/pages/rep/CallingView.tsx`

- [ ] **Step 1: Make outcome buttons larger on mobile**
Find the outcome buttons section and add touch-friendly sizing:
```tsx
className="flex-1 min-h-[48px] text-sm gap-2"
```

- [ ] **Step 2: Make history toggle and call controls full-width on mobile**
Add responsive width classes to call action buttons.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/rep/CallingView.tsx
git commit -m "feat: mobile-optimize calling view with touch-friendly buttons"
```

---

## Task 9: Mobile-Optimize Demo Requests & Handovers

**Files:**
- Modify: `frontend/src/pages/rep/DemoRequests.tsx`
- Modify: `frontend/src/pages/rep/Handovers.tsx`

- [ ] **Step 1: Demo Requests — make table/items responsive**
Add mobile card view for demo requests list after the desktop table. Use a similar pattern to the leads page: cards on mobile, table on desktop.

- [ ] **Step 2: Handovers — make table/items responsive**
Same card pattern for handovers list.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/rep/DemoRequests.tsx frontend/src/pages/rep/Handovers.tsx
git commit -m "feat: mobile-optimize demo requests and handovers pages"
```

---

## Task 10: Mobile-Optimize Settings & Admin Users

**Files:**
- Modify: `frontend/src/pages/Settings.tsx`
- Modify: `frontend/src/pages/admin/Users.tsx`

- [ ] **Step 1: Settings — stack cards on mobile**
Line 53: change grid to single column on mobile:
```tsx
<div className="grid gap-6 md:grid-cols-2">
```

- [ ] **Step 2: Admin Users — mobile card view**
Add mobile card rendering for the users list, same pattern as leads page.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Settings.tsx frontend/src/pages/admin/Users.tsx
git commit -m "feat: mobile-optimize settings and admin users pages"
```

---

## Task 11: Mobile-Optimize Leaderboard

**Files:**
- Modify: `frontend/src/pages/manager/Leaderboard.tsx`

- [ ] **Step 1: Make leaderboard table responsive**
Use the same card-on-mobile pattern for leaderboard entries.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/manager/Leaderboard.tsx
git commit -m "feat: mobile-optimize leaderboard page with responsive cards"
```

---

## Task 12: Update Documentation — Rename Bundle F → Bundle G

**Files:**
- Modify: `HANDOFF.md`
- Modify: `TODO.md`
- Modify: `docs/superpowers/plans/2026-07-13-full-orchestration-go-live.md`

- [ ] **Step 1: Rename all references to Bundle F → Bundle G in HANDOFF.md**

In `HANDOFF.md`:
- Line 78: `Bundle F (Go-Live)` → `Bundle G (Go-Live)`
- Line 84: `Bundle F (Go-Live) depends on Bundle A` → `Bundle G (Go-Live) depends on Bundle A`
- Add a new line: `- Bundle F (Mobile Optimization) — independent, can be executed at any time`

- [ ] **Step 2: Rename Bundle F references in TODO.md**

All references to Bundle F → Bundle G. Add new section for Bundle F Mobile items.

- [ ] **Step 3: Rename Bundle F in the full orchestration plan**

Change the section header from `## Feature Bundle F: Go-Live & Production Readiness` to `## Feature Bundle G: Go-Live & Production Readiness`.

Update all downstream references in the dependency chain diagram and execution order section.

- [ ] **Step 4: Commit**

```bash
git add HANDOFF.md TODO.md docs/superpowers/plans/2026-07-13-full-orchestration-go-live.md
git commit -m "docs: rename Bundle F (Go-Live) to Bundle G, add new Bundle F (Mobile Optimization)"
```

---

## Execution Order

```
Task 1  (MobileBottomNav) ─┐
Task 2  (MobileHeader) ────┤
Task 3  (ResponsiveTable) ──┤──► Task 4 (AppShell Integration)
Task 5  (Mgr Dashboard) ───┤
Task 6  (Rep Dashboard) ───┤
Task 7  (Leads) ───────────┤
Task 8  (CallingView) ─────┤──► Parallel (independent tasks)
Task 9  (Demos+Handovers) ─┤
Task 10 (Settings+Users) ──┤
Task 11 (Leaderboard) ─────┤
Task 12 (Docs) ────────────┘
```

Tasks 1-3 must complete before Task 4. Tasks 5-12 are independent and can run in parallel after Task 4.
