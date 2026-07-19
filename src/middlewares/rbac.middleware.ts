import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { sendForbidden, sendUnauthorized } from '../utils/response';

/**
 * Role-based access control middleware.
 * Must be used AFTER the authenticate middleware.
 *
 * Usage: requireRole('organizer', 'security')
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendForbidden(
        res,
        `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
      );
      return;
    }

    next();
  };
}

/**
 * Convenience: only organizers
 */
export const requireOrganizer = requireRole('organizer');

/**
 * Convenience: security or organizers
 */
export const requireSecurity = requireRole('security', 'organizer');

/**
 * Convenience: medical or organizers
 */
export const requireMedical = requireRole('medical', 'organizer');

/**
 * Convenience: any staff (organizer, security, medical)
 */
export const requireStaff = requireRole('organizer', 'security', 'medical');
