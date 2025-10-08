// Core application types

export interface User {
  id: string;
  nombre: string;
  rol: 'asesor' | 'supervisor' | 'admin';
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  id: string;
  password: string;
  rememberMe?: boolean;
}

export interface Cliente {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  coordenadas?: Coordenadas;
  segmento: string;
  estatus: 'activo' | 'inactivo' | 'suspendido';
  metadata: {
    ultimaVisita?: string;
    sincronizadoEn: string;
  };
}

export interface Coordenadas {
  lat: number;
  lng: number;
  precision?: number;
}

export interface Recomendacion {
  id: string;
  clienteId: string;
  tipo: 'venta' | 'cobranza' | 'merchandising' | 'informacion';
  prioridad: 'alta' | 'media' | 'baja';
  titulo: string;
  descripcion: string;
  razonVisita: string;
  sku?: string;
  metadata: {
    validaHasta: string;
    sincronizadoEn: string;
  };
}

export interface Feedback {
  id?: string;
  idempotencyKey: string;
  recomendacionId: string;
  clienteId: string;
  resultado: 'aceptada' | 'rechazada' | 'parcial';
  motivo?: string;
  nota?: string;
  timestamp: string;
}

export interface InventarioItem {
  sku: string;
  marca: string;
  existencia?: number;
  precio?: number;
  facing?: number;
  nivel?: 'alto' | 'medio' | 'bajo';
}

export interface Inventario {
  id?: string;
  idempotencyKey: string;
  clienteId: string;
  tipo: 'propio' | 'competencia';
  items: InventarioItem[];
  observaciones?: string;
  timestamp: string;
}

export interface Quiebre {
  id?: string;
  idempotencyKey: string;
  clienteId: string;
  skus: string[];
  timestamp: string;
}

export interface CierreVisita {
  id?: string;
  idempotencyKey: string;
  clienteId: string;
  coordenadas?: Coordenadas;
  capturaCoordenadas: 'automatica' | 'manual';
  justificativoGeo?: string;
  resumen: {
    tareasCompletadas: number;
    tareasPendientes: number;
    feedbacksRegistrados: number;
  };
  notas?: string;
  timestamp: string;
}

export interface QueueItem<T = unknown> {
  id: string;
  type: 'feedback' | 'inventario' | 'quiebre' | 'cierre';
  payload: T;
  idempotencyKey: string;
  createdAt: string;
  attempts: number;
  nextRetry?: string;
  status: 'pending' | 'sending' | 'error' | 'sent';
  error?: string;
}

export interface FeatureFlags {
  ff_inteligencia_competencia: boolean;
  ff_geo_validacion: boolean;
  ff_geo_validacion_precision_minima: number;
  ff_apis_mock: boolean;
  ff_background_sync: boolean;
  ff_offline_mode: boolean;
}

export interface AppConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  featureFlags: FeatureFlags;
  environment: 'development' | 'staging' | 'production';
  version: string;
}

export interface SyncProgress {
  dataset: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  progress: number;
  total: number;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}
