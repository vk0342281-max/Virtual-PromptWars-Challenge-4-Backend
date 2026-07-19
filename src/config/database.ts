import mongoose from 'mongoose';
import { config } from './env';

/**
 * Connects to MongoDB Atlas with retry logic and connection event handlers
 */
export async function connectDatabase(): Promise<void> {
  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 5000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(config.mongodb.uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      console.log(`[DB] Connected to MongoDB Atlas`);
      return;
    } catch (error) {
      const err = error as Error;
      console.error(`[DB] Connection attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);

      if (attempt === MAX_RETRIES) {
        throw new Error(`[DB] Failed to connect after ${MAX_RETRIES} attempts`);
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

// Connection lifecycle events
mongoose.connection.on('disconnected', () => {
  console.warn('[DB] MongoDB disconnected');
});

mongoose.connection.on('error', (err: Error) => {
  console.error(`[DB] MongoDB error: ${err.message}`);
});

mongoose.connection.on('reconnected', () => {
  console.log('[DB] MongoDB reconnected');
});

/**
 * Gracefully closes the MongoDB connection
 */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
  console.log('[DB] MongoDB connection closed');
}
