import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
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

interface BrevoEmailResponse {
  messageId: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly brevoApiUrl = 'https://api.brevo.com/v3/smtp/email';

  constructor(
    private readonly httpService: HttpService,
    private readonly storeOwnerWelcomeEmailService: StoreOwnerWelcomeEmailService,
  ) {
    // Validate API key is present
    if (!config.brevo.apiKey) {
      this.logger.error(
        'BREVO_API_KEY is not configured in environment variables',
      );
      throw new Error('BREVO_API_KEY is required for email service');
    }
    this.logger.log('Brevo email service initialized successfully');
  }

  /**
   * Send email using Brevo API (direct HTTP request)
   * Following official documentation: https://developers.brevo.com/docs/send-a-transactional-email
   */
  async sendEmail(
    to: string | string[],
    subject: string,
    htmlContent: string,
    textContent?: string,
    params?: Record<string, unknown>,
  ): Promise<void> {
    try {
      const recipients = Array.isArray(to) ? to : [to];

      // Prepare email request according to Brevo API documentation
      const emailRequest: BrevoEmailRequest = {
        sender: {
          name: config.brevo.senderName,
          email: config.brevo.senderEmail,
        },
        to: recipients.map((email) => ({ email })),
        subject: subject,
      };

      // Add content - use htmlContent, textContent, or params (but not all at once)
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
      const response = await firstValueFrom(
        this.httpService.post<BrevoEmailResponse>(
          this.brevoApiUrl,
          emailRequest,
          {
            headers: {
              accept: 'application/json',
              'api-key': config.brevo.apiKey,
              'content-type': 'application/json',
            },
          },
        ),
      );

      const messageId = response.data?.messageId || 'N/A';

      this.logger.log(
        `Email sent successfully to ${recipients.join(', ')}. Message ID: ${messageId}`,
      );
    } catch (error) {
      // Extract detailed error message from Brevo API response
      let errorMessage = 'Failed to send email';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            statusText?: string;
            data?: {
              message?: string;
              code?: string;
            };
          };
          message?: string;
        };

        if (axiosError.response?.data) {
          const { message, code } = axiosError.response.data;
          const status = axiosError.response.status;
          const statusText = axiosError.response.statusText;

          if (status === 401) {
            errorMessage =
              'Brevo API authentication failed. Please check your BREVO_API_KEY in environment variables and ensure your IP address is authorized in Brevo settings.';
            this.logger.error(
              `Brevo API authentication error (401): ${message || code || 'Key not found'}`,
            );
          } else if (status === 400) {
            errorMessage = `Invalid email request: ${message || 'Bad request'}`;
            this.logger.error(
              `Brevo API validation error (400): ${message || code}`,
            );
          } else if (status === 403) {
            errorMessage =
              'Brevo API access forbidden. Please check your API key permissions and sender domain authentication.';
            this.logger.error(
              `Brevo API forbidden error (403): ${message || code}`,
            );
          } else if (status === 429) {
            errorMessage =
              'Brevo API rate limit exceeded. Please try again later.';
            this.logger.error(
              `Brevo API rate limit error (429): ${message || code}`,
            );
          } else {
            errorMessage = `Brevo API error (${status} ${statusText}): ${message || code || 'Unknown error'}`;
            this.logger.error(
              `Brevo API error (${status}): ${message || code || 'Unknown error'}`,
            );
          }
        } else if (axiosError.message) {
          errorMessage = `Email sending error: ${axiosError.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = `Email sending error: ${error.message}`;
      }

      this.logger.error(
        `Failed to send email to ${Array.isArray(to) ? to.join(', ') : to}: ${errorMessage}`,
        error,
      );
      throw new Error(errorMessage);
    }
  }

  /**
   * Send store owner welcome email with dynamic content
   * Uses params for dynamic variables as per Brevo documentation
   */
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

    // Use params for dynamic content as per Brevo documentation
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
