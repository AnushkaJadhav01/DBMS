from models.db import get_db

def get_config(key, default=None):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT Config_Value FROM system_config WHERE Config_Key = %s", (key,))
    result = cursor.fetchone()
    cursor.close(); conn.close()
    return result["Config_Value"] if result else default

def set_config(key, value):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO system_config (Config_Key, Config_Value) VALUES (%s, %s) ON DUPLICATE KEY UPDATE Config_Value = %s",
        (key, value, value)
    )
    conn.commit()
    cursor.close(); conn.close()
    return True
