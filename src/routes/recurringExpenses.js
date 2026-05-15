const express = require('express');
const {
  createRecurringExpense,
  deleteRecurringExpense,
  getDueRecurringExpenses,
  getRecurringExpense,
  getRecurringExpenses,
  recordRecurringExpense,
  updateRecurringExpense
} = require('../controllers/recurringExpensesController');

const router = express.Router();

router.get('/', getRecurringExpenses);
router.get('/due', getDueRecurringExpenses);
router.get('/:id', getRecurringExpense);
router.post('/', createRecurringExpense);
router.post('/:id/record', recordRecurringExpense);
router.put('/:id', updateRecurringExpense);
router.delete('/:id', deleteRecurringExpense);

module.exports = router;
