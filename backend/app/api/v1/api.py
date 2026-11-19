from fastapi import APIRouter
from app.api.v1.endpoints import (
    super_admin,
    auth,
    terminals,
    features,
    restaurant_portal
)

api_router = APIRouter()

api_router.include_router(super_admin.router, prefix="/super-admin", tags=["Super Admin Platform Management"])
api_router.include_router(auth.router, prefix="/auth", tags=["Restaurant Authentication"])
api_router.include_router(restaurant_portal.router, prefix="/restaurant", tags=["Restaurant Admin Portal"])
api_router.include_router(terminals.router, prefix="/terminals", tags=["Terminal Management"])
api_router.include_router(features.router, prefix="/features", tags=["Feature Permissions"])
