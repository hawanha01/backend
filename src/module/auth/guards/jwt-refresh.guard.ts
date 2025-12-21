import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from '../../user/entity/user.entity';
import { JwtPayload } from '../strategies/jwt.strategy';
import { config } from '../../../config/env';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromBody(request);

    if (!token) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    try {
      const refreshSecret = config.jwt.refreshSecret;
      if (!refreshSecret) {
        throw new Error('JWT_REFRESH_SECRET is not configured');
      }

      // Verify refresh token
      const payload = jwt.verify(token, refreshSecret) as JwtPayload;

      // Find user and verify refresh token matches
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.isDeleted) {
        throw new UnauthorizedException('User account is deleted');
      }

      // Verify that the refresh token matches the one stored in database
      if (user.refreshToken !== token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      request.user = user;
      
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Refresh token expired');
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private extractTokenFromBody(request: Request): string | undefined {
    return request.body?.refreshToken || request.body?.refresh_token;
  }
}

