# models/customers.py — Real Schema: Customer_ID, Customer_Name, Phone_No, City
from models.db import get_db

def get_all_customers(search=None):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        base = "SELECT * FROM customers"
        params = []
        if search:
            base += " WHERE Customer_Name LIKE %s OR Customer_ID LIKE %s"
            params = [f"%{search}%", f"%{search}%"]
        base += " ORDER BY Customer_ID DESC"
        cursor.execute(base, params)
        result = cursor.fetchall()
    except Exception:
        result = []
    cursor.close(); conn.close()
    return result

def get_customer_by_id(cid):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM customers WHERE Customer_ID = %s", (cid,))
    result = cursor.fetchone()
    cursor.close(); conn.close()
    return result

def create_customer(data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO customers (Customer_Name, Phone_No, City) VALUES (%s,%s,%s)",
        (data["Customer_Name"], data.get("Phone_No"), data.get("City")),
    )
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close(); conn.close()
    return new_id

def update_customer(cid, data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE customers SET Customer_Name=%s, Phone_No=%s, City=%s WHERE Customer_ID=%s",
        (data["Customer_Name"], data.get("Phone_No"), data.get("City"), cid),
    )
    conn.commit()
    rows = cursor.rowcount
    cursor.close(); conn.close()
    return rows

def delete_customer(cid):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM customers WHERE Customer_ID = %s", (cid,))
    conn.commit()
    rows = cursor.rowcount
    cursor.close(); conn.close()
    return rows
