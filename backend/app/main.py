import os
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.api.v1.api import api_router
from app.core.security import get_password_hash
from app.models.super_admin import SuperAdmin
from app.models.feature import Feature
from app.models.audit import AuditLog

# Create tables in PostgreSQL / SQLite
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ApexPOS Super Admin SaaS Platform",
    version="1.0.0",
    description="Multi-Tenant Restaurant SaaS Platform Management Panel"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "ApexPOS Super Admin SaaS Platform",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

def initialize_superadmin_and_features():
    """
    Initializes default Super Admin account and standard modular feature registry.
    Strictly seeds ZERO restaurants (database contains 0 restaurants initially).
    """
    db = SessionLocal()
    try:
        # 1. Super Admin Account
        sa = db.query(SuperAdmin).filter(SuperAdmin.username == "admin").first()
        if not sa:
            sa = SuperAdmin(
                username="admin",
                email=settings.SUPERADMIN_EMAIL,
                hashed_password=get_password_hash(settings.SUPERADMIN_PASSWORD),
                full_name="Software Platform Administrator",
                is_active=True
            )
            db.add(sa)
            db.commit()

        # 2. Modular Feature Registry (Section G)
        default_features = [
            {
                "feature_key": "pos_ordering",
                "name": "POS Order Management",
                "description": "Ultra-fast keyboard-driven order taking and table dispatch.",
                "category": "Core Operations",
                "is_system_default": True
            },
            {
                "feature_key": "kot_printing",
                "name": "KOT Printing",
                "description": "Kitchen Order Ticket generation with routing to thermal kitchen printers.",
                "category": "Kitchen Operations",
                "is_system_default": True
            },
            {
                "feature_key": "cash_memo",
                "name": "Cash Memo & Invoicing",
                "description": "GST-compliant thermal bill printing, settlement, and split billing.",
                "category": "Billing Operations",
                "is_system_default": True
            },
            {
                "feature_key": "customer_crm",
                "name": "Customer Management & Credit",
                "description": "Customer profiles, credit khata tracking, and repeat guest history.",
                "category": "Marketing & CRM",
                "is_system_default": True
            },
            {
                "feature_key": "advanced_reports",
                "name": "Advanced Reports & Analytics",
                "description": "Daily sales summaries, hourly volume, dish popularity, and tax ledger.",
                "category": "Analytics",
                "is_system_default": True
            },
            {
                "feature_key": "multi_kitchen_printers",
                "name": "Multiple Kitchen Printers Routing",
                "description": "Route starters to tandoor/bar and main course to central kitchen.",
                "category": "Hardware Integration",
                "is_system_default": True
            },
            {
                "feature_key": "inventory_management",
                "name": "Inventory & Stock Control",
                "description": "Raw material stock deduction and ingredient wastage tracking.",
                "category": "Inventory",
                "is_system_default": True
            }
        ]

        for f_data in default_features:
            existing = db.query(Feature).filter(Feature.feature_key == f_data["feature_key"]).first()
            if not existing:
                f_obj = Feature(**f_data)
                db.add(f_obj)
        
        db.commit()

    finally:
        db.close()

initialize_superadmin_and_features()
