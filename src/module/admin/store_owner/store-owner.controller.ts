import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StoreOwnerService } from './store-owner.service';
import { CreateStoreOwnerDto } from './dto/create-store-owner.dto';
import { CreateStoreOwnerResponseDto } from './dto/create-store-owner-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../user/enum/role.enum';

@ApiTags('admin')
@Controller('admin/store-owners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class StoreOwnerController {
  constructor(private readonly storeOwnerService: StoreOwnerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create store owner or manager',
    description:
      'Create a new store owner or store manager. Password is optional - if not provided, a secure password will be generated automatically. Email will always be unverified.',
  })
  @ApiResponse({
    status: 201,
    description: 'Store owner/manager created successfully',
    type: CreateStoreOwnerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or invalid role',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - user with email or username already exists',
  })
  async createStoreOwner(
    @Body() createDto: CreateStoreOwnerDto,
  ): Promise<CreateStoreOwnerResponseDto> {
    return this.storeOwnerService.createStoreOwner(createDto);
  }
}
