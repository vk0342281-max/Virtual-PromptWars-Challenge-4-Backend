/**
 * Environment variable validation and typed config
 * Fails fast at startup if required variables are missing
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[Config] Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string = ''): string {
  return process.env[name] ?? defaultValue;
}

export const config = {
  env: optionalEnv('NODE_ENV', 'development'),
  port: parseInt(optionalEnv('PORT', '5000'), 10),

  mongodb: {
    uri: requireEnv('MONGODB_URI'),
  },

  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: optionalEnv('JWT_EXPIRES_IN', '7d'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    refreshExpiresIn: optionalEnv('JWT_REFRESH_EXPIRES_IN', '30d'),
  },

  google: {
    clientId: requireEnv('GOOGLE_CLIENT_ID'),
    clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
    mapsApiKey: requireEnv('GOOGLE_MAPS_API_KEY'),
  },

  groq: {
    apiKey: requireEnv('GROQ_API_KEY'),
    model: optionalEnv('GROQ_MODEL', 'llama-3.3-70b-versatile'),
  },

  gemini: {
    apiKey: requireEnv('GEMINI_API_KEY'),
    model: optionalEnv('GEMINI_MODEL', 'gemini-1.5-pro'),
  },

  cors: {
    frontendUrl: optionalEnv('FRONTEND_URL', 'http://localhost:3000'),
  },

  rateLimit: {
    windowMs: parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    maxRequests: parseInt(optionalEnv('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  },

  bcrypt: {
    saltRounds: parseInt(optionalEnv('BCRYPT_SALT_ROUNDS', '12'), 10),
  },

  isDevelopment(): boolean {
    return this.env === 'development';
  },

  isProduction(): boolean {
    return this.env === 'production';
  },
} as const;

export type Config = typeof config;
