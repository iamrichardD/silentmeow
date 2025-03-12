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

import { IRegisterRequest } from '@auth/contracts/IRegisterRequest.js';

export class RegistrationValidationService {
  public validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      throw new Error('Invalid email address');
    }
  }

  public validatePassword(password: string): void {
    // Password requirements:
    // - At least 8 characters
    // - Contains uppercase and lowercase letters
    // - Contains a number
    // - Contains a special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    if (!password || !passwordRegex.test(password)) {
      throw new Error('Password does not meet strength requirements');
    }
  }

  public validate(request: IRegisterRequest): void {
    this.validateEmail(request.email);
    this.validatePassword(request.password);
  }
}
