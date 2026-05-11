# LEGALPULSE — MVP FEATURE SPEC & PRODUCT ROADMAP
### Build Bible v1.0 | May 2026
**Status:** Pre-build evaluation → Execution planning
**Audience:** Founder / First engineer / First design hire

---

## HOW TO USE THIS DOCUMENT

This is your primary build reference. It is structured in execution order:
1. **Validation Criteria** — confirm the idea before writing a line of code
2. **Product Principles** — the rules that govern every build decision
3. **MVP Scope** — exactly what ships in the first version, and why
4. **Feature Specifications** — each feature defined with user stories, acceptance criteria, and implementation notes
5. **Technical Decisions** — stack choices with rationale
6. **Sprint Plan** — week-by-week build schedule for 12 weeks to launch
7. **Post-MVP Roadmap** — Phases 2 and 3 with sequencing rationale
8. **Go/No-Go Checkpoints** — decision gates before committing to each phase

---

# PART 0 — VALIDATE BEFORE YOU BUILD

Before writing a single line of production code, complete these 5 validation steps.
This takes 3–4 weeks and will save you 12 months of building the wrong thing.

## Validation Checklist

### Step 1 — Problem Validation (Week 1)
Talk to 15 in-house counsel. Ask ONLY these questions (do not pitch):
- "Walk me through how you currently manage your contracts."
- "Tell me about the last time a contract surprised you — renewal, liability, anything."
- "How do you track what you're spending on outside law firms?"
- "What does your current contract review process look like from intake to signature?"
- "If you could wave a magic wand and fix one thing about your legal operations, what would it be?"

**Go signal:** 10+ of 15 mention: (a) contracts in Google Drive/Dropbox/email, AND (b) at least one painful auto-renewal or missed date story.
**Stop signal:** Fewer than 6 mention contract chaos as a top-3 pain point.

**How to get meetings:** LinkedIn DM to GCs at companies with $25M–$300M revenue. Subject: "Research interview — in-house legal ops (15 min, no pitch)." 40–50 messages → 15 meetings is realistic.

### Step 2 — Solution Validation (Week 2)
Build a Figma prototype (NOT code). Show it to 10 of the same GCs.
- Walk them through the contract upload → AI extraction → alert flow
- Ask: "If this worked exactly as shown, would this solve the problem you described?"
- Ask: "What would you pay for this annually?" (let them name a number)
- Ask: "What's missing that would make this a no-brainer?"

**Go signal:** 7+ say yes to the solution, AND 7+ name a price ≥$15,000/year.
**Stop signal:** They like the concept but wouldn't pay, or say "our IT would never approve this."

### Step 3 — Willingness to Pay Validation (Week 3)
Ask 3 of the most enthusiastic GCs to be design partners:
- They get the tool free for 12 months.
- They give you 2 hours/month of feedback.
- They commit to being a reference customer if it works.

**Go signal:** 3 design partners signed on paper (even a simple LOI).
**Stop signal:** Everyone is enthusiastic but nobody commits to a design partnership.

### Step 4 — AI Accuracy Validation (Week 3–4)
Test AI contract extraction BEFORE building the product:
- Collect 20–30 real contracts (NDAs, MSAs, SOWs, employment agreements) from public sources or design partners
- Run them through Claude claude-sonnet-4-20250514 API with a detailed extraction prompt
- Measure accuracy on: party names, dates, expiration, auto-renewal, governing law, payment terms, liability cap
- Target: ≥90% accuracy on all fields with a well-crafted prompt

**Go signal:** ≥90% accuracy without fine-tuning. This is your core feature.
**Stop signal:** <80% accuracy — you need to rethink the AI approach before building.

### Step 5 — Competitive Positioning Check
Get demos of: ContractSafe, Precisely, and DocuSign CLM.
- Confirm they are NOT solving the problem for $15K–$50K/year with real AI
- Note their worst UX moments (these become your "we're different because..." talking points)

**Go signal:** You exit every demo thinking "I could build something dramatically better."

---

# PART 1 — PRODUCT PRINCIPLES

These 6 principles govern every feature decision. If a proposed feature violates a principle, it gets cut or deferred.

**Principle 1 — Contract-First Navigation**
Everything in the product is organized around contracts and matters. Users never think in abstract "modules" — they think "I need to find the Acme Corp MSA" or "I need to see what's expiring next month." Navigation mirrors how lawyers actually think.

**Principle 2 — AI Assists, Lawyers Decide**
Every AI output is a draft, suggestion, or highlight — never a final decision. The product must be correct 100% of the time the lawyer uses it. If the AI is wrong 5% of the time, the product surfaces that 5% clearly for human review rather than hiding it. Confidence scores, "review required" flags, and explicit "AI-generated" labeling are non-negotiable.

**Principle 3 — Zero Friction Import**
The product must work within 30 minutes of a new customer signing up. This means: drag-and-drop bulk contract upload, AI processes in the background, dashboard populates automatically. The first session must feel magical, not like data entry.

**Principle 4 — Trust is the Product**
Lawyers handle the most sensitive information in any company. Security theater is not enough. SOC 2 Type II, attorney-client privilege addendum, data processing agreements, and explicit "we never train on your data" commitments must be woven into onboarding, not buried in legal fine print.

**Principle 5 — Show the Money**
Every feature must have a demonstrable dollar value. "AI extracted your renewal date" → saved the $120K auto-renewal. "Invoice review flagged 3 billing errors" → recovered $4,200. The product should proactively calculate and display the value it has created. This drives retention and expansion revenue.

