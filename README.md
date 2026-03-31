# Uzloads — Enterprise TMS & Payroll System

A high-end Transportation Management System (TMS) for managing logistics, driver documentation, and automated payroll settlements.

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Zustand + React Query
- **Backend**: Python FastAPI + SQLAlchemy + PostgreSQL
- **PDF Engine**: WeasyPrint for Driver Pay Reports
- **Auth**: JWT-based authentication

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

### 1. Database
```bash
createdb uzloads
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Edit DATABASE_URL and SECRET_KEY
alembic upgrade head
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env      # Edit VITE_API_URL if needed
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Features

### Load Management
- Full CRUD for loads with real-time status tracking
- Columns: Load #, Pickup/Delivery (Dates & Cities), Driver, Broker, Rate, Status
- Filters: Status, Date Range, Driver
- Attachments: Rate Confirmation, BOL, Lumper Receipts (per load)

### Driver & Equipment Database
- Driver profiles: name, phone, email, truck/trailer assignment
- Compliance tracking: CDL, Medical Card, Drug Test, MVR with color-coded expiry indicators
- Pay configuration: Freight % (company drivers vs owner-operators)

### Automated Payroll (Settlement Engine)
- Filter delivered loads by Month/Phase
- Auto-calculate: Total Rates → Apply Driver % → Subtract Deductions
- Deductions: Fuel, ELD, Insurance, IFTA, Admin Fees
- One-click PDF export: "Driver Pay Report" with company branding

## Project Structure
```
uzloads/
├── frontend/          # React + Vite application
│   └── src/
│       ├── components/
│       │   ├── loads/
│       │   ├── drivers/
│       │   ├── settlements/
│       │   └── shared/
│       ├── pages/
│       ├── store/     # Zustand stores
│       └── hooks/     # React Query hooks
├── backend/           # FastAPI application
│   ├── routers/       # API route handlers
│   ├── models/        # SQLAlchemy models
│   ├── schemas/       # Pydantic schemas
│   └── services/      # Business logic + PDF engine
└── docs/              # API docs, schema diagrams
```
