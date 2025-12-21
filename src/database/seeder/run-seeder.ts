import { PermissionSeeder } from './permission.seeder';
import { AdminSeeder } from './admin.seeder';

/**
 * General Seeder Runner
 *
 * Usage:
 *   npm run seeder                    - Run all seeders
 *   npm run seeder permissions        - Run permission seeder
 *   npm run seeder permissions:clear  - Clear permissions
 */

interface SeederConfig {
  name: string;
  seeder: { seed: () => Promise<void>; clear?: () => Promise<void> };
  description: string;
}

// Register all available seeders
const seeders: Record<string, SeederConfig> = {
  permissions: {
    name: 'permissions',
    seeder: new PermissionSeeder(),
    description: 'Seed permission codes and their allowed actions',
  },
  admin: {
    name: 'admin',
    seeder: new AdminSeeder(),
    description: 'Seed default admin user',
  },
  // Add more seeders here as they are created
  // users: {
  //   name: 'users',
  //   seeder: new UserSeeder(),
  //   description: 'Seed default users',
  // },
};

/**
 * Run a specific seeder
 */
async function runSeeder(seederName: string): Promise<void> {
  const seederConfig = seeders[seederName];

  if (!seederConfig) {
    console.error(`❌ Seeder "${seederName}" not found`);
    console.log('\nAvailable seeders:');
    Object.keys(seeders).forEach((name) => {
      console.log(`  - ${name}: ${seeders[name].description}`);
    });
    process.exit(1);
  }

  console.log(`\n🌱 Running ${seederConfig.name} seeder...`);
  console.log(`   ${seederConfig.description}\n`);

  try {
    await seederConfig.seeder.seed();
    console.log(`\n✅ ${seederConfig.name} seeder completed successfully\n`);
  } catch (error) {
    console.error(`\n❌ ${seederConfig.name} seeder failed:`, error);
    throw error;
  }
}

/**
 * Clear a specific seeder
 */
async function clearSeeder(seederName: string): Promise<void> {
  const seederConfig = seeders[seederName];

  if (!seederConfig) {
    console.error(`❌ Seeder "${seederName}" not found`);
    process.exit(1);
  }

  if (!seederConfig.seeder.clear) {
    console.error(`❌ Seeder "${seederName}" does not support clear operation`);
    process.exit(1);
  }

  console.log(`\n🗑️  Clearing ${seederConfig.name} seeder data...\n`);

  try {
    await seederConfig.seeder.clear();
    console.log(`\n✅ ${seederConfig.name} cleared successfully\n`);
  } catch (error) {
    console.error(`\n❌ Failed to clear ${seederConfig.name}:`, error);
    throw error;
  }
}

/**
 * Run all seeders
 */
async function runAllSeeders(): Promise<void> {
  const seederNames = Object.keys(seeders);

  if (seederNames.length === 0) {
    console.log('No seeders available');
    return;
  }

  console.log(`\n🌱 Running ${seederNames.length} seeder(s)...\n`);

  for (const seederName of seederNames) {
    try {
      await runSeeder(seederName);
    } catch (error) {
      console.error(`Failed to run ${seederName} seeder:`, error);
      process.exit(1);
    }
  }

  console.log('✅ All seeders completed successfully\n');
}

/**
 * List all available seeders
 */
function listSeeders(): void {
  console.log('\n📋 Available Seeders:\n');
  Object.entries(seeders).forEach(([name, config]) => {
    console.log(`  ${name.padEnd(20)} - ${config.description}`);
  });
  console.log('');
}

// Main execution
const command = process.argv[2];

if (command === 'list' || command === '--help' || command === '-h') {
  listSeeders();
  console.log('Usage:');
  console.log('  npm run seeder                    - Run all seeders');
  console.log('  npm run seeder <name>             - Run specific seeder');
  console.log(
    '  npm run seeder <name>:clear       - Clear specific seeder data',
  );
  console.log(
    '  npm run seeder list               - List all available seeders',
  );
  console.log('');
  process.exit(0);
} else if (command && command.includes(':')) {
  // Handle commands like "permissions:clear"
  const [seederName, action] = command.split(':');
  if (action === 'clear') {
    clearSeeder(seederName)
      .then(() => {
        process.exit(0);
      })
      .catch((error) => {
        console.error('Clear failed:', error);
        process.exit(1);
      });
  } else {
    console.error(`Unknown action: ${action}`);
    process.exit(1);
  }
} else if (command) {
  // Run specific seeder
  runSeeder(command)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeder failed:', error);
      process.exit(1);
    });
} else {
  // Run all seeders
  runAllSeeders()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeders failed:', error);
      process.exit(1);
    });
}
