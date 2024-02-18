import app from './app.js';
import { connectDB } from './config/db.js';
import { PORT } from './config/environment.js';

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log('Server is Running on PORT : ', PORT);
    });
  })
  .catch((err) => {
    console.log('ERROR Starting Server', err);
    process.exit(1);
  });
