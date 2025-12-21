import { Request as ExpressRequest } from 'express';
import { User } from '../../user/entity/user.entity';
import { JwtPayload } from '../strategies/jwt.strategy';

// Extended Request type with user property
export interface AuthenticatedRequest extends ExpressRequest {
  user: User;
  refreshTokenPayload?: JwtPayload;
}

// Global namespace extension for Express Request
declare global {
  namespace Express {
    interface Request {
      user?: User;
      refreshTokenPayload?: JwtPayload;
    }
  }
}

