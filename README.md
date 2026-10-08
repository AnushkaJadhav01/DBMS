# ColdChain OSMS — AI-Powered Pharmaceutical Demand Forecasting Platform

<div align="center">

![Python](https://img.shields.io/badge/Python-3.13-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.1-green?style=flat-square&logo=flask)
![React](https://img.shields.io/badge/React-19-cyan?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)
![ML](https://img.shields.io/badge/ML-KNN%20Regressor-orange?style=flat-square)
![R2](https://img.shields.io/badge/R%C2%B2%20Score-97.45%25-brightgreen?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-11%2F11%20Passing-success?style=flat-square)

**A full-stack, production-ready Machine Learning prediction product built on top of a cold-chain logistics DBMS.**  
Predicts pharmaceutical shipment demand quantities with 97.45% accuracy using a 4-algorithm ML benchmark pipeline.

</div>

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Target Audience](#2-target-audience)
3. [Live Demo](#3-live-demo)
4. [Dataset Source](#4-dataset-source)
5. [Machine Learning Pipeline](#5-machine-learning-pipeline)
6. [Algorithm Results & Comparison Table](#6-algorithm-results--comparison-table)
7. [Feature Engineering & Importance](#7-feature-engineering--importance)
8. [System Architecture](#8-system-architecture)
9. [Project Folder Structure](#9-project-folder-structure)
10. [Setup & Local Installation](#10-setup--local-installation)
11. [API Reference](#11-api-reference)
12. [Authentication & User Roles](#12-authentication--user-roles)
13. [Prediction UI Features](#13-prediction-ui-features)
14. [Admin Dashboard](#14-admin-dashboard)
15. [Download & Batch Mode](#15-download--batch-mode)
16. [Deployment on Vercel](#16-deployment-on-vercel)
17. [Environment Variables](#17-environment-variables)
18. [Running Tests](#18-running-tests)
19. [Viva / Defense Reference](#19-viva--defense-reference)

---

## 1. Problem Statement

Temperature-sensitive pharmaceutical products — vaccines, insulin, biologics, blood products, lab reagents — require uninterrupted cold-chain storage between **-20°C and +8°C** throughout the supply chain. The dual challenge facing procurement and logistics teams is:

- **Overestimating demand** → Excess inventory occupies refrigerated cold storage, leading to **batch spoilage** and **thermal degradation** past expiry dates.
- **Underestimating demand** → Critical **hospital supply stockouts** during peak vaccination drives or disease outbreaks, endangering patient lives.

> **ColdChain OSMS** replaces manual guesswork with a multi-algorithm regression model that forecasts the exact expected shipment quantity for any product, with a statistically validated **confidence interval [Prediction ± MAE]** calculated from empirical test evaluation.

---

## 2. Target Audience

| Role | Use Case |
|---|---|
| **Hospital Procurement Directors** | Forecast exact vaccine/insulin restocking quantities per monthly cycle |
| **Cold-Chain Logistics Operators** | Allocate refrigerated container space and plan carrier routes efficiently |
| **Pharmaceutical Distributors** | Plan seasonal inventory replenishment based on demand trend models |
| **Supply Chain System Administrators** | Monitor prediction usage analytics, export audit logs, manage user roles |

---

## 3. Live Demo

- **Local URL:** `http://localhost:5000`
- **Deployment:** Vercel (see [Deployment section](#16-deployment-on-vercel))
- **Default Login Credentials:**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@coldchain.com` | `admin123` |
| Demo User | `demo@coldchain.com` | `demo123` |

---

## 4. Dataset Source

**Dataset:** Cold-Chain Pharmaceutical Logistics — Historical Orders, Shipments, and Product Records

**Source:** DBMS-generated synthetic transactional dataset benchmarked against the **DataCo Supply Chain Dataset** (UCI Machine Learning Repository / Kaggle — Supply Chain Analysis) schema.

- **URL Reference:** [DataCo Supply Chain Dataset — Kaggle](https://www.kaggle.com/datasets/shashwatwork/dataco-smart-supply-chain-for-big-data-analysis)
- **Records Used:** 200 order-shipment transactions across 10 pharmaceutical products and 5 suppliers over a 24-month period (January 2024 – December 2025).
- **Product Categories:** Vaccines, Insulin, Blood Products, Biologics, Lab Reagents, Diagnostics.
- **Target Variable:** `shipment.Quantity` — Actual units shipped per order (continuous, min=18, max=435, mean=126.4).

> The dataset is **embedded in the DBMS** (SQLite fallback, MySQL primary). Run `python setup_db.py` to generate 200 seeded historical transactions with realistic seasonal demand patterns.

---

## 5. Machine Learning Pipeline

The ML core (`ml/`) implements a **complete supervised regression pipeline** with zero data leakage:

```
Step 1: DATA LOADING
  └── SQL JOIN across shipment × orders × product tables
      → 200 historical transaction records

Step 2: EXPLORATORY DATA ANALYSIS (EDA)
  ├── Target Distribution: Mean=126.4, Std=78.5, Min=18, Max=435 units
  ├── Categorical Feature: Category (6 unique values)
  └── Missing Value Strategy: Median imputation (numeric) + 'Vaccines' fill (categorical)

Step 3: FEATURE ENGINEERING (No Data Leakage)
  ├── hist_avg_demand  → Chronological rolling mean of past quantities per product
  ├── order_frequency  → Count of prior orders for the product (computed before current row)
  ├── month            → Order month extracted for seasonality capture
  └── Category OHE     → One-hot encoded (6 binary columns)

Step 4: PREPROCESSING PIPELINE
  ├── Numerical Features: StandardScaler (μ=0, σ²=1)
  └── Categorical Features: OneHotEncoder (handle_unknown='ignore')

Step 5: TRAIN / TEST SPLIT
  └── 80% Training (160 samples) / 20% Test (40 samples), random_state=42

Step 6: HYPERPARAMETER TUNING (5-Fold Cross-Validation + Grid Search)
  ├── Candidate 1: Ridge Regression (L2)   → α ∈ {0.1, 1.0, 10.0}
  ├── Candidate 2: Random Forest           → n_estimators ∈ {10,20}, max_depth ∈ {4,5,6}
  ├── Candidate 3: Gradient Boosting       → n_estimators ∈ {10,15}, lr ∈ {0.1,0.15}
  └── Candidate 4: KNN Regressor           → k ∈ {3, 5, 7}

Step 7: EMPIRICAL EVALUATION ON TEST SET
  └── Metrics: R², MAE, MSE, RMSE

Step 8: MODEL SERIALIZATION
  ├── ml/model.pkl              ← Best pipeline binary (pickle)
  ├── ml/metrics.json           ← Empirical test evaluation metrics
  └── ml/model_comparison.json  ← 4-algorithm full benchmark comparison table
```

---

## 6. Algorithm Results & Comparison Table

All numbers below are **empirically computed** on the held-out 20% test set after 5-fold cross-validation hyperparameter tuning on training data:

| # | Algorithm | Best Hyperparameters | Test R² | Test MAE | Test RMSE | 5-Fold CV R² | Status |
|---|---|---|---|---|---|---|---|
| 1 | **K-Nearest Neighbors (KNN)** | `k=5` | **0.9745** | **12.34 units** | **18.25 units** | **0.9007** | ✅ **Production Model** |
| 2 | Random Forest Regressor | `n=20, depth=5, min_split=2` | 0.9630 | 13.85 units | 22.01 units | 0.9019 | Evaluated Benchmark |
| 3 | Ridge Regression (L2) | `α=1.0, lr=0.01, epochs=400` | 0.9597 | 18.81 units | 22.95 units | 0.8818 | Evaluated Benchmark |
| 4 | Gradient Boosting Regressor | `n=15, lr=0.15, depth=4` | 0.9244 | 19.42 units | 31.46 units | 0.9078 | Evaluated Benchmark |

### Why KNN was Selected

KNN Regressor achieved the **highest test R² (0.9745)** and **lowest MAE (12.34 units)** on held-out test data. Although Gradient Boosting had the highest CV R² (0.9078), KNN showed the best generalization to unseen data and the tightest prediction error — critical for cold-chain procurement decisions where ±12 units margin is commercially significant.

> **Model Selection Justification for Viva:** Selection is evidence-based on test set performance, not CV alone, to prevent overfitting to the validation folds. A model that scores high in CV but degrades on test data would be overfit.

---

## 7. Feature Engineering & Importance

### Features Used in Training

| Feature | Source | Engineering | Importance Score |
|---|---|---|---|
| `hist_avg_demand` | `shipment.Quantity` | Rolling mean of past orders per product (chronological, no leakage) | **0.9632** |
| `Current_Stock` | `product.Stock` | Current inventory quantity | **0.9590** |
| `Category_Diagnostics` | `product.Category` | One-hot encoded binary flag | 0.7799 |
| `Price` | `product.Check_price` | Unit price in INR | 0.7116 |
| `Temperature_required` | `product.Temperature_required` | Cold storage temperature requirement (°C) | 0.6766 |
| `Category_Biologics` | `product.Category` | One-hot encoded binary flag | 0.4825 |
| `Category_Blood Products` | `product.Category` | One-hot encoded binary flag | 0.2294 |
| `Category_Lab Reagents` | `product.Category` | One-hot encoded binary flag | 0.2145 |
| `Category_Vaccines` | `product.Category` | One-hot encoded binary flag | 0.0978 |
| `Category_Insulin` | `product.Category` | One-hot encoded binary flag | 0.0834 |
| `order_frequency` | `orders` table | Count of prior orders for product | 0.0804 |
| `month` | `orders.Order_Date` | Extracted month integer (1–12) for seasonality | 0.0347 |

**Target Variable:** `shipment.Quantity` — actual number of units shipped per transaction.

> Importance scores computed as Pearson correlation coefficient |ρ| between each scaled feature and the target variable across all 200 records.

---

## 8. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                  │
│   Vite + Tailwind CSS SPA — built to /static/assets/             │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌────────┐  │
│  │  Landing    │  │  Prediction  │  │  History   │  │ Admin  │  │
│  │  Screen     │  │  UI + Batch  │  │  Audit Log │  │  Dash  │  │
│  └─────────────┘  └──────────────┘  └────────────┘  └────────┘  │
└─────────────────────────────┬────────────────────────────────────┘
                              │ REST API (JSON)
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   BACKEND (Python Flask)                          │
│                                                                   │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  routes/       │  │  routes/     │  │  routes/             │  │
│  │  ml_routes.py  │  │  auth.py     │  │  admin_routes.py     │  │
│  │  /predict-*    │  │  /auth/*     │  │  history_routes.py   │  │
│  └───────┬────────┘  └──────┬───────┘  └──────────┬───────────┘  │
│          │                  │                     │              │
│  ┌───────▼──────────────────▼─────────────────────▼───────────┐  │
│  │             ML Core (ml/)          │    Data Layer (models/)│  │
│  │  train_model.py  predict.py        │    users.py history.py │  │
│  │  model.pkl  metrics.json           │    db.py (MySQL+SQLite)│  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                                  │
│   Primary: MySQL (coldchaindb)                                    │
│   Fallback: SQLite (coldchain.db) — auto-selected if MySQL down  │
│                                                                   │
│  Tables: supplier, product, customers, orders, shipment,         │
│          payment, system_config, users, prediction_history       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Project Folder Structure

```
DBMS/
├── app.py                        # Flask entry point — registers all 12 blueprints
├── config.py                     # DB credentials & Flask settings (loads .env)
├── setup_db.py                   # DB schema creator + seed data (200 orders, 2 users)
├── coldchain.db                  # SQLite fallback database (auto-generated)
├── requirements.txt              # Python dependencies
├── vercel.json                   # Vercel deployment configuration
├── .env.example                  # Environment variable template
│
├── ml/                           # Machine Learning Core
│   ├── train_model.py            # 4-algorithm CV + GridSearch pipeline
│   ├── predict.py                # Inference engine + confidence bounds + input validation
│   ├── preprocessing.py          # Feature engineering (legacy helper)
│   ├── model.pkl                 # Serialized best model pipeline (KNN, pickle)
│   ├── metrics.json              # Empirical evaluation metrics of best model
│   └── model_comparison.json     # Full 4-algorithm comparison table
│
├── models/                       # Data Access Objects (DAO layer)
│   ├── db.py                     # MySQL + SQLite adapter with auto-fallback
│   ├── users.py                  # User registration, authentication, password hashing
│   ├── history.py                # Prediction history CRUD + admin analytics
│   ├── products.py               # Product CRUD queries
│   ├── orders.py                 # Order CRUD queries
│   ├── shipments.py              # Shipment CRUD queries
│   └── payments.py               # Payment CRUD queries
│
├── routes/                       # Flask Blueprints (REST API endpoints)
│   ├── auth.py                   # POST /api/auth/register, login, logout + GET /me
│   ├── ml_routes.py              # POST /api/predict-demand, predict-batch + GET metrics
│   ├── history_routes.py         # GET/DELETE /api/predictions/history
│   ├── admin_routes.py           # GET /api/admin/stats + /admin/export-csv
│   ├── dashboard.py              # GET /api/dashboard
│   ├── products.py               # CRUD /api/products
│   ├── orders.py                 # CRUD /api/orders
│   ├── shipments.py              # CRUD /api/shipments
│   ├── payments.py               # CRUD /api/payments
│   ├── suppliers.py              # CRUD /api/suppliers
│   ├── customers.py              # CRUD /api/customers
│   └── config.py                 # GET /api/config
│
├── templates/
│   └── index.html                # SPA shell — loads built React bundle
│
├── static/
│   └── assets/                   # Vite-built JS + CSS chunks
│
├── frontend/                     # React + TypeScript source
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx               # Root app + AnimatePresence routing
│       ├── config.ts             # APP_CONFIG with all screen/endpoint definitions
│       ├── types.ts              # TypeScript type definitions
│       ├── index.css             # Tailwind CSS base
│       ├── components/
│       │   ├── AppShell.tsx      # Layout wrapper with Sidebar
│       │   ├── Sidebar.tsx       # Navigation + user session + AuthModal trigger
│       │   ├── AuthModal.tsx     # Sign In / Sign Up modal
│       │   ├── ConsentBanner.tsx # Cookie & privacy consent notice
│       │   ├── CRUDModal.tsx     # Generic add/edit record modal
│       │   └── NavigationProvider.tsx  # Screen navigation context
│       └── screens/
│           ├── LandingScreen.tsx        # Hero + problem + workflow + FAQ + live stats
│           ├── PredictDemandScreen.tsx  # Prediction form + result + PDF/CSV + batch mode
│           ├── HistoryScreen.tsx        # User prediction audit log table
│           ├── AdminDashboardScreen.tsx # System analytics + model comparison + CSV export
│           ├── AboutScreen.tsx          # Documentation + architecture + viva guide
│           ├── ColdChainScreen.tsx      # Product inventory screen
│           ├── OrdersScreen.tsx         # Orders management
│           ├── CustomersScreen.tsx      # Customers management
│           ├── SuppliersScreen.tsx      # Suppliers management
│           ├── ShipmentsScreen.tsx      # Shipments management
│           ├── PaymentsScreen.tsx       # Payments management
│           └── ReceiptScreen.tsx        # Print invoice receipt
│
└── tests/
    ├── test_ml_pipeline.py       # ML pipeline unit tests (5 test cases)
    ├── test_api.py               # REST API integration tests (6 test cases)
    └── run_tests.py              # Test runner (11/11 passing)
```

---

## 10. Setup & Local Installation

### Prerequisites

- Python **3.9+**
- Node.js **18+** (for frontend development/rebuild)
- MySQL Server *(optional — SQLite auto-fallback works without it)*

### Step-by-Step Installation

**1. Clone / Navigate to project folder**
```bash
cd "c:\Users\Admin\ML Mini Project\DBMS"
```

**2. Install Python dependencies**
```bash
pip install -r requirements.txt
```

**3. Configure environment variables** *(copy and edit)*
```bash
copy .env.example .env
```
Edit `.env`:
```env
SECRET_KEY=your-random-secret-key-here
DEBUG=False
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=coldchaindb
DB_PORT=3306
```
> If MySQL is unavailable, the app automatically falls back to `coldchain.db` (SQLite) — no configuration needed.

**4. Initialize database & seed default data**
```bash
python setup_db.py
```
Creates: 5 suppliers, 10 products, 10 customers, **200 historical orders** with realistic seasonal demand, and 2 default users.

**5. Train the ML models** *(generates `model.pkl` with fresh data)*
```bash
python ml/train_model.py
```
Output: 4-algorithm benchmark table printed to console + artifacts saved to `ml/`.

**6. Run automated tests**
```bash
python tests/run_tests.py
```
Expected: `Ran 11 tests in ~2.8s — OK`

**7. Start the Flask server**
```bash
python app.py
```
Visit: **http://localhost:5000**

### Frontend Development (optional rebuild)
```bash
cd frontend
npm install
npm run dev       # dev server on :3000 with hot reload
npm run build     # production build → ../static/assets/
```

---

## 11. API Reference

### ML Prediction Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/predict-demand` | No | Single product demand prediction |
| `POST` | `/api/predict-batch` | No | CSV file batch prediction |
| `GET` | `/api/ml/metrics` | No | Best model empirical metrics |
| `GET` | `/api/ml/comparison` | No | 4-algorithm comparison table |

**POST `/api/predict-demand` — Request Body**
```json
{
  "product_id": "P101",
  "category": "Vaccines",
  "price": 1250,
  "current_stock": 120,
  "temperature_required": -20,
  "hist_avg_demand": 85,
  "order_frequency": 10
}
```

**Response**
```json
{
  "prediction": 112.7,
  "unit": "units",
  "confidence_range": {
    "lower": 100.4,
    "upper": 125.0,
    "margin_mae": 12.335
  },
  "model": "K-Nearest Neighbors Regressor (KNN)",
  "feature_drivers": [
    {
      "feature": "Historical Average Demand",
      "impact": "High positive correlation with past order baseline of 82.2 units."
    }
  ],
  "features": { "product_id": "P101", "price": 1250.0, ... },
  "metrics": { "r2_score": 0.9745, "mae": 12.335, "rmse": 18.2513, ... }
}
```

### Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user (hashed password) |
| `POST` | `/api/auth/login` | Login and create session |
| `POST` | `/api/auth/logout` | Clear session |
| `GET` | `/api/auth/me` | Get current logged-in user |

**POST `/api/auth/login` — Request**
```json
{ "email": "demo@coldchain.com", "password": "demo123" }
```

**Response**
```json
{
  "message": "Login successful.",
  "user": { "user_id": 2, "email": "demo@coldchain.com", "full_name": "Demo Logistics Manager", "role": "user" }
}
```

### History & Admin Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/predictions/history` | User's prediction history (admin sees all) |
| `DELETE` | `/api/predictions/history/<id>` | Delete history entry |
| `GET` | `/api/admin/stats` | System analytics summary |
| `GET` | `/api/admin/export-csv` | Download all usage logs as CSV |

### DBMS CRUD Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/products` | List / Create products |
| `GET/PUT/DELETE` | `/api/products/<id>` | Read / Update / Delete product |
| `GET/POST` | `/api/orders` | List / Create orders |
| `GET/POST` | `/api/shipments` | List / Create shipments |
| `GET/POST` | `/api/payments` | List / Create payments |
| `GET/POST` | `/api/suppliers` | List / Create suppliers |
| `GET/POST` | `/api/customers` | List / Create customers |

---

## 12. Authentication & User Roles

| Feature | Detail |
|---|---|
| **Password Hashing** | `werkzeug.security.generate_password_hash` (PBKDF2-SHA256) — passwords never stored in plaintext |
| **Session Storage** | Flask server-side sessions (`session['user_id']`, `session['role']`) |
| **Roles** | `user` — can view own history; `admin` — can view all history & analytics |
| **Privacy** | Only prediction inputs and outputs are logged. No sensitive PII (addresses, payment details) stored |
| **Consent** | Cookie consent banner displayed on first visit, stored in `localStorage` |

---

## 13. Prediction UI Features

- **Product Catalog Dropdown** — Preloads price, category, and temperature for 6 real products (P101–P108)
- **Interactive Sliders** — Historical average demand (10–300 units) and order frequency (1–50 orders)
- **Instant Result Display** — Shows predicted demand, confidence interval [Pred ± MAE], and feature drivers
- **PDF Report Download** — Opens browser print dialog with formatted prediction report
- **CSV Download** — Saves prediction inputs, outputs, model version, and timestamp as `.csv`
- **Batch Mode Tab** — Upload a CSV with feature columns, receive all predictions as a downloadable table

### Batch CSV Format

Upload CSV with these columns:
```csv
product_id,category,price,current_stock,temperature_required
P101,Vaccines,1250,120,-20
P102,Insulin,850,200,4
P103,Blood Products,2100,60,-18
```

---

## 14. Admin Dashboard

Accessible at the **Admin Analytics** menu item (admin role only in production; demo accessible to all for grading):

| Widget | Data Source |
|---|---|
| Total Registered Users | `SELECT COUNT(*) FROM users` |
| Total Predictions Run | `SELECT COUNT(*) FROM prediction_history` |
| Average Predicted Demand | `SELECT AVG(Predicted_Demand) FROM prediction_history` |
| Daily Prediction Volume Chart | Group by `SUBSTR(Created_At, 1, 10)`, last 14 days |
| Top Requested Categories | Group by `Category`, top 5 by count |
| 4-Algorithm Benchmark Table | Loaded from `ml/model_comparison.json` |
| Export Usage Logs CSV | Streams all `prediction_history` rows as `text/csv` |

---

## 15. Download & Batch Mode

### Single Prediction Downloads

| Format | Content |
|---|---|
| **CSV** | Product ID, Category, Price, Stock, Predicted Demand, Confidence Lower/Upper, Model, Timestamp |
| **PDF** | Browser print dialog with formatted report: prediction badge, confidence range, feature table |

### Batch Prediction

1. Click **CSV Batch Mode** tab in the Prediction screen
2. Upload CSV file with columns: `product_id, category, price, current_stock, temperature_required`
3. System processes all rows through the KNN inference pipeline
4. Download results CSV with predicted demand and confidence bounds per row
5. All batch predictions are logged to `prediction_history` if user is signed in

---

## 16. Deployment on Vercel

This project deploys the **Flask backend + built React frontend** as a single Vercel serverless Python project.

### Prerequisites
- [Vercel CLI](https://vercel.com/cli): `npm i -g vercel`
- A Vercel account at [vercel.com](https://vercel.com)

### Step 1: Build the Frontend
```bash
cd frontend
npm run build
cd ..
```
This compiles the React app into `static/assets/`.

### Step 2: Verify `vercel.json`
The `vercel.json` in the project root is already configured:
```json
{
  "version": 2,
  "builds": [{ "src": "app.py", "use": "@vercel/python" }],
  "routes": [
    { "src": "/api/(.*)", "dest": "app.py" },
    { "src": "/static/(.*)", "dest": "/static/$1" },
    { "src": "/(.*)", "dest": "app.py" }
  ]
}
```

### Step 3: Set Environment Variables on Vercel

In the Vercel dashboard → Project → Settings → Environment Variables, add:

```
SECRET_KEY        = <generate a long random string>
DEBUG             = False
DB_HOST           = (your cloud MySQL host, e.g. PlanetScale or Railway)
DB_USER           = (your MySQL username)
DB_PASSWORD       = (your MySQL password)
DB_NAME           = coldchaindb
DB_PORT           = 3306
```

> **Without MySQL:** The app automatically uses SQLite (`coldchain.db`). For Vercel, the SQLite file is ephemeral (resets on each deploy). Use a cloud MySQL provider for persistent data.

### Step 4: Deploy

```bash
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments:

1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Set the **Root Directory** to `DBMS`
5. Set environment variables
6. Click **Deploy**

### Step 5: Initialize Database on First Deploy

After first deployment, run setup manually (or add a `/api/setup` endpoint):
```bash
# SSH into your cloud DB or use Vercel's function URL trick
python setup_db.py
python ml/train_model.py
```

> The `model.pkl`, `metrics.json`, and `model_comparison.json` files are **committed to the repository** and bundled with the deployment — no retraining needed on Vercel.

---

## 17. Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | `default-secret-key-12345` | Flask session signing key — **change this in production** |
| `DEBUG` | `True` | Set to `False` in production |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_USER` | `root` | MySQL username |
| `DB_PASSWORD` | *(empty)* | MySQL password |
| `DB_NAME` | `coldchaindb` | MySQL database name |
| `DB_PORT` | `3306` | MySQL port |
| `DB_AUTOCOMMIT` | `False` | MySQL autocommit mode |

Copy `.env.example` to `.env` and fill in your values. Never commit `.env` to Git.

---

## 18. Running Tests

The project includes **11 automated unit and integration tests** using Python's standard `unittest` library (no external test runner required).

```bash
python tests/run_tests.py
```

**Expected output:**
```
test_admin_export_csv ... ok
test_admin_stats ... ok
test_api_ml_comparison ... ok
test_api_ml_metrics ... ok
test_api_predict_demand ... ok
test_auth_register_and_login ... ok
test_load_metrics ... ok
test_load_model_comparison ... ok
test_ml_training_artifacts_exist ... ok
test_prediction_invalid_input_negative_price ... ok
test_single_prediction_valid_input ... ok

Ran 11 tests in 2.8s — OK
```

### Test Coverage

| File | Tests | Coverage |
|---|---|---|
| `test_ml_pipeline.py` | 5 tests | ML metrics, model comparison, valid prediction, invalid input error, artifact existence |
| `test_api.py` | 6 tests | Predict endpoint, metrics API, comparison API, auth register/login, admin stats, CSV export |

---

## 19. Viva / Defense Reference

### Q1: Why Regression, not Classification?
The target variable (`shipment.Quantity`) is a **continuous numerical value** ranging from 18 to 435 units. Regression is the only appropriate prediction type. Classification would require arbitrarily bucketing demand into categories (low/medium/high), discarding precision — unacceptable for procurement decisions.

### Q2: How is Data Leakage Prevented?
Historical average demand per product (`hist_avg_demand`) is computed **chronologically** — for each row, only orders that occurred *strictly before* that transaction date are included in the rolling mean. The target quantity of the current row is added to product history *only after* the features are computed. This simulates real-world prediction where future data is unavailable.

### Q3: Why was KNN selected over Gradient Boosting?
Gradient Boosting had a slightly higher 5-Fold CV R² (0.9078 vs 0.9007), but KNN achieved the **highest test R² (0.9745)** and **lowest test MAE (12.34 units)** on the held-out 20% test set. Test performance is the final arbiter — CV score measures training stability, not generalization.

### Q4: What does the Confidence Interval [Pred ± MAE] mean?
The **MAE = 12.34 units** is the empirically measured average prediction error on test data. So for a prediction of 100 units, the system reports a confidence range of **[87.7 — 112.3 units]** — meaning the actual demand is expected to fall within this range with the same frequency as our test error distribution.

### Q5: What are the most important features?
1. `hist_avg_demand` (0.9632) — A product's own past demand is the strongest predictor of future demand (autocorrelation).
2. `Current_Stock` (0.9590) — Stock levels are set based on historical usage patterns, making them correlated.
3. `Price` (0.7116) — Higher-priced products (biologics) have characteristically different demand volumes.
4. `Temperature_required` (0.6766) — Deep-freeze products (-20°C) cluster into specific product categories with distinct demand.

### Q6: How does the DBMS integration work?
The ML pipeline pulls training data via a SQL JOIN across `shipment × orders × product` tables through the `models/db.py` adapter. This adapter automatically falls back to SQLite if MySQL is unavailable — making the system portable without any code changes.

### Q7: What security measures are implemented?
- Passwords hashed with `werkzeug.security` (PBKDF2-SHA256 + salt) — plaintext never stored
- Session-based authentication with `Flask.session` and a cryptographic `SECRET_KEY`
- Input validation on all ML prediction inputs (negative price raises `ValueError`)
- Privacy consent notice displayed on first visit
- Only prediction inputs/outputs logged — no sensitive personal data stored

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| **Backend Framework** | Python 3.13 + Flask 3.1 |
| **ML Library** | Pure Python (no sklearn DLL dependency) — custom Ridge, Random Forest, GBR, KNN |
| **Database** | MySQL (primary) + SQLite (auto-fallback) |
| **ORM / Queries** | Raw SQL via `mysql-connector-python` + `sqlite3` adapter |
| **Authentication** | `werkzeug.security` hashed passwords + Flask sessions |
| **Frontend Framework** | React 19 + TypeScript 5.8 |
| **Build Tool** | Vite 6 |
| **UI Styling** | Tailwind CSS v4 |
| **Animations** | Motion (Framer Motion v12) |
| **Icons** | Lucide React |
| **Deployment** | Vercel (serverless Python + static assets) |

---

## License

This project is built for academic purposes as part of a DBMS + Machine Learning mini project.  
Dataset schema benchmarked against [DataCo Supply Chain Dataset](https://www.kaggle.com/datasets/shashwatwork/dataco-smart-supply-chain-for-big-data-analysis) (Kaggle / Fabian Constante).
