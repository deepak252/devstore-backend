import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { ApiResponse } from './utils/ApiResponse.js';

const app = express();

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000'
  })
);
app.use(cookieParser());
app.use(express.json());
app.get('/', (req, res) => res.json(new ApiResponse('Welcome to Dev Store')));
app.use('/api', routes);

export default app;