**Principle 6 — Lawyer UX ≠ Consumer UX**
Lawyers are skeptical of software that feels "flashy" or over-designed. The product should feel like a high-end professional tool — Linear, Notion, or Vercel-level polish, not a SaaS landing page turned dashboard. Dense information display is acceptable. Animations should be subtle. The product earns trust through precision, not delight.

---

# PART 2 — MVP SCOPE DEFINITION

## The Lovable MVP

A single GC should be able to:
1. Upload all of their company's contracts in bulk (or connect Google Drive/Dropbox)
2. Get AI-extracted key terms for every contract within 24 hours
3. See a dashboard of what's expiring in the next 90/60/30 days
4. Search any contract by keyword or plain-English question
5. Log a legal matter and track it through to closure
6. Receive a Slack/email alert before any critical contract date

That's it. That is the MVP. Everything else is Phase 2.

## What's IN the MVP

| Feature | Priority | Estimated Dev Time |
|---|---|---|
| Authentication + org setup | P0 | 3 days |
| Contract upload (drag/drop + bulk) | P0 | 4 days |
| AI contract extraction engine | P0 | 8 days |
| Contract repository (list + search) | P0 | 5 days |
| Contract detail view + key terms display | P0 | 4 days |
| Expiration + renewal alert system | P0 | 3 days |
| Dashboard (expiring contracts + matter status) | P0 | 4 days |
| Basic matter log | P1 | 4 days |
| User management + RBAC | P1 | 3 days |
| Slack + email notifications | P1 | 3 days |
| Google Drive / Dropbox import | P1 | 4 days |
| Semantic contract search (AI) | P1 | 3 days |
| Contract risk score | P2 | 5 days |
| **TOTAL MVP BUILD** | | **~57 dev days (~12 weeks with 1 engineer)** |

## What's NOT in the MVP (and why)

| Feature | Why Deferred |
|---|---|
| Outside counsel spend analytics | Requires e-billing integration — complex. Phase 2. |
| Contract generation / templates | Nice-to-have; doesn't solve the core pain. Phase 2. |
| E-signature integration | DocuSign handles this. Don't rebuild. |
| Contract redlining / playbook enforcement | High AI complexity; needs fine-tuning. Phase 3. |
| Legal request intake portal | Useful but not urgent; Phase 2. |
| Native mobile app | Web app works on mobile via PWA. Native is Phase 3. |
| API access | Phase 3 — wait until product is stable. |
| Billing invoice review | Requires law firm integration; Phase 3. |
| M&A due diligence module | Entirely different use case. Separate product, Year 2. |

---

# PART 3 — FEATURE SPECIFICATIONS

## FEATURE 01 — Authentication & Organization Setup

### User Story
As a new GC, I can sign up, create my organization, invite my team, and be in the product in under 10 minutes.

### Acceptance Criteria
- [ ] Email/password signup with email verification
- [ ] Google OAuth (mandatory — GCs live in Google Workspace)
- [ ] Microsoft/Azure AD OAuth (mandatory — common in mid-market enterprises)
- [ ] Organization creation: company name, industry, employee count, expected contract volume
- [ ] Role assignment during onboarding: GC/Admin, Attorney, Paralegal, Read-Only
- [ ] Email invitations with role pre-assigned
- [ ] Onboarding checklist visible on first login (5 steps: invite team, upload contracts, connect integrations, set alert preferences, create first matter)

### Implementation Notes
- Use **Clerk.dev** for auth (handles OAuth, MFA, session management, and team invitations out of the box — saves 2 weeks of auth build time)
- Clerk supports SAML/SSO in their Enterprise plan — critical for Phase 2 customers
- Store org-level settings in a `settings_json` column — flexibility for per-org feature flags

### RBAC Roles (MVP)
| Role | Permissions |
|---|---|
| Admin (GC) | Full access: create/edit/delete contracts, matters, users, billing |
| Attorney | Create/edit contracts and matters; view all; cannot manage users or billing |
| Paralegal | Edit contracts and matters; cannot delete; cannot manage users |
| Business Requester | Submit legal requests (Phase 2); view own requests only |
| Read-Only | View contracts and matters; no edit; for finance/exec stakeholders |

---

## FEATURE 02 — Contract Upload & Bulk Import

### User Story
As a GC, I can upload all of my company's contracts in one drag-and-drop action and have AI process them automatically, without any manual data entry.

### Acceptance Criteria
- [ ] Drag-and-drop zone accepting: PDF, DOCX, DOC
- [ ] Bulk upload: up to 500 files in a single session
- [ ] Progress indicator showing upload + processing queue status per file
- [ ] Background AI processing: user can navigate away; contracts process asynchronously
- [ ] Email notification when bulk batch is complete: "Your 127 contracts have been processed"
- [ ] Failed extraction flagged (not silently ignored): "3 contracts need manual review"
- [ ] File size limit: 50MB per file (covers virtually all contracts)
- [ ] Google Drive integration: connect → browse folders → select contracts → import
- [ ] Dropbox integration: same flow
- [ ] SharePoint integration: P1 (common in enterprise, harder to implement)
- [ ] Duplicate detection: if same filename + similar size already exists, prompt user

