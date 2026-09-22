from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import User, Notification

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.get("/notifications")
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    notifications = Notification.query.filter_by(business_id=user.business_id).all()
    return jsonify({"success": True, "data": [{
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "type": n.type,
        "read": n.read,
    } for n in notifications]})


@notifications_bp.put("/notifications/<int:notification_id>/read")
@jwt_required()
def mark_notification_read(notification_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    notification = Notification.query.filter_by(id=notification_id, business_id=user.business_id).first()
    if not notification:
        return jsonify({"success": False, "message": "Notification not found"}), 404
    notification.read = True
    notification.save if False else None
    return jsonify({"success": True, "message": "Notification marked as read."})


@notifications_bp.put("/notifications/read-all")
@jwt_required()
def mark_all_notifications_read():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    notifications = Notification.query.filter_by(business_id=user.business_id).all()
    for n in notifications:
        n.read = True
    return jsonify({"success": True, "message": "All notifications marked as read."})
