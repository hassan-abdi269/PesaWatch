from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Notification

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.get("/notifications")
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    notifications = Notification.query.filter_by(business_id=user.business_id).order_by(Notification.created_at.desc()).all()
    return jsonify({"success": True, "data": [{
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "type": n.type,
        "read": n.read,
        "createdAt": n.created_at.isoformat() if n.created_at else None,
    } for n in notifications]})


@notifications_bp.put("/notifications/<int:notification_id>/read")
@jwt_required()
def mark_notification_read(notification_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    notification = Notification.query.filter_by(id=notification_id, business_id=user.business_id).first() if user else None
    if not notification:
        return jsonify({"success": False, "message": "Notification not found"}), 404
    notification.read = True
    db.session.commit()
    return jsonify({"success": True, "message": "Notification marked as read."})


@notifications_bp.put("/notifications/read-all")
@jwt_required()
def mark_all_notifications_read():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    notifications = Notification.query.filter_by(business_id=user.business_id).all()
    for notification in notifications:
        notification.read = True
    db.session.commit()
    return jsonify({"success": True, "message": "All notifications marked as read."})
