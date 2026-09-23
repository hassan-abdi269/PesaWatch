from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Notification

notifications_bp = Blueprint("notifications", __name__)


def _current_user():
    return User.query.get(int(get_jwt_identity()))


def _serialize(n):
    return {
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "type": n.type,
        "read": bool(n.read),
        "createdAt": n.created_at.isoformat() if n.created_at else None,
    }


# ---------------------------------------------------------------
# GET /api/notifications
# Optional query: ?unread=true  ?limit=20
# ---------------------------------------------------------------
@notifications_bp.get("/notifications")
@jwt_required()
def get_notifications():
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    query = Notification.query.filter_by(business_id=user.business_id)

    if request.args.get("unread") in ("1", "true", "yes"):
        query = query.filter(Notification.read.is_(False))

    limit = request.args.get("limit", type=int)
    query = query.order_by(Notification.created_at.desc())
    if limit:
        query = query.limit(limit)

    items = query.all()
    return jsonify({"success": True, "data": [_serialize(n) for n in items]})


# ---------------------------------------------------------------
# GET /api/notifications/summary
# NOTE: declared BEFORE /<int:notification_id> routes
# ---------------------------------------------------------------
@notifications_bp.get("/notifications/summary")
@jwt_required()
def notifications_summary():
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    base = Notification.query.filter_by(business_id=user.business_id)
    total = base.count()
    unread = base.filter(Notification.read.is_(False)).count()
    return jsonify({"success": True, "data": {
        "total": int(total),
        "unread": int(unread),
        "read": int(total - unread),
    }})


# ---------------------------------------------------------------
# PUT /api/notifications/read-all
# ---------------------------------------------------------------
@notifications_bp.put("/notifications/read-all")
@jwt_required()
def mark_all_notifications_read():
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    (Notification.query
     .filter_by(business_id=user.business_id, read=False)
     .update({"read": True}, synchronize_session=False))
    db.session.commit()

    return jsonify({"success": True, "message": "All notifications marked as read."})


# ---------------------------------------------------------------
# PUT /api/notifications/<id>/read  and  /unread
# ---------------------------------------------------------------
@notifications_bp.put("/notifications/<int:notification_id>/read")
@jwt_required()
def mark_notification_read(notification_id):
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    n = Notification.query.filter_by(
        id=notification_id, business_id=user.business_id
    ).first()
    if not n:
        return jsonify({"success": False, "message": "Notification not found"}), 404

    n.read = True
    db.session.commit()
    return jsonify({"success": True, "data": _serialize(n),
                    "message": "Notification marked as read."})


@notifications_bp.put("/notifications/<int:notification_id>/unread")
@jwt_required()
def mark_notification_unread(notification_id):
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    n = Notification.query.filter_by(
        id=notification_id, business_id=user.business_id
    ).first()
    if not n:
        return jsonify({"success": False, "message": "Notification not found"}), 404

    n.read = False
    db.session.commit()
    return jsonify({"success": True, "data": _serialize(n),
                    "message": "Notification marked as unread."})


# ---------------------------------------------------------------
# DELETE /api/notifications/<id>
# ---------------------------------------------------------------
@notifications_bp.delete("/notifications/<int:notification_id>")
@jwt_required()
def delete_notification(notification_id):
    user = _current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    n = Notification.query.filter_by(
        id=notification_id, business_id=user.business_id
    ).first()
    if not n:
        return jsonify({"success": False, "message": "Notification not found"}), 404

    db.session.delete(n)
    db.session.commit()
    return jsonify({"success": True, "message": "Notification deleted."})