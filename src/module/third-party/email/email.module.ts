import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from './services/email.service';
import { StoreOwnerWelcomeEmailService } from './services/store-owner-welcome.email';

@Module({
  imports: [HttpModule],
  providers: [EmailService, StoreOwnerWelcomeEmailService],
  exports: [EmailService, StoreOwnerWelcomeEmailService],
})
export class EmailModule {}
