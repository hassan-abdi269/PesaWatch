from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

from app.extensions import db
from app.models import User, Business


auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    business_name = (data.get("businessName") or data.get("business_name") or "").strip()
    business_type = (data.get("businessType") or data.get("business_type") or "Mini-Mart").strip()
    location = (data.get("location") or "").strip()
    employees = int(data.get("employees") or 1)
    avg_revenue = float(data.get("averageMonthlyRevenue") or data.get("average_monthly_revenue") or 0)
    payment_methods = data.get("paymentMethods") or data.get("payment_methods") or "Cash, M-Pesa"

    if not name or not email or not password or not business_name:
        return jsonify({"success": False, "message": "Name, email, password and business name are required."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "User with this email already exists."}), 409

    business = Business(
        name=business_name,
        business_type=business_type,
        location=location,
        employees=employees,
        average_monthly_revenue=avg_revenue,
        payment_methods=str(payment_methods),
        currency="KES",
    )
    db.session.add(business)
    db.session.flush()

    user = User(name=name, email=email, password_hash=generate_password_hash(password), business_id=business.id)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"success": True, "data": {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "businessId": user.business_id}}}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"success": True, "data": {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "businessId": user.business_id}}})


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    return jsonify({"success": True, "data": {"id": user.id, "name": user.name, "email": user.email, "businessId": user.business_id, "business": {"name": user.business.name, "type": user.business.business_type, "location": user.business.location}}})


@auth_bp.post("/forgot-password")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"success": False, "message": "Email is required."}), 400

    return jsonify({"success": True, "message": "If that email exists, a reset link has been sent."})


@auth_bp.post("/verify-email")
def verify_email():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"success": False, "message": "Email is required."}), 400
    return jsonify({"success": True, "message": f"Email {email} has been verified for development mode."})
