-- backend/db/migrations/0002__create_user_table.sql

-- Create the updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION silentmeow.update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DO $block$
BEGIN
    -- Create user table if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'silentmeow'
        AND tablename = 'user'
    ) THEN
        -- Create the user table
        CREATE TABLE silentmeow.user (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) NOT NULL,
            username VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP WITH TIME ZONE
        );

        -- Create indices considering soft delete
        -- Email uniqueness only applies to non-deleted records
        CREATE UNIQUE INDEX idx_user_email_active
            ON silentmeow.user(email)
            WHERE deleted_at IS NULL;

        -- Username uniqueness only applies to non-deleted records
        CREATE UNIQUE INDEX idx_user_username_active
            ON silentmeow.user(username)
            WHERE deleted_at IS NULL;

        -- Index for querying deleted/active records
        CREATE INDEX idx_user_deleted_at
            ON silentmeow.user(deleted_at);

        -- Add the updated_at trigger
        CREATE TRIGGER update_user_updated_at
            BEFORE UPDATE ON silentmeow.user
            FOR EACH ROW
            EXECUTE FUNCTION silentmeow.update_updated_at_column();

        -- Grant permissions for CQRS
        GRANT SELECT ON silentmeow.user TO silentmeow_reader;
        GRANT SELECT, INSERT, UPDATE ON silentmeow.user TO silentmeow_writer;
        -- Note: No DELETE permission since we're using soft deletes

        -- Add table and column comments
        COMMENT ON TABLE silentmeow.user IS 'User account information';
        COMMENT ON COLUMN silentmeow.user.id IS 'Unique identifier for the user';
        COMMENT ON COLUMN silentmeow.user.email IS 'User email address used for authentication';
        COMMENT ON COLUMN silentmeow.user.username IS 'Unique username for the user';
        COMMENT ON COLUMN silentmeow.user.password_hash IS 'Hashed password for user authentication';
        COMMENT ON COLUMN silentmeow.user.created_at IS 'Timestamp when the record was created';
        COMMENT ON COLUMN silentmeow.user.updated_at IS 'Timestamp when the record was last updated';
        COMMENT ON COLUMN silentmeow.user.deleted_at IS 'Timestamp when the record was soft deleted, NULL for active records';
    END IF;
END;
$block$;
