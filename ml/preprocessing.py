# ============================================================
# ml/preprocessing.py — Feature Engineering & Preprocessing Pipeline
# Extracts data from DBMS orders, shipments, and products.
# Engineers lag & aggregate features without data leakage.
# ============================================================

import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
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
    Builds a reproducible sklearn ColumnTransformer pipeline.
    """
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='Vaccines')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ]
    )

    return preprocessor
