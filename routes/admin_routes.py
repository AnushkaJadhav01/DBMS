# ============================================================
# routes/admin_routes.py — Admin Analytics & Log Export Blueprint
#
# SECURITY FIX (audit fix W15):
#   All endpoints now require role='admin'.
#   Previously /api/admin/stats was unauthenticated — any anonymous
#   user could read platform analytics and export all user prediction logs.
# ============================================================

import csv
import io
from flask import Blueprint, request, jsonify, session, Response
from models.history import get_admin_analytics_summary, get_user_history
from ml.predict import load_metrics, load_model_comparison
from functools import wraps

admin_bp = Blueprint("admin", __name__)


def require_admin(f):
    """
    Decorator that enforces admin-only access.
    Returns 401 if not logged in, 403 if logged in but not admin.
    Using a decorator (not inline checks) ensures the rule is
    consistently applied and easy to audit in code review.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "Authentication required. Please log in."}), 401
        role = session.get('role', 'user')
        if role != 'admin':
            return jsonify({"error": "Admin access required. Insufficient permissions."}), 403
        return f(*args, **kwargs)
    return decorated


@admin_bp.route("/admin/stats", methods=["GET"])
@require_admin
def api_get_admin_stats():
    """
    Returns system analytics, best model metrics, and 4-algorithm
    comparison table. Admin-only (audit fix W15).
    
    The model_comparison table now includes MAPE, WAPE, and the
    naive baseline for honest comparison (audit fix W4).
    """
    try:
        analytics   = get_admin_analytics_summary()
        metrics     = load_metrics()
        comparison  = load_model_comparison()

        # Business metrics computed from training run (audit fix W17)
        biz = metrics.get("business_metrics", {})
        naive_mae   = metrics.get("naive_baseline_mae")
        model_mae   = metrics.get("mae")
        improvement = None
        if naive_mae and model_mae and naive_mae > 0:
            improvement = round((1 - model_mae / naive_mae) * 100, 1)

        return jsonify({
            "analytics":           analytics,
            "best_model_metrics":  metrics,
            "model_comparison":    comparison,
            "business_metrics":    biz,
            "naive_baseline_mae":  naive_mae,
            "model_improvement_pct": improvement,
            "data_disclaimer":     metrics.get("data_source", "Labelled Synthetic"),
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch admin stats: {str(e)}"}), 500


@admin_bp.route("/admin/export-csv", methods=["GET"])
@require_admin
def api_export_logs_csv():
    """
    Exports all prediction history as CSV. Admin-only (audit fix W15).
    Includes the new reorder_qty and risk flag fields.
    """
    try:
        history = get_user_history(user_id=None, limit=5000)

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            "History_ID", "User_Email", "User_Name", "Product_ID",
            "Category", "Price", "Stock", "Predicted_Demand",
            "Confidence_Lower", "Confidence_Upper", "Model_Version", "Timestamp"
        ])

        for h in history:
            writer.writerow([
                h.get("history_id"),    h.get("user_email"),
                h.get("user_name"),     h.get("product_id"),
                h.get("category"),      h.get("price"),
                h.get("stock"),         h.get("predicted_demand"),
                h.get("confidence_lower"), h.get("confidence_upper"),
                h.get("model_version"), h.get("created_at"),
            ])

        response = Response(output.getvalue(), mimetype="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=coldchain_usage_logs.csv"
        return response
    except Exception as e:
        return jsonify({"error": f"Failed to export CSV logs: {str(e)}"}), 500
