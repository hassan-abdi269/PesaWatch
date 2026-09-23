from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from app.extensions import db
from app.models import User, Sale, SaleItem, Product

sales_bp = Blueprint("sales", __name__)


def _serialize(s):
    return {
        "id": s.id,
        "invoiceNo": s.invoice_no,
        "date": s.date.isoformat() if s.date else None,
        "customerId": s.customer_id,
        "customerName": s.customer_name,
        "paymentMethod": s.payment_method,
        "amount": s.amount,
        "discount": s.discount,
        "employeeId": s.employee_id,
        "status": s.status,
        "items": [
            {
                "id": it.id,
                "productId": it.product_id,
                "productName": it.product_name,
                "quantity": it.quantity,
                "unitPrice": it.unit_price,
                "costPrice": it.cost_price,
                "lineDiscount": it.line_discount,
                "lineTotal": it.line_total,
            }
            for it in (s.items or [])
        ],
    }


# --- GET /api/sales ---
@sales_bp.get("/sales")
@jwt_required()
def get_sales():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    rows = (Sale.query
            .filter_by(business_id=user.business_id)
            .order_by(Sale.date.desc())
            .all())
    return jsonify({"success": True, "data": [_serialize(s) for s in rows]})


# --- GET /api/sales/summary ---
# Must be declared BEFORE any <int:sale_id> route
@sales_bp.get("/sales/summary")
@jwt_required()
def sales_summary():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    base = Sale.query.filter_by(business_id=user.business_id)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    total = base.with_entities(func.coalesce(func.sum(Sale.amount), 0)).scalar() or 0
    today = (base.filter(Sale.date >= today_start)
             .with_entities(func.coalesce(func.sum(Sale.amount), 0)).scalar() or 0)
    cash = (base.filter(Sale.payment_method == "Cash")
            .with_entities(func.coalesce(func.sum(Sale.amount), 0)).scalar() or 0)
    mpesa = (base.filter(Sale.payment_method == "M-Pesa")
             .with_entities(func.coalesce(func.sum(Sale.amount), 0)).scalar() or 0)

    return jsonify({"success": True, "data": {
        "todaySales": float(today),
        "totalSales": float(total),
        "cashSales": float(cash),
        "mpesaSales": float(mpesa),
    }})


# --- POST /api/sales ---
@sales_bp.post("/sales")
@jwt_required()
def create_sale():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    invoice_no = data.get("invoiceNo") or f"INV-{int(datetime.utcnow().timestamp())}"

    if Sale.query.filter_by(invoice_no=invoice_no).first():
        return jsonify({
            "success": False,
            "message": f"Invoice '{invoice_no}' already exists.",
        }), 409

    sale = Sale(
        business_id=user.business_id,
        invoice_no=invoice_no,
        customer_id=data.get("customerId"),
        customer_name=data.get("customerName") or "Walk-in",
        payment_method=data.get("paymentMethod", "Cash"),
        amount=float(data.get("amount") or 0),
        discount=float(data.get("discount") or 0),
        employee_id=data.get("employeeId"),
        status=data.get("status", "Paid"),
    )
    db.session.add(sale)
    db.session.flush()

    for item in data.get("items", []) or []:
        qty = float(item.get("quantity") or 1)
        price = float(item.get("unitPrice") or 0)
        line_disc = float(item.get("lineDiscount") or 0)
        si = SaleItem(
            sale_id=sale.id,
            product_id=item.get("productId"),
            product_name=item.get("productName") or "Item",
            quantity=qty,
            unit_price=price,
            cost_price=float(item.get("costPrice") or 0),
            line_discount=line_disc,
            line_total=qty * price - line_disc,
        )
        db.session.add(si)

        if item.get("productId"):
            prod = Product.query.filter_by(
                id=item["productId"], business_id=user.business_id
            ).first()
            if prod:
                prod.quantity = (prod.quantity or 0) - qty

    db.session.commit()
    return jsonify({
        "success": True,
        "data": _serialize(sale),
        "message": "Sale recorded successfully.",
    }), 201


# --- PUT /api/sales/<id> ---
@sales_bp.put("/sales/<int:sale_id>")
@jwt_required()
def update_sale(sale_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    sale = Sale.query.filter_by(id=sale_id, business_id=user.business_id).first()
    if not sale:
        return jsonify({"success": False, "message": "Sale not found"}), 404

    data = request.get_json(silent=True) or {}

    new_invoice = data.get("invoiceNo")
    if new_invoice and new_invoice != sale.invoice_no:
        clash = Sale.query.filter(
            Sale.invoice_no == new_invoice,
            Sale.id != sale.id,
        ).first()
        if clash:
            return jsonify({
                "success": False,
                "message": f"Invoice '{new_invoice}' already exists.",
            }), 409
        sale.invoice_no = new_invoice

    if "customerId" in data:
        sale.customer_id = data["customerId"]
    if data.get("customerName"):
        sale.customer_name = data["customerName"]
    if data.get("paymentMethod"):
        sale.payment_method = data["paymentMethod"]
    if data.get("amount") is not None:
        sale.amount = float(data["amount"])
    if data.get("discount") is not None:
        sale.discount = float(data["discount"])
    if "employeeId" in data:
        sale.employee_id = data["employeeId"] or None
    if data.get("status"):
        sale.status = data["status"]

    db.session.commit()
    return jsonify({
        "success": True,
        "data": _serialize(sale),
        "message": "Sale updated successfully.",
    })


# --- DELETE /api/sales/<id> ---
@sales_bp.delete("/sales/<int:sale_id>")
@jwt_required()
def delete_sale(sale_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    sale = Sale.query.filter_by(id=sale_id, business_id=user.business_id).first()
    if not sale:
        return jsonify({"success": False, "message": "Sale not found"}), 404

    db.session.delete(sale)
    db.session.commit()
    return jsonify({"success": True, "message": "Sale deleted."})