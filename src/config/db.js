import mongoose from 'mongoose';
import { MONGO_URI } from './environment.js';

export const connectDB = async () => {
  try {
    console.log('Connecting to db...');
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to the database');
  } catch (e) {
    console.error('Error connect to database', e);
    process.exit(1);
  }
};
