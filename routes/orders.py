# routes/orders.py — Order_ID, Product_ID, Supplier_ID, Tracking_No, Order_Date
from flask import Blueprint, jsonify, request
import models.orders as model
import traceback

orders_bp = Blueprint("orders", __name__)

def serialize_rows(rows):
    out = []
    for r in rows:
        d = {}
        for k, v in r.items():
            d[k] = str(v) if hasattr(v, 'strftime') else v
        out.append(d)
    return out

def serialize_row(r):
    if not r: return None
    return {k: (str(v) if hasattr(v, 'strftime') else v) for k, v in r.items()}

@orders_bp.route("/orders", methods=["GET"])
def list_orders():
    search = request.args.get("search", "").strip()
    try:
        return jsonify(serialize_rows(model.get_all_orders(search or None)))
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@orders_bp.route("/orders/<oid>", methods=["GET"])
def get_order(oid):
    try:
        row = model.get_order_by_id(oid)
        if not row: return jsonify({"error": "Not found"}), 404
        return jsonify(serialize_row(row))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@orders_bp.route("/orders", methods=["POST"])
def create_order():
    data = request.get_json()
    if not all(k in data for k in ["Order_ID", "Product_ID", "Supplier_ID"]):
        return jsonify({"error": "Missing required fields"}), 400
    try:
        oid = model.create_order(data)
        return jsonify({"message": "Order created", "Order_ID": oid}), 201
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@orders_bp.route("/orders/<oid>", methods=["PUT"])
def update_order(oid):
    data = request.get_json()
    try:
        rows = model.update_order(oid, data)
        if rows == 0: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Order updated"})
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@orders_bp.route("/orders/<oid>", methods=["DELETE"])
def delete_order(oid):
    try:
        rows = model.delete_order(oid)
        if rows == 0: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Order deleted"})
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500
