# Build it — Project Overview

## What it is
**Build it** is a production-ready **Enterprise Resource Planning (ERP)** web application prototype. It began as a Figma design export (`figma.com/design/.../Build-it`) and has been built out into a full, interactive front-end ERP suite.

## Tech stack
- **Framework:** React 18 + TypeScript, bundled with **Vite 6**
- **Styling:** Tailwind CSS 4 + shadcn/ui component library (Radix UI primitives)
- **UI/UX:** Motion (Framer Motion) for animations, `lucide-react` + MUI icons, `sonner` toasts, `canvas-confetti`
- **Data/Charts:** Recharts for dashboards and analytics
- **Routing/Forms:** react-router 7, react-hook-form, react-dnd (drag & drop)

## Architecture
```
src/
├── app/App.tsx              # Main shell: layout, sidebar, routing between modules
├── app/components/ui/       # ~50 shadcn/ui primitives (button, table, dialog, chart, …)
├── components/              # Full ERP feature modules (Warehouse, Inventory, Procurement, …)
├── services/                # Data layer — CRUD, persistence, business logic
│   ├── erpDataServices.ts   # Core: all module types + services (Sales, CRM, Finance, HR…)
│   ├── warehouseService.ts
│   └── recordMetaService.ts
├── hooks/                   # Reusable hooks: useCRUD, useSearch, useFilter, useSort, per-module hooks
├── utils/                   # CSV / Excel / PDF export utilities
└── imports/pasted_text/     # Design specs & guidelines (markdown)
```

## ERP Modules
The app covers 20+ enterprise modules, including:
- **Dashboard** (KPIs, animated counters, charts)
- **Sales & CRM** (Leads, Customers, Sales Orders)
- **Procurement** (Vendors, Purchase Orders)
- **Inventory & Warehouse** (Stock, transactions, warehouse ops)
- **Manufacturing & Quality** (Work Orders, Inspections, CAPAs)
- **Supply Chain**
- **Finance & Payroll** (GL Accounts, Invoices, Payments)
- **HRMS** (Employees, Attendance, Leave)
- **Projects, Maintenance, IT Assets, Documents**
- **Reports, AI Assistant** (AI report modal), Admin, Customer/Vendor Portals

## Key patterns
- A generic **`useCRUD`** hook wraps every service, providing list/create/update/delete with loading/error state.
- Composable **search / filter / sort** hooks power every data table.
- Export utilities allow CSV, Excel, PDF, and print output from any module.
- Rich supporting documentation lives in the repo root (Warehouse API/Architecture, Implementation Strategy, Deployment Status, etc.).

## Running it
```bash
npm i        # install dependencies
npm run dev  # start the Vite dev server
npm run build # production build
```

---
*Generated on 2026-07-07.*
