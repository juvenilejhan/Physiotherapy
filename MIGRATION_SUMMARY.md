# PostgreSQL Migration Summary

This document summarizes the changes made to migrate the project from SQLite to PostgreSQL and set up VS Code.

## 📝 Changes Made

### 1. Database Migration

**File:** `prisma/schema.prisma`
- Changed datasource provider from `sqlite` to `postgresql`
- All other schema definitions remain the same (PostgreSQL compatible)

### 2. Environment Configuration

**File:** `.env`
- Updated `DATABASE_URL` to PostgreSQL connection string:
  ```
  postgresql://postgres:postgres@localhost:5432/physioconnect?schema=public
  ```

**File:** `.env.example`
- Updated template with PostgreSQL connection string format
- Added comments explaining the connection string format

### 3. Docker Configuration

**New File:** `docker-compose.yml`
- PostgreSQL 16 Alpine container configuration
- Named container: `physioconnect-db`
- Default credentials: postgres/postgres
- Database name: physioconnect
- Health check configured
- Persistent volume for data

**New File:** `init-db.sql`
- PostgreSQL initialization script
- Enables UUID extension
- Creates health check function

### 4. VS Code Configuration

**New Directory:** `.vscode/`
- `launch.json` - Debug configurations for Next.js
- `settings.json` - Editor settings and formatting
- `extensions.json` - Recommended VS Code extensions

### 5. Documentation

**New Files:**
- `POSTGRESQL_SETUP.md` - Comprehensive PostgreSQL setup guide
- `VSCODE_POSTGRESQL_GUIDE.md` - Quick start guide for VS Code + PostgreSQL
- `setup-postgres.sh` - Automated setup script (Bash)

**Updated Files:**
- `README.md` - Updated to reflect PostgreSQL setup
- `.gitignore` - Already properly configured

## 🚀 Quick Start Instructions

### For New Setup

1. **Start PostgreSQL with Docker:**
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

4. **Push schema to database:**
   ```bash
   npm run db:push
   ```

5. **Seed the database:**
   ```bash
   npm run db:seed
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

### For VS Code Users

1. **Install recommended extensions:**
   - Tailwind CSS IntelliSense
   - Prettier
   - ESLint
   - Prisma

2. **Open in VS Code and press F5** to start debugging

3. **Or use the integrated terminal:**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

The schema is identical to the previous SQLite version. Key models include:

- **User, Account, Session, VerificationToken** - Authentication
- **PatientProfile, StaffProfile** - User profiles
- **Appointment, Service, StaffSchedule** - Clinic operations
- **Invoice, Payment** - Billing
- **BlogPost, GalleryItem, ClinicSettings** - Content management
- **CommunicationLog, AuditLog** - System operations

## 🔧 Configuration Options

### Change PostgreSQL Credentials

Update `.env` file:
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### Use Local PostgreSQL Instead of Docker

1. Install PostgreSQL locally
2. Create database: `psql -U postgres -c "CREATE DATABASE physioconnect;"`
3. Update `.env` with your PostgreSQL credentials
4. Skip Docker Compose steps

### Change Docker Configuration

Edit `docker-compose.yml`:
```yaml
environment:
  POSTGRES_USER: your_username
  POSTGRES_PASSWORD: your_password
  POSTGRES_DB: your_database
ports:
  - "5432:5432"  # Or use a different port
```

## 🛠️ Useful Commands

### Docker
```bash
docker-compose up -d        # Start PostgreSQL
docker-compose down         # Stop PostgreSQL
docker-compose logs -f      # View logs
docker-compose restart      # Restart PostgreSQL
```

### Database
```bash
npx prisma studio          # View database in browser
npm run db:generate        # Generate Prisma Client
npm run db:push           # Push schema changes
npm run db:seed           # Seed database
```

### Development
```bash
npm run dev               # Start dev server
npm run lint              # Run ESLint
npm run build             # Build for production
```

## ✅ Verification

To verify the migration was successful:

1. Check PostgreSQL is running:
   ```bash
   docker ps
   # You should see physioconnect-db container
   ```

2. Test database connection:
   ```bash
   npx prisma studio
   # Should open at http://localhost:5555
   ```

3. Check seeded data:
   - 1 Admin user
   - 1 Clinic Manager
   - 1 Receptionist
   - 4 Doctors
   - 5 Patients
   - 6 Services
   - 7 Appointments
   - 3 Blog posts
   - 6 Gallery items
   - 12 Payments

## 🐛 Troubleshooting

### Issue: Connection refused
```bash
# Make sure PostgreSQL is running
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### Issue: Database doesn't exist
```bash
# Create database
docker exec -it physioconnect-db psql -U postgres -c "CREATE DATABASE physioconnect;"
```

### Issue: Permission denied
```bash
# Check .env file has correct credentials
# Ensure PostgreSQL user has necessary permissions
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [VS Code Debugging](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)

## 🎯 Next Steps

1. ✅ Verify the application runs at http://localhost:3000
2. ✅ Test login with admin credentials
3. ✅ Explore admin panel and features
4. ✅ Check Prisma Studio to view data
5. ✅ Start building your features!

## 📝 Notes

- All SQLite database files should be removed (they're in .gitignore)
- The migration is backward compatible in schema structure
- PostgreSQL provides better performance and scalability for production
- Docker makes it easy to share the development environment

---

**Migration completed successfully! 🎉**
