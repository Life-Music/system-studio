/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_ENDPOINT: string
  readonly VITE_PUBLIC_GOOGLE_AUTH: string
  readonly VITE_STRIPE_PK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}