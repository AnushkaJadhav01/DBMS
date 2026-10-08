# ============================================================
# routes/admin_routes.py — Admin Analytics & Log Export Blueprint
# Serves system analytics, user counts, daily usage, and CSV log export
# ============================================================

import csv
import io
from flask import Blueprint, request, jsonify, session, Response
from models.history import get_admin_analytics_summary, get_user_history
from ml.predict import load_metrics, load_model_comparison

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/admin/stats", methods=["GET"])
def api_get_admin_stats():
    try:
        analytics = get_admin_analytics_summary()
        metrics = load_metrics()
        comparison = load_model_comparison()

        return jsonify({
            "analytics": analytics,
            "best_model_metrics": metrics,
            "model_comparison": comparison
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch admin stats: {str(e)}"}), 500

@admin_bp.route("/admin/export-csv", methods=["GET"])
def api_export_logs_csv():
    try:
        history = get_user_history(user_id=None, limit=1000)

        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write CSV Header
        writer.writerow([
            "History_ID", "User_Email", "User_Name", "Product_ID", 
            "Category", "Price", "Stock", "Predicted_Demand", 
            "Confidence_Lower", "Confidence_Upper", "Model_Version", "Timestamp"
        ])

        for h in history:
            writer.writerow([
                h["history_id"],
                h["user_email"],
                h["user_name"],
                h["product_id"],
                h["category"],
                h["price"],
                h["stock"],
                h["predicted_demand"],
                h["confidence_lower"],
                h["confidence_upper"],
                h["model_version"],
                h["created_at"]
            ])

        response = Response(output.getvalue(), mimetype="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=coldchain_usage_logs.csv"
        return response
    except Exception as e:
        return jsonify({"error": f"Failed to export CSV logs: {str(e)}"}), 500
