const pool = require('../db/pool');

const allowedSortFields = {
  amount: 'amount',
  category: 'category',
  created_at: 'created_at',
  frequency: 'frequency',
  next_due_date: 'next_due_date',
  start_date: 'start_date',
  title: 'title'
};

function createModelError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function buildFilters(query) {
  const conditions = [];
  const values = [];
  const search = query.search || query.q;

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(title ILIKE $${values.length} OR category ILIKE $${values.length} OR COALESCE(notes, '') ILIKE $${values.length})`);
  }

  if (query.category) {
    values.push(query.category);
    conditions.push(`category = $${values.length}`);
  }

  if (query.frequency) {
    values.push(query.frequency);
    conditions.push(`frequency = $${values.length}`);
  }

  if (query.active !== undefined) {
    values.push(query.active);
    conditions.push(`is_active = $${values.length}`);
  }

  if (query.from) {
    values.push(query.from);
    conditions.push(`next_due_date >= $${values.length}`);
  }

  if (query.to) {
    values.push(query.to);
    conditions.push(`next_due_date <= $${values.length}`);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    values
  };
}

function toDateOnly(value) {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addFrequency(value, frequency) {
  const date = new Date(`${toDateOnly(value)}T00:00:00.000Z`);

  if (frequency === 'daily') {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  if (frequency === 'weekly') {
    date.setUTCDate(date.getUTCDate() + 7);
  }

  if (frequency === 'monthly') {
    date.setUTCMonth(date.getUTCMonth() + 1);
  }

  if (frequency === 'yearly') {
    date.setUTCFullYear(date.getUTCFullYear() + 1);
  }

  return date.toISOString().slice(0, 10);
}

function shouldRemainActive(nextDate, endDate) {
  if (!endDate) {
    return true;
  }

  return nextDate <= toDateOnly(endDate);
}

async function findAll(query = {}) {
  const { whereClause, values } = buildFilters(query);
  const sortBy = allowedSortFields[query.sortBy] || 'next_due_date';
  const order = query.order && query.order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const result = await pool.query(
    `SELECT id, title, amount, category, frequency, start_date, next_due_date, end_date, notes, is_active, created_at, updated_at
     FROM recurring_expenses
     ${whereClause}
     ORDER BY ${sortBy} ${order}, id ASC`,
    values
  );

  return result.rows;
}

async function findDue(toDate) {
  const result = await pool.query(
    `SELECT id, title, amount, category, frequency, start_date, next_due_date, end_date, notes, is_active, created_at, updated_at
     FROM recurring_expenses
     WHERE is_active = TRUE AND next_due_date <= $1
     ORDER BY next_due_date ASC, id ASC`,
    [toDate]
  );

  return result.rows;
}

async function findById(id) {
  const result = await pool.query(
    `SELECT id, title, amount, category, frequency, start_date, next_due_date, end_date, notes, is_active, created_at, updated_at
     FROM recurring_expenses
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function create(expense) {
  const result = await pool.query(
    `INSERT INTO recurring_expenses (title, amount, category, frequency, start_date, next_due_date, end_date, notes, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, title, amount, category, frequency, start_date, next_due_date, end_date, notes, is_active, created_at, updated_at`,
    [
      expense.title,
      expense.amount,
      expense.category,
      expense.frequency,
      expense.start_date,
      expense.next_due_date,
      expense.end_date,
      expense.notes || null,
      expense.is_active
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
    frequency: expense.frequency ?? existing.frequency,
    start_date: expense.start_date ?? existing.start_date,
    next_due_date: expense.next_due_date ?? existing.next_due_date,
    end_date: expense.end_date ?? existing.end_date,
    notes: expense.notes ?? existing.notes,
    is_active: expense.is_active ?? existing.is_active
  };

  const result = await pool.query(
    `UPDATE recurring_expenses
     SET title = $1,
         amount = $2,
         category = $3,
         frequency = $4,
         start_date = $5,
         next_due_date = $6,
         end_date = $7,
         notes = $8,
         is_active = $9,
         updated_at = NOW()
     WHERE id = $10
     RETURNING id, title, amount, category, frequency, start_date, next_due_date, end_date, notes, is_active, created_at, updated_at`,
    [
      updatedExpense.title,
      updatedExpense.amount,
      updatedExpense.category,
      updatedExpense.frequency,
      updatedExpense.start_date,
      updatedExpense.next_due_date,
      updatedExpense.end_date,
      updatedExpense.notes,
      updatedExpense.is_active,
      id
    ]
  );

  return result.rows[0];
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM recurring_expenses WHERE id = $1 RETURNING id',
    [id]
  );

  return result.rowCount > 0;
}

async function record(id) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const recurringResult = await client.query(
      `SELECT id, title, amount, category, frequency, start_date, next_due_date, end_date, notes, is_active, created_at, updated_at
       FROM recurring_expenses
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    const recurring = recurringResult.rows[0];

    if (!recurring) {
      await client.query('ROLLBACK');
      return null;
    }

    if (!recurring.is_active) {
      throw createModelError('Recurring expense is inactive', 400);
    }

    const expenseResult = await client.query(
      `INSERT INTO expenses (title, amount, category, expense_date, notes, recurring_expense_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, amount, category, expense_date, notes, recurring_expense_id, created_at, updated_at`,
      [
        recurring.title,
        recurring.amount,
        recurring.category,
        recurring.next_due_date,
        recurring.notes,
        recurring.id
      ]
    );

    const nextDate = addFrequency(recurring.next_due_date, recurring.frequency);
    const nextActiveState = shouldRemainActive(nextDate, recurring.end_date);

    const updatedRecurringResult = await client.query(
      `UPDATE recurring_expenses
       SET next_due_date = $1,
           is_active = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, title, amount, category, frequency, start_date, next_due_date, end_date, notes, is_active, created_at, updated_at`,
      [nextDate, nextActiveState, recurring.id]
    );

    await client.query('COMMIT');

    return {
      expense: expenseResult.rows[0],
      recurring_expense: updatedRecurringResult.rows[0]
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  create,
  findAll,
  findById,
  findDue,
  record,
  remove,
  update
};
