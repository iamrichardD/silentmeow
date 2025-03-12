import { defineConfig } from "vite";
       import { resolve } from "path";
       export default defineConfig({
         resolve: {
           alias: {
             "@config": resolve(__dirname, "./src/config"),
             "@features": resolve(__dirname, "./src/features"),
             "@auth": resolve(__dirname, "./src/features/authentication"),
             "@user": resolve(__dirname, "./src/features/user"),
             "@cache": resolve(__dirname, "./src/features/cache"),
             "@logging": resolve(__dirname, "./src/features/logging"),
             "@security": resolve(__dirname, "./src/features/security"),
             "@web": resolve(__dirname, "./src/features/web-server"),
             "@test": resolve(__dirname, "./src/test"),
             "@": resolve(__dirname, "./src")
           }
         },
         build: {
           outDir: "dist",
           ssr: true,
           minify: false,
           sourcemap: true,
           emptyOutDir: true,
           rollupOptions: {
             input: "src/index.ts",
             output: {
               format: "esm",
               entryFileNames: "[name].js",
               inlineDynamicImports: true
             },
             external: [
               "fastify", "pino", "jsonwebtoken", "bcrypt", "uuid", "fs", "path", "url"
             ]
           }
         }
       });
