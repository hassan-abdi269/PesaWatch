from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from app.extensions import db
from app.models import User, Supplier

suppliers_bp = Blueprint("suppliers", __name__)


def _compute_increase(prev, curr):
    prev = float(prev or 0)
    curr = float(curr or 0)
    if prev <= 0:
        return 0.0
    return round(((curr - prev) / prev) * 100, 2)


def _serialize(s):
    return {
        "id": s.id,
        "name": s.name,
        "contactPerson": s.contact_person,
        "phone": s.phone,
        "previousAveragePrice": s.previous_average_price,
        "currentAveragePrice": s.current_average_price,
        "priceIncrease": s.price_increase,
        "businessId": s.business_id,
    }


@suppliers_bp.get("/suppliers")
@jwt_required()
def get_suppliers():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    rows = (Supplier.query
            .filter_by(business_id=user.business_id)
            .order_by(Supplier.name.asc())
            .all())
    return jsonify({"success": True, "data": [_serialize(s) for s in rows]})


@suppliers_bp.get("/suppliers/summary")
@jwt_required()
def suppliers_summary():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    base = Supplier.query.filter_by(business_id=user.business_id)
    count = base.count()
    avg_increase = base.with_entities(
        func.coalesce(func.avg(Supplier.price_increase), 0)
    ).scalar() or 0
    flagged = base.filter(Supplier.price_increase > 10).count()

    return jsonify({"success": True, "data": {
        "count": int(count),
        "averageIncrease": round(float(avg_increase), 2),
        "flagged": int(flagged),
    }})


@suppliers_bp.post("/suppliers")
@jwt_required()
def create_supplier():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"success": False, "message": "Supplier name is required."}), 400

    prev = float(data.get("previousAveragePrice") or 0)
    curr = float(data.get("currentAveragePrice") or 0)

    supplier = Supplier(
        business_id=user.business_id,
        name=name,
        contact_person=data.get("contactPerson"),
        phone=data.get("phone"),
        previous_average_price=prev,
        current_average_price=curr,
        price_increase=_compute_increase(prev, curr),
    )
    db.session.add(supplier)
    db.session.commit()
    return jsonify({"success": True, "data": _serialize(supplier),
                    "message": "Supplier added successfully."}), 201


@suppliers_bp.put("/suppliers/<int:supplier_id>")
@jwt_required()
def update_supplier(supplier_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    supplier = Supplier.query.filter_by(
        id=supplier_id, business_id=user.business_id
    ).first()
    if not supplier:
        return jsonify({"success": False, "message": "Supplier not found"}), 404

    data = request.get_json(silent=True) or {}

    if data.get("name"):
        supplier.name = data["name"].strip()
    if "contactPerson" in data:
        supplier.contact_person = data["contactPerson"]
    if "phone" in data:
        supplier.phone = data["phone"]
    if data.get("previousAveragePrice") is not None:
        supplier.previous_average_price = float(data["previousAveragePrice"])
    if data.get("currentAveragePrice") is not None:
        supplier.current_average_price = float(data["currentAveragePrice"])

    # Always recompute increase from the two prices
    supplier.price_increase = _compute_increase(
        supplier.previous_average_price, supplier.current_average_price
    )

    db.session.commit()
    return jsonify({"success": True, "data": _serialize(supplier),
                    "message": "Supplier updated successfully."})


@suppliers_bp.delete("/suppliers/<int:supplier_id>")
@jwt_required()
def delete_supplier(supplier_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    supplier = Supplier.query.filter_by(
        id=supplier_id, business_id=user.business_id
    ).first()
    if not supplier:
        return jsonify({"success": False, "message": "Supplier not found"}), 404

    db.session.delete(supplier)
    db.session.commit()
    return jsonify({"success": True, "message": "Supplier deleted."})