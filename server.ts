import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { config } from './src/config/env';
import { connectDatabase } from './src/config/database';
import { corsOptions } from './src/config/cors';
import { generalLimiter } from './src/middlewares/rateLimit.middleware';
import { sendError, sendNotFound } from './src/utils/response';

import authRoutes from './src/routes/auth.routes';
import paymentRoutes from './src/routes/payment.routes';
import concessionRoutes from './src/routes/concession.routes';
import ticketRoutes from './src/routes/ticket.routes';
import aiRoutes from './src/routes/ai.routes';

const app = express();
const httpServer = createServer(app);

// ─── Socket.IO Setup ───────────────────────────────────────────────────────
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: corsOptions.origin,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('join:role', (role: string) => {
    socket.join(`role:${role}`);
    console.log(`[Socket] ${socket.id} joined room: role:${role}`);
  });

  socket.on('join:zone', (zoneId: string) => {
    socket.join(`zone:${zoneId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ─── Express Middleware ────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow loading external resources in dashboard
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(generalLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'StadiumIQ AI API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/concessions', concessionRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/ai', aiRoutes);

// Placeholder route registrations (filled as modules are built)
// app.use('/api/stadium', stadiumRoutes);
// app.use('/api/crowd', crowdRoutes);
// app.use('/api/incidents', incidentRoutes);
// app.use('/api/alerts', alertRoutes);
// app.use('/api/ai', aiRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  sendNotFound(res, 'API endpoint not found');
});

// ─── Global Error Handler ─────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[Error] ${err.name}: ${err.message}`);
  sendError(res, 'Internal server error', 500, err.message);
});

// ─── Bootstrap ────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();

    httpServer.listen(config.port, () => {
      console.log(`[Server] StadiumIQ AI running on port ${config.port} [${config.env}]`);
      console.log(`[Server] Health: http://localhost:${config.port}/health`);
    });
  } catch (err) {
    const error = err as Error;
    console.error(`[Server] Failed to start: ${error.message}`);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => process.exit(0));
});

process.on('SIGINT', async () => {
  console.log('[Server] SIGINT received. Shutting down...');
  httpServer.close(() => process.exit(0));
});

bootstrap();

export default app;
