from typing import Optional, Generator
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import decode_token
from app.models.super_admin import SuperAdmin
from app.models.restaurant_user import RestaurantUser
from app.models.tenant import Tenant
from app.models.subscription import Subscription
from app.models.feature import RestaurantFeaturePermission
from datetime import datetime, timezone

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/super-admin/login", auto_error=False)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_super_admin(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> SuperAdmin:
    """
    Strictly verifies that caller is an authenticated Super Administrator.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required for Super Admin access.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    if payload.get("role") != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Super Administrator privileges required."
        )
    
    admin_id = payload.get("sub")
    admin = db.query(SuperAdmin).filter(SuperAdmin.id == admin_id).first()
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Super Administrator account is inactive or not found."
        )
    
    return admin

def get_current_restaurant_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> RestaurantUser:
    """
    Strictly verifies that caller is an authenticated Restaurant User.
    Enforces active tenant status and subscription validity.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required for Restaurant access.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id = payload.get("sub")
    tenant_id = payload.get("tenant_id")
    
    user = db.query(RestaurantUser).filter(RestaurantUser.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Restaurant user account is inactive or not found."
        )
    
    # Verify Tenant Status
    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant record not found.")
    
    if tenant.status == "SUSPENDED":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Restaurant account is SUSPENDED. Please contact Super Admin.")
    if tenant.status == "EXPIRED":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Restaurant subscription is EXPIRED. Please renew your license.")
    if tenant.status == "PENDING":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Restaurant account is pending Super Admin review and activation.")
    if tenant.status == "REVOKED":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Restaurant license has been REVOKED.")

    # Verify Active Subscription
    now = datetime.now(timezone.utc)
    active_sub = db.query(Subscription).filter(
        Subscription.tenant_id == tenant.id,
        Subscription.status == "ACTIVE"
    ).order_by(Subscription.expiry_date.desc()).first()

    if not active_sub or active_sub.expiry_date.replace(tzinfo=timezone.utc if active_sub.expiry_date.tzinfo is None else None) < now:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Subscription has expired or is inactive. Access to protected services is blocked."
        )

    return user

def require_feature(feature_key: str):
    """
    Dependency factory to check if a specific feature is enabled for the tenant.
    """
    def dependency(
        current_user: RestaurantUser = Depends(get_current_restaurant_user),
        db: Session = Depends(get_db)
    ):
        perm = db.query(RestaurantFeaturePermission).filter(
            RestaurantFeaturePermission.tenant_id == current_user.tenant_id,
            RestaurantFeaturePermission.feature_key == feature_key
        ).first()
        
        if not perm or not perm.is_enabled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Feature '{feature_key}' is not licensed or disabled for this restaurant."
            )
        return True
    return dependency
