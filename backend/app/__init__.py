from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, jwt
from .routes.auth import auth_bp
from .routes.business import business_bp
from .routes.dashboard import dashboard_bp
from .routes.sales import sales_bp
from .routes.inventory import inventory_bp
from .routes.expenses import expenses_bp
from .routes.customers import customers_bp
from .routes.suppliers import suppliers_bp
from .routes.employees import employees_bp
from .routes.leakage import leakage_bp
from .routes.reports import reports_bp
from .routes.notifications import notifications_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": app.config["FRONTEND_URL"]}})

    with app.app_context():
        db.create_all()

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(business_bp, url_prefix="/api")
    app.register_blueprint(dashboard_bp, url_prefix="/api")
    app.register_blueprint(sales_bp, url_prefix="/api")
    app.register_blueprint(inventory_bp, url_prefix="/api")
    app.register_blueprint(expenses_bp, url_prefix="/api")
    app.register_blueprint(customers_bp, url_prefix="/api")
    app.register_blueprint(suppliers_bp, url_prefix="/api")
    app.register_blueprint(employees_bp, url_prefix="/api")
    app.register_blueprint(leakage_bp, url_prefix="/api")
    app.register_blueprint(reports_bp, url_prefix="/api")
    app.register_blueprint(notifications_bp, url_prefix="/api")

    @app.get("/api/health")
    def health():
        return {"success": True, "message": "PesaWatch backend is running."}

    @app.errorhandler(404)
    def not_found(error):
        return {"success": False, "message": "Resource not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {"success": False, "message": "Internal server error"}, 500

    return app
