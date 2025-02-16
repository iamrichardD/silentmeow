import { User } from '../models/User';

export interface IUserQueryRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  exists(email: string): Promise<boolean>;
}
