# models/payment.py — Real Schema: Payment_ID, Order_ID, Amount, Payment_Mode, Payment_Date
from models.db import get_db

def get_all_payments(search=None):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        base = "SELECT * FROM payment"
        params = []
        if search:
            base += " WHERE Payment_ID LIKE %s OR Order_ID LIKE %s"
            params += [f"%{search}%", f"%{search}%"]
        base += " ORDER BY Payment_ID DESC"
        cursor.execute(base, params)
        result = cursor.fetchall()
    except Exception:
        result = []
    cursor.close(); conn.close()
    return result

def get_payment_by_id(pid):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM payment WHERE Payment_ID = %s", (pid,))
    result = cursor.fetchone()
    cursor.close(); conn.close()
    return result

def create_payment(data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO payment (Order_ID, Amount, Payment_Mode, Payment_Date) VALUES (%s,%s,%s,%s)",
        (data["Order_ID"], data["Amount"], data.get("Payment_Mode"), data.get("Payment_Date")),
    )
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close(); conn.close()
    return new_id

def update_payment(pid, data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE payment SET Order_ID=%s, Amount=%s, Payment_Mode=%s, Payment_Date=%s WHERE Payment_ID=%s",
        (data["Order_ID"], data["Amount"], data.get("Payment_Mode"), data.get("Payment_Date"), pid),
    )
    conn.commit()
    rows = cursor.rowcount
    cursor.close(); conn.close()
    return rows

def delete_payment(pid):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM payment WHERE Payment_ID = %s", (pid,))
    conn.commit()
    rows = cursor.rowcount
    cursor.close(); conn.close()
    return rows
