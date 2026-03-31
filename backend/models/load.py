from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .base import Base


class LoadStatus(str, enum.Enum):
    NEW = "new"
    PICKED_UP = "picked_up"
    EN_ROUTE = "en_route"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    TONU = "tonu"  # Truck Order Not Used


class Load(Base):
    __tablename__ = "loads"

    id = Column(Integer, primary_key=True, index=True)
    load_number = Column(String(50), unique=True, nullable=False, index=True)

    # Driver & Broker
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    broker_name = Column(String(200), nullable=True)
    broker_contact = Column(String(200), nullable=True)
    broker_phone = Column(String(30), nullable=True)
    broker_email = Column(String(255), nullable=True)
    broker_mc = Column(String(50), nullable=True)

    # Pickup
    pickup_city = Column(String(100), nullable=False)
    pickup_state = Column(String(10), nullable=False)
    pickup_zip = Column(String(20), nullable=True)
    pickup_date = Column(Date, nullable=False)
    pickup_time = Column(String(20), nullable=True)
    shipper_name = Column(String(200), nullable=True)
    shipper_address = Column(Text, nullable=True)

    # Delivery
    delivery_city = Column(String(100), nullable=False)
    delivery_state = Column(String(10), nullable=False)
    delivery_zip = Column(String(20), nullable=True)
    delivery_date = Column(Date, nullable=False)
    delivery_time = Column(String(20), nullable=True)
    consignee_name = Column(String(200), nullable=True)
    consignee_address = Column(Text, nullable=True)

    # Financials
    rate = Column(Float, nullable=False, default=0.0)
    detention = Column(Float, default=0.0)
    lumper_cost = Column(Float, default=0.0)
    fuel_surcharge = Column(Float, default=0.0)
    total_rate = Column(Float, default=0.0)  # computed: rate + detention + fuel_surcharge

    # Load Details
    status = Column(SAEnum(LoadStatus), default=LoadStatus.NEW, index=True)
    commodity = Column(String(200), nullable=True)
    weight = Column(Float, nullable=True)
    miles = Column(Integer, nullable=True)
    equipment_type = Column(String(50), nullable=True)  # dry van, reefer, flatbed

    # References
    reference_number = Column(String(100), nullable=True)
    po_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)

    # Settlement linkage
    settlement_id = Column(Integer, ForeignKey("settlements.id"), nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    driver = relationship("Driver", back_populates="loads")
    attachments = relationship("Attachment", back_populates="load", cascade="all, delete-orphan")
    settlement = relationship("Settlement", back_populates="loads")
