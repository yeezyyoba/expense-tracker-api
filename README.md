# Expense Tracker API

Small Express and PostgreSQL backend for tracking expenses.

## Features

- Create an expense
- List expenses
- Search and filter expenses by text, category, date range, and amount range
- View one expense
- Update an expense
- Delete an expense
- Get a simple expense summary
- Track recurring expenses and record occurrences
- Track income with summaries

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

Create the database tables:

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

Search and filter expenses:

```http
GET /api/expenses?q=lunch&minAmount=100&maxAmount=300&sortBy=amount&order=asc
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

List income:

```http
GET /api/income
```

Search and filter income:

```http
GET /api/income?q=salary&from=2026-05-01&to=2026-05-31
```

Get income summary:

```http
GET /api/income/summary
```

Create income:

```http
POST /api/income
Content-Type: application/json

{
  "source": "Salary",
  "amount": 25000,
  "category": "Work",
  "income_date": "2026-05-25",
  "notes": "Monthly pay"
}
```

Update income:

```http
PUT /api/income/1
Content-Type: application/json

{
  "amount": 26000
}
```

Delete income:

```http
DELETE /api/income/1
```

List recurring expenses:

```http
GET /api/recurring-expenses
```

List due recurring expenses:

```http
GET /api/recurring-expenses/due?to=2026-05-31
```

Create recurring expense:

```http
POST /api/recurring-expenses
Content-Type: application/json

{
  "title": "Internet bill",
  "amount": 1200,
  "category": "Utilities",
  "frequency": "monthly",
  "start_date": "2026-05-01",
  "next_due_date": "2026-06-01",
  "notes": "Home fiber"
}
```

Record one recurring expense occurrence:

```http
POST /api/recurring-expenses/1/record
```
