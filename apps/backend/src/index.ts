import express from 'express';
import { env } from './config/env';
import { corsMiddleware } from './middlewares/cors';
import { rateLimitMiddleware } from './middlewares/rateLimit';
import { requestIdMiddleware } from './middlewares/requestId';
import { loggerMiddleware } from './middlewares/logger';
import { errorMiddleware } from './middlewares/error';
import { healthRouter } from './routes/health';
import { chatRouter } from './routes/chat';
import { questionsRouter } from './routes/questions';
import { analysisRouter } from './routes/analysis';
import { framingRouter } from './routes/framing';

const app = express();
const port = 4000;

app.use(express.json({ limit: '1mb' }));
app.use(requestIdMiddleware);
app.use(loggerMiddleware);
app.use(corsMiddleware());
app.use(rateLimitMiddleware);

app.use('/api', healthRouter);
app.use('/api', chatRouter);
app.use('/api', questionsRouter);
app.use('/api', analysisRouter);
app.use('/api', framingRouter);

app.get('/', (_req, res) => {
  res.send('Hello from Express backend!');
});

app.use(errorMiddleware);

app.listen(port, () => {
  console.log('🚀 Server running at http://localhost:4000');
});
