import dotenv from 'dotenv';
dotenv.config();

export const {
  NODE_ENV = 'development',
  PORT = 5000,
  MONGO_URI,
  JWT_SECRET,
  PROJECT_ID,
  PRIVATE_KEY_ID,
  PRIVATE_KEY,
  CLIENT_EMAIL,
  CLIENT_ID,
  CLIENT_X509_CERT_URL,
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  GOOGLE_OAUTH_REDIRECT_URL
} = process.env;
