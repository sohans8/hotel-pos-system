# Apex POS - Commercial Multi-Tenant Restaurant POS SaaS Platform

An enterprise-grade, commercial Multi-Tenant Restaurant Point of Sale (POS) SaaS platform designed for restaurants, cafes, dhabas, food courts, and hospitality chains. Built with **FastAPI**, **React 18**, **Vite**, **Tailwind CSS**, and **SQLAlchemy**.

---

## 🌟 Architecture Overview

Apex POS is architected as an independent, commercial software product with strict multi-tenant isolation, dual-portal application hierarchy, hardware printer integration, and keyboard-first speed order entry capabilities.

```
                              ┌────────────────────────────────────────┐
                              │      Apex POS SaaS Cloud Backend       │
                              │   (FastAPI + SQLAlchemy + SQLite/PG)   │
                              └───────────────────┬────────────────────┘
                                                  │
                         ┌────────────────────────┴────────────────────────┐
                         │                                                 │
                         ▼                                                 ▼
          ┌─────────────────────────────┐                   ┌─────────────────────────────┐
          │   Platform Management       │                   │   Restaurant Admin          │
          │   (Super Admin Panel)       │                   │   Workspace & Portal        │
          │                             │                   │                             │
          │ • Tenant Provisioning       │                   │ • Clean Slate Initial State │
          │ • License & Subscriptions   │                   │ • Legal Entity & Tax Setup  │
          │ • Hardware Terminal Quotas  │                   │ • Menu & Dish Short Codes   │
          │ • Feature Entitlements      │                   │ • Dining Tables & Sections  │
          │ • Security & Audit Logs     │                   │ • Waiter Punch Codes (E01)  │
          │ • Global System Health      │                   │ • ESC/POS Thermal Printers  │
          └─────────────────────────────┘                   └─────────────────────────────┘
```

---

## 🚀 Key Modules & Milestones

### 1. Platform Management Panel (Super Admin)
Owned and operated by the software vendor to manage subscribing restaurants:
- **Tenant Management**: Onboard restaurants with unique alphanumeric IDs (`TEN-XXXXXX`), license keys, and 1-year subscription validity.
- **Hardware Terminal Enforcement**: Enforce contracted PC workstation limits (e.g. 2 counter limit; 3rd device registration triggers HTTP 403).
- **Feature Permissions Control**: Dynamic entitlement toggles (Inventory, Multi-Kitchen, Online Aggregators, Loyalty & CRM, Table QR Ordering, Advanced Analytics).
- **Subscription Lifecycle**: Manage activation, suspension, renewal, and license extension.
- **Audit Logging**: Cryptographically verifiable timestamped audit trail of all administrative actions.

### 2. Restaurant Admin Portal (Tenant Workspace)
Dedicated portal for restaurant owners and managers with strict server-side tenant isolation:
- **Clean Slate Guarantee**: Newly provisioned accounts start with strictly **0 categories, 0 items, 0 tables, 0 employees, 0 orders, and 0 bills** — no phantom demo data.
- **Guided Setup Checklist**: Step-by-step progress tracker for business profile, taxes, menu, tables, staff, and hardware.
- **Menu Management**: Categorized menu hierarchy with keyboard short codes (e.g. `PL` for Paneer Lababdar, `BR` for Butter Roti).
- **Table & Section Layout**: Configure floor plans, sections (AC Hall, Garden, Main Dining), and seating capacity.
- **Staff & Waiter Management**: Assign waiter codes (e.g. `E01`, `E02`) for ultra-fast keyboard order entry.
- **Hardware Printer Configuration**: Support for 3-inch (80mm) and 2-inch (58mm) ESC/POS thermal printers via Network IP, USB, or Bluetooth.
- **Billing & Tax Engine**: CGST (2.5%), SGST (2.5%), optional service charges, invoice rounding, and custom receipt notes.
- **Read-Only Subscription View**: Transparent inspection of plan validity, expiration, and authorized terminals.

---

## 🛠 Tech Stack

### Backend
- **Framework**: Python 3.10+ / FastAPI
- **Data Layer**: SQLAlchemy ORM with SQLite (embedded) / PostgreSQL ready
- **Validation**: Pydantic v2
- **Security**: Passlib (Bcrypt password hashing), Python-Jose (JWT cryptographic tokens)
- **CORS & Middleware**: Strict tenant-scoped dependency injection

### Frontend
- **Framework**: React 18, Vite
- **Language**: JavaScript / JSX
- **Styling**: Tailwind CSS & Lucide React Iconography
- **State & Networking**: REST API client with session-scoped token management

---

## 📦 Directory Structure

```
hotel-pos-system/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── api.py                    # Root v1 API router
│   │   │       └── endpoints/
│   │   │           ├── auth.py               # Authentication & password reset
│   │   │           ├── super_admin.py        # Super Admin platform endpoints
│   │   │           ├── restaurant_portal.py  # Restaurant management endpoints
│   │   │           └── terminals.py          # POS hardware registration
│   │   ├── core/
│   │   │   ├── config.py                     # App settings & JWT secrets
│   │   │   └── security.py                   # Cryptographic password hashing & tokens
│   │   ├── db/
│   │   │   └── session.py                    # Database connection & session factory
│   │   ├── models/
│   │   │   ├── super_admin.py                # Platform admin models
│   │   │   ├── restaurant.py                 # Tenant, subscription & license models
│   │   │   ├── terminal.py                   # Device registration & hardware audit
│   │   │   └── restaurant_config.py          # Menu, tables, employees, printers, billing
│   │   ├── schemas/
│   │   │   ├── super_admin.py                # Pydantic platform schemas
│   │   │   └── restaurant_portal.py          # Pydantic restaurant schemas
│   │   └── main.py                           # FastAPI application entry point
│   ├── requirements.txt                      # Backend dependencies
│   └── test_milestone_01.py                  # Automated verification test suite
├── src/
│   ├── components/
│   │   ├── superadmin/                       # Super Admin views & layouts
│   │   └── restaurant/                       # Restaurant Admin views & layouts
│   ├── services/
│   │   └── api.js                            # Centralized API service layer
│   ├── App.jsx                               # Root portal switcher
│   └── main.jsx                              # Vite DOM root
├── index.html                                # HTML root template
├── package.json                              # Frontend dependencies
├── vite.config.js                            # Vite development configuration
└── README.md
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hotel-pos-system
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate

# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

Start the backend API server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API docs will be available at: `http://localhost:8000/docs`

### 3. Frontend Setup
In a new terminal window:
```bash
# In the project root (hotel-pos-system):
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🔑 Default Credentials & Access

- **Super Admin Platform Panel**:
  - URL: `http://localhost:3000`
  - Username: `admin` or `superadmin@apexpos.com`
  - Default Password: `SuperAdmin@Apex2026!`

- **Restaurant Admin Portal**:
  - URL: `http://localhost:3000/#client` (or click "Switch to Restaurant Portal")
  - Log in using credentials created via the Super Admin Onboarding screen.

---

## 🧪 Automated Test Verification

Run the comprehensive multi-tenant test suite:
```bash
cd backend
python test_milestone_01.py
```
Validates zero initial state, tenant onboarding, subscription expiry computation, terminal quota locks, device revocation, and feature gates.

---

## 📄 License
Commercial proprietary software. All rights reserved.
