# Build System Configuration

## Overview
The project uses Vite as a build tool for bundling the backend TypeScript code. This document outlines the configuration choices and rationale.

## Key Components

### Path Aliases
Path aliases are configured in both tsconfig.json and vite.config.js to enable cleaner imports:
- @config → ./src/config
- @features → ./src/features
- @auth → ./src/features/authentication
- @user → ./src/features/user
- @cache → ./src/features/cache
- @logging → ./src/features/logging
- @security → ./src/features/security
- @web → ./src/features/web-server
- @test → ./src/test
- @ → ./src

### Build Process
The build process:
1. Compiles TypeScript using Vite's built-in esbuild transpiler
2. Bundles modules into a single output file
3. Generates source maps for debugging
4. Preserves path aliases during the build

### Test Configuration
Vitest is configured to recognize the same path aliases, ensuring consistent import patterns between source and test files.

### Docker Integration
The Docker build process:
1. Installs dependencies including Vite
2. Runs the Vite build
3. Uses the bundled output for the production container

## Rationale
This approach provides several benefits:
- Simplified deployment with fewer files
- Consistent module resolution between development and production
- Better developer experience with cleaner import paths
- Improved build performance
-
