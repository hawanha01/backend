import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { envValidationSchema } from './config/env.validation';
import config from './config/typeOrm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema: envValidationSchema,
    }),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
