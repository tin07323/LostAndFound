import uuid
from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from backend.app.schemas.common import FoundItemCreate, FoundItemUpdate, FoundItemOut, CategoryOut, ItemTypeOut
from backend.app.dependencies.auth import get_current_user, verify_school_access
from backend.app.services.supabase_service import db

router = APIRouter(prefix="/found-items", tags=["Found Items"])

@router.get("/categories/all", response_model=List[CategoryOut])
def get_categories():
    return list(db.categories.values())

@router.get("/types/by-category/{category_id}", response_model=List[ItemTypeOut])
def get_types_by_category(category_id: str):
    return [t for t in db.item_types.values() if t["category_id"] == category_id]

@router.get("", response_model=List[FoundItemOut])
def list_found_items(
    school_id: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    item_type_id: Optional[str] = Query(None),
    color: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    user: dict = Depends(get_current_user)
):
    target_school = school_id or user.get("current_school_id")
    verify_school_access(target_school, user)

    results = []
    for item in db.found_items.values():
        if item["school_id"] != target_school:
            continue

        if category_id and item["category_id"] != category_id:
            continue

        if item_type_id and item["item_type_id"] != item_type_id:
            continue

        if color and item["color"].lower() != color.lower():
            continue

        if brand and brand.lower() not in (item.get("brand") or "").lower():
            continue

        if status_filter and item["status"] != status_filter:
            continue

        if keyword:
            kw = keyword.lower().strip()
            text_corpus = f"{item['item_name']} {item['description']} {item['location_found']} {item.get('brand', '')}".lower()
            if kw not in text_corpus:
                continue

        # Format item with relations
        cat = db.categories.get(item["category_id"], {})
        itype = db.item_types.get(item["item_type_id"], {})
        poster = db.profiles.get(item["posted_by"], {})

        results.append({
            **item,
            "category_name": cat.get("name", "ไม่ระบุ"),
            "item_type_name": itype.get("name", "ไม่ระบุ"),
            "poster_name": poster.get("display_name", "ผู้แจ้ง")
        })

    # Sort newest first
    results.sort(key=lambda x: x.get("created_at") or datetime.min, reverse=True)
    return results

@router.get("/{item_id}", response_model=FoundItemOut)
def get_found_item(item_id: str, user: dict = Depends(get_current_user)):
    item = db.found_items.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="ไม่พบสิ่งของที่ต้องการ")

    verify_school_access(item["school_id"], user)

    cat = db.categories.get(item["category_id"], {})
    itype = db.item_types.get(item["item_type_id"], {})
    poster = db.profiles.get(item["posted_by"], {})

    return {
        **item,
        "category_name": cat.get("name", "ไม่ระบุ"),
        "item_type_name": itype.get("name", "ไม่ระบุ"),
        "poster_name": poster.get("display_name", "ผู้แจ้ง")
    }

@router.post("", response_model=FoundItemOut)
def create_found_item(data: FoundItemCreate, user: dict = Depends(get_current_user)):
    school_id = user.get("current_school_id")
    verify_school_access(school_id, user)

    new_id = f"item-found-{uuid.uuid4().hex[:8]}"
    item_record = {
        "id": new_id,
        "school_id": school_id,
        "posted_by": user["id"],
        "item_name": data.item_name,
        "category_id": data.category_id,
        "item_type_id": data.item_type_id,
        "color": data.color,
        "brand": data.brand,
        "description": data.description,
        "photo_url": data.photo_url,
        "location_found": data.location_found,
        "date_found": data.date_found or date.today(),
        "status": "AVAILABLE",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    db.found_items[new_id] = item_record

    # Log audit
    log_id = f"log-{uuid.uuid4().hex[:8]}"
    db.audit_logs[log_id] = {
        "id": log_id,
        "school_id": school_id,
        "actor_id": user["id"],
        "action": "CREATE_FOUND_ITEM",
        "entity_type": "found_items",
        "entity_id": new_id,
        "metadata": {"item_name": data.item_name},
        "created_at": datetime.now()
    }

    cat = db.categories.get(data.category_id, {})
    itype = db.item_types.get(data.item_type_id, {})

    return {
        **item_record,
        "category_name": cat.get("name", "ไม่ระบุ"),
        "item_type_name": itype.get("name", "ไม่ระบุ"),
        "poster_name": user.get("display_name", "ผู้แจ้ง")
    }

@router.put("/{item_id}")
def update_found_item(item_id: str, data: FoundItemUpdate, user: dict = Depends(get_current_user)):
    item = db.found_items.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="ไม่พบสิ่งของที่ต้องการแก้ไข")

    # Only poster or admin can update
    if item["posted_by"] != user["id"] and user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="คุณไม่มีสิทธิ์แก้ไขโพสต์นี้")

    for k, v in data.model_dump(exclude_unset=True).items():
        item[k] = v
    item["updated_at"] = datetime.now()
    return item

@router.delete("/{item_id}")
def delete_found_item(item_id: str, user: dict = Depends(get_current_user)):
    item = db.found_items.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="ไม่พบสิ่งของที่ต้องการลบ")

    if item["posted_by"] != user["id"] and user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="คุณไม่มีสิทธิ์ลบโพสต์นี้")

    del db.found_items[item_id]
    return {"success": True, "message": "ลบข้อมูลสิ่งของเรียบร้อยแล้ว"}
