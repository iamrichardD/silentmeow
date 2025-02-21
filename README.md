# silentmeow

## Project Overview
silentmeow is a monorepo web application with advanced WebAssembly and Rust capabilities.

## Tech Stack
- Backend: Node.js with TypeScript
- Frontend: Rust WebAssembly
- Database: PostgreSQL
- Monitoring: Prometheus

## Database Development

### Local Development Connection
Connect to the database using psql:
```bash
# Connect as admin/developer
psql -h localhost -U silentmeow -d silentmeow

# Connect as reader (read-only access)
psql -h localhost -U silentmeow_reader -d silentmeow

# Connect as writer (read-write access)
psql -h localhost -U silentmeow_writer -d silentmeow
```

### ⚠️ Security Notice ⚠️
The database credentials in the migration scripts and environment templates are for local development only.

For production environments:
- Change all database passwords
- Never use the development credentials in any non-local environment
- Follow your organization's security guidelines for credential management

For cloud deployments:
- Use cloud-native secrets management services (e.g., AWS Secrets Manager, Azure Key Vault, GCP Secret Manager)
- Do not use .env files in cloud environments
- Follow cloud provider's best practices for secret rotation and management
- Implement proper IAM roles and policies for database access

## Getting Started

### Local Development
1. Copy `.env.template` to `.env`
2. Update environment variables as needed
3. Start the services:
   ```bash
   docker compose up
   ```

### Cloud Deployment
Refer to cloud-specific deployment documentation (to be added) for:
- Secrets management
- Database configuration
- Security best practices
- Infrastructure setup

## Contributing
[Contribution guidelines to be added]

## License

Copyright 2024 https://github.com/iamrichardd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
