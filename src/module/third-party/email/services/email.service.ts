import * as Brevo from '@getbrevo/brevo';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { config } from '../../../../config/env';
import { EmailTemplate } from '../../../email-template/entity/email-template.entity';
import { EmailTemplateCode } from '../../../email-template/constants/email-template-code.constants';

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
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
  ) {
    if (!config.brevo.apiKey) {
      this.logger.error(
        'BREVO_API_KEY is not configured in environment variables',
      );
      throw new Error('BREVO_API_KEY is required for email service');
    }
    this.brevo.setApiKey(0, config.brevo.apiKey);
  }

  /**
   * Replace template variables in HTML content
   * Replaces {{variableName}} with actual values from the data object
   */
  private replaceTemplateVariables(
    template: string,
    variables: Record<string, string | number>,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, String(value));
    }
    return result;
  }

  /**
   * Get email template from database by template code
   */
  private async getEmailTemplate(
    templateCode: EmailTemplateCode,
  ): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { templateCode, isDeleted: false },
    });

    if (!template) {
      throw new NotFoundException(
        `Email template with code "${templateCode}" not found`,
      );
    }

    return template;
  }

  async sendEmail(
    to: string | string[],
    subject: string,
    htmlContent: string,
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
    // Get template from database
    const template = await this.getEmailTemplate(
      EmailTemplateCode.STORE_OWNER_WELCOME,
    );

    // Prepare variables for template replacement
    const templateVariables: Record<string, string | number> = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      verificationLink: data.verificationLink,
      senderName: config.brevo.senderName,
      year: new Date().getFullYear(),
    };

    // Replace template variables in HTML content and subject
    const htmlContent = this.replaceTemplateVariables(
      template.htmlContent,
      templateVariables,
    );
    const subject = this.replaceTemplateVariables(
      template.subject,
      templateVariables,
    );

    const params = {
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      verificationLink: data.verificationLink,
      email: data.email,
    };

    await this.sendEmail(data.email, subject, htmlContent, params);
  }
}
