import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from models import get_db, Load
from models.settlement import Attachment, AttachmentType
from schemas.attachment import AttachmentOut

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE_MB", 25)) * 1024 * 1024


@router.post("/loads/{load_id}/attachments", response_model=AttachmentOut, status_code=201)
async def upload_attachment(
    load_id: int,
    attachment_type: AttachmentType = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    load = db.query(Load).filter(Load.id == load_id).first()
    if not load:
        raise HTTPException(404, "Load not found")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(413, f"File too large. Max {os.getenv('MAX_FILE_SIZE_MB', 25)}MB")

    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid.uuid4().hex}{ext}"
    load_dir = os.path.join(UPLOAD_DIR, f"load_{load_id}")
    os.makedirs(load_dir, exist_ok=True)
    file_path = os.path.join(load_dir, unique_name)

    with open(file_path, "wb") as f:
        f.write(contents)

    attachment = Attachment(
        load_id=load_id,
        attachment_type=attachment_type,
        filename=unique_name,
        original_filename=file.filename,
        file_path=f"load_{load_id}/{unique_name}",
        file_size=len(contents),
        mime_type=file.content_type,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment


@router.delete("/attachments/{attachment_id}", status_code=204)
def delete_attachment(attachment_id: int, db: Session = Depends(get_db)):
    att = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not att:
        raise HTTPException(404, "Attachment not found")

    # Delete file from disk
    full_path = os.path.join(UPLOAD_DIR, att.file_path)
    if os.path.exists(full_path):
        os.remove(full_path)

    db.delete(att)
    db.commit()
