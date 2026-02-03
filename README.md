# 🚀 Asoy Analytics Ads

> Universal Ad-Tracker & Dynamic CRM Platform

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Shadcn/UI](https://img.shields.io/badge/UI-Shadcn-000000?style=flat-square&logo=shadcnui)](https://ui.shadcn.com/)

---

## 📋 Overview

**Asoy Analytics Ads** (sebelumnya AAA Ads CRM) adalah platform Business Intelligence & CRM multi-tenant yang dirancang untuk memonitor efektivitas iklan (Ad Spend) terhadap hasil bisnis nyata (Revenue/Leads).

### Core Features (Implemented)

- 🏢 **Multi-Tenant Architecture**: Satu aplikasi melayani banyak klien dengan isolasi data.
- 🔐 **Robust Authentication**: Sistem login aman menggunakan NextAuth.js v5 dengan Google OAuth & Credentials, serta Role-Based Access Control (Super Admin, Client Admin, CS).
- 🎨 **Modern UI/UX**: Desain Glassmorphism yang bersih dengan dukungan **Dark/Light Mode** penuh.
- 👥 **User Management**: Manajemen pengguna terpusat dengan role yang fleksibel.
- 📊 **Interactive Analytics**: Dashboard performa iklan dengan filter multi-platform (Meta, Google, TikTok) dan fitur export laporan.
- 📈 **Advanced Metrics**: Real-Time CPPL, ROAS, dan Revenue tracking dengan Dynamic Column support.
- 📊 **Excel-Like Grid**: Edit data inline seperti spreadsheet dengan TanStack Table.
- 🔄 **Dynamic Pipeline**: Custom alur bisnis per klien dengan stage management.
- 📱 **Responsive Design**: Tampilan optimal di desktop dan mobile.

---

## 🛠 Tech Stack

| Layer          | Technology               | Status    |
| -------------- | ------------------------ | --------- |
| **Framework**  | Next.js 14+ (App Router) | ✅ Active |
| **Language**   | TypeScript (Strict Mode) | ✅ Active |
| **Database**   | Supabase (PostgreSQL 16) | ✅ Active |
| **ORM**        | Prisma                   | ✅ Active |
| **Styling**    | Tailwind CSS v4          | ✅ Active |
| **Components** | Shadcn/UI                | ✅ Active |
| **Theming**    | next-themes (Light/Dark) | ✅ Active |
| **Auth**       | NextAuth.js v5 (Auth.js) | ✅ Active |
| **Icons**      | Lucide React             | ✅ Active |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Git
- Supabase Account (or local PostgreSQL)

### Installation

```bash
# Clone repository
git clone https://github.com/dena-pratama/AAA-ads-T-dyn-CRM.git
cd AAA-ads-T-dyn-CRM

# Install dependencies
npm install

# Setup Environment Variables
cp .env.example .env
# (Isi DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, dll)

# Setup database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth routes (Login)
│   │   ├── (dashboard)/        # Main app routes
│   │   ├── api/                # Backend API routes
│   │   ├── actions/            # Server Actions
│   │   └── layout.tsx          # Root layout with ThemeProvider
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable Shadcn components
│   │   ├── layout/             # Layout components (Header, Sidebar)
│   │   └── mode-toggle.tsx     # Theme switcher
│   ├── lib/                    # Utilities & Config (Prisma, Auth)
│   └── hooks/                  # Custom React Hooks
├── prisma/
│   └── schema.prisma           # Database schema definition
├── public/                     # Static assets (Logos)
└── package.json
```

---

## 📊 Database Schema Highlights

```mermaid
erDiagram
    Client ||--o{ User : manages
    Client ||--o{ Pipeline : defines
    Client ||--o{ Campaign : runs

    User {
        string role "SUPER_ADMIN | CLIENT_ADMIN | CS"
        string email
        string password
    }

    Pipeline {
        json stages "Dynamic stages config"
    }
```

---

## 📝 Documentation

- [TASKS.md](./TASKS.md) - Rincian tugas pengembangan
- [CHANGELOG.md](./CHANGELOG.md) - Riwayat perubahan versi

---

## 👥 Team

- **Project Owner:** Dena Pratama
- **Development:** AI-Assisted (Antigravity Agent)
