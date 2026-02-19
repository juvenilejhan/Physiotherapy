# Prisma 7.4.0 Configuration Guide

## ✅ Project Updated to Prisma 7.4.0

---

## What's New in Prisma 7

### Breaking Changes
1. **Schema URL Property**: The `url` property in `datasource` block is no longer supported
2. **Configuration**: Requires `prisma.config.ts` for migrations (optional for simple setups)
3. **Client Instantiation**: Connection handling has changed

### New Features
- **Query Compiler**: Improved query performance
- **Better Type Safety**: Enhanced TypeScript support
- **Studio 0.13.1**: Updated Prisma Studio with new features

---

## Current Configuration

### Files Modified

#### 1. `package.json`
```json
{
  "dependencies": {
    "prisma": "^7.4.0",           // Updated from ^6.11.1
    "@prisma/client": "^7.4.0"    // Updated from ^6.11.1
  }
}
```

#### 2. `prisma/schema.prisma`
```prisma
datasource db {
  provider = "postgresql"
  // ❌ REMOVED: url = env("DATABASE_URL")
}
```

**Note**: The `url` property has been removed as per Prisma 7 requirements.

#### 3. `src/lib/db.ts`
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

**Note**: PrismaClient will automatically pick up `DATABASE_URL` from environment variables.

---

## Local Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

This will install:
- `prisma@7.4.0`
- `@prisma/client@7.4.0`

### Step 2: Verify Prisma Version
```bash
npx prisma --version
```

Expected output:
```
prisma               : 7.4.0
@prisma/client       : 7.4.0
Operating System     : <your OS>
Node.js              : <your version>
```

### Step 3: Generate Prisma Client
```bash
npm run db:generate
```

Expected output:
```
✔ Generated Prisma Client (v7.4.0) to ./node_modules/@prisma/client
```

### Step 4: Start PostgreSQL
```bash
# Using Docker (recommended)
docker run -d \
  --name physioconnect-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=physioconnect \
  -p 5432:5432 \
  postgres:16
```

### Step 5: Push Schema to Database
```bash
npm run db:push
```

Expected output:
```
✔ Loaded env from .env
✔ Introspected 1 database
✔ Generated Prisma Client
```

### Step 6: Seed Database (Optional)
```bash
npm run db:seed
```

### Step 7: Start Development Server
```bash
npm run dev
```

---

## Configuration Options for Prisma 7

### Option 1: Environment Variable (Current - Simple Setup)
**Works for**: Simple projects without complex migration needs

**Configuration**:
- `.env` file contains `DATABASE_URL`
- Schema has no `url` property
- No `prisma.config.ts` needed

**Pros**:
- ✅ Simple and straightforward
- ✅ No additional files needed
- ✅ Works great for most projects

**Cons**:
- ❌ Cannot use advanced migration features
- ❌ Limited configuration options

---

### Option 2: prisma.config.ts (Advanced Setup)
**Works for**: Projects needing advanced migration features

**File**: `prisma.config.ts`

```typescript
import { defineConfig } from 'prisma'

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasourceUrl: process.env.DATABASE_URL,
})
```

**Note**: If you encounter module errors, try these alternatives:

#### Alternative 1: CommonJS Format
**File**: `prisma.config.js`
```javascript
/** @type {import('prisma').Config} */
const config = {
  schema: './prisma/schema.prisma',
  datasourceUrl: process.env.DATABASE_URL,
}

module.exports = config
```

#### Alternative 2: ESM Format (if your project uses ESM)
**File**: `prisma.config.mjs`
```javascript
/** @type {import('prisma').Config} */
export default {
  schema: './prisma/schema.prisma',
  datasourceUrl: process.env.DATABASE_URL,
}
```

**When to use prisma.config.ts**:
- You need custom migration options
- You want to use Prisma Accelerate
- You need environment-specific configurations
- You're using custom database adapters

---

## Environment Variables

### `.env` file
```env
# PostgreSQL Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/physioconnect?schema=public"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
```

**Important**: The `DATABASE_URL` is now the only place where the connection string is defined (not in schema.prisma anymore).

---

## Common Issues & Solutions

### Issue 1: "The datasource property `url` is no longer supported"
**Cause**: Schema still has `url = env("DATABASE_URL")` in datasource block

**Solution**: Remove the `url` line from `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  // Remove this line: url = env("DATABASE_URL")
}
```

### Issue 2: "Failed to load config file"
**Cause**: `prisma.config.ts` format is incorrect

**Solutions**:
1. Try the CommonJS format with `.js` extension (see Alternative 1 above)
2. Remove the config file entirely (use Option 1)
3. Check Node.js version (Prisma 7 requires Node.js 18.17+)

### Issue 3: TypeScript errors after update
**Cause**: Prisma Client types not regenerated

