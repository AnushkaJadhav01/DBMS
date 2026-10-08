# ============================================================
# routes/history_routes.py — User Prediction History Blueprint
# Serving user's prediction history & delete actions
# ============================================================

from flask import Blueprint, request, jsonify, session
from models.history import get_user_history, delete_user_history_item

history_bp = Blueprint("history", __name__)

@history_bp.route("/predictions/history", methods=["GET"])
def api_get_history():
    try:
        user_id = session.get('user_id')
        role = session.get('role', 'user')

        # If admin, can retrieve all history records; otherwise user's own history
        if role == 'admin':
            history = get_user_history(user_id=None)
        else:
            history = get_user_history(user_id=user_id) if user_id else []

        return jsonify({"history": history}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve history: {str(e)}"}), 500

@history_bp.route("/predictions/history/<int:history_id>", methods=["DELETE"])
def api_delete_history(history_id):
    try:
        user_id = session.get('user_id')
        role = session.get('role', 'user')

        if role == 'admin':
            delete_user_history_item(history_id, user_id=None)
        else:
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            delete_user_history_item(history_id, user_id=user_id)

        return jsonify({"message": "History record deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to delete history record: {str(e)}"}), 500
