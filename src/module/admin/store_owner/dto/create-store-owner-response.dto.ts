import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../user/enum/role.enum';

export class CreateStoreOwnerResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the created user',
    example: '07e23da4-d0dd-4504-8651-def91bfd22f6',
  })
  id: string;

  @ApiProperty({
    description: 'Email address of the created user',
    example: 'owner@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Username of the created user',
    example: 'store_owner_001',
  })
  username: string;

  @ApiProperty({
    description: 'First name of the created user',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the created user',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Full name of the created user',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'Phone number of the created user',
    example: '+1234567890',
  })
  phone: string;

  @ApiProperty({
    description: 'Role of the created user',
    enum: [Role.STORE_OWNER, Role.STORE_MANAGER],
    example: Role.STORE_OWNER,
  })
  role: Role.STORE_OWNER | Role.STORE_MANAGER;

  @ApiProperty({
    description: 'Whether the email is verified',
    example: false,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description:
      'Generated password (only shown if password was auto-generated)',
    example: 'TempPass123!@#',
    required: false,
  })
  generatedPassword?: string;
}
