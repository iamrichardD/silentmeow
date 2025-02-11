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

import { describe, it, expect, beforeEach } from 'vitest';
import { UserRepository } from '../UserRepository.js';

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('should throw "Not implemented" for findByEmail', async () => {
    await expect(userRepository.findByEmail('test@example.com'))
      .rejects.toThrow('Not implemented');
  });

  it('should throw "Not implemented" for create', async () => {
    const userData = {
      email: 'test@example.com',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await expect(userRepository.create(userData))
      .rejects.toThrow('Not implemented');
  });
});
