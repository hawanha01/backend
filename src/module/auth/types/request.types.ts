import { Request as ExpressRequest } from 'express';
import { User } from '../../user/entity/user.entity';
import { JwtPayload } from '../strategies/jwt.strategy';

// Extended Request type with user property
export interface AuthenticatedRequest extends ExpressRequest {
  user: User;
  refreshTokenPayload?: JwtPayload;
}

// Global interface extension for Express Request

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
      refreshTokenPayload?: JwtPayload;
    }
  }
}
