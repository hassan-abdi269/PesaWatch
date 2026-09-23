"""
Notification engine.

Scans business data and writes Notification rows for anything that needs
attention. Designed to be idempotent *within a day*: running it twice on the
same day will not create duplicate notifications for the same condition.

Usage:
    from app.services.notification_engine import run_all_checks
    created = run_all_checks(business_id)
"""
from datetime import datetime, timedelta
from collections import defaultdict

from app.extensions import db
from app.models import (
    Product, Sale, Expense, Customer, Supplier, Notification, Employee,
)


# ---------------------------------------------------------------
# Tunable thresholds — later, read these from BusinessSetting
# ---------------------------------------------------------------
LOW_STOCK_DAYS = 14                # expiring within N days
OVERDUE_ESCALATION_DAYS = 30       # days past due → higher severity
SUPPLIER_PRICE_HIKE_PCT = 10.0     # %
SINGLE_DISCOUNT_PCT = 20.0         # single sale discount > 20% of amount
TOTAL_DISCOUNT_PCT = 15.0          # total discounts > 15% of revenue (30d)
EXPENSE_SPIKE_MULTIPLIER = 2.0     # category this month > 2× prior 3-month avg
SALES_DROP_PCT = 50.0              # today's sales < 50% of daily avg → notice
EMPLOYEE_DISCOUNT_MULT = 3.0       # employee discount rate > 3× average


# ---------------------------------------------------------------
# Dedup helper — avoid re-notifying on the same condition the same day
# ---------------------------------------------------------------
def _already_notified_today(business_id, title):
    start_of_day = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return (
        Notification.query
        .filter(
            Notification.business_id == business_id,
            Notification.title == title,
            Notification.created_at >= start_of_day,
        )
        .first()
        is not None
    )


def _add(business_id, title, message, ntype="info"):
    """Insert a Notification only if one with the same title wasn't created
    earlier today. Returns True if a row was created."""
    if _already_notified_today(business_id, title):
        return False
    db.session.add(Notification(
        business_id=business_id,
        title=title,
        message=message,
        type=ntype,
    ))
    return True


# ---------------------------------------------------------------
# Individual checks — each returns the number of notifications created
# ---------------------------------------------------------------

def check_low_stock(business_id):
    created = 0
    products = Product.query.filter_by(business_id=business_id).all()

    for p in products:
        qty = int(p.quantity or 0)
        reorder = int(p.reorder_level or 0)
        if qty == 0:
            if _add(business_id,
                    f"Out of stock: {p.name}",
                    f"{p.name} ({p.sku}) is out of stock. Reorder level was "
                    f"{reorder}. Restock before you lose sales.",
                    "stock"):
                created += 1
        elif reorder > 0 and qty <= reorder:
            if _add(business_id,
                    f"Low stock: {p.name}",
                    f"{p.name} ({p.sku}) is at {qty} units, at or below the "
                    f"reorder level of {reorder}.",
                    "stock"):
                created += 1

    return created


def check_expiring_stock(business_id):
    created = 0
    cutoff = datetime.utcnow() + timedelta(days=LOW_STOCK_DAYS)
    products = (Product.query
                .filter(Product.business_id == business_id,
                        Product.expiry_date.isnot(None),
                        Product.expiry_date <= cutoff,
                        Product.expiry_date >= datetime.utcnow(),
                        Product.quantity > 0)
                .all())

    for p in products:
        days = (p.expiry_date - datetime.utcnow()).days
        if _add(business_id,
                f"Expiring soon: {p.name}",
                f"{p.name} ({p.sku}) expires in {days} day(s). "
                f"{p.quantity} units still in stock — consider discounting or returning.",
                "stock"):
            created += 1

    return created


def check_customer_credit(business_id):
    created = 0
    now = datetime.utcnow()
    customers = (Customer.query
                 .filter(Customer.business_id == business_id,
                         Customer.balance > 0)
                 .all())

    for c in customers:
        if not c.due_date or c.due_date >= now:
            continue
        days = (now - c.due_date).days
        balance = float(c.balance or 0)

        if days >= OVERDUE_ESCALATION_DAYS:
            if _add(business_id,
                    f"Severely overdue: {c.name}",
                    f"{c.name} owes KSh {balance:,.2f}, overdue by {days} days. "
                    f"Escalate collection — this is at risk of becoming a loss.",
                    "credit"):
                created += 1
        else:
            if days == 0:
                when = "today"
            elif days == 1:
                when = "yesterday"
            else:
                when = f"{days} days ago"
            if _add(business_id,
                    f"Overdue: {c.name}",
                    f"{c.name} owes KSh {balance:,.2f} — due {when}.",
                    "credit"):
                created += 1

    return created


def check_supplier_prices(business_id):
    created = 0
    suppliers = Supplier.query.filter_by(business_id=business_id).all()

    for s in suppliers:
        pct = float(s.price_increase or 0)
        if pct >= SUPPLIER_PRICE_HIKE_PCT:
            if _add(business_id,
                    f"Supplier price hike: {s.name}",
                    f"{s.name} raised average prices by {pct:.1f}% "
                    f"(KSh {s.previous_average_price:,.2f} → "
                    f"KSh {s.current_average_price:,.2f}). "
                    f"Review margins or alternatives.",
                    "supplier"):
                created += 1

    return created


