from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Business, User

business_bp = Blueprint("business", __name__)


@business_bp.get("/business")
@jwt_required()
def get_business():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    business = user.business
    return jsonify({"success": True, "data": {
        "id": business.id,
        "name": business.name,
        "businessType": business.business_type,
        "location": business.location,
        "employees": business.employees,
        "averageMonthlyRevenue": business.average_monthly_revenue,
        "paymentMethods": business.payment_methods,
        "currency": business.currency,
    }})


@business_bp.put("/business")
@jwt_required()
def update_business():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    business = user.business
    business.name = data.get("name", business.name)
    business.business_type = data.get("businessType", business.business_type)
    business.location = data.get("location", business.location)
    business.employees = data.get("employees", business.employees)
    business.average_monthly_revenue = data.get("averageMonthlyRevenue", business.average_monthly_revenue)
    business.payment_methods = data.get("paymentMethods", business.payment_methods)
    business.currency = data.get("currency", business.currency)

    db.session.commit()
    return jsonify({"success": True, "message": "Business updated successfully."})
