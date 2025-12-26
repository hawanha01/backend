import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './services/email.service';
import { EmailTemplate } from '../../email-template/entity/email-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailTemplate])],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
