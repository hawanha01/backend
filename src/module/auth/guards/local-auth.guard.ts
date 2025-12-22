import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // For LocalAuthGuard, we always want to run authentication
    // (even for public endpoints like login, we need to validate credentials)
    // So we don't check for @Public() here - authentication is required
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    _info: any,
    _context: ExecutionContext,
    _status?: any,
  ): TUser {
    // Handle authentication errors properly
    if (err) {
      throw err;
    }
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user as TUser;
  }
}
