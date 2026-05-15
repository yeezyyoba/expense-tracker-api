CREATE TABLE IF NOT EXISTS recurring_expenses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(80) NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(80) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  recurring_expense_id INTEGER REFERENCES recurring_expenses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS recurring_expense_id INTEGER REFERENCES recurring_expenses(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS income (
  id SERIAL PRIMARY KEY,
  source VARCHAR(120) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(80) NOT NULL,
  income_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses (expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_recurring_expense_id ON expenses (recurring_expense_id);
CREATE INDEX IF NOT EXISTS idx_income_category ON income (category);
CREATE INDEX IF NOT EXISTS idx_income_income_date ON income (income_date);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_category ON recurring_expenses (category);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_next_due_date ON recurring_expenses (next_due_date);
