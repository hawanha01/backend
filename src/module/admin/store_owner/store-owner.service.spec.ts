import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { StoreOwnerService } from './store-owner.service';
import { User } from '../../user/entity/user.entity';
import { CreateStoreOwnerDto } from './dto/create-store-owner.dto';
import { Role } from '../../user/enum/role.enum';
import { EmailQueue } from '../../queue/queues/email/email.queue';
import { AuthService } from '../../auth/auth.service';
import * as argon2 from 'argon2';

// Mock argon2
jest.mock('argon2', () => ({
  hash: jest.fn(),
  argon2id: 'argon2id',
}));

describe('StoreOwnerService', () => {
  let service: StoreOwnerService;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'owner@example.com',
    username: 'store_owner_001',
    password: 'hashedPassword123',
    refreshToken: null,
    role: Role.STORE_OWNER,
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    phone: '+1234567890',
    avatar: null,
    isEmailVerified: false,
    lastLoginAt: null,
    userStores: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    isDeleted: false,
    updateFullName: jest.fn(),
  } as unknown as User;

  const mockCreateDto: CreateStoreOwnerDto = {
    email: 'owner@example.com',
    username: 'store_owner_001',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    role: Role.STORE_OWNER,
  };

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEmailQueue = {
    addStoreOwnerWelcomeEmail: jest.fn(),
  };

  const mockAuthService = {
    generateEmailVerificationToken: jest.fn(),
  };

  beforeEach(async () => {
    // Set up environment variables for config
    process.env.BREVO_API_KEY = 'test-brevo-key';
    process.env.BREVO_SENDER_EMAIL = 'test@example.com';
    process.env.BREVO_SENDER_NAME = 'Test Sender';
    process.env.JWT_EMAIL_VERIFICATION_SECRET =
      'test-email-verification-secret';
    process.env.JWT_EMAIL_VERIFICATION_EXPIRES_IN = '24h';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.REDIS_HOST = 'localhost';
    process.env.REDIS_PORT = '6379';
    process.env.REDIS_DB = '0';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreOwnerService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: EmailQueue,
          useValue: mockEmailQueue,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<StoreOwnerService>(StoreOwnerService);

    // Set up default mocks
    (argon2.hash as jest.Mock).mockResolvedValue('hashedPassword123');
    mockAuthService.generateEmailVerificationToken.mockReturnValue(
      'mock-verification-token',
    );
    mockEmailQueue.addStoreOwnerWelcomeEmail.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createStoreOwner', () => {
    // ✅ Positive test case - Successful creation
    it('should create store owner successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null); // No existing user
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.createStoreOwner(mockCreateDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', mockCreateDto.email);
      expect(result).toHaveProperty('username', mockCreateDto.username);
      expect(result).toHaveProperty('role', Role.STORE_OWNER);
      expect(result).toHaveProperty('isEmailVerified', false);
      expect(result).toHaveProperty('generatedPassword');
      expect(result.generatedPassword).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2); // Check email and username
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(argon2.hash).toHaveBeenCalled();
    });

    // ✅ Positive test case - Password is always generated
    it('should always generate a secure password', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.createStoreOwner(mockCreateDto);

      expect(result.generatedPassword).toBeDefined();
      expect(result.generatedPassword).toMatch(/^.{16}$/); // 16 characters
      expect(argon2.hash).toHaveBeenCalledWith(
        expect.stringMatching(/^.{16}$/),
        { type: argon2.argon2id },
      );
    });

    // ✅ Positive test case - Email is always unverified
    it('should always set isEmailVerified to false', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.createStoreOwner(mockCreateDto);

      expect(result.isEmailVerified).toBe(false);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isEmailVerified: false,
        }),
      );
    });

    // ✅ Positive test case - Password is hashed before saving
    it('should hash password before saving to database', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      await service.createStoreOwner(mockCreateDto);

      expect(argon2.hash).toHaveBeenCalledWith(expect.any(String), {
        type: argon2.argon2id,
      });
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashedPassword123',
        }),
      );
    });

    // ✅ Negative test case - Invalid role
    it('should throw BadRequestException when role is not store_owner', async () => {
      const invalidDto = {
        ...mockCreateDto,
        role: Role.ADMIN,
      } as unknown as CreateStoreOwnerDto;

      await expect(service.createStoreOwner(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createStoreOwner(invalidDto)).rejects.toThrow(
        'Role must be store_owner',
      );
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    // ✅ Negative test case - Duplicate email
    it('should throw ConflictException when email already exists', async () => {
      const existingUser = {
        ...mockUser,
        email: mockCreateDto.email,
      };

      // Mock findOne to return existing user when checking email
      mockRepository.findOne.mockImplementation(
        (options: { where: { email?: string; username?: string } }) => {
          if (options.where.email === mockCreateDto.email) {
            return Promise.resolve(existingUser);
          }
          return Promise.resolve(null);
        },
      );

      await expect(service.createStoreOwner(mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createStoreOwner(mockCreateDto)).rejects.toThrow(
        'already exists',
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockCreateDto.email },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    // ✅ Negative test case - Duplicate username
    it('should throw ConflictException when username already exists', async () => {
      const existingUser = {
        ...mockUser,
        username: mockCreateDto.username,
      };

      // Mock findOne to return null for email check, existing user for username check
      mockRepository.findOne.mockImplementation(
        (options: { where: { email?: string; username?: string } }) => {
          if (options.where.email === mockCreateDto.email) {
            return Promise.resolve(null);
          }
          if (options.where.username === mockCreateDto.username) {
            return Promise.resolve(existingUser);
          }
          return Promise.resolve(null);
        },
      );

      await expect(service.createStoreOwner(mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createStoreOwner(mockCreateDto)).rejects.toThrow(
        'already exists',
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { username: mockCreateDto.username },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    // ✅ Negative test case - Database error during save
    it('should propagate database errors', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.createStoreOwner(mockCreateDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    // ✅ Edge case - Generated password contains required character types
    it('should generate password with uppercase, lowercase, number, and special character', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      // Run multiple times to ensure password generation is consistent
      const passwords: string[] = [];
      for (let i = 0; i < 5; i++) {
        const result = await service.createStoreOwner(mockCreateDto);
        passwords.push(result.generatedPassword || '');
        jest.clearAllMocks();
        mockRepository.findOne.mockResolvedValue(null);
        mockRepository.create.mockReturnValue(mockUser);
        mockRepository.save.mockResolvedValue(mockUser);
      }

      // Check each password has required characters
      passwords.forEach((password) => {
        expect(password).toMatch(/[A-Z]/); // Uppercase
        expect(password).toMatch(/[a-z]/); // Lowercase
        expect(password).toMatch(/\d/); // Number
        expect(password).toMatch(/[@$!%*?&]/); // Special character
        expect(password.length).toBe(16);
      });
    });

    // ✅ Edge case - Full name is generated correctly
    it('should create user with correct full name', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const userWithFullName = {
        ...mockUser,
        fullName: `${mockCreateDto.firstName} ${mockCreateDto.lastName}`,
      };
      mockRepository.create.mockReturnValue(userWithFullName);
      mockRepository.save.mockResolvedValue(userWithFullName);

      const result = await service.createStoreOwner(mockCreateDto);

      expect(result.fullName).toBe('John Doe');
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: mockCreateDto.firstName,
          lastName: mockCreateDto.lastName,
        }),
      );
    });

    // ✅ Positive test case - Adds welcome email job to queue after user creation
    it('should add welcome email job to queue after creating store owner', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      await service.createStoreOwner(mockCreateDto);

      expect(
        mockAuthService.generateEmailVerificationToken,
      ).toHaveBeenCalledWith(mockUser);
      expect(mockEmailQueue.addStoreOwnerWelcomeEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockCreateDto.email,
          firstName: mockCreateDto.firstName,
          lastName: mockCreateDto.lastName,
          password: expect.any(String) as string,
          verificationLink: expect.stringContaining(
            'http://localhost:5173/verify-email?token=',
          ) as string,
        }),
      );
    });

    // ✅ Positive test case - Email verification token is generated
    it('should generate email verification token for new user', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      await service.createStoreOwner(mockCreateDto);

      expect(
        mockAuthService.generateEmailVerificationToken,
      ).toHaveBeenCalledWith(mockUser);
      expect(
        mockAuthService.generateEmailVerificationToken,
      ).toHaveBeenCalledTimes(1);
    });

    // ✅ Edge case - Queue failure does not prevent user creation
    it('should create user even if email queue fails', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);
      mockEmailQueue.addStoreOwnerWelcomeEmail.mockRejectedValue(
        new Error('Queue service unavailable'),
      );

      const result = await service.createStoreOwner(mockCreateDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockCreateDto.email);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
