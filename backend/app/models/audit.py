import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), nullable=True, index=True)
    actor_type = Column(String(50), default="SUPER_ADMIN", nullable=False) # SUPER_ADMIN, RESTAURANT_USER, SYSTEM
    actor_id = Column(String(100), nullable=True)
    actor_name = Column(String(255), default="Super Admin", nullable=False)
    action = Column(String(100), nullable=False) # RESTAURANT_CREATED, RESTAURANT_ACTIVATED, RESTAURANT_SUSPENDED, SUBSCRIPTION_RENEWED, TERMINAL_REGISTERED, TERMINAL_REVOKED, TERMINAL_REPLACED, FEATURE_ENABLED, FEATURE_REVOKED, PASSWORD_RESET, PASSWORD_CHANGED
    target_type = Column(String(50), nullable=True) # Restaurant, Subscription, Terminal, Feature, User
    target_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True, nullable=False)
