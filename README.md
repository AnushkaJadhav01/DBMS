# ColdChain OSMS — Order & Shipment Management System

A full-stack admin panel for logistics operations built with **Python Flask** + **MySQL** + **Vanilla JS**.

---

## Project Structure

```
DBMS/
├── app.py              # Flask entry point
├── config.py           # DB credentials (edit this first!)
├── requirements.txt
│
├── models/             # SQL query functions (one file per table)
│   ├── db.py
│   ├── suppliers.py
│   ├── products.py
│   ├── customers.py
│   ├── orders.py
│   ├── shipments.py
│   └── payments.py
│
├── routes/             # Flask Blueprints (REST API endpoints)
│   ├── dashboard.py
│   ├── suppliers.py
│   ├── products.py
│   ├── customers.py
│   ├── orders.py
│   ├── shipments.py
│   └── payments.py
│
├── templates/
│   └── index.html      # Single-Page Application shell
│
└── static/
    ├── css/style.css
    └── js/
        ├── app.js        # Navigation, utilities
        ├── dashboard.js  # Stats + Chart.js
        ├── suppliers.js
        ├── products.js
        ├── customers.js
        ├── orders.js
        ├── shipments.js
        ├── payments.js
        └── receipt.js    # Print invoice popup
```

---

## Setup Instructions

### 1. Prerequisites
- Python 3.9+
- MySQL Server running locally
- Your existing `coldchaindb` database with all tables

### 2. Install Dependencies

Open a terminal in the project folder and run:

```bash
pip install -r requirements.txt
```

### 3. Configure Database

Open `config.py` and verify/update the credentials:

```python
DB_CONFIG = {
    "host":     "localhost",
    "user":     "root",
    "password": "",          # ← your MySQL password
    "database": "coldchaindb",
    "port":     3306,
}
```

### 4. Run the Application

```bash
python app.py
```

Then open your browser at: **http://localhost:5000**

---

## Column Name Reference

The backend assumes the following column names in your existing tables.
If your columns are named differently, update the relevant file in `models/`.

| Table       | Assumed Columns |
|-------------|-----------------|
| `Supplier`  | SupplierID, Name, Contact, Email, Address |
| `Product`   | ProductID, Name, Category, Price, Stock, SupplierID |
| `Customers` | CustomerID, Name, Email, Phone, Address |
| `Orders`    | OrderID, CustomerID, ProductID, Quantity, TotalAmount, OrderDate, Status |
| `Shipment`  | ShipmentID, OrderID, ShipDate, DeliveryDate, Status, Carrier, TrackingNo |
| `Payment`   | PaymentID, OrderID, Amount, Method, PaymentDate, Status |

> If your column names differ, open the matching file in `models/` and update the SQL queries.
> All queries are clearly labelled with comments at the top of each file.

---

## Features

- **Dashboard** — Live stats: Total Orders, Products, Active Shipments, Revenue + Chart.js line chart
- **Full CRUD** — Add / Edit / Delete for all 6 tables via modal forms
- **Search & Filter** — Client-side search on all tables; status dropdown filters for Orders, Shipments, Payments
- **Status Badges** — Color-coded indicators (Pending, Shipped, Delivered, etc.)
- **Print Receipt** — Click 🧾 on any order row to open a styled invoice popup → Print with `Ctrl+P`
- **REST API** — All data served via clean JSON endpoints at `/api/*`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Stats + chart data |
| GET/POST | `/api/suppliers` | List / Create |
| GET/PUT/DELETE | `/api/suppliers/<id>` | Read / Update / Delete |
| GET/POST | `/api/products` | List / Create |
| GET/PUT/DELETE | `/api/products/<id>` | Read / Update / Delete |
| GET/POST | `/api/customers` | List / Create |
| GET/PUT/DELETE | `/api/customers/<id>` | Read / Update / Delete |
| GET/POST | `/api/orders` | List / Create |
| GET/PUT/DELETE | `/api/orders/<id>` | Read / Update / Delete |
| GET | `/api/orders/<id>/receipt` | Full receipt data (joined) |
| GET/POST | `/api/shipments` | List / Create |
| GET/PUT/DELETE | `/api/shipments/<id>` | Read / Update / Delete |
| GET/POST | `/api/payments` | List / Create |
| GET/PUT/DELETE | `/api/payments/<id>` | Read / Update / Delete |

---

## Notes

- The app does **NOT** create or modify any database tables.
- All operations are `SELECT`, `INSERT`, `UPDATE`, `DELETE` only.
- The database `coldchaindb` must exist and be accessible before starting.
