from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Supplier

suppliers_bp = Blueprint("suppliers", __name__)


@suppliers_bp.get("/suppliers")
@jwt_required()
def get_suppliers():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    suppliers = Supplier.query.filter_by(business_id=user.business_id).all()
    return jsonify({"success": True, "data": [{
        "id": s.id,
        "name": s.name,
        "contactPerson": s.contact_person,
        "phone": s.phone,
        "previousAveragePrice": s.previous_average_price,
        "currentAveragePrice": s.current_average_price,
        "priceIncrease": s.price_increase,
    } for s in suppliers]})


@suppliers_bp.post("/suppliers")
@jwt_required()
def create_supplier():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json(silent=True) or {}

    supplier = Supplier(
        business_id=user.business_id,
        name=data.get("name", "New Supplier"),
        contact_person=data.get("contactPerson"),
        phone=data.get("phone"),
        previous_average_price=float(data.get("previousAveragePrice") or 0),
        current_average_price=float(data.get("currentAveragePrice") or 0),
        price_increase=float(data.get("priceIncrease") or 0),
    )
    db.session.add(supplier)
    db.session.commit()
    return jsonify({"success": True, "data": {"id": supplier.id}, "message": "Supplier added successfully."}), 201
