import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { success } from './utils/responseUtil.js';

const app = express();

app.use(cors());
app.use(cookieParser);
app.use(express.json());
app.get('/', (req, res) => res.json(success('Welcome to Dev Store')));
app.use('/api', routes);

export default app;
