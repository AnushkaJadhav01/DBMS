# ============================================================
# routes/ml_routes.py — Machine Learning Prediction & Batch REST API
# Handles single prediction, CSV batch prediction, metrics & comparisons
# ============================================================

import os
import csv
import io
import json
from flask import Blueprint, request, jsonify, session, Response
from ml.predict import predict_demand, load_metrics, load_model_comparison, METRICS_PATH
from models.history import log_prediction

ml_bp = Blueprint("ml", __name__)

@ml_bp.route("/predict-demand", methods=["POST"])
def api_predict_demand():
    try:
        data = request.get_json() or {}
        result = predict_demand(data)

        # Log prediction to user's history if authenticated
        user_id = session.get('user_id')
        if user_id:
            try:
                log_prediction(
                    user_id=user_id,
                    product_id=result["features"].get("product_id", "N/A"),
                    category=result["features"].get("category", "Vaccines"),
                    price=result["features"].get("price", 0.0),
                    stock=result["features"].get("current_stock", 0),
                    predicted_demand=result["prediction"],
                    conf_lower=result["confidence_range"]["lower"],
                    conf_upper=result["confidence_range"]["upper"],
                    model_version=result["model"],
                    inputs_dict=result["features"]
                )
            except Exception:
                pass

        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

@ml_bp.route("/predict-batch", methods=["POST"])
def api_predict_batch():
    """
    Batch prediction endpoint.
    Accepts CSV file upload (file field 'file') or JSON body with 'rows' array.
    Returns processed predictions.
    """
    try:
        rows_data = []

        if 'file' in request.files:
            file = request.files['file']
            if not file.filename.endswith('.csv'):
                return jsonify({"error": "Only CSV files are supported."}), 400

            stream = io.StringIO(file.stream.read().decode("utf8"), newline=None)
            csv_reader = csv.DictReader(stream)

            for row in csv_reader:
                rows_data.append({
                    "product_id": row.get("product_id") or row.get("Product_ID") or "P101",
                    "category": row.get("category") or row.get("Category") or "Vaccines",
                    "price": float(row.get("price") or row.get("Price") or 1000),
                    "current_stock": float(row.get("current_stock") or row.get("Stock") or 100),
                    "temperature_required": float(row.get("temperature_required") or row.get("Temperature_required") or 4)
                })
        else:
            body = request.get_json() or {}
            rows_data = body.get("rows", [])

        if not rows_data:
            return jsonify({"error": "No data rows provided for batch prediction."}), 400

        results = []
        user_id = session.get('user_id')

        for item in rows_data:
            pred_res = predict_demand(item)
            results.append({
                "product_id": pred_res["features"]["product_id"],
                "category": pred_res["features"]["category"],
                "price": pred_res["features"]["price"],
                "current_stock": pred_res["features"]["current_stock"],
                "temperature_required": pred_res["features"]["temperature_required"],
                "predicted_demand": pred_res["prediction"],
                "confidence_lower": pred_res["confidence_range"]["lower"],
                "confidence_upper": pred_res["confidence_range"]["upper"],
                "model": pred_res["model"]
            })

            if user_id:
                try:
                    log_prediction(
                        user_id=user_id,
                        product_id=pred_res["features"]["product_id"],
                        category=pred_res["features"]["category"],
                        price=pred_res["features"]["price"],
                        stock=pred_res["features"]["current_stock"],
                        predicted_demand=pred_res["prediction"],
                        conf_lower=pred_res["confidence_range"]["lower"],
                        conf_upper=pred_res["confidence_range"]["upper"],
                        model_version=pred_res["model"],
                        inputs_dict=pred_res["features"]
                    )
                except Exception:
                    pass

        return jsonify({
            "total_processed": len(results),
            "results": results
        }), 200
    except Exception as e:
        return jsonify({"error": f"Batch prediction error: {str(e)}"}), 500

@ml_bp.route("/ml/metrics", methods=["GET"])
def api_get_metrics():
    try:
        metrics = load_metrics()
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ml_bp.route("/ml/comparison", methods=["GET"])
def api_get_comparison():
    try:
        comparison = load_model_comparison()
        return jsonify({"comparison": comparison}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
