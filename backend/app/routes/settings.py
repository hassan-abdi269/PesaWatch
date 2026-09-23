from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Business, BusinessSetting, Employee

settings_bp = Blueprint("settings", __name__)


def _current_user():
    return User.query.get(int(get_jwt_identity()))


def _get_or_create_settings(business_id):
    """Each business has exactly one BusinessSetting row."""
    s = BusinessSetting.query.filter_by(business_id=business_id).first()
    if not s:
        s = BusinessSetting(business_id=business_id)
        db.session.add(s)
        db.session.flush()
    return s


def _employee_stats(business_id):
    """Count of employee records, broken out by status."""
    total = Employee.query.filter_by(business_id=business_id).count()
    active = (Employee.query
              .filter_by(business_id=business_id)
              .filter(Employee.status == "Active")
              .count())
    return {"total": total, "active": active, "inactive": total - active}


def _serialize_business(b):
    return {
        "id": b.id,
        "name": b.name,
        "businessType": b.business_type,
        "location": b.location,
        "averageMonthlyRevenue": b.average_monthly_revenue,
        "paymentMethods": b.payment_methods,
        "currency": b.currency,
    }


def _serialize_settings(s):
    return {
        "currency": s.currency,
        "taxRate": s.tax_rate,
        "stockAlertThreshold": s.stock_alert_threshold,
        "supplierPriceThreshold": s.supplier_price_threshold,
        "expenseVarianceThreshold": s.expense_variance_threshold,
    }


# ---------------------------------------------------------------
# GET /api/settings
# ---------------------------------------------------------------
@settings_bp.get("/settings")
@jwt_required()
def get_settings():
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    business = Business.query.get(user.business_id)
    if not business:
        return jsonify({"success": False, "message": "Business not found"}), 404

    s = _get_or_create_settings(user.business_id)
    db.session.commit()

    return jsonify({"success": True, "data": {
        "business": _serialize_business(business),
        "settings": _serialize_settings(s),
        "employees": _employee_stats(user.business_id),
        "user": {"id": user.id, "name": user.name, "email": user.email},
    }})


# ---------------------------------------------------------------
# PUT /api/settings/business
# ---------------------------------------------------------------
@settings_bp.put("/settings/business")
@jwt_required()
def update_business():
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    business = Business.query.get(user.business_id)
    if not business:
        return jsonify({"success": False, "message": "Business not found"}), 404

    data = request.get_json(silent=True) or {}

    if data.get("name"):
        business.name = data["name"].strip()
    if "businessType" in data and data["businessType"]:
        business.business_type = data["businessType"].strip()
    if "location" in data and data["location"]:
        business.location = data["location"].strip()
    if data.get("averageMonthlyRevenue") is not None:
        try:
            business.average_monthly_revenue = float(data["averageMonthlyRevenue"])
        except (TypeError, ValueError):
            pass
    if "paymentMethods" in data and data["paymentMethods"]:
        business.payment_methods = str(data["paymentMethods"]).strip()

    # Keep Business.employees in sync with the real Employee count,
    # so it reflects the truth no matter where it's read from.
    business.employees = Employee.query.filter_by(
        business_id=user.business_id
    ).count()

    db.session.commit()
    return jsonify({
        "success": True,
        "data": _serialize_business(business),
        "employees": _employee_stats(user.business_id),
        "message": "Business profile updated.",
    })


# ---------------------------------------------------------------
# PUT /api/settings/financial
# ---------------------------------------------------------------
@settings_bp.put("/settings/financial")
@jwt_required()
def update_financial():
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    business = Business.query.get(user.business_id)
    if not business:
        return jsonify({"success": False, "message": "Business not found"}), 404

    s = _get_or_create_settings(user.business_id)
    data = request.get_json(silent=True) or {}

    if data.get("currency"):
        s.currency = data["currency"].strip()
        business.currency = s.currency

    if data.get("taxRate") is not None:
        try:
            s.tax_rate = float(data["taxRate"])
        except (TypeError, ValueError):
            pass

    if data.get("stockAlertThreshold") is not None:
        try:
            s.stock_alert_threshold = int(data["stockAlertThreshold"])
        except (TypeError, ValueError):
            pass

    if data.get("supplierPriceThreshold") is not None:
        try:
            s.supplier_price_threshold = float(data["supplierPriceThreshold"])
        except (TypeError, ValueError):
            pass

    if data.get("expenseVarianceThreshold") is not None:
        try:
            s.expense_variance_threshold = float(data["expenseVarianceThreshold"])
        except (TypeError, ValueError):
            pass

    db.session.commit()
    return jsonify({
        "success": True,
        "data": _serialize_settings(s),
        "message": "Financial settings updated.",
    })