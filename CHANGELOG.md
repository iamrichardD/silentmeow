# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]

### Added
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
- Reorganized authentication and user management interfaces
- Updated logging configuration to support development and production environments
- Improved Docker build and configuration strategies
- Refined build process for TypeScript compilation
- Improved configuration management approach

### Fixed
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
- Prepared initial security considerations for backend development
- Implemented basic Docker container best practices
- Defined JWT-based authentication approach
- Implemented robust configuration management
