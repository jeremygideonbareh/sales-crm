import csv
import io
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import StreamingResponse

from ..database import get_db
from ..models.user import User
from ..models.lead import Lead
from .deps import require_role

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.get("/export")
async def export_leads(
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Lead).order_by(Lead.id))
    leads = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "ID",
            "Business Name",
            "Contact Name",
            "Phone",
            "Email",
            "Website",
            "Status",
            "Deal Value",
            "Commission",
            "Notes",
            "Created At",
        ]
    )
    for l in leads:
        writer.writerow(
            [
                l.id,
                l.business_name,
                l.contact_name,
                l.phone,
                l.email,
                l.website,
                l.status.value if l.status else "",
                l.deal_value,
                l.commission,
                l.notes,
                l.created_at,
            ]
        )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads.csv"},
    )
