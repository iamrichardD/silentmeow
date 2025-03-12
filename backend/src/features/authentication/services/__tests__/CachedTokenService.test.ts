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
import jwt from 'jsonwebtoken';
import { ICacheService } from '@cache/interfaces/ICacheService.js';
import { ICacheKeyGenerator } from '@cache/interfaces/ICacheKeyGenerator.js';
import { ConfigurationManager } from '@config/ConfigurationManagerInterface.js';
import { CachedTokenService } from '@auth/services/CachedTokenService.js';
import { User } from '@user/models/User.js';

// Mock dependencies
vi.mock('jsonwebtoken', () => {
  return {
    default: {
      sign: vi.fn(() => 'mocked-token'),
      verify: vi.fn(() => ({ sub: 'user-123', jti: 'token-123' })),
      decode: vi.fn(() => ({ sub: 'user-123', jti: 'token-123' }))
    }
  };
});

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'token-123')
}));

describe('CachedTokenService', () => {
  let cacheService: ICacheService;
  let keyGenerator: ICacheKeyGenerator;
  let configManager: ConfigurationManager;
  let mockLogger: any;
  let tokenService: CachedTokenService;

  const testUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: 'hash',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock cache service
    cacheService = {
      set: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue({ userId: 'user-123', valid: true }),
      delete: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(false),
      getTtl: vi.fn().mockResolvedValue(null)
    };

    // Create mock key generator
    keyGenerator = {
      generateKey: vi.fn((namespace, id, type) => `${namespace}:${type}:${id}`)
    };

    // Fix the ConfigurationManager mock
    configManager = {
      get: vi.fn().mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'authentication.jwt.accessSecret') return 'test-access-secret';
        if (key === 'authentication.jwt.refreshSecret') return 'test-refresh-secret';
        if (key === 'authentication.jwt.accessExpiresIn') return '15m';
        if (key === 'authentication.jwt.refreshExpiresIn') return '7d';
        return defaultValue;
      }) as any,
      load: vi.fn().mockResolvedValue(undefined)
    };

    // Create mock logger
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      getPinoInstance: vi.fn()
    };

    // Create token service with mocked dependencies
    tokenService = new CachedTokenService(
      configManager,
      cacheService,
      keyGenerator,
      mockLogger
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate and cache an access token', async () => {
      const token = await tokenService.generateAccessToken(testUser);

      expect(token).toBe('mocked-token');

      expect(keyGenerator.generateKey).toHaveBeenCalledWith('token', 'token-123', 'access');
      expect(cacheService.set).toHaveBeenCalledWith(
        'token:access:token-123',
        { userId: testUser.id, valid: true },
        expect.any(Number)
      );
    });

    it('should throw an error if user has no ID', async () => {
      const userWithoutId = { ...testUser };
      delete (userWithoutId as any).id;

      await expect(tokenService.generateAccessToken(userWithoutId as User))
        .rejects.toThrow('User ID is required');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate and cache a refresh token', async () => {
      const token = await tokenService.generateRefreshToken(testUser);

      expect(token).toBe('mocked-token');

      expect(keyGenerator.generateKey).toHaveBeenCalledWith('token', 'token-123', 'refresh');
      expect(cacheService.set).toHaveBeenCalledWith(
        'token:refresh:token-123',
        { userId: testUser.id, valid: true },
        expect.any(Number)
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid cached token', async () => {
      const userId = await tokenService.verifyAccessToken('valid-token');

      expect(userId).toBe('user-123');
      expect(keyGenerator.generateKey).toHaveBeenCalledWith('token', 'token-123', 'access');
      expect(cacheService.get).toHaveBeenCalledWith('token:access:token-123');
    });

    it('should return null if token is not in cache', async () => {
      vi.mocked(cacheService.get).mockResolvedValue(null);

      const userId = await tokenService.verifyAccessToken('invalid-token');

      expect(userId).toBeNull();
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should return null if token is invalidated', async () => {
      vi.mocked(cacheService.get).mockResolvedValue({ userId: 'user-123', valid: false });

      const userId = await tokenService.verifyAccessToken('invalidated-token');

      expect(userId).toBeNull();
    });

    it('should return null if jwt verification fails', async () => {
      vi.mocked(jwt.verify).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const userId = await tokenService.verifyAccessToken('invalid-jwt-token');

      expect(userId).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', async () => {
      const userId = await tokenService.verifyRefreshToken('valid-refresh-token');

      expect(userId).toBe('user-123');
      expect(keyGenerator.generateKey).toHaveBeenCalledWith('token', 'token-123', 'refresh');
      expect(cacheService.get).toHaveBeenCalledWith('token:refresh:token-123');
    });

    it('should return null if token is not in cache', async () => {
      vi.mocked(cacheService.get).mockResolvedValue(null);

      const userId = await tokenService.verifyRefreshToken('invalid-token');

      expect(userId).toBeNull();
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should return null if token is invalidated', async () => {
      vi.mocked(cacheService.get).mockResolvedValue({ userId: 'user-123', valid: false });

      const userId = await tokenService.verifyRefreshToken('invalidated-token');

      expect(userId).toBeNull();
    });

    it('should return null if jwt verification fails', async () => {
      vi.mocked(jwt.verify).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const userId = await tokenService.verifyRefreshToken('invalid-jwt-token');

      expect(userId).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('invalidateAccessToken', () => {
    it('should invalidate an access token', async () => {
      await tokenService.invalidateAccessToken('token-to-invalidate');

      expect(keyGenerator.generateKey).toHaveBeenCalledWith('token', 'token-123', 'access');
      expect(cacheService.delete).toHaveBeenCalledWith('token:access:token-123');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should handle invalid tokens gracefully', async () => {
      vi.mocked(jwt.decode).mockReturnValueOnce(null);

      await tokenService.invalidateAccessToken('invalid-token');

      expect(cacheService.delete).not.toHaveBeenCalled();
    });
  });

  describe('invalidateRefreshToken', () => {
    it('should invalidate a refresh token', async () => {
      await tokenService.invalidateRefreshToken('refresh-token-to-invalidate');

      expect(keyGenerator.generateKey).toHaveBeenCalledWith('token', 'token-123', 'refresh');
      expect(cacheService.delete).toHaveBeenCalledWith('token:refresh:token-123');
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('getTokenRemainingTime', () => {
    it('should return the remaining time for a token', async () => {
      vi.mocked(cacheService.getTtl).mockResolvedValue(600); // 10 minutes

      const remainingTime = await tokenService.getTokenRemainingTime('access', 'user-123');

      expect(remainingTime).toBe(600);
      expect(cacheService.getTtl).toHaveBeenCalledWith('token:access:user-123');
    });

    it('should return 0 when token is not found', async () => {
      vi.mocked(cacheService.getTtl).mockResolvedValue(null);

      const remainingTime = await tokenService.getTokenRemainingTime('access', 'user-123');

      expect(remainingTime).toBe(0);
    });
  });
});
