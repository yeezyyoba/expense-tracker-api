function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function validateId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw createValidationError('Expense id must be a positive integer');
  }

  return parsedId;
}

function validateDate(value, fieldName) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createValidationError(`${fieldName} must be a valid date`);
  }

  return value;
}

function validateExpensePayload(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const amount = Number(body.amount);

  if (!title) {
    throw createValidationError('Title is required');
  }

  if (!category) {
    throw createValidationError('Category is required');
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createValidationError('Amount must be a number greater than 0');
  }

  return {
    title,
    category,
    amount,
    expense_date: validateDate(body.expense_date, 'expense_date'),
    notes: typeof body.notes === 'string' ? body.notes.trim() : null
  };
}

function validateExpenseUpdatePayload(body) {
  const allowedFields = ['title', 'amount', 'category', 'expense_date', 'notes'];
  const hasAllowedField = allowedFields.some((field) => body[field] !== undefined);

  if (!hasAllowedField) {
    throw createValidationError('At least one expense field is required');
  }

  const payload = {};

  if (body.title !== undefined) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      throw createValidationError('Title cannot be empty');
    }
    payload.title = title;
  }

  if (body.category !== undefined) {
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    if (!category) {
      throw createValidationError('Category cannot be empty');
    }
    payload.category = category;
  }

  if (body.amount !== undefined) {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw createValidationError('Amount must be a number greater than 0');
    }
    payload.amount = amount;
  }

  if (body.expense_date !== undefined) {
    payload.expense_date = validateDate(body.expense_date, 'expense_date');
  }

  if (body.notes !== undefined) {
    payload.notes = typeof body.notes === 'string' ? body.notes.trim() : null;
  }

  return payload;
}

module.exports = {
  validateExpensePayload,
  validateExpenseUpdatePayload,
  validateId
};
