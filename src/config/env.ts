import * as dotenv from 'dotenv';
import { envValidationSchema } from './env.validation';

// Load .env file
dotenv.config();

// Validate environment variables
const { error, value } = envValidationSchema.validate(process.env, {
  allowUnknown: true,
  abortEarly: false,
});

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

// Export validated environment variables
export const config = {
  port: value.PORT,
  database: {
    host: value.DB_HOST,
    port: value.DB_PORT,
    username: value.DB_USERNAME,
    password: value.DB_PASSWORD,
    database: value.DB_DATABASE,
  },
};

