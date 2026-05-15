const pool = require('../db/pool');

const allowedSortFields = {
  amount: 'amount',
  category: 'category',
  created_at: 'created_at',
  income_date: 'income_date',
  source: 'source'
};

function buildFilters(query) {
  const conditions = [];
  const values = [];
  const search = query.search || query.q;

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(source ILIKE $${values.length} OR category ILIKE $${values.length} OR COALESCE(notes, '') ILIKE $${values.length})`);
  }

  if (query.category) {
    values.push(query.category);
    conditions.push(`category = $${values.length}`);
  }

  if (query.from) {
    values.push(query.from);
    conditions.push(`income_date >= $${values.length}`);
  }

  if (query.to) {
    values.push(query.to);
    conditions.push(`income_date <= $${values.length}`);
  }

  if (query.minAmount !== undefined) {
    values.push(query.minAmount);
    conditions.push(`amount >= $${values.length}`);
  }

  if (query.maxAmount !== undefined) {
    values.push(query.maxAmount);
    conditions.push(`amount <= $${values.length}`);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    values
  };
}

async function findAll(query = {}) {
  const { whereClause, values } = buildFilters(query);
  const sortBy = allowedSortFields[query.sortBy] || 'income_date';
  const order = query.order && query.order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const result = await pool.query(
    `SELECT id, source, amount, category, income_date, notes, created_at, updated_at
     FROM income
     ${whereClause}
     ORDER BY ${sortBy} ${order}, id DESC`,
    values
  );

  return result.rows;
}

async function findById(id) {
  const result = await pool.query(
    `SELECT id, source, amount, category, income_date, notes, created_at, updated_at
     FROM income
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function create(income) {
  const result = await pool.query(
    `INSERT INTO income (source, amount, category, income_date, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, source, amount, category, income_date, notes, created_at, updated_at`,
    [
      income.source,
      income.amount,
      income.category,
      income.income_date,
      income.notes || null
    ]
  );

  return result.rows[0];
}

async function update(id, income) {
  const existing = await findById(id);

  if (!existing) {
    return null;
  }

  const updatedIncome = {
    source: income.source ?? existing.source,
    amount: income.amount ?? existing.amount,
    category: income.category ?? existing.category,
    income_date: income.income_date ?? existing.income_date,
    notes: income.notes ?? existing.notes
  };

  const result = await pool.query(
    `UPDATE income
     SET source = $1,
         amount = $2,
         category = $3,
         income_date = $4,
         notes = $5,
         updated_at = NOW()
     WHERE id = $6
     RETURNING id, source, amount, category, income_date, notes, created_at, updated_at`,
    [
      updatedIncome.source,
      updatedIncome.amount,
      updatedIncome.category,
      updatedIncome.income_date,
      updatedIncome.notes,
      id
    ]
  );

  return result.rows[0];
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM income WHERE id = $1 RETURNING id',
    [id]
  );

  return result.rowCount > 0;
}

async function getSummary(query = {}) {
  const { whereClause, values } = buildFilters(query);

  const result = await pool.query(
    `SELECT
       COUNT(*)::int AS total_income_entries,
       COALESCE(SUM(amount), 0)::numeric(10, 2) AS total_amount,
       COALESCE(AVG(amount), 0)::numeric(10, 2) AS average_amount
     FROM income
     ${whereClause}`,
    values
  );

  const byCategory = await pool.query(
    `SELECT category, COALESCE(SUM(amount), 0)::numeric(10, 2) AS total_amount
     FROM income
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
