from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Leakage

leakage_bp = Blueprint("leakage", __name__)


@leakage_bp.get("/leakage")
@jwt_required()
def get_leakages():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    leakages = Leakage.query.filter_by(business_id=user.business_id).all()
    return jsonify({"success": True, "data": [{
        "id": l.id,
        "title": l.title,
        "leakageType": l.leakage_type,
        "riskLevel": l.risk_level,
        "amount": l.amount,
        "expectedValue": l.expected_value,
        "actualValue": l.actual_value,
        "status": l.status,
        "notes": l.notes,
    } for l in leakages]})


@leakage_bp.get("/leakage/<int:leakage_id>")
@jwt_required()
def get_leakage(leakage_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    leakage = Leakage.query.filter_by(id=leakage_id, business_id=user.business_id).first()
    if not leakage:
        return jsonify({"success": False, "message": "Leakage not found"}), 404
    return jsonify({"success": True, "data": {
        "id": leakage.id,
        "title": leakage.title,
        "leakageType": leakage.leakage_type,
        "riskLevel": leakage.risk_level,
        "amount": leakage.amount,
        "expectedValue": leakage.expected_value,
        "actualValue": leakage.actual_value,
        "status": leakage.status,
        "notes": leakage.notes,
    }})


@leakage_bp.post("/leakage/run-detection")
@jwt_required()
def run_detection():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    leakage_entries = [
        Leakage(
            business_id=user.business_id,
            title="Cash discrepancy",
            leakage_type="Cash Variance",
            risk_level="Medium",
            amount=5600,
            expected_value=84500,
            actual_value=78900,
            status="Investigating",
            notes="Difference between expected cash and actual cash recorded in the business system.",
        ),
        Leakage(
            business_id=user.business_id,
            title="Stock discrepancy",
            leakage_type="Inventory Variance",
            risk_level="Warning",
            amount=5600,
            expected_value=52400,
            actual_value=46800,
            status="Open",
            notes="Inventory and physical counts differ. Review stock adjustments and sales logs.",
        ),
    ]
    for item in leakage_entries:
        existing = Leakage.query.filter_by(business_id=user.business_id, title=item.title).first()
        if not existing:
            db.session.add(item)
    db.session.commit()
    return jsonify({"success": True, "message": "Leakage detection run completed."})


@leakage_bp.post("/leakage/<int:leakage_id>/investigate")
@jwt_required()
def investigate_leakage(leakage_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    leakage = Leakage.query.filter_by(id=leakage_id, business_id=user.business_id).first()
    if not leakage:
        return jsonify({"success": False, "message": "Leakage not found"}), 404

    data = request.get_json(silent=True) or {}
    leakage.notes = data.get("notes", leakage.notes)
    leakage.status = data.get("status", leakage.status)
    db.session.commit()
    return jsonify({"success": True, "message": "Investigation updated."})


@leakage_bp.put("/leakage/<int:leakage_id>/status")
@jwt_required()
def update_leakage_status(leakage_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    leakage = Leakage.query.filter_by(id=leakage_id, business_id=user.business_id).first()
    if not leakage:
        return jsonify({"success": False, "message": "Leakage not found"}), 404

    data = request.get_json(silent=True) or {}
    leakage.status = data.get("status", leakage.status)
    db.session.commit()
    return jsonify({"success": True, "message": "Leakage status updated."})
