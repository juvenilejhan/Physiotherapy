# PostgreSQL Setup Guide for VS Code

This guide will help you set up and run the application using VS Code with PostgreSQL.

## Prerequisites

### 1. Install PostgreSQL

Choose one of the following methods:

#### Option A: Install PostgreSQL locally
- **Windows**: Download from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
- **macOS**: Use Homebrew: `brew install postgresql@16`
- **Linux (Ubuntu/Debian)**:
  ```bash
  sudo apt update
  sudo apt install postgresql postgresql-contrib
  ```

#### Option B: Use Docker (Recommended)
```bash
docker run --name physioconnect-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=physioconnect \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### 2. Install VS Code Extensions

Open VS Code and install these recommended extensions:
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **Prettier** (esbenp.prettier-vscode)
- **ESLint** (dbaeumer.vscode-eslint)
- **Prisma** (prisma.prisma)

Or open the project in VS Code and click "Install" when prompted about recommended extensions.

## Setup Steps

### Step 1: Clone and Install Dependencies

If you haven't already:
```bash
cd /path/to/project
npm install
```

### Step 2: Configure Database Connection

Update the `.env` file with your PostgreSQL credentials:

```env
# PostgreSQL Database
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
```

**Default configuration** (if using Docker setup above):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/physioconnect?schema=public"
```

**If using local PostgreSQL installation:**
- Default username: `postgres`
- Set a password during installation
- Default database: `postgres` (create `physioconnect` database)

### Step 3: Create the Database (if not using Docker)

If you're using local PostgreSQL installation, create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE physioconnect;

# Exit
\q
```

### Step 4: Initialize Prisma

```bash
# Generate Prisma Client with PostgreSQL
npm run db:generate

# Push schema to PostgreSQL database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### Step 5: Verify Database Connection

Check if the database is properly set up:

```bash
# View all tables
npx prisma studio

# Or test connection with Prisma
npx prisma db execute --stdin
# Then type: SELECT * FROM "User" LIMIT 5;
# Press Ctrl+D to exit
```

## Running the Application in VS Code

### Option 1: Using Integrated Terminal

1. Open the project in VS Code
2. Open the integrated terminal: `Ctrl + \`` (backtick) or `View > Terminal`
3. Run the development server:

```bash
bun run dev
```

4. Open your browser and navigate to:
   - **Local**: http://localhost:3000
   - **Preview Panel**: Use the preview panel on the right side of the interface

### Option 2: Using VS Code Debugger

1. Press `F5` or click "Run and Debug" in the sidebar
2. Select "Next.js: debug server-side" configuration
3. The debugger will start the development server

### Option 3: Using NPM Scripts

1. Open VS Code
2. Press `Ctrl + Shift + P` to open Command Palette
3. Type "Run Task" and select it
4. Choose the task you want to run (e.g., "npm: dev")

## Common Issues and Solutions

### Issue: Connection Refused
**Error**: `Connection refused at localhost:5432`

**Solution**:
- Make sure PostgreSQL is running:
  - macOS/Linux: `brew services start postgresql` or `sudo service postgresql start`
  - Windows: Check "Services" for "postgresql-x64-16"
- If using Docker: `docker start physioconnect-db`

### Issue: Authentication Failed
**Error**: `password authentication failed for user "postgres"`

**Solution**:
1. Update the `.env` file with the correct password
2. Or reset PostgreSQL password:
   ```bash
   # For local installation
   psql -U postgres
   ALTER USER postgres PASSWORD 'your-new-password';
   ```

### Issue: Database Doesn't Exist
**Error**: `database "physioconnect" does not exist`

**Solution**:
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE physioconnect;"
```

### Issue: Prisma Client Generation Error
**Error**: `Error: @prisma/client did not initialize yet`

**Solution**:
```bash
# Regenerate Prisma Client
npm run db:generate
```

### Issue: Port Already in Use
**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port
PORT=3001 bun run dev
```

## VS Code Tips

### 1. Tailwind CSS IntelliSense
- Hover over Tailwind classes to see what they do
- Use autocomplete to find available classes

### 2. Prisma IntelliSense
- The Prisma extension provides syntax highlighting and validation
- Use `Cmd/Ctrl + Click` to navigate between Prisma models

### 3. Debugging
- Set breakpoints in TypeScript files by clicking the gutter (left margin)
- Use `F10` to step over, `F11` to step into, `Shift + F11` to step out
- View variables in the Debug sidebar

### 4. Format on Save
- The project is configured to auto-format on save using Prettier
- Files are automatically linted with ESLint on save

## Database Management

### View Database with Prisma Studio
```bash
npx prisma studio
```
This opens a web-based GUI to view and edit your data.

### Reset Database (Warning: Deletes All Data)
```bash
npm run db:reset
```

### Create a New Migration
```bash
npm run db:migrate
```

## Useful Commands

```bash
# Install dependencies
npm install

# Start development server
bun run dev

# Run linting
bun run lint

# Generate Prisma Client
npm run db:generate

# Push schema changes to database
npm run db:push

# Run database migrations
npm run db:migrate

# Reset database and run seed
npm run db:reset

# Seed database
npm run db:seed

# Open Prisma Studio
npx prisma studio

# Build for production
bun run build

# Start production server
bun run start
```

## Next Steps

1. Verify the application runs successfully
2. Explore the admin panel at `/admin`
3. Check the seeded data using Prisma Studio
4. Start building your features!

## Support

If you encounter any issues:
1. Check the terminal output for error messages
2. Review the PostgreSQL logs
3. Ensure all environment variables are correctly set in `.env`
4. Make sure PostgreSQL is running and accessible
