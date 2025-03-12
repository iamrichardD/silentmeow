import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    ssr: true,
    minify: false,
    sourcemap: true,
    target: 'node16',
    rollupOptions: {
      input: 'src/index.ts',
      output: {
        format: 'esm',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].[hash].js',
        inlineDynamicImports: true
      },
      external: [
        'fastify', 'pino', 'jsonwebtoken', 'bcrypt', 'uuid', 'fs', 'path', 'url'
      ]
    }
  }
});
