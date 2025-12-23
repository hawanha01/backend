import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreOwnerController } from './store-owner.controller';
import { StoreOwnerService } from './store-owner.service';
import { User } from '../../user/entity/user.entity';
import { EmailQueueModule } from '../../queue/queues/email/email-queue.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), EmailQueueModule, AuthModule],
  controllers: [StoreOwnerController],
  providers: [StoreOwnerService],
  exports: [StoreOwnerService],
})
export class StoreOwnerModule {}
