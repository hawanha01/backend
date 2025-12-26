import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from './entity/email-template.entity';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import {
  EmailTemplateResponseDto,
  EmailTemplateWithHtmlResponseDto,
} from './dto/email-template-response.dto';

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);

  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  /**
   * Get all email templates
   */
  async findAll(): Promise<EmailTemplateResponseDto[]> {
    const templates = await this.emailTemplateRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });

    return templates.map((template) =>
      EmailTemplateResponseDto.fromEntity(template),
    );
  }

  /**
   * Get a single email template by ID
   */
  async findOne(id: string): Promise<EmailTemplateResponseDto> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!template) {
      throw new NotFoundException(`Email template with ID "${id}" not found`);
    }

    return EmailTemplateResponseDto.fromEntity(template);
  }

  /**
   * Create a new email template
   */
  async create(
    createDto: CreateEmailTemplateDto,
  ): Promise<EmailTemplateWithHtmlResponseDto> {
    // Check if template with same code already exists
    const existingTemplate = await this.emailTemplateRepository.findOne({
      where: { templateCode: createDto.templateCode, isDeleted: false },
    });

    if (existingTemplate) {
      throw new ConflictException(
        `Email template with code "${createDto.templateCode}" already exists`,
      );
    }

    const template = this.emailTemplateRepository.create(createDto);
    const savedTemplate = await this.emailTemplateRepository.save(template);

    this.logger.log(
      `Email template created: ${savedTemplate.templateCode} (${savedTemplate.id})`,
    );

    return EmailTemplateWithHtmlResponseDto.fromEntity(savedTemplate);
  }

  /**
   * Update an existing email template
   */
  async update(
    id: string,
    updateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplateWithHtmlResponseDto> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!template) {
      throw new NotFoundException(`Email template with ID "${id}" not found`);
    }

    // If templateCode is being updated, check if new code already exists
    if (
      updateDto.templateCode &&
      updateDto.templateCode !== template.templateCode
    ) {
      const existingTemplate = await this.emailTemplateRepository.findOne({
        where: { templateCode: updateDto.templateCode, isDeleted: false },
      });

      if (existingTemplate) {
        throw new ConflictException(
          `Email template with code "${updateDto.templateCode}" already exists`,
        );
      }
    }

    // Update template fields
    Object.assign(template, updateDto);
    const updatedTemplate = await this.emailTemplateRepository.save(template);

    this.logger.log(
      `Email template updated: ${updatedTemplate.templateCode} (${updatedTemplate.id})`,
    );

    return EmailTemplateWithHtmlResponseDto.fromEntity(updatedTemplate);
  }

  /**
   * Delete (soft delete) an email template
   */
  async remove(id: string): Promise<void> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!template) {
      throw new NotFoundException(`Email template with ID "${id}" not found`);
    }

    template.isDeleted = true;
    template.deletedAt = new Date();
    await this.emailTemplateRepository.save(template);

    this.logger.log(
      `Email template deleted: ${template.templateCode} (${template.id})`,
    );
  }
}
