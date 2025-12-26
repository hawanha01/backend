import { DataSource } from 'typeorm';
import { EmailTemplate } from '../../../module/email-template/entity/email-template.entity';
import { EmailTemplateCode } from '../../../module/email-template/constants/email-template-code.constants';
import AppDataSource from '../../../config/typeOrm.config';

/**
 * Store Owner Welcome Email Template Seeder
 *
 * This seeder populates/updates the store owner welcome email template.
 * It checks if the template exists by templateCode, updates if exists, creates if not.
 */
export class StoreOwnerWelcomeEmailTemplateSeeder {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = AppDataSource;
  }

  /**
   * Get template data for store owner welcome email
   */
  private getTemplateData(): Omit<
    EmailTemplate,
    'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDeleted'
  > {
    const htmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to Our Platform</title></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background-color: #f9f9f9; border-radius: 8px; padding: 30px; margin: 20px 0;"><div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #2c3e50; margin: 0;">Welcome to Our Platform!</h1></div><div style="background-color: #ffffff; padding: 25px; border-radius: 5px; margin-bottom: 20px;"><p>Dear {{firstName}} {{lastName}},</p><p>Your store owner account has been successfully created. Below are your account credentials:</p><div style="background-color: #f0f0f0; border: 2px dashed #3498db; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; font-size: 18px; font-weight: bold; color: #2c3e50;"><strong>Your Temporary Password:</strong><br>{{password}}</div><div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;"><strong>⚠️ Important:</strong> Please change your password after your first login and verify your email address.</div><p>To get started, please verify your email address by clicking the button below:</p><div style="text-align: center;"><a href="{{verificationLink}}" style="display: inline-block; padding: 12px 30px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold;">Verify Email Address</a></div><p>Or copy and paste this link into your browser:</p><p style="word-break: break-all; color: #3498db;">{{verificationLink}}</p><p>After verifying your email, you can log in using:</p><ul><li><strong>Email:</strong> {{email}}</li><li><strong>Password:</strong> {{password}}</li></ul><p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p><p>Best regards,<br>{{senderName}}</p></div><div style="text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 12px;"><p>This is an automated email. Please do not reply to this message.</p><p>&copy; {{year}} All rights reserved.</p></div></div></body></html>`;

    return {
      templateCode: EmailTemplateCode.STORE_OWNER_WELCOME,
      name: 'Store Owner Welcome Email',
      subject: 'Welcome to Our Platform - Store Owner Account Created',
      htmlContent: htmlContent,
      description:
        'Welcome email sent to store owners when their account is created. Includes account credentials and email verification link.',
      variables: [
        'email',
        'firstName',
        'lastName',
        'password',
        'verificationLink',
        'senderName',
        'year',
      ],
    };
  }

  /**
   * Run the seeder
   */
  async seed(): Promise<void> {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
        console.log('✅ Database connection initialized');
      }

      const emailTemplateRepository =
        this.dataSource.getRepository(EmailTemplate);

      console.log('\n🌱 Seeding store owner welcome email template...\n');

      const templateData = this.getTemplateData();
      const existingTemplate = await emailTemplateRepository.findOne({
        where: { templateCode: templateData.templateCode },
      });

      if (existingTemplate) {
        // Update existing template
        existingTemplate.name = templateData.name;
        existingTemplate.subject = templateData.subject;
        existingTemplate.htmlContent = templateData.htmlContent;
        existingTemplate.description = templateData.description;
        existingTemplate.variables = templateData.variables;
        await emailTemplateRepository.save(existingTemplate);
        console.log(
          `  ↻ Updated: ${templateData.templateCode} (${templateData.name})`,
        );
        console.log('\n✅ Template updated successfully!\n');
      } else {
        // Create new template
        const template = emailTemplateRepository.create(templateData);
        await emailTemplateRepository.save(template);
        console.log(
          `  ✨ Created: ${templateData.templateCode} (${templateData.name})`,
        );
        console.log('\n✅ Template created successfully!\n');
      }
    } catch (error) {
      console.error(
        '❌ Error seeding store owner welcome email template:',
        error,
      );
      throw error;
    } finally {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        console.log('✅ Database connection closed');
      }
    }
  }

  /**
   * Clear this specific template (use with caution)
   */
  async clear(): Promise<void> {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }

      const emailTemplateRepository =
        this.dataSource.getRepository(EmailTemplate);
      const template = await emailTemplateRepository.findOne({
        where: { templateCode: EmailTemplateCode.STORE_OWNER_WELCOME },
      });

      if (template) {
        await emailTemplateRepository.remove(template);
        console.log('✅ Store owner welcome email template cleared');
      } else {
        console.log('ℹ️  Template not found, nothing to clear');
      }
    } catch (error) {
      console.error('❌ Error clearing template:', error);
      throw error;
    } finally {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
      }
    }
  }
}

/**
 * Run seeder if executed directly
 */
if (require.main === module) {
  const seeder = new StoreOwnerWelcomeEmailTemplateSeeder();
  seeder
    .seed()
    .then(() => {
      console.log('Seeder execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeder execution failed:', error);
      process.exit(1);
    });
}
