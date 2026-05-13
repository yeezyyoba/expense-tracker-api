function errorHandler(error, req, res, next) {
  console.error(error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || 'Internal server error'
  });
}

module.exports = errorHandler;
