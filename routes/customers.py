# routes/customers.py
from flask import Blueprint, jsonify, request
import models.customers as model
import traceback

customers_bp = Blueprint("customers", __name__)

@customers_bp.route("/customers", methods=["GET"])
def list_customers():
    search = request.args.get("search", "").strip()
    try:
        return jsonify(model.get_all_customers(search or None))
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@customers_bp.route("/customers/<cid>", methods=["GET"])
def get_customer(cid):
    try:
        row = model.get_customer_by_id(cid)
        if not row: return jsonify({"error": "Not found"}), 404
        return jsonify(row)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@customers_bp.route("/customers", methods=["POST"])
def create_customer():
    data = request.get_json()
    if not all(k in data for k in ["Customer_ID", "Customer_Name"]):
        return jsonify({"error": "Missing required fields"}), 400
    try:
        cid = model.create_customer(data)
        return jsonify({"message": "Customer added", "Customer_ID": cid}), 201
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@customers_bp.route("/customers/<cid>", methods=["PUT"])
def update_customer(cid):
    data = request.get_json()
    try:
        rows = model.update_customer(cid, data)
        if rows == 0: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Customer updated"})
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@customers_bp.route("/customers/<cid>", methods=["DELETE"])
def delete_customer(cid):
    try:
        rows = model.delete_customer(cid)
        if rows == 0: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Customer deleted"})
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500
