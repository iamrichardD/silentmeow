import { FastifyInstance } from 'fastify';
import { HealthController } from '@web/controllers/HealthController.js';

export function healthRoutes(
  fastify: FastifyInstance,
  controller: HealthController
) {
  fastify.get('/health', async (request, reply) => {
    return controller.getHealthStatus();
  });
}
