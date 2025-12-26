import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { EmailTemplateService } from './email-template.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import {
  EmailTemplateResponseDto,
  EmailTemplateWithHtmlResponseDto,
} from './dto/email-template-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/enum/role.enum';

@ApiTags('email-templates')
@Controller('email-templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all email templates',
    description: 'Retrieve a list of all email templates',
  })
  @ApiResponse({
    status: 200,
    description: 'List of email templates',
    type: [EmailTemplateResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required',
  })
  async findAll(): Promise<EmailTemplateResponseDto[]> {
    return this.emailTemplateService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get email template by ID',
    description: 'Retrieve a single email template by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Email template UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Email template found',
    type: EmailTemplateResponseDto,
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
    status: 404,
    description: 'Email template not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EmailTemplateResponseDto> {
    return this.emailTemplateService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new email template',
    description:
      'Create a new email template. Returns formatted HTML content ready to copy into seeder file.',
  })
  @ApiResponse({
    status: 201,
    description: 'Email template created successfully',
    type: EmailTemplateWithHtmlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
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
    description: 'Conflict - template code already exists',
  })
  async create(
    @Body() createDto: CreateEmailTemplateDto,
  ): Promise<EmailTemplateWithHtmlResponseDto> {
    return this.emailTemplateService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update email template',
    description:
      'Update an existing email template. Returns formatted HTML content ready to copy into seeder file.',
  })
  @ApiParam({
    name: 'id',
    description: 'Email template UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Email template updated successfully',
    type: EmailTemplateWithHtmlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
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
    status: 404,
    description: 'Email template not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - new template code already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplateWithHtmlResponseDto> {
    return this.emailTemplateService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete email template',
    description: 'Soft delete an email template by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Email template UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Email template deleted successfully',
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
    status: 404,
    description: 'Email template not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.emailTemplateService.remove(id);
  }
}
