# routes/payments.py — Includes /api/payments/<id>/bill for Print Bill
from flask import Blueprint, jsonify, request
import models.payments as model
import traceback

payments_bp = Blueprint("payments", __name__)

def serialize_rows(rows):
    out = []
    for r in rows:
        out.append({k: (str(v) if hasattr(v, 'strftime') else v) for k, v in r.items()})
    return out

@payments_bp.route("/payments", methods=["GET"])
def list_payments():
    search = request.args.get("search", "").strip()
    status = request.args.get("status", "").strip()
    try:
        return jsonify(serialize_rows(model.get_all_payments(search or None, status or None)))
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@payments_bp.route("/payments/<pid>", methods=["GET"])
def get_payment(pid):
    try:
        row = model.get_payment_by_id(pid)
        if not row: return jsonify({"error": "Not found"}), 404
        return jsonify({k: (str(v) if hasattr(v, 'strftime') else v) for k, v in row.items()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@payments_bp.route("/payments/<pid>/bill", methods=["GET"])
def get_bill(pid):
    """Return payment details for Print Bill popup."""
    try:
        row = model.get_payment_by_id(pid)
        if not row: return jsonify({"error": "Payment not found"}), 404
        return jsonify({k: (str(v) if hasattr(v, 'strftime') else v) for k, v in row.items()})
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@payments_bp.route("/payments", methods=["POST"])
def create_payment():
    data = request.get_json()
    if not all(k in data for k in ["Order_ID", "Amount"]):
        return jsonify({"error": "Missing required fields"}), 400
    try:
        pid = model.create_payment(data)
        return jsonify({"message": "Payment added", "Payment_ID": pid}), 201
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@payments_bp.route("/payments/<pid>", methods=["PUT"])
def update_payment(pid):
    data = request.get_json()
    try:
        rows = model.update_payment(pid, data)
        if rows == 0: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Payment updated"})
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500

@payments_bp.route("/payments/<pid>", methods=["DELETE"])
def delete_payment(pid):
    try:
        rows = model.delete_payment(pid)
        if rows == 0: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Payment deleted"})
    except Exception as e:
        traceback.print_exc(); return jsonify({"error": str(e)}), 500
