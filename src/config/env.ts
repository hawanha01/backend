import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import { envValidationSchema } from './env.validation';

// Load .env file
dotenv.config();

// Validate environment variables
const { error, value } = envValidationSchema.validate(process.env, {
  allowUnknown: true,
  abortEarly: false,
}) as { error?: Joi.ValidationError; value: unknown };

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

// Type for validated environment variables
interface ValidatedEnv {
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  ADMIN_EMAIL: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  ADMIN_FIRST_NAME: string;
  ADMIN_LAST_NAME: string;
  ADMIN_PHONE: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  CORS_ORIGIN: string;
  CORS_CREDENTIALS: boolean;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
}

const validatedValue = value as ValidatedEnv;

// Export validated environment variables
export const config = {
  port: validatedValue.PORT,
  database: {
    host: validatedValue.DB_HOST,
    port: validatedValue.DB_PORT,
    username: validatedValue.DB_USERNAME,
    password: validatedValue.DB_PASSWORD,
    database: validatedValue.DB_DATABASE,
  },
  admin: {
    email: validatedValue.ADMIN_EMAIL,
    username: validatedValue.ADMIN_USERNAME,
    password: validatedValue.ADMIN_PASSWORD,
    firstName: validatedValue.ADMIN_FIRST_NAME,
    lastName: validatedValue.ADMIN_LAST_NAME,
    phone: validatedValue.ADMIN_PHONE,
  },
  rateLimit: {
    windowMs: validatedValue.RATE_LIMIT_WINDOW_MS,
    maxRequests: validatedValue.RATE_LIMIT_MAX_REQUESTS,
  },
  cors: {
    origin: validatedValue.CORS_ORIGIN,
    credentials: validatedValue.CORS_CREDENTIALS,
  },
  jwt: {
    accessSecret: validatedValue.JWT_ACCESS_SECRET,
    refreshSecret: validatedValue.JWT_REFRESH_SECRET,
    accessExpiresIn: validatedValue.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: validatedValue.JWT_REFRESH_EXPIRES_IN,
  },
};
