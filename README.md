# Expense Tracker API

Small Express and PostgreSQL backend for tracking expenses.

## Features

- Create an expense
- List expenses
- Filter expenses by category and date range
- View one expense
- Update an expense
- Delete an expense
- Get a simple expense summary

## Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Use these values and put your real password in `DB_PASSWORD`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_tracker
DB_USER=expense_user
DB_PASSWORD=your_real_password
```

If table setup fails with a schema permission error, open pgAdmin, select the `expense_tracker` database, open Query Tool, and run:

```sql
GRANT ALL ON SCHEMA public TO expense_user;
```

Create the expenses table:

```bash
npm run db:setup
```

Start the server:

```bash
npm run dev
```

## Endpoints

Health check:

```http
GET /health
```

List expenses:

```http
GET /api/expenses
```

Filter expenses:

```http
GET /api/expenses?category=Food&from=2026-05-01&to=2026-05-31
```

Get summary:

```http
GET /api/expenses/summary
```

Create expense:

```http
POST /api/expenses
Content-Type: application/json

{
  "title": "Lunch",
  "amount": 150.50,
  "category": "Food",
  "expense_date": "2026-05-13",
  "notes": "Meal after class"
}
```

Update expense:

```http
PUT /api/expenses/1
Content-Type: application/json

{
  "amount": 175
}
```

Delete expense:

```http
DELETE /api/expenses/1
```
