# models/shipments.py — Real Schema: Shipment_ID, Shipment_Date, Order_ID, Quantity, Tracking_Number
from models.db import get_db

def get_all_shipments(search=None):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        base = "SELECT * FROM shipment"
        params = []
        if search:
            base += " WHERE Shipment_ID LIKE %s OR Order_ID LIKE %s OR Tracking_Number LIKE %s"
            params += [f"%{search}%", f"%{search}%", f"%{search}%"]
        base += " ORDER BY Shipment_ID DESC"
        cursor.execute(base, params)
        result = cursor.fetchall()
    except Exception:
        result = []
    cursor.close(); conn.close()
    return result

def get_shipment_by_id(sid):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM shipment WHERE Shipment_ID = %s", (sid,))
    result = cursor.fetchone()
    cursor.close(); conn.close()
    return result

def create_shipment(data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO shipment (Shipment_Date, Order_ID, Quantity, Tracking_Number, Image_URL) VALUES (%s,%s,%s,%s,%s)",
        (data["Shipment_Date"], data["Order_ID"], data.get("Quantity",1), data.get("Tracking_Number"), data.get("Image_URL")),
    )
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close(); conn.close()
    return new_id

def update_shipment(sid, data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE shipment SET Shipment_Date=%s, Order_ID=%s, Quantity=%s, Tracking_Number=%s, Image_URL=%s WHERE Shipment_ID=%s",
        (data["Shipment_Date"], data["Order_ID"], data.get("Quantity",1), data.get("Tracking_Number"), data.get("Image_URL"), sid),
    )
    conn.commit()
    rows = cursor.rowcount
    cursor.close(); conn.close()
    return rows

def delete_shipment(sid):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM shipment WHERE Shipment_ID = %s", (sid,))
    conn.commit()
    rows = cursor.rowcount
    cursor.close(); conn.close()
    return rows
