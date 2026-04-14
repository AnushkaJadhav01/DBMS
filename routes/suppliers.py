# routes/suppliers.py — Supplier_ID is a string key (not int)
from flask import Blueprint, jsonify, request
import models.suppliers as model
import traceback

suppliers_bp = Blueprint("suppliers", __name__)

@suppliers_bp.route("/suppliers", methods=["GET"])
def list_suppliers():
    search = request.args.get("search", "").strip()
    try:
        return jsonify(model.get_all_suppliers(search or None))
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@suppliers_bp.route("/suppliers/<sid>", methods=["GET"])
def get_supplier(sid):
    try:
        row = model.get_supplier_by_id(sid)
        if not row: return jsonify({"error": "Not found"}), 404
        return jsonify(row)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@suppliers_bp.route("/suppliers", methods=["POST"])
def create_supplier():
    data = request.get_json()
    if not all(k in data for k in ["Supplier_ID", "Phone_No", "Area"]):
        return jsonify({"error": "Missing required fields: Supplier_ID, Phone_No, Area"}), 400
    try:
        sid = model.create_supplier(data)
        return jsonify({"message": "Supplier added", "Supplier_ID": sid}), 201
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@suppliers_bp.route("/suppliers/<sid>", methods=["PUT"])
def update_supplier(sid):
    data = request.get_json()
    try:
        rows = model.update_supplier(sid, data)
        if rows == 0: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Supplier updated"})
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@suppliers_bp.route("/suppliers/<sid>", methods=["DELETE"])
def delete_supplier(sid):
    try:
        rows = model.delete_supplier(sid)
        if rows == 0: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Supplier deleted"})
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500
