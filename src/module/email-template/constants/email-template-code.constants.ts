/**
 * Email Template Code Constants
 *
 * This file contains constants for email template codes.
 * These codes should match the templateCode field in the email_templates table.
 *
 * Usage:
 * ```typescript
 * import { EmailTemplateCode } from './constants/email-template-code.constants';
 *
 * // Use in queries
 * const template = await repository.findOne({
 *   where: { templateCode: EmailTemplateCode.STORE_OWNER_WELCOME }
 * });
 * ```
 */
export enum EmailTemplateCode {
  /**
   * Welcome email sent to store owners when their account is created
   * Variables: email, firstName, lastName, password, verificationLink
   */
  STORE_OWNER_WELCOME = 'store-owner-welcome',
}
