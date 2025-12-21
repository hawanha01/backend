import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAccessRoleGuard } from './guards/jwt-access-role.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RolesGuard } from './guards/roles.guard';
import { User } from '../user/entity/user.entity';
import { config } from '../../config/env';
import './types/request.types';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => {
        const accessSecret = config.jwt.accessSecret;
        const accessExpiresIn = config.jwt.accessExpiresIn;

        if (!accessSecret) {
          throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
        }

        return {
          secret: accessSecret,
          signOptions: {
            expiresIn: accessExpiresIn,
          } as any,
        };
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAccessRoleGuard,
    JwtRefreshGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    JwtModule,
    PassportModule,
    JwtAccessRoleGuard,
    JwtRefreshGuard,
    RolesGuard,
  ],
})
export class AuthModule {}

