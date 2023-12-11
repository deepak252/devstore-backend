const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const {
  PROJECT_ID,
  PRIVATE_KEY_ID,
  PRIVATE_KEY,
  CLIENT_EMAIL,
  CLIENT_ID,
  CLIENT_X509_CERT_URL,
} = require(".");

serviceAccount.project_id = PROJECT_ID;
serviceAccount.private_key_id = PRIVATE_KEY_ID;
serviceAccount.private_key = PRIVATE_KEY?.replace(/\\n/g, '\n');
serviceAccount.client_email = CLIENT_EMAIL;
serviceAccount.client_id = CLIENT_ID;
serviceAccount.client_x509_cert_url = CLIENT_X509_CERT_URL;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const storage = admin.storage()
module.exports = admin;
