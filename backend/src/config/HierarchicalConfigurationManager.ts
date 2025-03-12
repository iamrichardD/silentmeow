import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ConfigurationManager } from '@config/ConfigurationManagerInterface.js';

interface ConfigurationRecord {
  [key: string]: string | number | boolean | ConfigurationRecord | undefined;
}

export class HierarchicalConfigurationManager implements ConfigurationManager {
  private baseConfig: ConfigurationRecord = {};
  private environmentOverrides: ConfigurationRecord = {};

  async load(): Promise<void> {
    this.loadBaseConfiguration();
    this.applyEnvironmentVariables();
  }

  private loadBaseConfiguration(): void {
    try {
      const configPath = this.findConfigPath();
      const rawConfig = fs.readFileSync(configPath, 'utf8');
      this.baseConfig = JSON.parse(rawConfig);
    } catch (error) {
      console.warn('Failed to load base configuration', error);
    }
  }

  private findConfigPath(): string {
    // Get current file's path in ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const searchPaths = [
      process.cwd(),
      path.join(process.cwd(), 'config'),
      path.join(__dirname, '..', '..', 'settings.json'), // Look in project root
      path.join(__dirname, '..', 'config'),
      '/app/settings.json' // Docker container path
    ];

    for (const dir of searchPaths) {
      const configPath = path.join(dir, 'settings.json');
      if (fs.existsSync(configPath)) {
        return configPath;
      }
    }

    throw new Error('Configuration file not found');
  }

  private applyEnvironmentVariables(): void {
    const updateNestedValue = (
      obj: ConfigurationRecord,
      keys: string[],
      value: string | number | boolean
    ): void => {
      let current = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key] as ConfigurationRecord;
      }
      current[keys[keys.length - 1]] = value;
    };

    Object.keys(process.env).forEach(envKey => {
      // Filter for configuration-related environment variables
      const configKeyMatch = envKey.match(/^(DATABASE|APP|SERVER)_/i);
      if (!configKeyMatch) return;

      // Convert environment variable key to configuration key
      const configKey = envKey
        .toLowerCase()
        .replace(/_/g, '.');

      const keys = configKey.split('.');
      const value = process.env[envKey];

      if (value !== undefined) {
        // Convert the value to appropriate type
        const originalValue = this.getNestedValue(this.baseConfig, configKey);
        const convertedValue = this.convertValue(
          value,
          originalValue !== undefined
            ? typeof originalValue
            : undefined
        );

        // Ensure we're not trying to set a property on a primitive
        if (typeof this.environmentOverrides !== 'object') {
          this.environmentOverrides = {};
        }

        // Update nested configuration
        updateNestedValue(this.environmentOverrides, keys, convertedValue);
      }
    });
  }

  private flattenObject(obj: ConfigurationRecord, prefix = ''): ConfigurationRecord {
    return Object.keys(obj).reduce((acc: ConfigurationRecord, key) => {
      const pre = prefix.length ? `${prefix}_` : '';

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, this.flattenObject(obj[key] as ConfigurationRecord, `${pre}${key}`));
      } else {
        acc[`${pre}${key}`] = obj[key];
      }

      return acc;
    }, {});
  }

  private convertValue(
    value: string,
    targetType?: string
  ): string | number | boolean {
    const lowercaseValue = value.toLowerCase();

    if (targetType === undefined || targetType === 'undefined') {
      if (lowercaseValue === 'true' || lowercaseValue === 'false') {
        return lowercaseValue === 'true';
      }
      if (/^\d+$/.test(value)) {
        return parseInt(value, 10);
      }
      return value;
    }

    switch (targetType) {
      case 'boolean':
        return lowercaseValue === 'true';
      case 'number':
        return /^\d+$/.test(value)
          ? parseInt(value, 10)
          : parseFloat(value);
      default:
        return value;
    }
  }

  private getNestedValue(
    obj: ConfigurationRecord,
    path: string
  ): any {
    const keys = path.split('.');
    let current: ConfigurationRecord | undefined = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key] as ConfigurationRecord | undefined;
      } else {
        return undefined;
      }
    }

    return current;
  }

  get<T extends string | number | boolean | ConfigurationRecord>(
    key: string,
    defaultValue?: T
  ): T {
    // Split the key into parts for nested lookup
    const keys = key.split('.');

    // First, check environment overrides
    let overrideValue: any = this.environmentOverrides;
    for (const k of keys) {
      if (overrideValue && typeof overrideValue === 'object' && k in overrideValue) {
        overrideValue = overrideValue[k];
      } else {
        overrideValue = undefined;
        break;
      }
    }

    if (overrideValue !== undefined) {
      return overrideValue as T;
    }

    // If no override, get from base configuration
    let baseValue: any = this.baseConfig;
    for (const k of keys) {
      if (baseValue && typeof baseValue === 'object' && k in baseValue) {
        baseValue = baseValue[k];
      } else {
        baseValue = undefined;
        break;
      }
    }

    return baseValue !== undefined ? baseValue : defaultValue as T;
  }

  private hasNestedValue(obj: ConfigurationRecord, path: string): boolean {
    const keys = path.split('.');
    let current: ConfigurationRecord | undefined = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key] as ConfigurationRecord | undefined;
      } else {
        return false;
      }
    }

    return true;
  }
}
