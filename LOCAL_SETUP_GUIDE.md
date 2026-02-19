# Local Development Setup Guide
## PhysioConnect - Physiotherapy Clinic Management System

This guide will help you set up and run PhysioConnect locally using VS Code with PostgreSQL.

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Tools
- ✅ **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- ✅ **Bun** (runtime and package manager) - [Installation guide](https://bun.sh/docs/installation)
- ✅ **Docker** (for PostgreSQL) - [Download here](https://www.docker.com/products/docker-desktop/)
- ✅ **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)
- ✅ **Git** (optional, for version control)

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## Quick Start (5 Minutes)

### Option 1: Using Docker (Recommended) 🐳

#### Step 1: Start PostgreSQL Database
```bash
# From the project root
docker-compose up -d

# Verify the container is running
docker ps
```

This will:
- Start a PostgreSQL 16 container
- Create a database named `physioconnect`
- Expose it on port `5432`
- Persist data in a Docker volume

#### Step 2: Install Dependencies
```bash
bun install
```

#### Step 3: Setup Database
```bash
# Generate Prisma Client
bun run db:generate

# Push the schema to the database
bun run db:push

# (Optional) Seed the database with sample data
bun run db:seed
```

#### Step 4: Start Development Server
```bash
bun run dev
```

The application will be available at: **http://localhost:3000**

---

### Option 2: Using Local PostgreSQL Installation 🐘

If you prefer to use a local PostgreSQL installation instead of Docker:

#### Step 1: Install PostgreSQL
- **MacOS:** `brew install postgresql@16`
- **Ubuntu:** `sudo apt-get install postgresql-16`
- **Windows:** Download from [PostgreSQL Official Site](https://www.postgresql.org/download/windows/)

#### Step 2: Create Database
```bash
# Start PostgreSQL service
# MacOS: brew services start postgresql@16
# Ubuntu: sudo systemctl start postgresql
# Windows: Start from Services

# Create database
createdb physioconnect

# Or using psql
psql postgres
CREATE DATABASE physioconnect;
\q
```

#### Step 3: Verify Connection
```bash
psql -U postgres -d physioconnect -c "SELECT version();"
```

#### Step 4: Update .env (if needed)
The `.env` file is already configured:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/physioconnect?schema=public"
```

If your PostgreSQL uses different credentials, update:
```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/physioconnect?schema=public"
```

#### Step 5: Continue with Steps 2-4 from Option 1

---

## Detailed Setup Instructions

### 1. Clone/Download the Project
```bash
cd /path/to/your/projects
# If you have the code locally, just navigate to the project folder
cd physioconnect
```

### 2. Verify Environment Variables
The `.env` file should contain:
```env
# PostgreSQL Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/physioconnect?schema=public"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production-use-openssl-rand-base64-32
```

**Important:** For better security, generate a new `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```
Then update the `.env` file with the generated value.

### 3. Database Setup

#### Start PostgreSQL (Docker)
```bash
docker-compose up -d
```

#### Verify Database is Ready
```bash
# Check Docker container
docker ps

# Should see something like:
# physioconnect-db   ...   0.0.0.0:5432->5432/tcp   postgres:16-alpine
```

#### Initialize Database Schema
```bash
# Generate Prisma Client
bun run db:generate

# Push schema to database
bun run db:push
```

You should see:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

🚀  Your database is now in sync with your Prisma schema. Run
   prisma db pull [url] 
   if you want to sync your Prisma schema with your database.
```

#### (Optional) Seed Database with Sample Data
```bash
bun run db:seed
```

This will create:
- 1 Super Admin user
- 2 Clinic Manager users
- 3 Doctor accounts
- 2 Receptionist accounts
- Sample patients
- Sample services
- Sample appointments

### 4. Install Dependencies
```bash
bun install
```

### 5. Start Development Server
```bash
bun run dev
```

The server will start with output like:
```
▲ Next.js 16.1.1
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
```

### 6. Open in Browser
Navigate to: **http://localhost:3000**

---

## Accessing the Application

### Default Users (After Seeding)

#### Admin Portal
- **Super Admin:**
  - Email: `admin@physioconnect.com`
  - Password: `admin123`

- **Clinic Manager:**
  - Email: `manager@physioconnect.com`
  - Password: `manager123`

#### Patient Portal
- **Patient:**
  - Email: `patient@example.com`
  - Password: `patient123`

#### Staff Portal
- **Doctor:**
  - Email: `doctor@physioconnect.com`
  - Password: `doctor123`

### Application Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing Page | Public |
| `/auth/login` | Login Page | Public |
| `/auth/register` | Registration Page | Public |
| `/book` | Book Appointment | Public/Logged In |
| `/dashboard` | Patient Dashboard | Patient Role |
| `/admin` | Admin Dashboard | Admin/Manager/Doctor/Receptionist |
| `/admin/patients` | Patient Management | Admin Roles |
| `/admin/appointments` | Appointment Management | Admin Roles |
| `/admin/staff` | Staff Management | Admin/Manager |
| `/admin/payments` | Payment Management | Admin Roles |
| `/services` | Services List | Public |
| `/specialists` | Specialists List | Public |

---

## Development Tools

### Database Management

#### View Database (Prisma Studio)
```bash
bunx prisma studio
```
Opens a visual database editor at: http://localhost:5555

#### Reset Database (Caution: Deletes All Data)
```bash
bun run db:reset
```

#### View Migrations
```bash
bun run db:migrate
```

### Code Quality

#### Lint Code
```bash
bun run lint
```

#### Type Check
```bash
bunx tsc --noEmit
```

---

## Troubleshooting

### Issue: PostgreSQL Connection Failed

**Error:**
```
Error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
```

**Solution:**
1. Ensure PostgreSQL/Docker is running:
   ```bash
   docker-compose up -d
   docker ps
   ```

2. Check if port 5432 is available:
   ```bash
   lsof -i :5432  # MacOS/Linux
   netstat -ano | findstr :5432  # Windows
   ```

3. Verify DATABASE_URL in `.env`:
   ```bash
   echo $DATABASE_URL
   ```

### Issue: Prisma Client Not Generated

**Error:**
```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
bun run db:generate
```

### Issue: Module Not Found

**Error:**
```
Error: Cannot find module 'xxx'
```

**Solution:**
```bash
bun install
```

### Issue: Port 3000 Already in Use

**Error:**
```
Port 3000 is already in use
```

**Solution:**
1. Stop the process using port 3000
2. Or use a different port:
   ```bash
   bun run dev -p 3001
   ```

### Issue: Docker Container Not Starting

**Error:**
```
Error: failed to start container "physioconnect-db"
```

**Solution:**
```bash
# Stop and remove existing container
docker-compose down

# Remove the volume (WARNING: This deletes all data)
docker volume rm physioconnect_postgres_data

# Start fresh
docker-compose up -d
```

### Issue: NextAuth Session Errors

**Error:**
```
[next-auth][error][NO_SECRET]
```

**Solution:**
1. Ensure `NEXTAUTH_SECRET` is set in `.env`
2. Generate a new secret:
   ```bash
   openssl rand -base64 32
   ```
3. Update `.env` file and restart the server

---

## VS Code Configuration

### Create `.vscode/settings.json`
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Create `.vscode/launch.json` (Optional - for debugging)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "bun run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

---

## Useful Commands Reference

| Command | Description |
|---------|-------------|
| `bun install` | Install dependencies |
| `bun run dev` | Start development server |
| `bun run lint` | Run ESLint |
| `bunx tsc --noEmit` | Type check |
| `bun run db:push` | Push schema to database |
| `bun run db:generate` | Generate Prisma Client |
| `bun run db:reset` | Reset database |
| `bun run db:seed` | Seed database |
| `bunx prisma studio` | Open Prisma Studio |
| `docker-compose up -d` | Start PostgreSQL |
| `docker-compose down` | Stop PostgreSQL |

---

## Project Structure

```
physioconnect/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding script
├── public/
│   └── images/                # Static images
├── src/
│   ├── app/
│   │   ├── admin/             # Admin portal pages
│   │   ├── auth/              # Authentication pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Patient dashboard
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── providers/         # React context providers
│   └── lib/
│       ├── auth.ts            # NextAuth configuration
│       ├── db.ts              # Prisma client
│       └── utils.ts           # Utility functions
├── .env                       # Environment variables
├── .env.example               # Environment variables template
├── docker-compose.yml         # PostgreSQL configuration
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript configuration
```

---

## OAuth Setup (Optional)

To enable Google and Facebook login:

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add callback URL: `http://localhost:3000/api/auth/callback/google`
6. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

### Facebook OAuth
1. Go to [Facebook Developer Portal](https://developers.facebook.com/apps/)
2. Create a new app
3. Add Facebook Login product
4. Add callback URL: `http://localhost:3000/api/auth/callback/facebook`
5. Add to `.env`:
   ```env
   FACEBOOK_CLIENT_ID=your-facebook-client-id
   FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
   ```

---

## Next Steps

1. ✅ Start PostgreSQL (Docker or local)
2. ✅ Install dependencies
3. ✅ Setup database schema
4. ✅ Seed database (optional)
5. ✅ Start development server
6. ✅ Open in browser at http://localhost:3000
7. ✅ Start building features!

---

## Support & Documentation

- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **NextAuth Docs:** https://next-auth.js.org
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com

---

**Happy Coding! 🚀**
