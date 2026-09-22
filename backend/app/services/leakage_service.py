from datetime import datetime


def calculate_cash_variance(expected_cash, actual_cash):
    return abs(expected_cash - actual_cash)


def calculate_inventory_variance(expected_qty, actual_qty, unit_cost):
    return max(0, expected_qty - actual_qty) * unit_cost


def calculate_overdue_credit(balance, due_date):
    if balance <= 0:
        return 0
    if due_date and due_date.date() < datetime.utcnow().date():
        return float(balance)
    return 0


def calculate_supplier_price_increase(previous_price, current_price):
    if previous_price in (None, 0):
        return 0
    return ((current_price - previous_price) / previous_price) * 100


def calculate_discount_variance(original_price, selling_price):
    return max(0, original_price - selling_price)
