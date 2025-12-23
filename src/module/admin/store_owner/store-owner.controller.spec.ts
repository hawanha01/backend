import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { StoreOwnerController } from './store-owner.controller';
import { StoreOwnerService } from './store-owner.service';
import { CreateStoreOwnerDto } from './dto/create-store-owner.dto';
import { CreateStoreOwnerResponseDto } from './dto/create-store-owner-response.dto';
import { Role } from '../../user/enum/role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

describe('StoreOwnerController', () => {
  let controller: StoreOwnerController;

  const mockStoreOwnerService = {
    createStoreOwner: jest.fn(),
  };

  const mockCreateDto: CreateStoreOwnerDto = {
    email: 'owner@example.com',
    username: 'store_owner_001',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    role: Role.STORE_OWNER,
  };

  const mockResponse: CreateStoreOwnerResponseDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'owner@example.com',
    username: 'store_owner_001',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    phone: '+1234567890',
    role: Role.STORE_OWNER,
    isEmailVerified: false,
    generatedPassword: 'GeneratedPass123!@#',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreOwnerController],
      providers: [
        {
          provide: StoreOwnerService,
          useValue: mockStoreOwnerService,
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

    controller = module.get<StoreOwnerController>(StoreOwnerController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createStoreOwner', () => {
    // ✅ Positive test case - Successful creation
    it('should create store owner successfully', async () => {
      mockStoreOwnerService.createStoreOwner.mockResolvedValue(mockResponse);

      const result = await controller.createStoreOwner(mockCreateDto);

      expect(result).toEqual(mockResponse);
      expect(mockStoreOwnerService.createStoreOwner).toHaveBeenCalledWith(
        mockCreateDto,
      );
      expect(result.id).toBeDefined();
      expect(result.email).toBe(mockCreateDto.email);
      expect(result.username).toBe(mockCreateDto.username);
      expect(result.role).toBe(Role.STORE_OWNER);
      expect(result.isEmailVerified).toBe(false);
      expect(result.generatedPassword).toBeDefined();
    });

    // ✅ Positive test case - Response contains all required fields
    it('should return response with all required fields', async () => {
      mockStoreOwnerService.createStoreOwner.mockResolvedValue(mockResponse);

      const result = await controller.createStoreOwner(mockCreateDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('fullName');
      expect(result).toHaveProperty('phone');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('isEmailVerified');
      expect(result).toHaveProperty('generatedPassword');
    });

    // ✅ Negative test case - Duplicate email
    it('should throw ConflictException when email already exists', async () => {
      mockStoreOwnerService.createStoreOwner.mockRejectedValue(
        new ConflictException(
          `User with email ${mockCreateDto.email} already exists`,
        ),
      );

      await expect(controller.createStoreOwner(mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(controller.createStoreOwner(mockCreateDto)).rejects.toThrow(
        'already exists',
      );
      expect(mockStoreOwnerService.createStoreOwner).toHaveBeenCalledWith(
        mockCreateDto,
      );
    });

    // ✅ Negative test case - Duplicate username
    it('should throw ConflictException when username already exists', async () => {
      mockStoreOwnerService.createStoreOwner.mockRejectedValue(
        new ConflictException(
          `User with username ${mockCreateDto.username} already exists`,
        ),
      );

      await expect(controller.createStoreOwner(mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(controller.createStoreOwner(mockCreateDto)).rejects.toThrow(
        'already exists',
      );
    });

    // ✅ Negative test case - Invalid role
    it('should throw BadRequestException when role is not store_owner', async () => {
      const invalidDto = {
        ...mockCreateDto,
        role: Role.ADMIN,
      } as unknown as CreateStoreOwnerDto;

      mockStoreOwnerService.createStoreOwner.mockRejectedValue(
        new BadRequestException('Role must be store_owner'),
      );

      await expect(controller.createStoreOwner(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.createStoreOwner(invalidDto)).rejects.toThrow(
        'Role must be store_owner',
      );
    });

    // ✅ Negative test case - Service throws error
    it('should propagate service errors', async () => {
      const error = new Error('Database connection failed');
      mockStoreOwnerService.createStoreOwner.mockRejectedValue(error);

      await expect(controller.createStoreOwner(mockCreateDto)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
