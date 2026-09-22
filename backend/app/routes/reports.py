from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import User, Sale, Expense, Leakage, Customer, Supplier

reports_bp = Blueprint("reports", __name__)


@reports_bp.get("/reports/daily-sales")
@jwt_required()
def daily_sales():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    sales = Sale.query.filter_by(business_id=user.business_id).all()
    return jsonify({"success": True, "data": {"totalSales": sum(s.amount for s in sales)}})


@reports_bp.get("/reports/monthly-profit")
@jwt_required()
def monthly_profit():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    sales = Sale.query.filter_by(business_id=user.business_id).all()
    expenses = Expense.query.filter_by(business_id=user.business_id).all()
    revenue = sum(s.amount for s in sales)
    costs = sum(e.amount for e in expenses)
    return jsonify({"success": True, "data": {"revenue": revenue, "expenses": costs, "profit": revenue - costs}})


@reports_bp.get("/reports/leakage")
@jwt_required()
def leakage_report():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    leakages = Leakage.query.filter_by(business_id=user.business_id).all()
    return jsonify({"success": True, "data": [{
        "title": l.title,
        "amount": l.amount,
        "status": l.status,
        "riskLevel": l.risk_level,
    } for l in leakages]})


@reports_bp.get("/reports/customer-credit")
@jwt_required()
def customer_credit_report():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    customers = Customer.query.filter_by(business_id=user.business_id).all()
    outstanding = sum(c.balance for c in customers)
    return jsonify({"success": True, "data": {"totalOutstanding": outstanding}})


@reports_bp.get("/reports/supplier-prices")
@jwt_required()
def supplier_prices_report():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    suppliers = Supplier.query.filter_by(business_id=user.business_id).all()
    return jsonify({"success": True, "data": [{
        "name": s.name,
        "priceIncrease": s.price_increase,
    } for s in suppliers]})


@reports_bp.get("/reports/expenses")
@jwt_required()
def expenses_report():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    expenses = Expense.query.filter_by(business_id=user.business_id).all()
    return jsonify({"success": True, "data": {"totalExpenses": sum(e.amount for e in expenses)}})
