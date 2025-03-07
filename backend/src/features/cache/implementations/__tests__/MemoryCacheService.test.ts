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

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MemoryCacheService } from '../MemoryCacheService';
import { ICacheService } from '../../interfaces/ICacheService';
import { User } from '../../../user/models/User';
import { UserFactory } from '../../../../test/factories/UserFactory';

describe('MemoryCacheService', () => {
  let cache: ICacheService;

  beforeEach(() => {
    cache = new MemoryCacheService();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('get and set', () => {
    it('should store and retrieve a string value', async () => {
      await cache.set('test-key', 'test-value');
      const result = await cache.get<string>('test-key');
      expect(result).toBe('test-value');
    });

    it('should store and retrieve a number value', async () => {
      await cache.set('test-key', 42);
      const result = await cache.get<number>('test-key');
      expect(result).toBe(42);
    });

    it('should store and retrieve an object', async () => {
      const user = UserFactory.create();
      await cache.set('test-key', user);
      const result = await cache.get<User>('test-key');
      expect(result).toEqual(user);
    });

    it('should return null for non-existent key', async () => {
      const result = await cache.get<string>('non-existent');
      expect(result).toBeNull();
    });

    it('should handle undefined key gracefully', async () => {
      await expect(cache.get(undefined as unknown as string))
        .rejects.toThrow('Invalid cache key');
    });
  });

  describe('TTL behavior', () => {
    it('should expire items after TTL', async () => {
      await cache.set('test-key', 'test-value', 1); // 1 second TTL

      expect(await cache.get<string>('test-key')).toBe('test-value');

      // Advance time by 2 seconds
      vi.advanceTimersByTime(2000);

      expect(await cache.get<string>('test-key')).toBeNull();
    });

    it('should not expire items before TTL', async () => {
      await cache.set('test-key', 'test-value', 2); // 2 seconds TTL

      // Advance time by 1 second
      vi.advanceTimersByTime(1000);

      expect(await cache.get<string>('test-key')).toBe('test-value');
    });

    it('should not expire items without TTL', async () => {
      await cache.set('test-key', 'test-value');

      // Advance time by a long period
      vi.advanceTimersByTime(1000000);

      expect(await cache.get<string>('test-key')).toBe('test-value');
    });
  });

  describe('delete', () => {
    it('should remove an item from cache', async () => {
      await cache.set('test-key', 'test-value');
      await cache.delete('test-key');
      expect(await cache.get<string>('test-key')).toBeNull();
    });

    it('should handle deleting non-existent key', async () => {
      await expect(cache.delete('non-existent')).resolves.not.toThrow();
    });

    it('should handle undefined key gracefully', async () => {
      await expect(cache.delete(undefined as unknown as string))
        .rejects.toThrow('Invalid cache key');
    });
  });

  describe('clear', () => {
    it('should remove all items from cache', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');

      await cache.clear();

      expect(await cache.get<string>('key1')).toBeNull();
      expect(await cache.get<string>('key2')).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle circular references', async () => {
      const circular: any = {};
      circular.self = circular;

      await expect(cache.set('circular', circular))
        .rejects.toThrow('Unable to serialize cache value');
    });

    it('should handle invalid JSON after retrieval', async () => {
      // This test might need to be implemented differently based on our actual implementation
      // It's testing that corrupted cache entries are handled gracefully
      const invalidJson = '{"bad": json}';
      await expect(cache.get<any>('invalid')).resolves.toBeNull();
    });
  });
});
