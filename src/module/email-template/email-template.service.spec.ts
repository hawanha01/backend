import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplate } from './entity/email-template.entity';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

describe('EmailTemplateService', () => {
  let service: EmailTemplateService;

  const mockTemplateId = '123e4567-e89b-12d3-a456-426614174000';
  const mockTemplateCode = 'store-owner-welcome';

  const mockEmailTemplate = {
    id: mockTemplateId,
    templateCode: mockTemplateCode,
    name: 'Store Owner Welcome Email',
    subject: 'Welcome {{firstName}} - Store Owner Account Created',
    htmlContent: '<!DOCTYPE html><html>...</html>',
    description: 'Welcome email sent to store owners',
    variables: ['email', 'firstName', 'lastName', 'password'],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null as Date | null,
    isDeleted: false,
  } as EmailTemplate;

  const mockCreateDto: CreateEmailTemplateDto = {
    templateCode: mockTemplateCode,
    name: 'Store Owner Welcome Email',
    subject: 'Welcome {{firstName}} - Store Owner Account Created',
    htmlContent: '<!DOCTYPE html><html>...</html>',
    description: 'Welcome email sent to store owners',
    variables: ['email', 'firstName', 'lastName', 'password'],
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailTemplateService,
        {
          provide: getRepositoryToken(EmailTemplate),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EmailTemplateService>(EmailTemplateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    // ✅ Positive test case - Get all templates
    it('should return an array of email templates', async () => {
      const mockTemplates = [mockEmailTemplate];
      mockRepository.find.mockResolvedValue(mockTemplates);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', mockTemplateId);
      expect(result[0]).toHaveProperty('templateCode', mockTemplateCode);
      expect(result[0]).toHaveProperty('name');
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isDeleted: false },
        order: { createdAt: 'DESC' },
      });
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    // ✅ Positive test case - Empty array when no templates
    it('should return empty array when no templates exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    // ✅ Positive test case - Only returns non-deleted templates
    it('should only return templates that are not deleted', async () => {
      const deletedTemplate = {
        ...mockEmailTemplate,
        isDeleted: true,
      };
      mockRepository.find.mockResolvedValue([mockEmailTemplate]);

      const result = await service.findAll();

      expect(result).not.toContainEqual(deletedTemplate);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isDeleted: false },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    // ✅ Positive test case - Get template by ID
    it('should return a single email template by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmailTemplate);

      const result = await service.findOne(mockTemplateId);

      expect(result).toHaveProperty('id', mockTemplateId);
      expect(result).toHaveProperty('templateCode', mockTemplateCode);
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('htmlContent');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTemplateId, isDeleted: false },
      });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    // ✅ Negative test case - Template not found
    it('should throw NotFoundException when template not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockTemplateId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(mockTemplateId)).rejects.toThrow(
        'not found',
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTemplateId, isDeleted: false },
      });
    });

    // ✅ Negative test case - Deleted template should not be found
    it('should throw NotFoundException when template is deleted', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockTemplateId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTemplateId, isDeleted: false },
      });
    });
  });

  describe('create', () => {
    // ✅ Positive test case - Create template successfully
    it('should create email template successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null); // No existing template
      mockRepository.create.mockReturnValue(mockEmailTemplate);
      mockRepository.save.mockResolvedValue(mockEmailTemplate);

      const result = await service.create(mockCreateDto);

      expect(result).toHaveProperty('id', mockTemplateId);
      expect(result).toHaveProperty('templateCode', mockTemplateCode);
      expect(result).toHaveProperty('formattedHtmlForSeeder');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { templateCode: mockCreateDto.templateCode, isDeleted: false },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(mockCreateDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockEmailTemplate);
    });

    // ✅ Positive test case - Response includes formatted HTML for seeder
    it('should return formatted HTML for seeder in response', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockEmailTemplate);
      mockRepository.save.mockResolvedValue(mockEmailTemplate);

      const result = await service.create(mockCreateDto);

      expect(result.formattedHtmlForSeeder).toBeDefined();
      expect(result.formattedHtmlForSeeder).toContain('const htmlContent');
      expect(result.formattedHtmlForSeeder).toContain('`');
    });

    // ✅ Negative test case - Duplicate template code
    it('should throw ConflictException when template code already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmailTemplate); // Existing template

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(mockCreateDto)).rejects.toThrow(
        'already exists',
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { templateCode: mockCreateDto.templateCode, isDeleted: false },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    // ✅ Negative test case - Database error during save
    it('should propagate database errors', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockEmailTemplate);
      mockRepository.save.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        'Database connection failed',
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
      const updatedTemplate = {
        ...mockEmailTemplate,
        name: mockUpdateDto.name,
        subject: mockUpdateDto.subject,
      };
      mockRepository.findOne.mockResolvedValue(mockEmailTemplate);
      mockRepository.save.mockResolvedValue(updatedTemplate);

      const result = await service.update(mockTemplateId, mockUpdateDto);

      expect(result.name).toBe(mockUpdateDto.name);
      expect(result.subject).toBe(mockUpdateDto.subject);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTemplateId, isDeleted: false },
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    // ✅ Positive test case - Update template code successfully
    it('should update template code when provided and not duplicate', async () => {
      const newTemplateCode = 'new-template-code';
      const updateDtoWithCode: UpdateEmailTemplateDto = {
        templateCode: newTemplateCode,
      };
      const updatedTemplate = {
        ...mockEmailTemplate,
        templateCode: newTemplateCode,
      };

      mockRepository.findOne.mockImplementation(
        (options: {
          where: { id?: string; templateCode?: string; isDeleted: boolean };
        }) => {
          if (options.where.id === mockTemplateId) {
            return Promise.resolve(mockEmailTemplate);
          }
          if (options.where.templateCode === newTemplateCode) {
            return Promise.resolve(null); // New code doesn't exist
          }
          return Promise.resolve(null);
        },
      );
      mockRepository.save.mockResolvedValue(updatedTemplate);

      const result = await service.update(mockTemplateId, updateDtoWithCode);

      expect(result.templateCode).toBe(newTemplateCode);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2); // Once for ID, once for code check
    });

    // ✅ Positive test case - Response includes formatted HTML for seeder
    it('should return formatted HTML for seeder in update response', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmailTemplate);
      mockRepository.save.mockResolvedValue(mockEmailTemplate);

      const result = await service.update(mockTemplateId, mockUpdateDto);

      expect(result.formattedHtmlForSeeder).toBeDefined();
      expect(result.formattedHtmlForSeeder).toContain('const htmlContent');
    });

    // ✅ Negative test case - Template not found
    it('should throw NotFoundException when template not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(mockTemplateId, mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(mockTemplateId, mockUpdateDto),
      ).rejects.toThrow('not found');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    // ✅ Negative test case - Duplicate template code
    it('should throw ConflictException when new template code already exists', async () => {
      const newTemplateCode = 'existing-template-code';
      const updateDtoWithCode: UpdateEmailTemplateDto = {
        templateCode: newTemplateCode,
      };
      const existingTemplate = {
        ...mockEmailTemplate,
        id: 'another-id',
        templateCode: newTemplateCode,
      };

      mockRepository.findOne.mockImplementation(
        (options: {
          where: { id?: string; templateCode?: string; isDeleted: boolean };
        }) => {
          if (options.where.id === mockTemplateId) {
            return Promise.resolve(mockEmailTemplate);
          }
          if (options.where.templateCode === newTemplateCode) {
            return Promise.resolve(existingTemplate); // Code already exists
          }
          return Promise.resolve(null);
        },
      );

      await expect(
        service.update(mockTemplateId, updateDtoWithCode),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update(mockTemplateId, updateDtoWithCode),
      ).rejects.toThrow('already exists');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    // ✅ Edge case - Updating template code to same value should not check for conflict
    it('should not check for conflict when updating template code to same value', async () => {
      const updateDtoWithSameCode: UpdateEmailTemplateDto = {
        templateCode: mockTemplateCode, // Same as existing
      };

      // Reset mocks to ensure clean state
      mockRepository.findOne.mockReset();
      mockRepository.save.mockReset();
      // Return a fresh copy to avoid mutations from previous tests
      mockRepository.findOne.mockResolvedValue({
        ...mockEmailTemplate,
        templateCode: mockTemplateCode,
      });
      const updatedTemplate = {
        ...mockEmailTemplate,
        templateCode: mockTemplateCode,
      };
      mockRepository.save.mockResolvedValue(updatedTemplate);

      await service.update(mockTemplateId, updateDtoWithSameCode);

      // Should only be called once for finding the template, not for code conflict check
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTemplateId, isDeleted: false },
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    // ✅ Edge case - Partial update
    it('should allow partial updates', async () => {
      const partialUpdate: UpdateEmailTemplateDto = {
        name: 'Only Name Updated',
      };
      const updatedTemplate = {
        ...mockEmailTemplate,
        name: partialUpdate.name,
        templateCode: mockTemplateCode, // Ensure templateCode remains unchanged
      };

      // Reset mocks to ensure clean state
      mockRepository.findOne.mockReset();
      mockRepository.save.mockReset();
      mockRepository.findOne.mockResolvedValue(mockEmailTemplate);
      mockRepository.save.mockResolvedValue(updatedTemplate);

      const result = await service.update(mockTemplateId, partialUpdate);

      expect(result.name).toBe(partialUpdate.name);
      expect(result.templateCode).toBe(mockTemplateCode); // Should remain unchanged
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    // ✅ Positive test case - Soft delete template successfully
    it('should soft delete email template successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmailTemplate);
      const deletedTemplate = {
        ...mockEmailTemplate,
        isDeleted: true,
        deletedAt: new Date(),
      };
      mockRepository.save.mockResolvedValue(deletedTemplate);

      await service.remove(mockTemplateId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTemplateId, isDeleted: false },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isDeleted: true,
          deletedAt: expect.any(Date) as Date,
        }),
      );
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    // ✅ Positive test case - Sets isDeleted and deletedAt
    it('should set isDeleted to true and deletedAt to current date', async () => {
      // Reset mocks to ensure clean state
      mockRepository.findOne.mockReset();
      mockRepository.save.mockReset();

      const deletedDate = new Date();
      const freshTemplate = {
        ...mockEmailTemplate,
        isDeleted: false,
        deletedAt: null,
      };
      mockRepository.findOne.mockResolvedValue(freshTemplate);
      const deletedTemplate = {
        ...mockEmailTemplate,
        isDeleted: true,
        deletedAt: deletedDate,
      };
      mockRepository.save.mockResolvedValue(deletedTemplate);

      await service.remove(mockTemplateId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTemplateId, isDeleted: false },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isDeleted: true,
          deletedAt: expect.any(Date) as Date,
        }),
      );
    });

    // ✅ Negative test case - Template not found
    it('should throw NotFoundException when template not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(mockTemplateId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove(mockTemplateId)).rejects.toThrow('not found');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTemplateId, isDeleted: false },
      });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    // ✅ Edge case - Already deleted template should not be found
    it('should throw NotFoundException when trying to delete already deleted template', async () => {
      mockRepository.findOne.mockResolvedValue(null); // Not found because isDeleted is true

      await expect(service.remove(mockTemplateId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
