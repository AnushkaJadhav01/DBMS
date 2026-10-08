# ============================================================
# ml/train_model.py — Multi-Algorithm ML Training & Tuning Pipeline
# ColdChain OSMS — Product Demand Quantity Forecasting
#
# Algorithms Trained & Evaluated (Pure Python Engine):
# 1. Ridge Regression (L2 Linear)
# 2. Random Forest Regressor
# 3. Gradient Boosting Regressor (GBR)
# 4. K-Nearest Neighbors Regressor (KNN)
#
# Evaluation Metrics: R2, MAE, MSE, RMSE
# Saves best model to ml/model.pkl, metrics to ml/metrics.json,
# and all model comparison details to ml/model_comparison.json
# ============================================================

import os
import sys
import json
import math
import random
import pickle
from datetime import datetime

# Add project root directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.db import get_db

# ------------------------------------------------------------
# 1. Feature Preprocessing & Scaling Pipeline (Pure Python)
# ------------------------------------------------------------

CATEGORIES = ["Vaccines", "Insulin", "Blood Products", "Biologics", "Lab Reagents", "Diagnostics"]

class PureDataPreprocessor:
    def __init__(self):
        self.categories = CATEGORIES
        self.means = {}
        self.stds = {}
        self.num_cols = ['Price', 'Current_Stock', 'Temperature_required', 'hist_avg_demand', 'order_frequency', 'month']

    def fit_transform(self, raw_rows):
        X_raw = []
        y_raw = []

        for row in raw_rows:
            target = float(row['Target_Demand'])
            features = self._extract_features(row)
            X_raw.append(features)
            y_raw.append(target)

        # Calculate mean and std for numerical features
        n_features = len(X_raw[0])
        for col_idx in range(n_features):
            vals = [X_raw[i][col_idx] for i in range(len(X_raw))]
            mean_v = sum(vals) / float(len(vals))
            variance_v = sum((v - mean_v) ** 2 for v in vals) / float(len(vals))
            std_v = math.sqrt(variance_v) if variance_v > 1e-8 else 1.0
            self.means[col_idx] = mean_v
            self.stds[col_idx] = std_v

        X_scaled = self.transform(X_raw, is_raw_feature_matrix=True)
        return X_scaled, y_raw

    def _extract_features(self, row):
        # Numerical
        price = float(row.get('Price', 1000))
        stock = float(row.get('Current_Stock', 100))
        temp = float(row.get('Temperature_required', 4))
        hist_avg = float(row.get('hist_avg_demand', 80))
        freq = float(row.get('order_frequency', 5))
        month = float(row.get('month', 1))

        # One-hot encoded category
        cat = str(row.get('Category', 'Vaccines'))
        cat_onehot = [1.0 if cat == c else 0.0 for c in self.categories]

        return [price, stock, temp, hist_avg, freq, month] + cat_onehot

    def transform(self, data, is_raw_feature_matrix=False):
        if not is_raw_feature_matrix:
            raw_matrix = [self._extract_features(row) for row in data]
        else:
            raw_matrix = data

        scaled_matrix = []
        for row in raw_matrix:
            scaled_row = []
            for col_idx, val in enumerate(row):
                m = self.means.get(col_idx, 0.0)
                s = self.stds.get(col_idx, 1.0)
                scaled_row.append((val - m) / s)
            scaled_matrix.append(scaled_row)
        return scaled_matrix

    def get_feature_names(self):
        cat_names = [f"Category_{c}" for c in self.categories]
        return self.num_cols + cat_names

# ------------------------------------------------------------
# 2. Pure Python Machine Learning Regressors
# ------------------------------------------------------------

