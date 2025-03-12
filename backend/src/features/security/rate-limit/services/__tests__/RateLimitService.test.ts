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

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ICacheService } from '@cache/interfaces/ICacheService.js';
import { IRateLimitConfiguration } from '@security/rate-limit/interfaces/IRateLimitConfiguration.js';
import { RateLimitService } from '@security/rate-limit/services/RateLimitService.js';

describe('RateLimitService', () => {
  // Mocks
  let mockCacheService: ICacheService;
  let mockLogger: any;
  let config: IRateLimitConfiguration;
  let rateLimitService: RateLimitService;

  beforeEach(() => {
    // Setup mocks
    mockCacheService = {
      set: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(null),
      delete: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(false),
      getTtl: vi.fn().mockResolvedValue(null),
    };

    // Create a simple object-based mock for the logger
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      getPinoInstance: vi.fn(),
    };

    config = {
      maxAttempts: 5,
      windowSeconds: 60 * 15, // 15 minutes
      blockDurationSeconds: 60 * 60, // 1 hour
    };

    rateLimitService = new RateLimitService(mockCacheService, mockLogger, config);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('recordAttempt', () => {
    it('should allow first attempt', async () => {
      const result = await rateLimitService.recordAttempt('127.0.0.1');

      expect(result).toBe(true);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'rate-limit:attempt:127.0.0.1',
        1,
        config.windowSeconds
      );
    });

    it('should increment attempt counter', async () => {
      vi.mocked(mockCacheService.get).mockResolvedValue(2);

      const result = await rateLimitService.recordAttempt('127.0.0.1');

      expect(result).toBe(true);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'rate-limit:attempt:127.0.0.1',
        3,
        config.windowSeconds
      );
    });

    it('should block when max attempts reached', async () => {
      vi.mocked(mockCacheService.get).mockResolvedValue(config.maxAttempts - 1);

      const result = await rateLimitService.recordAttempt('127.0.0.1');

      expect(result).toBe(false);
      expect(mockCacheService.set).toHaveBeenCalledTimes(2);
      expect(mockCacheService.set).toHaveBeenLastCalledWith(
        'rate-limit:block:127.0.0.1',
        true,
        config.blockDurationSeconds
      );
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should reject attempt when already blocked', async () => {
      vi.mocked(mockCacheService.exists).mockResolvedValue(true);

      const result = await rateLimitService.recordAttempt('127.0.0.1');

      expect(result).toBe(false);
      expect(mockCacheService.get).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('resetAttempts', () => {
    it('should reset attempt counter', async () => {
      await rateLimitService.resetAttempts('127.0.0.1');

      expect(mockCacheService.delete).toHaveBeenCalledWith(
        'rate-limit:attempt:127.0.0.1'
      );
    });
  });

  describe('isBlocked', () => {
    it('should return true when blocked', async () => {
      vi.mocked(mockCacheService.exists).mockResolvedValue(true);

      const result = await rateLimitService.isBlocked('127.0.0.1');

      expect(result).toBe(true);
    });

    it('should return false when not blocked', async () => {
      vi.mocked(mockCacheService.exists).mockResolvedValue(false);

      const result = await rateLimitService.isBlocked('127.0.0.1');

      expect(result).toBe(false);
    });
  });

  describe('getBlockTimeRemaining', () => {
    it('should return remaining time when blocked', async () => {
      vi.mocked(mockCacheService.getTtl).mockResolvedValue(1800);

      const result = await rateLimitService.getBlockTimeRemaining('127.0.0.1');

      expect(result).toBe(1800);
    });

    it('should return 0 when not blocked', async () => {
      vi.mocked(mockCacheService.getTtl).mockResolvedValue(null);

      const result = await rateLimitService.getBlockTimeRemaining('127.0.0.1');

      expect(result).toBe(0);
    });
  });
});
