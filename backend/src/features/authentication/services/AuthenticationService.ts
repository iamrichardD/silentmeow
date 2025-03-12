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

// backend/src/features/authentication/services/AuthenticationService.ts


import { Logger } from '@logging/Logger.js';
import { UserRepository } from '@auth/repositories/UserRepository.js';
import { TokenService } from '@auth/services/TokenService.js';
import { PasswordService } from '@auth/services/PasswordService.js';
import { RegistrationValidationService } from '@auth/services/RegistrationValidationService.js';
import { RateLimitService } from '@security/rate-limit/services/RateLimitService.js';
import { IRegisterRequest } from '@auth/contracts/IRegisterRequest.js';
import { User } from '@auth/models/User.js';
import { ILoginRequest } from '@auth/contracts/ILoginRequest.js';
import { FastifyRequest } from 'fastify';
import { ClientIdentifierExtractor } from '@security/rate-limit/utils/ClientIdentifierExtractor.js';

export class AuthenticationService {
  constructor(
    private userRepository: UserRepository,
    private tokenService: TokenService,
    private passwordService: PasswordService,
    private validationService: RegistrationValidationService,
    private rateLimitService: RateLimitService,
    private logger: Logger
  ) {}

  public async register(request: IRegisterRequest): Promise<User> {
    // Validate registration request
    this.validationService.validate(request);

    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Generate a username from email
    const username = this.generateUsernameFromEmail(request.email);

    // Hash password
    const passwordHash = await this.passwordService.hash(request.password);

    // Create user with all required fields
    const user = await this.userRepository.create({
      email: request.email,
      username: username, // Add username to satisfy the User model requirement
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return user;
  }

  /**
   * Generate a username from an email address
   * @param email Email address to convert
   * @returns A username derived from the email
   */
  private generateUsernameFromEmail(email: string): string {
    // Extract the part before @ and remove any special characters
    const usernameBase = email.split('@')[0]
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();

    // Add a random suffix to reduce collision chance
    // This is a simple approach - in production you'd want to ensure uniqueness
    const randomSuffix = Math.floor(Math.random() * 1000);
    const username = `${usernameBase}${randomSuffix}`;

    return username || 'user'; // Fallback if username generation fails
  }

  public async login(request: ILoginRequest, fastifyRequest: FastifyRequest): Promise<string> {
    // Extract client identifier for rate limiting
    const clientId = ClientIdentifierExtractor.extract(fastifyRequest, request.email);

    // Check if client is rate limited
    const isAllowed = await this.rateLimitService.recordAttempt(clientId);
    if (!isAllowed) {
      const remainingTime = await this.rateLimitService.getBlockTimeRemaining(clientId);
      throw new Error(`Too many login attempts. Please try again in ${Math.ceil(remainingTime / 60)} minutes.`);
    }

    try {
      // Find user
      const user = await this.userRepository.findByEmail(request.email);
      if (!user) {
        this.logger.warn(`Login attempt with non-existent email: ${request.email} from ${fastifyRequest.ip}`);
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValid = await this.passwordService.compare(request.password, user.passwordHash);
      if (!isValid) {
        this.logger.warn(`Failed login attempt for user: ${request.email} from ${fastifyRequest.ip}`);
        throw new Error('Invalid credentials');
      }

      // Success! Reset rate limit counter
      await this.rateLimitService.resetAttempts(clientId);

      // Generate token
      const token = this.tokenService.generateAccessToken(user);

      return token;
    } catch (error) {
      // Don't reset attempt counter on failure
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Authentication failed');
    }
  }
}