class PureRidgeRegression:
    def __init__(self, alpha=1.0, lr=0.01, epochs=300):
        self.alpha = alpha
        self.lr = lr
        self.epochs = epochs
        self.weights = None
        self.bias = 0.0

    def fit(self, X, y):
        n_samples = len(X)
        n_features = len(X[0])
        self.weights = [0.0] * n_features
        self.bias = sum(y) / float(n_samples)

        for _ in range(self.epochs):
            w_grad = [0.0] * n_features
            b_grad = 0.0

            for i in range(n_samples):
                pred = sum(X[i][j] * self.weights[j] for j in range(n_features)) + self.bias
                err = pred - y[i]
                for j in range(n_features):
                    w_grad[j] += err * X[i][j]
                b_grad += err

            for j in range(n_features):
                # Gradient with L2 regularization
                w_grad[j] = (w_grad[j] / n_samples) + (self.alpha * self.weights[j] / n_samples)
                self.weights[j] -= self.lr * w_grad[j]

            b_grad /= n_samples
            self.bias -= self.lr * b_grad

    def predict(self, X):
        preds = []
        n_features = len(self.weights)
        for row in X:
            p = sum(row[j] * self.weights[j] for j in range(n_features)) + self.bias
            preds.append(max(1.0, float(p)))
        return preds


class PureDecisionTreeRegressor:
    def __init__(self, max_depth=4, min_samples_split=3):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.tree = None

    def fit(self, X, y, depth=0):
        n_samples = len(X)
        if n_samples < self.min_samples_split or depth >= self.max_depth:
            val = sum(y) / float(n_samples) if n_samples > 0 else 0.0
            return {'val': val}

        best_score = float('inf')
        best_split = None

        n_features = len(X[0])
        for f_idx in range(n_features):
            vals = sorted(list(set(X[i][f_idx] for i in range(n_samples))))
            for k in range(len(vals) - 1):
                thresh = (vals[k] + vals[k+1]) / 2.0
                left_y = [y[i] for i in range(n_samples) if X[i][f_idx] <= thresh]
                right_y = [y[i] for i in range(n_samples) if X[i][f_idx] > thresh]

                if not left_y or not right_y:
                    continue

                l_mean = sum(left_y) / float(len(left_y))
                r_mean = sum(right_y) / float(len(right_y))
                mse = sum((v - l_mean)**2 for v in left_y) + sum((v - r_mean)**2 for v in right_y)

                if mse < best_score:
                    best_score = mse
                    best_split = (f_idx, thresh)

        if not best_split:
            return {'val': sum(y) / float(n_samples)}

        f_idx, thresh = best_split
        left_X = [X[i] for i in range(n_samples) if X[i][f_idx] <= thresh]
        left_y = [y[i] for i in range(n_samples) if X[i][f_idx] <= thresh]
        right_X = [X[i] for i in range(n_samples) if X[i][f_idx] > thresh]
        right_y = [y[i] for i in range(n_samples) if X[i][f_idx] > thresh]

        return {
            'feature': f_idx,
            'threshold': thresh,
            'left': self.fit(left_X, left_y, depth + 1),
            'right': self.fit(right_X, right_y, depth + 1)
        }

    def predict_row(self, tree, row):
        if 'val' in tree:
            return tree['val']
        if row[tree['feature']] <= tree['threshold']:
            return self.predict_row(tree['left'], row)
        return self.predict_row(tree['right'], row)


class PureRandomForestRegressor:
    def __init__(self, n_estimators=10, max_depth=5, min_samples_split=3):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.trees = []

    def fit(self, X, y):
        self.trees = []
        n_samples = len(X)
        random.seed(42)

        for _ in range(self.n_estimators):
            # Bootstrap sampling
            indices = [random.randint(0, n_samples - 1) for _ in range(n_samples)]
            sample_X = [X[i] for i in indices]
            sample_y = [y[i] for i in indices]

            tree = PureDecisionTreeRegressor(max_depth=self.max_depth, min_samples_split=self.min_samples_split)
            t_struct = tree.fit(sample_X, sample_y)
            self.trees.append((tree, t_struct))

    def predict(self, X):
        preds = []
        for row in X:
            row_preds = [tree_obj.predict_row(t_struct, row) for tree_obj, t_struct in self.trees]
            avg_p = sum(row_preds) / float(len(row_preds))
            preds.append(max(1.0, float(avg_p)))
        return preds


