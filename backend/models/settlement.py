from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SAEnum, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .base import Base


class AttachmentType(str, enum.Enum):
    RATE_CONFIRMATION = "rate_confirmation"
    BOL = "bol"
    LUMPER_RECEIPT = "lumper_receipt"
    POD = "pod"
    OTHER = "other"


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    load_id = Column(Integer, ForeignKey("loads.id"), nullable=False)
    attachment_type = Column(SAEnum(AttachmentType), nullable=False)
    filename = Column(String(500), nullable=False)
    original_filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    uploaded_by = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    load = relationship("Load", back_populates="attachments")


class SettlementStatus(str, enum.Enum):
    DRAFT = "draft"
    FINALIZED = "finalized"
    PAID = "paid"


class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True, index=True)
    settlement_number = Column(String(50), unique=True, nullable=False, index=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)

    # Phase / Month
    phase_label = Column(String(100), nullable=False)  # e.g., "June 2025 – Phase 1"
    phase_start_date = Column(DateTime, nullable=False)
    phase_end_date = Column(DateTime, nullable=False)

    # Financial Summary
    gross_revenue = Column(Float, default=0.0)
    driver_percentage = Column(Float, default=0.32)
    driver_gross = Column(Float, default=0.0)

    # Deductions (stored as JSON for flexibility)
    deductions = Column(JSON, default={})
    # Example: {"fuel": 300.00, "eld": 45.00, "insurance": 150.00, "ifta": 75.00, "admin": 25.00}

    total_deductions = Column(Float, default=0.0)
    grand_total = Column(Float, default=0.0)  # driver_gross - total_deductions

    status = Column(SAEnum(SettlementStatus), default=SettlementStatus.DRAFT)
    notes = Column(Text, nullable=True)
    pdf_path = Column(String(1000), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    finalized_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    driver = relationship("Driver", back_populates="settlements")
    loads = relationship("Load", back_populates="settlement")
