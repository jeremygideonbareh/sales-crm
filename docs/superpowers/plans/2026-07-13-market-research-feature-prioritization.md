# Agency Dashboard — Market Research & Feature Prioritization

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Identify and prioritize the highest-impact features that will help agency sales teams practically improve their daily workflow, close more clients, and grow revenue — based on extensive market research of competing platforms (GoHighLevel, SuiteDash, Clozo, HubSpot, GetMapLeads, AgencyHandy, AgencyPro, DeliHub) and agency pain points.

**Architecture:** React 18 + TypeScript + Vite frontend with FastAPI Python backend (SQLAlchemy async, SQLite/PostgreSQL). Build new features as independent feature bundles on top of the existing CRM foundation.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 3, shadcn/ui, motion (Framer Motion), Recharts, FastAPI, SQLAlchemy, Pydantic

---

## Market Research Summary

### Who Uses This App?
Agencies (web design, marketing, creative) with:
- **Sales reps** — cold calling, demo scheduling, client handover
- **Managers** — pipeline oversight, leaderboard, commission tracking
- **Admin** — user management, team configuration

### Competitive Landscape (Key Platforms & What They Offer)

| Platform | Price | Key Differentiator |
|----------|-------|-------------------|
| **GoHighLevel** | $97–$497/mo | All-in-one: CRM + marketing automation + white-label client portal + sub-accounts |
| **SuiteDash** | $19–$99/mo | White-label client portal + proposals + invoicing + email marketing |
| **Clozo** | ~$99/mo | AI discovery call scripts + proposal tracking + pitch win rate analytics |
| **HubSpot** | $20–$150/seat | Enterprise inbound marketing + AI (Breeze) + deep integrations |
| **GetMapLeads** | $59/mo | Google Maps scraper + no-website filter + AI audit + cold call pipeline |
| **AgencyHandy** | ~$49/mo | Client profiles + proposals + client impersonation + white-label |
| **AgencyPro** | $39–$149/mo | Client portal + approvals + invoicing + time tracking + white-label |
| **Salesforce** | $25–$330/seat | Deep customization + enterprise features + Einstein AI |

### Top Agency Pain Points (From Research)

1. **"Warm leads go cold"** — No automated follow-up system → 44% of salespeople abandon after 1 touch
2. **"Proposals take too long"** — 6.2 days avg to send proposal; clients hire first agency that sends credible proposal
3. **"No centralized client communication"** — Emails, calls, notes scattered across tools
4. **"Can't find prospects"** — No lead sourcing; relying solely on referrals
5. **"Commission disputes"** — 62% of reps maintain shadow spreadsheets; no transparency
6. **"No client portal"** — Clients email asking "where's my project?" constantly
7. **"Pipeline visibility"** — Don't know conversion rates, stage velocity, win/loss patterns
8. **"Client onboarding chaos"** — No structured process from signed deal to kickoff

### Features That Generate the Most Revenue (Ranked by Impact)

| Priority | Feature | Revenue Impact | Competitors Who Have It |
|----------|---------|---------------|----------------------|
| 🔴 **P0** | **Automated Follow-up Sequences** | Prevents lead decay, 3-5x touch needed to close | HubSpot, GoHighLevel, Clozo |
| 🔴 **P0** | **Email/SMS Integration** | Centralize comms, log everything | GoHighLevel, SuiteDash, DeliHub |
| 🔴 **P0** | **Commission Tracking Dashboard** | Eliminates disputes, motivates reps | Everstage, SalesCookie, Qobra |
| 🟡 **P1** | **Lead Scoring (AI-powered)** | Focus reps on hot leads | HubSpot, RakanSales, Salesforce |
| 🟡 **P1** | **Proposal Builder with E-Signature** | Close faster, track opens | SuiteDash, AgencyHandy, Proposify |
| 🟡 **P1** | **White-Label Client Portal** | Professional presentation, reduces support emails | SuiteDash, AgencyPro, AgencyHandy |
| 🟡 **P1** | **Calendar Booking Integration** | Eliminates back-and-forth scheduling | Calendly, HubSpot, GoHighLevel |
| 🟢 **P2** | **Google Maps Lead Scraper** | Find local businesses without websites | GetMapLeads |
| 🟢 **P2** | **AI Website Audit Tool** | Generate sales-ready audit PDFs | GetMapLeads, Clozo |
| 🟢 **P2** | **Invoicing & Payments** | Get paid faster (Stripe) | SuiteDash, AgencyPro, GoHighLevel |
| 🔵 **P3** | **Referral Tracking System** | Systematize word-of-mouth | Custom built |
| 🔵 **P3** | **Client Onboarding Automation** | Structured welcome sequences | GoHighLevel, SuiteDash |
| 🔵 **P3** | **Time Tracking** | Billable hours → invoices | AgencyPro, SuiteDash |
| 🔵 **P3** | **Revenue Forecasting** | Predict monthly revenue | HubSpot, Salesforce, Clari |

