# ============================================================
# app.py — Flask Application Entry Point
# Registers all blueprints and serves the frontend SPA
# ============================================================

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

app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = SECRET_KEY
CORS(app)  # Allow cross-origin requests

# Register all blueprints under /api prefix
app.register_blueprint(dashboard_bp, url_prefix="/api")
app.register_blueprint(suppliers_bp, url_prefix="/api")
app.register_blueprint(products_bp, url_prefix="/api")
app.register_blueprint(customers_bp, url_prefix="/api")
app.register_blueprint(orders_bp, url_prefix="/api")
app.register_blueprint(shipments_bp, url_prefix="/api")
app.register_blueprint(payments_bp, url_prefix="/api")
app.register_blueprint(config_bp, url_prefix="/api")


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    """Serve the single-page application for all non-API routes."""
    return send_from_directory("templates", "index.html")


if __name__ == "__main__":
    print("Starting ColdChain OSMS at http://localhost:5000")
    app.run(debug=DEBUG, port=5000)
