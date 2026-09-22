from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models import Customer, Expense, Leakage, Product, Sale, User


dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/dashboard/summary")
@jwt_required()
def dashboard_summary():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    business_id = user.business_id
    sales = Sale.query.filter_by(business_id=business_id).all()
    expenses = Expense.query.filter_by(business_id=business_id).all()
    products = Product.query.filter_by(business_id=business_id).all()
    leakages = Leakage.query.filter_by(business_id=business_id).all()
    customers = Customer.query.filter_by(business_id=business_id).all()

    revenue = sum(float(item.amount or 0) for item in sales)
    expense_total = sum(float(item.amount or 0) for item in expenses)
    cost_of_goods = sum(float(item.purchase_price or 0) * int(item.quantity or 0) for item in products)
    estimated_profit = revenue - expense_total - cost_of_goods
    potential_leakage = sum(float(item.amount or 0) for item in leakages)
    customer_credit = sum(float(item.balance or 0) for item in customers)

    return jsonify({"success": True, "data": {
        "revenue": round(revenue, 2),
        "expenses": round(expense_total, 2),
        "estimatedProfit": round(estimated_profit, 2),
        "potentialLeakage": round(potential_leakage, 2),
        "customerCredit": round(customer_credit, 2),
        "businessName": user.business.name,
        "currency": user.business.currency,
    }})
