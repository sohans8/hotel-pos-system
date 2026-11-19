import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    subscription_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. SUB-2026-0001
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_name = Column(String(100), default="1-Year Commercial License", nullable=False)
    start_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    expiry_date = Column(DateTime, nullable=False) # 1 year after start_date
    status = Column(String(50), default="ACTIVE", nullable=False) # ACTIVE, SUSPENDED, EXPIRED, REVOKED
    activation_status = Column(String(50), default="ACTIVATED", nullable=False) # ACTIVATED, PENDING, SUSPENDED, REVOKED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    tenant = relationship("Tenant", back_populates="subscriptions")
