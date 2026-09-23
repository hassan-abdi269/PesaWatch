import csv
import io
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from app.extensions import db
from app.models import User, Sale, SaleItem, Expense, Leakage, Customer, Supplier, Product

reports_bp = Blueprint("reports", __name__)


# ---------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------
def _current_user():
    return User.query.get(int(get_jwt_identity()))


def _parse_date(value, default):
    if not value:
        return default
    try:
        return datetime.fromisoformat(value)
    except (ValueError, TypeError):
        return default


def _range_from_request(default_days=30):
    """Returns (from_dt, to_dt) from ?from=&to= or the last N days."""
    to_dt = _parse_date(request.args.get("to"), datetime.utcnow())
    from_dt = _parse_date(request.args.get("from"), to_dt - timedelta(days=default_days))
    return from_dt, to_dt


def _csv_response(rows, filename):
    """Given a list of dicts, return a CSV file response."""
    if not rows:
        return Response(
            "no data\n",
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)

    return Response(
        buffer.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# ---------------------------------------------------------------
# 1. Sales report — totals + daily breakdown
# ---------------------------------------------------------------
@reports_bp.get("/reports/sales")
@jwt_required()
def report_sales():
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    from_dt, to_dt = _range_from_request()

    rows = (Sale.query
            .filter(Sale.business_id == user.business_id,
                    Sale.date >= from_dt,
                    Sale.date <= to_dt)
            .all())

    total = sum(float(s.amount or 0) for s in rows)
    count = len(rows)
    avg = (total / count) if count else 0.0

    # Daily breakdown
    daily = {}
    for s in rows:
        day = (s.date or datetime.utcnow()).date().isoformat()
        bucket = daily.setdefault(day, {"date": day, "count": 0, "amount": 0.0})
        bucket["count"] += 1
        bucket["amount"] += float(s.amount or 0)

    return jsonify({"success": True, "data": {
        "from": from_dt.isoformat(),
        "to": to_dt.isoformat(),
        "totalSales": round(total, 2),
        "count": count,
        "averageSale": round(avg, 2),
        "daily": sorted(daily.values(), key=lambda x: x["date"], reverse=True),
    }})


# ---------------------------------------------------------------
# 2. Profit & loss report
# ---------------------------------------------------------------
@reports_bp.get("/reports/profit")
@jwt_required()
def report_profit():
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    from_dt, to_dt = _range_from_request()

    sales = (Sale.query
             .filter(Sale.business_id == user.business_id,
                     Sale.date >= from_dt,
                     Sale.date <= to_dt)
             .all())
    expenses = (Expense.query
                .filter(Expense.business_id == user.business_id,
                        Expense.date >= from_dt,
                        Expense.date <= to_dt)
                .all())

    revenue = sum(float(s.amount or 0) for s in sales)
    discounts = sum(float(s.discount or 0) for s in sales)
    costs = sum(float(e.amount or 0) for e in expenses)
    profit = revenue - discounts - costs

    # Expense breakdown by category
    by_cat = {}
    for e in expenses:
        key = e.category or "Other"
        by_cat[key] = by_cat.get(key, 0.0) + float(e.amount or 0)

    return jsonify({"success": True, "data": {
        "from": from_dt.isoformat(),
        "to": to_dt.isoformat(),
        "revenue": round(revenue, 2),
        "discounts": round(discounts, 2),
        "expenses": round(costs, 2),
        "profit": round(profit, 2),
        "marginPct": round((profit / revenue * 100) if revenue else 0, 2),
        "expenseBreakdown": [
            {"category": k, "amount": round(v, 2)}
            for k, v in sorted(by_cat.items(), key=lambda x: -x[1])
        ],
    }})


# ---------------------------------------------------------------
# 3. Leakage report
# ---------------------------------------------------------------
@reports_bp.get("/reports/leakage")
@jwt_required()
def report_leakage():
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    items = Leakage.query.filter_by(business_id=user.business_id).all()

    by_type = {}
    for it in items:
        key = it.leakage_type or "Other"
        bucket = by_type.setdefault(key, {"type": key, "amount": 0.0, "count": 0})
        bucket["amount"] += float(it.amount or 0)
        bucket["count"] += 1

    rows = [{
        "id": it.id,
        "title": it.title,
        "type": it.leakage_type,
        "risk": it.risk_level,
        "status": it.status,
        "amount": float(it.amount or 0),
        "expected": float(it.expected_value or 0),
        "actual": float(it.actual_value or 0),
        "createdAt": it.created_at.isoformat() if it.created_at else None,
    } for it in items]

    return jsonify({"success": True, "data": {
        "totalRecords": len(items),
        "byType": [{"type": k, **v} for k, v in by_type.items()],
        "rows": rows,
    }})


# ---------------------------------------------------------------
# 4. Customer credit report
# ---------------------------------------------------------------
@reports_bp.get("/reports/customer-credit")
@jwt_required()
def report_customer_credit():
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    now = datetime.utcnow()
    customers = Customer.query.filter_by(business_id=user.business_id).all()

    rows = []
    total_outstanding = 0.0
    total_overdue = 0.0
    for c in customers:
        balance = float(c.balance or 0)
        if balance <= 0:
            continue
        overdue = bool(c.due_date and c.due_date < now)
        total_outstanding += balance
        if overdue:
            total_overdue += balance
        rows.append({
            "id": c.id,
            "name": c.name,
            "phone": c.phone,
            "balance": round(balance, 2),
            "dueDate": c.due_date.date().isoformat() if c.due_date else None,
            "overdue": overdue,
            "status": c.status,
        })

    rows.sort(key=lambda r: (not r["overdue"], -r["balance"]))

    return jsonify({"success": True, "data": {
        "totalOutstanding": round(total_outstanding, 2),
        "totalOverdue": round(total_overdue, 2),
        "count": len(rows),
        "rows": rows,
    }})


# ---------------------------------------------------------------
# 5. Supplier price report
# ---------------------------------------------------------------
@reports_bp.get("/reports/supplier-prices")
@jwt_required()
def report_supplier_prices():
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    suppliers = Supplier.query.filter_by(business_id=user.business_id).all()

    rows = [{
        "id": s.id,
        "name": s.name,
        "contact": s.contact_person,
        "phone": s.phone,
        "previousPrice": float(s.previous_average_price or 0),
        "currentPrice": float(s.current_average_price or 0),
        "increasePct": round(float(s.price_increase or 0), 2),
    } for s in suppliers]

    rows.sort(key=lambda r: -r["increasePct"])

    flagged = [r for r in rows if r["increasePct"] > 10]
    avg_increase = (
        sum(r["increasePct"] for r in rows) / len(rows) if rows else 0.0
    )

    return jsonify({"success": True, "data": {
        "count": len(rows),
        "averageIncrease": round(avg_increase, 2),
        "flaggedCount": len(flagged),
        "rows": rows,
    }})


# ---------------------------------------------------------------
# 6. Expenses report
# ---------------------------------------------------------------
@reports_bp.get("/reports/expenses")
@jwt_required()
def report_expenses():
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    from_dt, to_dt = _range_from_request()

    expenses = (Expense.query
                .filter(Expense.business_id == user.business_id,
                        Expense.date >= from_dt,
                        Expense.date <= to_dt)
                .all())

    total = sum(float(e.amount or 0) for e in expenses)

    by_cat = {}
    for e in expenses:
        key = e.category or "Other"
        by_cat[key] = by_cat.get(key, 0.0) + float(e.amount or 0)

    return jsonify({"success": True, "data": {
        "from": from_dt.isoformat(),
        "to": to_dt.isoformat(),
        "totalExpenses": round(total, 2),
        "count": len(expenses),
        "byCategory": [
            {"category": k, "amount": round(v, 2)}
            for k, v in sorted(by_cat.items(), key=lambda x: -x[1])
        ],
    }})


# ---------------------------------------------------------------
# CSV export — ?type=sales|profit|leakage|credit|suppliers|expenses
# ---------------------------------------------------------------
@reports_bp.get("/reports/export")
@jwt_required()
def export_report():
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    kind = request.args.get("type", "sales")
    from_dt, to_dt = _range_from_request()

    if kind == "sales":
        sales = (Sale.query
                 .filter(Sale.business_id == user.business_id,
                         Sale.date >= from_dt, Sale.date <= to_dt)
                 .order_by(Sale.date.desc())
                 .all())
        rows = [{
            "date": (s.date or datetime.utcnow()).date().isoformat(),
            "invoice": s.invoice_no,
            "customer": s.customer_name,
            "payment_method": s.payment_method,
            "amount": float(s.amount or 0),
            "discount": float(s.discount or 0),
            "status": s.status,
        } for s in sales]
        return _csv_response(rows, f"sales_{from_dt.date()}_{to_dt.date()}.csv")

    if kind == "expenses":
        expenses = (Expense.query
                    .filter(Expense.business_id == user.business_id,
                            Expense.date >= from_dt, Expense.date <= to_dt)
                    .order_by(Expense.date.desc())
                    .all())
        rows = [{
            "date": (e.date or datetime.utcnow()).date().isoformat(),
            "category": e.category,
            "description": e.description,
            "amount": float(e.amount or 0),
            "payment_method": e.payment_method,
            "recorded_by": e.recorded_by,
        } for e in expenses]
        return _csv_response(rows, f"expenses_{from_dt.date()}_{to_dt.date()}.csv")

    if kind == "leakage":
        leakages = Leakage.query.filter_by(business_id=user.business_id).all()
        rows = [{
            "title": l.title,
            "type": l.leakage_type,
            "risk": l.risk_level,
            "amount": float(l.amount or 0),
            "expected": float(l.expected_value or 0),
            "actual": float(l.actual_value or 0),
            "status": l.status,
            "notes": (l.notes or "").replace("\n", " "),
        } for l in leakages]
        return _csv_response(rows, "leakage.csv")

    if kind == "credit":
        customers = Customer.query.filter_by(business_id=user.business_id).all()
        rows = [{
            "name": c.name,
            "phone": c.phone,
            "amount": float(c.amount or 0),
            "paid": float(c.paid or 0),
            "balance": float(c.balance or 0),
            "due_date": c.due_date.date().isoformat() if c.due_date else "",
            "status": c.status,
        } for c in customers]
        return _csv_response(rows, "customer_credit.csv")

    if kind == "suppliers":
        suppliers = Supplier.query.filter_by(business_id=user.business_id).all()
        rows = [{
            "name": s.name,
            "contact": s.contact_person,
            "phone": s.phone,
            "previous_price": float(s.previous_average_price or 0),
            "current_price": float(s.current_average_price or 0),
            "increase_pct": float(s.price_increase or 0),
        } for s in suppliers]
        return _csv_response(rows, "suppliers.csv")

    if kind == "profit":
        sales = Sale.query.filter_by(business_id=user.business_id).all()
        expenses = Expense.query.filter_by(business_id=user.business_id).all()
        revenue = sum(float(s.amount or 0) for s in sales)
        discount = sum(float(s.discount or 0) for s in sales)
        costs = sum(float(e.amount or 0) for e in expenses)
        rows = [{
            "revenue": revenue,
            "discounts": discount,
            "expenses": costs,
            "profit": revenue - discount - costs,
        }]
        return _csv_response(rows, "profit_and_loss.csv")

    return jsonify({"success": False, "message": f"Unknown report type '{kind}'"}), 400