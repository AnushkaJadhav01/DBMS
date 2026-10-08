# ============================================================
# app.py — Flask Application Entry Point
# Vercel-compatible: exposes `app` at module level for WSGI
# Registers all Blueprints (DBMS + ML + Auth + Admin + History)
# and serves the Frontend Single-Page Application (SPA)
# ============================================================

import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import SECRET_KEY, DEBUG

# Import route blueprints
from routes.dashboard import dashboard_bp
from routes.suppliers import suppliers_bp
from routes.products import products_bp
from routes.customers import customers_bp
from routes.orders import orders_bp
from routes.shipments import shipments_bp
from routes.payments import payments_bp
from routes.config import config_bp
from routes.ml_routes import ml_bp
from routes.auth import auth_bp
from routes.history_routes import history_bp
from routes.admin_routes import admin_bp

# Determine static folder path (works both locally and on Vercel)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static"),
    static_url_path="/static"
)
app.secret_key = SECRET_KEY
CORS(app, supports_credentials=True)

# Register all blueprints under /api prefix
app.register_blueprint(dashboard_bp, url_prefix="/api")
app.register_blueprint(suppliers_bp, url_prefix="/api")
app.register_blueprint(products_bp, url_prefix="/api")
app.register_blueprint(customers_bp, url_prefix="/api")
app.register_blueprint(orders_bp, url_prefix="/api")
app.register_blueprint(shipments_bp, url_prefix="/api")
app.register_blueprint(payments_bp, url_prefix="/api")
app.register_blueprint(config_bp, url_prefix="/api")
app.register_blueprint(ml_bp, url_prefix="/api")
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(history_bp, url_prefix="/api")
app.register_blueprint(admin_bp, url_prefix="/api")

# Auto-setup DB and seed users on first cold start (safe — checks before inserting)
def _ensure_db():
    try:
        from setup_db import setup_database
        setup_database()
    except Exception:
        pass

_ensure_db()

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    """Serve the SPA index.html for all non-API, non-static routes."""
    static_file = os.path.join(BASE_DIR, "static", path)
    if path and os.path.isfile(static_file):
        return send_from_directory(os.path.join(BASE_DIR, "static"), path)
    return send_from_directory(os.path.join(BASE_DIR, "templates"), "index.html")


if __name__ == "__main__":
    print("=" * 60)
    print("ColdChain OSMS — ML Prediction & Logistics Platform")
    print("Running at http://localhost:5000")
    print("=" * 60)
    app.run(debug=DEBUG, port=5000, use_reloader=False)
