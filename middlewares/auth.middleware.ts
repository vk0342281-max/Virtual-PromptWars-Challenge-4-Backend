import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractBearerToken, JWTPayload } from '../utils/jwt';
import { sendUnauthorized } from '../utils/response';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Verifies the JWT access token from the Authorization header.
 * Attaches the decoded payload to req.user on success.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    sendUnauthorized(res, 'No authentication token provided');
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    const error = err as Error;
    if (error.name === 'TokenExpiredError') {
      sendUnauthorized(res, 'Token expired. Please log in again.');
    } else {
      sendUnauthorized(res, 'Invalid authentication token');
    }
  }
}

/**
 * Optional auth — attaches user if token present, doesn't block if missing
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);

  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Ignore — continue without user
    }
  }

  next();
}
