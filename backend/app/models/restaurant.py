import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    restaurant_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. REST-74921
    name = Column(String(255), nullable=False)
    logo_url = Column(String(500), nullable=True)
    owner_name = Column(String(255), nullable=False)
    mobile = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), default="Kalyan", nullable=True)
    state = Column(String(100), default="Maharashtra", nullable=True)
    pincode = Column(String(20), nullable=True)
    country = Column(String(100), default="India", nullable=False)
    gstin = Column(String(50), nullable=True)
    fssai = Column(String(50), nullable=True)
    restaurant_type = Column(String(50), default="Family Restaurant", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    tenant = relationship("Tenant", back_populates="restaurant")
