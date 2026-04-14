# ============================================================
# models/db.py — Database connection helper
# Uses mysql-connector-python as specified
# ============================================================

import mysql.connector
from config import DB_CONFIG


def get_db():
    """Create and return a new MySQL database connection."""
    conn = mysql.connector.connect(**DB_CONFIG)
    return conn
