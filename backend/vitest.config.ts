import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist']
  },
  resolve: {
    alias: {
      '@config': resolve(__dirname, './src/config'),
      '@features': resolve(__dirname, './src/features'),
      '@auth': resolve(__dirname, './src/features/authentication'),
      '@user': resolve(__dirname, './src/features/user'),
      '@cache': resolve(__dirname, './src/features/cache'),
      '@logging': resolve(__dirname, './src/features/logging'),
      '@security': resolve(__dirname, './src/features/security'),
      '@web': resolve(__dirname, './src/features/web-server'),
      '@test': resolve(__dirname, './src/test'),
      '@': resolve(__dirname, './src')
    }
  }
});
