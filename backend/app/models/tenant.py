import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. REST-10001
    business_name = Column(String(255), nullable=False)
    status = Column(String(50), default="ACTIVE", nullable=False) # ACTIVE, PENDING, SUSPENDED, EXPIRED, REVOKED
    max_terminals = Column(Integer, default=2, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    restaurant = relationship("Restaurant", back_populates="tenant", uselist=False, cascade="all, delete-orphan")
    users = relationship("RestaurantUser", back_populates="tenant", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="tenant", cascade="all, delete-orphan")
    licenses = relationship("License", back_populates="tenant", cascade="all, delete-orphan")
    terminals = relationship("RegisteredTerminal", back_populates="tenant", cascade="all, delete-orphan")
    feature_permissions = relationship("RestaurantFeaturePermission", back_populates="tenant", cascade="all, delete-orphan")
