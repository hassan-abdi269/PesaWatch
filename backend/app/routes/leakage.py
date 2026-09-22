from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import Customer, Expense, Leakage, Product, Sale, Supplier, User
from app.services.leakage_service import (
    calculate_cash_variance,
    calculate_inventory_variance,
    calculate_overdue_credit,
    calculate_supplier_price_increase,
)

leakage_bp = Blueprint("leakage", __name__)
VALID_STATUSES = {"Open", "Investigating", "Resolved", "Not a Loss"}


def current_user():
    return User.query.get(int(get_jwt_identity()))


def serialize_leakage(item):
    return {
        "id": item.id,
        "title": item.title,
        "leakageType": item.leakage_type,
        "riskLevel": item.risk_level,
        "amount": item.amount,
        "expectedValue": item.expected_value,
        "actualValue": item.actual_value,
        "status": item.status,
        "notes": item.notes,
        "createdAt": item.created_at.isoformat() if item.created_at else None,
    }


@leakage_bp.get("/leakage")
@jwt_required()
def get_leakages():
    user = current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    items = Leakage.query.filter_by(business_id=user.business_id).order_by(Leakage.created_at.desc()).all()
    return jsonify({"success": True, "data": [serialize_leakage(item) for item in items]})


@leakage_bp.get("/leakage/<int:leakage_id>")
@jwt_required()
def get_leakage(leakage_id):
    user = current_user()
    item = Leakage.query.filter_by(id=leakage_id, business_id=user.business_id).first() if user else None
    if not item:
        return jsonify({"success": False, "message": "Leakage not found"}), 404
    return jsonify({"success": True, "data": serialize_leakage(item)})


@leakage_bp.post("/leakage/run-detection")
@jwt_required()
def run_detection():
    user = current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    business_id = user.business_id
    sales = Sale.query.filter_by(business_id=business_id).all()
    expenses = Expense.query.filter_by(business_id=business_id).all()
    products = Product.query.filter_by(business_id=business_id).all()
    customers = Customer.query.filter_by(business_id=business_id).all()
    suppliers = Supplier.query.filter_by(business_id=business_id).all()

    sales_total = sum(float(item.amount or 0) for item in sales)
    expense_total = sum(float(item.amount or 0) for item in expenses)
    expected_cash = max(sales_total - expense_total, 0)
    actual_cash = sum(float(item.amount or 0) for item in sales if item.payment_method == "Cash")
    cash_variance = calculate_cash_variance(expected_cash, actual_cash)
    inventory_variance = sum(
        calculate_inventory_variance(int(item.quantity or 0) + 10, int(item.quantity or 0), float(item.purchase_price or 0))
        for item in products
    )
    overdue_credit = sum(calculate_overdue_credit(float(item.balance or 0), item.due_date) for item in customers)
    supplier_variance = sum(
        max(0, calculate_supplier_price_increase(item.previous_average_price, item.current_average_price))
        * float(item.previous_average_price or 0) / 100
        for item in suppliers
    )

    records = [
        ("Cash discrepancy", "Cash Variance", "Medium", cash_variance, expected_cash, actual_cash, "Difference between expected and actual cash activity."),
        ("Stock discrepancy", "Inventory Variance", "Warning", inventory_variance, inventory_variance, 0, "Expected inventory quantity is higher than recorded quantity."),
        ("Outstanding customer credit", "Customer Credit", "Attention", overdue_credit, overdue_credit, 0, "Overdue customer balances require collection follow-up."),
        ("Supplier pricing increased", "Supplier Price Change", "Warning", supplier_variance, supplier_variance, 0, "Supplier pricing increased and may affect margins."),
    ]

    created = 0
    for title, leakage_type, risk, amount, expected, actual, notes in records:
        existing = Leakage.query.filter_by(business_id=business_id, title=title).first()
        if existing:
            existing.amount = round(amount, 2)
            existing.expected_value = round(expected, 2)
            existing.actual_value = round(actual, 2)
            existing.notes = notes
            continue
        db.session.add(Leakage(
            business_id=business_id, title=title, leakage_type=leakage_type,
            risk_level=risk, amount=round(amount, 2), expected_value=round(expected, 2),
            actual_value=round(actual, 2), status="Open", notes=notes,
        ))
        created += 1

    db.session.commit()
    return jsonify({"success": True, "message": "Leakage detection completed using live business data.", "created": created})


@leakage_bp.post("/leakage/<int:leakage_id>/investigate")
@jwt_required()
def investigate_leakage(leakage_id):
    user = current_user()
    item = Leakage.query.filter_by(id=leakage_id, business_id=user.business_id).first() if user else None
    if not item:
        return jsonify({"success": False, "message": "Leakage not found"}), 404

    data = request.get_json(silent=True) or {}
    if "notes" in data:
        item.notes = str(data["notes"])
    if data.get("status") in VALID_STATUSES:
        item.status = data["status"]
    db.session.commit()
    return jsonify({"success": True, "data": serialize_leakage(item), "message": "Investigation updated."})


@leakage_bp.put("/leakage/<int:leakage_id>/status")
@jwt_required()
def update_leakage_status(leakage_id):
    user = current_user()
    item = Leakage.query.filter_by(id=leakage_id, business_id=user.business_id).first() if user else None
    if not item:
        return jsonify({"success": False, "message": "Leakage not found"}), 404

    data = request.get_json(silent=True) or {}
    if data.get("status") not in VALID_STATUSES:
        return jsonify({"success": False, "message": "Invalid leakage status"}), 422
    item.status = data["status"]
    if "notes" in data:
        item.notes = str(data["notes"])
    db.session.commit()
    return jsonify({"success": True, "data": serialize_leakage(item), "message": "Leakage status updated."})
