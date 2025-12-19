import { config } from './env';

export default () => ({
  database: {
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
  },
});

