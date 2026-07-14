# Mobile Card Overflow Fix Implementation Plan

> **For agentic workers:** Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix data spilling out of cards on mobile for every section of the dashboard.

**Architecture:** The dashboard uses a shadcn-style `Card` component with flex/grid layouts. On mobile (<768px), content overflows cards because: (1) flex children lack `min-w-0`, (2) text elements lack `truncate`/`overflow-hidden`, (3) fixed padding is insufficient, (4) grid layouts don't constrain content width. The fix applies targeted CSS overrides at the component level.

**Tech Stack:** React + TypeScript + Tailwind CSS + shadcn-style components

**Root Causes Identified:**
1. `Card` component has `overflow-hidden` but inner content can overflow horizontally from flex/grid children
2. Flex children in card layouts missing `min-w-0` to allow shrinking
3. Long text (business names, phone numbers) not truncated
4. Badges and action items squeezed in flex layouts on narrow screens
5. Nested cards in pipeline overview overflow when content is wide
6. Recharts containers overflow on small screens when card padding is insufficient

---

## Global Constraints
- Only modify CSS/Tailwind classes, never change logic or data flow
- All content must remain accessible and readable
- Must work on screens 320px-768px wide
- No JavaScript changes — Tailwind utility classes only
- Preserve all existing animations and interactions

---

### Task 1: Fix Base Card Component and Global CSS

**Files:**
- Modify: `frontend/src/components/ui/card.tsx`
- Modify: `frontend/src/index.css`

**Interfaces:**
- Consumes: Existing card component API
- Produces: Cards with overflow-safe content area, global responsive utilities

- [ ] **Step 1: Fix Card component - Add overflow containment to CardContent**

In `frontend/src/components/ui/card.tsx`, modify CardContent to add `overflow-hidden` and proper min-width:

Old:
```tsx
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}
```

New:
```tsx
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing) min-w-0", className)}
      {...props}
    />
  )
}
```

- [ ] **Step 2: Add responsive overflow utilities to index.css**

Add these utility classes at the end of the file (before closing `}` of last rule):
```css
@layer utilities {
  /* ...existing utilities... */
  
  /* Card overflow prevention utilities */
  .card-text-overflow {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .card-break-word {
    overflow-wrap: break-word;
    word-break: break-word;
  }
}
```

- [ ] **Step 3: Add global card overflow guard in index.css base layer**

After the `box-sizing` rule block, add:
```css
  * { @apply border-border; }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  /* ADD: Card overflow protection */
  [data-slot="card"] {
    min-width: 0;
  }
  [data-slot="card"] * {
    max-width: 100%;
  }
```

---

### Task 2: Fix KpiCard Component

**Files:**
- Modify: `frontend/src/components/dashboard/KpiCard.tsx`

- [ ] **Step 1: Add min-w-0 to flex container and truncate header text**

In the `KpiCard` component, modify the flex container and text elements:

```tsx
<Card className="group relative overflow-hidden">
  <div className={cn("absolute inset-0 opacity-[0.03]", bgClass)} />
  <CardHeader className="flex-row items-center gap-3 space-y-0 p-3 sm:p-4">
    <div
      className={cn(
        "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg shrink-0",  // ADD: shrink-0
        bgClass
      )}
    >
      <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconClass)} />
    </div>
    <div className="min-w-0 flex-1">
      <CardDescription className="text-[10px] sm:text-xs truncate">{title}</CardDescription>  {/* ADD: truncate */}
      <CardTitle className="text-lg sm:text-2xl">
        <NumberTicker
          value={value}
          prefix={prefix}
          suffix={suffix}
        />
      </CardTitle>
    </div>
    {trend && (
      <div
        className={cn(
          "flex items-center gap-1 rounded-full px-1.5 py-0.5 sm:px-2 text-[10px] sm:text-xs font-medium shrink-0",  // ADD: shrink-0
          trend.positive
            ? "bg-emerald-900/20 text-emerald-400"
            : "bg-red-900/20 text-red-400"
        )}
      >
```

