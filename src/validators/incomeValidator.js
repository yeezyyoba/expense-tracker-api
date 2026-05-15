function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function validateId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw createValidationError('Income id must be a positive integer');
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

function validateFilterDate(value, fieldName) {
  if (!value) {
    return undefined;
  }

  return validateDate(value, fieldName);
}

function validateOptionalAmount(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    throw createValidationError(`${fieldName} must be a number greater than or equal to 0`);
  }

  return amount;
}

function validateIncomeFilters(query) {
  const minAmount = validateOptionalAmount(query.minAmount, 'minAmount');
  const maxAmount = validateOptionalAmount(query.maxAmount, 'maxAmount');

  if (minAmount !== undefined && maxAmount !== undefined && minAmount > maxAmount) {
    throw createValidationError('minAmount cannot be greater than maxAmount');
  }

  return {
    ...query,
    q: typeof query.q === 'string' ? query.q.trim() : undefined,
    search: typeof query.search === 'string' ? query.search.trim() : undefined,
    category: typeof query.category === 'string' ? query.category.trim() : undefined,
    from: validateFilterDate(query.from, 'from'),
    to: validateFilterDate(query.to, 'to'),
    minAmount,
    maxAmount
  };
}

function validateIncomePayload(body) {
  const source = typeof body.source === 'string' ? body.source.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const amount = Number(body.amount);

  if (!source) {
    throw createValidationError('Source is required');
  }

  if (!category) {
    throw createValidationError('Category is required');
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createValidationError('Amount must be a number greater than 0');
  }

  return {
    source,
    category,
    amount,
    income_date: validateDate(body.income_date, 'income_date'),
    notes: typeof body.notes === 'string' ? body.notes.trim() : null
  };
}

function validateIncomeUpdatePayload(body) {
  const allowedFields = ['source', 'amount', 'category', 'income_date', 'notes'];
  const hasAllowedField = allowedFields.some((field) => body[field] !== undefined);

  if (!hasAllowedField) {
    throw createValidationError('At least one income field is required');
  }

  const payload = {};

  if (body.source !== undefined) {
    const source = typeof body.source === 'string' ? body.source.trim() : '';
    if (!source) {
      throw createValidationError('Source cannot be empty');
    }
    payload.source = source;
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

  if (body.income_date !== undefined) {
    payload.income_date = validateDate(body.income_date, 'income_date');
  }

  if (body.notes !== undefined) {
    payload.notes = typeof body.notes === 'string' ? body.notes.trim() : null;
  }

  return payload;
}

module.exports = {
  validateId,
  validateIncomeFilters,
  validateIncomePayload,
  validateIncomeUpdatePayload
};
