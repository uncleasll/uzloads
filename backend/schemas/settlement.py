from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from models.settlement import SettlementStatus


class DeductionItem(BaseModel):
    fuel: float = 0.0
    eld: float = 0.0
    insurance: float = 0.0
    ifta: float = 0.0
    admin: float = 0.0
    other: float = 0.0
    other_label: Optional[str] = None


class SettlementCreate(BaseModel):
    driver_id: int
    phase_label: str
    phase_start_date: datetime
    phase_end_date: datetime
    load_ids: List[int] = []
    deductions: DeductionItem = DeductionItem()
    notes: Optional[str] = None


class SettlementUpdate(BaseModel):
    phase_label: Optional[str] = None
    deductions: Optional[DeductionItem] = None
    notes: Optional[str] = None
    status: Optional[SettlementStatus] = None


class SettlementOut(BaseModel):
    id: int
    settlement_number: str
    driver_id: int
    driver_name: Optional[str] = None
    phase_label: str
    phase_start_date: datetime
    phase_end_date: datetime
    gross_revenue: float
    driver_percentage: float
    driver_gross: float
    deductions: Dict[str, Any]
    total_deductions: float
    grand_total: float
    status: SettlementStatus
    notes: Optional[str] = None
    pdf_path: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    finalized_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SettlementList(BaseModel):
    items: list[SettlementOut]
    total: int
