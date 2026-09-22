from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Expense

expenses_bp = Blueprint("expenses", __name__)


@expenses_bp.get("/expenses")
@jwt_required()
def get_expenses():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    expenses = Expense.query.filter_by(business_id=user.business_id).all()
    return jsonify({"success": True, "data": [{
        "id": e.id,
        "date": e.date.isoformat() if e.date else None,
        "category": e.category,
        "description": e.description,
        "amount": e.amount,
        "paymentMethod": e.payment_method,
        "recordedBy": e.recorded_by,
    } for e in expenses]})


@expenses_bp.post("/expenses")
@jwt_required()
def create_expense():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json(silent=True) or {}

    expense = Expense(
        business_id=user.business_id,
        category=data.get("category", "Other"),
        description=data.get("description", "Expense"),
        amount=float(data.get("amount") or 0),
        payment_method=data.get("paymentMethod", "Cash"),
        recorded_by=data.get("recordedBy", user.name),
    )
    db.session.add(expense)
    db.session.commit()
    return jsonify({"success": True, "data": {"id": expense.id}, "message": "Expense added successfully."}), 201