### Implementation Notes
- Upload directly to S3 presigned URLs (never route file through your server — kills performance and cost)
- Use SQS queue or BullMQ (Redis) to process extraction jobs asynchronously
- AWS Textract for initial PDF text extraction; then send extracted text to Claude API
- Store ALL original files in S3 with versioning enabled — legal teams CANNOT have files deleted
- Processing status tracked in DB: `queued → extracting → extracted → review_needed → complete`
- Rate limit extraction jobs to manage AI API costs: 10 concurrent per org

### Google Drive Integration
- OAuth2 scope: `drive.readonly` — request minimum permissions
- File picker UI (Google Drive Picker API) — familiar to users, no permission anxiety
- Webhook for file changes: Phase 2 feature (detect new contracts added to Drive)

---

## FEATURE 03 — AI Contract Extraction Engine

### User Story
As a GC, when I upload a contract, AI automatically extracts all key terms so I never have to manually read and re-enter data from a PDF.

### Acceptance Criteria
**Required extracted fields (Phase 1):**
- [ ] Contract title / name
- [ ] Contract type (NDA, MSA, SOW, Employment, Lease, SaaS Subscription, IP License, etc.)
- [ ] All parties (company name + role: customer, vendor, employer, licensee, etc.)
- [ ] Effective date
- [ ] Expiration / termination date
- [ ] Auto-renewal clause (yes/no + terms if yes)
- [ ] Auto-renewal opt-out deadline + notice period (if applicable)
- [ ] Governing law / jurisdiction
- [ ] Contract value / payment terms (if present)
- [ ] Limitation of liability (cap amount if stated)
- [ ] Confidentiality / NDA provisions (yes/no)
- [ ] Termination for convenience (yes/no + notice period)
- [ ] Indemnification obligations (yes/no, which party)

**Quality requirements:**
- [ ] Confidence score per field (0–100%) displayed in UI
- [ ] Fields with confidence <70% flagged for human review with yellow indicator
- [ ] Fields with confidence <50% left empty with red "needs review" indicator (never show uncertain data as fact)
- [ ] Human can edit any AI-extracted field; edit stored separately from AI extraction (audit trail)
- [ ] "Review all AI extractions" mode: step through each field and confirm/edit

### AI Prompt Architecture

**System prompt design (send to Claude):**
```
You are a legal contract analysis AI. Extract specific information from the 
provided contract text. Return ONLY a valid JSON object with the exact schema 
below. For each field, include a "value" and a "confidence" score (0-100).
If a field is not present in the contract, set value to null and confidence to 0.
Never invent or infer information not explicitly stated.

Schema: [exact JSON schema here]
```

**Implementation Notes:**
- Send full contract text (not just first page) — critical renewal clauses are often at the end
- For long contracts (>100 pages), chunk into sections: process each section → merge results
- Use Claude's JSON mode for deterministic output format
- Cache extractions: if same file SHA256 hash uploaded twice, return cached result
- Extraction cost estimate per contract: ~$0.04–0.12 (Claude claude-sonnet-4-20250514 pricing)
- Fine-tune accuracy over time: when humans edit AI extractions, log the correction — use this to improve prompts

### Contract Type Classification
Train a simple classifier (or use prompt-based classification) to identify:
NDA / Confidentiality → MSA / Framework Agreement → SOW / Project Agreement → Employment → SaaS Subscription → Real Estate Lease → IP License → Loan / Financing → Other

Type drives: which fields to extract, which alerts to configure, which risk factors to check.

---

## FEATURE 04 — Contract Repository

### User Story
As an attorney, I can find any contract in under 10 seconds, filter by any dimension, and see exactly what's in it without opening the file.

### Acceptance Criteria
**List View:**
- [ ] Sortable columns: name, counterparty, type, effective date, expiration date, risk score, last modified
- [ ] Filter by: contract type, status (active/expired/draft/pending), counterparty, governing law, owner, tags
- [ ] Status badges: Active (green), Expiring Soon (yellow), Expired (red), Draft (gray), Pending Signature (blue)
- [ ] Pagination: 25/50/100 per page; total count displayed
- [ ] Bulk actions: tag, assign owner, export to CSV, archive

**Contract Status Logic:**
- Active: has effective date in past + expiration date in future
- Expiring Soon: expiration within 90 days
- Expired: expiration date in past
- Draft: uploaded, not yet fully reviewed
- Pending Signature: workflow state (Phase 2 when DocuSign integration added)

**Search:**
- [ ] Global search bar: searches contract name, counterparty, tags, content
- [ ] Semantic search ("contracts where we have indemnification obligations") — powered by embeddings
- [ ] Recent searches saved per user
- [ ] Search results show relevant excerpt (why this contract matched)

**Implementation Notes:**
- PostgreSQL full-text search (`tsvector`) for keyword search — fast, no extra infrastructure
- pgvector for semantic search — add embedding column to contracts table
- Embed contract text at upload time; query with embedding of search phrase at runtime
- Index on: expiration_date, counterparty_name, contract_type, org_id (multi-tenant critical)

---

## FEATURE 05 — Contract Detail View

### User Story
As a GC, I can open any contract and see a complete, organized summary of all key terms without having to read the full document — with the original PDF viewable alongside.

### Acceptance Criteria
**Layout: Split-pane view**
- Left: Original PDF rendered in-browser (react-pdf)
- Right: AI-extracted key terms panel, organized by section

