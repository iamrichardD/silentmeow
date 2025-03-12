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

// backend/src/features/security/rate-limit/factories/RateLimitConfigurationFactory.ts

import { ConfigurationManager } from '@config/ConfigurationManagerInterface.js';
import { IRateLimitConfiguration } from '@security/rate-limit/interfaces/IRateLimitConfiguration.js';

export class RateLimitConfigurationFactory {
  static create(config: ConfigurationManager): IRateLimitConfiguration {
    const environment = config.get<string>('app.environment', 'development');

    // Default values for development
    const defaults = {
      maxAttempts: 10,
      windowSeconds: 15 * 60, // 15 minutes
      blockDurationSeconds: 15 * 60, // 15 minutes
    };

    // Use configuration values if available, otherwise use defaults
    return {
      maxAttempts: config.get<number>(
        'security.rateLimit.maxAttempts',
        environment === 'production' ? 5 : defaults.maxAttempts
      ),
      windowSeconds: config.get<number>(
        'security.rateLimit.windowSeconds',
        defaults.windowSeconds
      ),
      blockDurationSeconds: config.get<number>(
        'security.rateLimit.blockDurationSeconds',
        environment === 'production' ? 60 * 60 : defaults.blockDurationSeconds // 1 hour in production
      ),
    };
  }
}
