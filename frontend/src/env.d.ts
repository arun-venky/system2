/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_ENABLE_XSTATE_INSPECT: string
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 