**Key Terms Panel Sections:**
- [ ] **Overview:** type, parties, effective date, expiration, status, governing law
- [ ] **Financial:** contract value, payment terms, late fees, price escalation
- [ ] **Risk & Liability:** liability cap, indemnification, insurance requirements
- [ ] **Termination:** termination for convenience, termination for cause, notice periods
- [ ] **Renewals:** auto-renewal terms, opt-out window, opt-out deadline alert
- [ ] **Key Dates:** all extracted dates with labels, sorted chronologically
- [ ] **Obligations:** key obligations by party (AI-extracted list)
- [ ] **Notes:** free-form attorney notes field (markdown supported)
- [ ] **Activity Log:** who viewed, who edited, what changed and when

**Editing:**
- [ ] Click any extracted field to edit inline
- [ ] Change tracked: "AI extracted: Dec 31, 2026. Edited by Sarah Chen: Jan 15, 2027"
- [ ] Edit reason optional but encouraged ("Corrected — AI misread clause 12.3")

**Actions available from detail view:**
- [ ] Download original file
- [ ] Share contract (generate view-only link for stakeholder, expires in 30 days)
- [ ] Create related matter
- [ ] Add/remove tags
- [ ] Set custom alerts ("remind me 60 days before expiration")
- [ ] Archive contract
- [ ] View version history (if contract has been updated/amended)

---

## FEATURE 06 — Alert & Notification System

### User Story
As a GC, I automatically receive alerts before critical contract dates so I never miss an auto-renewal opt-out window or contract expiration again.

### Acceptance Criteria
**Default alert schedule (system-wide, can be customized):**
- [ ] Auto-renewal opt-out deadline: alert at 90, 60, 30, 14, and 7 days before deadline
- [ ] Contract expiration: alert at 90, 60, 30 days before
- [ ] Payment milestones: if payment dates extracted, alert 14 days before
- [ ] Custom obligations: user can add custom date-based alerts to any contract

