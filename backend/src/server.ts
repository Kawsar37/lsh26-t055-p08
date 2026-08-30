import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import https from 'https';
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

// Root health check & keep-alive endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ResultFlow Engine API', timestamp: new Date().toISOString() });
});

app.get('/api/keep-alive', (req, res) => {
  res.json({
    status: 'alive',
    service: 'ResultFlow Backend Engine',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use(errorHandler);

/**
 * Render Auto-Pinger:
 * Render free tier suspends idle web services after 15 minutes of inactivity.
 * This automated routine pings the server every 10 minutes (600,000 ms) to keep it awake.
 */
function startKeepAliveRoutine() {
  const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || `http://localhost:${PORT}`;
  const pingIntervalMs = 10 * 60 * 1000; // 10 minutes

  console.log(`[Keep-Alive] Initialized self-ping service targeting ${targetUrl}/api/keep-alive every 10m.`);

  setInterval(() => {
    try {
      const isHttps = targetUrl.startsWith('https://');
      const client = isHttps ? https : http;
      const pingEndpoint = `${targetUrl.replace(/\/$/, '')}/api/keep-alive`;

      client
        .get(pingEndpoint, (res) => {
          console.log(`[Keep-Alive Heartbeat] Pinged ${pingEndpoint} -> Status: ${res.statusCode} (${new Date().toLocaleTimeString()})`);
        })
        .on('error', (err) => {
          console.warn(`[Keep-Alive Warning] Ping failed: ${err.message}`);
        });
    } catch (error: any) {
      console.warn(`[Keep-Alive Error] ${error?.message}`);
    }
  }, pingIntervalMs);
}

async function bootstrap() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[ResultFlow Server] Running on port ${PORT}`);
    startKeepAliveRoutine();
  });
}

bootstrap().catch((err) => {
  console.error('[Bootstrap Error]:', err);
});
