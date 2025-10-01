// Application constants

// UI Text (Spanish - user-facing)
export const UI_TEXT = {
  // Common
  LOADING: 'Cargando...',
  ERROR: 'Error',
  SUCCESS: 'Éxito',
  CANCEL: 'Cancelar',
  SAVE: 'Guardar',
  CONTINUE: 'Continuar',
  BACK: 'Atrás',
  RETRY: 'Reintentar',

  // Offline/Online status
  OFFLINE: 'Sin conexión',
  ONLINE: 'Conectado',
  OFFLINE_MODE: 'Modo sin conexión',
  SYNCING: 'Sincronizando...',
  SYNC_COMPLETE: 'Sincronización completa',

  // Auth
  LOGIN: 'Iniciar Sesión',
  LOGOUT: 'Cerrar Sesión',
  USERNAME: 'Usuario',
  PASSWORD: 'Contraseña',
  REMEMBER_ME: 'Recordarme',

  // Errors
  NETWORK_ERROR: 'Error de conexión. Intenta nuevamente.',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  REQUIRED_FIELD: 'Este campo es requerido',

  // Sync
  INITIAL_SYNC: 'Sincronización Inicial',
  FINAL_SYNC: 'Sincronización Final',
  SYNC_IN_PROGRESS: 'Sincronizando datos...',

  // Daily list
  DAILY_LIST: 'Lista del Día',
  NO_CLIENTS: 'No hay clientes para hoy',

  // Client detail
  CLIENT_DETAIL: 'Detalle de Cliente',
  RECOMMENDATIONS: 'Recomendaciones',

  // Feedback
  FEEDBACK: 'Feedback',
  RESULT: 'Resultado',
  REASON: 'Motivo',
  NOTES: 'Notas',

  // Visit closure
  FINALIZE_VISIT: 'Finalizar Visita',
  VISIT_SUMMARY: 'Resumen de Visita',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  ROUTE_PLAN: '/plan-de-ruta',
  FEEDBACK: '/feedback',
  INVENTORY: '/inventario',
  STOCKOUT: '/quiebre',
  FINALIZE_VISIT: '/finalizar-visita',
  HEALTH: '/health',
} as const;

// IndexedDB constants
export const DB_CONSTANTS = {
  NAME: 'webpv-db',
  VERSION: 1,
  STORES: {
    PLAN_DE_RUTA: 'PlanDeRuta',
    CLIENTES: 'Clientes',
    RECOMENDACIONES: 'Recomendaciones',
    FEEDBACK_PENDIENTE: 'FeedbackPendiente',
    INVENTARIO_PENDIENTE: 'InventarioPendiente',
    QUIEBRES_PENDIENTES: 'QuiebresPendientes',
    CIERRES_PENDIENTES: 'CierresPendientes',
    CONFIGURACION: 'Configuracion',
  },
} as const;

// Queue retry configuration
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 10,
  BASE_DELAY_MS: 1000,
  MAX_DELAY_MS: 60000,
  JITTER_MS: 1000,
} as const;

// Performance budgets
export const PERFORMANCE_BUDGETS = {
  MAX_LCP_MS: 2500,
  MAX_FCP_MS: 1500,
  MAX_TTI_MS: 3500,
  MAX_CLS: 0.1,
  MAX_BUNDLE_SIZE_KB: 300,
} as const;

// Geolocation configuration
export const GEO_CONFIG = {
  DEFAULT_PRECISION_METERS: 50,
  TIMEOUT_MS: 10000,
  MAX_AGE_MS: 5000,
} as const;
