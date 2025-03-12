# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]

### Added
- Vite build system for improved module bundling
- Path alias support for cleaner imports (@config, @features, etc.)
- Rate limiting for authentication endpoints
- Authentication controllers and routes
- Security module with rate limiting support
- Comprehensive caching system
    - In-memory cache service implementation
    - Cache key generator with PII protection
    - TTL (Time To Live) support for cache entries
- Enhanced token management with cache integration
    - Token caching for improved validation performance
    - Immediate token invalidation capabilities
    - Configurable token expiration settings
- Security improvements for authentication
    - Protection against token replay attacks
    - Foundation for rate limiting
    - PII protection in cache keys
- PostgreSQL database migrations
    - CQRS user and schema setup
    - User table with soft delete support
    - Optimized indices for email and username
- Environment-based database configuration
- Docker environment setup for PostgreSQL 16
- Implemented CQRS-based user repository interfaces
- Added local authentication strategy with tests
- Created in-memory user repository for testing
- Added user and authentication domain models
- Added interfaces for password service and user management
- Fastify web server integration
- Root-level settings.json for centralized configuration
- Multi-stage Docker build process
- Flexible logging mechanism with environment-based configuration
- Restructured project to follow Vertical Slice Architecture

### Changed
- Updated WebServerService to use Fastify's built-in logger configuration
- Improved error handling in authentication flows
- Enhanced configuration loading in ES modules environment
- Updated Docker configuration for better development experience
- Reorganized authentication and user management interfaces
- Updated logging configuration to support development and production environments
- Improved Docker build and configuration strategies
- Refined build process for TypeScript compilation
- Improved configuration management approach

### Fixed
- Resolved path resolution issues in ES module environment
- Fixed configuration loading in containerized environments
- Improved TypeScript module resolution with proper aliases
- Enhanced logger initialization for better compatibility with Fastify
- Implemented type-safe configuration management
- Improved environment variable handling
- Enhanced configuration retrieval logic
- Resolved TypeScript module resolution issues

### Added (Previous Versions)
- Initial project setup
- Git repository initialization
- Project specification document (PROMPT)
- TypeScript configuration with ES6 module support
- Basic project structure for monorepo web application
- Docker containerization for backend service
- Express.js initial server configuration
- JWT authentication strategy defined
- Vitest for project testing
- Comprehensive configuration management system
    - Environment variable overrides
    - Nested configuration support
    - Type conversion for configuration values
- UUID package for unique identifier generation

### Changed (Previous Versions)
- Standardized project name to lowercase "silentmeow"
- Updated package metadata with correct license and author information
- Updated Docker base image to Node.js 22

### Security
- Secured database credentials using environment variables
- Implemented CQRS-based database access control
- Prepared initial security considerations for backend development
- Implemented basic Docker container best practices
- Defined JWT-based authentication approach
- Implemented robust configuration management
-
