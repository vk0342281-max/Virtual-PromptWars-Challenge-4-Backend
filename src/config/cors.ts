import { CorsOptions } from 'cors';
import { config } from './env';

const ALLOWED_ORIGINS: string[] = [
  config.cors.frontendUrl,
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:3000',
];

/**
 * CORS configuration — whitelists only known origins in production
 */
export const corsOptions: CorsOptions = {
  origin(requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (curl, Postman, same-origin)
    if (!requestOrigin) {
      return callback(null, true);
    }

    if (ALLOWED_ORIGINS.includes(requestOrigin) || config.isDevelopment()) {
      return callback(null, true);
    }

    callback(new Error(`CORS policy: Origin '${requestOrigin}' not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours preflight cache
};
