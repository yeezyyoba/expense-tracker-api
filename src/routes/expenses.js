const express = require('express');
const {
  createExpense,
  deleteExpense,
  getExpense,
  getExpenses,
  getExpenseSummary,
  updateExpense
} = require('../controllers/expensesController');

const router = express.Router();

router.get('/', getExpenses);
router.get('/summary', getExpenseSummary);
router.get('/:id', getExpense);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
