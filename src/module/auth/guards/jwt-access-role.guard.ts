import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../strategies/jwt.strategy';
import { User } from '../../user/entity/user.entity';
import { DataSource } from 'typeorm';
import { config } from '../../../config/env';

@Injectable()
export class JwtAccessRoleGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token not provided');
    }

    try {
      const accessSecret = config.jwt.accessSecret;
      if (!accessSecret) {
        throw new InternalServerErrorException(
          'JWT_ACCESS_SECRET is not configured',
        );
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: accessSecret,
      });

      if (!payload.sub) {
        throw new BadRequestException('User ID not found in token');
      }

      const user = await this.dataSource.getRepository(User).findOne({
        where: {
          id: payload.sub,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.isDeleted) {
        throw new UnauthorizedException('User account is deleted');
      }
      // Attach user info to request
      request.user = user;

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      // Log unexpected errors for debugging
      console.error('Unexpected error in JwtAccessRoleGuard:', error);
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
