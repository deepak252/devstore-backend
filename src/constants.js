export const REGEX = Object.freeze({
  EMAIL: /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  PHONE: /^(\+\d{1,3}[- ]?)?\d{10}$/,
  URL: /^(https?:\/\/)?([\w.-]+)\.([a-zA-Z]{2,})(\/[^\s]*)?(\?[\w%.-]+=[\w%.-]+(&[\w%.-]+=[\w%.-]+)*)?$/,
  MILITARY_TIME: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
  ALPHANUMERIC: /^[A-Za-z0-9]*$/
});

export const BANNER_CATEGORY = Object.freeze({
  APP: 'apps',
  WEBSITE: 'websites',
  GAMES: 'games',
  HOME: 'home'
});

export const PROJECT_TYPE = Object.freeze({
  APPS: 'apps',
  GAMES: 'games',
  WEBSITES: 'websites'
});

export const PLATFORM = Object.freeze({
  ANDROID: 'android',
  IOS: 'ios'
});

export const REMOTE_PATH = Object.freeze({
  images: 'images',
  icons: 'icons',
  videos: 'videos',
  apps: 'apps'
});

export const INVALID_USERNAMES = [
  'dev',
  'devstore',
  'store',
  'user',
  'profile',
  'sigin',
  'signup',
  'apps',
  'games',
  'websites',
  'settings',
  'about',
  'aboutus',
  'privacy',
  'guest',
  'root',
  'admin',
  'administrator',
  'suppert',
  'system',
  'support',
  'moderator',
  'manager',
  'contact',
  'feedback',
  'info',
  'help',
  'account',
  'service',
  'guestuser',
  'customer',
  'login',
  'logout',
  'password',
  'passwordreset',
  'terms',
  'conditions',
  'termsandconditions',
  'contactus',
  'privacypolicy',
  'auth',
  'authentication',
  'signupform',
  'signinform',
  'sign',
  'signup',
  'signin',
  'login',
  'logout',
  'join',
  'form',
  'main',
  'pricing',
  'project',
  'projects'
];
