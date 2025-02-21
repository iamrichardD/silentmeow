import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from '../InMemoryUserRepository';
import { User } from '../../models/User';

const wait = async (ms: number) => {
  await new Promise(resolve => setTimeout(resolve, ms));
}

describe('InMemoryUserRepository', () => {
  const repository: InMemoryUserRepository = new InMemoryUserRepository();
  const testUser = { passwordHash: 'password', username: 'tstuser01', email: 'testuser01@domain.local' };
  const users : User[] = new Array<User>();

  beforeEach(() => {
    users.every(user => repository.delete(user.id!));
    users.length = 0;
  });

  afterEach(() => {
    users.every(user => repository.delete(user.id!));
    users.length = 0;
  });

  describe('Create', () => {
    it('should create a new user', async () => {
      const actual = await repository.create(testUser);

      expect(actual).toBeDefined();
      expect(actual.id).toBeTruthy();
      expect(actual.email).toBe(testUser.email);

      users.push(actual);
    });
  });

  describe('FindByEmail', () => {
    it('should return null if user not found', async () => {
      const foundUser = await repository.findByEmail('nonexistent@example.com');

      expect(foundUser).toBeNull();
    });

    it('should find a user by email', async () => {
      const createdUser = await repository.create(testUser);
      const actual = await repository.findByEmail(testUser.email as string);

      expect(actual).toBeDefined();
      expect(actual?.id).toBe(createdUser.id);
    });
  });

  describe('Exists', () => {
    it('should return true if user exists', async () => {
      await repository.create(testUser);
      const exists = await repository.exists(testUser.email as string);

      expect(exists).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      const exists = await repository.exists('nonexistent@example.com');

      expect(exists).toBe(false);
    });
  });

  describe('Update', () => {
    it('should update an existing user', async () => {
      const createdUser = await repository.create(testUser);
      await wait(2000);
      const updatedUser = await repository.update({
        ...createdUser,
        email: 'updated@example.com'
      });

      expect(updatedUser.email).toBe('updated@example.com');
      expect(updatedUser.updatedAt.toISOString()).not.toBe(createdUser.updatedAt.toISOString());
    });

    it('should throw an error when updating a non-existent user', async () => {
      await expect(repository.update({
        id: 'nonexistent',
        email: 'test@example.com',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date()
      })).rejects.toThrow('User not found');
    });
  });

  describe('Delete', () => {
    it('should delete an existing user', async () => {
      const createdUser = await repository.create(testUser);
      await repository.delete(createdUser.id!);

      const foundUser = await repository.findById(createdUser.id!);
      expect(foundUser).toBeNull();
    });

    it('should throw an error when deleting a non-existent user', async () => {
      await expect(repository.delete('nonexistent'))
        .rejects.toThrow('User not found');
    });
  });
});
