export class HealthController {
  async getHealthStatus(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  }
}
