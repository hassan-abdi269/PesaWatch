from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Customer

customers_bp = Blueprint("customers", __name__)


@customers_bp.get("/customers")
@jwt_required()
def get_customers():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    customers = Customer.query.filter_by(business_id=user.business_id).all()
    return jsonify({"success": True, "data": [{
        "id": c.id,
        "name": c.name,
        "phone": c.phone,
        "amount": c.amount,
        "paid": c.paid,
        "balance": c.balance,
        "dueDate": c.due_date.isoformat() if c.due_date else None,
        "status": c.status,
    } for c in customers]})


@customers_bp.post("/customers")
@jwt_required()
def create_customer():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json(silent=True) or {}

    customer = Customer(
        business_id=user.business_id,
        name=data.get("name", "New Customer"),
        phone=data.get("phone"),
        amount=float(data.get("amount") or 0),
        paid=float(data.get("paid") or 0),
        balance=float(data.get("balance") or (float(data.get("amount") or 0) - float(data.get("paid") or 0))),
        status=data.get("status", "Open"),
    )
    db.session.add(customer)
    db.session.commit()
    return jsonify({"success": True, "data": {"id": customer.id}, "message": "Customer created successfully."}), 201
