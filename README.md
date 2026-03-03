# Multi-Sector ERP System

A comprehensive, production-ready Enterprise Resource Planning (ERP) platform for business development across multiple industry sectors.

## Sectors Covered

| Sector | Modules |
|--------|---------|
| **Medical** | Patient Records (EMR), Appointments, Billing, Pharmacy, Lab Orders |
| **Technology** | IT Assets, Software Licenses, Sprint Planning, Help Desk |
| **Defence** | Contracts, Security Clearances, Compliance, Equipment |
| **Automobile** | Vehicle Inventory, Spare Parts, Service Orders, Dealers, Warranty |
| **Electronics** | Component Inventory, BOM, Manufacturing Orders, Quality Control |

## Core ERP Modules

- **Finance & Accounting** — Chart of Accounts, Transactions, Invoicing
- **HR & Payroll** — Employees, Departments, Payroll Runs, Leave Management
- **CRM** — Contacts, Sales Pipeline (Kanban), Deals
- **Inventory Management** — Products, Warehouses, Stock Levels, Low-Stock Alerts
- **Procurement** — Purchase Orders, Supplier Management
- **Project Management** — Projects, Tasks, Kanban Board, Sprints
- **Reports & Analytics** — Revenue trends, Sector performance, BI Charts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express.js REST API |
| Database | PostgreSQL 16 + Prisma ORM |
| Auth | JWT (stateless) |
| Charts | Recharts |
| State | Zustand |
| Deployment | Docker Compose |

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Node.js 20+ (for local development)

### Start with Docker (Recommended)

```bash
cd erp-system
docker-compose up --build
```

Services will start at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **PostgreSQL**: localhost:5432

### Seed the database

After containers are up, seed initial data:

```bash
docker exec erp_backend sh -c "cd /app && npx ts-node src/seed.ts"
```

### Default Login Credentials

| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@erp.local | admin123 | Super Admin | All sectors |
| medical@erp.local | demo123 | Manager | Medical only |
| tech@erp.local | demo123 | Manager | Technology only |
| defence@erp.local | demo123 | Manager | Defence only |
| auto@erp.local | demo123 | Manager | Automobile only |
| electronics@erp.local | demo123 | Manager | Electronics only |

## Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Edit DATABASE_URL
npx prisma migrate dev
npm run dev            # Starts on port 4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # Starts on port 3000
```

## Project Structure

```
erp-system/
├── frontend/          # Next.js 14 App
│   ├── app/
│   │   ├── (auth)/    # Login page
│   │   └── (dashboard)/  # All authenticated pages
│   │       ├── core/     # Finance, HR, CRM, Inventory, etc.
│   │       ├── medical/
│   │       ├── tech/
│   │       ├── defence/
│   │       ├── automobile/
│   │       └── electronics/
│   ├── components/
│   └── lib/
├── backend/           # Node.js Express API
│   └── src/
│       ├── routes/    # REST endpoints per module
│       ├── middleware/ # JWT auth, RBAC, error handling
│       └── seed.ts    # Database seeder
├── prisma/
│   └── schema.prisma  # Full database schema
└── docker-compose.yml
```

## API Endpoints

### Auth
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user

### Core
- `/api/finance/*` — Finance, invoices
- `/api/hr/*` — Employees, payroll, leave
- `/api/crm/*` — Contacts, deals, pipeline
- `/api/inventory/*` — Products, warehouses, stock
- `/api/procurement/*` — Purchase orders, suppliers
- `/api/projects/*` — Projects, tasks

### Sectors
- `/api/medical/*` — Medical sector
- `/api/tech/*` — Technology sector
- `/api/defence/*` — Defence sector
- `/api/automobile/*` — Automobile sector
- `/api/electronics/*` — Electronics sector

## Security

- JWT-based authentication with configurable expiry
- Role-Based Access Control (RBAC): SUPER_ADMIN, ADMIN, MANAGER, EMPLOYEE, VIEWER
- Sector-level access restrictions per user
- All routes protected by authentication middleware
- Helmet.js for HTTP security headers
- CORS configured for frontend origin

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://erp_user:erp_password@localhost:5432/erp_db
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
PORT=4000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## License

MIT — Free for commercial and personal use.
