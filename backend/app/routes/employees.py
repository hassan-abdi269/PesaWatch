from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from app.extensions import db
from app.models import User, Employee, Sale

employees_bp = Blueprint("employees", __name__)


def _serialize(e, sales_total=0.0, sales_count=0):
    return {
        "id": e.id,
        "name": e.name,
        "position": e.position,
        "phone": e.phone,
        "status": e.status,
        "salesTotal": float(sales_total or 0),
        "salesCount": int(sales_count or 0),
    }


@employees_bp.get("/employees")
@jwt_required()
def get_employees():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    # Aggregate sales per employee in a single query
    agg = dict(
        db.session.query(Sale.employee_id, func.sum(Sale.amount))
        .filter(Sale.business_id == user.business_id)
        .group_by(Sale.employee_id)
        .all()
    )
    counts = dict(
        db.session.query(Sale.employee_id, func.count(Sale.id))
        .filter(Sale.business_id == user.business_id)
        .group_by(Sale.employee_id)
        .all()
    )

    rows = (Employee.query
            .filter_by(business_id=user.business_id)
            .order_by(Employee.name.asc())
            .all())

    return jsonify({"success": True, "data": [
        _serialize(e, agg.get(e.id, 0), counts.get(e.id, 0)) for e in rows
    ]})


@employees_bp.get("/employees/summary")
@jwt_required()
def employees_summary():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    base = Employee.query.filter_by(business_id=user.business_id)
    total = base.count()
    active = base.filter(Employee.status == "Active").count()
    inactive = total - active

    return jsonify({"success": True, "data": {
        "total": int(total),
        "active": int(active),
        "inactive": int(inactive),
    }})


@employees_bp.post("/employees")
@jwt_required()
def create_employee():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"success": False, "message": "Employee name is required."}), 400

    employee = Employee(
        business_id=user.business_id,
        name=name,
        position=(data.get("position") or "Staff").strip(),
        phone=data.get("phone"),
        status=data.get("status", "Active"),
    )
    db.session.add(employee)
    db.session.commit()
    return jsonify({"success": True, "data": _serialize(employee),
                    "message": "Employee created successfully."}), 201


@employees_bp.put("/employees/<int:employee_id>")
@jwt_required()
def update_employee(employee_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    employee = Employee.query.filter_by(
        id=employee_id, business_id=user.business_id
    ).first()
    if not employee:
        return jsonify({"success": False, "message": "Employee not found"}), 404

    data = request.get_json(silent=True) or {}
    if data.get("name"):
        employee.name = data["name"].strip()
    if data.get("position"):
        employee.position = data["position"].strip()
    if "phone" in data:
        employee.phone = data["phone"]
    if data.get("status"):
        employee.status = data["status"]

    db.session.commit()
    return jsonify({"success": True, "data": _serialize(employee),
                    "message": "Employee updated successfully."})


@employees_bp.delete("/employees/<int:employee_id>")
@jwt_required()
def delete_employee(employee_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    employee = Employee.query.filter_by(
        id=employee_id, business_id=user.business_id
    ).first()
    if not employee:
        return jsonify({"success": False, "message": "Employee not found"}), 404

    # Detach from sales so the FK doesn't block deletion
    Sale.query.filter_by(employee_id=employee.id).update({"employee_id": None})

    db.session.delete(employee)
    db.session.commit()
    return jsonify({"success": True, "message": "Employee deleted."})