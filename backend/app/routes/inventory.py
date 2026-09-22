from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, Product

inventory_bp = Blueprint("inventory", __name__)


@inventory_bp.get("/inventory")
@jwt_required()
def get_inventory():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    inventory = [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "category": p.category,
            "supplier": p.supplier,
            "purchasePrice": p.purchase_price,
            "sellingPrice": p.selling_price,
            "quantity": p.quantity,
            "reorderLevel": p.reorder_level,
            "expiryDate": p.expiry_date.isoformat() if p.expiry_date else None,
            "businessId": p.business_id,
        }
        for p in Product.query.filter_by(business_id=user.business_id).all()
    ]
    return jsonify({"success": True, "data": inventory})


@inventory_bp.post("/inventory")
@jwt_required()
def create_inventory_item():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    data = request.get_json(silent=True) or {}
    product = Product(
        business_id=user.business_id,
        name=data.get("name", "New Product"),
        sku=data.get("sku", "SKU-NEW"),
        category=data.get("category", "General"),
        supplier=data.get("supplier", "Unknown"),
        purchase_price=float(data.get("purchasePrice") or 0),
        selling_price=float(data.get("sellingPrice") or 0),
        quantity=int(data.get("quantity") or 0),
        reorder_level=int(data.get("reorderLevel") or 0),
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({"success": True, "data": {"id": product.id}, "message": "Product created successfully."}), 201


@inventory_bp.get("/inventory/<int:item_id>")
@jwt_required()
def get_inventory_item(item_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    product = Product.query.filter_by(id=item_id, business_id=user.business_id).first()
    if not product:
        return jsonify({"success": False, "message": "Product not found"}), 404

    return jsonify({"success": True, "data": {
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "category": product.category,
        "supplier": product.supplier,
        "purchasePrice": product.purchase_price,
        "sellingPrice": product.selling_price,
        "quantity": product.quantity,
        "reorderLevel": product.reorder_level,
        "expiryDate": product.expiry_date.isoformat() if product.expiry_date else None,
    }})


@inventory_bp.put("/inventory/<int:item_id>")
@jwt_required()
def update_inventory_item(item_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    product = Product.query.filter_by(id=item_id, business_id=user.business_id).first()
    if not product:
        return jsonify({"success": False, "message": "Product not found"}), 404

    data = request.get_json(silent=True) or {}
    product.name = data.get("name", product.name)
    product.category = data.get("category", product.category)
    product.supplier = data.get("supplier", product.supplier)
    product.purchase_price = float(data.get("purchasePrice") or product.purchase_price)
    product.selling_price = float(data.get("sellingPrice") or product.selling_price)
    product.quantity = int(data.get("quantity") or product.quantity)
    product.reorder_level = int(data.get("reorderLevel") or product.reorder_level)

    db.session.commit()
    return jsonify({"success": True, "message": "Product updated successfully."})


@inventory_bp.delete("/inventory/<int:item_id>")
@jwt_required()
def delete_inventory_item(item_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    product = Product.query.filter_by(id=item_id, business_id=user.business_id).first()
    if not product:
        return jsonify({"success": False, "message": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({"success": True, "message": "Product deleted."})
