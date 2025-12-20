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

## Prerequisites

**Required package:** `argon2` for password hashing (better than bcrypt, works well for JWT tokens too).

Install if not already installed:
```bash
npm install argon2
```

## Available Seeders

### Admin Seeder

The admin seeder creates the default admin user with ADMIN role.

**Usage:**
```bash
npm run db:seed admin
npm run db:seed admin:clear
```

**Configuration:**
The seeder uses validated environment variables from `src/config/env.ts`:
- `ADMIN_EMAIL` - Admin email (validated as email, default: `dev.hamza.010@gmail.com`)
- `ADMIN_USERNAME` - Admin username (validated: 3-100 chars, default: `hawanha1`)
- `ADMIN_PASSWORD` - Admin password (validated: min 8 chars, default: `Admin@123`)
- `ADMIN_FIRST_NAME` - Admin first name (validated: max 255 chars, default: `Admin`)
- `ADMIN_LAST_NAME` - Admin last name (validated: max 255 chars, default: `User`)
- `ADMIN_PHONE` - Admin phone (validated: max 20 chars, default: `+1234567890`)

All environment variables are validated through Joi schema before use.

**Important Notes:**
- Only this seeder should create admin users
- Admin users should not be manually created
- The seeder is idempotent - it won't create duplicate admins
- **Change the default password after first login!**

**How It Works:**
1. Loads and validates environment variables through `config.admin`
2. Checks if an admin user already exists (by role or email/username)
3. Hashes the password using argon2 (argon2id - best for passwords and JWT tokens)
4. Creates the admin user with ADMIN role
5. Sets `isEmailVerified` to true

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

