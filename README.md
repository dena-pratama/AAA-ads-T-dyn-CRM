# 🚀 AAA Ads CRM

> Universal Ad-Tracker & Dynamic CRM Platform

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

---

## 📋 Overview

**AAA Ads CRM** adalah platform Business Intelligence & CRM multi-tenant untuk memonitor efektivitas iklan (Ad Spend) terhadap hasil bisnis nyata (Revenue/Leads).

### Core Features

- 🏢 **Multi-Tenant**: Satu aplikasi untuk banyak klien
- 📥 **Smart CSV Import**: Upload & mapping data iklan dari berbagai platform
- 📊 **Excel-Like Grid**: Edit data inline seperti spreadsheet
- 🔄 **Dynamic Pipeline**: Custom alur bisnis per klien
- 📈 **Real-Time Analytics**: CPPL, ROAS, dan metrik kustom

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (Strict) |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| UI | Shadcn/UI + Tailwind CSS |
| Data Grid | TanStack Table |
| File Parsing | SheetJS (xlsx) |
| Auth | NextAuth.js v5 |
| Deployment | Docker |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/dena-pratama/AAA-ads-T-dyn-CRM.git
cd AAA-ads-T-dyn-CRM

# Install dependencies
npm install

# Start database
docker-compose up -d

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth routes
│   │   ├── (dashboard)/        # Protected routes
│   │   └── api/                # API routes
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn components
│   │   └── data-table/         # Table components
│   ├── lib/                    # Utilities
│   └── hooks/                  # Custom hooks
├── prisma/
│   └── schema.prisma           # Database schema
├── docker-compose.yml
└── package.json
```

---

## 📊 Database Schema

```mermaid
erDiagram
    Client ||--o{ User : has
    Client ||--o{ Pipeline : has
    Client ||--o{ Campaign : has
    Client ||--o{ AdSpendLog : has
    Client ||--o{ Lead : has
    
    Pipeline {
        string id PK
        string name
        json stages
        json customFields
    }
    
    AdSpendLog {
        string id PK
        date date
        string platform
        string campaignName
        decimal spend
        int impressions
        int clicks
    }
    
    Lead {
        string id PK
        string customerName
        string phone
        string campaignName
        string currentStage
        json customData
        decimal value
    }
```

---

## 🔐 Authentication

### Roles

| Role | Access |
|------|--------|
| SuperAdmin | Full system access |
| ClientAdmin | Client-scoped access |
| CS | Lead entry only |

---

## 📝 Documentation

- [TASKS.md](./TASKS.md) - Detailed development tasks
- [CHANGELOG.md](./CHANGELOG.md) - Development history

---

## 📄 License

Private - All Rights Reserved

---

## 👥 Team

- **Project Owner:** Dena Pratama
- **Development:** AI-Assisted (AAA Ads CRM)
