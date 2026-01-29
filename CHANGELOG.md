# 📜 Changelog - AAA Ads CRM

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.5.0] - 2026-01-29

### Added
- **Lead Form Enhancements**:
  - Replaced "Value (IDR)" field with "Source" dropdown (Meta, GAds, LinkedAds).
  - Added "No CS" field to track which Customer Service handles each lead.
  - Added `csNumber` column to Lead database model.
  
### Fixed
- **Leads CRUD Operations**:
  - Fixed `clientId: null` error for SUPER_ADMIN users by resolving clientId from selected pipeline.
  - Fixed Next.js 15+ `params` Promise handling in dynamic API routes.
  - Improved auth checks to allow SUPER_ADMIN access without clientId requirement.
  - Added detailed error messages for better debugging.

---

## [0.4.0] - 2026-01-29

### Added
- **Ad Spend Import Module**:
  - New `/spend` page as dashboard for ad costs.
  - New `/spend/import` wizard for bulk uploading Excel/CSV files.
  - **Multi-sheet Support**: Ability to select specific sheets from Excel workbooks.
  - **Platform Detection**: Tag imports as Meta, Google, or TikTok.
  - **Auto-Campaign Creation**: Importing spend for a new campaign auto-creates it in DB.
- **Backend**:
  - `POST /api/spend/import`: Robust endpoint with Zod validation.
  - `xlsx` library integration.

## [Unreleased]

### Added
- **Leads Module**: Created dedicated Leads page (`/leads`) with "Import" trigger.
- **Import Wizard**: Implemented multi-step wizard for bulk importing leads from Excel/CSV (`/pipelines/[id]/import`).
- **Dynamic Mapping**: Added `ColumnMapper` to map file headers to System & Custom Fields.
- **Bulk API**: Created optimized API using `prisma.$transaction` and `createMany` logic for fast data insertion.
- **Dashboard**: Integrated Leads entry point in the main Dashboard.

### Changed
- **Pipeline Details**: Refactored to use Tabs (Leads vs Settings) - *Reverted to keep Settings clean, moved Leads to specialized page*.
- **Navigation**: Added "Back to Dashboard" button on Leads page for better UX.

### Fixed
- **Pipeline Access**: Fixed `async params` issue in Next.js 16 dynamic routes.
- **UI Consistency**: Standardized `AnimatedBeam` and specific UI elements.

### 🚀 Added
- Initial project repository setup
- Comprehensive `.gitignore` for Next.js + Prisma + Docker
- **Next.js 14+ project** with App Router & TypeScript strict mode
- **Tailwind CSS v4** integration
- **Shadcn/UI** with 21 components:
  - button, input, card, dialog, table, dropdown-menu
  - select, tabs, sonner, separator, badge, avatar
  - label, sheet, scroll-area, command, popover
  - calendar, checkbox, form, skeleton
- **Prisma ORM** setup with complete schema:
  - User (multi-role: SuperAdmin, ClientAdmin, CS)
  - Client (multi-tenant)
  - Pipeline (dynamic stages with JSONB)
  - Campaign (with merge/alias support)
  - AdSpendLog (ad spend import data)
  - Lead (CRM with dynamic custom fields)
  - MappingConfig (CSV import mappings)
  - LeadStageHistory (audit trail)
  - ImportHistory (batch tracking)
- Docker Compose for PostgreSQL 16
- Environment configuration (`.env`, `.env.example`)
- **Supabase** cloud PostgreSQL integration
- **NextAuth.js v5** authentication:
  - Credentials provider (email/password)
  - JWT session strategy
  - Role-based access control (SuperAdmin, ClientAdmin, CS)
  - Auth middleware for route protection
  - Login page with modern glassmorphism UI
  - Dashboard page with quick actions
- **Fix:** Refactored Auth architecture for Edge Runtime compatibility
  - Split config into `auth.config.ts` (Edge-safe) and `lib/auth.ts` (Node.js)
  - Fixed Middleware 500 error caused by Prisma import in Edge environment
- Fixed module resolution error on Login page.
- Fixed dashboard layout issues in Light mode.
- Fixed `Next.js 15` async params issue in API routes.
- **Fixed:** Pipeline View/Edit permissions for Client Admin (Read-Only mode enabled).
- **Fixed:** Async params runtime error in dynamic routes (Next.js 15+ breaking change).

