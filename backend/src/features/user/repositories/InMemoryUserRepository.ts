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

import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User';
import { UserCommandDto } from '../interfaces/UserCommandDto';
import { IUserRepository } from '../interfaces/IUserRepository';

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async create(userData: UserCommandDto): Promise<User> {
    const user: User = {
      id: uuidv4(),
      email: userData.email,
      username: userData.username,
      passwordHash: userData.passwordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.push(user);
    return user;
  }

  async update(user: User): Promise<User> {
    const index = this.users.findIndex(u => u.id === user.id);

    if (index === -1) {
      throw new Error('User not found');
    }

    this.users[index] = {
      ...user,
      updatedAt: new Date()
    };

    return this.users[index];
  }

  async delete(userId: string): Promise<void> {
    const index = this.users.findIndex(u => u.id === userId);

    if (index === -1) {
      throw new Error('User not found');
    }

    this.users.splice(index, 1);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.users.find(u => u.username === username) || null;
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    return this.users.find(u =>
      u.email === identifier || u.username === identifier
    ) || null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async exists(identifier: string): Promise<boolean> {
    return this.users.some(u =>
      u.email === identifier || u.username === identifier
    );
  }
}
