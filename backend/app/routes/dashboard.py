from datetime import datetime, timedelta
from collections import defaultdict
from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models import (
    Customer, Expense, Leakage, Product, Sale, User,
)

dashboard_bp = Blueprint("dashboard", __name__)


def _month_key(dt):
    return dt.strftime("%Y-%m")


def _month_label(dt):
    return dt.strftime("%b")


def _month_start(dt):
    return dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def _add_month(dt, delta):
    """Add `delta` months to dt, always returning the first of the month."""
    y = dt.year + (dt.month - 1 + delta) // 12
    m = (dt.month - 1 + delta) % 12 + 1
    return dt.replace(year=y, month=m, day=1, hour=0, minute=0, second=0, microsecond=0)


@dashboard_bp.get("/dashboard/summary")
@jwt_required()
def dashboard_summary():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    business_id = user.business_id
    currency = user.business.currency or "KES"

    now = datetime.utcnow()
    this_month_start = _month_start(now)
    last_month_start = _add_month(this_month_start, -1)

    sales = Sale.query.filter_by(business_id=business_id).all()
    expenses = Expense.query.filter_by(business_id=business_id).all()
    products = Product.query.filter_by(business_id=business_id).all()
    leakages = Leakage.query.filter_by(business_id=business_id).all()
    customers = Customer.query.filter_by(business_id=business_id).all()

    # ---- Lifetimes ----
    revenue_total = sum(float(s.amount or 0) for s in sales)
    expense_total = sum(float(e.amount or 0) for e in expenses)
    cogs = sum(float(p.purchase_price or 0) * int(p.quantity or 0) for p in products)
    estimated_profit = revenue_total - expense_total - cogs
    potential_leakage = sum(float(l.amount or 0) for l in leakages)
    customer_credit = sum(float(c.balance or 0) for c in customers)

    # ---- This month vs last month (for trend %) ----
    this_rev = sum(
        float(s.amount or 0) for s in sales
        if s.date and s.date >= this_month_start
    )
    last_rev = sum(
        float(s.amount or 0) for s in sales
        if s.date and last_month_start <= s.date < this_month_start
    )
    this_exp = sum(
        float(e.amount or 0) for e in expenses
        if e.date and e.date >= this_month_start
    )
    last_exp = sum(
        float(e.amount or 0) for e in expenses
        if e.date and last_month_start <= e.date < this_month_start
    )

    def _pct_change(current, previous):
        if previous <= 0:
            return None
        return round(((current - previous) / previous) * 100, 1)

    revenue_trend = _pct_change(this_rev, last_rev)
    expenses_trend = _pct_change(this_exp, last_exp)

    # ---- Monthly series — last 6 months ----
    months = [_add_month(this_month_start, -i) for i in range(5, -1, -1)]
    buckets = {}
    for m in months:
        buckets[_month_key(m)] = {
            "name": _month_label(m),
            "key": _month_key(m),
            "revenue": 0.0,
            "expenses": 0.0,
            "profit": 0.0,
        }

    for s in sales:
        if not s.date:
            continue
        key = _month_key(s.date)
        if key in buckets:
            buckets[key]["revenue"] += float(s.amount or 0)

    for e in expenses:
        if not e.date:
            continue
        key = _month_key(e.date)
        if key in buckets:
            buckets[key]["expenses"] += float(e.amount or 0)

    for b in buckets.values():
        b["revenue"] = round(b["revenue"], 2)
        b["expenses"] = round(b["expenses"], 2)
        b["profit"] = round(b["revenue"] - b["expenses"], 2)

    monthly_series = [buckets[_month_key(m)] for m in months]

    # ---- Leakage by type ----
    by_type = defaultdict(float)
    for l in leakages:
        key = (l.leakage_type or "Other").strip()
        by_type[key] += float(l.amount or 0)
    leakage_by_type = [
        {"name": k, "value": round(v, 2)}
        for k, v in sorted(by_type.items(), key=lambda x: -x[1])
    ]

    return jsonify({"success": True, "data": {
        "revenue": round(revenue_total, 2),
        "expenses": round(expense_total, 2),
        "estimatedProfit": round(estimated_profit, 2),
        "potentialLeakage": round(potential_leakage, 2),
        "customerCredit": round(customer_credit, 2),
        "revenueTrendPct": revenue_trend,
        "expensesTrendPct": expenses_trend,
        "monthlySeries": monthly_series,
        "leakageByType": leakage_by_type,
        "businessName": user.business.name,
        "currency": currency,
    }})