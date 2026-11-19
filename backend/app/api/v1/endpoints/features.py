from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_restaurant_user
from app.models.feature import RestaurantFeaturePermission, Feature

router = APIRouter()

@router.get("/check/{feature_key}")
def check_feature_status(
    feature_key: str,
    current_user = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    """
    Checks if a software module/feature is active for this tenant.
    Demonstrates blocking protected features when disabled.
    """
    perm = db.query(RestaurantFeaturePermission).filter(
        RestaurantFeaturePermission.tenant_id == current_user.tenant_id,
        RestaurantFeaturePermission.feature_key == feature_key
    ).first()

    is_enabled = bool(perm and perm.is_enabled)
    if not is_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Feature '{feature_key}' is disabled or not included in your restaurant license."
        )

    return {
        "feature_key": feature_key,
        "is_enabled": True,
        "tenant_id": current_user.tenant_id,
        "message": f"Feature '{feature_key}' is active and authorized for use."
    }

@router.get("/my-features")
def get_my_features(
    current_user = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    """
    Returns all enabled features for the current logged-in restaurant.
    """
    perms = db.query(RestaurantFeaturePermission).filter(
        RestaurantFeaturePermission.tenant_id == current_user.tenant_id
    ).all()

    return {
        "tenant_id": current_user.tenant_id,
        "features": {
            p.feature_key: p.is_enabled for p in perms
        }
    }
