# ============================================================
# routes/auth.py — Authentication REST API Blueprint
# Provides user registration, login, logout & session validation
# ============================================================

from flask import Blueprint, request, jsonify, session
from models.users import create_user, authenticate_user, get_user_by_id

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()
        full_name = data.get("full_name", "").strip()

        if not email or not password or not full_name:
            return jsonify({"error": "Full name, email, and password are required."}), 400

        user = create_user(email, password, full_name, role="user")
        session['user_id'] = user['user_id']
        session['role'] = user['role']

        return jsonify({
            "message": "Account registered successfully.",
            "user": user
        }), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@auth_bp.route("/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({"error": "Email and password are required."}), 400

        user = authenticate_user(email, password)
        if not user:
            return jsonify({"error": "Invalid email or password."}), 401

        session['user_id'] = user['user_id']
        session['role'] = user['role']

        return jsonify({
            "message": "Login successful.",
            "user": user
        }), 200
    except Exception as e:
        return jsonify({"error": f"Authentication failed: {str(e)}"}), 500

@auth_bp.route("/auth/me", methods=["GET"])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"user": None}), 200

    user = get_user_by_id(user_id)
    return jsonify({"user": user}), 200

@auth_bp.route("/auth/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully."}), 200
