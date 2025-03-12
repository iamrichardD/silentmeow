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
import { MemoryCacheService } from '@cache/implementations/MemoryCacheService.js';

// Helper function to wait/sleep
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('MemoryCacheService', () => {
  let cacheService: MemoryCacheService;

  beforeEach(() => {
    cacheService = new MemoryCacheService();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('set and get', () => {
    it('should store and retrieve a value', async () => {
      await cacheService.set('test-key', 'test-value');
      const value = await cacheService.get('test-key');
      expect(value).toBe('test-value');
    });

    it('should return null for non-existent keys', async () => {
      const value = await cacheService.get('non-existent');
      expect(value).toBeNull();
    });

    it('should handle different value types', async () => {
      const testObj = { name: 'Test', value: 123 };
      await cacheService.set('number-key', 42);
      await cacheService.set('boolean-key', true);
      await cacheService.set('object-key', testObj);

      expect(await cacheService.get('number-key')).toBe(42);
      expect(await cacheService.get('boolean-key')).toBe(true);
      expect(await cacheService.get('object-key')).toEqual(testObj);
    });

    it('should expire items after TTL', async () => {
      await cacheService.set('expiring-key', 'expiring-value', 1); // 1 second TTL

      // Before expiration
      expect(await cacheService.get('expiring-key')).toBe('expiring-value');

      // Advance time by 1.1 seconds
      vi.advanceTimersByTime(1100);

      // After expiration
      expect(await cacheService.get('expiring-key')).toBeNull();
    });
  });

  describe('delete', () => {
    it('should remove an item from cache', async () => {
      await cacheService.set('delete-key', 'delete-value');
      await cacheService.delete('delete-key');
      expect(await cacheService.get('delete-key')).toBeNull();
    });

    it('should not throw when deleting non-existent keys', async () => {
      await expect(cacheService.delete('non-existent')).resolves.not.toThrow();
    });
  });

  describe('exists', () => {
    it('should return true for existing keys', async () => {
      await cacheService.set('exists-key', 'exists-value');
      expect(await cacheService.exists('exists-key')).toBe(true);
    });

    it('should return false for non-existent keys', async () => {
      expect(await cacheService.exists('non-existent')).toBe(false);
    });

    it('should return false for expired keys', async () => {
      await cacheService.set('expiring-key', 'expiring-value', 1); // 1 second TTL

      // Before expiration
      expect(await cacheService.exists('expiring-key')).toBe(true);

      // Advance time by 1.1 seconds
      vi.advanceTimersByTime(1100);

      // After expiration
      expect(await cacheService.exists('expiring-key')).toBe(false);
    });
  });

  // Add new test section for getTtl method
  describe('getTtl', () => {
    it('should return the remaining TTL for a key', async () => {
      await cacheService.set('ttl-key', 'ttl-value', 10); // 10 seconds TTL

      // Advance time by 2 seconds
      vi.advanceTimersByTime(2000);

      // Should have approximately 8 seconds left
      const ttl = await cacheService.getTtl('ttl-key');
      expect(ttl).toBeGreaterThanOrEqual(7);
      expect(ttl).toBeLessThanOrEqual(8);
    });

    it('should return null for non-existent keys', async () => {
      const ttl = await cacheService.getTtl('non-existent');
      expect(ttl).toBeNull();
    });

    it('should return null for expired keys', async () => {
      await cacheService.set('expiring-ttl-key', 'expiring-value', 1); // 1 second TTL

      // Advance time by 1.1 seconds
      vi.advanceTimersByTime(1100);

      // After expiration
      const ttl = await cacheService.getTtl('expiring-ttl-key');
      expect(ttl).toBeNull();
    });

    it('should return null for keys with no expiration', async () => {
      await cacheService.set('no-ttl-key', 'no-ttl-value'); // No TTL specified

      const ttl = await cacheService.getTtl('no-ttl-key');
      expect(ttl).toBeNull();
    });
  });
});
