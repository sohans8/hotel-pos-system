import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class License(Base):
    __tablename__ = "licenses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    license_id = Column(String(100), unique=True, index=True, nullable=False) # e.g. LIC-2026-XXXX-XXXX
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    subscription_id = Column(String(36), ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False) # ACTIVE, SUSPENDED, EXPIRED, REVOKED
    max_terminals = Column(Integer, default=2, nullable=False)
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = Column(DateTime, nullable=False)

    tenant = relationship("Tenant", back_populates="licenses")
