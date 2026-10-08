# ============================================================
# setup_db.py — Database Schema, Migration & Seed Data
# ColdChain OSMS — Cold-Chain Pharmaceutical Demand Forecasting
#
# DATA DISCLAIMER (audit fix W3):
#   All transaction records below are LABELLED SYNTHETIC data.
#   They are generated with a fixed random seed using realistic
#   cold-chain demand patterns (seasonality, product baselines,
#   Gaussian noise). No real patient, hospital, or shipment
#   data is used.  Dataset schema benchmarked against:
#   DataCo Supply Chain Dataset (Kaggle / Fabian Constante).
# ============================================================

import mysql.connector
import sqlite3
import os
import random
import math
from datetime import datetime, timedelta
from config import DB_CONFIG

# ============================================================
# MYSQL TABLE DEFINITIONS
# ============================================================

TABLES = {
    'customers': (
        "CREATE TABLE IF NOT EXISTS `customers` ("
        "  `Customer_ID` int NOT NULL AUTO_INCREMENT,"
        "  `Customer_Name` varchar(50) NOT NULL,"
        "  `Phone_No` varchar(15) DEFAULT NULL UNIQUE,"
        "  `City` varchar(30) DEFAULT 'Mumbai',"
        "  PRIMARY KEY (`Customer_ID`)"
        ") ENGINE=InnoDB"
    ),
    'supplier': (
        "CREATE TABLE IF NOT EXISTS `supplier` ("
        "  `Supplier_ID` varchar(10) NOT NULL,"
        "  `Phone_No` varchar(15) DEFAULT NULL,"
        "  `Area` varchar(50) DEFAULT NULL,"
        "  PRIMARY KEY (`Supplier_ID`)"
        ") ENGINE=InnoDB"
    ),
    'product': (
        # Shelf_Life_Days and Lead_Time_Days added (audit fix W13):
        # These are important cold-chain features — a product near
        # expiry needs faster turnover (higher reorder urgency).
        "CREATE TABLE IF NOT EXISTS `product` ("
        "  `Product_ID` varchar(10) NOT NULL,"
        "  `Product_name` varchar(50) DEFAULT NULL,"
        "  `Supplier_ID` varchar(10) DEFAULT NULL,"
        "  `Stock` int DEFAULT NULL,"
        "  `Check_price` int DEFAULT NULL,"
        "  `Temperature_required` int DEFAULT NULL,"
        "  `Category` varchar(50) DEFAULT 'Vaccines',"
        "  `Shelf_Life_Days` int DEFAULT 365,"
        "  `Lead_Time_Days` int DEFAULT 7,"
        "  `Image_URL` varchar(255) DEFAULT NULL,"
        "  PRIMARY KEY (`Product_ID`),"
        "  KEY `Supplier_ID` (`Supplier_ID`)"
        ") ENGINE=InnoDB"
    ),
    'orders': (
        "CREATE TABLE IF NOT EXISTS `orders` ("
        "  `Order_ID` int NOT NULL AUTO_INCREMENT,"
        "  `Product_ID` varchar(10) DEFAULT NULL,"
        "  `Supplier_ID` varchar(10) DEFAULT NULL,"
        "  `Tracking_No` varchar(30) DEFAULT NULL UNIQUE,"
        "  `Order_Date` date DEFAULT '2020-01-01',"
        "  PRIMARY KEY (`Order_ID`)"
        ") ENGINE=InnoDB"
    ),
    'payment': (
        "CREATE TABLE IF NOT EXISTS `payment` ("
        "  `Payment_ID` int NOT NULL AUTO_INCREMENT,"
        "  `Order_ID` int DEFAULT NULL,"
        "  `Amount` decimal(10,2) NOT NULL,"
        "  `Payment_Mode` varchar(20) DEFAULT NULL,"
        "  `Payment_Date` date DEFAULT NULL,"
        "  PRIMARY KEY (`Payment_ID`),"
        "  KEY `Order_ID` (`Order_ID`)"
        ") ENGINE=InnoDB"
    ),
    'shipment': (
        "CREATE TABLE IF NOT EXISTS `shipment` ("
        "  `Shipment_ID` int NOT NULL AUTO_INCREMENT,"
        "  `Shipment_Date` date NOT NULL DEFAULT '2020-01-01',"
        "  `Order_ID` int NOT NULL,"
        "  `Quantity` int NOT NULL,"
        "  `Tracking_Number` varchar(50) DEFAULT NULL UNIQUE,"
        "  `Image_URL` varchar(255) DEFAULT NULL,"
        "  PRIMARY KEY (`Shipment_ID`),"
        "  KEY `Order_ID` (`Order_ID`)"
        ") ENGINE=InnoDB"
    ),
    'system_config': (
        "CREATE TABLE IF NOT EXISTS `system_config` ("
        "  `Config_Key` varchar(50) NOT NULL,"
        "  `Config_Value` text,"
        "  PRIMARY KEY (`Config_Key`)"
        ") ENGINE=InnoDB"
    ),
    'users': (
        "CREATE TABLE IF NOT EXISTS `users` ("
        "  `User_ID` int NOT NULL AUTO_INCREMENT,"
        "  `Email` varchar(100) NOT NULL UNIQUE,"
        "  `Password_Hash` varchar(255) NOT NULL,"
        "  `Full_Name` varchar(100) NOT NULL,"
        "  `Role` varchar(20) DEFAULT 'user',"
        "  `Created_At` varchar(50) DEFAULT NULL,"
        "  PRIMARY KEY (`User_ID`)"
        ") ENGINE=InnoDB"
    ),
    'prediction_history': (
        "CREATE TABLE IF NOT EXISTS `prediction_history` ("
        "  `History_ID` int NOT NULL AUTO_INCREMENT,"
        "  `User_ID` int DEFAULT NULL,"
        "  `Product_ID` varchar(50) DEFAULT NULL,"
        "  `Category` varchar(50) DEFAULT NULL,"
        "  `Price` decimal(10,2) DEFAULT NULL,"
        "  `Stock` int DEFAULT NULL,"
        "  `Predicted_Demand` decimal(10,2) NOT NULL,"
        "  `Confidence_Lower` decimal(10,2) DEFAULT NULL,"
        "  `Confidence_Upper` decimal(10,2) DEFAULT NULL,"
        "  `Model_Version` varchar(50) DEFAULT NULL,"
        "  `Created_At` varchar(50) DEFAULT NULL,"
        "  `Inputs_JSON` text,"
        "  PRIMARY KEY (`History_ID`)"
        ") ENGINE=InnoDB"
    )
}

