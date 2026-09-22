from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import User, Sale, Expense, Product, Leakage
from app.extensions import db


dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/dashboard/summary")
@jwt_required()
def dashboard_summary():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    business = user.business
    sales_total = sum(s.amount for s in Sale.query.filter_by(business_id=business.id).all())
    expenses_total = sum(e.amount for e in Expense.query.filter_by(business_id=business.id).all())
    inventory_total = sum(p.purchase_price * p.quantity for p in Product.query.filter_by(business_id=business.id).all())
    potential_leakage = sum(l.amount for l in Leakage.query.filter_by(business_id=business.id).all())
    profit = sales_total - expenses_total - inventory_total * 0.35

    return jsonify({"success": True, "data": {
        "revenue": float(sales_total),
        "expenses": float(expenses_total),
        "estimatedProfit": float(profit),
        "potentialLeakage": float(potential_leakage),
        "businessName": business.name,
        "currency": business.currency,
    }})
