import { User } from '../models/User';

export interface IUserCommandRepository {
  create(user: Omit<User, 'id'>): Promise<User>;
  update(user: User): Promise<User>;
  delete(userId: string): Promise<void>;
}
