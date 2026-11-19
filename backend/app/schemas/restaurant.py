from pydantic import BaseModel
from typing import Optional

class RestaurantBase(BaseModel):
    name: str
    restaurant_type: str = "FAMILY_RESTAURANT"
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gstin: Optional[str] = None
    fssai_no: Optional[str] = None
    currency_symbol: str = "₹"

class RestaurantResponse(RestaurantBase):
    id: str
    tenant_id: str

    class Config:
        from_attributes = True

class SettingsUpdate(BaseModel):
    cgst_rate: float = 2.5
    sgst_rate: float = 2.5
    service_charge_rate: float = 0.0
    round_off_bills: bool = True
    auto_print_kot: bool = True
    receipt_header: Optional[str] = None
    receipt_footer: Optional[str] = None
