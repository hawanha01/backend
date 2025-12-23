import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../../user/entity/user.entity';
import { Role } from '../../user/enum/role.enum';
import { CreateStoreOwnerDto } from './dto/create-store-owner.dto';
import { CreateStoreOwnerResponseDto } from './dto/create-store-owner-response.dto';

@Injectable()
export class StoreOwnerService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Generate a secure random password
   * Password will contain: uppercase, lowercase, numbers, and special characters
   */
  private generateSecurePassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '@$!%*?&';
    const allChars = uppercase + lowercase + numbers + special;

    // Ensure at least one character from each category
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly (total length: 16)
    for (let i = password.length; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Create a new store owner or store manager
   * If password is not provided, a secure password will be generated
   * isEmailVerified will always be set to false
   */
  async createStoreOwner(
    createDto: CreateStoreOwnerDto,
  ): Promise<CreateStoreOwnerResponseDto> {
    if (createDto.role !== Role.STORE_OWNER) {
      throw new BadRequestException('Role must be store_owner');
    }

    // Check if user with email already exists
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: createDto.email },
    });

    if (existingUserByEmail) {
      throw new ConflictException(
        `User with email ${createDto.email} already exists`,
      );
    }

    // Check if user with username already exists
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username: createDto.username },
    });

    if (existingUserByUsername) {
      throw new ConflictException(
        `User with username ${createDto.username} already exists`,
      );
    }

    // Generate password if not provided
    const password = this.generateSecurePassword();

    // Hash the password
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    // Create user entity
    const user = this.userRepository.create({
      ...createDto,
      password: hashedPassword,
      isEmailVerified: false,
    });

    // Save user
    const savedUser = await this.userRepository.save(user);

    // Prepare response
    const response: CreateStoreOwnerResponseDto = {
      ...savedUser,
      role: savedUser.role as Role.STORE_OWNER,
      generatedPassword: password,
    };

    return response;
  }
}
