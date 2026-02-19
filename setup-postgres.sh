#!/bin/bash

# PostgreSQL Setup Script for PhysioConnect
# This script helps you set up PostgreSQL and initialize the database

set -e

echo "🚀 Setting up PostgreSQL for PhysioConnect..."
echo ""

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"

    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        echo "✅ Docker daemon is running"

        # Check if container already exists
        if [ "$(docker ps -aq -f name=physioconnect-db)" ]; then
            echo "⚠️  Container 'physioconnect-db' already exists"
            read -p "Do you want to remove and recreate it? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo "🗑️  Removing existing container..."
                docker rm -f physioconnect-db
                docker volume rm postgres_data 2>/dev/null || true
            else
                echo "✋ Keeping existing container"
            fi
        fi

        # Start PostgreSQL container
        if [ ! "$(docker ps -aq -f name=physioconnect-db)" ]; then
            echo "🐳 Starting PostgreSQL container..."
            docker-compose up -d postgres

            echo "⏳ Waiting for PostgreSQL to be ready..."
            sleep 5

            # Wait for database to be ready
            until docker exec physioconnect-db pg_isready -U postgres > /dev/null 2>&1; do
                echo "⏳ Waiting for PostgreSQL..."
                sleep 2
            done

            echo "✅ PostgreSQL is ready!"
        fi
    else
        echo "❌ Docker daemon is not running. Please start Docker and try again."
        exit 1
    fi
else
    echo "❌ Docker is not installed"
    echo ""
    echo "Please install Docker first:"
    echo "  - macOS: brew install --cask docker"
    echo "  - Ubuntu/Debian: sudo apt install docker.io docker-compose"
    echo "  - Windows: Download from https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
bun install

echo ""
echo "🔧 Generating Prisma Client..."
bun run db:generate

echo ""
echo "📤 Pushing schema to PostgreSQL..."
bun run db:push

echo ""
echo "🌱 Seeding database with sample data..."
bun run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Open the project in VS Code"
echo "  2. Run: bun run dev"
echo "  3. Open http://localhost:3000 in your browser"
echo ""
echo "To view the database:"
echo "  npx prisma studio"
echo ""
echo "To stop PostgreSQL:"
echo "  docker-compose down"
echo ""
