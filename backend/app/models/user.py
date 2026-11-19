import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True, index=True) # Null for SUPER_ADMIN
    username = Column(String(100), unique=True, index=True, nullable=True) # Unique login username for restaurant owners / admin
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="OWNER", nullable=False) # SUPER_ADMIN, OWNER, MANAGER, CASHIER, WAITER, KITCHEN
    is_active = Column(Boolean, default=True, nullable=False)
    must_change_password = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    tenant = relationship("Tenant", back_populates="users")

class Employee(Base):
    __tablename__ = "employees"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_code = Column(String(50), nullable=False) # E01, E02, etc.
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    designation = Column(String(100), default="Waiter", nullable=False) # Captain, Waiter, Cashier, Chef
    pin_code_hash = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    restaurant = relationship("Restaurant", back_populates="employees")
    orders = relationship("Order", back_populates="waiter")
