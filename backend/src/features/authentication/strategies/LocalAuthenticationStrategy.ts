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

import { IUserRepository } from '@user/interfaces/IUserRepository.js';
import { IPasswordService } from '@user/interfaces/IPasswordService.js';
import { AuthCredentials } from '@auth/interfaces/AuthCredentials.js';
import { UserIdentity } from '@auth/interfaces/UserIdentity.js';

export class LocalAuthenticationStrategy {
  constructor(
    private userRepository: IUserRepository,
    private passwordService: IPasswordService
  ) {}

  async validate(credentials: AuthCredentials): Promise<UserIdentity> {
    // Find user by email or username
    const user = await this.userRepository.findByIdentifier(credentials.identifier);

    // Check if user exists
    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(
      credentials.secret,
      user.passwordHash
    );

    // Throw error if password is incorrect
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Ensure email and username are not undefined
    if (!user.email || !user.username) {
      throw new Error('Incomplete user profile');
    }

    // Return user identity
    return {
      providerId: user.id!,
      email: user.email,
      username: user.username
    };
  }
}