---

## Recommended Feature Bundles (In Priority Order)

### Bundle H: Automated Follow-up Sequences & Email Integration
**Impact:** Prevents warm leads from going cold; centralizes all client communication
**ROI:** High — directly increases close rate
**Est. Effort:** 2-3 days

### Bundle I: Commission Tracking & Rep Compensation Dashboard
**Impact:** Eliminates disputes, drives rep motivation, transparent earnings
**ROI:** High — 62% of reps maintain shadow spreadsheets currently
**Est. Effort:** 2-3 days

### Bundle J: Lead Scoring & AI-Powered Pipeline Intelligence
**Impact:** Focuses reps on highest-value prospects
**ROI:** Medium-High — improves conversion rate
**Est. Effort:** 3-4 days

### Bundle K: White-Label Client Portal
**Impact:** Professional client experience, reduces support emails
**ROI:** Medium — competitive differentiator, retainer retention
**Est. Effort:** 4-5 days

### Bundle L: Proposal Builder with E-Signature
**Impact:** Close deals faster with branded proposals
**ROI:** Medium — reduces proposal time from 6 days to hours
**Est. Effort:** 3-4 days

### Bundle M: Google Maps Lead Scraper + AI Website Audit
**Impact:** Direct lead generation tool for outbound sales
**ROI:** High for outbound agencies — direct lead pipeline
**Est. Effort:** 3-4 days

---

## Execution Order (Dependency Chain)

```
Bundle H (Email Sequences) ───────┐
Bundle I (Commission Tracking) ───┤
Bundle J (Lead Scoring) ──────────┤──► All Independent
Bundle K (Client Portal) ─────────┤    Can be built in parallel
Bundle L (Proposal Builder) ──────┤
Bundle M (Lead Scraper + Audit) ──┘
```

All bundles are **independent** of each other. They can be executed in any order or in parallel. Each bundle builds on the existing app foundation (auth, leads, pipeline, notifications).

---

## Quick Start — Recommended Order

If building one at a time:

1. **Bundle H** — Email follow-ups (highest immediate client-getting impact)
2. **Bundle I** — Commission tracking (reps will love it, drives behavior)
3. **Bundle J** — Lead scoring (pipeline intelligence)
4. **Bundle L** — Proposal builder (closing tool)
5. **Bundle K** — Client portal (retention & professionalism)
6. **Bundle M** — Lead scraper (outbound machine)

---

## Detailed Bundle Plans

### Bundle H: Automated Follow-up Sequences & Email Integration

**Goal:** Build automated email sequences triggered by deal stage changes, with two-way email logging linked to leads.

**New Files:**
- `backend/app/models/email_sequence.py` — EmailSequence, SequenceStep models
- `backend/app/models/email_log.py` — EmailLog model (track sent/received)
- `backend/app/schemas/email.py` — Sequence + email schemas
- `backend/app/services/email_sequences.py` — Sequence engine logic
- `backend/app/services/email_sender.py` — SMTP/email sending service
- `backend/app/api/email_sequences.py` — Sequence CRUD + trigger endpoints
- `frontend/src/pages/manager/EmailSequences.tsx` — Sequence builder UI
- `frontend/src/components/sequences/SequenceBuilder.tsx` — Drag-and-drop step builder
- `frontend/src/components/sequences/SequenceTimeline.tsx` — Visual timeline
- `frontend/src/hooks/useSequences.ts` — Sequence state hook
- `frontend/src/api/email.ts` — Email API methods

**Modified Files:**
- `frontend/src/App.tsx` — Add sequence routes
- `frontend/src/components/layout/Sidebar.tsx` — Add "Sequences" nav item
- `frontend/src/types.ts` — Add email/sequence types
- `frontend/src/api/client.ts` — Add email API methods
- `backend/app/main.py` — Register email router
- `backend/app/models/__init__.py` — Export new models