### Changed
- **Rebranding & UI Overhaul:**
  - Renamed application to **"Asoy Analytics Ads"**
  - Updated application logo (Dragon Icon)
  - Implemented **Light/Dark Mode** support using `next-themes`
  - Redesigned Login Page:
    - Clean, modern UI with simplified typography
    - Dynamic background animations
    - Removed demo credentials display
    - Updated copy ("Kalau login tanda nya kamu mau kerja")
  - Fixed Logout functionality using Server Actions
  - Added Theme Toggle component in Header and Login Page
- Login page now hides demo credentials.
  - Added Theme Toggle component in Header and Login Page
- **Phase 1.1 UI & Feature Enhancements:**
  - **Profile Settings:**
    - Profile picture upload (Base64) with live preview and validation.
    - Updated UI layout and improved type safety.
  - **Dashboard:** 
    - Removed redundant text and improved layout.
  - **Header:** 
    - Dynamic user role display (Super Admin vs Client Admin).
  - **Client Management:**
    - Renamed columns for better clarity (Id-Client, Business Model, Handler).
    - Updated create/edit forms to match new terminology.
  - **Code Quality:**
    - Fixed linting errors across settings and client modules.
    - Improved error handling in API calls.
  - **Pipeline Builder (Phase 1.2):**
    - **Visual Builder:** Create pipelines with custom stages (color-coded, goal tracking).
    - **Custom Field Editor:** Add dynamic fields (Text, Number, Dropdown, Date) for leads.
    - **Management:** List, Create, Edit, Delete pipelines with multi-tenant scoping.
    - **Navigation:** Added 'Pipelines' to Dashboard and Header menu.

### 📝 Documentation
- Created detailed `TASKS.md` with granular task breakdown
- Created `CHANGELOG.md` for development history

---

## Development Log

### 2026-01-29 - Project Kickoff

**Session Start:** 01:17 WIB

#### Activities:
1. **Project Planning**
   - Reviewed comprehensive project requirements document
   - Analyzed technical stack: Next.js 14+, TypeScript, PostgreSQL, Prisma, Shadcn/UI, TanStack Table
   - Created implementation plan with 6 development phases
   - Estimated 14-day timeline for MVP

2. **Repository Setup**
   - Verified GitHub connection: `https://github.com/dena-pratama/AAA-ads-T-dyn-CRM.git`
   - Branch: `main`
   - Created `.gitignore` with exclusions for:
     - Node modules & build outputs
     - Environment files
     - Prisma local DB
     - Docker volumes
     - IDE configurations

3. **Initial Commit**
   - Commit: `chore: initial commit - add .gitignore for Next.js + Prisma + Docker`

4. **Next.js Project Initialization** (Session 2 - 01:32 WIB)
   - Initialized Next.js 14+ with App Router
   - TypeScript strict mode configured
   - Installed Tailwind CSS v4
   - Setup Shadcn/UI with 21 components
   - Created Prisma schema with 9 models
   - Created Docker Compose for PostgreSQL 16
   - Note: Docker not installed on system - consider using cloud DB

#### Decisions Made:
- **Authentication:** NextAuth.js v5 (recommended)
- **File Parsing:** Client-side with SheetJS (better UX)
- **Database:** Docker Compose with PostgreSQL 16 (or cloud alternative)

#### Blockers:
- ✅ RESOLVED: Using Supabase cloud PostgreSQL instead of Docker

#### Next Steps:
- Implement authentication (NextAuth.js v5)
- Build dashboard layout

5. **Supabase Database Setup** (Session 3 - 01:48 WIB)
   - Connected to Supabase cloud PostgreSQL
   - Pushed Prisma schema successfully (9 models created)
   - Generated Prisma client
   - Verified Next.js dev server running at localhost:3000
   - Note: Seed script has Prisma 7 compatibility issues - will fix later

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 0.0.1 | 2026-01-29 | Project initialization |

---

## Contributors

- **Developer:** AI Assistant (AAA Ads CRM)
- **Project Owner:** Dena Pratama
