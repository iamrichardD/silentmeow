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

import { describe, it, expect } from 'vitest';
import { PasswordService } from '@auth/services/PasswordService.js';

describe('PasswordService', () => {
  const passwordService = new PasswordService();

  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await passwordService.hash(password);

      expect(hashedPassword).toBeTruthy();
      expect(hashedPassword).not.toBe(password);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hashedPassword1 = await passwordService.hash(password);
      const hashedPassword2 = await passwordService.hash(password);

      expect(hashedPassword1).not.toBe(hashedPassword2);
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await passwordService.hash(password);

      const isMatch = await passwordService.compare(password, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hashedPassword = await passwordService.hash(password);

      const isMatch = await passwordService.compare(wrongPassword, hashedPassword);
      expect(isMatch).toBe(false);
    });
  });
});
