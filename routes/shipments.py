# routes/shipments.py
from flask import Blueprint, jsonify, request
import models.shipments as model
import traceback

shipments_bp = Blueprint("shipments", __name__)

def serialize_rows(rows):
    out = []
    for r in rows:
        out.append({k: (str(v) if hasattr(v, 'strftime') else v) for k, v in r.items()})
    return out

@shipments_bp.route("/shipments", methods=["GET"])
def list_shipments():
    search = request.args.get("search", "").strip()
    try:
        return jsonify(serialize_rows(model.get_all_shipments(search or None)))
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@shipments_bp.route("/shipments/<sid>", methods=["GET"])
def get_shipment(sid):
    try:
        row = model.get_shipment_by_id(sid)
        if not row: return jsonify({"error": "Not found"}), 404
        return jsonify({k: (str(v) if hasattr(v, 'strftime') else v) for k, v in row.items()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@shipments_bp.route("/shipments", methods=["POST"])
def create_shipment():
    data = request.get_json()
    if not all(k in data for k in ["Shipment_ID", "Order_ID"]):
        return jsonify({"error": "Missing Shipment_ID and Order_ID"}), 400
    try:
        sid = model.create_shipment(data)
        return jsonify({"message": "Shipment added", "Shipment_ID": sid}), 201
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@shipments_bp.route("/shipments/<sid>", methods=["PUT"])
def update_shipment(sid):
    data = request.get_json()
    try:
        rows = model.update_shipment(sid, data)
        if rows == 0: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Shipment updated"})
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@shipments_bp.route("/shipments/<sid>", methods=["DELETE"])
def delete_shipment(sid):
    try:
        rows = model.delete_shipment(sid)
        if rows == 0: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Shipment deleted"})
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500
