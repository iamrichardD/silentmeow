/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly PROD: boolean;
    readonly DEV: boolean;
    [key: string]: any;
  };
}
