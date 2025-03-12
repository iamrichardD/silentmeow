// backend/src/features/security/rate-limit/services/ProgressiveRateLimitService.ts
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

import { ICacheService } from '@cache/interfaces/ICacheService.js';
import { Logger } from '@logging/Logger.js';
import { IRateLimitConfiguration } from '@security/rate-limit/interfaces/IRateLimitConfiguration.js';

export class ProgressiveRateLimitService {
  private readonly attemptPrefix = 'rate-limit:attempt:';
  private readonly blockPrefix = 'rate-limit:block:';
  private readonly violationCountPrefix = 'rate-limit:violations:';

  constructor(
    private cacheService: ICacheService,
    private logger: Logger,
    private config: IRateLimitConfiguration
  ) {}

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
      const blockDuration = await this.getBlockDuration(identifier);
      this.logger.warn(
        `Rate limit exceeded for ${identifier}. Blocked for ${blockDuration} seconds`
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
   * Gets the remaining time in seconds that an identifier is blocked
   * @param identifier - The identifier to check
   * @returns Seconds remaining, or 0 if not blocked
   */
  public async getBlockTimeRemaining(identifier: string): Promise<number> {
    const blockKey = this.getBlockKey(identifier);
    const ttl = await this.cacheService.getTtl(blockKey);
    return ttl ?? 0;
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
   * Calculate the block duration based on violation history
   * @param identifier - The identifier to check
   * @returns Block duration in seconds
   */
  private async getBlockDuration(identifier: string): Promise<number> {
    const violationKey = this.getViolationKey(identifier);
    const violations = await this.cacheService.get<number>(violationKey) ?? 0;

    // Increase block time for repeated violations
    // First violation: normal block time
    // Each subsequent violation: double the block time, up to a maximum
    const blockMultiplier = Math.min(Math.pow(2, violations), 32); // Max 32x normal duration

    // Update violation count (keep for 30 days)
    await this.cacheService.set(violationKey, violations + 1, 60 * 60 * 24 * 30);

    return this.config.blockDurationSeconds * blockMultiplier;
  }

  /**
   * Block an identifier for the calculated block duration
   * @param identifier - The identifier to block
   */
  private async blockIdentifier(identifier: string): Promise<void> {
    const blockKey = this.getBlockKey(identifier);
    const blockDuration = await this.getBlockDuration(identifier);

    await this.cacheService.set(
      blockKey,
      true,
      blockDuration
    );
  }

  private getAttemptKey(identifier: string): string {
    return `${this.attemptPrefix}${identifier}`;
  }

  private getBlockKey(identifier: string): string {
    return `${this.blockPrefix}${identifier}`;
  }

  private getViolationKey(identifier: string): string {
    return `${this.violationCountPrefix}${identifier}`;
  }
}
