const admin = require("firebase-admin");
const { getStorage, getDownloadURL } = require('firebase-admin/storage');

let serviceAccount = require("./serviceAccountKey.json");
const {
  PROJECT_ID,
  PRIVATE_KEY_ID,
  PRIVATE_KEY,
  CLIENT_EMAIL,
  CLIENT_ID,
  CLIENT_X509_CERT_URL,
} = require(".");

serviceAccount = {
  ...serviceAccount,
  project_id: PROJECT_ID,
  private_key_id: PRIVATE_KEY_ID,
  private_key: PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: CLIENT_EMAIL,
  client_id: CLIENT_ID,
  client_x509_cert_url: CLIENT_X509_CERT_URL, 
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${PROJECT_ID}.appspot.com`
});

const bucket = getStorage().bucket();

module.exports = {
  admin,
  bucket,
  getDownloadURL
}
