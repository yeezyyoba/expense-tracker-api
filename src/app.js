const express = require('express');
const cors = require('cors');
const expensesRouter = require('./routes/expenses');
const incomeRouter = require('./routes/income');
const recurringExpensesRouter = require('./routes/recurringExpenses');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'expense-tracker-api'
  });
});

app.use('/api/expenses', expensesRouter);
app.use('/api/income', incomeRouter);
app.use('/api/recurring-expenses', recurringExpensesRouter);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

app.use(errorHandler);

module.exports = app;
