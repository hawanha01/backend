import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { StoreOwnerWelcomeEmailService } from './services/store-owner-welcome.email';

@Module({
  imports: [],
  providers: [EmailService, StoreOwnerWelcomeEmailService],
  exports: [EmailService, StoreOwnerWelcomeEmailService],
})
export class EmailModule {}
