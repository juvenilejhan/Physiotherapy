# Quick Start: VS Code + PostgreSQL

This guide will help you quickly set up the project with PostgreSQL in VS Code.

## 🚀 Quick Setup (5 minutes)

### Method 1: Using Docker (Recommended)

```bash
# 1. Start PostgreSQL with Docker Compose
docker-compose up -d

# 2. Install dependencies
npm install

# 3. Generate Prisma Client
npm run db:generate

# 4. Push schema to database
npm run db:push

# 5. Seed database with sample data
npm run db:seed

# 6. Start development server
npm run dev
```

Now open http://localhost:3000 in your browser!

### Method 2: Using Local PostgreSQL

If you have PostgreSQL installed locally:

```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE physioconnect;"

# 2. Update .env with your PostgreSQL credentials
# DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/physioconnect?schema=public"

# 3. Run the setup steps from Method 1 (steps 2-6)
```

## 📝 What Changed

- **Database**: Migrated from SQLite to PostgreSQL
- **Configuration**: Updated `.env` with PostgreSQL connection string
- **Prisma Schema**: Changed datasource provider to PostgreSQL
- **VS Code Config**: Added debugging configurations and recommended extensions

## 🛠️ VS Code Setup

### Install Recommended Extensions

When you open the project in VS Code, install these extensions:

1. **Tailwind CSS IntelliSense** - Autocomplete and hover info for Tailwind
2. **Prettier** - Code formatting
3. **ESLint** - Linting
4. **Prisma** - Prisma schema support

### Debugging in VS Code

Press `F5` to start debugging with the following configurations:

- **Next.js: debug server-side** - Debug server-side code
- **Next.js: debug client-side** - Debug in Chrome DevTools
- **Next.js: debug full stack** - Debug both server and client

### Useful VS Code Features

- **Format on Save**: Automatically formats code with Prettier
- **Lint on Save**: Auto-fixes ESLint issues
- **Prisma Studio**: View and edit database data
  ```bash
  npx prisma studio
  ```

## 📊 Database Management

### View Data with Prisma Studio

```bash
npx prisma studio
```

Opens a web interface at http://localhost:5555 to view and edit data.

### Reset Database (⚠️ Deletes all data)

```bash
docker-compose down -v  # Stop and remove Docker volumes
docker-compose up -d    # Start fresh database
npm run db:push        # Push schema
npm run db:seed        # Seed data
```

### Create Migrations

After modifying `prisma/schema.prisma`:

```bash
npm run db:migrate
```

## 🐳 Docker Commands

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

## 🔧 Environment Variables

Update `.env` file with your PostgreSQL credentials:

```env
# PostgreSQL Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/physioconnect?schema=public"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
```

## 📚 Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run lint                   # Run ESLint
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npm run db:generate            # Generate Prisma Client
npm run db:push               # Push schema to database
npm run db:migrate            # Create and run migrations
npm run db:reset              # Reset database and reseed
npm run db:seed               # Seed database with sample data

# Tools
npx prisma studio             # Open database GUI
npx prisma db execute         # Execute SQL queries
```

## 🐛 Troubleshooting

### Issue: "Connection refused"

**Solution**: Make sure PostgreSQL is running
```bash
# If using Docker
docker-compose up -d

# If using local PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start  # Linux
```

### Issue: "Database does not exist"

**Solution**: Create the database
```bash
psql -U postgres -c "CREATE DATABASE physioconnect;"
```

### Issue: "Prisma Client did not initialize"

**Solution**: Regenerate Prisma Client
```bash
npm run db:generate
```

### Issue: Port 3000 already in use

**Solution**: Kill the process using port 3000
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## 📖 Additional Documentation

- [Full PostgreSQL Setup Guide](./POSTGRESQL_SETUP.md) - Detailed setup instructions
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎯 Next Steps

1. ✅ Verify the application runs at http://localhost:3000
2. ✅ Explore the admin panel at `/admin`
3. ✅ View seeded data with `npx prisma studio`
4. ✅ Start building your features!

## 💡 Tips

- Use `npx prisma studio` to quickly view and edit data
- The `.env` file should not be committed to version control
- Use the VS Code debugger for easier development
- All database changes should be done through Prisma migrations
