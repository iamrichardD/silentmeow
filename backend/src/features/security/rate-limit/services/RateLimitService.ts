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

// backend/src/features/security/rate-limit/services/RateLimitService.ts

import { ICacheService } from '@cache/interfaces/ICacheService.js';
import { Logger } from '@logging/Logger.js';
import { IRateLimitConfiguration } from '@security/rate-limit/interfaces/IRateLimitConfiguration.js';

export class RateLimitService {
  private readonly attemptPrefix = 'rate-limit:attempt:';
  private readonly blockPrefix = 'rate-limit:block:';

  constructor(
    private cacheService: ICacheService,
    private logger: Logger,
    private config: IRateLimitConfiguration
  ) {}

  /**
   * Records an authentication attempt and checks if the source is rate limited
   * @param identifier - Usually IP address or username+IP combo
   * @returns true if allowed, false if rate limited
   */
  public async recordAttempt(identifier: string): Promise<boolean> {
    // Check if currently blocked
    const isBlocked = await this.isBlocked(identifier);
    if (isBlocked) {
      this.logger.warn(`Rate limit exceeded for ${identifier}`);
      return false;
    }

    // Get current attempts
    const attemptKey = this.getAttemptKey(identifier);
    const currentAttempts = await this.getAttemptCount(identifier);
    const newAttemptCount = currentAttempts + 1;

    // Store the updated attempt count with expiry
    await this.cacheService.set(
      attemptKey,
      newAttemptCount,
      this.config.windowSeconds
    );

    // If exceeded threshold, block the identifier
    if (newAttemptCount >= this.config.maxAttempts) {
      await this.blockIdentifier(identifier);
      this.logger.warn(
        `Rate limit exceeded for ${identifier}. Blocked for ${this.config.blockDurationSeconds} seconds`
      );
      return false;
    }

    return true;
  }

  /**
   * Resets the attempt counter for an identifier (e.g., after successful login)
   * @param identifier - The identifier to reset
   */
  public async resetAttempts(identifier: string): Promise<void> {
    const attemptKey = this.getAttemptKey(identifier);
    await this.cacheService.delete(attemptKey);
  }

  /**
   * Check if an identifier is currently blocked
   * @param identifier - The identifier to check
   * @returns true if blocked, false otherwise
   */
  public async isBlocked(identifier: string): Promise<boolean> {
    const blockKey = this.getBlockKey(identifier);
    return await this.cacheService.exists(blockKey);
  }

  /**
   * Get the current attempt count for an identifier
   * @param identifier - The identifier to check
   * @returns The number of attempts
   */
  private async getAttemptCount(identifier: string): Promise<number> {
    const attemptKey = this.getAttemptKey(identifier);
    const count = await this.cacheService.get<number>(attemptKey);
    return count ?? 0;
  }

  /**
   * Block an identifier for the configured block duration
   * @param identifier - The identifier to block
   */
  private async blockIdentifier(identifier: string): Promise<void> {
    const blockKey = this.getBlockKey(identifier);
    await this.cacheService.set(
      blockKey,
      true,
      this.config.blockDurationSeconds
    );
  }

  /**
   * Gets the remaining time in seconds that an identifier is blocked
   * @param identifier - The identifier to check
   * @returns Seconds remaining, or 0 if not blocked
   */
  public async getBlockTimeRemaining(identifier: string): Promise<number> {
    const blockKey = this.getBlockKey(identifier);
    const ttl = await this.cacheService.getTtl(blockKey);
    return ttl ?? 0;
  }

  private getAttemptKey(identifier: string): string {
    return `${this.attemptPrefix}${identifier}`;
  }

  private getBlockKey(identifier: string): string {
    return `${this.blockPrefix}${identifier}`;
  }
}
