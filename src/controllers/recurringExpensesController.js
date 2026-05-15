const recurringExpenseModel = require('../models/recurringExpenseModel');
const {
  validateDueDate,
  validateId,
  validateRecurringExpenseFilters,
  validateRecurringExpensePayload,
  validateRecurringExpenseUpdatePayload
} = require('../validators/recurringExpenseValidator');

async function getRecurringExpenses(req, res, next) {
  try {
    const filters = validateRecurringExpenseFilters(req.query);
    const expenses = await recurringExpenseModel.findAll(filters);
    res.json(expenses);
  } catch (error) {
    next(error);
  }
}

async function getDueRecurringExpenses(req, res, next) {
  try {
    const toDate = validateDueDate(req.query.to);
    const expenses = await recurringExpenseModel.findDue(toDate);
    res.json(expenses);
  } catch (error) {
    next(error);
  }
}

async function getRecurringExpense(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const expense = await recurringExpenseModel.findById(id);

    if (!expense) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }

    return res.json(expense);
  } catch (error) {
    return next(error);
  }
}

async function createRecurringExpense(req, res, next) {
  try {
    const payload = validateRecurringExpensePayload(req.body);
    const expense = await recurringExpenseModel.create(payload);

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
}

async function updateRecurringExpense(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const payload = validateRecurringExpenseUpdatePayload(req.body);
    const expense = await recurringExpenseModel.update(id, payload);

    if (!expense) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }

    return res.json(expense);
  } catch (error) {
    return next(error);
  }
}

async function deleteRecurringExpense(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const deleted = await recurringExpenseModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

async function recordRecurringExpense(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const result = await recurringExpenseModel.record(id);

    if (!result) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createRecurringExpense,
  deleteRecurringExpense,
  getDueRecurringExpenses,
  getRecurringExpense,
  getRecurringExpenses,
  recordRecurringExpense,
  updateRecurringExpense
};
