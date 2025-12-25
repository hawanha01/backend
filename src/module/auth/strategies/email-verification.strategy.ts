import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { config } from '../../../config/env';

export interface EmailVerificationPayload {
  sub: string; // userId
  email: string;
  type: 'email_verification';
  iat?: number;
  exp?: number;
}

@Injectable()
export class EmailVerificationStrategy extends PassportStrategy(
  Strategy,
  'email-verification',
) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
      secretOrKey: config.jwt.emailVerificationSecret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: EmailVerificationPayload): Promise<User> {
    if (!payload || !payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    if (payload.type !== 'email_verification') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub, email: payload.email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isDeleted) {
      throw new UnauthorizedException('User account is deleted');
    }

    return user;
  }
}
