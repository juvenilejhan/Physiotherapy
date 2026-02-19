# Node.js + VS Code Quick Start Guide

This guide helps you quickly set up and run the PhysioConnect application using Node.js and VS Code with PostgreSQL.

## 🚀 Quick Setup (5 minutes)

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) or **Docker** - [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
- **VS Code** - [Download here](https://code.visualstudio.com/)

### Step 1: Open Project in VS Code

1. Open VS Code
2. Click **File > Open Folder**
3. Select the `my-project` directory
4. Click **Select Folder**

### Step 2: Install VS Code Extensions

When prompted, click **Install** on the recommended extensions, or manually install:
- **Tailwind CSS IntelliSense**
- **Prettier**
- **ESLint**
- **Prisma**

### Step 3: Start PostgreSQL

**Option A: Using Docker (Recommended)**

Open the VS Code terminal (`Ctrl + `` `) and run:

```bash
docker-compose up -d
```

**Option B: Using Local PostgreSQL**

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE physioconnect;"
```

### Step 4: Install Dependencies

In the VS Code terminal:

```bash
npm install
```

This will install all required packages including:
- Next.js 16
- React 19
- Prisma ORM
- TypeScript 5
- And all other dependencies

### Step 5: Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to PostgreSQL
npm run db:push

# Seed database with sample data
npm run db:seed
```

This creates:
- 1 Admin account
- 1 Clinic Manager
- 1 Receptionist
- 4 Doctors
- 5 Patients
- 6 Services
- Sample appointments, blog posts, payments, etc.

### Step 6: Start Development Server

```bash
npm run dev
```

Or press `F5` in VS Code to start with debugging enabled.

### Step 7: Open Application

The application will be available at: **http://localhost:3000**

## 🔑 Test Credentials

### Admin Login
- **Email:** `admin@physioconnect.com`
- **Password:** `admin123`

### Doctor Login
- **Email:** `dr.emily.carter@physioconnect.com`
- **Password:** `password123`

### Patient Login
- **Email:** `john.doe@example.com`
- **Password:** `patient123`

## 🛠️ Common Commands

```bash
# Start development server
npm run dev

# Stop server
# Press Ctrl + C in terminal

# Run linting
npm run lint

# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database
npm run db:seed

# Reset database (WARNING: deletes all data)
npm run db:reset

# View database in browser
npx prisma studio
```

## 🐳 Docker Commands (if using Docker)

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f postgres

# Restart PostgreSQL
docker-compose restart postgres

# Access PostgreSQL shell
docker exec -it physioconnect-db psql -U postgres -d physioconnect
```

## 🎯 VS Code Features

### Debugging

1. Set breakpoints by clicking the gutter (left margin) in TypeScript files
2. Press `F5` to start debugging
3. Use the Debug sidebar to view variables and call stack
4. Use debug controls:
   - `F5` - Continue
   - `F10` - Step over
   - `F11` - Step into
   - `Shift + F11` - Step out

### Code Features

- **Format on Save**: Automatically formats code with Prettier
- **Lint on Save**: Auto-fixes ESLint issues
- **IntelliSense**: Code completion and suggestions
- **Go to Definition**: `F12` or `Cmd/Ctrl + Click`
- **Find References**: `Shift + F12`

### Terminal

- Open terminal: `Ctrl + `` ` (backtick)
- New terminal: `Ctrl + Shift + `` `
- Split terminal: Right-click > "Split Terminal"

## 📊 View Database

Open Prisma Studio to view and edit data:

```bash
npx prisma studio
```

Opens at http://localhost:5555

## 🐛 Troubleshooting

### Issue: "npm install" fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Windows (PowerShell)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Issue: PostgreSQL connection refused

**Solution:**
```bash
# If using Docker
docker-compose up -d
docker-compose logs postgres

# If using local PostgreSQL
# macOS: brew services start postgresql
# Linux: sudo service postgresql start
# Windows: Check PostgreSQL service in Services
```

### Issue: Prisma Client not generated

**Solution:**
```bash
npm run db:generate
```

### Issue: Database doesn't exist

**Solution:**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE physioconnect;"

# Or reset with Docker
docker-compose down -v
docker-compose up -d
npm run db:push
npm run db:seed
```

## 📚 Project Structure

```
my-project/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seed script
├── src/
│   ├── app/               # Next.js pages
│   │   ├── admin/        # Admin panel
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication
│   │   ├── book/         # Appointment booking
│   │   ├── dashboard/    # Patient dashboard
│   │   └── page.tsx      # Homepage
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   └── lib/             # Utilities
│       ├── auth.ts      # NextAuth config
│       ├── db.ts        # Prisma client
│       └── rbac.ts      # Permissions
├── .env                 # Environment variables
├── docker-compose.yml   # Docker PostgreSQL config
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript config
```

## 🔧 Environment Variables

Edit `.env` file in the project root:

```env
# PostgreSQL Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/physioconnect?schema=public"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
```

**Important:** Generate a secure `NEXTAUTH_SECRET`:
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Minimum 0 -Maximum 256}))
```

## 🎨 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js v4
- **Forms:** React Hook Form + Zod
- **State:** Zustand + TanStack Query

## 📖 Additional Resources

- [README.md](./README.md) - Complete documentation
- [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) - Detailed PostgreSQL setup
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - Migration notes
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)

## ✅ Next Steps

1. ✅ Start the application: `npm run dev`
2. ✅ Login with admin credentials
3. ✅ Explore the admin panel
4. ✅ View data in Prisma Studio
5. ✅ Start building features!

## 💡 Tips

- Use `npx prisma studio` to quickly view/edit data
- Press `F5` in VS Code for debugging
- All changes save automatically trigger hot reload
- Database changes need `npm run db:push`
- Check the terminal for error messages

---

**Ready to start developing! 🚀**