---

### Task 3: Fix Rep Dashboard

**Files:**
- Modify: `frontend/src/pages/rep/Dashboard.tsx`

- [ ] **Step 1: Fix pipeline stages grid - add min-w-0 and truncation**

```tsx
{data.pipeline_stages.map((stage) => {
  const statusConfig = LEAD_STATUS[stage.status as keyof typeof LEAD_STATUS]
  return (
    <Card key={stage.status} className="min-w-0">  {/* ADD: min-w-0 */}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">  {/* ADD: gap-2 */}
          <CardTitle className="text-sm font-medium truncate">{statusConfig?.label || stage.status}</CardTitle>  {/* ADD: truncate */}
          <Badge variant="secondary" className={`${statusConfig?.bg || 'bg-muted'} ${statusConfig?.color || 'text-muted-foreground'} shrink-0`}>  {/* ADD: shrink-0 */}
            {stage.count}
          </Badge>
        </div>
```

- [ ] **Step 2: Fix recent activity items - prevent overflow**

```tsx
<div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3">  {/* ADD: gap-3 */}
  <div className="flex items-center gap-3 min-w-0">  {/* ADD: min-w-0 */}
    <div className={`h-2 w-2 shrink-0 rounded-full ${  {/* ADD: shrink-0 */}
      LEAD_STATUS[a.status as keyof typeof LEAD_STATUS]?.color || 'text-muted-foreground'
    } bg-current`} />
    <span className="text-sm font-medium truncate">{a.business_name}</span>  {/* ADD: truncate */}
  </div>
  <div className="flex items-center gap-3 shrink-0">  {/* ADD: shrink-0 */}
    <Badge variant="secondary" className="shrink-0 ...">  {/* ADD: shrink-0 */}
      ...
    </Badge>
    <span className="text-xs text-muted-foreground whitespace-nowrap">  {/* ADD: whitespace-nowrap */}
      ...
    </span>
  </div>
</div>
```

---

### Task 4: Fix Manager Dashboard

**Files:**
- Modify: `frontend/src/pages/manager/Dashboard.tsx`

- [ ] **Step 1: Fix KPI grid - narrow gap on mobile**

```tsx
{/* KPI Cards */}
<div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
```

- [ ] **Step 2: Fix Pipeline Overview - add card text truncation**

```tsx
<Card key={stage.status} className="border-border/50 min-w-0">  {/* ADD: min-w-0 */}
  <CardHeader className="pb-2">
    <div className="flex items-center justify-between gap-2">  {/* ADD: gap-2 */}
      <p className="text-xs font-medium text-muted-foreground truncate">  {/* ADD: truncate */}
        {stage.label}
      </p>
      <Badge variant="secondary" className="shrink-0 ...">  {/* ADD: shrink-0 */}
```

- [ ] **Step 3: Fix rep performance mobile card view - wrap content**

```tsx
<div key={r.rep_id} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 p-3">
  <div className="min-w-0 flex-1">
    <p className="text-sm font-medium truncate">{r.rep_name}</p>  {/* ADD: truncate */}
    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      ...
    </div>
  </div>
  <div className="flex flex-col items-end gap-1 shrink-0">  {/* ADD: shrink-0 */}
```

---

### Task 5: Fix Leaderboard

**Files:**
- Modify: `frontend/src/pages/manager/Leaderboard.tsx`

- [ ] **Step 1: Fix podium MagicCards - ensure content stays inside**

```tsx
<MagicCard
  mode="gradient"
  gradientSize={300}
  gradientColor="#262626"
  gradientOpacity={0.15}
  className={cn(
    "relative overflow-hidden rounded-xl border min-w-0",  // ADD: min-w-0
    podiumBorders[i],
  )}
>
```

- [ ] **Step 2: Fix mobile rankings card view - truncate text**

