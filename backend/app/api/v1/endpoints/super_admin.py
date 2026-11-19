import uuid
import random
import string
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.api.deps import get_db, get_current_super_admin
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.super_admin import SuperAdmin
from app.models.tenant import Tenant
from app.models.restaurant import Restaurant
from app.models.restaurant_user import RestaurantUser
from app.models.subscription import Subscription
from app.models.license import License
from app.models.terminal import RegisteredTerminal
from app.models.feature import Feature, RestaurantFeaturePermission
from app.models.audit import AuditLog
from app.schemas.super_admin import (
    SuperAdminLoginRequest,
    SuperAdminLoginResponse,
    DashboardResponse,
    DashboardStats,
    RestaurantCreateRequest,
    RestaurantUpdateRequest,
    RestaurantActionRequest,
    TerminalActionRequest,
    FeatureCreateRequest,
    FeatureToggleRequest
)

router = APIRouter()

def generate_code(prefix: str, length: int = 5) -> str:
    digits = ''.join(random.choices(string.digits, k=length))
    return f"{prefix}-{digits}"

def generate_license_key() -> str:
    part1 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    part2 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    part3 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    part4 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"LIC-{part1}-{part2}-{part3}-{part4}"

# ==========================================
# 1. SUPER ADMIN AUTHENTICATION
# ==========================================

@router.post("/login", response_model=SuperAdminLoginResponse)
def super_admin_login(req: SuperAdminLoginRequest, db: Session = Depends(get_db)):
    admin = db.query(SuperAdmin).filter(
        or_(
            SuperAdmin.username == req.username_or_email.strip(),
            SuperAdmin.email == req.username_or_email.strip().lower()
        )
    ).first()

    if not admin or not verify_password(req.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Super Administrator credentials."
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Administrator account is disabled."
        )

    admin.last_login_at = datetime.now(timezone.utc)
    
    # Audit log
    audit = AuditLog(
        actor_type="SUPER_ADMIN",
        actor_id=admin.id,
        actor_name=admin.full_name,
        action="LOGIN_SUCCESS",
        details="Super Admin logged into Platform Management Panel"
    )
    db.add(audit)
    db.commit()

    token_delta = timedelta(days=7 if req.remember_me else 1)
    token = create_access_token(
        subject=admin.id,
        tenant_id=None,
        role="SUPER_ADMIN",
        expires_delta=token_delta
    )

    return SuperAdminLoginResponse(
        access_token=token,
        token_type="bearer",
        admin_id=admin.id,
        admin_name=admin.full_name,
        email=admin.email,
        role="SUPER_ADMIN"
    )

