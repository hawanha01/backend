import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Server
  PORT: Joi.number().default(3000),
  // Database
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  // Admin Seeder
  ADMIN_EMAIL: Joi.string().email().default('dev.hamza.010@gmail.com'),
  ADMIN_USERNAME: Joi.string().min(3).max(100).default('hawanha1'),
  ADMIN_PASSWORD: Joi.string().min(8).default('Admin@123'),
  ADMIN_FIRST_NAME: Joi.string().max(255).default('Admin'),
  ADMIN_LAST_NAME: Joi.string().max(255).default('User'),
  ADMIN_PHONE: Joi.string().max(20).default('+1234567890'),
});

