// backend/src/config/__tests__/ConfigurationManager.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { HierarchicalConfigurationManager } from '@config/HierarchicalConfigurationManager.js';

// Mock fs and process.env
vi.mock('fs');
vi.mock('path');

describe('HierarchicalConfigurationManager', () => {
  let configManager: HierarchicalConfigurationManager;

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    configManager = new HierarchicalConfigurationManager();
  });

  describe('Base Configuration Loading', () => {
    it('should load base configuration from settings.json', async () => {
      // Mock file reading
      const mockConfig = {
        app: {
          name: 'silentmeow',
          environment: 'development'
        },
        database: {
          host: 'localhost',
          port: 5432
        }
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig));
      vi.mocked(path.join).mockReturnValue('/mock/settings.json');
      vi.mocked(fs.existsSync).mockReturnValue(true);

      await configManager.load();

      expect(configManager.get('app.name')).toBe('silentmeow');
      expect(configManager.get('database.host')).toBe('localhost');
    });

    it('should use default value if configuration key does not exist', async () => {
      const mockConfig = {
        app: {
          name: 'silentmeow'
        }
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig));
      vi.mocked(path.join).mockReturnValue('/mock/settings.json');
      vi.mocked(fs.existsSync).mockReturnValue(true);

      await configManager.load();

      expect(configManager.get('app.environment', 'test')).toBe('test');
    });
  });

  describe('Environment Variable Overrides', () => {
    it('should override base configuration with environment variables', async () => {
      const mockConfig = {
        database: {
          host: 'localhost',
          port: 5432,
          username: 'dev_user'
        }
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig));
      vi.mocked(path.join).mockReturnValue('/mock/settings.json');
      vi.mocked(fs.existsSync).mockReturnValue(true);

      // Mock environment variables
      process.env.DATABASE_HOST = 'staging-db.example.com';
      process.env.DATABASE_PORT = '6432';

      await configManager.load();

      expect(configManager.get('database.host')).toBe('staging-db.example.com');
      expect(configManager.get('database.port')).toBe(6432);
      expect(configManager.get('database.username')).toBe('dev_user');
    });

    it('should handle type conversion for environment variables', async () => {
      const mockConfig = {
        app: {
          debug: false,
          timeout: 30
        }
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig));
      vi.mocked(path.join).mockReturnValue('/mock/settings.json');
      vi.mocked(fs.existsSync).mockReturnValue(true);

      // Explicitly set environment variables
      process.env.APP_DEBUG = 'true';
      process.env.APP_TIMEOUT = '60';

      await configManager.load();

      const debugValue = configManager.get('app.debug');

      expect(debugValue).toBe(true);
      expect(typeof debugValue).toBe('boolean');

      const timeoutValue = configManager.get('app.timeout');
      expect(timeoutValue).toBe(60);
      expect(typeof timeoutValue).toBe('number');
    });
  });

  // More tests will be added for cloud secrets and other scenarios
});
