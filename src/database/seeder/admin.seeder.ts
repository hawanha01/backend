import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../../module/user/entity/user.entity';
import { Role } from '../../module/user/enum/role.enum';
import { config } from '../../config/env';
import AppDataSource from '../../config/typeOrm.config';

/**
 * Admin Seeder
 *
 * This seeder creates the default admin user.
 *
 * IMPORTANT: Only this seeder should create admin users.
 * Admin users should not be manually created.
 */
export class AdminSeeder {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = AppDataSource;
  }

  /**
   * Run the seeder
   */
  async seed(): Promise<void> {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
        console.log('✅ Database connection initialized');
      }

      const userRepository = this.dataSource.getRepository(User);

      // Get validated admin credentials from config
      const adminData: {
        email: string;
        username: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: Role;
        isEmailVerified: boolean;
      } = {
        email: config.admin.email,
        username: config.admin.username,
        password: config.admin.password,
        firstName: config.admin.firstName,
        lastName: config.admin.lastName,
        phone: config.admin.phone,
        role: Role.ADMIN,
        isEmailVerified: true,
      };

      console.log(`\n🌱 Seeding admin user...\n`);

      // Check if admin already exists by email or username
      const existingUser = await userRepository.findOne({
        where: [{ email: adminData.email }, { username: adminData.username }],
      });

      if (existingUser) {
        if (existingUser.role === Role.ADMIN) {
          console.log(`  ℹ️  Admin user already exists: ${existingUser.email}`);
          console.log(`     Skipping admin creation.\n`);
          return;
        } else {
          throw new Error(
            `User with email ${adminData.email} or username ${adminData.username} already exists with role ${existingUser.role}`,
          );
        }
      }

      // Check if any admin exists
      const existingAdmin = await userRepository.findOne({
        where: { role: Role.ADMIN },
      });

      if (existingAdmin) {
        console.log(
          `  ℹ️  An admin user already exists: ${existingAdmin.email}`,
        );
        console.log(`     Skipping admin creation.\n`);
        return;
      }

      // Hash password using argon2 (better for passwords and JWT tokens)
      const hashedPassword = await argon2.hash(adminData.password, {
        type: argon2.argon2id, // Best balance of security and performance
      });

      // Create admin user
      const admin = userRepository.create({
        email: adminData.email,
        username: adminData.username,
        password: hashedPassword,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        phone: adminData.phone,
        role: adminData.role,
        isEmailVerified: adminData.isEmailVerified,
      });

      await userRepository.save(admin);
      console.log(`  ✨ Created admin user:`);
      console.log(`     Email: ${admin.email}`);
      console.log(`     Username: ${admin.username}`);
      console.log(`     Role: ${admin.role}`);
      console.log(
        `     ⚠️  Please change the default password after first login!\n`,
      );
    } catch (error) {
      console.error('❌ Error seeding admin:', error);
      throw error;
    } finally {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        console.log('✅ Database connection closed');
      }
    }
  }

  /**
   * Clear admin users (use with caution)
   */
  async clear(): Promise<void> {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }

      const userRepository = this.dataSource.getRepository(User);
      const admins = await userRepository.find({
        where: { role: Role.ADMIN },
      });

      if (admins.length === 0) {
        console.log('✅ No admin users found to clear');
        return;
      }

      await userRepository.remove(admins);
      console.log(`✅ Removed ${admins.length} admin user(s)`);
    } catch (error) {
      console.error('❌ Error clearing admin users:', error);
      throw error;
    } finally {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
      }
    }
  }
}

/**
 * Run seeder if executed directly
 */
if (require.main === module) {
  const seeder = new AdminSeeder();
  seeder
    .seed()
    .then(() => {
      console.log('Seeder execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeder execution failed:', error);
      process.exit(1);
    });
}
