import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class RegisteredTerminal(Base):
    __tablename__ = "registered_terminals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    terminal_id = Column(String(50), index=True, nullable=False) # e.g. TERM-01, TERM-02
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    device_id = Column(String(150), nullable=False, index=True) # Unique hardware identifier
    device_name = Column(String(150), default="Counter POS Terminal", nullable=False)
    platform = Column(String(50), default="Windows", nullable=False)
    ip_address = Column(String(50), nullable=True)
    status = Column(String(50), default="AUTHORIZED", nullable=False) # AUTHORIZED, REVOKED, REPLACED, BLOCKED
    registered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    last_active_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    replacement_notes = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint('tenant_id', 'device_id', name='uq_tenant_device'),
    )

    tenant = relationship("Tenant", back_populates="terminals")
