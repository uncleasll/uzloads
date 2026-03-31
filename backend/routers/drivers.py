from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from models import get_db, Driver, DriverStatus
from schemas import DriverCreate, DriverUpdate, DriverOut, DriverList

router = APIRouter()


@router.get("/", response_model=DriverList)
def list_drivers(
    status: Optional[DriverStatus] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    q = db.query(Driver)
    if status:
        q = q.filter(Driver.status == status)
    if search:
        like = f"%{search}%"
        q = q.filter(
            (Driver.first_name.ilike(like))
            | (Driver.last_name.ilike(like))
            | (Driver.truck_number.ilike(like))
            | (Driver.email.ilike(like))
        )
    total = q.count()
    items = q.order_by(Driver.last_name).offset(skip).limit(limit).all()
    return DriverList(items=items, total=total)


@router.post("/", response_model=DriverOut, status_code=201)
def create_driver(payload: DriverCreate, db: Session = Depends(get_db)):
    driver = Driver(**payload.dict())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


@router.get("/{driver_id}", response_model=DriverOut)
def get_driver(driver_id: int, db: Session = Depends(get_db)):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(404, "Driver not found")
    return driver


@router.patch("/{driver_id}", response_model=DriverOut)
def update_driver(driver_id: int, payload: DriverUpdate, db: Session = Depends(get_db)):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(404, "Driver not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(driver, field, value)
    db.commit()
    db.refresh(driver)
    return driver


@router.delete("/{driver_id}", status_code=204)
def delete_driver(driver_id: int, db: Session = Depends(get_db)):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(404, "Driver not found")
    db.delete(driver)
    db.commit()
