from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class RestaurantProfileUpdate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    owner_name: str
    address: str
    city: Optional[str] = "Kalyan"
    state: Optional[str] = "Maharashtra"
    pincode: Optional[str] = "421301"
    country: Optional[str] = "India"
    mobile: str
    email: str
    gstin: Optional[str] = None
    fssai: Optional[str] = None

class CategoryCreate(BaseModel):
    name: str
    display_order: int = 0
    is_active: bool = True

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class MenuItemCreate(BaseModel):
    category_id: Optional[str] = None
    name: str
    short_code: Optional[str] = None
    price: float
    is_veg: bool = True
    is_available: bool = True
    description: Optional[str] = None

class MenuItemUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = None
    short_code: Optional[str] = None
    price: Optional[float] = None
    is_veg: Optional[bool] = None
    is_available: Optional[bool] = None
    description: Optional[str] = None

class DiningTableCreate(BaseModel):
    table_number: str
    section: str = "Main Dining"
    capacity: int = 4
    is_active: bool = True

class DiningTableUpdate(BaseModel):
    table_number: Optional[str] = None
    section: Optional[str] = None
    capacity: Optional[int] = None
    is_active: Optional[bool] = None

class EmployeeCreate(BaseModel):
    employee_code: str
    name: str
    role: str = "Waiter"
    phone: Optional[str] = None
    is_active: bool = True

class EmployeeUpdate(BaseModel):
    employee_code: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class PrinterConfigCreate(BaseModel):
    name: str
    printer_type: str = "CASHIER"
    connection_type: str = "NETWORK_LAN"
    ip_address: Optional[str] = None
    port: int = 9100
    paper_width_mm: int = 80
    is_active: bool = True

class PrinterConfigUpdate(BaseModel):
    name: Optional[str] = None
    printer_type: Optional[str] = None
    connection_type: Optional[str] = None
    ip_address: Optional[str] = None
    port: Optional[int] = None
    paper_width_mm: Optional[int] = None
    is_active: Optional[bool] = None

class BillingConfigUpdate(BaseModel):
    cgst_rate: float = 2.5
    sgst_rate: float = 2.5
    service_charge_rate: float = 0.0
    round_off_bills: bool = True
    currency_symbol: str = "₹"
    receipt_header: Optional[str] = None
    receipt_footer: Optional[str] = "Thank you! Visit again."