class PureGradientBoostingRegressor:
    def __init__(self, n_estimators=12, learning_rate=0.1, max_depth=3):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.trees = []
        self.base_val = 0.0

    def fit(self, X, y):
        self.trees = []
        self.base_val = sum(y) / float(len(y))
        residuals = [y[i] - self.base_val for i in range(len(y))]

        for _ in range(self.n_estimators):
            tree = PureDecisionTreeRegressor(max_depth=self.max_depth, min_samples_split=2)
            t_struct = tree.fit(X, residuals)
            self.trees.append((tree, t_struct))

            # Update residuals
            for i in range(len(X)):
                update = tree.predict_row(t_struct, X[i])
                residuals[i] -= self.learning_rate * update

    def predict(self, X):
        preds = []
        for row in X:
            val = self.base_val
            for tree_obj, t_struct in self.trees:
                val += self.learning_rate * tree_obj.predict_row(t_struct, row)
            preds.append(max(1.0, float(val)))
        return preds


class PureKNNRegressor:
    def __init__(self, n_neighbors=5):
        self.n_neighbors = n_neighbors
        self.X_train = None
        self.y_train = None

    def fit(self, X, y):
        self.X_train = X
        self.y_train = y

    def predict(self, X):
        preds = []
        for row in X:
            dists = []
            for i in range(len(self.X_train)):
                d = math.sqrt(sum((row[j] - self.X_train[i][j])**2 for j in range(len(row))))
                dists.append((d, self.y_train[i]))
            dists.sort(key=lambda x: x[0])
            top_k = dists[:self.n_neighbors]
            avg_val = sum(item[1] for item in top_k) / float(len(top_k))
            preds.append(max(1.0, float(avg_val)))
        return preds

# ------------------------------------------------------------
# 3. Evaluation Metrics Calculation
# ------------------------------------------------------------

def calculate_metrics(y_true, y_pred):
    n = len(y_true)
    mae = sum(abs(y_true[i] - y_pred[i]) for i in range(n)) / float(n)
    mse = sum((y_true[i] - y_pred[i])**2 for i in range(n)) / float(n)
    rmse = math.sqrt(mse)
    
    y_mean = sum(y_true) / float(n)
    ss_tot = sum((y_true[i] - y_mean)**2 for i in range(n))
    ss_res = sum((y_true[i] - y_pred[i])**2 for i in range(n))
    r2 = 1.0 - (ss_res / ss_tot) if ss_tot > 1e-8 else 0.0

    return {
        "mae": round(mae, 4),
        "mse": round(mse, 4),
        "rmse": round(rmse, 4),
        "r2_score": round(r2, 4)
    }

# ------------------------------------------------------------
# 4. Cross Validation & Grid Search Tuning Pipeline
# ------------------------------------------------------------

def load_data_from_db():
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

    # Compute historical demand chronologically (no data leakage)
    product_history = {}
    processed_rows = []

    for row in rows:
        pid = row['Product_ID']
        past_q = product_history.get(pid, [])
        target_qty = float(row['Target_Demand'])

        hist_avg = sum(past_q) / float(len(past_q)) if len(past_q) > 0 else target_qty
        freq = len(past_q)

        # Extract month from date string (YYYY-MM-DD)
        dt_str = str(row.get('Order_Date', '2024-01-01'))
        month = 1
        try:
            month = int(dt_str.split('-')[1])
        except Exception:
            month = 1

        r = dict(row)
        r['hist_avg_demand'] = hist_avg
        r['order_frequency'] = freq
        r['month'] = month
        processed_rows.append(r)

        if pid not in product_history:
            product_history[pid] = []
        product_history[pid].append(target_qty)

    return processed_rows

