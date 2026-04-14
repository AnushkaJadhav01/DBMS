# ============================================================
# models/suppliers.py — EXACT columns: Supplier_ID, Phone_No, Area
# ============================================================

from models.db import get_db


def get_all_suppliers(search=None):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    if search:
        cursor.execute(
            "SELECT * FROM Supplier WHERE Supplier_ID LIKE %s OR Phone_No LIKE %s OR Area LIKE %s ORDER BY Supplier_ID",
            (f"%{search}%", f"%{search}%", f"%{search}%"),
        )
    else:
        cursor.execute("SELECT * FROM Supplier ORDER BY Supplier_ID")
    result = cursor.fetchall()
    cursor.close(); conn.close()
    return result


def get_supplier_by_id(sid):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Supplier WHERE Supplier_ID = %s", (sid,))
    result = cursor.fetchone()
    cursor.close(); conn.close()
    return result


def create_supplier(data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO supplier (Supplier_ID, Phone_No, Area, Image_URL) VALUES (%s,%s,%s,%s)",
        (data["Supplier_ID"], data["Phone_No"], data["Area"], data.get("Image_URL")),
    )
    conn.commit()
    cursor.close(); conn.close()
    return data["Supplier_ID"]


def update_supplier(sid, data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE supplier SET Phone_No=%s, Area=%s, Image_URL=%s WHERE Supplier_ID=%s",
        (data["Phone_No"], data["Area"], data.get("Image_URL"), sid),
    )
    conn.commit()
    rows = cursor.rowcount
    cursor.close(); conn.close()
    return rows


def delete_supplier(sid):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Supplier WHERE Supplier_ID = %s", (sid,))
    conn.commit()
    rows = cursor.rowcount
    cursor.close(); conn.close()
    return rows