**Alert channels:**
- [ ] In-app notifications (notification bell, unread count)
- [ ] Email (daily digest OR immediate — user preference)
- [ ] Slack (channel-level: post to #legal-alerts; or DM to contract owner)
- [ ] Optional: Microsoft Teams webhook (P2)

**Alert management:**
- [ ] Snooze: dismiss for 7/14/30 days
- [ ] Resolve: mark as "handled" with optional note ("Renewed for 1 year" / "Terminated" / "Renegotiating")
- [ ] Assign: forward alert to a specific team member
- [ ] Organization-level alert settings: who gets which alert types by default

**Alert Email Design:**
Subject: `⚠️ [Acme Corp MSA] Auto-renewal opt-out deadline in 14 days`
Body: Contract name, counterparty, deadline, current auto-renewal terms, direct link to contract, one-click "Mark as Handled" button.

**Implementation Notes:**
- Use cron job (daily at 8 AM local time per org) to evaluate all contracts + generate alerts
- Alert deduplication: don't send same alert twice in same day (idempotent alert generation)
- Alert history: store all alerts sent + action taken — used for "value delivered" metrics in dashboard

---

## FEATURE 07 — Dashboard

### User Story
As a GC, I open LegalPulse on Monday morning and immediately understand the state of all my contracts and legal matters without clicking into anything.

### Acceptance Criteria
**Dashboard sections:**

**1 — Critical Alerts Bar (top, always visible)**
Shows count of: contracts with opt-out deadline in 7 days, overdue matters, contracts requiring review. Red badge if any > 0.

**2 — Contract Health Summary**
- Total contracts: [N]
- Active: [N] | Expiring in 90 days: [N] | Expired: [N] | Pending review: [N]
- Expiring Soon timeline: calendar-style view, next 90 days, showing which contracts expire when

**3 — Upcoming Critical Dates**
List: contract name + counterparty + date type + days remaining, sorted by urgency. Max 10 shown; "View all" link.

**4 — Matter Status**
- Open matters: [N] | Overdue: [N] | Closed this month: [N]
- List of open matters by owner with status and due date

**5 — Value Delivered (the money section)**
- Auto-renewals prevented this year: [N] contracts | Estimated value: $[X]
- AI extractions completed: [N] contracts (saved est. [X] hours of manual review)
- This section populates as the product is used — empty state in first week

**6 — Recent Activity**
Last 10 actions by any team member: contract uploaded, matter created, alert resolved, etc.

**Implementation Notes:**
- Dashboard queries should be fast (<500ms). Pre-compute aggregates on a schedule rather than running complex queries on every page load.
- Use Redis to cache dashboard data, invalidate cache on relevant write operations.
- Design for empty state: first-time user sees the same layout but with placeholder data and guided prompts ("Upload your first contracts to see your contract health here").

---

## FEATURE 08 — Matter Log

### User Story
As an attorney, I can track every legal matter — litigation, contract, regulatory, M&A — with status, owner, key dates, and budget, so nothing falls through the cracks when I'm out of office.

### Acceptance Criteria
**Matter creation:**
- [ ] Title, matter type (dropdown: Litigation, Contract, Regulatory, Corporate, Employment, IP, M&A, General), description
- [ ] Priority: High / Medium / Low
- [ ] Responsible attorney (assigned from org user list)
- [ ] Status: Open, In Progress, Pending (waiting on external party), Closed
- [ ] Estimated budget (optional)
- [ ] Estimated close date (optional)
- [ ] Related contracts (link to contracts in the repository)
- [ ] Related law firm (Phase 2: links to outside counsel spend module)
- [ ] Tags (free-form, used for filtering)

**Matter detail view:**
- [ ] Timeline/activity log: all updates, comments, status changes with timestamps and authors
- [ ] Comment thread (internal legal team only — attorney-client privilege)
- [ ] File attachments (correspondence, filings, court documents)
- [ ] Key dates: filed, hearing scheduled, due date, etc.
- [ ] Budget tracker: estimated vs. actual spend (manual entry in MVP; auto from e-billing in Phase 2)

**Matter list view:**
- [ ] Filter by: type, status, owner, priority, date range
- [ ] Sort by: priority, due date, last activity, budget variance
- [ ] Matter aging indicator: how long has it been open?

**Implementation Notes:**
- Matter comments must be clearly marked as internal (attorney-client privilege awareness)
- Do NOT expose matters to non-attorney roles by default — configurable by org admin
- Activity log is append-only (never edit or delete activity entries)

---

## FEATURE 09 — Semantic Contract Search

### User Story
As a GC, I can search my entire contract portfolio in plain English and find what I'm looking for immediately, even if I don't remember the counterparty name or contract title.

### Acceptance Criteria
- [ ] Keyword search: full-text search across all contract content
- [ ] Semantic search: plain-English queries return semantically relevant contracts
  - "contracts where we owe indemnification" → finds contracts with indemnification obligations on our side
  - "agreements with companies in California" → finds California governing law + CA-based counterparties
  - "SaaS subscriptions renewing next quarter" → combines contract type + date logic
- [ ] Results show: contract name, counterparty, match confidence, relevant excerpt with search term highlighted
- [ ] Filter-within-results: narrow search results by contract type, date range, counterparty
- [ ] Search scoped to org (never cross-tenant)

**Implementation Notes:**
- Generate embeddings at contract upload time (text-embedding-3-large, 3072 dimensions)
- Store in pgvector column on contracts table
- Query: embed the search phrase → cosine similarity search → return top 20 results → re-rank with BM25 keyword score
- Hybrid search (vector + keyword) consistently outperforms either alone for contract retrieval tasks
- Latency target: <1 second for search results

---

# PART 4 — TECHNICAL DECISIONS

## Stack (with rationale — no cargo-culting)

### Frontend: Next.js 14 (App Router) + TypeScript
**Why:** Server-side rendering for contract list performance, excellent TypeScript support, the standard for serious SaaS products in 2025–2026.

**Component Library:** Radix UI (headless) + custom Tailwind CSS design system
**Why NOT shadcn pre-built:** You want a distinctive professional aesthetic, not off-the-shelf components that look like every other startup. Use Radix primitives + build your own visual layer.

**PDF Viewer:** react-pdf (Mozilla PDF.js wrapper)
**State:** TanStack Query v5 (server state) + Zustand (client state)
**Tables/Data Grid:** TanStack Table v8 (best-in-class, handles 10k+ rows)

### Backend: Python FastAPI
**Why:** AI-native. Python's ML ecosystem means future integrations (fine-tuning, embeddings, custom models) don't require context-switching. FastAPI is modern, fast, and has excellent async support for queuing AI jobs.

**Why NOT Node:** Node is fine, but Python is better when your core product is AI.

### Database: PostgreSQL (Supabase for speed of development)
**Why Supabase:** Gives you: PostgreSQL + Row Level Security (multi-tenancy) + pgvector (semantic search) + S3-compatible storage + Auth (though you'll use Clerk instead) + realtime subscriptions — all managed. This saves 4–6 weeks of infrastructure setup.

**Why NOT separate services:** Keep the stack simple. One DB with pgvector beats adding Pinecone, a separate vector DB, and the operational complexity that comes with it. Migrate to Pinecone when you hit 50M+ embeddings.

**Multi-tenancy:** Row-level security with `org_id` on every table. Supabase RLS policies enforce this at the database layer — no risk of cross-org data leaks in application code.

### AI Stack
| Component | Choice | Rationale |
|---|---|---|
| Primary LLM | Claude claude-sonnet-4-20250514 | Best legal document understanding, structured JSON output, citation capability |
| Embeddings | OpenAI text-embedding-3-large | Best retrieval performance, 3072 dimensions, cost-effective |
| Vector Search | pgvector (Postgres) | Zero extra infrastructure for MVP; migrate to Pinecone at 50M+ vectors |
| PDF Extraction | AWS Textract | Best accuracy for scanned/image PDFs; fallback for text PDFs is direct text extraction |
| Job Queue | Redis + BullMQ (or Celery for Python) | Async contract processing; retry logic for failed extractions |

### Infrastructure (keep it boring — exciting infra = expensive mistakes)
- **Hosting:** Vercel (frontend) + Railway or Render (backend API)
  - Why not AWS directly: Too much ops overhead for a solo/small team. Railway/Render give you managed containers with auto-scaling. Migrate to ECS/Fargate at Series A.
- **File Storage:** AWS S3 (non-negotiable — GCs will have files forever)
- **Email:** Resend.com (modern, developer-friendly, great deliverability)
- **Monitoring:** Sentry (errors) + Posthog (analytics/feature flags)
- **CI/CD:** GitHub Actions → auto-deploy to Railway/Vercel on merge to main

### What NOT to build yourself (use managed services)
| Function | Use | Don't build |
|---|---|---|
| Authentication | Clerk.dev | Custom auth system |
| Email | Resend | SMTP server |
| Payments | Stripe | Payment processing |
| Feature flags | Posthog | Custom flag system |
| PDF rendering | react-pdf | Custom PDF viewer |
| E-signature | DocuSign API | Custom signing |
| Observability | Sentry + Datadog (Series A) | Custom logging infrastructure |

---

# PART 5 — SPRINT PLAN (12 Weeks to Launch-Ready MVP)

Assumes: 1 senior full-stack engineer + founder doing product/design/sales in parallel.
Add a second engineer to cut timeline to 8 weeks.

## WEEKS 1–2: FOUNDATION
**Goal:** Functioning skeleton with auth, org setup, and file upload

| Task | Owner | Days |
|---|---|---|
| Supabase project setup (DB + storage + RLS) | Eng | 1 |
| Clerk auth integration (email + Google + Microsoft OAuth) | Eng | 2 |
| Org creation + user invitation flow | Eng | 2 |
| RBAC middleware (role-based route protection) | Eng | 1 |
| S3 bucket setup + upload presigned URL endpoint | Eng | 1 |
| Drag-and-drop file upload UI (with progress) | Eng | 2 |
| BullMQ queue setup + worker scaffold | Eng | 1 |
| **Design (founder):** Design system tokens, typography, color palette | Founder | 4 |
| **Design:** Figma designs for all MVP screens | Founder | 5 |

**Week 2 Checkpoint:** New user can sign up, create org, invite a teammate, and upload a contract file. File lands in S3. No AI yet.

---

## WEEKS 3–5: AI EXTRACTION ENGINE
**Goal:** The core magic — contracts go in, structured data comes out

| Task | Owner | Days |
|---|---|---|
| AWS Textract integration for PDF text extraction | Eng | 2 |
| Claude API integration + extraction prompt v1 | Eng | 2 |
| JSON schema design for all 15 extracted fields | Eng+Founder | 1 |
| Confidence scoring logic | Eng | 1 |
| Extraction result storage (DB schema) | Eng | 1 |
| Async processing pipeline: upload → queue → extract → store | Eng | 3 |
| Contract type classification (prompt-based) | Eng | 1 |
| Test against 50 real contracts; measure accuracy | Founder | 3 |
| Prompt refinement based on accuracy testing | Founder+Eng | 3 |
| Extraction error handling + "needs review" flagging | Eng | 2 |

**Week 5 Checkpoint:** Upload 10 NDAs → all get processed → key terms extracted with confidence scores. At least 8/10 extractions are 90%+ accurate.

**GO/NO-GO GATE:** If accuracy is below 85% after prompt refinement, do NOT proceed. Spend another 2 weeks on prompt engineering before building the UI layer.

---

## WEEKS 6–7: CONTRACT REPOSITORY + DETAIL VIEW
**Goal:** Users can see, filter, search, and read their contracts

| Task | Owner | Days |
|---|---|---|
| Contract list view (table, sortable, filterable) | Eng | 3 |
| Contract status logic + badges | Eng | 1 |
| Full-text search (PostgreSQL tsvector) | Eng | 2 |
| Contract detail view (split-pane: PDF + terms panel) | Eng | 3 |
| Inline field editing with change tracking | Eng | 2 |
| Google Drive OAuth + file picker integration | Eng | 3 |
| Dropbox OAuth + file picker integration | Eng | 2 |

**Week 7 Checkpoint:** Design partner can upload their full contract portfolio via Drive, see it in the repository, and view AI-extracted terms for any contract.

---

## WEEKS 8–9: ALERTS + NOTIFICATIONS
**Goal:** The system proactively tells users what they need to know

| Task | Owner | Days |
|---|---|---|
| Alert generation cron job (daily evaluation) | Eng | 2 |
| In-app notification system (bell + notification list) | Eng | 2 |
| Email alert templates (Resend integration) | Eng | 2 |
| Slack bot integration (OAuth + message posting) | Eng | 3 |
| Alert customization (per contract, per org defaults) | Eng | 2 |
| Alert management UI (snooze, resolve, assign) | Eng | 2 |

**Week 9 Checkpoint:** Upload a contract with expiration in 35 days → system generates alert → alert appears in-app AND sends email → user resolves alert → alert disappears.

---

## WEEKS 10–11: DASHBOARD + MATTER LOG
**Goal:** Complete the core product — the daily operational view

| Task | Owner | Days |
|---|---|---|
| Dashboard layout + data queries | Eng | 3 |
| Expiring contracts timeline visualization | Eng | 2 |
| Value delivered metrics (alerts fired + $ value) | Eng | 2 |
| Matter creation form | Eng | 1 |
| Matter detail view (timeline, comments, attachments) | Eng | 3 |
| Matter list view (filter, sort) | Eng | 2 |

---

## WEEK 12: POLISH + DESIGN PARTNER LAUNCH
**Goal:** Ship to 3 design partners and get real usage

| Task | Owner | Days |
|---|---|---|
| Error state handling (empty states, loading states, errors) | Eng | 2 |
| Onboarding flow polish + checklist | Eng | 2 |
| Performance audit (<2s page loads) | Eng | 1 |
| Security review (Supabase RLS testing, auth edge cases) | Eng+Founder | 2 |
| Design partner onboarding calls (screen share, 60 min each) | Founder | 3 |
| **First Stripe subscription set up** (even if free trial for design partners) | Founder | 1 |

**Week 12 Checkpoint (GO/NO-GO for Paid Launch):**
- [ ] All 3 design partners actively using the product
- [ ] Zero critical security issues
- [ ] At least 1 design partner says "this caught something I would have missed"
- [ ] AI extraction accuracy ≥ 90% on their real contracts
- [ ] No data loss incidents

---

# PART 6 — POST-MVP ROADMAP

## PHASE 2 (Months 4–8): Drive Expansion Revenue

**Priority order based on: customer requests + revenue impact + build complexity**

### P2.1 — Semantic Search Enhancement (Month 4)
Build pgvector-powered semantic search + hybrid ranking.
Cost: 2 weeks. Revenue impact: High (dramatically improves retention).

### P2.2 — Legal Request Intake Portal (Month 4–5)
Business teams submit structured requests → legal triages → tracks to completion.
This unlocks the "Business Requester" role and drives seat expansion.
Cost: 3 weeks. Revenue impact: High (seat expansion from legal team to business users).

### P2.3 — Contract Risk Score (Month 5)
AI-generated 1–10 risk score based on: missing clauses, unfavorable liability terms, one-sided indemnification, missing insurance requirements.
Displayed on contract list and detail views.
Cost: 1 week. Revenue impact: Medium (differentiator in demos).

### P2.4 — DocuSign Integration (Month 5–6)
Send contracts for signature from within LegalPulse.
Signed contracts auto-populate as new active contracts.
Cost: 2 weeks. Revenue impact: High (closes "why not DocuSign CLM?" objection).

### P2.5 — Outside Counsel Spend Analytics (Month 6–8)
LEDES e-billing file import → invoice review → spend by firm, matter type, timekeeper.
This is the second product and drives the biggest upsell.
Cost: 4 weeks. Revenue impact: Very High (+$10K/year per customer as add-on).

### P2.6 — SSO/SAML Integration (Month 7)
Azure AD + Okta SSO via Clerk Enterprise.
Required by companies with >200 employees.
Cost: 1 week. Revenue impact: Unlocks enterprise deals.

---

## PHASE 3 (Months 9–18): The Moat

### P3.1 — AI Playbook Enforcement (Month 9–11)
Company creates its "standard positions" (e.g., "our max liability cap is 1× fees").
AI reviews incoming third-party contracts against playbook.
Flags deviations with suggested redlines.
This is the highest-value AI feature and the biggest moat.
Cost: 6 weeks (fine-tuning + UI). Revenue impact: Justifies Enterprise tier upgrade.

### P3.2 — Outside Counsel Invoice AI Review (Month 10–12)
AI reviews law firm invoices against billing guidelines.
Flags: vague entries, duplicate billing, administrative tasks billed at attorney rates, rate violations.
Disputes generated automatically.
Average customer recovers $20K–$80K/year. Sells itself.
Cost: 5 weeks. Revenue impact: Very High (standalone value prop).

### P3.3 — Contract Generation from Templates (Month 12–14)
GC builds approved templates (NDA, MSA, SOW) with variable fields.
Business team generates contract from form → routed to legal for review → sent for signature.
Closes the full contract lifecycle loop.
Cost: 4 weeks. Revenue impact: Medium (retention) + seat expansion.

### P3.4 — API Platform (Month 15–18)
Public REST API for contract data.
Enables: Salesforce sync (customer contracts), HR system sync (employment contracts), custom integrations.
Cost: 4 weeks (plus ongoing support). Revenue impact: Unlocks enterprise deals + API usage revenue.

### P3.5 — M&A Due Diligence Module (Month 16–18)
Separate product pitched to PE-backed companies.
Upload 500–10,000 contracts → AI review → due diligence report in 24 hours.
Project-based pricing ($5K–$25K per engagement).
Cost: 6 weeks. Revenue impact: High new revenue stream.

---

# PART 7 — GO/NO-GO DECISION GATES

Use these checkpoints to make rational, evidence-based decisions at each phase transition.

## Gate 1: Build the MVP (Before Week 1 of coding)
**Requirements to proceed:**
- [ ] 15 problem validation interviews completed
- [ ] 7+ confirm contract chaos is a top-3 pain
- [ ] 3 design partners have signed an LOI
- [ ] AI extraction accuracy ≥ 90% on 30 test contracts
- [ ] You (or co-founder) have personally used 2–3 competitor products

**If gate fails:** More interviews, different positioning, or different ICP. Do not build.

## Gate 2: Paid Launch (After Week 12, design partner feedback in hand)
**Requirements to proceed:**
- [ ] All 3 design partners actively using the product weekly
- [ ] At least 1 design partner says "I would pay [specific amount] for this"
- [ ] At least 1 design partner has a concrete "this saved me [X]" story
- [ ] Zero data security incidents
- [ ] Extraction accuracy ≥ 90% on real customer contracts (not just test data)

**If gate fails:** Stay in design partner mode for another 4 weeks. Fix what's broken.

## Gate 3: Phase 2 Build (Month 4–5)
**Requirements to proceed:**
- [ ] 5 paying customers (not design partners, not free trials — actual paying)
- [ ] MRR ≥ $10,000
- [ ] Churn: 0 customers churned for product reasons
- [ ] Top 3 Phase 2 features validated by ≥ 3 customers saying "I would upgrade for this"

**If gate fails:** More sales, not more building. The product is good enough. The GTM needs work.

## Gate 4: Series Seed Fundraise (Month 6)
**Requirements to raise:**
- [ ] $300K–$500K ARR (annualized from current MRR)
- [ ] 10–20 paying customers
- [ ] Net Revenue Retention ≥ 100% (no one is downgrading)
- [ ] Clear path to $1M ARR: you know exactly which customers you're selling to next

---

# PART 8 — COST & BUDGET MODEL

## MVP Build Budget (12 Weeks)

| Line Item | Monthly | Total (3 months) |
|---|---|---|
| Senior engineer (contract/fractional) | $15,000 | $45,000 |
| Founder salary (keep minimal) | $5,000 | $15,000 |
| Supabase Pro | $25 | $75 |
| AWS S3 + Textract (dev/test) | $200 | $600 |
| Claude API (dev/test, ~2,000 contracts) | $300 | $900 |
| Clerk.dev | $25 | $75 |
| Railway/Render (backend hosting) | $50 | $150 |
| Vercel (frontend hosting) | $20 | $60 |
| Figma | $16 | $48 |
| Miscellaneous (domains, tools) | $100 | $300 |
| **Total MVP Build** | | **~$63,000** |

## AI Costs at Scale

| Customers | Avg Contracts/Customer | Monthly Extractions | Claude Cost/Mo | Embedding Cost/Mo |
|---|---|---|---|---|
| 10 | 500 | 5,000 (new uploads) | ~$500 | ~$50 |
| 100 | 500 | 50,000 | ~$5,000 | ~$500 |
| 500 | 500 | 250,000 | ~$25,000 | ~$2,500 |

AI costs as % of revenue: ~4–6% at scale (acceptable; include in gross margin calc).

## Revenue Projection

| Month | Customers | MRR | ARR |
|---|---|---|---|
| 3 | 0 (design partners) | $0 | $0 |
| 6 | 8 paying | $23,333 | $280K |
| 9 | 18 | $52,500 | $630K |
| 12 | 35 | $102,083 | $1.225M |
| 18 | 80 | $233,333 | $2.8M |
| 24 | 160 | $466,667 | $5.6M |

Assumptions: Average ACV $35K (Professional tier), 10% monthly growth after launch, <5% annual churn.

---

# APPENDIX A — DATA SCHEMA (MVP)

```sql
-- Organizations
CREATE TABLE orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  plan_tier TEXT DEFAULT 'starter',
  stripe_customer_id TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'attorney', 'paralegal', 'requester', 'readonly')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  contract_type TEXT,
  status TEXT DEFAULT 'processing',
  file_url TEXT NOT NULL,
  file_size_bytes INTEGER,
  counterparty_name TEXT,
  counterparty_type TEXT,
  effective_date DATE,
  expiration_date DATE,
  auto_renewal BOOLEAN,
  auto_renewal_terms TEXT,
  opt_out_deadline DATE,
  opt_out_notice_days INTEGER,
  governing_law TEXT,
  contract_value DECIMAL,
  payment_terms TEXT,
  liability_cap TEXT,
  indemnification_party TEXT,
  termination_for_convenience BOOLEAN,
  termination_notice_days INTEGER,
  risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 10),
  ai_extraction_raw JSONB,     -- full AI response stored for debugging
  ai_extraction_confidence JSONB, -- confidence score per field
  human_edits JSONB DEFAULT '{}', -- overrides to AI extraction
  tags TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES users(id),
  notes TEXT,
  embedding VECTOR(3072),       -- pgvector embedding for semantic search
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract Versions (for amended/restated contracts)
CREATE TABLE contract_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  change_description TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'expiration', 'opt_out_deadline', 'payment', 'custom'
  trigger_date DATE NOT NULL,
  days_before INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'snoozed', 'resolved'
  resolved_by UUID REFERENCES users(id),
  resolution_note TEXT,
  resolved_at TIMESTAMPTZ,
  snoozed_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matters
CREATE TABLE matters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  matter_type TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  description TEXT,
  owner_id UUID REFERENCES users(id),
  estimated_budget DECIMAL,
  actual_spend DECIMAL DEFAULT 0,
  estimated_close_date DATE,
  closed_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matter Activity (immutable log)
CREATE TABLE matter_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  activity_type TEXT NOT NULL, -- 'comment', 'status_change', 'file_uploaded', etc.
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log (immutable, never delete)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (critical for multi-tenancy)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contracts_org_isolation ON contracts
  USING (org_id = current_setting('app.current_org_id')::UUID);
-- Apply same pattern to all org-scoped tables
```

---

# APPENDIX B — KEY METRICS TO TRACK FROM DAY 1

**Acquisition:**
- Leads from LinkedIn / content / referrals (track source)
- Demo → trial conversion rate (target: 60%+)
- Trial → paid conversion rate (target: 40%+)

**Engagement (leading indicators of retention):**
- Contracts uploaded per org per week
- DAU/WAU ratio (lawyers are weekly, not daily users — target: 3 logins/week per attorney)
- Alerts resolved within 7 days of firing (target: 80%+)
- Searches per session

**Retention:**
- Monthly churn rate (target: <2%)
- Net Revenue Retention (target: >115% by month 12)
- Time to first "aha moment": upload first contract + view extracted terms (target: <30 min after signup)

**AI Quality:**
- Extraction accuracy: % of AI-extracted fields not edited by humans (target: >90%)
- User edits per contract (lower = better AI)
- Semantic search relevance: did user click a result within top 5? (target: >70%)

**Business:**
- MRR, ARR, MRR growth rate
- CAC by channel
- LTV (projected)
- Payback period

---

*This document is your build Bible. Update it weekly as you learn from customers. The product that ships in Week 12 will differ from this spec — that's expected and healthy. The purpose of this document is to give you a starting point rigorous enough that you make deliberate decisions, not accidental ones.*
