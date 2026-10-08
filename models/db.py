# ============================================================
# models/db.py — Database connection helper
# Uses mysql-connector-python with SQLite fallback adapter
# ============================================================

import mysql.connector
import sqlite3
import os
from config import DB_CONFIG


class SQLiteCursorAdapter:
    def __init__(self, cursor, dictionary=False):
        self.cursor = cursor
        self.dictionary = dictionary
        self.lastrowid = None
        self.rowcount = -1

    def execute(self, query, params=None):
        sqlite_query = query.replace('%s', '?')
        if params is None:
            params = ()
        self.cursor.execute(sqlite_query, params)
        self.lastrowid = self.cursor.lastrowid
        self.rowcount = self.cursor.rowcount
        return self

    def fetchall(self):
        rows = self.cursor.fetchall()
        if self.dictionary and self.cursor.description:
            cols = [col[0] for col in self.cursor.description]
            return [dict(zip(cols, row)) for row in rows]
        return rows

    def fetchone(self):
        row = self.cursor.fetchone()
        if row is None:
            return None
        if self.dictionary and self.cursor.description:
            cols = [col[0] for col in self.cursor.description]
            return dict(zip(cols, row))
        return row

    def close(self):
        self.cursor.close()


class SQLiteConnAdapter:
    def __init__(self, conn):
        self.conn = conn

    def cursor(self, dictionary=False):
        return SQLiteCursorAdapter(self.conn.cursor(), dictionary=dictionary)

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()


_DB_MODE = None  # Cache 'mysql' or 'sqlite' mode once checked

def get_db():
    """Create and return a database connection (MySQL primary, SQLite fallback).
    On Vercel (read-only filesystem) /tmp is writable; locally use project root.
    """
    global _DB_MODE
    # Vercel has a read-only filesystem except /tmp
    if os.environ.get('VERCEL') or not os.access(os.path.dirname(os.path.dirname(__file__)), os.W_OK):
        db_path = "/tmp/coldchain.db"
    else:
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "coldchain.db")

    if _DB_MODE == 'sqlite':
        sqlite_conn = sqlite3.connect(db_path)
        return SQLiteConnAdapter(sqlite_conn)

    if _DB_MODE == 'mysql':
        try:
            return mysql.connector.connect(**DB_CONFIG)
        except Exception:
            _DB_MODE = 'sqlite'
            sqlite_conn = sqlite3.connect(db_path)
            return SQLiteConnAdapter(sqlite_conn)

    # First attempt: check MySQL with fast 1s timeout
    try:
        config = DB_CONFIG.copy()
        config["connection_timeout"] = 1
        conn = mysql.connector.connect(**config)
        _DB_MODE = 'mysql'
        return conn
    except Exception:
        _DB_MODE = 'sqlite'
        sqlite_conn = sqlite3.connect(db_path)
        return SQLiteConnAdapter(sqlite_conn)


