CREATE ROLE manasiness_app
    LOGIN
    PASSWORD 'manasiness_app_local'
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOINHERIT
    NOREPLICATION
    NOBYPASSRLS;

GRANT CONNECT ON DATABASE manasiness_dev
    TO manasiness_app;

GRANT CONNECT ON DATABASE manasiness_test
    TO manasiness_app;

\connect manasiness_dev

REVOKE CREATE ON SCHEMA public FROM PUBLIC;

GRANT USAGE ON SCHEMA public
    TO manasiness_app;

ALTER DEFAULT PRIVILEGES
    FOR ROLE manasiness
    IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLES
    TO manasiness_app;

\connect manasiness_test

REVOKE CREATE ON SCHEMA public FROM PUBLIC;

GRANT USAGE ON SCHEMA public
    TO manasiness_app;

ALTER DEFAULT PRIVILEGES
    FOR ROLE manasiness
    IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLES
    TO manasiness_app;

\connect manasiness_migration_validation

REVOKE CREATE ON SCHEMA public FROM PUBLIC;

ALTER DEFAULT PRIVILEGES
    FOR ROLE manasiness
    IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLES
    TO manasiness_app;