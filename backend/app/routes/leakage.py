from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import Customer, Expense, Leakage, Product, Sale, Supplier, User
from app.services.leakage_service import (
    calculate_cash_variance,
    calculate_discount_variance,
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
        "updatedAt": item.updated_at.isoformat() if item.updated_at else None,
    }


# ---------------------------------------------------------------
# GET /api/leakage  — list all leakage records
# ---------------------------------------------------------------
@leakage_bp.get("/leakage")
@jwt_required()
def get_leakages():
    user = current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    items = (Leakage.query
             .filter_by(business_id=user.business_id)
             .order_by(Leakage.created_at.desc())
             .all())
    return jsonify({"success": True, "data": [serialize_leakage(i) for i in items]})


# ---------------------------------------------------------------
# GET /api/leakage/summary  — per-type totals and counts
# MUST be declared BEFORE /leakage/<int:leakage_id>
# ---------------------------------------------------------------
@leakage_bp.get("/leakage/summary")
@jwt_required()
def leakage_summary():
    user = current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    items = Leakage.query.filter_by(business_id=user.business_id).all()

    by_type = {}
    for it in items:
        key = it.leakage_type or "Other"
        by_type[key] = by_type.get(key, 0.0) + float(it.amount or 0)

    open_count = sum(1 for it in items if it.status in ("Open", "Investigating"))
    resolved_count = sum(1 for it in items if it.status == "Resolved")

    return jsonify({"success": True, "data": {
        "totalRecords": len(items),
        "openCount": open_count,
        "resolvedCount": resolved_count,
        "byType": {k: round(v, 2) for k, v in by_type.items()},
    }})


# ---------------------------------------------------------------
# GET /api/leakage/<id>  — single record
# ---------------------------------------------------------------
@leakage_bp.get("/leakage/<int:leakage_id>")
@jwt_required()
def get_leakage(leakage_id):
    user = current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    item = Leakage.query.filter_by(
        id=leakage_id, business_id=user.business_id
    ).first()
    if not item:
        return jsonify({"success": False, "message": "Leakage not found"}), 404

    return jsonify({"success": True, "data": serialize_leakage(item)})


