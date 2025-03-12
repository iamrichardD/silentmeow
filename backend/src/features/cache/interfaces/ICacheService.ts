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

// backend/src/features/cache/interfaces/ICacheService.ts

export interface ICacheService {
  /**
   * Set a value in the cache
   * @param key The key to store the value under
   * @param value The value to store
   * @param ttlSeconds Optional time-to-live in seconds
   */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /**
   * Get a value from the cache
   * @param key The key to retrieve
   * @returns The stored value, or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Delete a value from the cache
   * @param key The key to delete
   */
  delete(key: string): Promise<void>;

  /**
   * Check if a key exists in the cache
   * @param key The key to check
   * @returns True if the key exists, false otherwise
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get the remaining TTL in seconds for a key
   * @param key The key to check
   * @returns Remaining TTL in seconds, or null if key doesn't exist
   */
  getTtl(key: string): Promise<number | null>;
}
