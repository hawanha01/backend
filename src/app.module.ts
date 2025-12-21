import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './module/auth/auth.module';
import { envValidationSchema } from './config/env.validation';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          pinoHttp: {
            level: config.get('logLevel') || 'info',
            customProps: () => ({
              context: 'HTTP',
            }),
            transport: {
              target: 'pino-pretty',
              options: {
                singleLine: true,
              },
            },
            serializers: {
              req: (req: {
                method?: string;
                url?: string;
                headers?: unknown;
                body?: unknown;
              }) => ({
                method: req.method,
                url: req.url,
                headers: req.headers,
                body: req.body,
              }),
              res: (res: {
                statusCode?: number;
                getHeaders?: () => unknown;
                _header?: unknown;
                raw?: { body?: unknown };
              }) => ({
                statusCode: res.statusCode,
                headers: res.getHeaders ? res.getHeaders() : res._header,
                body: res.raw?.body,
              }),
            },
          },
        };
      },
    }),
    DatabaseModule,
    CommonModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
