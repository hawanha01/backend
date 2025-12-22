import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAccessRoleGuard } from './guards/jwt-access-role.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
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
        const accessSecret: string = config.jwt.accessSecret;
        const accessExpiresIn: string = config.jwt.accessExpiresIn;

        if (!accessSecret) {
          throw new Error(
            'JWT_ACCESS_SECRET is not defined in environment variables',
          );
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return {
          secret: accessSecret,
          signOptions: {
            expiresIn: accessExpiresIn,
          },
        } as any; // Type assertion needed due to StringValue type mismatch
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    JwtAccessRoleGuard,
    JwtRefreshGuard,
    LocalAuthGuard,
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
