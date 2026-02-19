# PhysioConnect - Physiotherapy Clinic Management System

A comprehensive web application for managing a physiotherapy clinic with features for patients, staff, and administrators.

## 🚀 Features

### For Patients
- ✅ Book appointments online (5-step wizard)
- ✅ View appointment history and upcoming sessions
- ✅ Manage personal and medical information
- ✅ Cancel and reschedule appointments
- ✅ Track treatment progress

### For Staff
- ✅ View and manage appointments
- ✅ Access patient medical records
- ✅ Manage schedules and availability
- ✅ View calendar with appointments
- ✅ Patient communication

### For Administrators
- ✅ Comprehensive dashboard with KPIs
- ✅ Staff management (add, edit, delete)
- ✅ Patient management with CRM
- ✅ Service and content management (CMS)
- ✅ Appointment calendar
- ✅ Clinic settings configuration
- ✅ Role-based access control (RBAC)
- ✅ Billing and invoicing (in development)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Bun** (recommended) or **npm** (v9 or higher)
- **Git**
- **PostgreSQL** (v14 or higher) or **Docker** (for containerized PostgreSQL)

## 🛠️ Installation

1. **Clone the repository** (or extract the project files)

```bash
cd physioconnect
```

2. **Install dependencies**

Using npm (recommended):
```bash
npm install
```

Or using Bun:
```bash
bun install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

```env
# PostgreSQL Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/physioconnect?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Optional: OAuth Providers (if you want to enable them)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
# FACEBOOK_CLIENT_ID="your-facebook-client-id"
# FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
```

⚠️ **IMPORTANT:** Generate a secure `NEXTAUTH_SECRET` using:
```bash
openssl rand -base64 32
```

4. **Set up PostgreSQL**

**Option A: Using Docker (Recommended)**
```bash
# Start PostgreSQL container
docker-compose up -d
```

**Option B: Using Local PostgreSQL**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE physioconnect;"
```

5. **Set up the database**

Generate Prisma Client:
```bash
npm run db:generate
```

Push the schema to PostgreSQL:
```bash
npm run db:push
```

6. **Seed the database with sample data**

```bash
npm run db:seed
```

This will create:
- 1 Admin account
- 1 Clinic Manager account
- 1 Receptionist account
- 4 Specialist accounts (doctors)
- 5 Patient accounts
- 6 Services
- 7 Sample appointments
- 3 Blog posts
- 6 Gallery items
- Clinic settings
- Sample payments

7. **Start the development server**

```bash
npm run dev
```

Or using Bun:
```bash
bun run dev
```

The application will be available at: **http://localhost:3000**

## 📧 Test Credentials

### Admin Account
- **Email:** `admin@physioconnect.com`
- **Password:** `admin123`
- **Role:** Super Admin

### Specialist Accounts (password: `password123`)
- **Email:** `dr.emily.carter@physioconnect.com` - Sports Medicine
- **Email:** `dr.michael.chen@physioconnect.com` - Neurological
- **Email:** `dr.sarah.johnson@physioconnect.com` - Musculoskeletal
- **Email:** `dr.james.wilson@physioconnect.com` - Pediatric

### Patient Accounts (password: `patient123`)
- **Email:** `john.doe@example.com`
- **Email:** `jane.smith@example.com`
- **Email:** `mike.johnson@example.com`
- **Email:** `sarah.williams@example.com`
- **Email:** `david.brown@example.com`

### Other Accounts
- **Receptionist:** `reception@physioconnect.com` / `receptionist123`
- **Clinic Manager:** `manager@physioconnect.com` / `manager123`

## 📁 Project Structure

```
physioconnect/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seed script
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin panel pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── book/              # Appointment booking
│   │   ├── dashboard/         # Patient dashboard
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   └── providers/         # Context providers
│   └── lib/                   # Utility functions
│       ├── auth.ts            # NextAuth configuration
│       ├── db.ts              # Prisma client
│       ├── rbac.ts            # Role-based access control
│       └── utils.ts           # Utility functions
├── .env                       # Environment variables
├── .env.example               # Environment variables template
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🗄️ Database

The application uses **PostgreSQL** as the database, which is perfect for both development and production.

### Quick Start with Docker
```bash
docker-compose up -d
```

### View the Database
```bash
npx prisma studio
```

This will open a web-based database viewer at http://localhost:5555

### Database Commands
```bash
# Start PostgreSQL (Docker)
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View PostgreSQL logs
docker-compose logs -f postgres

# Access PostgreSQL shell
docker exec -it physioconnect-db psql -U postgres -d physioconnect
```

For detailed setup instructions, see [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)

## 🏗️ Available Scripts

```bash
# Development
npm run dev          # Start development server on port 3000
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema to database
npm run db:generate   # Generate Prisma Client
npm run db:reset     # Reset database (WARNING: deletes all data)
npm run db:seed      # Seed database with sample data

# Code Quality
npm run lint         # Run ESLint
```

## 🎨 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix UI)
- **Database:** Prisma ORM + PostgreSQL
- **Authentication:** NextAuth.js v4
- **Forms:** React Hook Form + Zod
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Icons:** Lucide React
- **Date/Time:** date-fns
- **Notifications:** sonner
- **Animations:** Framer Motion

## 🔐 Role-Based Access Control (RBAC)

The application has 5 user roles with different permissions:

1. **SUPER_ADMIN** - Full access to everything
2. **CLINIC_MANAGER** - Can manage staff, patients, appointments, billing, content
3. **DOCTOR** - Can view appointments, patients, calendar, and manage content
4. **RECEPTIONIST** - Can manage appointments, patients, billing
5. **PATIENT** - Can only view and manage their own appointments and profile

## 📝 Development Notes

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use 'use client' and 'use server' directives appropriately
- Server-side code should use API routes, not server actions
- All API routes are protected with authentication checks

### Adding New Features
1. Create API route in `src/app/api/`
2. Add server-side logic with proper error handling
3. Create UI components in `src/components/`
4. Build pages in `src/app/`
5. Update permissions in `src/lib/rac.ts` if needed

### Database Migrations
```bash
# Create a new migration
bun run db:migrate

# Apply pending migrations
bun run db:push
```

## 🐛 Troubleshooting

### Port 3000 already in use
Change the port in `package.json`:
```json
"dev": "next dev -p 3001",
```

### Database errors
```bash
# Reset database (Docker)
docker-compose down -v
docker-compose up -d
npm run db:push
npm run db:seed

# Or reset database (local PostgreSQL)
psql -U postgres -c "DROP DATABASE IF EXISTS physioconnect;"
psql -U postgres -c "CREATE DATABASE physioconnect;"
npm run db:push
npm run db:seed
```

### Build errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
bun install

# Rebuild
bun run dev
```

### Permission errors
Make sure you're logged in with the correct role. Check the RBAC permissions in `src/lib/rac.ts`.

## 📄 License

This project is for demonstration purposes.

## 🤝 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using Next.js 16, TypeScript, and Prisma**
