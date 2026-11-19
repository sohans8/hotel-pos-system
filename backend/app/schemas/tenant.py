from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TenantBase(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(..., min_length=2, max_length=100)

class TenantCreate(TenantBase):
    pass

class TenantResponse(TenantBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class SubscriptionCreate(BaseModel):
    plan_tier: str = "STANDARD" # BASIC, STANDARD, PREMIUM
    max_terminals: int = 3
    valid_until: datetime
    offline_grace_days: int = 7

class SubscriptionResponse(SubscriptionCreate):
    id: str
    tenant_id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class OnboardingRequest(BaseModel):
    # Tenant details
    business_name: str
    slug: str
    # Admin User details
    admin_name: str
    admin_email: str
    admin_password: str
    # Restaurant details
    restaurant_name: str
    restaurant_type: str = "FAMILY_RESTAURANT"
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gstin: Optional[str] = None
    fssai_no: Optional[str] = None
    currency_symbol: str = "₹"
    table_count: int = 10
    plan_tier: str = "STANDARD"
