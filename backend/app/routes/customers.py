from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from app.extensions import db
from app.models import User, Customer

customers_bp = Blueprint("customers", __name__)


def _serialize(c):
    return {
        "id": c.id,
        "name": c.name,
        "phone": c.phone,
        "amount": c.amount,
        "paid": c.paid,
        "balance": c.balance,
        "dueDate": c.due_date.isoformat() if c.due_date else None,
        "status": c.status,
        "businessId": c.business_id,
    }


def _parse_date(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return None


@customers_bp.get("/customers")
@jwt_required()
def get_customers():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    rows = (Customer.query
            .filter_by(business_id=user.business_id)
            .order_by(Customer.name.asc())
            .all())
    return jsonify({"success": True, "data": [_serialize(c) for c in rows]})


@customers_bp.get("/customers/summary")
@jwt_required()
def customers_summary():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    base = Customer.query.filter_by(business_id=user.business_id)
    total_outstanding = base.with_entities(
        func.coalesce(func.sum(Customer.balance), 0)
    ).scalar() or 0

    overdue_count = base.filter(Customer.status == "Overdue").count()
    total_count = base.count()

    return jsonify({"success": True, "data": {
        "totalOutstanding": float(total_outstanding),
        "overdueCount": int(overdue_count),
        "count": int(total_count),
    }})


@customers_bp.post("/customers")
@jwt_required()
def create_customer():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"success": False, "message": "Customer name is required."}), 400

    amount = float(data.get("amount") or 0)
    paid = float(data.get("paid") or 0)

    customer = Customer(
        business_id=user.business_id,
        name=name,
        phone=data.get("phone"),
        amount=amount,
        paid=paid,
        balance=amount - paid,
        due_date=_parse_date(data.get("dueDate")),
        status=data.get("status", "Open"),
    )
    db.session.add(customer)
    db.session.commit()
    return jsonify({"success": True, "data": _serialize(customer),
                    "message": "Customer created successfully."}), 201


@customers_bp.put("/customers/<int:customer_id>")
@jwt_required()
def update_customer(customer_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    customer = Customer.query.filter_by(
        id=customer_id, business_id=user.business_id
    ).first()
    if not customer:
        return jsonify({"success": False, "message": "Customer not found"}), 404

    data = request.get_json(silent=True) or {}

    if data.get("name"):
        customer.name = data["name"].strip()
    if "phone" in data:
        customer.phone = data["phone"]
    if data.get("amount") is not None:
        customer.amount = float(data["amount"])
    if data.get("paid") is not None:
        customer.paid = float(data["paid"])
    if data.get("status"):
        customer.status = data["status"]
    if "dueDate" in data:
        customer.due_date = _parse_date(data["dueDate"])

    # Always recompute balance from amount − paid
    customer.balance = float(customer.amount or 0) - float(customer.paid or 0)

    db.session.commit()
    return jsonify({"success": True, "data": _serialize(customer),
                    "message": "Customer updated successfully."})


@customers_bp.delete("/customers/<int:customer_id>")
@jwt_required()
def delete_customer(customer_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    customer = Customer.query.filter_by(
        id=customer_id, business_id=user.business_id
    ).first()
    if not customer:
        return jsonify({"success": False, "message": "Customer not found"}), 404

    db.session.delete(customer)
    db.session.commit()
    return jsonify({"success": True, "message": "Customer deleted."})