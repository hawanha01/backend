import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { User } from '../user/entity/user.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { config } from '../../config/env';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, role?: string): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is deleted
    if (user.isDeleted) {
      throw new UnauthorizedException('User account is deleted');
    }

    // If role is provided in headers, validate it matches user's role
    if (role && user.role !== role) {
      throw new BadRequestException(
        `User role mismatch. Expected: ${role}, Found: ${user.role}`,
      );
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessSecret = config.jwt.accessSecret;
    const refreshSecret = config.jwt.refreshSecret;
    const accessExpiresIn = config.jwt.accessExpiresIn || '15m';
    const refreshExpiresIn = config.jwt.refreshExpiresIn || '7d';

    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets are not configured');
    }

    // Generate access token using JwtService (expiresIn handled in module config)
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token using jsonwebtoken directly (different secret)
    const refreshToken = jwt.sign(payload, refreshSecret, {
      expiresIn: refreshExpiresIn,
    } as jwt.SignOptions);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
      userId: user.id,
    };
  }

  async refreshToken(user: User): Promise<LoginResponseDto> {
    // Generate new tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshSecret = config.jwt.refreshSecret;
    const refreshExpiresIn = config.jwt.refreshExpiresIn || '7d';

    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }

    // Generate new access token
    const accessToken = this.jwtService.sign(payload);

    // Generate new refresh token
    const refreshToken = jwt.sign(payload, refreshSecret, {
      expiresIn: refreshExpiresIn,
    } as jwt.SignOptions);

    // Save new refresh token to database
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
      userId: user.id,
    };
  }
}
