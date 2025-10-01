/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_FF_INTELIGENCIA_COMPETENCIA: string;
  readonly VITE_FF_GEO_VALIDACION: string;
  readonly VITE_FF_GEO_PRECISION_MINIMA: string;
  readonly VITE_FF_APIS_MOCK: string;
  readonly VITE_FF_BACKGROUND_SYNC: string;
  readonly VITE_FF_OFFLINE_MODE: string;
  readonly VITE_ENVIRONMENT: string;
  readonly VITE_LOG_LEVEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
