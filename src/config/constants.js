const REGEX = Object.freeze({
  EMAIL : /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  PHONE : /^(\+\d{1,3}[- ]?)?\d{10}$/,
  URL: /^(https?:\/\/)?([\w.-]+)\.([a-zA-Z]{2,})(\/[^\s]*)?(\?[\w%.-]+=[\w%.-]+(&[\w%.-]+=[\w%.-]+)*)?$/,
  MILITARY_TIME : /^(?:[01]\d|2[0-3]):[0-5]\d$/,
  ALPHANUMERIC: /^[A-Za-z0-9]*$/,
});

module.exports = {
  REGEX
}