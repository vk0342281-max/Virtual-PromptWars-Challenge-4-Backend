import bcrypt from 'bcrypt';
import { config } from '../config/env';

/**
 * Hashes a plain-text password using bcrypt
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, config.bcrypt.saltRounds);
}

/**
 * Compares a plain-text password against a bcrypt hash
 * Returns true if they match
 */
export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