# ==========================================
# 2. DASHBOARD
# ==========================================

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    now = datetime.now(timezone.utc)
    
    total_restaurants = db.query(Restaurant).count()
    active_restaurants = db.query(Tenant).filter(Tenant.status == "ACTIVE").count()
    suspended_restaurants = db.query(Tenant).filter(Tenant.status == "SUSPENDED").count()
    
    # Expired subscriptions
    expired_subs = db.query(Subscription).filter(
        or_(
            Subscription.status == "EXPIRED",
            Subscription.expiry_date < now
        )
    ).count()

    # Active Terminals & Total Capacity
    active_terminals = db.query(RegisteredTerminal).filter(RegisteredTerminal.status == "AUTHORIZED").count()
    total_capacity = db.query(func.sum(Tenant.max_terminals)).scalar() or 0
    available_capacity = max(0, total_capacity - active_terminals)

    # Recent restaurants
    recent_records = db.query(Restaurant).order_by(Restaurant.created_at.desc()).limit(5).all()
    recent_restaurants_list = []
    for r in recent_records:
        t = db.query(Tenant).filter(Tenant.id == r.tenant_id).first()
        recent_restaurants_list.append({
            "id": r.id,
            "restaurant_id": r.restaurant_id,
            "tenant_id": r.tenant_id,
            "name": r.name,
            "owner_name": r.owner_name,
            "mobile": r.mobile,
            "email": r.email,
            "status": t.status if t else "PENDING",
            "created_at": r.created_at.isoformat()
        })

    # Upcoming subscription expirations (next 30 days)
    thirty_days = now + timedelta(days=30)
    expiring_records = db.query(Subscription).filter(
        Subscription.status == "ACTIVE",
        Subscription.expiry_date >= now,
        Subscription.expiry_date <= thirty_days
    ).order_by(Subscription.expiry_date.asc()).limit(5).all()

    upcoming_expirations_list = []
    for sub in expiring_records:
        rest = db.query(Restaurant).filter(Restaurant.tenant_id == sub.tenant_id).first()
        upcoming_expirations_list.append({
            "subscription_id": sub.subscription_id,
            "restaurant_name": rest.name if rest else "Unknown Restaurant",
            "expiry_date": sub.expiry_date.isoformat(),
            "days_remaining": (sub.expiry_date.replace(tzinfo=timezone.utc if sub.expiry_date.tzinfo is None else None) - now).days
        })

    # Recent activity logs
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(10).all()
    recent_activities = [
        {
            "id": l.id,
            "actor_name": l.actor_name,
            "action": l.action,
            "target_type": l.target_type,
            "target_id": l.target_id,
            "details": l.details,
            "timestamp": l.timestamp.isoformat()
        }
        for l in logs
    ]

    return DashboardResponse(
        stats=DashboardStats(
            total_restaurants=total_restaurants,
            active_restaurants=active_restaurants,
            suspended_restaurants=suspended_restaurants,
            expired_subscriptions=expired_subs,
            active_terminals=active_terminals,
            available_terminal_capacity=available_capacity
        ),
        recent_restaurants=recent_restaurants_list,
        upcoming_expirations=upcoming_expirations_list,
        recent_activities=recent_activities
    )

# ==========================================
# 3. RESTAURANT ONBOARDING & MANAGEMENT
# ==========================================

@router.get("/restaurants")
def list_restaurants(
    status_filter: str = Query("ALL", pattern="^(ALL|ACTIVE|PENDING|SUSPENDED|EXPIRED|REVOKED)$"),
    search: Optional[str] = None,
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Restaurant).join(Tenant, Restaurant.tenant_id == Tenant.id)

    if status_filter != "ALL":
        query = query.filter(Tenant.status == status_filter)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Restaurant.name.ilike(s),
                Restaurant.owner_name.ilike(s),
                Restaurant.restaurant_id.ilike(s),
                Restaurant.mobile.ilike(s),
                Restaurant.email.ilike(s)
            )
        )

    restaurants = query.order_by(Restaurant.created_at.desc()).all()
    now = datetime.now(timezone.utc)

    result = []
    for r in restaurants:
        tenant = r.tenant
        sub = db.query(Subscription).filter(Subscription.tenant_id == tenant.id).order_by(Subscription.expiry_date.desc()).first()
        owner_user = db.query(RestaurantUser).filter(RestaurantUser.tenant_id == tenant.id, RestaurantUser.role == "OWNER").first()
        active_terminals = db.query(RegisteredTerminal).filter(
            RegisteredTerminal.tenant_id == tenant.id,
            RegisteredTerminal.status == "AUTHORIZED"
        ).count()

        sub_status = tenant.status
        if sub and sub.expiry_date.replace(tzinfo=timezone.utc if sub.expiry_date.tzinfo is None else None) < now and tenant.status == "ACTIVE":
            sub_status = "EXPIRED"

        result.append({
            "id": r.id,
            "restaurant_id": r.restaurant_id,
            "tenant_id": r.tenant_id,
            "name": r.name,
            "owner_name": r.owner_name,
            "mobile": r.mobile,
            "email": r.email,
            "address": r.address,
            "city": r.city,
            "state": r.state,
            "username": owner_user.username if owner_user else "N/A",
            "subscription_plan": sub.plan_name if sub else "1-Year Commercial License",
            "subscription_expiry": sub.expiry_date.isoformat() if sub else None,
            "terminal_limit": tenant.max_terminals,
            "active_terminals": active_terminals,
            "status": sub_status,
            "created_at": r.created_at.isoformat()
        })

    return result

