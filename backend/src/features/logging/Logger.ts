import pino from 'pino';
import { ConfigurationManager } from '../../config/ConfigurationManagerInterface';

export class Logger {
  private readonly logger: pino.Logger;

  constructor(config: ConfigurationManager) {
    const environment = config.get('app.environment', 'development');

    const loggerConfig: pino.LoggerOptions = {
      level: config.get('logging.level', 'info'),
      transport: environment === 'development'
        ? {
          target: 'pino-pretty',
          options: {
            colorize: config.get('logging.colorize', true),
            translateTime: config.get('logging.translateTime', 'SYS:standard'),
            destination: config.get('logging.destination', 1)
          }
        }
        : undefined // No transport means default JSON stream to stdout
    };

    this.logger = pino(loggerConfig);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(meta || {}, message);
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    this.logger.error(
      {
        ...meta,
        err: {
          message: error?.message,
          name: error?.name,
          stack: error?.stack
        }
      },
      message
    );
  }

  getPinoInstance(): pino.Logger {
    return this.logger;
  }
}
