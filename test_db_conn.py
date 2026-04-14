import mysql.connector
import sys
import os

# Add the current directory to sys.path so we can import config
sys.path.append(os.getcwd())

from config import DB_CONFIG

def test_connection():
    try:
        # Try connecting to MySQL server (without database first)
        base_config = DB_CONFIG.copy()
        db_name = base_config.pop('database', None)
        
        conn = mysql.connector.connect(**base_config)
        print("✅ Successfully connected to MySQL server.")
        
        cursor = conn.cursor()
        cursor.execute("SHOW DATABASES")
        databases = [db[0] for db in cursor.fetchall()]
        
        if db_name in databases:
            print(f"✅ Database '{db_name}' exists.")
        else:
            print(f"❌ Database '{db_name}' does not exist.")
            
        conn.close()
    except mysql.connector.Error as err:
        print(f"❌ Connection failed: {err}")

if __name__ == "__main__":
    test_connection()
