const REGEX = Object.freeze({
  EMAIL: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  PHONE: /^(\+\d{1,3}[- ]?)?\d{10}$/,
  URL: /^(https?:\/\/)?([\w.-]+)\.([a-zA-Z]{2,})(\/[^\s]*)?(\?[\w%.-]+=[\w%.-]+(&[\w%.-]+=[\w%.-]+)*)?$/,
  MILITARY_TIME: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
  ALPHANUMERIC: /^[A-Za-z0-9]*$/,
});

const BANNER_CATEGORY = Object.freeze({
  APP: 'apps',
  WEBSITE: 'websites',
  GAMES: 'games',
  HOME: 'home',
});

const PLATFORM = Object.freeze({
  ANDROID: 'android',
  IOS: 'ios',
});

module.exports = {
  REGEX,
  BANNER_CATEGORY,
  PLATFORM,
};