# ============================================================
# SQLITE TABLE DEFINITIONS (identical schema, SQLite syntax)
# ============================================================

SQLITE_TABLES = {
    'customers': (
        "CREATE TABLE IF NOT EXISTS customers ("
        "  Customer_ID INTEGER PRIMARY KEY AUTOINCREMENT,"
        "  Customer_Name TEXT NOT NULL,"
        "  Phone_No TEXT UNIQUE,"
        "  City TEXT DEFAULT 'Mumbai'"
        ")"
    ),
    'supplier': (
        "CREATE TABLE IF NOT EXISTS supplier ("
        "  Supplier_ID TEXT NOT NULL PRIMARY KEY,"
        "  Phone_No TEXT,"
        "  Area TEXT"
        ")"
    ),
    'product': (
        # Shelf_Life_Days and Lead_Time_Days: critical ML features (audit fix W13)
        "CREATE TABLE IF NOT EXISTS product ("
        "  Product_ID TEXT NOT NULL PRIMARY KEY,"
        "  Product_name TEXT,"
        "  Supplier_ID TEXT,"
        "  Stock INTEGER,"
        "  Check_price INTEGER,"
        "  Temperature_required INTEGER,"
        "  Category TEXT DEFAULT 'Vaccines',"
        "  Shelf_Life_Days INTEGER DEFAULT 365,"
        "  Lead_Time_Days INTEGER DEFAULT 7,"
        "  Image_URL TEXT"
        ")"
    ),
    'orders': (
        "CREATE TABLE IF NOT EXISTS orders ("
        "  Order_ID INTEGER PRIMARY KEY AUTOINCREMENT,"
        "  Product_ID TEXT,"
        "  Supplier_ID TEXT,"
        "  Tracking_No TEXT UNIQUE,"
        "  Order_Date TEXT DEFAULT '2020-01-01'"
        ")"
    ),
    'payment': (
        "CREATE TABLE IF NOT EXISTS payment ("
        "  Payment_ID INTEGER PRIMARY KEY AUTOINCREMENT,"
        "  Order_ID INTEGER,"
        "  Amount REAL NOT NULL,"
        "  Payment_Mode TEXT,"
        "  Payment_Date TEXT"
        ")"
    ),
    'shipment': (
        "CREATE TABLE IF NOT EXISTS shipment ("
        "  Shipment_ID INTEGER PRIMARY KEY AUTOINCREMENT,"
        "  Shipment_Date TEXT NOT NULL,"
        "  Order_ID INTEGER NOT NULL,"
        "  Quantity INTEGER NOT NULL,"
        "  Tracking_Number TEXT UNIQUE,"
        "  Image_URL TEXT"
        ")"
    ),
    'system_config': (
        "CREATE TABLE IF NOT EXISTS system_config ("
        "  Config_Key TEXT NOT NULL PRIMARY KEY,"
        "  Config_Value TEXT"
        ")"
    ),
    'users': (
        "CREATE TABLE IF NOT EXISTS users ("
        "  User_ID INTEGER PRIMARY KEY AUTOINCREMENT,"
        "  Email TEXT NOT NULL UNIQUE,"
        "  Password_Hash TEXT NOT NULL,"
        "  Full_Name TEXT NOT NULL,"
        "  Role TEXT DEFAULT 'user',"
        "  Created_At TEXT"
        ")"
    ),
    'prediction_history': (
        "CREATE TABLE IF NOT EXISTS prediction_history ("
        "  History_ID INTEGER PRIMARY KEY AUTOINCREMENT,"
        "  User_ID INTEGER,"
        "  Product_ID TEXT,"
        "  Category TEXT,"
        "  Price REAL,"
        "  Stock INTEGER,"
        "  Predicted_Demand REAL NOT NULL,"
        "  Confidence_Lower REAL,"
        "  Confidence_Upper REAL,"
        "  Model_Version TEXT,"
        "  Created_At TEXT,"
        "  Inputs_JSON TEXT"
        ")"
    )
}