def check_discount_abuse(business_id):
    created = 0
    cutoff = datetime.utcnow() - timedelta(days=30)
    sales = (Sale.query
             .filter(Sale.business_id == business_id,
                     Sale.date >= cutoff)
             .all())

    # Per-sale high discount
    for s in sales:
        amt = float(s.amount or 0)
        disc = float(s.discount or 0)
        if amt > 0 and (disc / amt) * 100 > SINGLE_DISCOUNT_PCT:
            pct = (disc / amt) * 100
            if _add(business_id,
                    f"High discount on {s.invoice_no}",
                    f"Invoice {s.invoice_no}: {pct:.1f}% discount "
                    f"(KSh {disc:,.2f} off KSh {amt:,.2f}).",
                    "cash"):
                created += 1

    # Aggregate 30-day discount rate
    total_amt = sum(float(s.amount or 0) for s in sales)
    total_disc = sum(float(s.discount or 0) for s in sales)
    if total_amt > 0:
        pct = (total_disc / total_amt) * 100
        if pct > TOTAL_DISCOUNT_PCT:
            if _add(business_id,
                    "High aggregate discounts",
                    f"Discounts over the last 30 days are {pct:.1f}% of revenue "
                    f"(KSh {total_disc:,.2f} on KSh {total_amt:,.2f}).",
                    "cash"):
                created += 1

    return created


def check_employee_discount_rate(business_id):
    """Flag an employee whose discount rate is far above the business average."""
    created = 0
    cutoff = datetime.utcnow() - timedelta(days=30)
    sales = (Sale.query
             .filter(Sale.business_id == business_id,
                     Sale.date >= cutoff,
                     Sale.employee_id.isnot(None))
             .all())
    if not sales:
        return 0

    by_emp_amt = defaultdict(float)
    by_emp_disc = defaultdict(float)
    for s in sales:
        by_emp_amt[s.employee_id] += float(s.amount or 0)
        by_emp_disc[s.employee_id] += float(s.discount or 0)

    total_amt = sum(by_emp_amt.values())
    total_disc = sum(by_emp_disc.values())
    if total_amt <= 0:
        return 0
    avg_rate = total_disc / total_amt
    if avg_rate <= 0:
        return 0

    for emp_id, amt in by_emp_amt.items():
        if amt <= 0:
            continue
        rate = by_emp_disc[emp_id] / amt
        if rate > avg_rate * EMPLOYEE_DISCOUNT_MULT:
            emp = Employee.query.get(emp_id)
            name = emp.name if emp else f"Employee #{emp_id}"
            if _add(business_id,
                    f"High discount rate: {name}",
                    f"{name}'s discount rate is {rate*100:.1f}% over the last "
                    f"30 days, vs a business average of {avg_rate*100:.1f}%. "
                    f"Worth a review.",
                    "cash"):
                created += 1

    return created


def check_expense_spikes(business_id):
    """Compare this calendar month's spend per category to the prior
    3-month average. Flag big jumps."""
    created = 0
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    three_months_ago = month_start - timedelta(days=90)

    expenses = (Expense.query
                .filter(Expense.business_id == business_id,
                        Expense.date >= three_months_ago)
                .all())

    current = defaultdict(float)
    prior = defaultdict(float)
    for e in expenses:
        amt = float(e.amount or 0)
        cat = e.category or "Other"
        if e.date and e.date >= month_start:
            current[cat] += amt
        else:
            prior[cat] += amt

    for cat, this_month in current.items():
        prior_total = prior.get(cat, 0.0)
        if prior_total <= 0:
            continue
        prior_avg = prior_total / 3.0  # rough 3-month average
        if this_month > prior_avg * EXPENSE_SPIKE_MULTIPLIER:
            if _add(business_id,
                    f"Expense spike: {cat}",
                    f"{cat} spend this month is KSh {this_month:,.2f}, "
                    f"over {EXPENSE_SPIKE_MULTIPLIER}× the 3-month average of "
                    f"KSh {prior_avg:,.2f}.",
                    "info"):
                created += 1

    return created


def check_sales_drop(business_id):
    """Compare today's sales to the 30-day daily average."""
    created = 0
    now = datetime.utcnow()
    cutoff = now - timedelta(days=30)

    sales = (Sale.query
             .filter(Sale.business_id == business_id,
                     Sale.date >= cutoff)
             .all())
    if not sales:
        return 0

    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_total = sum(float(s.amount or 0) for s in sales if s.date >= today_start)
    total_30 = sum(float(s.amount or 0) for s in sales)

    daily_avg = total_30 / 30.0
    if daily_avg <= 0:
        return 0

    # Only alert if it's genuinely a drop and it's late enough in the day
    if now.hour < 15:
        return 0

    pct_of_avg = (today_total / daily_avg) * 100
    if pct_of_avg < SALES_DROP_PCT:
        if _add(business_id,
                "Sales unusually low today",
                f"Today's sales (KSh {today_total:,.2f}) are only "
                f"{pct_of_avg:.0f}% of your 30-day daily average of "
                f"KSh {daily_avg:,.2f}.",
                "info"):
            created += 1

    return created


# ---------------------------------------------------------------
# Entry point — run every check, commit, return count
# ---------------------------------------------------------------
def run_all_checks(business_id):
    created = 0
    created += check_low_stock(business_id)
    created += check_expiring_stock(business_id)
    created += check_customer_credit(business_id)
    created += check_supplier_prices(business_id)
    created += check_discount_abuse(business_id)
    created += check_employee_discount_rate(business_id)
    created += check_expense_spikes(business_id)
    created += check_sales_drop(business_id)

    db.session.commit()
    return created