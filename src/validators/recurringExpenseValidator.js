const allowedFrequencies = ['daily', 'weekly', 'monthly', 'yearly'];

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function validateId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw createValidationError('Recurring expense id must be a positive integer');
  }

  return parsedId;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function validateDate(value, fieldName, fallbackToToday = false) {
  if (!value) {
    if (fallbackToToday) {
      return today();
    }

    return null;
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

function validateFrequency(value) {
  if (!allowedFrequencies.includes(value)) {
    throw createValidationError(`Frequency must be one of: ${allowedFrequencies.join(', ')}`);
  }

  return value;
}

function validateBoolean(value, fieldName, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw createValidationError(`${fieldName} must be true or false`);
}

function validateAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createValidationError('Amount must be a number greater than 0');
  }

  return amount;
}

function validateRecurringExpenseFilters(query) {
  return {
    ...query,
    q: typeof query.q === 'string' ? query.q.trim() : undefined,
    search: typeof query.search === 'string' ? query.search.trim() : undefined,
    category: typeof query.category === 'string' ? query.category.trim() : undefined,
    frequency: query.frequency ? validateFrequency(query.frequency) : undefined,
    active: validateBoolean(query.active, 'active', undefined),
    from: validateFilterDate(query.from, 'from'),
    to: validateFilterDate(query.to, 'to')
  };
}

function validateDueDate(value) {
  return validateDate(value, 'to', true);
}

function validateRecurringExpensePayload(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const frequency = validateFrequency(body.frequency);
  const startDate = validateDate(body.start_date, 'start_date', true);
  const nextDueDate = validateDate(body.next_due_date, 'next_due_date') || startDate;
  const endDate = validateDate(body.end_date, 'end_date');

  if (!title) {
    throw createValidationError('Title is required');
  }

  if (!category) {
    throw createValidationError('Category is required');
  }

  if (endDate && endDate < nextDueDate) {
    throw createValidationError('end_date cannot be before next_due_date');
  }

  return {
    title,
    amount: validateAmount(body.amount),
    category,
    frequency,
    start_date: startDate,
    next_due_date: nextDueDate,
    end_date: endDate,
    notes: typeof body.notes === 'string' ? body.notes.trim() : null,
    is_active: validateBoolean(body.is_active, 'is_active', true)
  };
}

function validateRecurringExpenseUpdatePayload(body) {
  const allowedFields = [
    'title',
    'amount',
    'category',
    'frequency',
    'start_date',
    'next_due_date',
    'end_date',
    'notes',
    'is_active'
  ];
  const hasAllowedField = allowedFields.some((field) => body[field] !== undefined);

  if (!hasAllowedField) {
    throw createValidationError('At least one recurring expense field is required');
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
    payload.amount = validateAmount(body.amount);
  }

  if (body.frequency !== undefined) {
    payload.frequency = validateFrequency(body.frequency);
  }

  if (body.start_date !== undefined) {
    payload.start_date = validateDate(body.start_date, 'start_date');
  }

  if (body.next_due_date !== undefined) {
    payload.next_due_date = validateDate(body.next_due_date, 'next_due_date');
  }

  if (body.end_date !== undefined) {
    payload.end_date = validateDate(body.end_date, 'end_date');
  }

  if (body.notes !== undefined) {
    payload.notes = typeof body.notes === 'string' ? body.notes.trim() : null;
  }

  if (body.is_active !== undefined) {
    payload.is_active = validateBoolean(body.is_active, 'is_active');
  }

  if (payload.end_date && payload.next_due_date && payload.end_date < payload.next_due_date) {
    throw createValidationError('end_date cannot be before next_due_date');
  }

  return payload;
}

module.exports = {
  validateDueDate,
  validateId,
  validateRecurringExpenseFilters,
  validateRecurringExpensePayload,
  validateRecurringExpenseUpdatePayload
};
