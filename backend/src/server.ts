import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ResultFlow Engine API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use(errorHandler);

async function bootstrap() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[ResultFlow Server] Running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[Bootstrap Error]:', err);
});
