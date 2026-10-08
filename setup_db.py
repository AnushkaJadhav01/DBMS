import mysql.connector
import sqlite3
import os
import random
from datetime import datetime, timedelta
from config import DB_CONFIG

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
        "CREATE TABLE IF NOT EXISTS `product` ("
        "  `Product_ID` varchar(10) NOT NULL,"
        "  `Product_name` varchar(50) DEFAULT NULL,"
        "  `Supplier_ID` varchar(10) DEFAULT NULL,"
        "  `Stock` int DEFAULT NULL,"
        "  `Check_price` int DEFAULT NULL,"
        "  `Temperature_required` int DEFAULT NULL,"
        "  `Category` varchar(50) DEFAULT 'Vaccines',"
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
        "  `Order_Date` date DEFAULT '2024-01-01',"
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
        "  `Shipment_Date` date NOT NULL DEFAULT '2024-01-01',"
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
        "  Supplier_ID TEXT PRIMARY KEY,"
        "  Phone_No TEXT,"
        "  Area TEXT"
        ")"
    ),
    'product': (
        "CREATE TABLE IF NOT EXISTS product ("
        "  Product_ID TEXT PRIMARY KEY,"
        "  Product_name TEXT,"
        "  Supplier_ID TEXT,"
        "  Stock INTEGER,"
        "  Check_price INTEGER,"
        "  Temperature_required INTEGER,"
        "  Category TEXT DEFAULT 'Vaccines',"
        "  Image_URL TEXT"
        ")"
    ),
    'orders': (
        "CREATE TABLE IF NOT EXISTS orders ("
        "  Order_ID INTEGER PRIMARY KEY AUTOINCREMENT,"
        "  Product_ID TEXT,"
        "  Supplier_ID TEXT,"
        "  Tracking_No TEXT UNIQUE,"
        "  Order_Date TEXT DEFAULT '2024-01-01'"
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
        "  Shipment_Date TEXT NOT NULL DEFAULT '2024-01-01',"
        "  Order_ID INTEGER NOT NULL,"
        "  Quantity INTEGER NOT NULL,"
        "  Tracking_Number TEXT UNIQUE,"
        "  Image_URL TEXT"
        ")"
    ),
    'system_config': (
        "CREATE TABLE IF NOT EXISTS system_config ("
        "  Config_Key TEXT PRIMARY KEY,"
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

SEED_SUPPLIERS = [
    ("SUP01", "9876543210", "Mumbai South"),
    ("SUP02", "9876543211", "Thane East"),
    ("SUP03", "9876543212", "Navi Mumbai"),
    ("SUP04", "9876543213", "Pune Industrial"),
    ("SUP05", "9876543214", "Bandra Kurla"),
]

SEED_PRODUCTS = [
    ("P101", "COVID-19 mRNA Vaccine", "SUP01", 120, 1250, -20, "Vaccines", "https://images.unsplash.com/photo-1618961734760-466979ce35b0?w=300"),
    ("P102", "Insulin Glargine 100U", "SUP02", 200, 850, 4, "Insulin", "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300"),
    ("P103", "Human Plasma Unit", "SUP03", 60, 2100, -18, "Blood Products", "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=300"),
    ("P104", "Monoclonal Antibodies", "SUP01", 45, 4500, 2, "Biologics", "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=300"),
    ("P105", "MMR Vaccine Vial", "SUP02", 150, 950, 4, "Vaccines", "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300"),
    ("P106", "Hepatitis B Vaccine", "SUP01", 180, 1100, 4, "Vaccines", "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300"),
    ("P107", "Influenza Quadrivalent", "SUP04", 300, 650, 5, "Vaccines", "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300"),
    ("P108", "RT-PCR Test Reagent Kit", "SUP05", 90, 1750, -15, "Lab Reagents", "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=300"),
    ("P109", "Rapid Antigen Assay", "SUP05", 500, 350, 22, "Diagnostics", "https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=300"),
    ("P110", "Erythropoietin 4000IU", "SUP03", 75, 3200, 4, "Biologics", "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300"),
]

SEED_CUSTOMERS = [
    ("City Central Hospital", "9820011223", "Mumbai"),
    ("Apollo Care Clinic", "9820022334", "Thane"),
    ("Metro Pathology Labs", "9820033445", "Navi Mumbai"),
    ("Red Cross Blood Bank", "9820044556", "Pune"),
    ("Sunrise Pharma Mart", "9820055667", "Mumbai"),
    ("Care Multispecialty", "9820066778", "Nashik"),
    ("Lifeline Diagnostics", "9820077889", "Nagpur"),
    ("Apex Medical Center", "9820088990", "Aurangabad"),
    ("Global Health Trust", "9820099001", "Mumbai"),
    ("MedPlus Retail Outlet", "9820100112", "Thane"),
]

def seed_data(cursor, is_sqlite=False):
    ph = "?" if is_sqlite else "%s"
    
    # Always check and seed default users if missing
    from werkzeug.security import generate_password_hash
    dt_now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    seed_users = [
        ("admin@coldchain.com", generate_password_hash("admin123"), "System Administrator", "admin", dt_now),
        ("demo@coldchain.com", generate_password_hash("demo123"), "Demo Logistics Manager", "user", dt_now),
    ]
    for u in seed_users:
        try:
            cursor.execute(f"INSERT INTO users (Email, Password_Hash, Full_Name, Role, Created_At) VALUES ({ph},{ph},{ph},{ph},{ph})", u)
        except Exception:
            pass

    # Check if supplier table already has records
    cursor.execute("SELECT COUNT(*) FROM supplier")
    row = cursor.fetchone()
    count = row[0] if isinstance(row, tuple) else row["COUNT(*)"] if isinstance(row, dict) else list(row.values())[0]
    
    if count > 0:
        print("Supplier data already present. Seed complete.")
        return

    # Insert Suppliers
    for s in SEED_SUPPLIERS:
        cursor.execute(f"INSERT INTO supplier (Supplier_ID, Phone_No, Area) VALUES ({ph},{ph},{ph})", s)
        
    # Insert Products
    for p in SEED_PRODUCTS:
        cursor.execute(
            f"INSERT INTO product (Product_ID, Product_name, Supplier_ID, Stock, Check_price, Temperature_required, Category, Image_URL) "
            f"VALUES ({ph},{ph},{ph},{ph},{ph},{ph},{ph},{ph})", p
        )
        
    # Insert Customers
    for c in SEED_CUSTOMERS:
        cursor.execute(f"INSERT INTO customers (Customer_Name, Phone_No, City) VALUES ({ph},{ph},{ph})", c)

    # Generate 200 realistic historical orders over 2024-2025
    random.seed(42)
    start_date = datetime(2024, 1, 5)
    modes = ["Credit Card", "Bank Transfer", "UPI", "Cash"]
    
    # Demand base rates per product
    product_base_demand = {
        "P101": 85, "P102": 140, "P103": 40, "P104": 25, "P105": 110,
        "P106": 95, "P107": 220, "P108": 65, "P109": 350, "P110": 30
    }
    
    prices = {p[0]: p[4] for p in SEED_PRODUCTS}
    suppliers = {p[0]: p[2] for p in SEED_PRODUCTS}
    
    current_dt = start_date
    for order_idx in range(1, 201):
        current_dt += timedelta(days=random.randint(1, 4), hours=random.randint(0, 12))
        pid = random.choice(SEED_PRODUCTS)[0]
        sup_id = suppliers[pid]
        track_no = f"TRK-{2024000 + order_idx}"
        order_date_str = current_dt.strftime("%Y-%m-%d")
        
        cursor.execute(
            f"INSERT INTO orders (Product_ID, Supplier_ID, Tracking_No, Order_Date) VALUES ({ph},{ph},{ph},{ph})",
            (pid, sup_id, track_no, order_date_str)
        )
        if is_sqlite:
            order_id = cursor.lastrowid
        else:
            order_id = cursor.lastrowid
            
        # Realistic quantity with monthly seasonality factor
        month_factor = 1.0 + (0.25 if current_dt.month in [10, 11, 12, 1] else (-0.1 if current_dt.month in [5, 6] else 0.0))
        base_d = product_base_demand[pid]
        noise = random.normalvariate(0, base_d * 0.12)
        qty = max(5, int(base_d * month_factor + noise))
        
        ship_date_str = (current_dt + timedelta(days=random.randint(1, 3))).strftime("%Y-%m-%d")
        ship_track = f"SHP-{3024000 + order_idx}"
        cursor.execute(
            f"INSERT INTO shipment (Shipment_Date, Order_ID, Quantity, Tracking_Number, Image_URL) VALUES ({ph},{ph},{ph},{ph},{ph})",
            (ship_date_str, order_id, qty, ship_track, None)
        )
        
        amount = qty * prices[pid]
        pay_mode = random.choice(modes)
        cursor.execute(
            f"INSERT INTO payment (Order_ID, Amount, Payment_Mode, Payment_Date) VALUES ({ph},{ph},{ph},{ph})",
            (order_id, amount, pay_mode, ship_date_str)
        )

    print("Successfully seeded 200 historical orders, shipments, and payments!")

def setup_database():
    mysql_success = False
    # Try MySQL
    try:
        base_config = DB_CONFIG.copy()
        db_name = base_config.pop('database', 'coldchaindb')
        base_config["connection_timeout"] = 3
        conn = mysql.connector.connect(**base_config)
        cursor = conn.cursor()
        print(f"Creating MySQL database '{db_name}' if not exists...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        cursor.execute(f"USE {db_name}")

        for table_name, table_sql in TABLES.items():
            print(f"Creating MySQL table {table_name}...")
            cursor.execute(table_sql)

        conn.commit()
        seed_data(cursor, is_sqlite=False)
        conn.commit()
        cursor.close()
        conn.close()
        print("[SUCCESS] MySQL Database setup complete!")
        mysql_success = True
    except Exception as err:
        print(f"[INFO] MySQL Server unavailable (Will use SQLite database): {err}")

    # Setup SQLite as fallback
    # On Vercel, /tmp is the only writable directory
    if os.environ.get('VERCEL') or not os.access(os.path.dirname(__file__) or '.', os.W_OK):
        db_path = "/tmp/coldchain.db"
    else:
        db_path = os.path.join(os.path.dirname(__file__), "coldchain.db")
    print(f"Setting up SQLite database at '{db_path}'...")
    sq_conn = sqlite3.connect(db_path)
    sq_cursor = sq_conn.cursor()
    for table_name, table_sql in SQLITE_TABLES.items():
        sq_cursor.execute(table_sql)
    sq_conn.commit()
    seed_data(sq_cursor, is_sqlite=True)
    sq_conn.commit()
    sq_conn.close()
    print("[SUCCESS] Database setup complete!")

if __name__ == "__main__":
    setup_database()