```tsx
<div className="flex items-center justify-between mb-3">
  <div className="flex items-center gap-2 min-w-0">  {/* ADD: min-w-0 */}
    <RankBadge rank={entry.rank} />
    <RankChange rank={entry.rank} />
    <span className="font-medium truncate">{entry.rep_name}</span>  {/* ADD: truncate */}
  </div>
  <Badge variant="secondary" className="bg-emerald-900/20 text-emerald-400 shrink-0">  {/* ADD: shrink-0 */}
    {entry.deals_closed} deals
  </Badge>
</div>
```

---

### Task 6: Fix Manager Leads Mobile Card View

**Files:**
- Modify: `frontend/src/pages/manager/Leads.tsx`

- [ ] **Step 1: Fix mobile card view - add truncation and overflow control**

```tsx
<CardContent className="p-4">
  <div className="flex items-center justify-between gap-2 mb-2">  {/* ADD: gap-2 */}
    <div className="flex items-center gap-3 min-w-0">  {/* ADD: min-w-0 */}
      <input type="checkbox" ... className="shrink-0 ..." />  {/* ADD: shrink-0 */}
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">{l.business_name}</p>  {/* ADD: truncate */}
        <p className="text-xs text-muted-foreground truncate">{l.contact_name}</p>  {/* ADD: truncate */}
      </div>
    </div>
    <Badge variant="secondary" className="shrink-0 ...">  {/* ADD: shrink-0 */}
      ...
    </Badge>
  </div>
  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
    <a href={`tel:${l.phone}`} ... className="font-mono hover:text-emerald-400 transition-colors truncate">{l.phone}</a>  {/* ADD: truncate */}
    <span className="shrink-0">{l.assigned_to || "Unassigned"}</span>  {/* ADD: shrink-0 */}
  </div>
```

---

### Task 7: Fix DemoRequests and Handovers Card Overflow

**Files:**
- Modify: `frontend/src/pages/rep/DemoRequests.tsx`
- Modify: `frontend/src/pages/rep/Handovers.tsx`

- [ ] **Step 1: Fix DemoRequests card - truncate long text**

```tsx
<Card key={demo.id} className="min-w-0">  {/* ADD: min-w-0 */}
  <CardHeader>
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <CardTitle className="text-lg truncate">{demo.title}</CardTitle>  {/* ADD: truncate */}
        <p className="mt-1 text-sm text-muted-foreground truncate">
          {demo.business_name} — {demo.contact_name}
        </p>
      </div>
      {statusBadge(demo.status)}
    </div>
```

- [ ] **Step 2: Fix Handovers card - add truncation**

```tsx
<Card key={h.id} className="min-w-0">  {/* ADD: min-w-0 */}
  <CardHeader>
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <CardTitle className="text-lg truncate">{h.business_name || `Client #${h.lead_id}`}</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground truncate">{h.contact_name}</p>
      </div>
      ...
    </div>
```

---

### Task 8: Fix EmailSequences Card Grid

**Files:**
- Modify: `frontend/src/pages/manager/EmailSequences.tsx`

- [ ] **Step 1: Fix sequence cards - truncate text and add overflow control**

```tsx
<Card className="h-full cursor-pointer hover:border-emerald-800/50 transition-colors min-w-0"
  onClick={() => setShowView(seq)}
>
  <CardHeader className="pb-3">
    <div className="flex items-start justify-between gap-2">
      <CardTitle className="text-base truncate">{seq.name}</CardTitle>  {/* ADD: truncate */}
      <Badge variant={seq.is_active ? "default" : "secondary"} className="text-xs shrink-0">  {/* ADD: shrink-0 */}
        {seq.is_active ? "Active" : "Paused"}
      </Badge>
    </div>
    {seq.description && (
      <p className="text-xs text-muted-foreground line-clamp-2 card-break-word">{seq.description}</p>
    )}
  </CardHeader>
```
