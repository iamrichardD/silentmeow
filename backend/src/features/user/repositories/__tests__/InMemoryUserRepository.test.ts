import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from '../InMemoryUserRepository';
import { User } from '../../models/User';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;
  let testUser: Omit<User, 'id'>;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    
    // Use a known, fixed datetime for tests
    const knownDate = new Date("2023-01-01T00:00:00.000Z");
    
    testUser = {
      email: "test@example.com",
      passwordHash: "hashedpassword",
      createdAt: knownDate,
      updatedAt: knownDate
    };
  });

  describe('Create', () => {
    it('should create a new user', async () => {
      const createdUser = await repository.create(testUser);

      expect(createdUser).toBeDefined();
      expect(createdUser.id).toBeTruthy();
      expect(createdUser.email).toBe(testUser.email);
    });
  });

  describe('FindByEmail', () => {
    it('should find a user by email', async () => {
      const createdUser = await repository.create(testUser);
      const foundUser = await repository.findByEmail(testUser.email);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
    });

    it('should return null if user not found', async () => {
      const foundUser = await repository.findByEmail('nonexistent@example.com');

      expect(foundUser).toBeNull();
    });
  });

  describe('Exists', () => {
    it('should return true if user exists', async () => {
      await repository.create(testUser);
      const exists = await repository.exists(testUser.email);

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
