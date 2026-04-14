# ============================================================
# config.py — Application Configuration
# Loads credentials from .env file for security
# ============================================================

import os
from dotenv import load_dotenv

# Load variables from .env if it exists
load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "coldchaindb"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "autocommit": os.getenv("DB_AUTOCOMMIT", "False").lower() == "true"
}

# Flask Settings
SECRET_KEY = os.getenv("SECRET_KEY", "default-secret-key-12345")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# ============================================================
# COLUMN NAME REFERENCE (update models/*.py if yours differ)
# ------------------------------------------------------------
# Supplier  : SupplierID, Name, Contact, Email, Address
# Product   : ProductID, Name, Category, Price, Stock, SupplierID
# Customers : CustomerID, Name, Email, Phone, Address
# Orders    : OrderID, CustomerID, ProductID, Quantity, TotalAmount, OrderDate, Status
# Shipment  : ShipmentID, OrderID, ShipDate, DeliveryDate, Status, Carrier, TrackingNo
# Payment   : PaymentID, OrderID, Amount, Method, PaymentDate, Status
# ============================================================
