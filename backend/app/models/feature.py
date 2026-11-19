import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class Feature(Base):
    __tablename__ = "features"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    feature_key = Column(String(100), unique=True, index=True, nullable=False) # e.g. pos_ordering, kot_printing, etc.
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="Core Operations", nullable=False)
    is_system_default = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    permissions = relationship("RestaurantFeaturePermission", back_populates="feature", cascade="all, delete-orphan")

class RestaurantFeaturePermission(Base):
    __tablename__ = "restaurant_feature_permissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    feature_key = Column(String(100), ForeignKey("features.feature_key", ondelete="CASCADE"), nullable=False, index=True)
    is_enabled = Column(Boolean, default=True, nullable=False)
    granted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint('tenant_id', 'feature_key', name='uq_tenant_feature'),
    )

    tenant = relationship("Tenant", back_populates="feature_permissions")
    feature = relationship("Feature", back_populates="permissions")
