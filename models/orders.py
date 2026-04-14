# models/orders.py — Real Schema: Order_ID, Product_ID, Supplier_ID, Tracking_No, Order_Date
from models.db import get_db

def get_all_orders(search=None):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        base = """
            SELECT o.*, p.Product_name, p.Image_URL 
            FROM orders o
            LEFT JOIN product p ON o.Product_ID = p.Product_ID
        """
        params = []
        if search:
            base += " WHERE o.Order_ID LIKE %s OR o.Tracking_No LIKE %s OR p.Product_name LIKE %s"
            params = [f"%{search}%", f"%{search}%", f"%{search}%"]
        base += " ORDER BY o.Order_ID DESC"
        cursor.execute(base, params)
        result = cursor.fetchall()
    except Exception:
        result = []
    cursor.close(); conn.close()
    return result

def get_order_by_id(oid):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM orders WHERE Order_ID = %s", (oid,))
    result = cursor.fetchone()
    cursor.close(); conn.close()
    return result

def create_order(data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO orders (Product_ID, Supplier_ID, Tracking_No, Order_Date) VALUES (%s,%s,%s,%s)",
        (data["Product_ID"], data["Supplier_ID"], data.get("Tracking_No"), data.get("Order_Date")),
    )
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close(); conn.close()
    return new_id

def update_order(oid, data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE orders SET Product_ID=%s, Supplier_ID=%s, Tracking_No=%s, Order_Date=%s WHERE Order_ID=%s",
        (data["Product_ID"], data["Supplier_ID"], data.get("Tracking_No"), data.get("Order_Date"), oid),
    )
    conn.commit()
    rows = cursor.rowcount
    cursor.close(); conn.close()
    return rows

def delete_order(oid):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM orders WHERE Order_ID = %s", (oid,))
    conn.commit()
    rows = cursor.rowcount
    cursor.close(); conn.close()
    return rows
