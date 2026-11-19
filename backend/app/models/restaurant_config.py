import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class MenuCategory(Base):
    __tablename__ = "menu_categories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint('tenant_id', 'name', name='uq_tenant_category_name'),
    )

    items = relationship("MenuItem", back_populates="category", cascade="all, delete-orphan")

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("menu_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(200), nullable=False)
    short_code = Column(String(20), nullable=True, index=True) # e.g. PL for Paneer Lababdar
    price = Column(Float, nullable=False, default=0.0)
    is_veg = Column(Boolean, default=True, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    category = relationship("MenuCategory", back_populates="items")

class DiningTable(Base):
    __tablename__ = "dining_tables"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    table_number = Column(String(50), nullable=False) # e.g. T-01, 12, G1
    section = Column(String(50), default="Main Dining", nullable=False) # AC Hall, Garden, Family
    capacity = Column(Integer, default=4, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint('tenant_id', 'table_number', name='uq_tenant_table_number'),
    )

class Employee(Base):
    __tablename__ = "employees"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_code = Column(String(20), nullable=False) # e.g. E01, E02
    name = Column(String(150), nullable=False)
    role = Column(String(50), default="Waiter", nullable=False) # Captain, Waiter, Cashier, Chef, Manager
    phone = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint('tenant_id', 'employee_code', name='uq_tenant_employee_code'),
    )

class PrinterConfig(Base):
    __tablename__ = "printer_configs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    printer_type = Column(String(50), default="CASHIER", nullable=False) # CASHIER, KITCHEN_1, KITCHEN_2, BAR
    connection_type = Column(String(50), default="NETWORK_LAN", nullable=False) # NETWORK_LAN, USB, WINDOWS_SPOOLER
    ip_address = Column(String(100), nullable=True)
    port = Column(Integer, default=9100, nullable=False)
    paper_width_mm = Column(Integer, default=80, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class BillingConfig(Base):
    __tablename__ = "billing_configs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    cgst_rate = Column(Float, default=2.5, nullable=False)
    sgst_rate = Column(Float, default=2.5, nullable=False)
    service_charge_rate = Column(Float, default=0.0, nullable=False)
    round_off_bills = Column(Boolean, default=True, nullable=False)
    currency_symbol = Column(String(10), default="₹", nullable=False)
    receipt_header = Column(Text, nullable=True)
    receipt_footer = Column(Text, default="Thank you! Visit again.", nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