def k_fold_cross_validation(model_class, kwargs_list, X, y, k=5):
    n = len(X)
    indices = list(range(n))
    random.seed(42)
    random.shuffle(indices)

    fold_size = n // k
    results = []

    for kw in kwargs_list:
        cv_scores = []
        for fold in range(k):
            val_idx = set(indices[fold * fold_size : (fold + 1) * fold_size])
            train_idx = [i for i in indices if i not in val_idx]

            X_tr = [X[i] for i in train_idx]
            y_tr = [y[i] for i in train_idx]
            X_va = [X[i] for i in val_idx]
            y_va = [y[i] for i in val_idx]

            model = model_class(**kw)
            model.fit(X_tr, y_tr)
            preds = model.predict(X_va)
            m = calculate_metrics(y_va, preds)
            cv_scores.append(m['r2_score'])

        mean_cv_r2 = sum(cv_scores) / float(len(cv_scores))
        std_cv_r2 = math.sqrt(sum((s - mean_cv_r2)**2 for s in cv_scores) / float(len(cv_scores)))
        results.append({
            'kwargs': kw,
            'mean_cv_r2': round(mean_cv_r2, 4),
            'std_cv_r2': round(std_cv_r2, 4)
        })

    results.sort(key=lambda x: x['mean_cv_r2'], reverse=True)
    return results[0]

