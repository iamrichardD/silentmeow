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

import { IRegisterRequest } from '../contracts/IRegisterRequest';
import { ILoginRequest } from '../contracts/ILoginRequest';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { TokenService } from './TokenService';

export class AuthenticationService {
  constructor(
    private userRepository: UserRepository,
    private tokenService: TokenService
  ) {}

  public async register(request: IRegisterRequest): Promise<User> {
    // TODO: Implement user registration
    throw new Error('Not implemented');
  }

  public async login(request: ILoginRequest): Promise<string> {
    // TODO: Implement user login and token generation
    throw new Error('Not implemented');
  }
}
