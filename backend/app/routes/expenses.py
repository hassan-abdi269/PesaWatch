from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from app.extensions import db
from app.models import User, Expense

expenses_bp = Blueprint("expenses", __name__)


def _serialize(e):
    return {
        "id": e.id,
        "date": e.date.isoformat() if e.date else None,
        "category": e.category,
        "description": e.description,
        "amount": e.amount,
        "paymentMethod": e.payment_method,
        "recordedBy": e.recorded_by,
        "businessId": e.business_id,
    }


@expenses_bp.get("/expenses")
@jwt_required()
def get_expenses():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    rows = (Expense.query
            .filter_by(business_id=user.business_id)
            .order_by(Expense.date.desc())
            .all())
    return jsonify({"success": True, "data": [_serialize(e) for e in rows]})


@expenses_bp.get("/expenses/summary")
@jwt_required()
def expenses_summary():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    base = Expense.query.filter_by(business_id=user.business_id)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    total = base.with_entities(func.coalesce(func.sum(Expense.amount), 0)).scalar() or 0
    today = (base.filter(Expense.date >= today_start)
             .with_entities(func.coalesce(func.sum(Expense.amount), 0)).scalar() or 0)
    count = base.count()

    return jsonify({"success": True, "data": {
        "totalExpenses": float(total),
        "todayExpenses": float(today),
        "count": int(count),
    }})


@expenses_bp.post("/expenses")
@jwt_required()
def create_expense():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    amount = float(data.get("amount") or 0)
    if amount <= 0:
        return jsonify({"success": False, "message": "Amount must be greater than 0."}), 400

    expense = Expense(
        business_id=user.business_id,
        category=data.get("category", "Other"),
        description=data.get("description", "Expense"),
        amount=amount,
        payment_method=data.get("paymentMethod", "Cash"),
        recorded_by=data.get("recordedBy") or user.name,
    )
    db.session.add(expense)
    db.session.commit()
    return jsonify({"success": True, "data": _serialize(expense),
                    "message": "Expense added successfully."}), 201


@expenses_bp.put("/expenses/<int:expense_id>")
@jwt_required()
def update_expense(expense_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    expense = Expense.query.filter_by(id=expense_id, business_id=user.business_id).first()
    if not expense:
        return jsonify({"success": False, "message": "Expense not found"}), 404

    data = request.get_json(silent=True) or {}
    if "category" in data and data["category"]:
        expense.category = data["category"]
    if "description" in data and data["description"]:
        expense.description = data["description"]
    if "amount" in data and data["amount"] is not None:
        expense.amount = float(data["amount"])
    if "paymentMethod" in data and data["paymentMethod"]:
        expense.payment_method = data["paymentMethod"]

    db.session.commit()
    return jsonify({"success": True, "data": _serialize(expense),
                    "message": "Expense updated successfully."})


@expenses_bp.delete("/expenses/<int:expense_id>")
@jwt_required()
def delete_expense(expense_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    expense = Expense.query.filter_by(id=expense_id, business_id=user.business_id).first()
    if not expense:
        return jsonify({"success": False, "message": "Expense not found"}), 404

    db.session.delete(expense)
    db.session.commit()
    return jsonify({"success": True, "message": "Expense deleted."})