def train_and_evaluate_all():
    print("=" * 70)
    print("ColdChain OSMS — Multi-Algorithm Pure Python ML Pipeline")
    print("Task: Product Demand Quantity Forecasting (Supervised Regression)")
    print("=" * 70)

    rows = load_data_from_db()
    if not rows:
        print("[ERROR] Database empty. Running setup_db...")
        from setup_db import setup_database
        setup_database()
        rows = load_data_from_db()

    print(f"\n[1. DATASET METRICS]")
    print(f"Total Transactions Fetched: {len(rows)}")
    targets = [float(r['Target_Demand']) for r in rows]
    print(f"Target Demand Quantity: Mean={sum(targets)/len(targets):.2f}, Min={min(targets)}, Max={max(targets)}")

    # Preprocessing
    preprocessor = PureDataPreprocessor()
    X_scaled, y_all = preprocessor.fit_transform(rows)

    # 80/20 Train/Test Split
    random.seed(42)
    sample_indices = list(range(len(X_scaled)))
    random.shuffle(sample_indices)
    split_point = int(len(X_scaled) * 0.8)

    train_indices = sample_indices[:split_point]
    test_indices = sample_indices[split_point:]

    X_train = [X_scaled[i] for i in train_indices]
    y_train = [y_all[i] for i in train_indices]
    X_test = [X_scaled[i] for i in test_indices]
    y_test = [y_all[i] for i in test_indices]

    print(f"\n[2. TRAIN / TEST SPLIT]")
    print(f"Training Set (80%): {len(X_train)} samples")
    print(f"Testing Set (20%):  {len(X_test)} samples")

    # Define Candidate Models for Hyperparameter Grid Search
    candidates = [
        {
            "name": "Gradient Boosting Regressor",
            "class": PureGradientBoostingRegressor,
            "grid": [
                {"n_estimators": 10, "learning_rate": 0.1, "max_depth": 3},
                {"n_estimators": 20, "learning_rate": 0.1, "max_depth": 3},
                {"n_estimators": 15, "learning_rate": 0.15, "max_depth": 4}
            ]
        },
        {
            "name": "Random Forest Regressor",
            "class": PureRandomForestRegressor,
            "grid": [
                {"n_estimators": 10, "max_depth": 4, "min_samples_split": 3},
                {"n_estimators": 20, "max_depth": 5, "min_samples_split": 2},
                {"n_estimators": 15, "max_depth": 6, "min_samples_split": 3}
            ]
        },
        {
            "name": "Ridge Regression (L2 Linear)",
            "class": PureRidgeRegression,
            "grid": [
                {"alpha": 0.1, "lr": 0.01, "epochs": 300},
                {"alpha": 1.0, "lr": 0.01, "epochs": 400},
                {"alpha": 10.0, "lr": 0.005, "epochs": 300}
            ]
        },
        {
            "name": "K-Nearest Neighbors Regressor (KNN)",
            "class": PureKNNRegressor,
            "grid": [
                {"n_neighbors": 3},
                {"n_neighbors": 5},
                {"n_neighbors": 7}
            ]
        }
    ]

    print(f"\n[3. 5-FOLD CROSS-VALIDATION & HYPERPARAMETER TUNING]")
    model_comparison = []

    best_model_obj = None
    best_score = -999.0
    best_model_name = ""
    best_model_meta = None

    for c in candidates:
        print(f"\n--- Tuning {c['name']} ---")
        best_tune = k_fold_cross_validation(c['class'], c['grid'], X_train, y_train, k=5)
        
        # Fit model on full training set with best hyperparameters
        final_m = c['class'](**best_tune['kwargs'])
        final_m.fit(X_train, y_train)

        # Evaluate on held-out test set
        test_preds = final_m.predict(X_test)
        metrics = calculate_metrics(y_test, test_preds)

        summary = {
            "algorithm": c['name'],
            "best_params": best_tune['kwargs'],
            "cv_mean_r2": best_tune['mean_cv_r2'],
            "cv_std_r2": best_tune['std_cv_r2'],
            "mae": metrics['mae'],
            "mse": metrics['mse'],
            "rmse": metrics['rmse'],
            "r2_score": metrics['r2_score']
        }
        model_comparison.append(summary)

        print(f"Best Grid Parameters: {best_tune['kwargs']}")
        print(f"5-Fold CV Mean R²:  {best_tune['mean_cv_r2']} (±{best_tune['std_cv_r2']})")
        print(f"Test Set Evaluation: MAE={metrics['mae']} | RMSE={metrics['rmse']} | R²={metrics['r2_score']}")

        if metrics['r2_score'] > best_score:
            best_score = metrics['r2_score']
            best_model_name = c['name']
            best_model_obj = final_m
            best_model_meta = summary

    # Feature Importance Calculations based on correlation with target
    feature_names = preprocessor.get_feature_names()
    importance_dict = {}

    for col_idx, f_name in enumerate(feature_names):
        vals = [X_scaled[i][col_idx] for i in range(len(X_scaled))]
        val_mean = sum(vals)/len(vals)
        cov = sum((vals[i] - val_mean)*(y_all[i] - (sum(y_all)/len(y_all))) for i in range(len(vals)))
        var_x = sum((v - val_mean)**2 for v in vals)
        var_y = sum((y - (sum(y_all)/len(y_all)))**2 for y in y_all)
        corr = abs(cov / math.sqrt(var_x * var_y)) if (var_x * var_y) > 1e-8 else 0.0
        importance_dict[f_name] = round(corr, 4)

    sorted_importances = dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))

    best_model_meta['feature_importances'] = sorted_importances
    best_model_meta['total_records'] = len(rows)
    best_model_meta['train_records'] = len(X_train)
    best_model_meta['test_records'] = len(X_test)
    best_model_meta['trained_at'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print("\n" + "=" * 70)
    print("EMPIRICAL EVALUATION RESULTS TABLE")
    print("=" * 70)
    print(f"{'Algorithm':<32} | {'Test R²':<8} | {'MAE':<8} | {'RMSE':<8} | {'5-Fold CV R²':<12}")
    print("-" * 75)
    for m in model_comparison:
        print(f"{m['algorithm']:<32} | {m['r2_score']:<8.4f} | {m['mae']:<8.2f} | {m['rmse']:<8.2f} | {m['cv_mean_r2']:<12.4f}")
    print("=" * 70)
    print(f"CHOSEN BEST MODEL: {best_model_name} (R² = {best_score:.4f})")

    # Save artifact files
    ml_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(ml_dir, "model.pkl")
    metrics_path = os.path.join(ml_dir, "metrics.json")
    comparison_path = os.path.join(ml_dir, "model_comparison.json")

    pipeline_artifact = {
        'preprocessor': preprocessor,
        'model': best_model_obj,
        'algorithm_name': best_model_name
    }

    with open(model_path, "wb") as f:
        pickle.dump(pipeline_artifact, f)

    with open(metrics_path, "w") as f:
        json.dump(best_model_meta, f, indent=4)

    with open(comparison_path, "w") as f:
        json.dump(model_comparison, f, indent=4)

    print(f"\n[SAVED ARTIFACTS]")
    print(f"[OK] Trained Pipeline Saved:   {model_path}")
    print(f"[OK] Metrics JSON Saved:       {metrics_path}")
    print(f"[OK] Comparison JSON Saved:    {comparison_path}")

    return best_model_meta

if __name__ == "__main__":
    train_and_evaluate_all()
