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

// backend/src/features/cache/implementations/CacheKeyGenerator.ts

import { createHash } from 'crypto';
import { ICacheKeyGenerator } from '@cache/interfaces/ICacheKeyGenerator.js';
import { User } from '@user/models/User.js';

export class CacheKeyGenerator implements ICacheKeyGenerator {
  private readonly MAX_KEY_LENGTH = 100;

  generateKey(namespace: string, ...args: unknown[]): string {
    // Handle User objects specially to protect PII
    if (args.length === 1 && this.isUser(args[0])) {
      return this.generateUserKey(namespace, args[0]);
    }

    // Hash email addresses or potential PII
    const sanitizedArgs = args.map(arg => {
      if (typeof arg === 'string' && this.mightContainPII(arg)) {
        return this.hashValue(arg);
      }
      return arg;
    });

    const key = `${namespace}:${sanitizedArgs.map(arg =>
      typeof arg === 'object' ? this.hashValue(JSON.stringify(arg)) : String(arg)
    ).join(':')}`;

    if (key.length > this.MAX_KEY_LENGTH) {
      return this.hashValue(key);
    }

    return key;
  }

  private isUser(obj: unknown): obj is User {
    return obj !== null &&
      typeof obj === 'object' &&
      'id' in obj &&
      'email' in obj;
  }

  private generateUserKey(namespace: string, user: User): string {
    // Only use non-PII identifiers
    return `${namespace}:id:${user.id}`;
  }

  private mightContainPII(value: string): boolean {
    // Check for common PII patterns
    return value.includes('@') || // Email
      value.includes('-') || // UUID
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value); // Email regex
  }

  private hashValue(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