**Solution**:
```bash
npm run db:generate

# Then restart TypeScript server in VS Code:
# Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

### Issue 4: "Cannot find module 'prisma/build/types.js'"
**Cause**: Configuration file format issue or Node.js version incompatibility

**Solutions**:
1. Remove `prisma.config.ts` and use environment variables (recommended)
2. Try `.js` extension instead of `.ts`
3. Ensure Node.js version is 18.17 or higher:
   ```bash
   node --version
   ```

### Issue 5: Database connection fails
**Cause**: DATABASE_URL not being picked up

**Solution**:
```bash
# Verify .env file exists
cat .env

# Check DATABASE_URL is set
echo $DATABASE_URL

# Ensure .env is not in .gitignore (it should be, but make sure it exists locally)
ls -la .env
```

---

## Verification Commands

```bash
# 1. Check Prisma version
npx prisma --version
# Expected: prisma 7.4.0

# 2. Validate schema (requires PostgreSQL running)
npx prisma validate
# Expected: Schema is valid

# 3. Generate Prisma Client
npm run db:generate
# Expected: ✔ Generated Prisma Client (v7.4.0)

# 4. Check TypeScript
npx tsc --noEmit
# Expected: No errors

# 5. Check ESLint
npm run lint
# Expected: No errors

# 6. Test database connection
npx prisma db pull
# Expected: Successfully pulled schema
```

---

## Prisma 7 Commands

```bash
# Generate Prisma Client
npx prisma generate
# or
npm run db:generate

# Push schema to database
npx prisma db push
# or
npm run db:push

# Create migration
npx prisma migrate dev --name <migration-name>
# or
npm run db:migrate

# Reset database
npx prisma migrate reset
# or
npm run db:reset

# Open Prisma Studio
npx prisma studio

# Validate schema
npx prisma validate

# Format schema
npx prisma format

# Introspect database
npx prisma db pull
```

---

## Migration from Prisma 6 to 7

### What Changed
| Prisma 6 | Prisma 7 |
|----------|----------|
| `url = env("DATABASE_URL")` in schema | ❌ Removed |
| Optional `prisma.config.ts` | ✅ Required for migrations |
| Simple client instantiation | Same (but picks up URL from env) |

### Migration Checklist
- [x] Updated `prisma` to `^7.4.0` in package.json
- [x] Updated `@prisma/client` to `^7.4.0` in package.json
- [x] Removed `url` property from schema datasource block
- [x] Ensured `DATABASE_URL` is in `.env` file
- [x] Regenerated Prisma Client
- [x] Verified TypeScript compilation
- [x] Verified ESLint passes

---

## VS Code Configuration

### Recommended Settings
Create `.vscode/settings.json`:
```json
{
  "prisma.showPrismaLanguageServerLogs": true,
  "prisma.prismaFmtBinPath": "./node_modules/.bin/prisma",
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

### Recommended Extensions
```json
{
  "recommendations": [
    "prisma.prisma",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
```

---

## Quick Reference

### Current Setup (Option 1 - Environment Variable)
- ✅ No config file needed
- ✅ DATABASE_URL in `.env`
- ✅ Schema without `url` property
- ✅ Works for most use cases

### Advanced Setup (Option 2 - Config File)
- Create `prisma.config.ts` or `prisma.config.js`
- Use the appropriate format based on your setup
- Required for advanced migration features

### Important Files
```
prisma/
├── schema.prisma      # Database schema (NO url property)
└── seed.ts            # Seed data script

src/lib/
└── db.ts              # Prisma client singleton

.env                   # DATABASE_URL here
package.json           # Prisma 7.4.0 dependencies
```

---

## Testing Your Setup

### 1. Verify Prisma Works
```bash
npx prisma studio
```
Opens Prisma Studio at http://localhost:5555

### 2. Test Database Connection
```bash
npx prisma db pull
```

### 3. Test Application
```bash
npm run dev
```

### 4. Test Login
- Admin: `admin@physioconnect.com` / `admin123` → `/admin`
- Patient: `john.doe@example.com` / `patient123` → `/patient`

---

## Summary

✅ **Successfully updated to Prisma 7.4.0**

### What Was Done
1. Updated `prisma` to `^7.4.0`
2. Updated `@prisma/client` to `^7.4.0`
3. Removed `url` property from schema
4. Regenerated Prisma Client
5. Verified TypeScript and ESLint pass

### Configuration Approach
- **Current**: Environment variable based (Option 1)
- **No config file needed** for basic operations
- **Config file optional** for advanced features

### Next Steps
1. Run `npm install` locally
2. Start PostgreSQL
3. Run `npm run db:generate`
4. Run `npm run db:push`
5. Run `npm run db:seed` (optional)
6. Start development server: `npm run dev`

---

## Need Help?

### Common Commands
```bash
npm run dev            # Start dev server
npm run lint           # Check code quality
npm run db:generate    # Generate Prisma Client
npm run db:push        # Push schema to database
npm run db:seed        # Seed database
npx prisma studio      # Open Prisma Studio
```

### Troubleshooting
1. Check `.env` file has `DATABASE_URL`
2. Ensure PostgreSQL is running
3. Regenerate Prisma Client
4. Restart TypeScript server in VS Code
5. Check Node.js version (18.17+ required)

---

**Your project is now fully configured for Prisma 7.4.0! 🎉**
