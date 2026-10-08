# ============================================================
# models/users.py — User Data Access Object
# Handles user registration, authentication, hashing & profile lookup
# ============================================================

from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from models.db import get_db

def create_user(email, password, full_name, role="user"):
    """Registers a new user with hashed password."""
    email = email.lower().strip()
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # Check if user exists
    cursor.execute("SELECT User_ID FROM users WHERE LOWER(Email) = %s", (email,))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        raise ValueError("User with this email already exists.")

    pwd_hash = generate_password_hash(password)
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute(
        "INSERT INTO users (Email, Password_Hash, Full_Name, Role, Created_At) VALUES (%s, %s, %s, %s, %s)",
        (email, pwd_hash, full_name, role, created_at)
    )
    user_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()

    return {
        "user_id": user_id,
        "email": email,
        "full_name": full_name,
        "role": role,
        "created_at": created_at
    }

def authenticate_user(email, password):
    """Validates user credentials against hashed password."""
    email = email.lower().strip()
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT User_ID, Email, Password_Hash, Full_Name, Role, Created_At FROM users WHERE LOWER(Email) = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user:
        return None

    if check_password_hash(user['Password_Hash'], password):
        return {
            "user_id": user['User_ID'],
            "email": user['Email'],
            "full_name": user['Full_Name'],
            "role": user['Role'],
            "created_at": user['Created_At']
        }
    return None

def get_user_by_id(user_id):
    """Fetches user details by user ID."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT User_ID, Email, Full_Name, Role, Created_At FROM users WHERE User_ID = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if user:
        return {
            "user_id": user['User_ID'],
            "email": user['Email'],
            "full_name": user['Full_Name'],
            "role": user['Role'],
            "created_at": user['Created_At']
        }
    return None

def get_all_users_count():
    """Returns total count of registered users."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT COUNT(*) AS total FROM users")
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if row:
        return row.get('total', 0) if isinstance(row, dict) else row[0]
    return 0
