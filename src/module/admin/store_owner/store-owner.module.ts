import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreOwnerController } from './store-owner.controller';
import { StoreOwnerService } from './store-owner.service';
import { User } from '../../user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [StoreOwnerController],
  providers: [StoreOwnerService],
  exports: [StoreOwnerService],
})
export class StoreOwnerModule {}
