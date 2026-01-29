# 📋# AAA Ads CRM - Project Checklistk Breakdown

> **Project:** Universal Ad-Tracker & Dynamic CRM Platform  
> **Start Date:** 2026-01-29  
> **Target:** 14 Days MVP

---

## 🛠 Phase 0: Foundation Setup (Day 1-2)

### 0.1 Project Initialization
- [x] Create GitHub repository
- [x] Setup `.gitignore` for Next.js + Prisma + Docker
- [x] Initialize Next.js 14+ with App Router
  - [x] TypeScript strict mode enabled
  - [x] ESLint + Prettier configuration
  - [x] Path aliases (`@/` for src)
- [x] Initial commit & push to GitHub

### 0.2 UI Framework Setup
- [x] Install & configure Tailwind CSS
- [x] Setup Shadcn/UI
  - [x] Initialize with `npx shadcn@latest init`
  - [x] Install base components: Button, Input, Card, Dialog, Table, Dropdown
- [ ] Create base design tokens (colors, typography)
- [x] Create reusable layout components
  - [x] Sidebar navigation (Dashboard Layout)
  - [x] Header with user menu
  - [x] Page container

### 0.3 Database Setup
- [x] Create `docker-compose.yml` for PostgreSQL 16
- [x] Setup Prisma ORM
  - [x] Initialize Prisma: `npx prisma init`
  - [x] Configure database connection
- [x] Create complete Prisma schema
  - [x] User model (with roles)
  - [x] Client model (multi-tenant)
  - [x] Pipeline model (JSONB stages)
  - [x] Campaign model
  - [x] AdSpendLog model
  - [x] Lead model
  - [x] MappingConfig model
- [x] Run initial migration
- [/] Create seed data script (Prisma 7 compatibility issue marked for review)

### 0.4 Authentication
- [x] Install NextAuth.js v5 (Auth.js)
- [x] Configure credentials provider (email/password)
- [x] Create auth middleware
- [x] Implement role-based access control
  - [x] SuperAdmin: Full access
  - [x] ClientAdmin: Client-scoped access
  - [x] CS: Lead entry only
- [x] Create login page
- [ ] Create register page (SuperAdmin only)
- [x] Session management

### 0.5 Rebranding & UI Polish (New)
- [x] Rename app to "Asoy Analytics Ads"
- [x] Update Logo (Dragon Icon)
- [x] Remove Demo Credentials from Login UI
- [x] Implement Light/Dark Mode (next-themes)
- [x] Redesign Login Page (Clean/Glassmorphism with Theme Toggle)
- [x] Fix Logout functionality (Server Action)
- [x] Dashboard UI Clean-up (Remove subtitle, fixes)
- [x] Header Role Display (Dynamic user role badges)

---

## ⚙️ Phase 1: Client & Pipeline Management (Day 3-4)


### 1.1 Client Management
- [x] API Routes
  - [x] `GET /api/clients` - List all clients
  - [x] `POST /api/clients` - Create client
  - [x] `GET /api/clients/[id]` - Get client detail (Not needed for MVP, included in list)
  - [x] `PUT /api/clients/[id]` - Update client
  - [x] `DELETE /api/clients/[id]` - Delete client
- [x] UI Pages
  - [x] `/clients` - Client list with DataTable
  - [x] `/clients/new` - Create client form (Dialog)
  - [x] Edit & Delete Actions with Alert Confirmation
  - [x] Updated Column Headers (Id-Client, Business Model, Handler)

### 1.1b User Management (New)
- [x] API Routes (`/api/users`)
  - [x] GET (List), POST (Create), PUT (Update), DELETE (Remove)
- [x] UI Pages (`/users`)
  - [x] User DataTable
  - [x] Add/Edit User Dialog with Role & Client assignment logic
  - [x] Profile Settings with Avatar Upload
    - [x] Base64 Image Upload
    - [x] Profile Picture Preview & Validation
    - [x] Remove Picture functionality


### 1.2 Pipeline Builder
- [x] API Routes
  - [x] `GET /api/pipelines` - List pipelines (by client)
  - [x] `POST /api/pipelines` - Create pipeline
  - [x] `GET /api/pipelines/[id]` - Get pipeline detail
  - [x] `PUT /api/pipelines/[id]` - Update pipeline
  - [x] `DELETE /api/pipelines/[id]` - Delete pipeline
- [x] UI Pages
  - [x] `/pipelines` - Pipeline list
  - [x] `/pipelines/builder` (implemented as `/pipelines/new` and `/pipelines/[id]`)
- [x] Features
  - [x] Reorder stages (Up/Down buttons)
  - [x] Stage properties: name, color, goal status
  - [x] Custom fields schema builder: text, number, select, date
  - [x] Validation with Zod
  - [x] Set default pipeline per client

---

## 📥 Phase 2: Ingestion Engine (Day 5-6)

### 2.1 Smart CSV/Excel Importer
- [x] Install SheetJS (xlsx)
- [x] API Routes
  - [x] `POST /api/spend/import` - Execute import with auto-campaign creation
  - [x] `GET /api/import/history` - Import history
- [x] UI Pages
  - [x] `/spend/import` - Import wizard
- [x] Features
  - [x] Step 1: File Upload (Multi-sheet support)
  - [x] Step 2: Sheet Selection
  - [x] Step 3: Data Preview
  - [x] Step 4: Column Mapping (Platform templates)
  - [x] Step 5: Validation (Zod + Client side)
  - [x] Step 6: Import Execution

### 2.2 Mapping Configuration
- [ ] API Routes
  - [ ] `GET /api/mappings` - List saved mappings
  - [ ] `POST /api/mappings` - Save mapping
  - [ ] `DELETE /api/mappings/[id]` - Delete mapping
