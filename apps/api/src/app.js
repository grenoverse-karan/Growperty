import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import routes from './routes/index.js';
import { errorMiddleware } from './middleware/index.js';
import logger from './utils/logger.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  logger.info(`[REQUEST] ${req.method} ${req.path}`);
  next();
});

app.use('/api', routes());

app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
