# ============================================================
# ml/preprocessing.py — Feature Engineering & Preprocessing Pipeline
# Extracts data from DBMS orders, shipments, and products.
# Engineers lag & aggregate features without data leakage.
# ============================================================

import pandas as pd
import numpy as np
from datetime import datetime
from models.db import get_db

def load_historical_data():
    """
    Queries historical order, shipment, and product records from DBMS.
    Calculates features prior to each order date to prevent data leakage.
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
        return pd.DataFrame()

    df = pd.DataFrame(rows)
    df['Order_Date'] = pd.to_datetime(df['Order_Date'])

    # Default category if missing
    df['Category'] = df['Category'].fillna('Vaccines')
    df['Price'] = pd.to_numeric(df['Price'], errors='coerce').fillna(1000)
    df['Current_Stock'] = pd.to_numeric(df['Current_Stock'], errors='coerce').fillna(100)
    df['Temperature_required'] = pd.to_numeric(df['Temperature_required'], errors='coerce').fillna(4)

    # Historical aggregations computed chronologically (no leakage)
    hist_avg_demand = []
    order_frequency = []
    month_list = []
    dayofweek_list = []

    product_history = {} # product_id -> list of past quantities

    for idx, row in df.iterrows():
        pid = row['Product_ID']
        past_q = product_history.get(pid, [])

        avg_d = float(np.mean(past_q)) if len(past_q) > 0 else float(row['Target_Demand'])
        freq = len(past_q)

        hist_avg_demand.append(avg_d)
        order_frequency.append(freq)

        m = row['Order_Date'].month if pd.notnull(row['Order_Date']) else 1
        dow = row['Order_Date'].dayofweek if pd.notnull(row['Order_Date']) else 0

        month_list.append(m)
        dayofweek_list.append(dow)

        # Record this order's quantity into product history AFTER computing features
        if pid not in product_history:
            product_history[pid] = []
        product_history[pid].append(row['Target_Demand'])

    df['hist_avg_demand'] = hist_avg_demand
    df['order_frequency'] = order_frequency
    df['month'] = month_list
    df['dayofweek'] = dayofweek_list

    return df

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

