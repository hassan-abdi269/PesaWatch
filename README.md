# README.md
# PesaWatch KE

PesaWatch KE is a Kenyan small-business financial leakage detection and business intelligence platform built to help business owners identify hidden operational, cash, stock, and credit leakages before they become serious losses.

## Features

- Premium SaaS landing page
- JWT-based authentication
- Business setup and management
- Sales, expenses, inventory, and customers tracking
- Potential leakage detection engine
- Investigation workflows and notifications
- Reports with CSV export support
- Responsive dashboard and mobile navigation
- SQLite-ready data layer with MySQL upgrade path

## Tech stack

- React + Vite + Tailwind CSS
- Flask + Flask-SQLAlchemy + Flask-JWT-Extended
- SQLite for development
- Recharts and Lucide React
- Axios for API calls

## Installation

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py
python run.py
```

## Environment variables

Copy the example files and fill in your environment values.

### Backend

```bash
cd backend
cp .env.example .env
```

### Frontend

```bash
cd frontend
cp .env.example .env
```

## Demo account

- Email: demo@pesawatch.co.ke
- Password: Demo@12345

This account is for local development only.

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard/summary`
- `GET /api/leakage`
- `POST /api/leakage/run-detection`
- `GET /api/inventory`
- `GET /api/reports/leakage`
- `GET /api/notifications`

## Database

The project uses SQLite in development for quick setup and local testing. The SQLAlchemy setup is designed to remain compatible with MySQL in production with a simple configuration change.

