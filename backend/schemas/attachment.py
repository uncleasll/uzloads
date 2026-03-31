from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.settlement import AttachmentType, SettlementStatus


class AttachmentOut(BaseModel):
    id: int
    load_id: int
    attachment_type: AttachmentType
    filename: str
    original_filename: str
    file_path: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
