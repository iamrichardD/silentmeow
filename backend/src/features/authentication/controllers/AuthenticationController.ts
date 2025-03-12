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

// backend/src/features/authentication/controllers/AuthenticationController.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticationService } from '@auth/services/AuthenticationService.js';
import { Logger } from '@logging/Logger.js';
import { ILoginRequest } from '@auth/contracts/ILoginRequest.js';
import { IRegisterRequest } from '@auth/contracts/IRegisterRequest.js';

export class AuthenticationController {
  constructor(
    private authService: AuthenticationService,
    private logger: Logger
  ) {}

  async login(request: FastifyRequest<{ Body: ILoginRequest }>, reply: FastifyReply): Promise<void> {
    try {
      const token = await this.authService.login(request.body, request);
      reply.code(200).send({ token });
    } catch (error) {
      this.handleAuthError(error, reply);
    }
  }

  async register(request: FastifyRequest<{ Body: IRegisterRequest }>, reply: FastifyReply): Promise<void> {
    try {
      const user = await this.authService.register(request.body);
      reply.code(201).send({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      });
    } catch (error) {
      this.handleAuthError(error, reply);
    }
  }

  private handleAuthError(error: unknown, reply: FastifyReply): void {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';

    // Handle different error types
    if (errorMessage.includes('Too many login attempts')) {
      this.logger.warn(`Rate limit exceeded: ${errorMessage}`);
      reply.code(429).send({ error: errorMessage });
    } else if (errorMessage === 'Invalid credentials') {
      reply.code(401).send({ error: 'Invalid credentials' });
    } else if (errorMessage === 'User already exists') {
      reply.code(409).send({ error: 'User already exists' });
    } else {
      this.logger.error('Authentication error', error instanceof Error ? error : new Error(String(error)));
      reply.code(500).send({ error: 'Internal server error' });
    }
  }
}