**Key Features:**
- Sequence builder with drag-and-drop steps (delay, email, condition, action)
- Trigger by deal stage change (e.g., "proposal sent" → 3-day follow-up sequence)
- Two-way email sync (replies logged to lead timeline)
- Templates library with variable insertion ({{business_name}}, {{rep_name}}, etc.)
- Analytics: open rates, click rates, reply rates per sequence

---

### Bundle I: Commission Tracking & Rep Compensation Dashboard

**Goal:** Real-time commission tracking dashboard for reps with deal-level drilldown, what-if forecasting, and manager oversight.

**New Files:**
- `backend/app/api/commissions.py` — Commission endpoints
- `backend/app/services/commissions.py` — Commission calculation engine
- `backend/app/schemas/commission.py` — Commission schemas
- `frontend/src/pages/rep/Commissions.tsx` — Rep commission dashboard
- `frontend/src/pages/manager/Commissions.tsx` — Manager commission overview
- `frontend/src/components/commissions/CommissionCard.tsx` — Per-rep commission card
- `frontend/src/components/commissions/DealBreakdown.tsx` — Deal-level drilldown
- `frontend/src/components/commissions/WhatIfCalculator.tsx` — What-if modeling
- `frontend/src/components/commissions/CommissionHistory.tsx` — Historical earnings

**Modified Files:**
- `frontend/src/App.tsx` — Add commission routes
- `frontend/src/components/layout/Sidebar.tsx` — Add "Commissions" nav
- `frontend/src/types.ts` — Add commission types
- `frontend/src/api/client.ts` — Add commission API methods
- `backend/app/main.py` — Register commission router
- `backend/app/models/lead.py` — Add commission rate tracking

**Key Features:**
- Real-time earned commissions (live from deal data)
- Deal-level drilldown: which deals contributed, commission rate applied, accelerators
- What-if calculator: forecast earnings from current pipeline
- Commission tiers and accelerators (3-tier model)
- Manager view: team commission totals, verification workflow
- Commission statements (PDF export)

---

### Bundle J: Lead Scoring & AI-Powered Pipeline Intelligence

**Goal:** Score leads based on engagement signals, deal stage, and activity to prioritize high-value prospects.

**New Files:**
- `backend/app/services/lead_scoring.py` — Scoring algorithm
- `backend/app/api/lead_scoring.py` — Scoring endpoints
- `backend/app/schemas/scoring.py` — Score schemas
- `frontend/src/components/leads/LeadScoreBadge.tsx` — Score display
- `frontend/src/pages/manager/LeadScoring.tsx` — Scoring configuration
- `frontend/src/hooks/useLeadScoring.ts` — Scoring hook

**Modified Files:**
- `frontend/src/components/leads/FilterBar.tsx` — Add score filter
- `frontend/src/pages/manager/Leads.tsx` — Show score in leads list
- `frontend/src/pages/manager/Dashboard.tsx` — Add score distribution widget
- `frontend/src/types.ts` — Add score types
- `frontend/src/api/client.ts` — Add scoring API

**Key Features:**
- Score leads on 0-100 based on: recency of activity, call outcomes, deal stage, email engagement, website visits
- "Hot leads" section on dashboard
- Sort/filter by score in leads list
- Score history tracking (score trend over time)
- Configurable scoring weights per agency

---

### Bundle K: White-Label Client Portal

**Goal:** Give each client a branded portal to view project status, invoices, files, and communicate with the team.

**New Files:**
- `backend/app/api/client_portal.py` — Portal endpoints
- `backend/app/services/client_portal.py` — Portal service logic
- `backend/app/schemas/portal.py` — Portal schemas
- `frontend/src/pages/portal/ClientDashboard.tsx` — Client-facing dashboard
- `frontend/src/pages/portal/ClientProjects.tsx` — Client project view
- `frontend/src/pages/portal/ClientFiles.tsx` — Client file sharing
- `frontend/src/pages/portal/ClientMessages.tsx` — Client messaging
- `frontend/src/components/portal/PortalShell.tsx` — Portal layout (white-labeled)
- `frontend/src/pages/admin/PortalSettings.tsx` — Branding config
- `frontend/src/hooks/usePortal.ts` — Portal hook

