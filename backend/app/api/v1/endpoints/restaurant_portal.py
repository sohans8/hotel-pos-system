import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, get_current_restaurant_user
from app.models.tenant import Tenant
from app.models.restaurant import Restaurant
from app.models.restaurant_user import RestaurantUser
from app.models.subscription import Subscription
from app.models.license import License
from app.models.terminal import RegisteredTerminal
from app.models.feature import Feature, RestaurantFeaturePermission
from app.models.audit import AuditLog
from app.models.restaurant_config import (
    MenuCategory,
    MenuItem,
    DiningTable,
    Employee,
    PrinterConfig,
    BillingConfig
)
from app.schemas.restaurant_portal import (
    RestaurantProfileUpdate,
    CategoryCreate,
    CategoryUpdate,
    MenuItemCreate,
    MenuItemUpdate,
    DiningTableCreate,
    DiningTableUpdate,
    EmployeeCreate,
    EmployeeUpdate,
    PrinterConfigCreate,
    PrinterConfigUpdate,
    BillingConfigUpdate
)

router = APIRouter()

# ==========================================
# 1. RESTAURANT DASHBOARD & SETUP CHECKLIST
# ==========================================

@router.get("/dashboard")
def get_restaurant_dashboard(
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    tenant_id = current_user.tenant_id
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    restaurant = tenant.restaurant

    sub = db.query(Subscription).filter(Subscription.tenant_id == tenant_id).order_by(Subscription.expiry_date.desc()).first()
    
    # Counts
    cat_count = db.query(MenuCategory).filter(MenuCategory.tenant_id == tenant_id).count()
    item_count = db.query(MenuItem).filter(MenuItem.tenant_id == tenant_id).count()
    table_count = db.query(DiningTable).filter(DiningTable.tenant_id == tenant_id).count()
    emp_count = db.query(Employee).filter(Employee.tenant_id == tenant_id).count()
    printer_count = db.query(PrinterConfig).filter(PrinterConfig.tenant_id == tenant_id).count()
    term_count = db.query(RegisteredTerminal).filter(RegisteredTerminal.tenant_id == tenant_id, RegisteredTerminal.status == "AUTHORIZED").count()
    billing_cfg = db.query(BillingConfig).filter(BillingConfig.tenant_id == tenant_id).first()

    now = datetime.now(timezone.utc)
    days_left = 0
    if sub and sub.expiry_date:
        exp = sub.expiry_date.replace(tzinfo=timezone.utc if sub.expiry_date.tzinfo is None else None)
        days_left = max(0, (exp - now).days)

    # Setup Checklist Status (Section 3)
    checklist = [
        {
            "id": "profile",
            "title": "Restaurant Profile",
            "description": "Business address, GSTIN, FSSAI, and contact details",
            "is_completed": bool(restaurant and restaurant.address and restaurant.mobile),
            "step_number": 1
        },
        {
            "id": "taxes",
            "title": "Tax & Billing Settings",
            "description": "CGST, SGST, service charge rates and receipt footer",
            "is_completed": bool(billing_cfg is not None),
            "step_number": 2
        },
        {
            "id": "categories",
            "title": "Menu Categories",
            "description": f"Organize menu sections (Currently {cat_count} categories)",
            "is_completed": cat_count > 0,
            "step_number": 3
        },
        {
            "id": "menu_items",
            "title": "Menu Dishes & Rates",
            "description": f"Add food items and short codes (Currently {item_count} items)",
            "is_completed": item_count > 0,
            "step_number": 4
        },
        {
            "id": "tables",
            "title": "Dining Tables",
            "description": f"Configure floor sections and table numbers (Currently {table_count} tables)",
            "is_completed": table_count > 0,
            "step_number": 5
        },
        {
            "id": "employees",
            "title": "Employees & Waiters",
            "description": f"Assign speed codes for order taking (Currently {emp_count} staff)",
            "is_completed": emp_count > 0,
            "step_number": 6
        },
        {
            "id": "printers",
            "title": "Receipt & Kitchen Printers",
            "description": f"Setup thermal ESC/POS printers (Currently {printer_count} printers)",
            "is_completed": printer_count > 0,
            "step_number": 7
        },
        {
            "id": "billing",
            "title": "Cash Memo Configuration",
            "description": "Verify print margins, currency symbol and receipt layout",
            "is_completed": bool(billing_cfg is not None),
            "step_number": 8
        }
    ]

    completed_steps = sum(1 for c in checklist if c["is_completed"])
    progress_percentage = int((completed_steps / len(checklist)) * 100)

    return {
        "restaurant_name": restaurant.name if restaurant else tenant.business_name,
        "restaurant_id": restaurant.restaurant_id if restaurant else tenant.tenant_id,
        "tenant_id": tenant_id,
        "owner_name": restaurant.owner_name if restaurant else current_user.full_name,
        "status": tenant.status,
        "is_first_login": current_user.must_change_password or completed_steps < len(checklist),
        "counts": {
            "categories": cat_count,
            "menu_items": item_count,
            "tables": table_count,
            "employees": emp_count,
            "printers": printer_count,
            "terminals": term_count,
            "terminal_limit": tenant.max_terminals,
            "orders": 0, # Strictly zero in this milestone
            "bills": 0,  # Strictly zero in this milestone
            "kots": 0    # Strictly zero in this milestone
        },
        "subscription": {
            "plan_name": sub.plan_name if sub else "1-Year Commercial License",
            "expiry_date": sub.expiry_date.isoformat() if sub else None,
            "days_remaining": days_left,
            "status": sub.status if sub else "ACTIVE"
        },
        "checklist": checklist,
        "setup_progress_percentage": progress_percentage,
        "completed_steps": completed_steps,
        "total_steps": len(checklist)
    }

# ==========================================
# 2. RESTAURANT PROFILE (SECTION 5)
# ==========================================

@router.get("/profile")
def get_restaurant_profile(
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    r = tenant.restaurant
    return {
        "restaurant_id": r.restaurant_id,
        "name": r.name,
        "logo_url": r.logo_url,
        "owner_name": r.owner_name,
        "address": r.address,
        "city": r.city,
        "state": r.state,
        "pincode": r.pincode,
        "country": r.country,
        "mobile": r.mobile,
        "email": r.email,
        "gstin": r.gstin,
        "fssai": r.fssai,
        "restaurant_type": r.restaurant_type,
        "created_at": r.created_at.isoformat()
    }

@router.put("/profile")
def update_restaurant_profile(
    req: RestaurantProfileUpdate,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    r = tenant.restaurant

    r.name = req.name.strip()
    tenant.business_name = req.name.strip()
    r.logo_url = req.logo_url
    r.owner_name = req.owner_name.strip()
    r.address = req.address.strip()
    r.city = req.city.strip() if req.city else r.city
    r.state = req.state.strip() if req.state else r.state
    r.pincode = req.pincode.strip() if req.pincode else r.pincode
    r.mobile = req.mobile.strip()
    r.email = req.email.strip().lower()
    r.gstin = req.gstin.strip() if req.gstin else None
    r.fssai = req.fssai.strip() if req.fssai else None

    audit = AuditLog(
        tenant_id=tenant.id,
        actor_type="RESTAURANT_USER",
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        action="PROFILE_UPDATED",
        target_type="Restaurant",
        target_id=r.restaurant_id,
        details="Restaurant owner updated business profile details"
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": "Restaurant profile updated successfully."}

# ==========================================
# 3. SUBSCRIPTION INFORMATION (SECTION 6)
# (Strictly Read-Only for Restaurant)
# ==========================================

@router.get("/subscription")
def get_restaurant_subscription(
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    r = tenant.restaurant
    sub = db.query(Subscription).filter(Subscription.tenant_id == tenant.id).order_by(Subscription.expiry_date.desc()).first()
    lic = db.query(License).filter(License.tenant_id == tenant.id).order_by(License.issued_at.desc()).first()
    active_terminals = db.query(RegisteredTerminal).filter(
        RegisteredTerminal.tenant_id == tenant.id,
        RegisteredTerminal.status == "AUTHORIZED"
    ).count()

    now = datetime.now(timezone.utc)
    days_left = 0
    if sub and sub.expiry_date:
        exp = sub.expiry_date.replace(tzinfo=timezone.utc if sub.expiry_date.tzinfo is None else None)
        days_left = max(0, (exp - now).days)

    return {
        "restaurant_id": r.restaurant_id,
        "restaurant_name": r.name,
        "subscription_id": sub.subscription_id if sub else "N/A",
        "subscription_plan": sub.plan_name if sub else "1-Year Commercial License",
        "activation_date": sub.start_date.isoformat() if sub else None,
        "expiry_date": sub.expiry_date.isoformat() if sub else None,
        "days_remaining": days_left,
        "subscription_status": sub.status if sub else "ACTIVE",
        "license_id": lic.license_id if lic else "N/A",
        "allowed_terminals": tenant.max_terminals,
        "active_terminals": active_terminals,
        "available_terminal_slots": max(0, tenant.max_terminals - active_terminals),
        "read_only_notice": "Subscription parameters and hardware terminal limits are managed by Super Administrator."
    }

# ==========================================
# 4. FEATURE PERMISSIONS (SECTION 7)
# ==========================================

@router.get("/features")
def get_restaurant_features(
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    perms = db.query(RestaurantFeaturePermission).filter(
        RestaurantFeaturePermission.tenant_id == current_user.tenant_id
    ).all()

    features_list = []
    for p in perms:
        feat = p.feature
        features_list.append({
            "feature_key": p.feature_key,
            "name": feat.name if feat else p.feature_key,
            "description": feat.description if feat else "",
            "category": feat.category if feat else "General",
            "is_enabled": p.is_enabled,
            "license_status": "AUTHORIZED" if p.is_enabled else "DISABLED_BY_SUPER_ADMIN"
        })
    
    return features_list

# ==========================================
# 5. MENU MANAGEMENT (CATEGORIES & DISHES)
# ==========================================

@router.get("/categories")
def list_categories(
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    categories = db.query(MenuCategory).filter(
        MenuCategory.tenant_id == current_user.tenant_id
    ).order_by(MenuCategory.display_order.asc(), MenuCategory.name.asc()).all()

    return [
        {
            "id": c.id,
            "name": c.name,
            "display_order": c.display_order,
            "is_active": c.is_active,
            "item_count": len(c.items)
        }
        for c in categories
    ]

@router.post("/categories")
def create_category(
    req: CategoryCreate,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    # Check duplicate name within this tenant
    existing = db.query(MenuCategory).filter(
        MenuCategory.tenant_id == current_user.tenant_id,
        MenuCategory.name == req.name.strip()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists.")

    cat = MenuCategory(
        tenant_id=current_user.tenant_id,
        name=req.name.strip(),
        display_order=req.display_order,
        is_active=req.is_active
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)

    return {"success": True, "message": f"Category '{cat.name}' created.", "id": cat.id}

@router.put("/categories/{cat_id}")
def update_category(
    cat_id: str,
    req: CategoryUpdate,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    cat = db.query(MenuCategory).filter(
        MenuCategory.id == cat_id,
        MenuCategory.tenant_id == current_user.tenant_id
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found.")

    if req.name is not None:
        cat.name = req.name.strip()
    if req.display_order is not None:
        cat.display_order = req.display_order
    if req.is_active is not None:
        cat.is_active = req.is_active

    db.commit()
    return {"success": True, "message": "Category updated."}

@router.delete("/categories/{cat_id}")
def delete_category(
    cat_id: str,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    cat = db.query(MenuCategory).filter(
        MenuCategory.id == cat_id,
        MenuCategory.tenant_id == current_user.tenant_id
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found.")

    db.delete(cat)
    db.commit()
    return {"success": True, "message": "Category deleted."}

# Menu Items
@router.get("/menu-items")
def list_menu_items(
    category_id: Optional[str] = None,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    query = db.query(MenuItem).filter(MenuItem.tenant_id == current_user.tenant_id)
    if category_id:
        query = query.filter(MenuItem.category_id == category_id)

    items = query.order_by(MenuItem.name.asc()).all()
    return [
        {
            "id": i.id,
            "category_id": i.category_id,
            "category_name": i.category.name if i.category else "Uncategorized",
            "name": i.name,
            "short_code": i.short_code,
            "price": i.price,
            "is_veg": i.is_veg,
            "is_available": i.is_available,
            "description": i.description
        }
        for i in items
    ]

@router.post("/menu-items")
def create_menu_item(
    req: MenuItemCreate,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    item = MenuItem(
        tenant_id=current_user.tenant_id,
        category_id=req.category_id,
        name=req.name.strip(),
        short_code=req.short_code.strip().upper() if req.short_code else None,
        price=max(0.0, req.price),
        is_veg=req.is_veg,
        is_available=req.is_available,
        description=req.description
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return {"success": True, "message": f"Dish '{item.name}' added to menu.", "id": item.id}

@router.put("/menu-items/{item_id}")
def update_menu_item(
    item_id: str,
    req: MenuItemUpdate,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    item = db.query(MenuItem).filter(
        MenuItem.id == item_id,
        MenuItem.tenant_id == current_user.tenant_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found.")

    if req.category_id is not None:
        item.category_id = req.category_id
    if req.name is not None:
        item.name = req.name.strip()
    if req.short_code is not None:
        item.short_code = req.short_code.strip().upper() if req.short_code else None
    if req.price is not None:
        item.price = max(0.0, req.price)
    if req.is_veg is not None:
        item.is_veg = req.is_veg
    if req.is_available is not None:
        item.is_available = req.is_available
    if req.description is not None:
        item.description = req.description

    db.commit()
    return {"success": True, "message": "Dish details updated."}

@router.delete("/menu-items/{item_id}")
def delete_menu_item(
    item_id: str,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    item = db.query(MenuItem).filter(
        MenuItem.id == item_id,
        MenuItem.tenant_id == current_user.tenant_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found.")

    db.delete(item)
    db.commit()
    return {"success": True, "message": "Dish removed from menu."}

# ==========================================
# 6. TABLE MANAGEMENT
# ==========================================

@router.get("/tables")
def list_tables(
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    tables = db.query(DiningTable).filter(
        DiningTable.tenant_id == current_user.tenant_id
    ).order_by(DiningTable.section.asc(), DiningTable.table_number.asc()).all()

    return [
        {
            "id": t.id,
            "table_number": t.table_number,
            "section": t.section,
            "capacity": t.capacity,
            "is_active": t.is_active
        }
        for t in tables
    ]

@router.post("/tables")
def create_table(
    req: DiningTableCreate,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    # Check duplicate table number
    existing = db.query(DiningTable).filter(
        DiningTable.tenant_id == current_user.tenant_id,
        DiningTable.table_number == req.table_number.strip()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Table number already exists.")

    tbl = DiningTable(
        tenant_id=current_user.tenant_id,
        table_number=req.table_number.strip(),
        section=req.section.strip() if req.section else "Main Dining",
        capacity=max(1, req.capacity),
        is_active=req.is_active
    )
    db.add(tbl)
    db.commit()
    db.refresh(tbl)

    return {"success": True, "message": f"Table '{tbl.table_number}' created.", "id": tbl.id}

@router.put("/tables/{table_id}")
def update_table(
    table_id: str,
    req: DiningTableUpdate,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    tbl = db.query(DiningTable).filter(
        DiningTable.id == table_id,
        DiningTable.tenant_id == current_user.tenant_id
    ).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found.")

    if req.table_number is not None:
        tbl.table_number = req.table_number.strip()
    if req.section is not None:
        tbl.section = req.section.strip()
    if req.capacity is not None:
        tbl.capacity = max(1, req.capacity)
    if req.is_active is not None:
        tbl.is_active = req.is_active

    db.commit()
    return {"success": True, "message": "Table updated."}

@router.delete("/tables/{table_id}")
def delete_table(
    table_id: str,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    tbl = db.query(DiningTable).filter(
        DiningTable.id == table_id,
        DiningTable.tenant_id == current_user.tenant_id
    ).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found.")

    db.delete(tbl)
    db.commit()
    return {"success": True, "message": "Table deleted."}

# ==========================================
# 7. EMPLOYEE MANAGEMENT
# ==========================================

@router.get("/employees")
def list_employees(
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    employees = db.query(Employee).filter(
        Employee.tenant_id == current_user.tenant_id
    ).order_by(Employee.employee_code.asc()).all()

    return [
        {
            "id": e.id,
            "employee_code": e.employee_code,
            "name": e.name,
            "role": e.role,
            "phone": e.phone,
            "is_active": e.is_active
        }
        for e in employees
    ]

@router.post("/employees")
def create_employee(
    req: EmployeeCreate,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Employee).filter(
        Employee.tenant_id == current_user.tenant_id,
        Employee.employee_code == req.employee_code.strip().upper()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee code already exists (e.g. E01).")

    emp = Employee(
        tenant_id=current_user.tenant_id,
        employee_code=req.employee_code.strip().upper(),
        name=req.name.strip(),
        role=req.role.strip() if req.role else "Waiter",
        phone=req.phone.strip() if req.phone else None,
        is_active=req.is_active
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)

    return {"success": True, "message": f"Employee '{emp.name}' [{emp.employee_code}] added.", "id": emp.id}

@router.put("/employees/{emp_id}")
def update_employee(
    emp_id: str,
    req: EmployeeUpdate,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    emp = db.query(Employee).filter(
        Employee.id == emp_id,
        Employee.tenant_id == current_user.tenant_id
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found.")

    if req.employee_code is not None:
        emp.employee_code = req.employee_code.strip().upper()
    if req.name is not None:
        emp.name = req.name.strip()
    if req.role is not None:
        emp.role = req.role.strip()
    if req.phone is not None:
        emp.phone = req.phone.strip()
    if req.is_active is not None:
        emp.is_active = req.is_active

    db.commit()
    return {"success": True, "message": "Employee details updated."}

@router.delete("/employees/{emp_id}")
def delete_employee(
    emp_id: str,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    emp = db.query(Employee).filter(
        Employee.id == emp_id,
        Employee.tenant_id == current_user.tenant_id
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found.")

    db.delete(emp)
    db.commit()
    return {"success": True, "message": "Employee removed."}

# ==========================================
# 8. PRINTER CONFIGURATION
# ==========================================

@router.get("/printers")
def list_printers(
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    printers = db.query(PrinterConfig).filter(
        PrinterConfig.tenant_id == current_user.tenant_id
    ).order_by(PrinterConfig.name.asc()).all()

    return [
        {
            "id": p.id,
            "name": p.name,
            "printer_type": p.printer_type,
            "connection_type": p.connection_type,
            "ip_address": p.ip_address,
            "port": p.port,
            "paper_width_mm": p.paper_width_mm,
            "is_active": p.is_active
        }
        for p in printers
    ]

@router.post("/printers")
def create_printer(
    req: PrinterConfigCreate,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    p = PrinterConfig(
        tenant_id=current_user.tenant_id,
        name=req.name.strip(),
        printer_type=req.printer_type,
        connection_type=req.connection_type,
        ip_address=req.ip_address.strip() if req.ip_address else None,
        port=req.port,
        paper_width_mm=req.paper_width_mm,
        is_active=req.is_active
    )
    db.add(p)
    db.commit()
    db.refresh(p)

    return {"success": True, "message": f"Printer '{p.name}' configured.", "id": p.id}

@router.put("/printers/{printer_id}")
def update_printer(
    printer_id: str,
    req: PrinterConfigUpdate,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    p = db.query(PrinterConfig).filter(
        PrinterConfig.id == printer_id,
        PrinterConfig.tenant_id == current_user.tenant_id
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Printer not found.")

    if req.name is not None:
        p.name = req.name.strip()
    if req.printer_type is not None:
        p.printer_type = req.printer_type
    if req.connection_type is not None:
        p.connection_type = req.connection_type
    if req.ip_address is not None:
        p.ip_address = req.ip_address.strip() if req.ip_address else None
    if req.port is not None:
        p.port = req.port
    if req.paper_width_mm is not None:
        p.paper_width_mm = req.paper_width_mm
    if req.is_active is not None:
        p.is_active = req.is_active

    db.commit()
    return {"success": True, "message": "Printer updated."}

@router.delete("/printers/{printer_id}")
def delete_printer(
    printer_id: str,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    p = db.query(PrinterConfig).filter(
        PrinterConfig.id == printer_id,
        PrinterConfig.tenant_id == current_user.tenant_id
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Printer not found.")

    db.delete(p)
    db.commit()
    return {"success": True, "message": "Printer deleted."}

# ==========================================
# 9. BILLING & TAX SETTINGS
# ==========================================

@router.get("/billing")
def get_billing_settings(
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    cfg = db.query(BillingConfig).filter(
        BillingConfig.tenant_id == current_user.tenant_id
    ).first()

    if not cfg:
        # Default settings if not yet saved
        return {
            "cgst_rate": 2.5,
            "sgst_rate": 2.5,
            "service_charge_rate": 0.0,
            "round_off_bills": True,
            "currency_symbol": "₹",
            "receipt_header": "HOTEL POS CASH MEMO",
            "receipt_footer": "Thank you! Visit again."
        }

    return {
        "cgst_rate": cfg.cgst_rate,
        "sgst_rate": cfg.sgst_rate,
        "service_charge_rate": cfg.service_charge_rate,
        "round_off_bills": cfg.round_off_bills,
        "currency_symbol": cfg.currency_symbol,
        "receipt_header": cfg.receipt_header,
        "receipt_footer": cfg.receipt_footer
    }

@router.put("/billing")
def update_billing_settings(
    req: BillingConfigUpdate,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    cfg = db.query(BillingConfig).filter(
        BillingConfig.tenant_id == current_user.tenant_id
    ).first()

    if not cfg:
        cfg = BillingConfig(
            tenant_id=current_user.tenant_id,
            cgst_rate=req.cgst_rate,
            sgst_rate=req.sgst_rate,
            service_charge_rate=req.service_charge_rate,
            round_off_bills=req.round_off_bills,
            currency_symbol=req.currency_symbol or "₹",
            receipt_header=req.receipt_header,
            receipt_footer=req.receipt_footer
        )
        db.add(cfg)
    else:
        cfg.cgst_rate = req.cgst_rate
        cfg.sgst_rate = req.sgst_rate
        cfg.service_charge_rate = req.service_charge_rate
        cfg.round_off_bills = req.round_off_bills
        cfg.currency_symbol = req.currency_symbol or cfg.currency_symbol
        cfg.receipt_header = req.receipt_header
        cfg.receipt_footer = req.receipt_footer

    db.commit()
    return {"success": True, "message": "Billing settings saved successfully."}

# ==========================================
# 10. HARDWARE TERMINAL MANAGEMENT FOR RESTAURANT
# ==========================================

@router.get("/terminals")
def list_restaurant_terminals(
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    terminals = db.query(RegisteredTerminal).filter(
        RegisteredTerminal.tenant_id == tenant.id
    ).order_by(RegisteredTerminal.registered_at.desc()).all()

    active_count = sum(1 for t in terminals if t.status == "AUTHORIZED")

    return {
        "terminal_limit": tenant.max_terminals,
        "active_terminals_count": active_count,
        "available_slots": max(0, tenant.max_terminals - active_count),
        "terminals": [
            {
                "id": t.id,
                "terminal_id": t.terminal_id,
                "device_id": t.device_id,
                "device_name": t.device_name,
                "platform": t.platform,
                "ip_address": t.ip_address,
                "status": t.status,
                "registered_at": t.registered_at.isoformat(),
                "last_active_at": t.last_active_at.isoformat(),
                "replacement_notes": t.replacement_notes
            }
            for t in terminals
        ]
    }
