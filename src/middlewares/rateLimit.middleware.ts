import rateLimit from 'express-rate-limit';
import { config } from '../config/env';
import { sendError } from '../utils/response';

/**
 * General API rate limiter: 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_req, res) {
    sendError(res, 'Too many requests. Please try again later.', 429);
  },
});

/**
 * Strict limiter for auth endpoints: 10 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_req, res) {
    sendError(res, 'Too many authentication attempts. Please try again in 15 minutes.', 429);
  },
});

/**
 * AI endpoint limiter: 30 requests per minute per IP
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_req, res) {
    sendError(res, 'AI request limit reached. Please wait a moment.', 429);
  },
});
