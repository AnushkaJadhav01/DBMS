# models/products.py — Real Schema: Product_ID, Product_name, Supplier_ID, Stock, Check_price, Temperature_required
from models.db import get_db

def get_all_products(search=None):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        base = """
            SELECT p.*, s.Area 
            FROM product p
            LEFT JOIN supplier s ON p.Supplier_ID = s.Supplier_ID
        """
        params = []
        if search:
            base += " WHERE p.Product_name LIKE %s OR p.Product_ID LIKE %s"
            params = [f"%{search}%", f"%{search}%"]
        base += " ORDER BY p.Product_ID DESC"
        cursor.execute(base, params)
        result = cursor.fetchall()
    except Exception:
        result = []
    cursor.close(); conn.close()
    return result

def get_product_by_id(pid):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM product WHERE Product_ID = %s", (pid,))
    result = cursor.fetchone()
    cursor.close(); conn.close()
    return result

def create_product(data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO product (Product_ID, Product_name, Supplier_ID, Stock, Check_price, Temperature_required, Image_URL) VALUES (%s,%s,%s,%s,%s,%s,%s)",
        (data["Product_ID"], data["Product_name"], data["Supplier_ID"], data.get("Stock",0), data.get("Check_price",0), data.get("Temperature_required",20), data.get("Image_URL")),
    )
    conn.commit()
    cursor.close(); conn.close()
    return data["Product_ID"]

def update_product(pid, data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE product SET Product_name=%s, Supplier_ID=%s, Stock=%s, Check_price=%s, Temperature_required=%s, Image_URL=%s WHERE Product_ID=%s",
        (data["Product_name"], data["Supplier_ID"], data.get("Stock",0), data.get("Check_price",0), data.get("Temperature_required",20), data.get("Image_URL"), pid),
    )
    conn.commit()
    rows = cursor.rowcount
    cursor.close(); conn.close()
    return rows

def delete_product(pid):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM product WHERE Product_ID = %s", (pid,))
    conn.commit()
    rows = cursor.rowcount
    cursor.close(); conn.close()
    return rows
