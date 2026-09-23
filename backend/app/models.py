from datetime import datetime
from .extensions import db


class Business(db.Model):
    __tablename__ = "businesses"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    business_type = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    employees = db.Column(db.Integer, default=1)
    average_monthly_revenue = db.Column(db.Float, default=0)
    payment_methods = db.Column(db.String(200), default="Cash, M-Pesa")
    currency = db.Column(db.String(20), default="KES")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users = db.relationship("User", backref="business", lazy=True)
    products = db.relationship("Product", backref="business", lazy=True)
    sales = db.relationship("Sale", backref="business", lazy=True)
    expenses = db.relationship("Expense", backref="business", lazy=True)
    customers = db.relationship("Customer", backref="business", lazy=True)
    suppliers = db.relationship("Supplier", backref="business", lazy=True)
    employee_records = db.relationship("Employee", backref="business", lazy=True)
    leakages = db.relationship("Leakage", backref="business", lazy=True)
    notifications = db.relationship("Notification", backref="business", lazy=True)


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Employee(db.Model):
    __tablename__ = "employees"
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    position = db.Column(db.String(200), default="Staff")
    phone = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(50), default="Active")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sales = db.relationship("Sale", backref="employee", lazy=True)


class Product(db.Model):
    __tablename__ = "products"
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    sku = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    supplier = db.Column(db.String(200), nullable=True)
    purchase_price = db.Column(db.Float, default=0)
    selling_price = db.Column(db.Float, default=0)
    quantity = db.Column(db.Integer, default=0)
    reorder_level = db.Column(db.Integer, default=0)
    expiry_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    sale_items = db.relationship("SaleItem", backref="product", lazy=True)


class Sale(db.Model):
    __tablename__ = "sales"
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"), nullable=True)
    employee_id = db.Column(db.Integer, db.ForeignKey("employees.id"), nullable=True)

    invoice_no = db.Column(db.String(100), nullable=False, unique=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    customer_name = db.Column(db.String(200), default="Walk-in")
    payment_method = db.Column(db.String(50), default="Cash")

    amount = db.Column(db.Float, default=0)      # gross before discount
    discount = db.Column(db.Float, default=0)
    status = db.Column(db.String(50), default="Paid")   # Paid | Pending | Refunded

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = db.relationship("SaleItem", backref="sale", cascade="all, delete-orphan", lazy=True)


class SaleItem(db.Model):
    __tablename__ = "sale_items"
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey("sales.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=True)

    product_name = db.Column(db.String(200), nullable=False)
    quantity = db.Column(db.Float, default=1)
    unit_price = db.Column(db.Float, default=0)      # price actually charged
    cost_price = db.Column(db.Float, default=0)      # snapshot at time of sale
    line_total = db.Column(db.Float, default=0)      # quantity * unit_price - line discount
    line_discount = db.Column(db.Float, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Expense(db.Model):
    __tablename__ = "expenses"
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, default=0)
    payment_method = db.Column(db.String(50), default="Cash")
    recorded_by = db.Column(db.String(200), default="System")
    date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Customer(db.Model):
    __tablename__ = "customers"
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(50), nullable=True)
    amount = db.Column(db.Float, default=0)
    paid = db.Column(db.Float, default=0)
    balance = db.Column(db.Float, default=0)
    due_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(50), default="Open")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    sales = db.relationship("Sale", backref="customer", lazy=True)


class Supplier(db.Model):
    __tablename__ = "suppliers"
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    contact_person = db.Column(db.String(200), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    previous_average_price = db.Column(db.Float, default=0)
    current_average_price = db.Column(db.Float, default=0)
    price_increase = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Leakage(db.Model):
    __tablename__ = "leakages"
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    leakage_type = db.Column(db.String(100), nullable=False)
    risk_level = db.Column(db.String(50), default="Medium")
    amount = db.Column(db.Float, default=0)
    expected_value = db.Column(db.Float, default=0)
    actual_value = db.Column(db.Float, default=0)
    status = db.Column(db.String(50), default="Open")
    notes = db.Column(db.Text, default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Investigation(db.Model):
    __tablename__ = "investigations"
    id = db.Column(db.Integer, primary_key=True)
    leakage_id = db.Column(db.Integer, db.ForeignKey("leakages.id"), nullable=False)
    notes = db.Column(db.Text, default="")
    status = db.Column(db.String(50), default="Investigating")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Notification(db.Model):
    __tablename__ = "notifications"
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default="info")
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class MpesaTransaction(db.Model):
    __tablename__ = "mpesa_transactions"
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)
    transaction_code = db.Column(db.String(120), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    amount = db.Column(db.Float, default=0)
    phone = db.Column(db.String(50), nullable=True)
    reference = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class BusinessSetting(db.Model):
    __tablename__ = "business_settings"
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)
    currency = db.Column(db.String(20), default="KES")
    tax_rate = db.Column(db.Float, default=0)
    stock_alert_threshold = db.Column(db.Integer, default=15)
    supplier_price_threshold = db.Column(db.Float, default=10)
    expense_variance_threshold = db.Column(db.Float, default=5000)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
