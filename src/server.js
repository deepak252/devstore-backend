const express = require('express');
const cors = require('cors');
const {PORT} = require('./config');
const { connectToDB } = require('./config/db');
const { successMessage } = require('./utils/responseUtil');
const app = express();
const http = require('http').createServer(app);

app.use(express.json());
app.use(cors());

connectToDB();

app.get('/',(req,res)=>res.json(successMessage('Dev Store server is up and running')));
app.use('/api', require('./routes'));

http.listen(PORT, ()=>{
  console.log('Server is running on PORT : ', PORT);
});

