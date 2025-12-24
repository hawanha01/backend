import * as Brevo from '@getbrevo/brevo';
import { Injectable, Logger } from '@nestjs/common';
import { config } from '../../../../config/env';
import { StoreOwnerWelcomeEmailService } from './store-owner-welcome.email';

interface BrevoEmailRequest {
  sender: {
    name: string;
    email: string;
  };
  to: Array<{
    email: string;
    name?: string;
  }>;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  params?: Record<string, unknown>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly brevo: Brevo.TransactionalEmailsApi =
    new Brevo.TransactionalEmailsApi();

  constructor(
    private readonly storeOwnerWelcomeEmailService: StoreOwnerWelcomeEmailService,
  ) {
    if (!config.brevo.apiKey) {
      this.logger.error(
        'BREVO_API_KEY is not configured in environment variables',
      );
      throw new Error('BREVO_API_KEY is required for email service');
    }
    this.brevo.setApiKey(0, config.brevo.apiKey);
  }

  async sendEmail(
    to: string | string[],
    subject: string,
    htmlContent: string,
    textContent?: string,
    params?: Record<string, unknown>,
  ): Promise<void> {
    try {
      const recipients = Array.isArray(to) ? to : [to];

      const emailRequest: BrevoEmailRequest = {
        sender: {
          name: config.brevo.senderName,
          email: config.brevo.senderEmail,
        },
        to: recipients.map((email) => ({ email })),
        subject: subject,
      };

      if (htmlContent) {
        emailRequest.htmlContent = htmlContent;
      }
      if (textContent) {
        emailRequest.textContent = textContent;
      }
      if (params && Object.keys(params).length > 0) {
        emailRequest.params = params;
      }

      // Make HTTP request to Brevo API
      const response = await this.brevo.sendTransacEmail(emailRequest);
      this.logger.log(
        `Email sent successfully to ${recipients.join(', ')}. Message ID: ${response.body.messageId}`,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Email sending error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while sending email');
    }
  }

  async sendStoreOwnerWelcomeEmail(data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    verificationLink: string;
  }): Promise<void> {
    const htmlContent =
      this.storeOwnerWelcomeEmailService.generateEmailContent(data);
    const textContent =
      this.storeOwnerWelcomeEmailService.generatePlainTextContent(data);

    const params = {
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      verificationLink: data.verificationLink,
      email: data.email,
    };

    await this.sendEmail(
      data.email,
      'Welcome to Our Platform - Store Owner Account Created',
      htmlContent,
      textContent,
      params,
    );
  }
}
