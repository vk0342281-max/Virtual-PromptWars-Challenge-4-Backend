import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendUnauthorized,
  sendError,
} from '../utils/response';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/env';

const googleClient = new OAuth2Client(config.google.clientId);

// Zod validation schemas
export const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['fan', 'organizer', 'security', 'medical']).default('fan'),
  preferredLanguage: z.enum(['en', 'es', 'fr', 'ar', 'hi']).default('en'),
  ticketNumber: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential token is required'),
  role: z.enum(['fan', 'organizer', 'security', 'medical']).default('fan'),
  preferredLanguage: z.enum(['en', 'es', 'fr', 'ar', 'hi']).default('en'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  preferredLanguage: z.enum(['en', 'es', 'fr', 'ar', 'hi']).optional(),
  ticketNumber: z.string().trim().optional(),
});

/**
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, role, preferredLanguage, ticketNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendBadRequest(res, 'An account with this email already exists');
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      preferredLanguage,
      ticketNumber,
    });

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    const refreshToken = signRefreshToken(user._id.toString());

    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    sendCreated(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        ticketNumber: user.ticketNumber,
      },
      accessToken,
      refreshToken,
    }, 'Account created successfully');
  } catch (err) {
    const error = err as Error;
    sendError(res, 'Registration failed', 500, error.message);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Select password explicitly (it's excluded by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    if (!user.isActive) {
      sendUnauthorized(res, 'Account is deactivated. Contact support.');
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    const refreshToken = signRefreshToken(user._id.toString());

    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        ticketNumber: user.ticketNumber,
      },
      accessToken,
      refreshToken,
    }, 'Login successful');
  } catch (err) {
    const error = err as Error;
    sendError(res, 'Login failed', 500, error.message);
  }
}

/**
 * POST /api/auth/google
 */
export async function googleAuth(req: Request, res: Response): Promise<void> {
  try {
    const { credential, role, preferredLanguage } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      sendBadRequest(res, 'Invalid Google credential');
      return;
    }

    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update Google ID if logging in with email that existed before
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
    } else {
      user = await User.create({
        name: name ?? email.split('@')[0],
        email,
        googleId,
        role,
        preferredLanguage,
        isActive: true,
      });
    }

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    const refreshToken = signRefreshToken(user._id.toString());

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
      },
      accessToken,
      refreshToken,
    }, 'Google authentication successful');
  } catch (err) {
    const error = err as Error;
    sendError(res, 'Google authentication failed', 500, error.message);
  }
}

/**
 * POST /api/auth/refresh
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      sendBadRequest(res, 'Refresh token is required');
      return;
    }

    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId);

    if (!user || !user.isActive) {
      sendUnauthorized(res, 'Invalid refresh token');
      return;
    }

    const newAccessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    sendSuccess(res, { accessToken: newAccessToken }, 'Token refreshed');
  } catch {
    sendUnauthorized(res, 'Refresh token is invalid or expired');
  }
}

/**
 * GET /api/auth/me
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      sendUnauthorized(res, 'User not found');
      return;
    }
    sendSuccess(res, user, 'Profile retrieved');
  } catch (err) {
    const error = err as Error;
    sendError(res, 'Failed to retrieve profile', 500, error.message);
  }
}

/**
 * PUT /api/auth/profile
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user!.userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      sendUnauthorized(res, 'User not found');
      return;
    }

    sendSuccess(res, user, 'Profile updated');
  } catch (err) {
    const error = err as Error;
    sendError(res, 'Failed to update profile', 500, error.message);
  }
}
