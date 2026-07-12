import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.user import User, UserRole
from ..schemas.lead import LeadResponse, AssignRequest, StatusUpdateRequest, DeleteLeadsRequest, LeadListResponse
from ..services.leads import get_leads, assign_leads, bulk_create_leads
from ..utils.csv_parser import parse_lead_file
from ..models.lead import LeadStatus, Lead
from ..models.call_log import CallLog
from .deps import get_current_user, require_role

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.get("", response_model=LeadListResponse)
async def list_leads(
    status: str = Query(None),
    assigned_to: int = Query(None),
    search: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    leads, total = await get_leads(db, user, status, assigned_to, search, skip, limit)
    return {"total": total, "leads": [LeadResponse.model_validate(l) for l in leads]}


@router.post("/upload")
async def upload_leads(
    file: UploadFile = File(...),
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename.endswith((".csv", ".xls", ".xlsx")):
        raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or Excel.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        leads_data = list(parse_lead_file(tmp_path))
        if not leads_data:
            raise HTTPException(status_code=400, detail="No valid leads found in file")
        count = await bulk_create_leads(db, leads_data)
        return {"imported": count}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        import os
        os.unlink(tmp_path)


@router.post("/assign")
async def assign_batch(
    req: AssignRequest,
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    try:
        count = await assign_leads(db, req.lead_ids, req.rep_id, user.id)
        return {"assigned": count}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: int,
    req: StatusUpdateRequest,
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    lead = await db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    status_before = lead.status
    lead.status = LeadStatus(req.status)

    if req.notes is not None:
        lead.notes = req.notes

    if lead.status == LeadStatus.DEAL_CLOSED:
        deal_val = req.deal_value or 0
        lead.deal_value = deal_val
        lead.commission = round(float(deal_val) * 0.20, 2)
        lead.closed_by = user.id
    elif status_before == LeadStatus.DEAL_CLOSED:
        lead.deal_value = None
        lead.commission = None
        lead.closed_by = None
    elif req.deal_value is not None:
        lead.deal_value = req.deal_value

    call_log = CallLog(
        lead_id=lead_id,
        rep_id=lead.assigned_to or user.id,
        status_before=status_before,
        status_after=lead.status,
        notes=req.notes,
    )
    db.add(call_log)
    await db.commit()
    await db.refresh(lead)
    return LeadResponse.model_validate(lead)


@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: int,
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    lead = await db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    await db.delete(lead)
    await db.commit()
    return {"deleted": lead_id}


@router.post("/delete-bulk")
async def delete_leads_bulk(
    req: DeleteLeadsRequest,
    user: User = Depends(require_role("manager")),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import delete as sa_delete
    await db.execute(sa_delete(Lead).where(Lead.id.in_(req.lead_ids)))
    await db.commit()
    return {"deleted": len(req.lead_ids)}
