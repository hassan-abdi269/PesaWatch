from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models import Business, User, Employee, Product, Sale, Expense, Customer, Supplier, Leakage, Notification


def seed_data():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        business = Business(
            name="Mwangaza Mini-Mart",
            business_type="Mini-Mart",
            location="Garissa, Kenya",
            employees=12,
            average_monthly_revenue=428650,
            payment_methods="Cash, M-Pesa, Bank, Card",
            currency="KES",
        )
        db.session.add(business)
        db.session.flush()

        user = User(
            name="Demo User",
            email="demo@pesawatch.co.ke",
            password_hash=generate_password_hash("Demo@12345"),
            business_id=business.id,
        )
        employee = Employee(
            business_id=business.id,
            name="Amina Hassan",
            position="Sales Associate",
            phone="0700001234",
            status="Active",
        )
        db.session.add_all([user, employee])
        db.session.flush()

        products = [
            ("Coca-Cola 500ml", "CC-500", "Drinks", "ABC Distributors", 55, 80, 84, 30, 140),
            ("Unga 2kg", "UNG-2", "Groceries", "Boresha Foods", 210, 250, 42, 25, 200),
            ("Bread", "BRD-1", "Bakery", "Fresh Bakery", 100, 140, 31, 20, 4),
            ("Milk 500ml", "MLK-500", "Dairy", "Kiboko Dairy", 65, 90, 39, 20, 18),
            ("Sugar 1kg", "SUG-1", "Groceries", "Amani Foods", 150, 190, 52, 20, 180),
            ("Cooking Oil 1L", "OIL-1", "Groceries", "Nile Supplies", 260, 330, 18, 25, 75),
            ("Rice 2kg", "RIC-2", "Groceries", "Boresha Foods", 280, 350, 27, 15, 250),
            ("Water 1L", "WAT-1", "Drinks", "ABC Distributors", 30, 50, 64, 25, 365),
        ]
        for name, sku, category, supplier, purchase, selling, quantity, reorder, expiry_days in products:
            db.session.add(Product(
                business_id=business.id, name=name, sku=sku, category=category,
                supplier=supplier, purchase_price=purchase, selling_price=selling,
                quantity=quantity, reorder_level=reorder,
                expiry_date=datetime.utcnow() + timedelta(days=expiry_days),
            ))

        db.session.add(Customer(
            business_id=business.id, name="Ahmed Traders", phone="0712345678",
            amount=8400, paid=0, balance=8400,
            due_date=datetime.utcnow() - timedelta(days=8), status="Overdue",
        ))
        db.session.add(Supplier(
            business_id=business.id, name="ABC Distributors", contact_person="John Njoroge",
            phone="0723456789", previous_average_price=2450,
            current_average_price=2730, price_increase=11.4,
        ))

        monthly_amounts = [42000, 45000, 48000, 51000, 56000, 62000, 70000, 78000, 76550]
        for index, amount in enumerate(monthly_amounts):
            db.session.add(Sale(
                business_id=business.id, invoice_no=f"INV-{index + 1:04d}",
                date=datetime.utcnow() - timedelta(days=(8 - index) * 20),
                customer_name="Walk-in customers", payment_method=("Cash" if index % 2 == 0 else "M-Pesa"),
                amount=amount, discount=0, employee_id=employee.id, status="Paid",
            ))
        for category, description, amount, method in [
            ("Rent", "Shop rent", 28000, "Bank"),
            ("Electricity", "Power bill", 6800, "M-Pesa"),
            ("Transport", "Supplier deliveries", 4500, "Cash"),
            ("Supplies", "Packaging and stationery", 2300, "Cash"),
        ]:
            db.session.add(Expense(
                business_id=business.id, category=category, description=description,
                amount=amount, payment_method=method, recorded_by=user.name,
            ))

        db.session.add_all([
            Leakage(
                business_id=business.id, title="Cash discrepancy", leakage_type="Cash Variance",
                risk_level="Medium", amount=5600, expected_value=84500, actual_value=78900,
                status="Investigating", notes="Review cash-up records and M-Pesa reconciliation.",
            ),
            Leakage(
                business_id=business.id, title="Stock discrepancy", leakage_type="Inventory Variance",
                risk_level="Warning", amount=5600, expected_value=52400, actual_value=46800,
                status="Open", notes="Compare physical count with recorded stock movements.",
            ),
        ])
        db.session.add_all([
            Notification(
                business_id=business.id, title="Cash variance detected today",
                message="KSh 5,600 variance detected between expected and actual cash.", type="cash",
            ),
            Notification(
                business_id=business.id, title="Customer credit is overdue",
                message="Ahmed Traders has KSh 8,400 outstanding past the due date.", type="credit",
            ),
        ])
        db.session.commit()
        print("Seed data created successfully.")


if __name__ == "__main__":
    seed_data()
