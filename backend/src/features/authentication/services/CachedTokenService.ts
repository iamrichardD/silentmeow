/*
 * Copyright 2024 https://github.com/iamrichardd
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

import jwt, { Secret, SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import ms from 'ms';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@logging/Logger.js';
import { ConfigurationManager } from '@config/ConfigurationManagerInterface.js';
import { ICacheService } from '@cache/interfaces/ICacheService.js';
import { ICacheKeyGenerator } from '@cache/interfaces/ICacheKeyGenerator.js';
import { User } from '@user/models/User.js';

interface TokenPayload {
  sub: string;        // Subject (user ID)
  email: string;      // User email
  jti: string;        // JWT ID (unique identifier for this token)
  iat?: number;       // Issued at (automatically added by jwt.sign)
  exp?: number;       // Expiration time (automatically added by jwt.sign)
}

interface TokenCacheData {
  userId: string;
  valid: boolean;
}

// Helper type to define acceptable expiry string formats
type ExpiryString =
  | `${number}m` // minutes
  | `${number}h` // hours
  | `${number}d` // days
  | `${number}s` // seconds
  | `${number}w`; // weeks

export class CachedTokenService {
  private readonly accessTokenSecret: Secret;
  private readonly refreshTokenSecret: Secret;
  private readonly accessTokenExpiry: ExpiryString;
  private readonly refreshTokenExpiry: ExpiryString;
  private readonly logger?: Logger;

  constructor(
    private configManager: ConfigurationManager,
    private cacheService: ICacheService,
    private keyGenerator: ICacheKeyGenerator,
    logger?: Logger
  ) {
    this.logger = logger;

    // Load configuration and convert string secrets to proper Secret type
    const accessSecretString = this.configManager.get('authentication.jwt.accessSecret', '');
    const refreshSecretString = this.configManager.get('authentication.jwt.refreshSecret', '');

    // Convert strings to proper Secret format - handle empty strings safely
    this.accessTokenSecret = accessSecretString ? Buffer.from(accessSecretString, 'utf8') : Buffer.from('');
    this.refreshTokenSecret = refreshSecretString ? Buffer.from(refreshSecretString, 'utf8') : Buffer.from('');

    // Get expiry times and cast them to our ExpiryString type for type safety
    this.accessTokenExpiry = this.configManager.get('authentication.jwt.accessExpiresIn', '15m') as ExpiryString;
    this.refreshTokenExpiry = this.configManager.get('authentication.jwt.refreshExpiresIn', '7d') as ExpiryString;

    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      throw new Error('JWT secrets must be configured');
    }
  }

  /**
   * Generate a new access token for a user
   */
  public async generateAccessToken(user: User): Promise<string> {
    if (!user.id) {
      throw new Error('User ID is required');
    }

    const tokenId = uuidv4();
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email || '',
      jti: tokenId,
    };

    const signOptions: SignOptions = {
      expiresIn: this.accessTokenExpiry
    };

    const token = jwt.sign(payload, this.accessTokenSecret, signOptions);

    // Calculate TTL in seconds from the expiry string (e.g., "15m" -> 900)
    const ttlSeconds = this.parseExpiryToSeconds(this.accessTokenExpiry);

    // Cache the token with the calculated TTL
    const cacheKey = this.keyGenerator.generateKey('token', tokenId, 'access');
    await this.cacheService.set(cacheKey, { userId: user.id, valid: true }, ttlSeconds);

    if (this.logger) {
      this.logger.info('Generated access token', { userId: user.id, tokenId, ttlSeconds });
    }

    return token;
  }

  /**
   * Generate a new refresh token for a user
   */
  public async generateRefreshToken(user: User): Promise<string> {
    if (!user.id) {
      throw new Error('User ID is required');
    }

    const tokenId = uuidv4();
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email || '',
      jti: tokenId,
    };

    const signOptions: SignOptions = {
      expiresIn: this.refreshTokenExpiry
    };

    const token = jwt.sign(payload, this.refreshTokenSecret, signOptions);

    // Calculate TTL in seconds from the expiry string
    const ttlSeconds = this.parseExpiryToSeconds(this.refreshTokenExpiry);

    // Cache the token
    const cacheKey = this.keyGenerator.generateKey('token', tokenId, 'refresh');
    await this.cacheService.set(cacheKey, { userId: user.id, valid: true }, ttlSeconds);

    if (this.logger) {
      this.logger.info('Generated refresh token', { userId: user.id, tokenId, ttlSeconds });
    }

    return token;
  }

  /**
   * Verify an access token and return the user ID if valid
   */
  public async verifyAccessToken(token: string): Promise<string | null> {
    try {
      const verifyOptions: VerifyOptions = {};
      const decoded = jwt.verify(token, this.accessTokenSecret, verifyOptions) as TokenPayload;

      // Check if token is in cache and is valid
      const cacheKey = this.keyGenerator.generateKey('token', decoded.jti, 'access');
      const cachedToken = await this.cacheService.get<TokenCacheData>(cacheKey);

      if (!cachedToken || !cachedToken.valid) {
        if (this.logger) {
          this.logger.info('Token validation failed: not in cache or invalidated', {
            tokenId: decoded.jti
          });
        }
        return null;
      }

      return decoded.sub;
    } catch (error) {
      if (this.logger) {
        this.logger.error('Token validation failed',
          error instanceof Error ? error : new Error(String(error))
        );
      }
      return null;
    }
  }

  /**
   * Gets the remaining time in seconds for a token
   * @param tokenType The type of token ('access' or 'refresh')
   * @param userId The user ID
   * @returns Remaining time in seconds, or 0 if token not found
   */
  public async getTokenRemainingTime(tokenType: 'access' | 'refresh', userId: string): Promise<number> {
    const key = `token:${tokenType}:${userId}`;
    const ttl = await this.cacheService.getTtl(key);
    return ttl ?? 0;
  }

  /**
   * Verify a refresh token and return the user ID if valid
   */
  public async verifyRefreshToken(token: string): Promise<string | null> {
    try {
      const verifyOptions: VerifyOptions = {};
      const decoded = jwt.verify(token, this.refreshTokenSecret, verifyOptions) as TokenPayload;

      // Check if token is in cache and is valid
      const cacheKey = this.keyGenerator.generateKey('token', decoded.jti, 'refresh');
      const cachedToken = await this.cacheService.get<TokenCacheData>(cacheKey);

      if (!cachedToken || !cachedToken.valid) {
        if (this.logger) {
          this.logger.info('Refresh token validation failed: not in cache or invalidated', {
            tokenId: decoded.jti
          });
        }
        return null;
      }

      return decoded.sub;
    } catch (error) {
      if (this.logger) {
        this.logger.error('Refresh token validation failed',
          error instanceof Error ? error : new Error(String(error))
        );
      }
      return null;
    }
  }

  /**
   * Invalidate an access token
   */
  public async invalidateAccessToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      if (!decoded || !decoded.jti) {
        return;
      }

      const cacheKey = this.keyGenerator.generateKey('token', decoded.jti, 'access');
      await this.cacheService.delete(cacheKey);

      if (this.logger) {
        this.logger.info('Invalidated access token', { tokenId: decoded.jti });
      }
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to invalidate access token',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }

  /**
   * Invalidate a refresh token
   */
  public async invalidateRefreshToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      if (!decoded || !decoded.jti) {
        return;
      }

      const cacheKey = this.keyGenerator.generateKey('token', decoded.jti, 'refresh');
      await this.cacheService.delete(cacheKey);

      if (this.logger) {
        this.logger.info('Invalidated refresh token', { tokenId: decoded.jti });
      }
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to invalidate refresh token',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }

  /**
   * Parse JWT expiry string (like '15m', '7d') to seconds
   */
  private parseExpiryToSeconds(expiry: ExpiryString): number {
    // Use the ms library to convert the string to milliseconds
    const milliseconds = ms(expiry);
    // Convert milliseconds to seconds
    return Math.floor(milliseconds / 1000);
  }
}
