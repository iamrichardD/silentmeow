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

// backend/src/test/factories/UserFactory.ts

import { User } from '../../features/user/models/User';

export type UserOverrides = Partial<User>;

export class UserFactory {
  static create(overrides: UserOverrides = {}): User {
    const now = new Date();

    const defaults: User = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashed_password_value',
      createdAt: now,
      updatedAt: now,
      deletedAt: undefined
    };

    return {
      ...defaults,
      ...overrides
    };
  }

  static createDeleted(overrides: UserOverrides = {}): User {
    const user = this.create(overrides);
    const deletedAt = new Date();
    deletedAt.setMinutes(deletedAt.getMinutes() + 1); // ensure deletedAt is after createdAt

    return {
      ...user,
      deletedAt,
      ...overrides
    };
  }

  static createMany(count: number, overrides: UserOverrides = {}): User[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        id: `123e4567-e89b-12d3-a456-${426614174000 + index}`,
        email: `test${index + 1}@example.com`,
        username: `testuser${index + 1}`,
        ...overrides
      })
    );
  }
}
