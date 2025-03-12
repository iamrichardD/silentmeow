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

import { pino } from 'pino';
import { ConfigurationManager } from '@config/ConfigurationManagerInterface.js';

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

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(meta || {}, message);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(meta || {}, message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(meta || {}, message);
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
