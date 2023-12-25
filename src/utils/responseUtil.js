const { BadRequestError } = require('./errors');

const success = (message, data) => ({
  success: true,
  message,
  data,
});

const failure = (message) => ({
  success: false,
  message,
});

const handleError = (e, res) => {
  if (e instanceof BadRequestError) {
    return res.status(400).json(failure(e.message));
  }
  return res.status(500).json(failure('Internal Server Error'));
};

module.exports = {
  success,
  failure,
  handleError,
};
