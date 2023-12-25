const mongoose = require('mongoose');
const {MONGO_URI} = require('.');

exports.connectToDB = async () => {
  try{
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to the database');
  }catch(e){
    console.error('Error connect to database',e);
  }
}