# ---------------------------------------------------------------
# POST /api/leakage/run-detection  — scan and upsert findings
# ---------------------------------------------------------------
@leakage_bp.post("/leakage/run-detection")
@jwt_required()
def run_detection():
    user = current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    business_id = user.business_id

    sales = Sale.query.filter_by(business_id=business_id).all()
    expenses = Expense.query.filter_by(business_id=business_id).all()
    customers = Customer.query.filter_by(business_id=business_id).all()
    suppliers = Supplier.query.filter_by(business_id=business_id).all()
    products = Product.query.filter_by(business_id=business_id).all()

    # ---- 1. Cash variance ----
    # Expected = all sales - all expenses (i.e. what cash position "should" be).
    # Actual   = sales recorded as cash.
    # This is a first-order estimate until daily cash-up records exist.
    sales_total = sum(float(s.amount or 0) for s in sales)
    expense_total = sum(float(e.amount or 0) for e in expenses)
    expected_cash = max(sales_total - expense_total, 0)
    actual_cash = sum(
        float(s.amount or 0) for s in sales if s.payment_method == "Cash"
    )
    cash_variance = calculate_cash_variance(expected_cash, actual_cash)

    # ---- 2. Discount variance (real leakage signal) ----
    # Sum of discounts across all sales, per day, as a proxy for discount abuse.
    # A large aggregate discount figure is worth investigating.
    discount_variance = sum(float(s.discount or 0) for s in sales)

    # ---- 3. Inventory variance ----
    # Without StockMovement history, expected qty == current qty, so this will
    # be 0 for now. It's wired up so it starts producing numbers as soon as
    # stock movement tracking exists.
    inventory_variance = 0.0
    for p in products:
        qty = int(p.quantity or 0)
        reorder = int(p.reorder_level or 0)
        # Placeholder: when actual qty is at or below the reorder level,
        # treat the shortfall vs reorder as a potential stock gap.
        if qty <= reorder and reorder > 0:
            inventory_variance += (reorder - qty) * float(p.purchase_price or 0)

    # ---- 4. Overdue customer credit ----
    overdue_credit = sum(
        calculate_overdue_credit(float(c.balance or 0), c.due_date)
        for c in customers
    )

    # ---- 5. Supplier price increase (margin risk) ----
    supplier_variance = 0.0
    for s in suppliers:
        pct = calculate_supplier_price_increase(
            float(s.previous_average_price or 0),
            float(s.current_average_price or 0),
        )
        if pct > 0:
            supplier_variance += (
                float(s.previous_average_price or 0) * (pct / 100.0)
            )

    records = [
        (
            "Cash payment variance",
            "Cash Variance",
            "Medium",
            cash_variance,
            expected_cash,
            actual_cash,
            "Difference between expected cash position and cash-recorded sales. "
            "Confirm against daily cash-up records and M-Pesa statement.",
        ),
        (
            "Discounts issued",
            "Discount Variance",
            "Attention",
            discount_variance,
            sum(float(s.amount or 0) for s in sales),
            sum(float(s.amount or 0) for s in sales) - discount_variance,
            "Aggregate discounts across sales. Large or repeated discounts "
            "can be a sign of price manipulation or unauthorized discounting.",
        ),
        (
            "Stock at or below reorder level",
            "Inventory Variance",
            "Warning",
            inventory_variance,
            inventory_variance,
            0,
            "Value of stock shortfall vs reorder level. This is a restocking "
            "prompt, not confirmed loss. Full variance detection needs "
            "movement-level tracking.",
        ),
        (
            "Outstanding customer credit",
            "Customer Credit",
            "Attention",
            overdue_credit,
            overdue_credit,
            0,
            "Overdue customer balances are outstanding receivables, not "
            "confirmed loss. Follow up on collection.",
        ),
        (
            "Supplier pricing increased",
            "Supplier Price Change",
            "Warning",
            supplier_variance,
            supplier_variance,
            0,
            "Supplier price increase reduces margin on future sales. "
            "This is a risk, not a realized loss.",
        ),
    ]

    active_titles = {title for title, *_ in records}

    # Upsert each detected row
    for title, leakage_type, risk, amount, expected, actual, notes in records:
        existing = Leakage.query.filter_by(
            business_id=business_id, title=title
        ).first()

        if existing:
            existing.leakage_type = leakage_type
            existing.risk_level = risk
            existing.amount = round(float(amount or 0), 2)
            existing.expected_value = round(float(expected or 0), 2)
            existing.actual_value = round(float(actual or 0), 2)
            existing.notes = notes
        else:
            db.session.add(Leakage(
                business_id=business_id,
                title=title,
                leakage_type=leakage_type,
                risk_level=risk,
                amount=round(float(amount or 0), 2),
                expected_value=round(float(expected or 0), 2),
                actual_value=round(float(actual or 0), 2),
                status="Open",
                notes=notes,
            ))

    # Remove stale *Open* rows no longer produced by the detector.
    # Rows already marked Investigating / Resolved / Not a Loss are preserved.
    stale = Leakage.query.filter(
        Leakage.business_id == business_id,
        Leakage.status == "Open",
        Leakage.title.notin_(active_titles),
    ).all()
    for row in stale:
        db.session.delete(row)

    db.session.commit()

    items = (Leakage.query
             .filter_by(business_id=business_id)
             .order_by(Leakage.created_at.desc())
             .all())
    return jsonify({
        "success": True,
        "message": "Detection complete.",
        "data": [serialize_leakage(i) for i in items],
    })


# ---------------------------------------------------------------
# POST /api/leakage/<id>/investigate  — save notes + status
# ---------------------------------------------------------------
@leakage_bp.post("/leakage/<int:leakage_id>/investigate")
@jwt_required()
def investigate_leakage(leakage_id):
    user = current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    item = Leakage.query.filter_by(
        id=leakage_id, business_id=user.business_id
    ).first()
    if not item:
        return jsonify({"success": False, "message": "Leakage not found"}), 404

    data = request.get_json(silent=True) or {}
    if "notes" in data:
        item.notes = str(data["notes"])
    if data.get("status") in VALID_STATUSES:
        item.status = data["status"]

    db.session.commit()
    return jsonify({
        "success": True,
        "data": serialize_leakage(item),
        "message": "Investigation updated.",
    })


# ---------------------------------------------------------------
# PUT /api/leakage/<id>/status  — quick status change
# ---------------------------------------------------------------
@leakage_bp.put("/leakage/<int:leakage_id>/status")
@jwt_required()
def update_leakage_status(leakage_id):
    user = current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    item = Leakage.query.filter_by(
        id=leakage_id, business_id=user.business_id
    ).first()
    if not item:
        return jsonify({"success": False, "message": "Leakage not found"}), 404

    data = request.get_json(silent=True) or {}
    if data.get("status") not in VALID_STATUSES:
        return jsonify({"success": False, "message": "Invalid leakage status"}), 422

    item.status = data["status"]
    if "notes" in data:
        item.notes = str(data["notes"])

    db.session.commit()
    return jsonify({
        "success": True,
        "data": serialize_leakage(item),
        "message": "Leakage status updated.",
    })