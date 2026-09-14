import uuid
from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from backend.app.schemas.common import LostReportCreate, LostReportUpdate, LostReportOut
from backend.app.dependencies.auth import get_current_user, verify_school_access
from backend.app.services.supabase_service import db

router = APIRouter(prefix="/lost-reports", tags=["Lost Reports"])

@router.get("", response_model=List[LostReportOut])
def list_lost_reports(
    school_id: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    item_type_id: Optional[str] = Query(None),
    color: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    user: dict = Depends(get_current_user)
):
    target_school = school_id or user.get("current_school_id")
    verify_school_access(target_school, user)

    results = []
    for rep in db.lost_reports.values():
        if rep["school_id"] != target_school:
            continue

        if category_id and rep["category_id"] != category_id:
            continue

        if item_type_id and rep["item_type_id"] != item_type_id:
            continue

        if color and rep["color"].lower() != color.lower():
            continue

        if status_filter and rep["status"] != status_filter:
            continue

        if keyword:
            kw = keyword.lower().strip()
            text_corpus = f"{rep['item_name']} {rep['description']} {rep['last_known_location']} {rep.get('brand', '')}".lower()
            if kw not in text_corpus:
                continue

        cat = db.categories.get(rep["category_id"], {})
        itype = db.item_types.get(rep["item_type_id"], {})
        reporter = db.profiles.get(rep["reported_by"], {})

        results.append({
            **rep,
            "category_name": cat.get("name", "ไม่ระบุ"),
            "item_type_name": itype.get("name", "ไม่ระบุ"),
            "reporter_name": reporter.get("display_name", "ผู้แจ้งของหาย")
        })

    results.sort(key=lambda x: x.get("created_at") or datetime.min, reverse=True)
    return results

@router.get("/{report_id}", response_model=LostReportOut)
def get_lost_report(report_id: str, user: dict = Depends(get_current_user)):
    rep = db.lost_reports.get(report_id)
    if not rep:
        raise HTTPException(status_code=404, detail="ไม่พบรายงานของหายนี้")

    verify_school_access(rep["school_id"], user)

    cat = db.categories.get(rep["category_id"], {})
    itype = db.item_types.get(rep["item_type_id"], {})
    reporter = db.profiles.get(rep["reported_by"], {})

    return {
        **rep,
        "category_name": cat.get("name", "ไม่ระบุ"),
        "item_type_name": itype.get("name", "ไม่ระบุ"),
        "reporter_name": reporter.get("display_name", "ผู้แจ้งของหาย")
    }

@router.post("", response_model=LostReportOut)
def create_lost_report(data: LostReportCreate, user: dict = Depends(get_current_user)):
    school_id = user.get("current_school_id")
    verify_school_access(school_id, user)

    new_id = f"report-lost-{uuid.uuid4().hex[:8]}"
    report_record = {
        "id": new_id,
        "school_id": school_id,
        "reported_by": user["id"],
        "item_name": data.item_name,
        "category_id": data.category_id,
        "item_type_id": data.item_type_id,
        "color": data.color,
        "brand": data.brand,
        "description": data.description,
        "photo_url": data.photo_url,
        "last_known_location": data.last_known_location,
        "date_lost": data.date_lost or date.today(),
        "status": "AVAILABLE",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    db.lost_reports[new_id] = report_record

    cat = db.categories.get(data.category_id, {})
    itype = db.item_types.get(data.item_type_id, {})

    return {
        **report_record,
        "category_name": cat.get("name", "ไม่ระบุ"),
        "item_type_name": itype.get("name", "ไม่ระบุ"),
        "reporter_name": user.get("display_name", "ผู้แจ้งของหาย")
    }

@router.put("/{report_id}")
def update_lost_report(report_id: str, data: LostReportUpdate, user: dict = Depends(get_current_user)):
    rep = db.lost_reports.get(report_id)
    if not rep:
        raise HTTPException(status_code=404, detail="ไม่พบรายงานของหายที่ต้องการแก้ไข")

    if rep["reported_by"] != user["id"] and user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="คุณไม่มีสิทธิ์แก้ไขรายงานนี้")

    for k, v in data.model_dump(exclude_unset=True).items():
        rep[k] = v
    rep["updated_at"] = datetime.now()
    return rep

@router.delete("/{report_id}")
def delete_lost_report(report_id: str, user: dict = Depends(get_current_user)):
    rep = db.lost_reports.get(report_id)
    if not rep:
        raise HTTPException(status_code=404, detail="ไม่พบรายงานของหายที่ต้องการลบ")

    if rep["reported_by"] != user["id"] and user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="คุณไม่มีสิทธิ์ลบรายงานนี้")

    del db.lost_reports[report_id]
    return {"success": True, "message": "ลบรายงานของหายเรียบร้อยแล้ว"}
