/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AIRTABLE_TOKEN?: string;
  readonly VITE_AIRTABLE_BASE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
