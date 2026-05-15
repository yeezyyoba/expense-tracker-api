const incomeModel = require('../models/incomeModel');
const {
  validateId,
  validateIncomeFilters,
  validateIncomePayload,
  validateIncomeUpdatePayload
} = require('../validators/incomeValidator');

async function getIncomeEntries(req, res, next) {
  try {
    const filters = validateIncomeFilters(req.query);
    const entries = await incomeModel.findAll(filters);
    res.json(entries);
  } catch (error) {
    next(error);
  }
}

async function getIncome(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const income = await incomeModel.findById(id);

    if (!income) {
      return res.status(404).json({ message: 'Income entry not found' });
    }

    return res.json(income);
  } catch (error) {
    return next(error);
  }
}

async function createIncome(req, res, next) {
  try {
    const payload = validateIncomePayload(req.body);
    const income = await incomeModel.create(payload);

    res.status(201).json(income);
  } catch (error) {
    next(error);
  }
}

async function updateIncome(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const payload = validateIncomeUpdatePayload(req.body);
    const income = await incomeModel.update(id, payload);

    if (!income) {
      return res.status(404).json({ message: 'Income entry not found' });
    }

    return res.json(income);
  } catch (error) {
    return next(error);
  }
}

async function deleteIncome(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const deleted = await incomeModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Income entry not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

async function getIncomeSummary(req, res, next) {
  try {
    const filters = validateIncomeFilters(req.query);
    const summary = await incomeModel.getSummary(filters);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createIncome,
  deleteIncome,
  getIncome,
  getIncomeEntries,
  getIncomeSummary,
  updateIncome
};
