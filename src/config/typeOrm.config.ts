
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
 
config();
 
const configService = new ConfigService();
 
export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: parseInt(configService.get('DB_PORT') || '5432'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: [__dirname + '/../**/*.entity.ts'],
  migrations: [__dirname + '/../database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});