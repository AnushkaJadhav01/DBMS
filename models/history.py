# ============================================================
# models/history.py — Prediction History & Admin Analytics DAO
# Manages user prediction logs and admin metrics database operations
# ============================================================

import json
from datetime import datetime
from models.db import get_db

def log_prediction(user_id, product_id, category, price, stock, predicted_demand, conf_lower, conf_upper, model_version, inputs_dict):
    """Saves a prediction entry into the database history table."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    inputs_json = json.dumps(inputs_dict)

    query = """
        INSERT INTO prediction_history 
        (User_ID, Product_ID, Category, Price, Stock, Predicted_Demand, Confidence_Lower, Confidence_Upper, Model_Version, Created_At, Inputs_JSON)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(query, (user_id, product_id, category, price, stock, predicted_demand, conf_lower, conf_upper, model_version, created_at, inputs_json))
    history_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()

    return {
        "history_id": history_id,
        "user_id": user_id,
        "product_id": product_id,
        "category": category,
        "price": price,
        "stock": stock,
        "predicted_demand": predicted_demand,
        "confidence_lower": conf_lower,
        "confidence_upper": conf_upper,
        "model_version": model_version,
        "created_at": created_at
    }

def get_user_history(user_id=None, limit=100):
    """Fetches history records for a specific user, or all if user_id is None."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    if user_id:
        query = """
            SELECT h.*, u.Full_Name, u.Email 
            FROM prediction_history h
            LEFT JOIN users u ON h.User_ID = u.User_ID
            WHERE h.User_ID = %s
            ORDER BY h.History_ID DESC LIMIT %s
        """
        cursor.execute(query, (user_id, limit))
    else:
        query = """
            SELECT h.*, u.Full_Name, u.Email 
            FROM prediction_history h
            LEFT JOIN users u ON h.User_ID = u.User_ID
            ORDER BY h.History_ID DESC LIMIT %s
        """
        cursor.execute(query, (limit,))

    rows = cursor.fetchall() or []
    cursor.close()
    conn.close()

    history = []
    for r in rows:
        inputs = {}
        if r.get('Inputs_JSON'):
            try:
                inputs = json.loads(r['Inputs_JSON'])
            except Exception:
                pass

        history.append({
            "history_id": r['History_ID'],
            "user_id": r.get('User_ID'),
            "user_name": r.get('Full_Name', 'Guest User'),
            "user_email": r.get('Email', 'guest@coldchain.com'),
            "product_id": r.get('Product_ID', 'N/A'),
            "category": r.get('Category', 'Vaccines'),
            "price": float(r.get('Price', 0.0) or 0.0),
            "stock": int(r.get('Stock', 0) or 0),
            "predicted_demand": float(r.get('Predicted_Demand', 0.0) or 0.0),
            "confidence_lower": float(r.get('Confidence_Lower', 0.0) or 0.0),
            "confidence_upper": float(r.get('Confidence_Upper', 0.0) or 0.0),
            "model_version": r.get('Model_Version', '1.0'),
            "created_at": r.get('Created_At', ''),
            "inputs": inputs
        })
    return history

def delete_user_history_item(history_id, user_id=None):
    """Deletes a specific history record."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    if user_id:
        cursor.execute("DELETE FROM prediction_history WHERE History_ID = %s AND User_ID = %s", (history_id, user_id))
    else:
        cursor.execute("DELETE FROM prediction_history WHERE History_ID = %s", (history_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return True

def get_admin_analytics_summary():
    """Aggregates system analytics for admin dashboard."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # Total Users
    cursor.execute("SELECT COUNT(*) AS total_users FROM users")
    row_u = cursor.fetchone()
    total_users = row_u['total_users'] if isinstance(row_u, dict) else row_u[0] if row_u else 0

    # Total Predictions
    cursor.execute("SELECT COUNT(*) AS total_predictions FROM prediction_history")
    row_p = cursor.fetchone()
    total_predictions = row_p['total_predictions'] if isinstance(row_p, dict) else row_p[0] if row_p else 0

    # Average Predicted Demand
    cursor.execute("SELECT AVG(Predicted_Demand) AS avg_demand FROM prediction_history")
    row_a = cursor.fetchone()
    avg_demand = float(row_a['avg_demand']) if row_a and row_a.get('avg_demand') is not None else 0.0

    # Predictions per day
    cursor.execute("""
        SELECT SUBSTR(Created_At, 1, 10) AS log_date, COUNT(*) AS count 
        FROM prediction_history 
        GROUP BY SUBSTR(Created_At, 1, 10) 
        ORDER BY log_date DESC LIMIT 14
    """)
    daily_rows = cursor.fetchall() or []
    predictions_per_day = [{"date": r['log_date'], "count": r['count']} for r in daily_rows]

    # Most-used Categories
    cursor.execute("""
        SELECT Category, COUNT(*) AS count 
        FROM prediction_history 
        GROUP BY Category 
        ORDER BY count DESC LIMIT 5
    """)
    cat_rows = cursor.fetchall() or []
    top_categories = [{"category": r['Category'] or 'Vaccines', "count": r['count']} for r in cat_rows]

    cursor.close()
    conn.close()

    return {
        "total_users": total_users,
        "total_predictions": total_predictions,
        "avg_predicted_demand": round(avg_demand, 2),
        "predictions_per_day": predictions_per_day,
        "top_categories": top_categories
    }