**Modified Files:**
- `frontend/src/App.tsx` — Add portal routes (subdomain or /portal/*)
- `frontend/src/types.ts` — Add portal types
- `backend/app/main.py` — Register portal router
- `backend/app/models/lead.py` — Add portal_access fields

**Key Features:**
- Custom branding (agency logo, colors, domain)
- Client sees only their own data
- Project status tracking
- File sharing (upload/download)
- Invoicing & payment history
- Direct messaging with assigned team
- No login required (portal token/URL based)

---

### Bundle L: Proposal Builder with E-Signature

**Goal:** Create branded proposals with service packages, pricing, and e-signature — track opens and signings.

**New Files:**
- `backend/app/models/proposal.py` — Proposal model
- `backend/app/schemas/proposal.py` — Proposal schemas
- `backend/app/services/proposals.py` — Proposal service
- `backend/app/api/proposals.py` — Proposal endpoints
- `frontend/src/pages/manager/Proposals.tsx` — Proposal list
- `frontend/src/pages/manager/ProposalBuilder.tsx` — Proposal editor
- `frontend/src/pages/portal/ProposalView.tsx` — Client-facing proposal view with e-sign
- `frontend/src/components/proposals/ProposalTemplate.tsx` — Template system
- `frontend/src/components/proposals/ServicePackageCard.tsx` — Package item
- `frontend/src/components/proposals/ESignaturePad.tsx` — Signature component

**Modified Files:**
- `frontend/src/App.tsx` — Add proposal routes
- `frontend/src/components/layout/Sidebar.tsx` — Add "Proposals" nav
- `frontend/src/types.ts` — Add proposal types
- `frontend/src/api/client.ts` — Add proposal API
- `backend/app/main.py` — Register proposal router

**Key Features:**
- Proposal templates with variables (client name, date, pricing)
- Service packages with itemized pricing (one-time, recurring)
- Drag-and-drop section reordering
- Track: sent, viewed, signed, declined
- E-signature (canvas-based)
- Auto-convert signed proposal → lead status update + notification
- PDF download

---

### Bundle M: Google Maps Lead Scraper + AI Website Audit

**Goal:** Find local businesses without websites via Google Maps, run AI-powered website audits, generate branded PDF reports for sales outreach.

**New Files:**
- `backend/app/services/maps_scraper.py` — Google Maps Places API integration
- `backend/app/services/website_audit.py` — Lighthouse/Audit engine
- `backend/app/services/pdff_generator.py` — Branded PDF report generator
- `backend/app/schemas/scraper.py` — Scraper schemas
- `backend/app/api/scraper.py` — Scraper + audit endpoints
- `frontend/src/pages/manager/LeadScraper.tsx` — Scraper dashboard
- `frontend/src/pages/manager/WebsiteAudit.tsx` — Audit results view
- `frontend/src/components/scraper/ScraperForm.tsx` — Search configuration
- `frontend/src/components/scraper/ScraperResults.tsx` — Results table
- `frontend/src/components/scraper/AuditSummary.tsx` — Audit summary card

**Modified Files:**
- `frontend/src/App.tsx` — Add scraper routes
- `frontend/src/components/layout/Sidebar.tsx` — Add "Lead Finder" nav
- `frontend/src/types.ts` — Add scraper/audit types
- `frontend/src/api/client.ts` — Add scraper API
- `backend/app/main.py` — Register scraper router

**Key Features:**
- Search by business category + city (Google Maps Places API)
- "No website" filter (highest priority prospects)
- Sort by review count, rating, business name
- Bulk import selected businesses as leads
- AI website audit: speed, mobile-friendliness, SEO basics, design quality
- Branded PDF report (agency logo, findings, recommendations)
- One-click add to call queue

---

## Appendix: Research Sources

1. Clozo.ai — Agency sales CRM with AI discovery scripts
2. HelloGrowthCRM — Multi-client workspace CRM for agencies
3. Gammatica — AI CRM for agencies (2026 guide)
4. SuiteDash — All-in-one agency software (CRM, portal, invoicing)
5. GoHighLevel — Agency CRM with sub-accounts and white-label
6. GetMapLeads — Google Maps cold outreach CRM for web designers
7. AgencyPro — Agency platform with client portal and billing
8. AgencyHandy — Proposal and client management for agencies
9. DeliHub/Deligatr — White-label CRM for agencies
10. Practiq — Agency new business pipeline management playbook
11. BellPilot — Sales pipeline for creative agencies
12. TopSyde — Web agency client acquisition guide 2026
13. Arete — AI sales enablement for web design agencies
14. Taskip — Best CRM for web design agencies buyer's guide
15. SalesCookie — Key features of commission software 2026
16. Everstage — Commission tracker software
17. EasyComp — Sales commission dashboard best practices
