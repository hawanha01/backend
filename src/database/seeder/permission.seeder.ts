import { DataSource } from 'typeorm';
import { Permission } from '../../module/permission/entity/permission.entity';
import { PermissionCode } from '../../module/permission/enum/permission-code.enum';
import { PermissionAction } from '../../module/permission/enum/permission-action.enum';
import { PERMISSION_CODE_ACTION_MAPPING } from '../../module/permission/config/permission-mapping.config';
import AppDataSource from '../../config/typeOrm.config';

/**
 * Permission Seeder
 *
 * This seeder populates the permissions table with all permission codes
 * and their allowed actions from the permission mapping configuration.
 *
 * IMPORTANT: Only this seeder should insert/update permissions.
 * The permissions table should not be manually edited.
 */
export class PermissionSeeder {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = AppDataSource;
  }

  /**
   * Generate a human-readable name from permission code
   */
  private generatePermissionName(code: PermissionCode): string {
    const codeStr = code.toString();
    const [resource, action] = codeStr.split('.');

    // Capitalize and format
    const resourceName =
      resource.charAt(0).toUpperCase() + resource.slice(1).replace(/_/g, ' ');
    const actionName = action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return `${resourceName} - ${actionName}`;
  }

  /**
   * Get primary action from allowed actions
   * Priority: MANAGE > specific action > first action
   */
  private getPrimaryAction(
    allowedActions: PermissionAction[],
  ): PermissionAction {
    if (allowedActions.includes(PermissionAction.MANAGE)) {
      return PermissionAction.MANAGE;
    }
    // Return the most specific action (usually the first one)
    return allowedActions[0];
  }

  /**
   * Extract resource name from permission code
   */
  private extractResource(code: PermissionCode): string {
    const codeStr = code.toString();
    const [resource] = codeStr.split('.');
    return resource;
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

      const permissionRepository = this.dataSource.getRepository(Permission);

      // Get all permission codes from the mapping
      const permissionCodes = Object.keys(
        PERMISSION_CODE_ACTION_MAPPING,
      ) as PermissionCode[];

      console.log(`\n🌱 Seeding ${permissionCodes.length} permissions...\n`);

      let created = 0;
      let updated = 0;

      for (const code of permissionCodes) {
        const allowedActions = PERMISSION_CODE_ACTION_MAPPING[code];
        const primaryAction = this.getPrimaryAction(allowedActions);
        const name = this.generatePermissionName(code);
        this.extractResource(code); // Extract resource for potential future use

        // Check if permission already exists (unique constraint on code + action)
        const existingPermission = await permissionRepository.findOne({
          where: { code, action: primaryAction },
        });

        if (existingPermission) {
          // Update existing permission
          existingPermission.name = name;
          existingPermission.allowedActions = allowedActions;
          await permissionRepository.save(existingPermission);
          updated++;
          console.log(
            `  ↻ Updated: ${code} (${name}) - Actions: [${allowedActions.join(', ')}]`,
          );
        } else {
          // Create new permission
          const permission = permissionRepository.create({
            code,
            name,
            action: primaryAction,
            allowedActions,
          });

          await permissionRepository.save(permission);
          created++;
          console.log(
            `  ✨ Created: ${code} (${name}) - Actions: [${allowedActions.join(', ')}]`,
          );
        }
      }

      console.log(`\n✅ Seeding completed!`);
      console.log(`   Created: ${created} permissions`);
      console.log(`   Updated: ${updated} permissions`);
      console.log(`   Total: ${permissionCodes.length} permissions\n`);
    } catch (error) {
      console.error('❌ Error seeding permissions:', error);
      throw error;
    } finally {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        console.log('✅ Database connection closed');
      }
    }
  }

  /**
   * Clear all permissions (use with caution)
   */
  async clear(): Promise<void> {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }

      const permissionRepository = this.dataSource.getRepository(Permission);
      await permissionRepository.clear();
      console.log('✅ All permissions cleared');
    } catch (error) {
      console.error('❌ Error clearing permissions:', error);
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
  const seeder = new PermissionSeeder();
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
