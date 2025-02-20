-- 0001__init_cqrs_setup.sql

-- Note: In production, passwords should be changed from these defaults
DO $$
BEGIN
    -- Create the application users if they don't exist
    IF NOT EXISTS (
        SELECT FROM pg_roles WHERE rolname = 'silentmeow'
    ) THEN
        CREATE USER silentmeow WITH PASSWORD 'silentmeow';
END IF;

    IF NOT EXISTS (
        SELECT FROM pg_roles WHERE rolname = 'silentmeow_writer'
    ) THEN
        CREATE USER silentmeow_writer WITH PASSWORD 'silentmeow_writer';
END IF;

    IF NOT EXISTS (
        SELECT FROM pg_roles WHERE rolname = 'silentmeow_reader'
    ) THEN
        CREATE USER silentmeow_reader WITH PASSWORD 'silentmeow_reader';
END IF;

    -- Create the application schema if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM pg_namespace WHERE nspname = 'silentmeow'
    ) THEN
CREATE SCHEMA silentmeow;
END IF;

    -- Set up writer permissions
    GRANT USAGE ON SCHEMA silentmeow TO silentmeow_writer;
    GRANT CREATE ON SCHEMA silentmeow TO silentmeow_writer;

    GRANT USAGE ON SCHEMA silentmeow TO silentmeow;
    GRANT CREATE ON SCHEMA silentmeow TO silentmeow;

    -- Writer gets full CRUD permissions on all tables
    ALTER DEFAULT PRIVILEGES IN SCHEMA silentmeow
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO silentmeow_writer;

ALTER DEFAULT PRIVILEGES IN SCHEMA silentmeow
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO silentmeow;

ALTER DEFAULT PRIVILEGES IN SCHEMA silentmeow
    GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO silentmeow_writer;

-- Set up reader permissions (read-only)
GRANT USAGE ON SCHEMA silentmeow TO silentmeow_reader;

    -- Reader gets only SELECT permissions
    ALTER DEFAULT PRIVILEGES IN SCHEMA silentmeow
    GRANT SELECT ON TABLES TO silentmeow_reader;

ALTER DEFAULT PRIVILEGES IN SCHEMA silentmeow
    GRANT SELECT ON SEQUENCES TO silentmeow_reader;

-- Set search paths
ALTER ROLE silentmeow_writer SET search_path TO silentmeow, public;
    ALTER ROLE silentmeow_reader SET search_path TO silentmeow, public;
END $$;

-- Add warning comments for production deployment
COMMENT ON ROLE silentmeow IS 'Application database user - CHANGE PASSWORD IN PRODUCTION';
COMMENT ON ROLE silentmeow_writer IS 'Application database write user - CHANGE PASSWORD IN PRODUCTION';
COMMENT ON ROLE silentmeow_reader IS 'Application database read user - CHANGE PASSWORD IN PRODUCTION';
