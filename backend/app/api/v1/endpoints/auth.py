from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, get_current_restaurant_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.restaurant_user import RestaurantUser
from app.models.tenant import Tenant
from app.models.restaurant import Restaurant
from app.models.subscription import Subscription
from app.models.audit import AuditLog
from app.schemas.auth import RestaurantLoginRequest, RestaurantLoginResponse, ChangePasswordRequest

router = APIRouter()

@router.post("/restaurant-login", response_model=RestaurantLoginResponse)
def restaurant_login(req: RestaurantLoginRequest, db: Session = Depends(get_db)):
    user = db.query(RestaurantUser).filter(
        or_(
            RestaurantUser.username == req.username_or_email.strip(),
            RestaurantUser.email == req.username_or_email.strip().lower()
        )
    ).first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid restaurant credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive. Please contact your restaurant administrator."
        )

    # 1. Validate Tenant Status
    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant organization not found.")

    if tenant.status == "PENDING":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Restaurant account is pending Super Admin review and activation."
        )
    if tenant.status == "SUSPENDED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Restaurant account is SUSPENDED. Please contact Super Administrator."
        )
    if tenant.status == "EXPIRED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Restaurant license has EXPIRED. Please renew your annual subscription."
        )
    if tenant.status == "REVOKED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Restaurant license has been REVOKED."
        )

    # 2. Validate Subscription Expiry
    now = datetime.now(timezone.utc)
    active_sub = db.query(Subscription).filter(
        Subscription.tenant_id == tenant.id,
        Subscription.status == "ACTIVE"
    ).order_by(Subscription.expiry_date.desc()).first()

    if not active_sub or active_sub.expiry_date.replace(tzinfo=timezone.utc if active_sub.expiry_date.tzinfo is None else None) < now:
        tenant.status = "EXPIRED"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Annual subscription has expired. Access to protected services is blocked."
        )

    # Update last login
    user.last_login_at = now
    
    # Audit log
    audit = AuditLog(
        tenant_id=tenant.id,
        actor_type="RESTAURANT_USER",
        actor_id=user.id,
        actor_name=user.full_name,
        action="LOGIN_SUCCESS",
        target_type="User",
        target_id=user.username,
        details=f"Restaurant user '{user.username}' signed in to tenant '{tenant.business_name}'"
    )
    db.add(audit)
    db.commit()

    token = create_access_token(
        subject=user.id,
        tenant_id=tenant.id,
        role=user.role,
        expires_delta=timedelta(days=7)
    )

    restaurant = tenant.restaurant

    return RestaurantLoginResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        tenant_id=tenant.id,
        restaurant_id=restaurant.restaurant_id if restaurant else "N/A",
        restaurant_name=restaurant.name if restaurant else tenant.business_name,
        must_change_password=user.must_change_password
    )

@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    current_user: RestaurantUser = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    """
    Enforces initial password change on first login or on demand.
    """
    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="New password and confirmation do not match.")

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long.")

    if not verify_password(req.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password.")

    current_user.hashed_password = get_password_hash(req.new_password)
    current_user.must_change_password = False # Password changed successfully!

    audit = AuditLog(
        tenant_id=current_user.tenant_id,
        actor_type="RESTAURANT_USER",
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        action="PASSWORD_CHANGED",
        target_type="User",
        target_id=current_user.username,
        details="User completed password change (first-login / regular security update)"
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": "Password changed successfully. You may now continue using your workspace."}
