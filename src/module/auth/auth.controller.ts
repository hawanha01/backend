import {
  Controller,
  Post,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { EmailVerificationGuard } from './guards/email-verification.guard';
import { User } from '../user/entity/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and return access and refresh tokens',
  })
  @ApiBody({ type: LoginDto })
  @ApiHeader({
    name: 'x-role',
    description: 'Expected user role (optional)',
    required: false,
    example: 'admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - role mismatch or validation error',
  })
  async login(
    @Req() req: Request,
    @Headers('x-role') role?: string,
  ): Promise<LoginResponseDto> {
    const user = req.user as User;
    return this.authService.login(user, role);
  }

  @Post('refresh')
  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generate new access and refresh tokens using a valid refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refresh(@Req() req: Request): Promise<LoginResponseDto> {
    const user = req.user as User;
    return this.authService.refreshToken(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout user and invalidate refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async logout(@Req() req: Request): Promise<{ message: string }> {
    const user = req.user as User;
    await this.authService.logout(user);
    return { message: 'Logout successful' };
  }

  @Get('verify-email')
  @Public()
  @UseGuards(EmailVerificationGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email address',
    description:
      'Verify user email address using token from email verification link',
  })
  @ApiQuery({
    name: 'token',
    description: 'Email verification token from email link',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email verified successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - email already verified',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or expired token',
  })
  async verifyEmail(@Req() req: Request): Promise<{ message: string }> {
    const user = req.user as User;
    await this.authService.verifyEmail(user);
    return { message: 'Email verified successfully' };
  }
}
