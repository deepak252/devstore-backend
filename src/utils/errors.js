class BadRequestError extends Error {
  constructor(message = 'Bad Request') {
    super(message);
    this.name = 'BadRequest';
  }
}

module.exports = { BadRequestError };