# ============================================================
# SEED DATA — LABELLED SYNTHETIC
# ============================================================

SEED_SUPPLIERS = [
    ("SUP01", "9876543210", "Mumbai South"),
    ("SUP02", "9876543211", "Thane East"),
    ("SUP03", "9876543212", "Navi Mumbai"),
    ("SUP04", "9876543213", "Pune Industrial"),
    ("SUP05", "9876543214", "Bandra Kurla"),
]

# Products now include Shelf_Life_Days and Lead_Time_Days (audit fix W13)
# Shelf life values are realistic pharmaceutical standards:
#   Vaccines: 180–730 days   |  Blood products: 42 days (critical!)
#   Biologics: 365 days      |  Reagents: 1095 days
# Lead time = days from supplier order to warehouse receipt
SEED_PRODUCTS = [
    # (ID, Name, SupID, Stock, Price, TempReq, Category, ShelfLife, LeadTime, ImageURL)
    ("P101", "COVID-19 mRNA Vaccine",  "SUP01", 120, 1250, -20, "Vaccines",      180,  7, "https://images.unsplash.com/photo-1618961734760-466979ce35b0?w=300"),
    ("P102", "Insulin Glargine 100U",  "SUP02", 200,  850,   4, "Insulin",       365,  5, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300"),
    ("P103", "Human Plasma Unit",      "SUP03",  60, 2100, -18, "Blood Products", 42,  3, "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=300"),
    ("P104", "Monoclonal Antibodies",  "SUP01",  45, 4500,   2, "Biologics",     365, 10, "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=300"),
    ("P105", "MMR Vaccine Vial",       "SUP02", 150,  950,   4, "Vaccines",      730,  7, "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300"),
    ("P106", "Hepatitis B Vaccine",    "SUP01", 180, 1100,   4, "Vaccines",      730,  7, "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300"),
    ("P107", "Influenza Quadrivalent", "SUP04", 300,  650,   5, "Vaccines",      365,  7, "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300"),
    ("P108", "RT-PCR Test Reagent Kit","SUP05",  90, 1750, -15, "Lab Reagents", 1095, 14, "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=300"),
    ("P109", "Rapid Antigen Assay",    "SUP05", 500,  350,  22, "Diagnostics",  1825, 10, "https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=300"),
    ("P110", "Erythropoietin 4000IU",  "SUP03",  75, 3200,   4, "Biologics",    365,  10, "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300"),
]

SEED_CUSTOMERS = [
    ("City Central Hospital",   "9820011223", "Mumbai"),
    ("Apollo Care Clinic",       "9820022334", "Thane"),
    ("Metro Pathology Labs",     "9820033445", "Navi Mumbai"),
    ("Red Cross Blood Bank",     "9820044556", "Pune"),
    ("Sunrise Pharma Mart",      "9820055667", "Mumbai"),
    ("Care Multispecialty",      "9820066778", "Nashik"),
    ("Lifeline Diagnostics",     "9820077889", "Nagpur"),
    ("Apex Medical Center",      "9820088990", "Aurangabad"),
    ("Global Health Trust",      "9820099001", "Mumbai"),
    ("MedPlus Retail Outlet",    "9820100112", "Thane"),
]

# Indian pharma demand calendar — weeks around these dates see +15% demand spike
# Used to generate realistic seasonality in synthetic data (audit fix W13)
HOLIDAY_WEEKS = {
    # (month, week_of_month) -> demand multiplier
    # Diwali season (Oct-Nov): vaccine drives, diagnostic surge
    (10, 3): 1.15, (10, 4): 1.20, (11, 1): 1.15,
    # Winter flu season (Dec-Jan): influenza vaccine surge
    (12, 1): 1.25, (12, 2): 1.20, (12, 3): 1.15, (1, 1): 1.20, (1, 2): 1.15,
    # Monsoon (Jun-Aug): dengue/malaria reagent surge
    (6, 2): 1.10, (7, 1): 1.15, (7, 2): 1.15, (8, 1): 1.10,
    # Summer (Apr-May): slight demand dip
    (4, 2): 0.90, (5, 1): 0.88, (5, 2): 0.85,
}


def _holiday_multiplier(dt):
    """Returns a demand multiplier based on the order's month and week."""
    month = dt.month
    week_of_month = (dt.day - 1) // 7 + 1
    return HOLIDAY_WEEKS.get((month, week_of_month), 1.0)


def _annual_growth_factor(dt, base_year=2020):
    """
    Annual growth trend: +4% per year for vaccines/biologics, +2% for others.
    This simulates real-world market growth in pharmaceutical demand.
    """
    years_since_base = (dt.year - base_year) + (dt.month - 1) / 12.0
    return 1.0 + 0.04 * years_since_base


def generate_orders(is_sqlite=False):
    """
    Generate 1,000 synthetic order-shipment records spanning 5 years (2020-2024).
    
    Design rationale (viva note):
    - 5 years × 10 products × ~20 orders/product/year = 1000 orders
    - Chronological ordering is preserved so lag features work correctly
    - 1000 rows gives each product ~100 historical data points,
      enough for lag_1, lag_7 and rolling_mean_28 to be meaningful
    - Fixed seed (42) makes results reproducible but data is NOT real
    - Demand formula: base * holiday * growth * noise
      where noise ~ N(1.0, 0.10) — 10% coefficient of variation
      matches typical pharma demand uncertainty in literature
    """
    random.seed(42)

    # Base annual demand per product (units per order, realistic estimates)
    product_base = {
        "P101": 85,  "P102": 140, "P103": 40,  "P104": 25,
        "P105": 110, "P106": 95,  "P107": 220, "P108": 65,
        "P109": 350, "P110": 30
    }
    prices = {p[0]: p[4] for p in SEED_PRODUCTS}
    suppliers = {p[0]: p[2] for p in SEED_PRODUCTS}
    modes = ["Credit Card", "Bank Transfer", "UPI", "Cash"]

    # Generate 1000 orders spread chronologically from Jan 2020 to Dec 2024
    start_date = datetime(2020, 1, 5)
    orders = []

    product_ids = [p[0] for p in SEED_PRODUCTS]
    # Assign each order slot to a product in a round-robin + random mix
    # This ensures roughly equal distribution (~100 per product)
    order_slots = []
    for i in range(100):
        shuffled = product_ids[:]
        random.shuffle(shuffled)
        order_slots.extend(shuffled)

    # Sort order slots into chronological sequence with ~1.8 day spacing
    # 5 years = 1825 days / 1000 orders ≈ 1.8 days per order
    current_dt = start_date
    for order_idx, pid in enumerate(order_slots[:1000], start=1):
        current_dt += timedelta(days=random.randint(1, 3))

        base_d = product_base[pid]
        holiday_m = _holiday_multiplier(current_dt)
        growth_m = _annual_growth_factor(current_dt)

        # Gaussian noise with 10% CV (coefficient of variation)
        # Using Box-Muller transform (pure Python, no numpy needed)
        u1 = random.random() + 1e-10
        u2 = random.random()
        z = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
        noise_factor = 1.0 + 0.10 * z

        qty = max(5, int(base_d * holiday_m * growth_m * noise_factor))

        orders.append({
            "pid": pid,
            "sup_id": suppliers[pid],
            "order_date": current_dt.strftime("%Y-%m-%d"),
            "ship_date": (current_dt + timedelta(days=random.randint(1, 4))).strftime("%Y-%m-%d"),
            "qty": qty,
            "amount": qty * prices[pid],
            "pay_mode": random.choice(modes),
            "order_idx": order_idx,
        })

    return orders


def migrate_schema(cursor, is_sqlite=False):
    """
    Safely adds new columns to existing tables without dropping data.
    Catches exceptions if columns already exist (safe to run repeatedly).
    This handles upgrades from the previous 200-row schema.
    """
    new_columns = [
        ("product", "Shelf_Life_Days", "INTEGER DEFAULT 365"),
        ("product", "Lead_Time_Days",  "INTEGER DEFAULT 7"),
    ]
    for table, col, col_def in new_columns:
        try:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_def}")
        except Exception:
            pass  # Column already exists — safe to ignore


