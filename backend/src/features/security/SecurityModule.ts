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

// backend/src/features/security/SecurityModule.ts

import { RateLimitService } from '@security/rate-limit/services/RateLimitService.js';
import { ConfigurationManager } from '@config/ConfigurationManagerInterface.js';
import { ICacheService } from '@cache/interfaces/ICacheService.js';
import { Logger } from '@logging/Logger.js';
import { RateLimitConfigurationFactory } from '@security/rate-limit/factories/RateLimitConfigurationFactory.js';

export class SecurityModule {
  private rateLimitService: RateLimitService;

  constructor(
    private config: ConfigurationManager,
    private cacheService: ICacheService,
    private logger: Logger
  ) {
    const rateLimitConfig = RateLimitConfigurationFactory.create(config);
    this.rateLimitService = new RateLimitService(cacheService, logger, rateLimitConfig);
  }

  getRateLimitService(): RateLimitService {
    return this.rateLimitService;
  }
}