- [ ] Features
  - [ ] Auto-detect matching columns
  - [ ] Platform-specific defaults
  - [ ] Client-specific mappings

### 2.3 Campaign Management
- [x] API Routes
  - [x] `GET /api/campaigns` - List campaigns
  - [x] `PUT /api/campaigns/[id]` - Update campaign
  - [x] `POST /api/campaigns/merge` - Merge campaigns
- [x] UI Pages
  - [x] `/campaigns` - Campaign master list
- [x] Features
  - [x] Auto-detect new campaigns from import
  - [x] Campaign rename
  - [x] Campaign merge (combine multiple into one)
  - [x] Campaign aliases (for matching)
  - [x] Deactivate campaign

---

## 📊 Phase 3: Data Grid & Inline Editing (Day 7-8)

### 3.1 TanStack Table Setup
- [ ] Install @tanstack/react-table
- [ ] Create reusable DataTable component
- [ ] Features
  - [ ] Column definitions
  - [ ] Sorting (multi-column)
  - [ ] Filtering (column + global)
  - [ ] Pagination
  - [ ] Column visibility toggle
  - [ ] Column resizing

### 3.2 Ad Spend Grid
- [ ] API Routes
  - [ ] `GET /api/spend` - List spend data (with filters)
  - [ ] `PUT /api/spend/[id]` - Update single record
  - [ ] `PUT /api/spend/bulk` - Bulk update
  - [ ] `DELETE /api/spend/[id]` - Delete record
- [ ] UI Pages
  - [ ] `/spend` - Spend data grid
- [ ] Features
  - [ ] Inline cell editing
    - [ ] Click to edit
    - [ ] Enter to save
    - [ ] Escape to cancel
  - [ ] Auto-save (debounced 500ms)
  - [ ] Edit indicator (unsaved changes)
  - [ ] Undo last change
  - [ ] Date range filter
  - [ ] Platform filter
  - [ ] Campaign filter
  - [ ] Export to Excel

### 3.3 Performance Optimization
- [ ] Virtual scrolling for 1000+ rows
- [ ] Memoized cell renderers
- [ ] Optimistic updates
- [ ] Batch API calls

---

## 👥 Phase 4: CRM & Lead Entry (Day 9-10)

### 4.1 Lead Entry Form
- [ ] API Routes
  - [x] `POST /api/leads` - Create lead
  - [x] `GET /api/leads` - List leads
  - [x] `PUT /api/leads/[id]` - Update lead
  - [ ] `PUT /api/leads/[id]/stage` - Update stage
  - [x] `DELETE /api/leads/[id]` - Delete lead
- [ ] UI Pages
  - [x] `/leads` - Lead list/kanban (Placeholder + Import Trigger)
  - [x] `/leads/new` - Lead entry form
  - [ ] `/leads/[id]` - Lead detail
- [x] Features
  - [x] Source dropdown (Meta, GAds, LinkedAds)
  - [x] CS Number field for tracking CS assignments
  - [x] Stage selection from pipeline
  - [ ] Quick notes
  - [ ] Revenue/value input

### 4.2 Lead Views
- [x] List View
  - [x] DataTable with all leads
  - [x] Stage filter
  - [ ] Date range filter
  - [x] Search by name/phone
- [x] Kanban View
  - [x] Columns = Pipeline stages
  - [x] Drag & drop to change stage
  - [x] Lead cards with summary
  - [x] Stage count indicators

### 4.3 Lead Import (Bonus)
- [x] Bulk import leads from Excel
- [x] Column mapping similar to spend import

---

## 📈 Phase 5: Intelligence Dashboard (Day 11-14)

### 5.1 Dashboard API
- [ ] API Routes
  - [ ] `GET /api/analytics/overview` - Summary metrics
  - [ ] `GET /api/analytics/campaigns` - Per-campaign breakdown
  - [ ] `GET /api/analytics/trends` - Time-series data
- [ ] Aggregation Queries
  - [ ] Total Spend
  - [ ] Total Leads
  - [ ] Leads per stage
  - [ ] Total Revenue
  - [ ] CPPL (Cost Per Potential Lead)
  - [ ] ROAS (Return on Ad Spend)
  - [ ] CPL (Cost Per Lead)

### 5.2 Dashboard UI
- [ ] UI Pages
  - [ ] `/dashboard` - Main dashboard
- [ ] Components
  - [ ] Metric cards (with trend indicators)
  - [ ] Campaign performance table
  - [ ] Spend vs Revenue chart (line/bar)
  - [ ] Lead funnel visualization
  - [ ] Stage distribution (pie/donut)
- [ ] Features
  - [ ] Date range picker
  - [ ] Client filter (SuperAdmin)
  - [ ] Platform filter
  - [ ] Campaign filter
  - [ ] Export report to PDF/Excel

### 5.3 Dynamic Columns
- [ ] Table columns adjust based on Pipeline stages
- [ ] Show lead count per stage
- [ ] Conversion rate between stages

---

## 🐳 Phase 6: Deployment & Polish

### 6.1 Dockerization
- [ ] Create production Dockerfile
- [ ] Multi-stage build (minimize image size)
- [ ] Environment variable configuration
- [ ] Health check endpoint

### 6.2 Performance Testing
- [ ] Test with 1000+ spend records
- [ ] Test with 500+ leads
- [ ] Measure page load times
- [ ] Query optimization if needed

### 6.3 Final Testing
- [ ] End-to-end test: Create client with custom pipeline
- [ ] End-to-end test: Import CSV, verify data
- [ ] End-to-end test: Inline edit spend
- [ ] End-to-end test: CS input lead, verify dashboard
- [ ] Cross-browser testing

---

## 📝 Notes

- Keep commits atomic and well-documented
- Update CHANGELOG.md after each major feature
- Document API endpoints in README or Swagger
