import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: Record<string, unknown>;
}

/**
 * Sends a standardized success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: Record<string, unknown>,
): Response {
  const body: ApiResponse<T> = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

/**
 * Sends a standardized created (201) response
 */
export function sendCreated<T>(res: Response, data: T, message: string = 'Created'): Response {
  return sendSuccess(res, data, message, 201);
}

/**
 * Sends a standardized error response
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: string,
): Response {
  const body: ApiResponse = { success: false, message };
  if (error && process.env.NODE_ENV !== 'production') {
    body.error = error;
  }
  return res.status(statusCode).json(body);
}

/**
 * Sends a 400 Bad Request response
 */
export function sendBadRequest(res: Response, message: string, error?: string): Response {
  return sendError(res, message, 400, error);
}

/**
 * Sends a 401 Unauthorized response
 */
export function sendUnauthorized(res: Response, message: string = 'Unauthorized'): Response {
  return sendError(res, message, 401);
}

/**
 * Sends a 403 Forbidden response
 */
export function sendForbidden(res: Response, message: string = 'Forbidden'): Response {
  return sendError(res, message, 403);
}

/**
 * Sends a 404 Not Found response
 */
export function sendNotFound(res: Response, message: string = 'Not found'): Response {
  return sendError(res, message, 404);
}

/**
 * Sends a paginated list response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Success',
): Response {
  return sendSuccess(res, data, message, 200, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  });
}
