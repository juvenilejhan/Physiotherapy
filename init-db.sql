-- PostgreSQL initialization script for PhysioConnect
-- This script runs automatically when the container starts for the first time

-- Enable UUID extension (useful for future features)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE physioconnect TO postgres;

-- Create a simple function to check database connection
CREATE OR REPLACE FUNCTION health_check() RETURNS text AS $$
BEGIN
    RETURN 'PhysioConnect database is ready';
END;
$$ LANGUAGE plpgsql;
