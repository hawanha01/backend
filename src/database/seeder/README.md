# Database Seeders

This directory contains database seeders for populating initial data.

## General Usage

**Run all seeders:**
```bash
npm run seeder
```

**Run a specific seeder:**
```bash
npm run seeder <seeder-name>
```

**Clear a specific seeder's data:**
```bash
npm run seeder <seeder-name>:clear
```

**List all available seeders:**
```bash
npm run seeder list
# or
npm run seeder --help
```

## Available Seeders

### Permission Seeder

The permission seeder populates the `permissions` table with all permission codes and their allowed actions from the permission mapping configuration.

**Usage:**
```bash
npm run seeder permissions
npm run seeder permissions:clear
```

**Important Notes:**
- **Only the seeder should insert/update permissions** - The permissions table should not be manually edited
- Permissions are sourced from `src/module/permission/config/permission-mapping.config.ts`
- Each permission code gets one record with:
  - `code`: The permission code (e.g., `products.manage`)
  - `name`: Human-readable name (auto-generated)
  - `action`: Primary action (usually `MANAGE` if available)
  - `allowedActions`: JSONB array of all allowed actions for this code

**How It Works:**
1. Reads all permission codes from `PERMISSION_CODE_ACTION_MAPPING`
2. For each code:
   - Generates a human-readable name
   - Determines the primary action (MANAGE > specific action > first action)
   - Gets all allowed actions from the mapping
   - Creates or updates the permission record
3. The seeder is idempotent - running it multiple times will update existing permissions without creating duplicates

**Adding New Permissions:**
1. Add the permission code to `PermissionCode` enum
2. Add the code and its allowed actions to `PERMISSION_CODE_ACTION_MAPPING`
3. Run the seeder: `npm run seeder permissions`

## Adding New Seeders

To add a new seeder:

1. Create a new seeder class in `src/database/seeder/` (e.g., `user.seeder.ts`)
2. Export it from `index.ts`
3. Register it in `run-seeder.ts`:
   ```typescript
   const seeders: Record<string, SeederConfig> = {
     permissions: { ... },
     users: {
       name: 'users',
       seeder: new UserSeeder(),
       description: 'Seed default users',
     },
   };
   ```
4. Run it: `npm run seeder users`

