# routes/dashboard.py — Real Schema Alignment
from flask import Blueprint, jsonify
from models.db import get_db
import traceback

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/dashboard", methods=["GET"])
def get_dashboard():
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT COUNT(*) AS total FROM orders")
        total_orders = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) AS total FROM supplier")
        total_suppliers = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) AS total FROM payment")
        total_payments = cursor.fetchone()["total"]

        # Real Shipment table: No 'Status' column. We count all shipments.
        cursor.execute("SELECT COUNT(*) AS total FROM shipment")
        active_shipments = cursor.fetchone()["total"]

        # Total revenue from Payment table
        try:
            cursor.execute("SELECT COALESCE(SUM(Amount), 0) AS total FROM payment")
            total_revenue = float(cursor.fetchone()["total"])
        except Exception:
            total_revenue = 0.0

        # Orders per day last 7 days (uses Order_Date)
        try:
            cursor.execute("""
                SELECT DATE(Order_Date) AS day, COUNT(*) AS count
                FROM orders
                WHERE Order_Date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                GROUP BY DATE(Order_Date)
                ORDER BY day
            """)
            chart_raw = cursor.fetchall()
        except Exception:
            chart_raw = []

        # Recent 5 orders
        try:
            cursor.execute("""
                SELECT Order_ID, Product_ID, Supplier_ID, Tracking_No, Order_Date
                FROM orders ORDER BY Order_ID DESC LIMIT 5
            """)
            recent_orders = cursor.fetchall()
        except Exception:
            recent_orders = []

        # Recent 5 payments
        try:
            cursor.execute("SELECT * FROM payment ORDER BY Payment_ID DESC LIMIT 5")
            recent_payments = cursor.fetchall()
        except Exception:
            recent_payments = []

        cursor.close(); conn.close()

        def serialize(rows):
            out = []
            for r in rows:
                d = {}
                for k, v in r.items():
                    d[k] = str(v) if hasattr(v, 'strftime') else v
                out.append(d)
            return out

        return jsonify({
            "stats": {
                "total_orders":     total_orders,
                "total_suppliers":  total_suppliers,
                "total_payments":   total_payments,
                "total_revenue":    total_revenue,
                "active_shipments": active_shipments
            },
            "chart": [{"day": str(r["day"]), "count": r["count"]} for r in chart_raw],
            "recent_orders":   serialize(recent_orders),
            "recent_payments": serialize(recent_payments),
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
