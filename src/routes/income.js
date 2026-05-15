const express = require('express');
const {
  createIncome,
  deleteIncome,
  getIncome,
  getIncomeEntries,
  getIncomeSummary,
  updateIncome
} = require('../controllers/incomeController');

const router = express.Router();

router.get('/', getIncomeEntries);
router.get('/summary', getIncomeSummary);
router.get('/:id', getIncome);
router.post('/', createIncome);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;
