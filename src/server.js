const express = require('express');
const cors = require('cors');
const {PORT} = require('./config');
const { connectToDB } = require('./config/db');
const { success } = require('./utils/responseUtil');
const app = express();

app.use(express.json());
app.use(cors());
app.get('/',(req,res)=>res.json(success('Dev Store server is up and running')));
app.use('/api', require('./routes'));

connectToDB();

const http = require('http').createServer(app);

http.listen(PORT, ()=>{
  console.log('Server is running on PORT : ', PORT);
});

