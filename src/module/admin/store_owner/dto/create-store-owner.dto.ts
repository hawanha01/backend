import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../user/enum/role.enum';

export class CreateStoreOwnerDto {
  @ApiProperty({
    description: 'Email address of the store owner/manager',
    example: 'owner@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Username for the store owner/manager',
    example: 'store_owner_001',
  })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  username: string;

  @ApiProperty({
    description: 'First name of the store owner/manager',
    example: 'John',
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the store owner/manager',
    example: 'Doe',
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @ApiProperty({
    description: 'Phone number of the store owner/manager',
    example: '+1234567890',
  })
  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone is required' })
  phone: string;

  @ApiProperty({
    description: 'Role of the user (store_owner or store_manager)',
    enum: [Role.STORE_OWNER],
    example: Role.STORE_OWNER,
  })
  @IsEnum([Role.STORE_OWNER], {
    message: 'Role must be store_owner',
  })
  @IsNotEmpty({ message: 'Role is required' })
  role: Role.STORE_OWNER;
}
