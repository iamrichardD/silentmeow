import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalAuthenticationStrategy } from '@auth/strategies/LocalAuthenticationStrategy.js';
import { IUserRepository } from '@user/interfaces/IUserRepository.js';
import { IPasswordService } from '@user/interfaces/IPasswordService.js';
import { User } from '@user/models/User.js';

describe('LocalAuthenticationStrategy', () => {
  let localAuthStrategy: LocalAuthenticationStrategy;
  let mockUserRepository: IUserRepository;
  let mockPasswordService: IPasswordService;

  beforeEach(() => {
    // Create mock implementations
    mockUserRepository = {
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      findByIdentifier: vi.fn(),
      findById: vi.fn(),
      exists: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    mockPasswordService = {
      hash: vi.fn(),
      compare: vi.fn()
    };

    localAuthStrategy = new LocalAuthenticationStrategy(
      mockUserRepository,
      mockPasswordService
    );
  });

  describe('validate', () => {
    it('should throw an error if user is not found', async () => {
      // Setup: User not found
      vi.mocked(mockUserRepository.findByIdentifier).mockResolvedValue(null);

      // Expect an error when validating non-existent user
      await expect(localAuthStrategy.validate({
        identifier: 'test@example.com',
        secret: 'password123'
      })).rejects.toThrow('User not found');
    });

    it('should throw an error if password is incorrect', async () => {
      // Setup: User exists but password is incorrect
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'existing-hash',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(mockUserRepository.findByIdentifier).mockResolvedValue(mockUser);
      vi.mocked(mockPasswordService.compare).mockResolvedValue(false);

      // Expect an error when password is incorrect
      await expect(localAuthStrategy.validate({
        identifier: 'test@example.com',
        secret: 'wrong-password'
      })).rejects.toThrow('Invalid credentials');
    });

    it('should return user identity when credentials are valid', async () => {
      // Setup: User exists and password is correct
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'existing-hash',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(mockUserRepository.findByIdentifier).mockResolvedValue(mockUser);
      vi.mocked(mockPasswordService.compare).mockResolvedValue(true);

      // Expect successful validation
      const result = await localAuthStrategy.validate({
        identifier: 'test@example.com',
        secret: 'correct-password'
      });

      expect(result).toEqual({
        providerId: '1',
        email: 'test@example.com',
        username: 'testuser'
      });
    });
  });
});
