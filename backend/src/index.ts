/*
 * Copyright 2024 https://github.com/iamrichardD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HierarchicalConfigurationManager } from '@config/HierarchicalConfigurationManager.js';
import { Logger } from '@logging/Logger.js';
import { MemoryCacheService } from '@cache/implementations/MemoryCacheService.js';
import { SecurityModule } from '@security/SecurityModule.js';
import { UserRepository } from '@auth/repositories/UserRepository.js';
import { TokenService } from '@auth/services/TokenService.js';
import { PasswordService } from '@auth/services/PasswordService.js';
import { RegistrationValidationService } from '@auth/services/RegistrationValidationService.js';
import { AuthenticationService } from '@auth/services/AuthenticationService.js';
import { AuthenticationController } from '@auth/controllers/AuthenticationController.js';
import { WebServerModule } from '@web/WebServerModule.js';
import { authRoutes } from '@auth/routes/authRoutes.js';

async function bootstrap() {
  // Initialize configuration
  const configManager = new HierarchicalConfigurationManager();
  await configManager.load();

  // Initialize logging
  const logger = new Logger(configManager);

  // Initialize cache
  const cacheService = new MemoryCacheService();

  // Initialize security module with rate limiting
  const securityModule = new SecurityModule(configManager, cacheService, logger);
  const rateLimitService = securityModule.getRateLimitService();

  // Initialize repositories
  const userRepository = new UserRepository();

  // Initialize services
  const tokenService = new TokenService();
  const passwordService = new PasswordService();
  const validationService = new RegistrationValidationService();

  // Initialize authentication service with rate limiting
  const authService = new AuthenticationService(
    userRepository,
    tokenService,
    passwordService,
    validationService,
    rateLimitService,
    logger
  );

  // Initialize controllers
  const authController = new AuthenticationController(authService, logger);

  // Initialize web server
  const webServerModule = new WebServerModule(logger, configManager);
  const webServer = webServerModule.getWebServerService();

  // Register routes
  const fastifyInstance = webServer.getServerInstance();
  authRoutes(fastifyInstance, authController);

  // Start server
  await webServer.initialize();

  logger.info('Application started');
}

bootstrap().catch(error => {
  console.error('Failed to start application', error);
  process.exit(1);
});
