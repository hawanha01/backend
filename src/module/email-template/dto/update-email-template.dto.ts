import { PartialType } from '@nestjs/swagger';
import { CreateEmailTemplateDto } from './create-email-template.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmailTemplateDto extends PartialType(
  CreateEmailTemplateDto,
) {
  @ApiProperty({
    description: 'Unique template code identifier (cannot be updated)',
    example: 'store-owner-welcome',
    required: false,
  })
  @IsString({ message: 'Template code must be a string' })
  @IsOptional()
  templateCode?: string;
}
