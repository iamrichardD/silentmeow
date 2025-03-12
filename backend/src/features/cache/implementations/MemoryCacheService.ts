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

// backend/src/features/cache/implementations/MemoryCacheService.ts

import { ICacheService } from '@cache/interfaces/ICacheService.js';

interface CacheEntry<T> {
  value: T;
  expiry: number | null;
}

export class MemoryCacheService implements ICacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiry = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
    this.cache.set(key, { value, expiry });
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiry && entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (entry.expiry && entry.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async getTtl(key: string): Promise<number | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiry && entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    // If no expiry, return null (infinite TTL)
    if (!entry.expiry) {
      return null;
    }

    // Return TTL in seconds
    return Math.ceil((entry.expiry - Date.now()) / 1000);
  }
}
