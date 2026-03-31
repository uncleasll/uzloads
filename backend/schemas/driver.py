from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import date, datetime
from models.driver import PayType, DriverStatus


class DriverBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    status: DriverStatus = DriverStatus.ACTIVE
    truck_number: Optional[str] = None
    trailer_number: Optional[str] = None
    pay_type: PayType = PayType.FREIGHT_PERCENT
    pay_rate: float = 0.32
    cdl_number: Optional[str] = None
    cdl_expiration: Optional[date] = None
    medical_card_expiration: Optional[date] = None
    drug_test_date: Optional[date] = None
    drug_test_result: Optional[str] = None
    mvr_date: Optional[date] = None
    mvr_status: Optional[str] = None
    notes: Optional[str] = None


class DriverCreate(DriverBase):
    pass


class DriverUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[DriverStatus] = None
    truck_number: Optional[str] = None
    trailer_number: Optional[str] = None
    pay_type: Optional[PayType] = None
    pay_rate: Optional[float] = None
    cdl_number: Optional[str] = None
    cdl_expiration: Optional[date] = None
    medical_card_expiration: Optional[date] = None
    drug_test_date: Optional[date] = None
    drug_test_result: Optional[str] = None
    mvr_date: Optional[date] = None
    mvr_status: Optional[str] = None
    notes: Optional[str] = None


class DriverOut(DriverBase):
    id: int
    full_name: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @validator("full_name", pre=True, always=True)
    def compute_full_name(cls, v, values):
        return f"{values.get('first_name', '')} {values.get('last_name', '')}".strip()


class DriverList(BaseModel):
    items: list[DriverOut]
    total: int
