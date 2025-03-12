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
import { RegistrationValidationService } from '@auth/services/RegistrationValidationService.js';
import { IRegisterRequest } from '@auth/contracts/IRegisterRequest.js';

describe('RegistrationValidationService', () => {
  const validationService = new RegistrationValidationService();

  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'john.doe@company.co.uk',
        'name+tag@domain.org'
      ];

      validEmails.forEach(email => {
        expect(() => validationService.validateEmail(email)).not.toThrow();
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        'missing@domain',
        '@missing-username.com',
        'spaces not@allowed.com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(() => validationService.validateEmail(email))
          .toThrow('Invalid email address');
      });
    });
  });

  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      const strongPasswords = [
        'StrongP@ssw0rd!2024', // Meets all requirements
        'Sec@reKey123',        // Uppercase, lowercase, number, special char
        'Complex_P@ss1'        // Another example meeting all criteria
      ];

      strongPasswords.forEach(password => {
        expect(() => validationService.validatePassword(password)).not.toThrow();
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short',               // Too short
        'nouppercase123',      // No uppercase
        'NOLOWERCASE123',      // No lowercase
        'NoSpecialCharacter1', // No special character
        ''                     // Empty password
      ];

      weakPasswords.forEach(password => {
        expect(() => validationService.validatePassword(password))
          .toThrow('Password does not meet strength requirements');
      });
    });
  });

  describe('validate', () => {
    it('should validate a complete registration request', () => {
      const validRequest: IRegisterRequest = {
        email: 'valid.user@example.com',
        password: 'StrongP@ssw0rd!2024'
      };

      expect(() => validationService.validate(validRequest)).not.toThrow();
    });

    it('should throw error for invalid registration request', () => {
      const invalidRequests: IRegisterRequest[] = [
        { email: 'invalid-email', password: 'StrongP@ssw0rd!2024' },
        { email: 'valid@example.com', password: 'weak' }
      ];

      invalidRequests.forEach(request => {
        expect(() => validationService.validate(request)).toThrow();
      });
    });
  });
});
