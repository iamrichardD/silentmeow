// backend/src/features/web-server/services/WebServerService.ts
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

import { fastify, FastifyInstance } from 'fastify';
import { Logger } from '@logging/Logger.js';
import { ConfigurationManager } from '@config/ConfigurationManagerInterface.js';
import { HealthController } from '@web/controllers/HealthController.js';
import { healthRoutes } from '@web/routes/healthRoutes.js';

export class WebServerService {
  private readonly server: FastifyInstance;

  constructor(
    private logger: Logger,
    private config: ConfigurationManager
  ) {
    // Fix: Use a logger configuration object instead of the pino instance directly
    this.server = fastify({
      logger: {
        level: this.config.get('logging.level', 'info'),
      }
    });
  }

  getServerInstance(): FastifyInstance {
    return this.server;
  }

  async initialize(): Promise<void> {
    const healthController = new HealthController();
    healthRoutes(this.server, healthController);

    try {
      const port = this.config.get('server.port', 3000);
      const host = this.config.get('server.host', '0.0.0.0');

      await this.server.listen({
        port,
        host
      });

      this.logger.info(`Server listening on ${host}:${port}`);
    } catch (err) {
      // Type-safe error logging
      const errorMessage = err instanceof Error
        ? err.message
        : String(err);

      this.logger.error('Failed to start server', new Error(errorMessage));
    }
  }

  async shutdown(): Promise<void> {
    await this.server.close();
  }
}
