from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import func

from app.extensions import db
from app.models import User, Sale

sales_bp = Blueprint("sales", __name__)


@sales_bp.get("/sales")
@jwt_required()
def get_sales():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    sales = Sale.query.filter_by(business_id=user.business_id).all()
    return jsonify({"success": True, "data": [{
        "id": s.id,
        "invoiceNo": s.invoice_no,
        "date": s.date.isoformat() if s.date else None,
        "customerName": s.customer_name,
        "paymentMethod": s.payment_method,
        "amount": s.amount,
        "discount": s.discount,
        "employeeId": s.employee_id,
        "status": s.status,
    } for s in sales]})


@sales_bp.post("/sales")
@jwt_required()
def create_sale():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json(silent=True) or {}

    sale = Sale(
        business_id=user.business_id,
        invoice_no = data.get("invoiceNo") or f"INV-{int(datetime.utcnow().timestamp())}",
        customer_name=data.get("customerName", "Walk-in"),
        payment_method=data.get("paymentMethod", "Cash"),
        amount=float(data.get("amount") or 0),
        discount=float(data.get("discount") or 0),
        employee_id=data.get("employeeId"),
        status=data.get("status", "Paid"),
    )
    db.session.add(sale)
    db.session.commit()
    return jsonify({"success": True, "data": {"id": sale.id}, "message": "Sale recorded successfully."}), 201


@sales_bp.put("/sales/<int:sale_id>")
@jwt_required()
def update_sale(sale_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    sale = Sale.query.filter_by(id=sale_id, business_id=user.business_id).first()
    if not sale:
        return jsonify({"success": False, "message": "Sale not found"}), 404

    data = request.get_json(silent=True) or {}
    sale.invoice_no = data.get("invoiceNo", sale.invoice_no)
    sale.customer_name = data.get("customerName", sale.customer_name)
    sale.payment_method = data.get("paymentMethod", sale.payment_method)
    sale.amount = float(data.get("amount") or sale.amount)
    sale.discount = float(data.get("discount") or sale.discount)
    sale.status = data.get("status", sale.status)
    db.session.commit()
    return jsonify({"success": True, "message": "Sale updated successfully."})


@sales_bp.delete("/sales/<int:sale_id>")
@jwt_required()
def delete_sale(sale_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    sale = Sale.query.filter_by(id=sale_id, business_id=user.business_id).first()
    if not sale:
        return jsonify({"success": False, "message": "Sale not found"}), 404
    db.session.delete(sale)
    db.session.commit()
    return jsonify({"success": True, "message": "Sale deleted."})


@sales_bp.get("/sales/summary")
@jwt_required()
def sales_summary():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    base = Sale.query.filter_by(business_id=user.business_id)

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    total = base.with_entities(func.coalesce(func.sum(Sale.amount), 0)).scalar() or 0
    today = base.filter(Sale.date >= today_start) \
                .with_entities(func.coalesce(func.sum(Sale.amount), 0)).scalar() or 0
    cash = base.filter(Sale.payment_method == "Cash") \
               .with_entities(func.coalesce(func.sum(Sale.amount), 0)).scalar() or 0
    mpesa = base.filter(Sale.payment_method == "M-Pesa") \
                .with_entities(func.coalesce(func.sum(Sale.amount), 0)).scalar() or 0

    return jsonify({"success": True, "data": {
        "todaySales": float(today),
        "totalSales": float(total),
        "cashSales": float(cash),
        "mpesaSales": float(mpesa),
    }})
