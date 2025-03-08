/*
 * Copyright 2024 https://github.com/iamrichardd
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

import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { UserFactory } from '../../../../test/factories/UserFactory';
import { ConfigurationManager } from '../../../../config/ConfigurationManagerInterface';
import { ICacheService } from '../../../cache/interfaces/ICacheService';
import { ICacheKeyGenerator } from '../../../cache/interfaces/ICacheKeyGenerator';
import { CachedTokenService } from '../CachedTokenService';

// Mock implementations
const mockCacheService: ICacheService = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn()
};

const mockKeyGenerator: ICacheKeyGenerator = {
  generateKey: vi.fn((namespace, ...args) => `${namespace}:${args.join(':')}`)
};

// Type-safe mock implementation of ConfigurationManager
const mockConfigManager: ConfigurationManager = {
  get: vi.fn(function get<T extends string | number | boolean | Record<string, any>>(
    key: string,
    defaultValue?: T
  ): T {
    const configValues: Record<string, string> = {
      'authentication.jwt.accessSecret': 'test-access-secret',
      'authentication.jwt.refreshSecret': 'test-refresh-secret',
      'authentication.jwt.accessExpiresIn': '15m',
      'authentication.jwt.refreshExpiresIn': '7d'
    };

    // If the key exists in our config values, return it cast to T
    if (key in configValues) {
      return configValues[key] as unknown as T;
    }

    // Otherwise, return the default value or empty string cast to T
    return (defaultValue !== undefined ? defaultValue : '') as unknown as T;
  }),
  load: vi.fn()
};

describe('CachedTokenService', () => {
  let tokenService: CachedTokenService;
  let testUser = UserFactory.create();

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Initialize token service
    tokenService = new CachedTokenService(mockConfigManager, mockCacheService, mockKeyGenerator);
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', async () => {
      // Mock cache set to resolve
      vi.mocked(mockCacheService.set).mockResolvedValue();

      // Mock key generator
      vi.mocked(mockKeyGenerator.generateKey).mockImplementation(
        (namespace, ...args) => `${namespace}:${args.join(':')}`
      );

      const token = await tokenService.generateAccessToken(testUser);

      // Verify the token is a string
      expect(typeof token).toBe('string');

      // Decode the token and check payload
      const decoded = jwt.decode(token) as any;
      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.jti).toBeDefined();

      // Verify the cache was set
      expect(mockCacheService.set).toHaveBeenCalledTimes(1);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        `token:${decoded.jti}:access`,
        { userId: testUser.id, valid: true },
        expect.any(Number)
      );

      // Verify the key generator was called correctly
      expect(mockKeyGenerator.generateKey).toHaveBeenCalledWith(
        'token',
        decoded.jti,
        'access'
      );
    });

    it('should throw an error if user has no ID', async () => {
      const invalidUser = UserFactory.create({ id: undefined });

      await expect(tokenService.generateAccessToken(invalidUser))
        .rejects.toThrow('User ID is required');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', async () => {
      // Mock cache set to resolve
      vi.mocked(mockCacheService.set).mockResolvedValue();

      // Mock key generator
      vi.mocked(mockKeyGenerator.generateKey).mockImplementation(
        (namespace, ...args) => `${namespace}:${args.join(':')}`
      );

      const token = await tokenService.generateRefreshToken(testUser);

      // Verify the token is a string
      expect(typeof token).toBe('string');

      // Decode the token and check payload
      const decoded = jwt.decode(token) as any;
      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.jti).toBeDefined();

      // Verify the cache was set
      expect(mockCacheService.set).toHaveBeenCalledTimes(1);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        `token:${decoded.jti}:refresh`,
        { userId: testUser.id, valid: true },
        expect.any(Number)
      );

      // Verify the key generator was called correctly
      expect(mockKeyGenerator.generateKey).toHaveBeenCalledWith(
        'token',
        decoded.jti,
        'refresh'
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', async () => {
      // First generate a token
      vi.mocked(mockCacheService.set).mockResolvedValue();

      // Mock key generator
      vi.mocked(mockKeyGenerator.generateKey).mockImplementation(
        (namespace, ...args) => `${namespace}:${args.join(':')}`
      );

      const token = await tokenService.generateAccessToken(testUser);
      const decoded = jwt.decode(token) as any;

      // Mock cache get to return a valid token
      vi.mocked(mockCacheService.get).mockResolvedValue({
        userId: testUser.id,
        valid: true
      });

      // Verify the token
      const userId = await tokenService.verifyAccessToken(token);
      expect(userId).toBe(testUser.id);

      // Verify cache was checked
      expect(mockCacheService.get).toHaveBeenCalledTimes(1);
      expect(mockCacheService.get).toHaveBeenCalledWith(
        `token:${decoded.jti}:access`
      );

      // Verify the key generator was called correctly
      expect(mockKeyGenerator.generateKey).toHaveBeenCalledWith(
        'token',
        decoded.jti,
        'access'
      );
    });

    it('should return null for an invalid token', async () => {
      const invalidToken = 'invalid.token.string';
      const userId = await tokenService.verifyAccessToken(invalidToken);
      expect(userId).toBeNull();
    });

    it('should return null for a valid token not in cache', async () => {
      // First generate a token
      vi.mocked(mockCacheService.set).mockResolvedValue();

      // Mock key generator
      vi.mocked(mockKeyGenerator.generateKey).mockImplementation(
        (namespace, ...args) => `${namespace}:${args.join(':')}`
      );

      const token = await tokenService.generateAccessToken(testUser);

      // Mock cache get to return null (token not in cache)
      vi.mocked(mockCacheService.get).mockResolvedValue(null);

      // Verify the token
      const userId = await tokenService.verifyAccessToken(token);
      expect(userId).toBeNull();
    });

    it('should return null for a token marked as invalid in cache', async () => {
      // First generate a token
      vi.mocked(mockCacheService.set).mockResolvedValue();

      // Mock key generator
      vi.mocked(mockKeyGenerator.generateKey).mockImplementation(
        (namespace, ...args) => `${namespace}:${args.join(':')}`
      );

      const token = await tokenService.generateAccessToken(testUser);

      // Mock cache get to return an invalid token
      vi.mocked(mockCacheService.get).mockResolvedValue({
        userId: testUser.id,
        valid: false
      });

      // Verify the token
      const userId = await tokenService.verifyAccessToken(token);
      expect(userId).toBeNull();
    });
  });

  describe('invalidateAccessToken', () => {
    it('should invalidate an access token', async () => {
      // First generate a token
      vi.mocked(mockCacheService.set).mockResolvedValue();

      // Mock key generator
      vi.mocked(mockKeyGenerator.generateKey).mockImplementation(
        (namespace, ...args) => `${namespace}:${args.join(':')}`
      );

      const token = await tokenService.generateAccessToken(testUser);
      const decoded = jwt.decode(token) as any;

      // Mock cache delete to resolve
      vi.mocked(mockCacheService.delete).mockResolvedValue();

      // Invalidate the token
      await tokenService.invalidateAccessToken(token);

      // Verify cache delete was called
      expect(mockCacheService.delete).toHaveBeenCalledTimes(1);
      expect(mockCacheService.delete).toHaveBeenCalledWith(
        `token:${decoded.jti}:access`
      );

      // Verify the key generator was called correctly
      expect(mockKeyGenerator.generateKey).toHaveBeenCalledWith(
        'token',
        decoded.jti,
        'access'
      );
    });
  });

  describe('invalidateRefreshToken', () => {
    it('should invalidate a refresh token', async () => {
      // First generate a token
      vi.mocked(mockCacheService.set).mockResolvedValue();

      // Mock key generator
      vi.mocked(mockKeyGenerator.generateKey).mockImplementation(
        (namespace, ...args) => `${namespace}:${args.join(':')}`
      );

      const token = await tokenService.generateRefreshToken(testUser);
      const decoded = jwt.decode(token) as any;

      // Mock cache delete to resolve
      vi.mocked(mockCacheService.delete).mockResolvedValue();

      // Invalidate the token
      await tokenService.invalidateRefreshToken(token);

      // Verify cache delete was called
      expect(mockCacheService.delete).toHaveBeenCalledTimes(1);
      expect(mockCacheService.delete).toHaveBeenCalledWith(
        `token:${decoded.jti}:refresh`
      );

      // Verify the key generator was called correctly
      expect(mockKeyGenerator.generateKey).toHaveBeenCalledWith(
        'token',
        decoded.jti,
        'refresh'
      );
    });
  });
});
