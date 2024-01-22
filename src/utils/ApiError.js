class ApiError extends Error {
  constructor(message = 'Bad Request', statusCode = 400, stack) {
    super(message);
    this.statusCode = statusCode;
    this.stack = stack;
  }
}

export { ApiError };
