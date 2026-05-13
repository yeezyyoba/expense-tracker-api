const pool = require('../db/pool');

const allowedSortFields = {
  amount: 'amount',
  category: 'category',
  created_at: 'created_at',
  expense_date: 'expense_date',
  title: 'title'
};

function buildFilters(query) {
  const conditions = [];
  const values = [];

  if (query.category) {
    values.push(query.category);
    conditions.push(`category = $${values.length}`);
  }

  if (query.from) {
    values.push(query.from);
    conditions.push(`expense_date >= $${values.length}`);
  }

  if (query.to) {
    values.push(query.to);
    conditions.push(`expense_date <= $${values.length}`);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    values
  };
}

async function findAll(query = {}) {
  const { whereClause, values } = buildFilters(query);
  const sortBy = allowedSortFields[query.sortBy] || 'expense_date';
  const order = query.order && query.order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const result = await pool.query(
    `SELECT id, title, amount, category, expense_date, notes, created_at, updated_at
     FROM expenses
     ${whereClause}
     ORDER BY ${sortBy} ${order}, id DESC`,
    values
  );

  return result.rows;
}

async function findById(id) {
  const result = await pool.query(
    `SELECT id, title, amount, category, expense_date, notes, created_at, updated_at
     FROM expenses
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function create(expense) {
  const result = await pool.query(
    `INSERT INTO expenses (title, amount, category, expense_date, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, amount, category, expense_date, notes, created_at, updated_at`,
    [
      expense.title,
      expense.amount,
      expense.category,
      expense.expense_date,
      expense.notes || null
    ]
  );

  return result.rows[0];
}

async function update(id, expense) {
  const existing = await findById(id);

  if (!existing) {
    return null;
  }

  const updatedExpense = {
    title: expense.title ?? existing.title,
    amount: expense.amount ?? existing.amount,
    category: expense.category ?? existing.category,
    expense_date: expense.expense_date ?? existing.expense_date,
    notes: expense.notes ?? existing.notes
  };

  const result = await pool.query(
    `UPDATE expenses
     SET title = $1,
         amount = $2,
         category = $3,
         expense_date = $4,
         notes = $5,
         updated_at = NOW()
     WHERE id = $6
     RETURNING id, title, amount, category, expense_date, notes, created_at, updated_at`,
    [
      updatedExpense.title,
      updatedExpense.amount,
      updatedExpense.category,
      updatedExpense.expense_date,
      updatedExpense.notes,
      id
    ]
  );

  return result.rows[0];
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM expenses WHERE id = $1 RETURNING id',
    [id]
  );

  return result.rowCount > 0;
}

async function getSummary(query = {}) {
  const { whereClause, values } = buildFilters(query);

  const result = await pool.query(
    `SELECT
       COUNT(*)::int AS total_expenses,
       COALESCE(SUM(amount), 0)::numeric(10, 2) AS total_amount,
       COALESCE(AVG(amount), 0)::numeric(10, 2) AS average_amount
     FROM expenses
     ${whereClause}`,
    values
  );

  const byCategory = await pool.query(
    `SELECT category, COALESCE(SUM(amount), 0)::numeric(10, 2) AS total_amount
     FROM expenses
     ${whereClause}
     GROUP BY category
     ORDER BY total_amount DESC`,
    values
  );

  return {
    ...result.rows[0],
    by_category: byCategory.rows
  };
}

module.exports = {
  create,
  findAll,
  findById,
  getSummary,
  remove,
  update
};
