# backend/seed.py
from app import create_app
from app.extensions import db
from app.models import Business, User, Product, Sale, Expense, Customer, Supplier, Employee, Leakage, Notification
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta


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
        db.session.commit()

        user = User(
            name="Demo User",
            email="demo@pesawatch.co.ke",
            password_hash=generate_password_hash("Demo@12345"),
            business_id=business.id,
        )
        db.session.add(user)
        db.session.commit()

        products = [
            Product(business_id=business.id, name="Coca-Cola 500ml", sku="CC-500", category="Drinks", supplier="ABC Distributors", purchase_price=55, selling_price=80, quantity=84, reorder_level=30, expiry_date=datetime.utcnow() + timedelta(days=140)),
            Product(business_id=business.id, name="Unga 2kg", sku="UNG-2", category="Groceries", supplier="Boresha Foods", purchase_price=210, selling_price=250, quantity=42, reorder_level=25, expiry_date=datetime.utcnow() + timedelta(days=200)),
            Product(business_id=business.id, name="Bread", sku="BRD-1", category="Bakery", supplier="Fresh Bakery", purchase_price=100, selling_price=140, quantity=31, reorder_level=20, expiry_date=datetime.utcnow() + timedelta(days=4)),
            Product(business_id=business.id, name="Milk 500ml", sku="MLK-500", category="Dairy", supplier="Kiboko Dairy", purchase_price=65, selling_price=90, quantity=39, reorder_level=20, expiry_date=datetime.utcnow() + timedelta(days=18)),
            Product(business_id=business.id, name="Sugar 1kg", sku="SUG-1", category="Groceries", supplier="Amani Foods", purchase_price=150, selling_price=190, quantity=52, reorder_level=20, expiry_date=datetime.utcnow() + timedelta(days=180)),
            Product(business_id=business.id, name="Cooking Oil 1L", sku="OIL-1", category="Groceries", supplier="Nile Supplies", purchase_price=260, selling_price=330, quantity=18, reorder_level=25, expiry_date=datetime.utcnow() + timedelta(days=75)),
        ]
        db.session.add_all(products)

        employee = Employee(business_id=business.id, name="Amina Hassan", position="Sales Associate", phone="0700001234", status="Active")
        db.session.add(employee)

        customer = Customer(
            business_id=business.id,
            name="Ahmed Traders",
            phone="0712345678",
            amount=8400,
            paid=0,
            balance=8400,
            due_date=datetime.utcnow() - timedelta(days=8),
            status="Overdue",
        )
        db.session.add(customer)

        supplier = Supplier(
            business_id=business.id,
            name="ABC Distributors",
            contact_person="John Njoroge",
            phone="0723456789",
            previous_average_price=2450,
            current_average_price=2730,
            price_increase=11.4,
        )
        db.session.add(supplier)

        for month in ["January", "February", "March", "April", "May", "June", "July", "August", "September"]:
            db.session.add(Sale(
                business_id=business.id,
                invoice_no=f"INV-{month[:3].upper()}-001",
                date=datetime.utcnow() - timedelta(days=30 + len(month)),
                customer_name="General",
                payment_method="M-Pesa",
                amount=42000 + len(month) * 1000,
                discount=0,
                employee_id=employee.id,
                status="Paid",
            ))

        db.session.add(Expense(
            business_id=business.id,
            category="Rent",
            description="Shop rent",
            amount=28000,
            payment_method="Bank",
            recorded_by="Demo User",
            date=datetime.utcnow() - timedelta(days=12),
        ))
        db.session.add(Expense(
            business_id=business.id,
            category="Electricity",
            description="Power bill",
            amount=6800,
            payment_method="M-Pesa",
            recorded_by="Demo User",
            date=datetime.utcnow() - timedelta(days=8),
        ))

        db.session.add(Leakage(
            business_id=business.id,
            title="Cash discrepancy",
            leakage_type="Cash Variance",
            risk_level="Medium",
            amount=5600,
            expected_value=84500,
            actual_value=78900,
            status="Investigating",
            notes="Difference between recorded and expected cash."
        ))

        db.session.add(Leakage(
            business_id=business.id,
            title="Stock discrepancy",
            leakage_type="Inventory Variance",
            risk_level="Warning",
            amount=5600,
            expected_value=52400,
            actual_value=46800,
            status="Open",
            notes="Expected stock value higher than recorded stock."
        ))

        db.session.add(Notification(
            business_id=business.id,
            title="Cash variance detected today",
            message="KSh 5,600 variance detected between expected and actual cash.",
            type="cash",
            read=False,
        ))
        db.session.add(Notification(
            business_id=business.id,
            title="Supplier prices increased",
            message="ABC Distributors increased costs by 11.4%.",
            type="supplier",
            read=False,
        ))

        db.session.commit()
        print("Seed data created successfully.")


if __name__ == "__main__":
    seed_data()
