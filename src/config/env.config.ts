import { config } from './env';

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

interface ConfigReturn {
  database: DatabaseConfig;
}

export default (): ConfigReturn => ({
  database: {
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
  },
});
