import fastify, { FastifyInstance } from 'fastify';
import { Logger } from '../../logging/Logger';
import { ConfigurationManager } from '../../../config/ConfigurationManagerInterface';
import { healthRoutes } from '../routes/healthRoutes';
import { HealthController } from '../controllers/HealthController';

export class WebServerService {
  private readonly server: FastifyInstance;

  constructor(
    private logger: Logger,
    private config: ConfigurationManager
  ) {
    this.server = fastify({
      logger: this.logger.getPinoInstance()
    });
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
