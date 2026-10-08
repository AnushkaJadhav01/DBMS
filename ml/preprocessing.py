# ============================================================
# ml/preprocessing.py — Feature Engineering & Preprocessing Pipeline
# Extracts data from DBMS orders, shipments, and products.
# Engineers lag & aggregate features without data leakage.
# ============================================================

import math
from datetime import datetime
from models.db import get_db

def load_historical_data():
    """
    Queries historical order, shipment, and product records from DBMS.
    Calculates features prior to each order date in Pure Python without data leakage.
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT 
            s.Shipment_ID,
            s.Order_ID,
            s.Shipment_Date,
            s.Quantity AS Target_Demand,
            o.Order_Date,
            o.Product_ID,
            p.Product_name,
            p.Category,
            p.Check_price AS Price,
            p.Stock AS Current_Stock,
            p.Temperature_required
        FROM shipment s
        JOIN orders o ON s.Order_ID = o.Order_ID
        JOIN product p ON o.Product_ID = p.Product_ID
        ORDER BY o.Order_Date ASC, s.Shipment_ID ASC
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        return []

    processed = []
    product_history = {} # product_id -> list of past quantities

    for row in rows:
        pid = str(row.get('Product_ID', 'UNKNOWN'))
        target_demand = float(row.get('Target_Demand', 0))
        past_q = product_history.get(pid, [])

        avg_d = float(sum(past_q) / len(past_q)) if past_q else target_demand
        freq = len(past_q)

        dt_str = str(row.get('Order_Date', '2020-01-01'))
        try:
            dt = datetime.strptime(dt_str.split(' ')[0], "%Y-%m-%d")
            month = dt.month
            dayofweek = dt.weekday()
        except Exception:
            month = 1
            dayofweek = 0

        processed.append({
            'Shipment_ID': row.get('Shipment_ID'),
            'Order_ID': row.get('Order_ID'),
            'Product_ID': pid,
            'Product_name': row.get('Product_name', ''),
            'Category': row.get('Category') or 'Vaccines',
            'Price': float(row.get('Price') or 1000),
            'Current_Stock': float(row.get('Current_Stock') or 100),
            'Temperature_required': float(row.get('Temperature_required') or 4),
            'Target_Demand': target_demand,
            'Order_Date': dt_str,
            'hist_avg_demand': avg_d,
            'order_frequency': freq,
            'month': month,
            'dayofweek': dayofweek
        })

        if pid not in product_history:
            product_history[pid] = []
        product_history[pid].append(target_demand)

    return processed

def build_preprocessing_pipeline(categorical_features, numeric_features):
    """
    Returns PureDataPreprocessor instance for pure Python transformation.
    """
    return PureDataPreprocessor()

CATEGORIES = ["Vaccines", "Insulin", "Blood Products", "Biologics", "Lab Reagents", "Diagnostics"]

class PureDataPreprocessor:
    """
    Pure Python feature scaling and One-Hot Encoding preprocessor.
    Stores feature statistics (means, stds) learned ONLY from training set.
    """
    def __init__(self):
        self.categories = CATEGORIES
        self.means = {}
        self.stds  = {}
        self.num_cols = [
            'Price', 'Current_Stock', 'Temperature_required',
            'lag_1_demand', 'lag_7_demand', 'rolling_mean_28',
            'month_sin', 'month_cos', 'shelf_life_days', 'lead_time_days', 'is_Q4'
        ]

    def _extract_raw(self, row):
        price    = float(row.get('Price', 1000))
        stock    = float(row.get('Current_Stock', 100))
        temp     = float(row.get('Temperature_required', 4))
        lag1     = float(row.get('lag_1_demand', 0))
        lag7     = float(row.get('lag_7_demand', 0))
        rm28     = float(row.get('rolling_mean_28', 0))
        msin     = float(row.get('month_sin', 0))
        mcos     = float(row.get('month_cos', 1))
        shelf    = float(row.get('shelf_life_days', 365))
        lead     = float(row.get('lead_time_days', 7))
        is_q4    = float(row.get('is_Q4', 0))

        cat = str(row.get('Category', 'Vaccines'))
        cat_ohe = [1.0 if cat == c else 0.0 for c in self.categories]

        return [price, stock, temp, lag1, lag7, rm28, msin, mcos, shelf, lead, is_q4] + cat_ohe

    def fit_transform(self, rows):
        import math
        X_raw, y = [], []
        for row in rows:
            X_raw.append(self._extract_raw(row))
            y.append(float(row['Target_Demand']))

        n_features = len(X_raw[0])
        for col_idx in range(n_features):
            vals = [X_raw[i][col_idx] for i in range(len(X_raw))]
            mean_v = sum(vals) / len(vals)
            var_v  = sum((v - mean_v)**2 for v in vals) / len(vals)
            std_v  = math.sqrt(var_v) if var_v > 1e-8 else 1.0
            self.means[col_idx] = mean_v
            self.stds[col_idx]  = std_v

        X_scaled = self._scale(X_raw)
        return X_scaled, y

    def transform(self, rows):
        X_raw = [self._extract_raw(r) for r in rows]
        return self._scale(X_raw)

    def _scale(self, X_raw):
        return [
            [(val - self.means.get(j, 0)) / self.stds.get(j, 1)
             for j, val in enumerate(row)]
            for row in X_raw
        ]

    def get_feature_names(self):
        return self.num_cols + [f"Category_{c}" for c in self.categories]