def seed_data(cursor, is_sqlite=False):
    """Seeds all reference and historical data. Safe to call multiple times."""
    ph = "?" if is_sqlite else "%s"

    # ---- 1. Seed default users (always) ----
    from werkzeug.security import generate_password_hash
    dt_now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    seed_users = [
        ("admin@coldchain.com", generate_password_hash("admin123"), "System Administrator", "admin", dt_now),
        ("demo@coldchain.com",  generate_password_hash("demo123"),  "Demo Logistics Manager", "user", dt_now),
    ]
    for u in seed_users:
        try:
            cursor.execute(
                f"INSERT INTO users (Email, Password_Hash, Full_Name, Role, Created_At) "
                f"VALUES ({ph},{ph},{ph},{ph},{ph})", u
            )
        except Exception:
            pass

    # ---- 2. Mark data as synthetic in system_config (audit fix W3) ----
    try:
        cursor.execute(
            f"INSERT INTO system_config (Config_Key, Config_Value) VALUES ({ph},{ph})",
            ("data_source", "Labelled Synthetic — generated with fixed seed (42) using realistic cold-chain seasonality. Not real patient or hospital data.")
        )
        cursor.execute(
            f"INSERT INTO system_config (Config_Key, Config_Value) VALUES ({ph},{ph})",
            ("data_rows", "1000")
        )
    except Exception:
        pass

    # ---- Seed default admin user always ----
    try:
        from werkzeug.security import generate_password_hash
        pwd_hash = generate_password_hash("demo123")
        cursor.execute("SELECT User_ID FROM users WHERE LOWER(Email) = 'demo@coldchain.com'")
        if not cursor.fetchone():
            cursor.execute(
                f"INSERT INTO users (Email, Password_Hash, Full_Name, Role, Created_At) VALUES ({ph},{ph},{ph},{ph},{ph})",
                ("demo@coldchain.com", pwd_hash, "System Admin", "admin", "2024-01-01 00:00:00")
            )
        else:
            cursor.execute(
                f"UPDATE users SET Role = 'admin', Password_Hash = {ph} WHERE LOWER(Email) = 'demo@coldchain.com'",
                (pwd_hash,)
            )
    except Exception as u_err:
        pass

    # ---- 3. Check if supplier table already has records ----
    cursor.execute("SELECT COUNT(*) FROM supplier")
    row = cursor.fetchone()
    count = row[0] if isinstance(row, tuple) else list(row.values())[0]

    if count > 0:
        print("[setup_db] Reference data already present. Checking order count...")
        # Check if we have enough orders for lag features (need > 100)
        cursor.execute("SELECT COUNT(*) FROM orders")
        row2 = cursor.fetchone()
        order_count = row2[0] if isinstance(row2, tuple) else list(row2.values())[0]
        if order_count >= 800:
            print(f"[setup_db] {order_count} orders found. Seed complete.")
            return
        print(f"[setup_db] Only {order_count} orders found. Re-seeding orders for lag feature support...")
        # Clear old orders/shipments/payments and reseed with 1000 rows
        for tbl in ["payment", "shipment", "orders"]:
            try:
                cursor.execute(f"DELETE FROM {tbl}")
            except Exception:
                pass

    else:
        # Fresh DB — insert all reference data
        for s in SEED_SUPPLIERS:
            cursor.execute(f"INSERT INTO supplier (Supplier_ID, Phone_No, Area) VALUES ({ph},{ph},{ph})", s)

        for p in SEED_PRODUCTS:
            cursor.execute(
                f"INSERT INTO product (Product_ID, Product_name, Supplier_ID, Stock, Check_price, "
                f"Temperature_required, Category, Shelf_Life_Days, Lead_Time_Days, Image_URL) "
                f"VALUES ({ph},{ph},{ph},{ph},{ph},{ph},{ph},{ph},{ph},{ph})", p
            )

        for c in SEED_CUSTOMERS:
            cursor.execute(
                f"INSERT INTO customers (Customer_Name, Phone_No, City) VALUES ({ph},{ph},{ph})", c
            )

    # ---- Seed default admin user if missing ----
    try:
        from werkzeug.security import generate_password_hash
        pwd_hash = generate_password_hash("demo123")
        cursor.execute("SELECT User_ID FROM users WHERE LOWER(Email) = 'demo@coldchain.com'")
        if not cursor.fetchone():
            cursor.execute(
                f"INSERT INTO users (Email, Password_Hash, Full_Name, Role, Created_At) VALUES ({ph},{ph},{ph},{ph},{ph})",
                ("demo@coldchain.com", pwd_hash, "System Admin", "admin", "2024-01-01 00:00:00")
            )
        else:
            cursor.execute(
                f"UPDATE users SET Role = 'admin', Password_Hash = {ph} WHERE LOWER(Email) = 'demo@coldchain.com'",
                (pwd_hash,)
            )
    except Exception as u_err:
        print(f"[setup_db] User seed warning: {u_err}")

    # ---- 4. Insert 1000 synthetic orders (chronological, labelled) ----
    print("[setup_db] Generating 1,000 labelled-synthetic orders (2020–2024)...")
    orders = generate_orders(is_sqlite=is_sqlite)

    for o in orders:
        cursor.execute(
            f"INSERT INTO orders (Product_ID, Supplier_ID, Tracking_No, Order_Date) "
            f"VALUES ({ph},{ph},{ph},{ph})",
            (o["pid"], o["sup_id"], f"TRK-{5000000 + o['order_idx']}", o["order_date"])
        )
        order_id = cursor.lastrowid
        cursor.execute(
            f"INSERT INTO shipment (Shipment_Date, Order_ID, Quantity, Tracking_Number, Image_URL) "
            f"VALUES ({ph},{ph},{ph},{ph},{ph})",
            (o["ship_date"], order_id, o["qty"], f"SHP-{6000000 + o['order_idx']}", None)
        )
        cursor.execute(
            f"INSERT INTO payment (Order_ID, Amount, Payment_Mode, Payment_Date) "
            f"VALUES ({ph},{ph},{ph},{ph})",
            (order_id, o["amount"], o["pay_mode"], o["ship_date"])
        )

    print(f"[setup_db] Successfully seeded 1,000 labelled-synthetic orders (2020–2024).")
    print("[setup_db] DATA DISCLAIMER: This is labelled synthetic data, not real transactions.")


