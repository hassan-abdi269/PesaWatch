from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Employee

employees_bp = Blueprint("employees", __name__)


@employees_bp.get("/employees")
@jwt_required()
def get_employees():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    employees = Employee.query.filter_by(business_id=user.business_id).all()
    return jsonify({"success": True, "data": [{
        "id": e.id,
        "name": e.name,
        "position": e.position,
        "phone": e.phone,
        "status": e.status,
    } for e in employees]})


@employees_bp.post("/employees")
@jwt_required()
def create_employee():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json(silent=True) or {}

    employee = Employee(
        business_id=user.business_id,
        name=data.get("name", "New Employee"),
        position=data.get("position", "Staff"),
        phone=data.get("phone"),
        status=data.get("status", "Active"),
    )
    db.session.add(employee)
    db.session.commit()
    return jsonify({"success": True, "data": {"id": employee.id}, "message": "Employee created successfully."}), 201
