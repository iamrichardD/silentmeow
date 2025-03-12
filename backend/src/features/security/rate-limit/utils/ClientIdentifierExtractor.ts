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

// backend/src/features/security/rate-limit/utils/ClientIdentifierExtractor.ts

import { FastifyRequest } from 'fastify';

export class ClientIdentifierExtractor {
  /**
   * Extracts an identifier from a request for rate limiting
   * Combines IP address with optional username to prevent username-based attacks
   * @param request - The Fastify request
   * @param username - Optional username
   * @returns A unique identifier string
   */
  static extract(request: FastifyRequest, username?: string): string {
    const ip = request.ip ||
      request.headers['x-forwarded-for'] ||
      'unknown-ip';

    if (username) {
      return `${ip}:${username}`;
    }

    return ip.toString();
  }
}