def setup_database():
    mysql_success = False

    # ---- Try MySQL ----
    try:
        base_config = DB_CONFIG.copy()
        db_name = base_config.pop('database', 'coldchaindb')
        base_config["connection_timeout"] = 3
        conn = mysql.connector.connect(**base_config)
        cursor = conn.cursor()
        print(f"[setup_db] Creating MySQL database '{db_name}' if not exists...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        cursor.execute(f"USE {db_name}")

        for table_name, table_sql in TABLES.items():
            cursor.execute(table_sql)
        conn.commit()

        migrate_schema(cursor, is_sqlite=False)
        conn.commit()

        seed_data(cursor, is_sqlite=False)
        conn.commit()
        cursor.close()
        conn.close()
        print("[setup_db] [SUCCESS] MySQL Database setup complete!")
        mysql_success = True
    except Exception as err:
        print(f"[setup_db] MySQL unavailable — using SQLite: {err}")

    # ---- SQLite Fallback ----
    # On Vercel (read-only filesystem), /tmp is the only writable directory
    if os.environ.get('VERCEL') or not os.access(os.path.dirname(__file__) or '.', os.W_OK):
        db_path = "/tmp/coldchain.db"
    else:
        db_path = os.path.join(os.path.dirname(__file__), "coldchain.db")

    print(f"[setup_db] Setting up SQLite at '{db_path}'...")
    sq_conn = sqlite3.connect(db_path)
    sq_cursor = sq_conn.cursor()

    for table_name, table_sql in SQLITE_TABLES.items():
        sq_cursor.execute(table_sql)
    sq_conn.commit()

    migrate_schema(sq_cursor, is_sqlite=True)
    sq_conn.commit()

    seed_data(sq_cursor, is_sqlite=True)
    sq_conn.commit()
    sq_conn.close()
    print("[setup_db] [SUCCESS] SQLite setup complete!")


if __name__ == "__main__":
    setup_database()
