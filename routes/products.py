# routes/products.py — Product_ID, Product_Name, Price, Supplier_ID
from flask import Blueprint, jsonify, request
import models.products as model
import traceback

products_bp = Blueprint("products", __name__)

@products_bp.route("/products", methods=["GET"])
def list_products():
    search = request.args.get("search", "").strip()
    try:
        return jsonify(model.get_all_products(search or None))
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@products_bp.route("/products/<pid>", methods=["GET"])
def get_product(pid):
    try:
        row = model.get_product_by_id(pid)
        if not row: return jsonify({"error": "Not found"}), 404
        return jsonify(row)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route("/products", methods=["POST"])
def create_product():
    data = request.get_json()
    if not all(k in data for k in ["Product_ID", "Product_Name", "Price", "Supplier_ID"]):
        return jsonify({"error": "Missing required fields"}), 400
    try:
        pid = model.create_product(data)
        return jsonify({"message": "Product added", "Product_ID": pid}), 201
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@products_bp.route("/products/<pid>", methods=["PUT"])
def update_product(pid):
    data = request.get_json()
    try:
        rows = model.update_product(pid, data)
        if rows == 0: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Product updated"})
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@products_bp.route("/products/<pid>", methods=["DELETE"])
def delete_product(pid):
    try:
        rows = model.delete_product(pid)
        if rows == 0: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Product deleted"})
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500
