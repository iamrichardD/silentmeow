import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User';
import { IUserCommandRepository } from './IUserCommandRepository';
import { IUserQueryRepository } from './IUserQueryRepository';

export class InMemoryUserRepository implements IUserCommandRepository, IUserQueryRepository {
  private users: User[] = [];

  async create(userData: Omit<User, 'id'>): Promise<User> {
    const user: User = {
      id: uuidv4(),
      ...userData,
      createdAt: userData.createdAt || new Date(),
      updatedAt: userData.updatedAt || new Date()
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
      updatedAt: new Date()  // Always update updatedAt
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

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async exists(email: string): Promise<boolean> {
    return this.users.some(u => u.email === email);
  }
}
