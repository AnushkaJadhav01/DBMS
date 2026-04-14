# models/payments.py — Assumed: Payment_ID, Order_ID, Amount, Payment_Mode, Payment_Date, Status
from models.db import get_db

def get_all_payments(search=None, status=None):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        base = "SELECT * FROM Payment"
        conditions, params = [], []
        if search:
            conditions.append("(Payment_ID LIKE %s OR Order_ID LIKE %s OR Payment_Mode LIKE %s)")
            params += [f"%{search}%", f"%{search}%", f"%{search}%"]
        if status:
            conditions.append("Status = %s")
            params.append(status)
        if conditions:
            base += " WHERE " + " AND ".join(conditions)
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
    cursor.execute("SELECT * FROM Payment WHERE Payment_ID = %s", (pid,))
    result = cursor.fetchone()
    cursor.close(); conn.close()
    return result

def create_payment(data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO Payment (Order_ID, Amount, Payment_Mode, Payment_Date, Status) VALUES (%s,%s,%s,%s,%s)",
        (data["Order_ID"], data["Amount"], data.get("Payment_Mode"), data.get("Payment_Date"), data.get("Status","Pending")),
    )
    conn.commit()
    pid = cursor.lastrowid
    cursor.close(); conn.close()
    return pid

def update_payment(pid, data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE Payment SET Order_ID=%s, Amount=%s, Payment_Mode=%s, Payment_Date=%s, Status=%s WHERE Payment_ID=%s",
        (data["Order_ID"], data["Amount"], data.get("Payment_Mode"), data.get("Payment_Date"), data.get("Status","Pending"), pid),
    )
    conn.commit()
    rows = cursor.rowcount
    cursor.close(); conn.close()
    return rows

def delete_payment(pid):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Payment WHERE Payment_ID = %s", (pid,))
    conn.commit()
    rows = cursor.rowcount
    cursor.close(); conn.close()
    return rows
