# Database Migration Guidelines

## Migration File Naming Convention
- Files should be zero-padded numbered sequential files
- Follow pattern: `{0000}__{description}.sql`
- Use underscores to separate words in description
- Description should be brief but clear about purpose
- Example: `0001__init_cqrs_setup.sql`

## File Location
```
backend/
  db/
    migrations/
      0001__init_cqrs_setup.sql
      0002__create_user_table.sql
```

## Script Guidelines
### General
- All scripts must be idempotent
- Use `IF NOT EXISTS` checks
- Schema name: silentmeow
- Table names should be singular (e.g., 'user' not 'users')
- Include appropriate comments

### Standard Fields
- Primary keys should be UUID type
- Timestamps should include timezone
- Include audit fields:
    - created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    - updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    - deleted_at TIMESTAMP WITH TIME ZONE (for soft deletes)

### Triggers
- Define trigger functions outside DO blocks
- Use distinct dollar-quote tags (e.g., $func$, $block$)
- Avoid nested dollar quotes

### Indices
- Create appropriate indices for search fields
- For soft-deleted tables, unique constraints should only apply to non-deleted records
- Example:
  ```sql
  CREATE UNIQUE INDEX idx_user_email_active
      ON silentmeow.user(email)
      WHERE deleted_at IS NULL;
  ```

### CQRS Permissions
- Reader role: silentmeow_reader (SELECT only)
- Writer role: silentmeow_writer (SELECT, INSERT, UPDATE)
- No DELETE permissions when using soft deletes
- Grant appropriate permissions for sequences

### Documentation
- Include comments on tables and columns
- Document any assumptions or constraints
- Note development-only credentials

## Security Considerations
### Local Development
- Default credentials in migrations are for development only
- Use .env file for local development configuration

### Production/Cloud
- All passwords must be changed
- Use cloud provider's secrets management
- Follow organization's security guidelines
- Do not use .env files in production

## Example Migration Script Structure
```sql
-- Create standalone functions first
CREATE OR REPLACE FUNCTION silentmeow.update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Main migration block
DO $block$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'silentmeow'
        AND tablename = 'table_name'
    ) THEN
        -- Create table
        CREATE TABLE silentmeow.table_name (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            -- Other fields
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP WITH TIME ZONE
        );

        -- Create indices
        CREATE INDEX idx_table_name_field
            ON silentmeow.table_name(field);

        -- Add triggers
        CREATE TRIGGER update_table_name_updated_at
            BEFORE UPDATE ON silentmeow.table_name
            FOR EACH ROW
            EXECUTE FUNCTION silentmeow.update_updated_at_column();

        -- Grant permissions
        GRANT SELECT ON silentmeow.table_name TO silentmeow_reader;
        GRANT SELECT, INSERT, UPDATE ON silentmeow.table_name TO silentmeow_writer;

        -- Add documentation
        COMMENT ON TABLE silentmeow.table_name IS 'Description';
        COMMENT ON COLUMN silentmeow.table_name.id IS 'Unique identifier';
    END IF;
END;
$block$;
```
