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

import { ICacheService } from '../interfaces/ICacheService';

interface CacheEntry<T> {
  value: T;
  expiresAt?: number;
}

export class MemoryCacheService implements ICacheService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  async get<T>(key: string): Promise<T | null> {
    if (!key) {
      throw new Error('Invalid cache key');
    }

    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check expiration
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!key) {
      throw new Error('Invalid cache key');
    }

    try {
      // Verify serializability
      JSON.stringify(value);

      const entry: CacheEntry<T> = {
        value,
        expiresAt: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : undefined
      };

      this.cache.set(key, entry);
    } catch (error) {
      throw new Error('Unable to serialize cache value');
    }
  }

  async delete(key: string): Promise<void> {
    if (!key) {
      throw new Error('Invalid cache key');
    }

    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}
