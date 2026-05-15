const expenseModel = require('../models/expenseModel');
const {
  validateExpenseFilters,
  validateExpensePayload,
  validateExpenseUpdatePayload,
  validateId
} = require('../validators/expenseValidator');

async function getExpenses(req, res, next) {
  try {
    const filters = validateExpenseFilters(req.query);
    const expenses = await expenseModel.findAll(filters);
    res.json(expenses);
  } catch (error) {
    next(error);
  }
}

async function getExpense(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const expense = await expenseModel.findById(id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.json(expense);
  } catch (error) {
    return next(error);
  }
}

async function createExpense(req, res, next) {
  try {
    const payload = validateExpensePayload(req.body);
    const expense = await expenseModel.create(payload);

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
}

async function updateExpense(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const payload = validateExpenseUpdatePayload(req.body);
    const expense = await expenseModel.update(id, payload);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.json(expense);
  } catch (error) {
    return next(error);
  }
}

async function deleteExpense(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const deleted = await expenseModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

async function getExpenseSummary(req, res, next) {
  try {
    const filters = validateExpenseFilters(req.query);
    const summary = await expenseModel.getSummary(filters);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createExpense,
  deleteExpense,
  getExpense,
  getExpenses,
  getExpenseSummary,
  updateExpense
};
