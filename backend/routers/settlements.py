import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from datetime import datetime

from models import get_db, Driver, Load, LoadStatus
from models.settlement import Settlement, SettlementStatus
from schemas import SettlementCreate, SettlementUpdate, SettlementOut, SettlementList
from services.pdf_service import generate_settlement_pdf

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")


def _enrich(s: Settlement) -> dict:
    d = {c.name: getattr(s, c.name) for c in s.__table__.columns}
    d["driver_name"] = s.driver.full_name if s.driver else None
    return d


def _generate_settlement_number(db: Session) -> str:
    count = db.query(Settlement).count()
    now = datetime.now()
    return f"SET-{now.year}{now.month:02d}-{count + 1:04d}"


@router.get("/", response_model=SettlementList)
def list_settlements(
    driver_id: Optional[int] = None,
    status: Optional[SettlementStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    q = db.query(Settlement).options(joinedload(Settlement.driver))
    if driver_id:
        q = q.filter(Settlement.driver_id == driver_id)
    if status:
        q = q.filter(Settlement.status == status)
    total = q.count()
    items = q.order_by(Settlement.created_at.desc()).offset(skip).limit(limit).all()
    return SettlementList(items=[_enrich(s) for s in items], total=total)


@router.post("/", response_model=SettlementOut, status_code=201)
def create_settlement(payload: SettlementCreate, db: Session = Depends(get_db)):
    driver = db.query(Driver).filter(Driver.id == payload.driver_id).first()
    if not driver:
        raise HTTPException(404, "Driver not found")

    # Get loads for this settlement
    loads = []
    if payload.load_ids:
        loads = db.query(Load).filter(
            Load.id.in_(payload.load_ids),
            Load.status == LoadStatus.DELIVERED,
        ).all()

    # Calculate financials
    gross_revenue = sum(l.total_rate for l in loads)
    driver_gross = gross_revenue * driver.pay_rate
    deductions_dict = payload.deductions.dict()
    total_deductions = sum(
        v for k, v in deductions_dict.items()
        if k not in ("other_label",) and isinstance(v, (int, float))
    )
    grand_total = driver_gross - total_deductions

    settlement = Settlement(
        settlement_number=_generate_settlement_number(db),
        driver_id=payload.driver_id,
        phase_label=payload.phase_label,
        phase_start_date=payload.phase_start_date,
        phase_end_date=payload.phase_end_date,
        gross_revenue=gross_revenue,
        driver_percentage=driver.pay_rate,
        driver_gross=driver_gross,
        deductions=deductions_dict,
        total_deductions=total_deductions,
        grand_total=grand_total,
        notes=payload.notes,
    )
    db.add(settlement)
    db.flush()  # get ID

    # Link loads to settlement
    for load in loads:
        load.settlement_id = settlement.id

    db.commit()
    db.refresh(settlement)
    settlement = db.query(Settlement).options(joinedload(Settlement.driver)).filter(Settlement.id == settlement.id).first()
    return _enrich(settlement)


@router.get("/{settlement_id}", response_model=SettlementOut)
def get_settlement(settlement_id: int, db: Session = Depends(get_db)):
    s = db.query(Settlement).options(joinedload(Settlement.driver)).filter(Settlement.id == settlement_id).first()
    if not s:
        raise HTTPException(404, "Settlement not found")
    return _enrich(s)


@router.patch("/{settlement_id}", response_model=SettlementOut)
def update_settlement(settlement_id: int, payload: SettlementUpdate, db: Session = Depends(get_db)):
    s = db.query(Settlement).options(joinedload(Settlement.driver)).filter(Settlement.id == settlement_id).first()
    if not s:
        raise HTTPException(404, "Settlement not found")
    if s.status == SettlementStatus.PAID:
        raise HTTPException(400, "Cannot edit a paid settlement")

    for field, value in payload.dict(exclude_unset=True).items():
        if field == "deductions" and value is not None:
            deductions_dict = value.dict() if hasattr(value, "dict") else value
            setattr(s, "deductions", deductions_dict)
            total_ded = sum(
                v for k, v in deductions_dict.items()
                if k not in ("other_label",) and isinstance(v, (int, float))
            )
            s.total_deductions = total_ded
            s.grand_total = s.driver_gross - total_ded
        else:
            setattr(s, field, value)

    if payload.status == SettlementStatus.FINALIZED:
        s.finalized_at = datetime.utcnow()

    db.commit()
    db.refresh(s)
    s = db.query(Settlement).options(joinedload(Settlement.driver)).filter(Settlement.id == s.id).first()
    return _enrich(s)


@router.post("/{settlement_id}/generate-pdf")
def generate_pdf(settlement_id: int, db: Session = Depends(get_db)):
    s = db.query(Settlement).options(
        joinedload(Settlement.driver),
        joinedload(Settlement.loads),
    ).filter(Settlement.id == settlement_id).first()
    if not s:
        raise HTTPException(404, "Settlement not found")

    pdf_dir = os.path.join(UPLOAD_DIR, "settlements")
    os.makedirs(pdf_dir, exist_ok=True)
    pdf_filename = f"settlement_{s.settlement_number}.pdf"
    pdf_path = os.path.join(pdf_dir, pdf_filename)

    generate_settlement_pdf(s, s.driver, s.loads, pdf_path)

    s.pdf_path = f"settlements/{pdf_filename}"
    db.commit()

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=pdf_filename,
    )


@router.delete("/{settlement_id}", status_code=204)
def delete_settlement(settlement_id: int, db: Session = Depends(get_db)):
    s = db.query(Settlement).filter(Settlement.id == settlement_id).first()
    if not s:
        raise HTTPException(404, "Settlement not found")
    if s.status == SettlementStatus.PAID:
        raise HTTPException(400, "Cannot delete a paid settlement")
    # Unlink loads
    for load in s.loads:
        load.settlement_id = None
    db.delete(s)
    db.commit()