@router.post("/restaurants")
def add_restaurant(
    req: RestaurantCreateRequest,
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    # Check for duplicate username or email
    if db.query(RestaurantUser).filter(RestaurantUser.username == req.username.strip()).first():
        raise HTTPException(status_code=400, detail="Username already in use. Please choose another username.")
    
    if db.query(RestaurantUser).filter(RestaurantUser.email == req.email.strip().lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered for another user.")

    # Generate codes
    rest_code = generate_code("REST", 5)
    while db.query(Restaurant).filter(Restaurant.restaurant_id == rest_code).first():
        rest_code = generate_code("REST", 5)

    sub_code = generate_code("SUB-2026", 5)
    lic_key = generate_license_key()

    activation_date = datetime.now(timezone.utc)
    expiry_date = activation_date + timedelta(days=365) # Exactly 1-year annual subscription

    tenant_status = "ACTIVE" if req.is_activated else "PENDING"

    # 1. Create Tenant
    tenant = Tenant(
        tenant_id=rest_code,
        business_name=req.restaurant_name.strip(),
        status=tenant_status,
        max_terminals=max(1, req.max_terminals),
        is_active=(tenant_status == "ACTIVE")
    )
    db.add(tenant)
    db.flush()

    # 2. Create Restaurant Profile
    restaurant = Restaurant(
        tenant_id=tenant.id,
        restaurant_id=rest_code,
        name=req.restaurant_name.strip(),
        owner_name=req.owner_name.strip(),
        mobile=req.mobile.strip(),
        email=req.email.strip().lower(),
        address=req.address.strip(),
        city=req.city or "Kalyan",
        state=req.state or "Maharashtra",
        pincode=req.pincode or "421301",
        country=req.country or "India",
        gstin=req.gstin.strip() if req.gstin else None,
        fssai=req.fssai.strip() if req.fssai else None,
        restaurant_type=req.restaurant_type or "Family Restaurant"
    )
    db.add(restaurant)

    # 3. Create Restaurant Owner Login
    owner_user = RestaurantUser(
        tenant_id=tenant.id,
        username=req.username.strip(),
        email=req.email.strip().lower(),
        hashed_password=get_password_hash(req.initial_password),
        full_name=req.owner_name.strip(),
        role="OWNER",
        must_change_password=True, # Require password change on first login
        is_active=True
    )
    db.add(owner_user)

    # 4. Create 1-Year Subscription
    subscription = Subscription(
        subscription_id=sub_code,
        tenant_id=tenant.id,
        plan_name="1-Year Commercial License",
        start_date=activation_date,
        expiry_date=expiry_date,
        status=tenant_status,
        activation_status="ACTIVATED" if req.is_activated else "PENDING"
    )
    db.add(subscription)
    db.flush()

    # 5. Create License
    license_obj = License(
        license_id=lic_key,
        tenant_id=tenant.id,
        subscription_id=subscription.id,
        status=tenant_status,
        max_terminals=req.max_terminals,
        issued_at=activation_date,
        expires_at=expiry_date
    )
    db.add(license_obj)

    # 6. Initialize Feature Permissions from Feature Registry
    all_features = db.query(Feature).all()
    for feat in all_features:
        perm = RestaurantFeaturePermission(
            tenant_id=tenant.id,
            feature_key=feat.feature_key,
            is_enabled=True # enabled by default on new restaurant onboarding
        )
        db.add(perm)

    # 7. Audit Log
    audit = AuditLog(
        tenant_id=tenant.id,
        actor_type="SUPER_ADMIN",
        actor_id=admin.id,
        actor_name=admin.full_name,
        action="RESTAURANT_CREATED",
        target_type="Restaurant",
        target_id=rest_code,
        details=f"Onboarded '{req.restaurant_name}' with 1-Year Subscription. Status: {tenant_status}. Max Terminals: {req.max_terminals}"
    )
    db.add(audit)

    db.commit()

    return {
        "success": True,
        "message": f"Restaurant '{req.restaurant_name}' registered successfully.",
        "restaurant_id": rest_code,
        "tenant_id": tenant.id,
        "license_id": lic_key,
        "subscription_id": sub_code,
        "status": tenant_status,
        "activation_date": activation_date.isoformat(),
        "expiry_date": expiry_date.isoformat()
    }

@router.get("/restaurants/{tenant_id}")
def get_restaurant_details(
    tenant_id: str,
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Restaurant tenant not found.")

    restaurant = tenant.restaurant
    owner_user = db.query(RestaurantUser).filter(RestaurantUser.tenant_id == tenant.id, RestaurantUser.role == "OWNER").first()
    subscriptions = db.query(Subscription).filter(Subscription.tenant_id == tenant.id).order_by(Subscription.created_at.desc()).all()
    terminals = db.query(RegisteredTerminal).filter(RegisteredTerminal.tenant_id == tenant.id).order_by(RegisteredTerminal.registered_at.desc()).all()
    permissions = db.query(RestaurantFeaturePermission).filter(RestaurantFeaturePermission.tenant_id == tenant.id).all()

    return {
        "restaurant": {
            "id": restaurant.id,
            "restaurant_id": restaurant.restaurant_id,
            "tenant_id": tenant.id,
            "name": restaurant.name,
            "owner_name": restaurant.owner_name,
            "mobile": restaurant.mobile,
            "email": restaurant.email,
            "address": restaurant.address,
            "city": restaurant.city,
            "state": restaurant.state,
            "pincode": restaurant.pincode,
            "gstin": restaurant.gstin,
            "fssai": restaurant.fssai,
            "restaurant_type": restaurant.restaurant_type,
            "status": tenant.status,
            "max_terminals": tenant.max_terminals,
            "created_at": restaurant.created_at.isoformat()
        },
        "owner_account": {
            "username": owner_user.username if owner_user else None,
            "email": owner_user.email if owner_user else None,
            "must_change_password": owner_user.must_change_password if owner_user else False,
            "last_login_at": owner_user.last_login_at.isoformat() if owner_user and owner_user.last_login_at else None
        },
        "subscriptions": [
            {
                "id": s.id,
                "subscription_id": s.subscription_id,
                "plan_name": s.plan_name,
                "start_date": s.start_date.isoformat(),
                "expiry_date": s.expiry_date.isoformat(),
                "status": s.status,
                "activation_status": s.activation_status
            }
            for s in subscriptions
        ],
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
        ],
        "feature_permissions": [
            {
                "feature_key": p.feature_key,
                "name": p.feature.name if p.feature else p.feature_key,
                "category": p.feature.category if p.feature else "General",
                "is_enabled": p.is_enabled,
                "granted_at": p.granted_at.isoformat(),
                "revoked_at": p.revoked_at.isoformat() if p.revoked_at else None
            }
            for p in permissions
        ]
    }

@router.put("/restaurants/{tenant_id}")
def update_restaurant(
    tenant_id: str,
    req: RestaurantUpdateRequest,
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Restaurant tenant not found.")

    restaurant = tenant.restaurant
    if req.name:
        restaurant.name = req.name.strip()
        tenant.business_name = req.name.strip()
    if req.owner_name:
        restaurant.owner_name = req.owner_name.strip()
    if req.mobile:
        restaurant.mobile = req.mobile.strip()
    if req.email:
        restaurant.email = req.email.strip().lower()
    if req.address:
        restaurant.address = req.address.strip()
    if req.city:
        restaurant.city = req.city.strip()
    if req.state:
        restaurant.state = req.state.strip()
    if req.pincode:
        restaurant.pincode = req.pincode.strip()
    if req.gstin is not None:
        restaurant.gstin = req.gstin.strip() if req.gstin else None
    if req.fssai is not None:
        restaurant.fssai = req.fssai.strip() if req.fssai else None
    if req.restaurant_type:
        restaurant.restaurant_type = req.restaurant_type.strip()
    if req.max_terminals is not None:
        tenant.max_terminals = max(1, req.max_terminals)

    audit = AuditLog(
        tenant_id=tenant.id,
        actor_type="SUPER_ADMIN",
        actor_id=admin.id,
        actor_name=admin.full_name,
        action="RESTAURANT_UPDATED",
        target_type="Restaurant",
        target_id=restaurant.restaurant_id,
        details="Updated restaurant business details / terminal limit"
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": "Restaurant details updated successfully."}

@router.post("/restaurants/{tenant_id}/action")
def restaurant_action(
    tenant_id: str,
    req: RestaurantActionRequest,
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Restaurant tenant not found.")

    now = datetime.now(timezone.utc)
    action_type = req.action.lower()

    if action_type == "activate":
        tenant.status = "ACTIVE"
        tenant.is_active = True
        # Activate latest subscription and license
        sub = db.query(Subscription).filter(Subscription.tenant_id == tenant.id).order_by(Subscription.created_at.desc()).first()
        if sub:
            sub.status = "ACTIVE"
            sub.activation_status = "ACTIVATED"
        lic = db.query(License).filter(License.tenant_id == tenant.id).order_by(License.issued_at.desc()).first()
        if lic:
            lic.status = "ACTIVE"

        audit = AuditLog(
            tenant_id=tenant.id,
            actor_type="SUPER_ADMIN",
            actor_id=admin.id,
            actor_name=admin.full_name,
            action="RESTAURANT_ACTIVATED",
            target_type="Restaurant",
            target_id=tenant.tenant_id,
            details=f"Account activated by Super Admin. Reason: {req.reason or 'Administrative approval'}"
        )
        db.add(audit)
        db.commit()
        return {"success": True, "message": "Restaurant account and subscription activated."}

    elif action_type == "suspend":
        tenant.status = "SUSPENDED"
        tenant.is_active = False
        sub = db.query(Subscription).filter(Subscription.tenant_id == tenant.id).order_by(Subscription.created_at.desc()).first()
        if sub:
            sub.status = "SUSPENDED"
        lic = db.query(License).filter(License.tenant_id == tenant.id).order_by(License.issued_at.desc()).first()
        if lic:
            lic.status = "SUSPENDED"

        audit = AuditLog(
            tenant_id=tenant.id,
            actor_type="SUPER_ADMIN",
            actor_id=admin.id,
            actor_name=admin.full_name,
            action="RESTAURANT_SUSPENDED",
            target_type="Restaurant",
            target_id=tenant.tenant_id,
            details=f"Account suspended by Super Admin. Reason: {req.reason or 'Policy violation / non-payment'}"
        )
        db.add(audit)
        db.commit()
        return {"success": True, "message": "Restaurant account has been suspended."}

    elif action_type == "renew":
        # 1-Year Annual Subscription Renewal (Section E)
        latest_sub = db.query(Subscription).filter(Subscription.tenant_id == tenant.id).order_by(Subscription.expiry_date.desc()).first()
        
        # If current expiry is in the future, add 365 days from current expiry. Otherwise add 365 days from now.
        start_from = now
        if latest_sub and latest_sub.expiry_date.replace(tzinfo=timezone.utc if latest_sub.expiry_date.tzinfo is None else None) > now:
            start_from = latest_sub.expiry_date.replace(tzinfo=timezone.utc if latest_sub.expiry_date.tzinfo is None else None)

        new_expiry = start_from + timedelta(days=365)
        new_sub_code = generate_code("SUB-RENEW", 5)

        new_sub = Subscription(
            subscription_id=new_sub_code,
            tenant_id=tenant.id,
            plan_name="1-Year Commercial License (Renewed)",
            start_date=now,
            expiry_date=new_expiry,
            status="ACTIVE",
            activation_status="ACTIVATED"
        )
        db.add(new_sub)

        # Update license expiry
        lic = db.query(License).filter(License.tenant_id == tenant.id).order_by(License.issued_at.desc()).first()
        if lic:
            lic.expires_at = new_expiry
            lic.status = "ACTIVE"

        tenant.status = "ACTIVE"
        tenant.is_active = True

        audit = AuditLog(
            tenant_id=tenant.id,
            actor_type="SUPER_ADMIN",
            actor_id=admin.id,
            actor_name=admin.full_name,
            action="SUBSCRIPTION_RENEWED",
            target_type="Subscription",
            target_id=new_sub_code,
            details=f"Renewed annual subscription for 1 year. New expiry: {new_expiry.strftime('%Y-%m-%d')}"
        )
        db.add(audit)
        db.commit()

        return {
            "success": True,
            "message": f"Subscription successfully renewed until {new_expiry.strftime('%Y-%m-%d')}.",
            "new_expiry": new_expiry.isoformat()
        }

    elif action_type == "reset_password":
        if not req.new_password or len(req.new_password) < 6:
            raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")

        owner_user = db.query(RestaurantUser).filter(RestaurantUser.tenant_id == tenant.id, RestaurantUser.role == "OWNER").first()
        if not owner_user:
            raise HTTPException(status_code=404, detail="Owner account not found for this restaurant.")

        owner_user.hashed_password = get_password_hash(req.new_password)
        owner_user.must_change_password = True # Force password change on next login

        audit = AuditLog(
            tenant_id=tenant.id,
            actor_type="SUPER_ADMIN",
            actor_id=admin.id,
            actor_name=admin.full_name,
            action="PASSWORD_RESET",
            target_type="User",
            target_id=owner_user.username,
            details=f"Owner password reset by Super Admin. Force change on next login: True"
        )
        db.add(audit)
        db.commit()

        return {"success": True, "message": "Password reset successfully. Owner must change password upon logging in."}

    else:
        raise HTTPException(status_code=400, detail=f"Unknown action: {req.action}")

# ==========================================
# 4. SUBSCRIPTION MANAGEMENT (SECTION E)
# ==========================================

@router.get("/subscriptions")
def list_subscriptions(
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    subs = db.query(Subscription).order_by(Subscription.created_at.desc()).all()
    now = datetime.now(timezone.utc)

    result = []
    for s in subs:
        tenant = db.query(Tenant).filter(Tenant.id == s.tenant_id).first()
        rest = tenant.restaurant if tenant else None
        
        status_val = s.status
        if s.expiry_date.replace(tzinfo=timezone.utc if s.expiry_date.tzinfo is None else None) < now and s.status == "ACTIVE":
            status_val = "EXPIRED"

        result.append({
            "id": s.id,
            "subscription_id": s.subscription_id,
            "tenant_id": s.tenant_id,
            "restaurant_name": rest.name if rest else "Unknown Restaurant",
            "plan_name": s.plan_name,
            "start_date": s.start_date.isoformat(),
            "expiry_date": s.expiry_date.isoformat(),
            "status": status_val,
            "activation_status": s.activation_status,
            "created_at": s.created_at.isoformat()
        })
    return result

@router.post("/subscriptions/{sub_id}/action")
def subscription_action(
    sub_id: str,
    action: str = Query(..., pattern="^(activate|suspend|revoke|renew)$"),
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found.")

    tenant = db.query(Tenant).filter(Tenant.id == sub.tenant_id).first()
    now = datetime.now(timezone.utc)

    if action == "activate":
        sub.status = "ACTIVE"
        sub.activation_status = "ACTIVATED"
        if tenant:
            tenant.status = "ACTIVE"
    elif action == "suspend":
        sub.status = "SUSPENDED"
        sub.activation_status = "SUSPENDED"
        if tenant:
            tenant.status = "SUSPENDED"
    elif action == "revoke":
        sub.status = "REVOKED"
        sub.activation_status = "REVOKED"
        if tenant:
            tenant.status = "REVOKED"
    elif action == "renew":
        sub.expiry_date = max(now, sub.expiry_date.replace(tzinfo=timezone.utc if sub.expiry_date.tzinfo is None else None)) + timedelta(days=365)
        sub.status = "ACTIVE"
        sub.activation_status = "ACTIVATED"
        if tenant:
            tenant.status = "ACTIVE"

    audit = AuditLog(
        tenant_id=sub.tenant_id,
        actor_type="SUPER_ADMIN",
        actor_id=admin.id,
        actor_name=admin.full_name,
        action=f"SUBSCRIPTION_{action.upper()}",
        target_type="Subscription",
        target_id=sub.subscription_id,
        details=f"Subscription {sub.subscription_id} {action}d by Super Admin"
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": f"Subscription {action}d successfully."}

# ==========================================
# 5. TERMINAL MANAGEMENT (SECTION F)
# ==========================================

@router.get("/terminals")
def list_terminals(
    tenant_id: Optional[str] = None,
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    query = db.query(RegisteredTerminal)
    if tenant_id:
        query = query.filter(RegisteredTerminal.tenant_id == tenant_id)

    terminals = query.order_by(RegisteredTerminal.registered_at.desc()).all()
    result = []
    for t in terminals:
        tenant = db.query(Tenant).filter(Tenant.id == t.tenant_id).first()
        rest = tenant.restaurant if tenant else None
        result.append({
            "id": t.id,
            "terminal_id": t.terminal_id,
            "tenant_id": t.tenant_id,
            "restaurant_name": rest.name if rest else "Unknown",
            "device_id": t.device_id,
            "device_name": t.device_name,
            "platform": t.platform,
            "ip_address": t.ip_address,
            "status": t.status,
            "registered_at": t.registered_at.isoformat(),
            "last_active_at": t.last_active_at.isoformat(),
            "replacement_notes": t.replacement_notes
        })
    return result

@router.post("/terminals/{terminal_id}/revoke")
def revoke_terminal(
    terminal_id: str,
    req: TerminalActionRequest,
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    terminal = db.query(RegisteredTerminal).filter(RegisteredTerminal.id == terminal_id).first()
    if not terminal:
        raise HTTPException(status_code=404, detail="Terminal not found.")

    terminal.status = "REVOKED"
    terminal.replacement_notes = req.reason or "Revoked by Super Administrator"

    audit = AuditLog(
        tenant_id=terminal.tenant_id,
        actor_type="SUPER_ADMIN",
        actor_id=admin.id,
        actor_name=admin.full_name,
        action="TERMINAL_REVOKED",
        target_type="Terminal",
        target_id=terminal.terminal_id,
        details=f"Terminal {terminal.terminal_id} ({terminal.device_id}) revoked: {req.reason or 'Admin revocation'}"
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": f"Terminal {terminal.terminal_id} revoked."}

@router.post("/terminals/{terminal_id}/replace")
def replace_terminal(
    terminal_id: str,
    req: TerminalActionRequest,
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    terminal = db.query(RegisteredTerminal).filter(RegisteredTerminal.id == terminal_id).first()
    if not terminal:
        raise HTTPException(status_code=404, detail="Terminal not found.")

    terminal.status = "REPLACED"
    terminal.replacement_notes = req.reason or "Device replaced with authorized new hardware"

    audit = AuditLog(
        tenant_id=terminal.tenant_id,
        actor_type="SUPER_ADMIN",
        actor_id=admin.id,
        actor_name=admin.full_name,
        action="TERMINAL_REPLACED",
        target_type="Terminal",
        target_id=terminal.terminal_id,
        details=f"Terminal marked as REPLACED. Capacity freed for device replacement: {req.reason or 'Hardware replacement'}"
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": f"Terminal marked as REPLACED. Restaurant capacity slot freed."}

# ==========================================
# 6. FEATURE PERMISSIONS MANAGEMENT (SECTION G)
# ==========================================

@router.get("/features")
def list_features(
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    features = db.query(Feature).order_by(Feature.category, Feature.name).all()
    return [
        {
            "id": f.id,
            "feature_key": f.feature_key,
            "name": f.name,
            "description": f.description,
            "category": f.category,
            "is_system_default": f.is_system_default
        }
        for f in features
    ]

@router.post("/features")
def add_feature_to_registry(
    req: FeatureCreateRequest,
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    if db.query(Feature).filter(Feature.feature_key == req.feature_key.strip()).first():
        raise HTTPException(status_code=400, detail="Feature key already exists in registry.")

    feat = Feature(
        feature_key=req.feature_key.strip(),
        name=req.name.strip(),
        description=req.description,
        category=req.category.strip()
    )
    db.add(feat)

    # Automatically add to all existing tenants as disabled initially
    tenants = db.query(Tenant).all()
    for t in tenants:
        perm = RestaurantFeaturePermission(
            tenant_id=t.id,
            feature_key=feat.feature_key,
            is_enabled=False
        )
        db.add(perm)

    audit = AuditLog(
        actor_type="SUPER_ADMIN",
        actor_id=admin.id,
        actor_name=admin.full_name,
        action="FEATURE_CREATED",
        target_type="Feature",
        target_id=req.feature_key,
        details=f"New software upgrade feature '{req.name}' added to platform feature registry"
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": f"Feature '{req.name}' registered successfully."}

@router.get("/restaurants/{tenant_id}/features")
def get_restaurant_features(
    tenant_id: str,
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found.")

    all_features = db.query(Feature).all()
    existing_perms = {p.feature_key: p for p in tenant.feature_permissions}

    result = []
    for f in all_features:
        perm = existing_perms.get(f.feature_key)
        result.append({
            "feature_key": f.feature_key,
            "name": f.name,
            "description": f.description,
            "category": f.category,
            "is_enabled": perm.is_enabled if perm else False,
            "granted_at": perm.granted_at.isoformat() if perm else None
        })
    return result

@router.put("/restaurants/{tenant_id}/features")
def toggle_restaurant_feature(
    tenant_id: str,
    req: FeatureToggleRequest,
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found.")

    perm = db.query(RestaurantFeaturePermission).filter(
        RestaurantFeaturePermission.tenant_id == tenant.id,
        RestaurantFeaturePermission.feature_key == req.feature_key
    ).first()

    now = datetime.now(timezone.utc)
    if not perm:
        perm = RestaurantFeaturePermission(
            tenant_id=tenant.id,
            feature_key=req.feature_key,
            is_enabled=req.is_enabled,
            granted_at=now if req.is_enabled else now,
            revoked_at=None if req.is_enabled else now
        )
        db.add(perm)
    else:
        perm.is_enabled = req.is_enabled
        if req.is_enabled:
            perm.granted_at = now
            perm.revoked_at = None
        else:
            perm.revoked_at = now

    audit = AuditLog(
        tenant_id=tenant.id,
        actor_type="SUPER_ADMIN",
        actor_id=admin.id,
        actor_name=admin.full_name,
        action="FEATURE_PERMISSION_CHANGED",
        target_type="Feature",
        target_id=req.feature_key,
        details=f"Feature '{req.feature_key}' {'ENABLED' if req.is_enabled else 'DISABLED'} for {tenant.business_name}"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "message": f"Feature '{req.feature_key}' {'enabled' if req.is_enabled else 'disabled'} successfully."
    }

# ==========================================
# 7. ACTIVITY LOGS (SECTION B & AUDIT)
# ==========================================

@router.get("/activity-logs")
def list_activity_logs(
    limit: int = 50,
    search: Optional[str] = None,
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                AuditLog.action.ilike(s),
                AuditLog.actor_name.ilike(s),
                AuditLog.details.ilike(s),
                AuditLog.target_id.ilike(s)
            )
        )
    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "tenant_id": l.tenant_id,
            "actor_type": l.actor_type,
            "actor_name": l.actor_name,
            "action": l.action,
            "target_type": l.target_type,
            "target_id": l.target_id,
            "details": l.details,
            "ip_address": l.ip_address,
            "timestamp": l.timestamp.isoformat()
        }
        for l in logs
    ]

# ==========================================
# 8. SETTINGS
# ==========================================

@router.get("/settings")
def get_platform_settings(
    admin: SuperAdmin = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    return {
        "platform_name": "ApexPOS Super Admin Management Console",
        "version": "1.0.0",
        "admin_username": admin.username,
        "admin_email": admin.email,
        "enforce_terminal_limits": True,
        "default_subscription_duration_days": 365,
        "require_first_login_password_change": True,
        "database_status": "Healthy (PostgreSQL / SQLAlchemy compatible)"
    }
