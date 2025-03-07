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

// backend/src/features/cache/implementations/__tests__/CacheKeyGenerator.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { createHash } from 'crypto';
import { CacheKeyGenerator } from '../CacheKeyGenerator';
import { ICacheKeyGenerator } from '../../interfaces/ICacheKeyGenerator';
import { UserFactory } from '../../../../test/factories/UserFactory';

describe('CacheKeyGenerator', () => {
  let generator: ICacheKeyGenerator;

  beforeEach(() => {
    generator = new CacheKeyGenerator();
  });

  describe('generateKey with safe string arguments', () => {
    it('should combine namespace and safe string with colon separator', () => {
      const actual = generator.generateKey('user', 'role');
      expect(actual).toBe('user:role');
    });
  });

  describe('generateKey with PII string arguments', () => {
    it('should hash email addresses', () => {
      const email = 'test@example.com';
      const expected = `user:${createHash('sha256').update(email).digest('hex')}`;
      const actual = generator.generateKey('user', email);
      expect(actual).toBe(expected);
    });

    it('should hash UUIDs', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const expected = `user:${createHash('sha256').update(uuid).digest('hex')}`;
      const actual = generator.generateKey('user', uuid);
      expect(actual).toBe(expected);
    });
  });

  describe('generateKey with User object', () => {
    it('should generate safe key using only user id', () => {
      const user = UserFactory.create();
      const actual = generator.generateKey('user', user);
      expect(actual).toBe(`user:id:${user.id}`);
    });

    it('should generate safe key for deleted user', () => {
      const user = UserFactory.createDeleted();
      const actual = generator.generateKey('user', user);
      expect(actual).toBe(`user:id:${user.id}`);
    });

    it('should never include email in key', () => {
      const user = UserFactory.create();
      const actual = generator.generateKey('user', user);
      expect(actual).not.toContain(user.email);
    });

    it('should never include username in key', () => {
      const user = UserFactory.create();
      const actual = generator.generateKey('user', user);
      expect(actual).not.toContain(user.username);
    });
  });

  describe('generateKey with multiple arguments', () => {
    it('should handle mix of safe and PII arguments', () => {
      const role = 'admin';
      const email = 'test@example.com';
      const expected = `user:${role}:${createHash('sha256').update(email).digest('hex')}`;
      const actual = generator.generateKey('user', role, email);
      expect(actual).toBe(expected);
    });
  });

  describe('generateKey with number argument', () => {
    it('should handle numbers as-is', () => {
      const actual = generator.generateKey('user', 123);
      expect(actual).toBe('user:123');
    });
  });

  describe('generateKey with boolean argument', () => {
    it('should handle booleans as-is', () => {
      const actual = generator.generateKey('user', true);
      expect(actual).toBe('user:true');
    });
  });

  describe('generateKey with long input', () => {
    it('should hash key when total length exceeds 100 characters', () => {
      const longString = 'x'.repeat(100);
      const actual = generator.generateKey('user', longString);
      expect(actual).toHaveLength(64);
      expect(actual).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should not hash key when total length is exactly 100 characters', () => {
      const exactString = 'x'.repeat(95);
      const actual = generator.generateKey('user', exactString);
      expect(actual).toBe(`user:${exactString}`);
    });
  });

  describe('generateKey consistency', () => {
    it('should generate identical keys for same User', () => {
      const user = UserFactory.create();
      const firstCall = generator.generateKey('user', user);
      const secondCall = generator.generateKey('user', user);
      expect(firstCall).toBe(secondCall);
    });

    it('should generate identical keys for same email', () => {
      const email = 'test@example.com';
      const firstCall = generator.generateKey('user', email);
      const secondCall = generator.generateKey('user', email);
      expect(firstCall).toBe(secondCall);
    });
  });
});
