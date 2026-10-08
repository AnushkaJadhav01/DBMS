# ============================================================
# tests/test_api.py — REST API Endpoint Integration Tests
# Tests authentication, prediction endpoints, history, and admin exports
# ============================================================

import os
import sys
import unittest
import time

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SECRET_KEY'] = 'test_secret_key'
        self.client = app.test_client()

    def test_api_predict_demand(self):
        payload = {
            "product_id": "P101",
            "category": "Vaccines",
            "price": 1250,
            "current_stock": 120,
            "temperature_required": -20
        }
        res = self.client.post('/api/predict-demand', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("prediction", data)
        self.assertGreater(data["prediction"], 0)
        self.assertIn("confidence_range", data)

    def test_api_ml_metrics(self):
        res = self.client.get('/api/ml/metrics')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("r2_score", data)

    def test_api_ml_comparison(self):
        res = self.client.get('/api/ml/comparison')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("comparison", data)
        self.assertGreaterEqual(len(data["comparison"]), 4)

    def test_auth_register_and_login(self):
        test_email = f"test_{int(time.time())}@coldchain.com"
        reg_payload = {
            "email": test_email,
            "password": "password123",
            "full_name": "Test Engineer"
        }
        res_reg = self.client.post('/api/auth/register', json=reg_payload)
        self.assertIn(res_reg.status_code, [201, 400])

        login_payload = {
            "email": "demo@coldchain.com",
            "password": "demo123"
        }
        res_login = self.client.post('/api/auth/login', json=login_payload)
        self.assertEqual(res_login.status_code, 200)
        data_login = res_login.get_json()
        self.assertEqual(data_login["user"]["email"], "demo@coldchain.com")

    def test_admin_stats(self):
        res = self.client.get('/api/admin/stats')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("analytics", data)

    def test_admin_export_csv(self):
        res = self.client.get('/api/admin/export-csv')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.mimetype, "text/csv")

if __name__ == '__main__':
    unittest.main()
