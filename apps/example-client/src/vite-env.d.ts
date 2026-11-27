/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API URL of the Stoat instance to use. Unset means stoat.chat. */
  readonly VITE_STOAT_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
