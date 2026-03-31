from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from datetime import date
from models import get_db, Load, Driver, LoadStatus
from schemas import LoadCreate, LoadUpdate, LoadOut, LoadList

router = APIRouter()


def _enrich(load: Load) -> dict:
    d = {c.name: getattr(load, c.name) for c in load.__table__.columns}
    d["attachments"] = load.attachments
    d["driver_name"] = load.driver.full_name if load.driver else None
    d["total_rate"] = load.rate + load.detention + load.fuel_surcharge
    return d


@router.get("/", response_model=LoadList)
def list_loads(
    status: Optional[LoadStatus] = None,
    driver_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    q = db.query(Load).options(joinedload(Load.driver), joinedload(Load.attachments))
    if status:
        q = q.filter(Load.status == status)
    if driver_id:
        q = q.filter(Load.driver_id == driver_id)
    if date_from:
        q = q.filter(Load.pickup_date >= date_from)
    if date_to:
        q = q.filter(Load.pickup_date <= date_to)
    if search:
        like = f"%{search}%"
        q = q.filter(
            (Load.load_number.ilike(like))
            | (Load.broker_name.ilike(like))
            | (Load.pickup_city.ilike(like))
            | (Load.delivery_city.ilike(like))
        )
    total = q.count()
    items = q.order_by(Load.pickup_date.desc()).offset(skip).limit(limit).all()
    return LoadList(items=[_enrich(l) for l in items], total=total)


@router.post("/", response_model=LoadOut, status_code=201)
def create_load(payload: LoadCreate, db: Session = Depends(get_db)):
    data = payload.dict()
    data["total_rate"] = data["rate"] + data["detention"] + data["fuel_surcharge"]
    load = Load(**data)
    db.add(load)
    db.commit()
    db.refresh(load)
    # reload with relationships
    load = db.query(Load).options(joinedload(Load.driver), joinedload(Load.attachments)).filter(Load.id == load.id).first()
    return _enrich(load)


@router.get("/{load_id}", response_model=LoadOut)
def get_load(load_id: int, db: Session = Depends(get_db)):
    load = db.query(Load).options(joinedload(Load.driver), joinedload(Load.attachments)).filter(Load.id == load_id).first()
    if not load:
        raise HTTPException(404, "Load not found")
    return _enrich(load)


@router.patch("/{load_id}", response_model=LoadOut)
def update_load(load_id: int, payload: LoadUpdate, db: Session = Depends(get_db)):
    load = db.query(Load).options(joinedload(Load.driver), joinedload(Load.attachments)).filter(Load.id == load_id).first()
    if not load:
        raise HTTPException(404, "Load not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(load, field, value)
    load.total_rate = load.rate + load.detention + load.fuel_surcharge
    db.commit()
    db.refresh(load)
    load = db.query(Load).options(joinedload(Load.driver), joinedload(Load.attachments)).filter(Load.id == load.id).first()
    return _enrich(load)


@router.delete("/{load_id}", status_code=204)
def delete_load(load_id: int, db: Session = Depends(get_db)):
    load = db.query(Load).filter(Load.id == load_id).first()
    if not load:
        raise HTTPException(404, "Load not found")
    db.delete(load)
    db.commit()
