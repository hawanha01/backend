import { ApiProperty } from '@nestjs/swagger';
import { EmailTemplate } from '../entity/email-template.entity';

export class EmailTemplateResponseDto {
  @ApiProperty({ description: 'Template ID' })
  id: string;

  @ApiProperty({ description: 'Template code' })
  templateCode: string;

  @ApiProperty({ description: 'Template name' })
  name: string;

  @ApiProperty({ description: 'Email subject' })
  subject: string;

  @ApiProperty({ description: 'HTML content' })
  htmlContent: string;

  @ApiProperty({ description: 'Template description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Available template variables', nullable: true })
  variables: string[] | null;

  /**
   * Minify HTML by removing all unnecessary whitespace
   */
  private static minifyHtml(html: string): string {
    return html
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .replace(/\s+/g, '') // Remove all remaining whitespace
      .trim();
  }

  static fromEntity(entity: EmailTemplate): EmailTemplateResponseDto {
    return {
      id: entity.id,
      templateCode: entity.templateCode,
      name: entity.name,
      subject: entity.subject,
      htmlContent: this.minifyHtml(entity.htmlContent),
      description: entity.description,
      variables: entity.variables,
    };
  }
}

export class EmailTemplateWithHtmlResponseDto extends EmailTemplateResponseDto {
  @ApiProperty({
    description: 'Formatted HTML content ready to copy into seeder file',
    example: 'const htmlContent = `<!DOCTYPE html>...</html>`;',
  })
  formattedHtmlForSeeder: string;

  static fromEntity(entity: EmailTemplate): EmailTemplateWithHtmlResponseDto {
    const base = EmailTemplateResponseDto.fromEntity(entity);
    // Escape backticks and backslashes for use in template literal
    // Use the already minified HTML from base
    const escapedHtml = base.htmlContent
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\${/g, '\\${');
    return {
      ...base,
      formattedHtmlForSeeder: `const htmlContent = \`${escapedHtml}\`;`,
    };
  }
}
