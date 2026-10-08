# ============================================================
# tests/test_ml_pipeline.py — ML Core & Inference Unit Tests
# Validates model training, preprocessing, prediction output, and confidence bounds
# ============================================================

import os
import sys
import unittest

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.predict import predict_demand, load_metrics, load_model_comparison

class TestMLPipeline(unittest.TestCase):
    def test_load_metrics(self):
        metrics = load_metrics()
        self.assertIsInstance(metrics, dict)
        self.assertIn("r2_score", metrics)
        self.assertIn("mae", metrics)
        self.assertIn("rmse", metrics)
        self.assertGreater(metrics["r2_score"], 0.50)

    def test_load_model_comparison(self):
        comparison = load_model_comparison()
        self.assertIsInstance(comparison, list)
        self.assertGreaterEqual(len(comparison), 4)
        algorithms = [m["algorithm"] for m in comparison]
        self.assertTrue("Ridge Regression (L2 Linear)" in algorithms or "Gradient Boosting Regressor" in algorithms or "K-Nearest Neighbors Regressor (KNN)" in algorithms)

    def test_single_prediction_valid_input(self):
        input_data = {
            "product_id": "P101",
            "category": "Vaccines",
            "price": 1250,
            "current_stock": 120,
            "temperature_required": -20,
            "hist_avg_demand": 85,
            "order_frequency": 10
        }
        res = predict_demand(input_data)
        self.assertIn("prediction", res)
        self.assertIsInstance(res["prediction"], float)
        self.assertGreater(res["prediction"], 0)
        self.assertIn("confidence_range", res)
        self.assertLessEqual(res["confidence_range"]["lower"], res["prediction"])
        self.assertGreaterEqual(res["confidence_range"]["upper"], res["prediction"])
        self.assertIn("feature_drivers", res)
        self.assertGreater(len(res["feature_drivers"]), 0)

    def test_prediction_invalid_input_negative_price(self):
        input_data = {
            "product_id": "P101",
            "price": -500
        }
        with self.assertRaises(ValueError):
            predict_demand(input_data)

    def test_ml_training_artifacts_exist(self):
        ml_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml")
        self.assertTrue(os.path.exists(os.path.join(ml_dir, "model.pkl")))
        self.assertTrue(os.path.exists(os.path.join(ml_dir, "metrics.json")))
        self.assertTrue(os.path.exists(os.path.join(ml_dir, "model_comparison.json")))

if __name__ == '__main__':
    unittest.main()
