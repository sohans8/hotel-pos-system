from pydantic import BaseModel
from typing import Optional

class RestaurantLoginRequest(BaseModel):
    username_or_email: str
    password: str

class RestaurantLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    full_name: str
    role: str
    tenant_id: str
    restaurant_id: str
    restaurant_name: str
    must_change_password: bool

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str
