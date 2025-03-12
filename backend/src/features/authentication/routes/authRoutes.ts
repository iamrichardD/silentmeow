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

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticationController } from '@auth/controllers/AuthenticationController.js';
import { ILoginRequest } from '@auth/contracts/ILoginRequest.js';
import { IRegisterRequest } from '@auth/contracts/IRegisterRequest.js';

export function authRoutes(
  fastify: FastifyInstance,
  controller: AuthenticationController
): void {
  // Login route with schema validation
  fastify.post<{ Body: ILoginRequest }>(
    '/auth/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: ILoginRequest }>, reply: FastifyReply) => {
      return controller.login(request, reply);
    }
  );

  // Registration route with schema validation
  fastify.post<{ Body: IRegisterRequest }>(
    '/auth/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: IRegisterRequest }>, reply: FastifyReply) => {
      return controller.register(request, reply);
    }
  );
}
