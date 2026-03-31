from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from models.load import LoadStatus
from .attachment import AttachmentOut


class LoadBase(BaseModel):
    load_number: str
    driver_id: Optional[int] = None
    broker_name: Optional[str] = None
    broker_contact: Optional[str] = None
    broker_phone: Optional[str] = None
    broker_email: Optional[str] = None
    broker_mc: Optional[str] = None
    pickup_city: str
    pickup_state: str
    pickup_zip: Optional[str] = None
    pickup_date: date
    pickup_time: Optional[str] = None
    shipper_name: Optional[str] = None
    shipper_address: Optional[str] = None
    delivery_city: str
    delivery_state: str
    delivery_zip: Optional[str] = None
    delivery_date: date
    delivery_time: Optional[str] = None
    consignee_name: Optional[str] = None
    consignee_address: Optional[str] = None
    rate: float = 0.0
    detention: float = 0.0
    lumper_cost: float = 0.0
    fuel_surcharge: float = 0.0
    status: LoadStatus = LoadStatus.NEW
    commodity: Optional[str] = None
    weight: Optional[float] = None
    miles: Optional[int] = None
    equipment_type: Optional[str] = None
    reference_number: Optional[str] = None
    po_number: Optional[str] = None
    notes: Optional[str] = None


class LoadCreate(LoadBase):
    pass


class LoadUpdate(BaseModel):
    load_number: Optional[str] = None
    driver_id: Optional[int] = None
    broker_name: Optional[str] = None
    broker_contact: Optional[str] = None
    broker_phone: Optional[str] = None
    broker_email: Optional[str] = None
    broker_mc: Optional[str] = None
    pickup_city: Optional[str] = None
    pickup_state: Optional[str] = None
    pickup_zip: Optional[str] = None
    pickup_date: Optional[date] = None
    pickup_time: Optional[str] = None
    shipper_name: Optional[str] = None
    shipper_address: Optional[str] = None
    delivery_city: Optional[str] = None
    delivery_state: Optional[str] = None
    delivery_zip: Optional[str] = None
    delivery_date: Optional[date] = None
    delivery_time: Optional[str] = None
    consignee_name: Optional[str] = None
    consignee_address: Optional[str] = None
    rate: Optional[float] = None
    detention: Optional[float] = None
    lumper_cost: Optional[float] = None
    fuel_surcharge: Optional[float] = None
    status: Optional[LoadStatus] = None
    commodity: Optional[str] = None
    weight: Optional[float] = None
    miles: Optional[int] = None
    equipment_type: Optional[str] = None
    reference_number: Optional[str] = None
    po_number: Optional[str] = None
    notes: Optional[str] = None


class LoadOut(LoadBase):
    id: int
    total_rate: float
    settlement_id: Optional[int] = None
    attachments: List[AttachmentOut] = []
    driver_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LoadList(BaseModel):
    items: list[LoadOut]
    total: int
