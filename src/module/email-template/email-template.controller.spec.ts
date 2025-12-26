import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { EmailTemplateController } from './email-template.controller';
import { EmailTemplateService } from './email-template.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import {
  EmailTemplateResponseDto,
  EmailTemplateWithHtmlResponseDto,
} from './dto/email-template-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('EmailTemplateController', () => {
  let controller: EmailTemplateController;

  const mockEmailTemplateService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockTemplateId = '123e4567-e89b-12d3-a456-426614174000';

  const mockCreateDto: CreateEmailTemplateDto = {
    templateCode: 'store-owner-welcome',
    name: 'Store Owner Welcome Email',
    subject: 'Welcome {{firstName}} - Store Owner Account Created',
    htmlContent: '<!DOCTYPE html><html>...</html>',
    description: 'Welcome email sent to store owners',
    variables: ['email', 'firstName', 'lastName', 'password'],
  };

  const mockResponse: EmailTemplateResponseDto = {
    id: mockTemplateId,
    templateCode: 'store-owner-welcome',
    name: 'Store Owner Welcome Email',
    subject: 'Welcome {{firstName}} - Store Owner Account Created',
    htmlContent: '<!DOCTYPE html><html>...</html>',
    description: 'Welcome email sent to store owners',
    variables: ['email', 'firstName', 'lastName', 'password'],
  };

  const mockResponseWithHtml: EmailTemplateWithHtmlResponseDto = {
    ...mockResponse,
    formattedHtmlForSeeder:
      'const htmlContent = `<!DOCTYPE html><html>...</html>`;',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailTemplateController],
      providers: [
        {
          provide: EmailTemplateService,
          useValue: mockEmailTemplateService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<EmailTemplateController>(EmailTemplateController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    // ✅ Positive test case - Get all templates
    it('should return an array of email templates', async () => {
      const mockTemplates: EmailTemplateResponseDto[] = [mockResponse];
      mockEmailTemplateService.findAll.mockResolvedValue(mockTemplates);

      const result = await controller.findAll();

      expect(result).toEqual(mockTemplates);
      expect(mockEmailTemplateService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('templateCode');
      expect(result[0]).toHaveProperty('name');
    });

    // ✅ Positive test case - Empty array when no templates
    it('should return empty array when no templates exist', async () => {
      mockEmailTemplateService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockEmailTemplateService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    // ✅ Positive test case - Get template by ID
    it('should return a single email template by ID', async () => {
      mockEmailTemplateService.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne(mockTemplateId);

      expect(result).toEqual(mockResponse);
      expect(result.id).toBe(mockTemplateId);
      expect(mockEmailTemplateService.findOne).toHaveBeenCalledWith(
        mockTemplateId,
      );
      expect(mockEmailTemplateService.findOne).toHaveBeenCalledTimes(1);
    });

    // ✅ Negative test case - Template not found
    it('should throw NotFoundException when template not found', async () => {
      mockEmailTemplateService.findOne.mockRejectedValue(
        new NotFoundException(
          `Email template with ID "${mockTemplateId}" not found`,
        ),
      );

      await expect(controller.findOne(mockTemplateId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.findOne(mockTemplateId)).rejects.toThrow(
        'not found',
      );
      expect(mockEmailTemplateService.findOne).toHaveBeenCalledWith(
        mockTemplateId,
      );
    });
  });

  describe('create', () => {
    // ✅ Positive test case - Create template successfully
    it('should create email template successfully', async () => {
      mockEmailTemplateService.create.mockResolvedValue(mockResponseWithHtml);

      const result = await controller.create(mockCreateDto);

      expect(result).toEqual(mockResponseWithHtml);
      expect(result).toHaveProperty('formattedHtmlForSeeder');
      expect(mockEmailTemplateService.create).toHaveBeenCalledWith(
        mockCreateDto,
      );
      expect(mockEmailTemplateService.create).toHaveBeenCalledTimes(1);
    });

    // ✅ Positive test case - Response includes formatted HTML for seeder
    it('should return formatted HTML for seeder in response', async () => {
      mockEmailTemplateService.create.mockResolvedValue(mockResponseWithHtml);

      const result = await controller.create(mockCreateDto);

      expect(result.formattedHtmlForSeeder).toBeDefined();
      expect(result.formattedHtmlForSeeder).toContain('const htmlContent');
      expect(result.formattedHtmlForSeeder).toContain('`');
    });

    // ✅ Negative test case - Duplicate template code
    it('should throw ConflictException when template code already exists', async () => {
      mockEmailTemplateService.create.mockRejectedValue(
        new ConflictException(
          `Email template with code "${mockCreateDto.templateCode}" already exists`,
        ),
      );

      await expect(controller.create(mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(controller.create(mockCreateDto)).rejects.toThrow(
        'already exists',
      );
      expect(mockEmailTemplateService.create).toHaveBeenCalledWith(
        mockCreateDto,
      );
    });
  });

  describe('update', () => {
    const mockUpdateDto: UpdateEmailTemplateDto = {
      name: 'Updated Template Name',
      subject: 'Updated Subject',
    };

    // ✅ Positive test case - Update template successfully
    it('should update email template successfully', async () => {
      const updatedResponse = {
        ...mockResponseWithHtml,
        name: mockUpdateDto.name,
        subject: mockUpdateDto.subject,
      };
      mockEmailTemplateService.update.mockResolvedValue(updatedResponse);

      const result = await controller.update(mockTemplateId, mockUpdateDto);

      expect(result).toEqual(updatedResponse);
      expect(result.name).toBe(mockUpdateDto.name);
      expect(result.subject).toBe(mockUpdateDto.subject);
      expect(mockEmailTemplateService.update).toHaveBeenCalledWith(
        mockTemplateId,
        mockUpdateDto,
      );
      expect(mockEmailTemplateService.update).toHaveBeenCalledTimes(1);
    });

    // ✅ Positive test case - Response includes formatted HTML for seeder
    it('should return formatted HTML for seeder in update response', async () => {
      mockEmailTemplateService.update.mockResolvedValue(mockResponseWithHtml);

      const result = await controller.update(mockTemplateId, mockUpdateDto);

      expect(result.formattedHtmlForSeeder).toBeDefined();
      expect(result.formattedHtmlForSeeder).toContain('const htmlContent');
    });

    // ✅ Negative test case - Template not found
    it('should throw NotFoundException when template not found', async () => {
      mockEmailTemplateService.update.mockRejectedValue(
        new NotFoundException(
          `Email template with ID "${mockTemplateId}" not found`,
        ),
      );

      await expect(
        controller.update(mockTemplateId, mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.update(mockTemplateId, mockUpdateDto),
      ).rejects.toThrow('not found');
    });

    // ✅ Negative test case - Duplicate template code
    it('should throw ConflictException when new template code already exists', async () => {
      const updateDtoWithCode: UpdateEmailTemplateDto = {
        templateCode: 'existing-template-code',
      };
      mockEmailTemplateService.update.mockRejectedValue(
        new ConflictException(
          `Email template with code "existing-template-code" already exists`,
        ),
      );

      await expect(
        controller.update(mockTemplateId, updateDtoWithCode),
      ).rejects.toThrow(ConflictException);
      await expect(
        controller.update(mockTemplateId, updateDtoWithCode),
      ).rejects.toThrow('already exists');
    });
  });

  describe('remove', () => {
    // ✅ Positive test case - Delete template successfully
    it('should delete email template successfully', async () => {
      mockEmailTemplateService.remove.mockResolvedValue(undefined);

      await controller.remove(mockTemplateId);

      expect(mockEmailTemplateService.remove).toHaveBeenCalledWith(
        mockTemplateId,
      );
      expect(mockEmailTemplateService.remove).toHaveBeenCalledTimes(1);
    });

    // ✅ Negative test case - Template not found
    it('should throw NotFoundException when template not found', async () => {
      mockEmailTemplateService.remove.mockRejectedValue(
        new NotFoundException(
          `Email template with ID "${mockTemplateId}" not found`,
        ),
      );

      await expect(controller.remove(mockTemplateId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.remove(mockTemplateId)).rejects.toThrow(
        'not found',
      );
      expect(mockEmailTemplateService.remove).toHaveBeenCalledWith(
        mockTemplateId,
      );
    });
  });
});
