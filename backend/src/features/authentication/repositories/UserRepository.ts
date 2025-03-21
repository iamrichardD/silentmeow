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

import { User } from '@auth/models/User.js';

export class UserRepository {
  public async findByEmail(identifier: string): Promise<User | null> {
    // TODO: Implement finding user by email
    throw new Error('Not implemented');
  }

  public async findByUsername(identifier: string): Promise<User | null> {
    // TODO: Implement finding user by email
    throw new Error('Not implemented');
  }

  public async create(user: Omit<User, 'id'>): Promise<User> {
    // TODO: Implement user creation
    throw new Error('Not implemented');
  }
}
