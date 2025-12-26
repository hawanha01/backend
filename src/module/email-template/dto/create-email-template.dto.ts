import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmailTemplateDto {
  @ApiProperty({
    description: 'Unique template code identifier',
    example: 'store-owner-welcome',
    maxLength: 100,
  })
  @IsString({ message: 'Template code must be a string' })
  @IsNotEmpty({ message: 'Template code is required' })
  @MaxLength(100, { message: 'Template code must not exceed 100 characters' })
  templateCode: string;

  @ApiProperty({
    description: 'Human-readable template name',
    example: 'Store Owner Welcome Email',
    maxLength: 255,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;

  @ApiProperty({
    description:
      'Email subject line (can contain template variables like {{variableName}})',
    example: 'Welcome {{firstName}} - Store Owner Account Created',
    maxLength: 500,
  })
  @IsString({ message: 'Subject must be a string' })
  @IsNotEmpty({ message: 'Subject is required' })
  @MaxLength(500, { message: 'Subject must not exceed 500 characters' })
  subject: string;

  @ApiProperty({
    description:
      'HTML email content with inline CSS (can contain template variables like {{variableName}})',
    example: '<!DOCTYPE html><html>...</html>',
  })
  @IsString({ message: 'HTML content must be a string' })
  @IsNotEmpty({ message: 'HTML content is required' })
  htmlContent: string;

  @ApiProperty({
    description: 'Template description',
    example: 'Welcome email sent to store owners when their account is created',
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Array of available template variables',
    example: ['email', 'firstName', 'lastName', 'password', 'verificationLink'],
    required: false,
    type: [String],
  })
  @IsArray({ message: 'Variables must be an array' })
  @IsString({ each: true, message: 'Each variable must be a string' })
  @IsOptional()
  variables?: string[];
}
