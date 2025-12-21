import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { User } from '../user/entity/user.entity';
import { Role } from '../user/enum/role.enum';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
  };

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword',
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

  const mockLoginResponse: LoginResponseDto = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    userId: mockUser.id,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtRefreshGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtRefreshGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    // ✅ Positive test case - Successful login
    it('should login successfully and return tokens', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockLoginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto, undefined);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.userId).toBe(mockUser.id);
    });

    // ✅ Positive test case - Successful login with role header
    it('should login successfully when role header matches user role', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto, Role.ADMIN);

      expect(result).toEqual(mockLoginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto, Role.ADMIN);
    });

    // ✅ Negative test case - Invalid credentials (user not found)
    it('should throw UnauthorizedException when user not found', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid email or password'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto, undefined);
    });

    // ✅ Negative test case - Invalid password
    it('should throw UnauthorizedException when password is incorrect', async () => {
      const invalidLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid email or password'),
      );

      await expect(controller.login(invalidLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    // ✅ Negative test case - Role mismatch
    it('should throw BadRequestException when role header does not match user role', async () => {
      mockAuthService.login.mockRejectedValue(
        new BadRequestException(
          `User role mismatch. Expected: ${Role.STORE_OWNER}, Found: ${Role.ADMIN}`,
        ),
      );

      await expect(
        controller.login(loginDto, Role.STORE_OWNER),
      ).rejects.toThrow(BadRequestException);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto,
        Role.STORE_OWNER,
      );
    });

    // ✅ Negative test case - Deleted user
    it('should throw UnauthorizedException when user account is deleted', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('User account is deleted'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    const mockRequest = {
      user: mockUser,
    } as unknown as Request;

    // ✅ Positive test case - Successful token refresh
    it('should refresh tokens successfully', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockLoginResponse);

      const result = await controller.refresh(mockRequest);

      expect(result).toEqual(mockLoginResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(mockUser);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.userId).toBe(mockUser.id);
    });

    // ✅ Negative test case - User not found in request
    it('should throw error when user is not found in request', async () => {
      const invalidRequest = {
        user: null,
      } as unknown as Request;

      // The service should throw when user is null/undefined
      mockAuthService.refreshToken.mockRejectedValue(
        new Error('User is required'),
      );

      await expect(controller.refresh(invalidRequest)).rejects.toThrow();
    });

    // ✅ Negative test case - Invalid refresh token
    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Invalid or expired refresh token'),
      );

      await expect(controller.refresh(mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    // ✅ Negative test case - Deleted user
    it('should throw UnauthorizedException when user account is deleted', async () => {
      const deletedUser = { ...mockUser, isDeleted: true };
      const requestWithDeletedUser = {
        user: deletedUser,
      } as unknown as Request;

      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('User account is deleted'),
      );

      await expect(controller.refresh(requestWithDeletedUser)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
