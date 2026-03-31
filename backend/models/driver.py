from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Enum as SAEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .base import Base


class PayType(str, enum.Enum):
    FREIGHT_PERCENT = "freight_percent"
    FLAT_RATE = "flat_rate"
    PER_MILE = "per_mile"


class DriverStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    phone = Column(String(20), nullable=True)
    status = Column(SAEnum(DriverStatus), default=DriverStatus.ACTIVE)

    # Equipment
    truck_number = Column(String(50), nullable=True)
    trailer_number = Column(String(50), nullable=True)

    # Pay Configuration
    pay_type = Column(SAEnum(PayType), default=PayType.FREIGHT_PERCENT)
    pay_rate = Column(Float, default=0.32)  # 0.32 = 32%, or dollar amount for flat/mile

    # Compliance Documents
    cdl_number = Column(String(100), nullable=True)
    cdl_expiration = Column(Date, nullable=True)
    medical_card_expiration = Column(Date, nullable=True)
    drug_test_date = Column(Date, nullable=True)
    drug_test_result = Column(String(20), nullable=True)  # pass/fail/pending
    mvr_date = Column(Date, nullable=True)
    mvr_status = Column(String(20), nullable=True)  # clear/review/fail

    # Metadata
    notes = Column(String(1000), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    loads = relationship("Load", back_populates="driver")
    settlements = relationship("Settlement", back_populates="driver")

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
