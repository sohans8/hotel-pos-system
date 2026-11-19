from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime

class SuperAdminLoginRequest(BaseModel):
    username_or_email: str
    password: str
    remember_me: bool = True

class SuperAdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin_id: str
    admin_name: str
    email: str
    role: str = "SUPER_ADMIN"

class DashboardStats(BaseModel):
    total_restaurants: int
    active_restaurants: int
    suspended_restaurants: int
    expired_subscriptions: int
    active_terminals: int
    available_terminal_capacity: int

class DashboardResponse(BaseModel):
    stats: DashboardStats
    recent_restaurants: List[dict]
    upcoming_expirations: List[dict]
    recent_activities: List[dict]

class RestaurantCreateRequest(BaseModel):
    restaurant_name: str
    owner_name: str
    mobile: str
    email: str
    address: str
    city: Optional[str] = "Kalyan"
    state: Optional[str] = "Maharashtra"
    pincode: Optional[str] = "421301"
    country: Optional[str] = "India"
    gstin: Optional[str] = None
    fssai: Optional[str] = None
    restaurant_type: Optional[str] = "Family Restaurant"
    username: str
    initial_password: str
    max_terminals: int = 2
    is_activated: bool = True

class RestaurantUpdateRequest(BaseModel):
    name: Optional[str] = None
    owner_name: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gstin: Optional[str] = None
    fssai: Optional[str] = None
    restaurant_type: Optional[str] = None
    max_terminals: Optional[int] = None

class RestaurantActionRequest(BaseModel):
    action: str # activate, suspend, renew, reset_password
    reason: Optional[str] = None
    new_password: Optional[str] = None

class TerminalRegisterRequest(BaseModel):
    tenant_id: str
    device_id: str
    device_name: str = "POS Counter Terminal"
    platform: str = "Windows"
    ip_address: Optional[str] = None

class TerminalActionRequest(BaseModel):
    reason: Optional[str] = None

class TerminalReplaceRequest(BaseModel):
    tenant_id: str
    old_device_id: str
    new_device_id: str
    new_device_name: str = "Replaced POS Terminal"
    platform: str = "Windows"
    reason: str

class FeatureCreateRequest(BaseModel):
    feature_key: str
    name: str
    description: Optional[str] = None
    category: str = "Core Operations"

class FeatureToggleRequest(BaseModel):
    feature_key: str
    is_enabled: bool
