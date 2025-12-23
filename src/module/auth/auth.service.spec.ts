import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../user/entity/user.entity';
import { Role } from '../user/enum/role.enum';
import * as jwt from 'jsonwebtoken';
import { config } from '../../config/env';

// Mock argon2
jest.mock('argon2', () => ({
  verify: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword123',
    refreshToken: null,
    role: Role.ADMIN,
    firstName: 'Test',
    lastName: 'User',
    fullName: 'Test User',
    phone: '+1234567890',
    avatar: null,
    isEmailVerified: true,
    lastLoginAt: null,
    userStores: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    isDeleted: false,
    updateFullName: jest.fn(),
  } as unknown as User;

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Set up default mocks
    (jwt.sign as jest.Mock).mockReturnValue('mock-refresh-token');
    mockJwtService.sign.mockReturnValue('mock-access-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    // ✅ Positive test case - Successful login
    it('should login successfully and return tokens', async () => {
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.login(mockUser);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('userId');
      expect(result.userId).toBe(mockUser.id);
      expect(mockRepository.save).toHaveBeenCalledTimes(2); // Once for lastLoginAt, once for refreshToken
    });

    // ✅ Positive test case - Successful login with role validation
    it('should login successfully when role matches', async () => {
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.login(mockUser, Role.ADMIN);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    // ✅ Negative test case - User not found
    it('should throw UnauthorizedException when user is null', async () => {
      await expect(service.login(null as unknown as User)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(null as unknown as User)).rejects.toThrow(
        'User not found',
      );
    });

    // ✅ Negative test case - User is undefined
    it('should throw UnauthorizedException when user is undefined', async () => {
      await expect(service.login(undefined as unknown as User)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(undefined as unknown as User)).rejects.toThrow(
        'User not found',
      );
    });

    // ✅ Negative test case - Role mismatch
    it('should throw BadRequestException when role does not match', async () => {
      mockRepository.save.mockResolvedValue(mockUser);

      await expect(service.login(mockUser, Role.STORE_OWNER)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login(mockUser, Role.STORE_OWNER)).rejects.toThrow(
        'User role mismatch',
      );
    });

    // ✅ Negative test case - Missing JWT secrets
    it('should throw error when JWT secrets are not configured', async () => {
      const originalAccessSecret: string = config.jwt.accessSecret;
      const originalRefreshSecret: string = config.jwt.refreshSecret;

      // Temporarily set secrets to undefined
      Object.defineProperty(config.jwt, 'accessSecret', {
        value: undefined as string | undefined,
        writable: true,
      });

      mockRepository.save.mockResolvedValue(mockUser);

      await expect(service.login(mockUser)).rejects.toThrow(
        'JWT secrets are not configured',
      );

      // Restore original values
      Object.defineProperty(config.jwt, 'accessSecret', {
        value: originalAccessSecret,
        writable: true,
      });
      Object.defineProperty(config.jwt, 'refreshSecret', {
        value: originalRefreshSecret,
        writable: true,
      });
    });

    // ✅ Edge case - Updates lastLoginAt timestamp
    it('should update lastLoginAt timestamp on successful login', async () => {
      mockRepository.save.mockResolvedValue(mockUser);

      await service.login(mockUser);

      expect(mockRepository.save).toHaveBeenCalled();
      const saveCalls = mockRepository.save.mock.calls as Array<[User]>;
      if (saveCalls && saveCalls[0] && saveCalls[0][0]) {
        const saveCall = saveCalls[0][0];
        expect(saveCall?.lastLoginAt).toBeInstanceOf(Date);
      }
    });
  });

  describe('refreshToken', () => {
    // ✅ Positive test case - Successful token refresh
    it('should refresh tokens successfully', async () => {
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.refreshToken(mockUser);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('userId');
      expect(result.userId).toBe(mockUser.id);
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    // ✅ Positive test case - Generates new refresh token
    it('should generate new refresh token and save to database', async () => {
      const newRefreshToken = 'new-refresh-token';
      (jwt.sign as jest.Mock).mockReturnValue(newRefreshToken);
      mockRepository.save.mockResolvedValue({
        ...mockUser,
        refreshToken: newRefreshToken,
      });

      await service.refreshToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        }),
        config.jwt.refreshSecret,
        expect.any(Object),
      );
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          refreshToken: newRefreshToken,
        }),
      );
    });

    // ✅ Negative test case - Missing JWT refresh secret
    it('should throw error when JWT_REFRESH_SECRET is not configured', async () => {
      const originalRefreshSecret: string = config.jwt.refreshSecret;

      // Temporarily set secret to undefined
      Object.defineProperty(config.jwt, 'refreshSecret', {
        value: undefined as string | undefined,
        writable: true,
      });

      await expect(service.refreshToken(mockUser)).rejects.toThrow(
        'JWT_REFRESH_SECRET is not configured',
      );

      // Restore original value
      Object.defineProperty(config.jwt, 'refreshSecret', {
        value: originalRefreshSecret,
        writable: true,
      });
    });

    // ✅ Edge case - Token payload contains correct user information
    it('should include correct user information in token payload', async () => {
      mockRepository.save.mockResolvedValue(mockUser);

      await service.refreshToken(mockUser);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        }),
      );
    });
  });
});
