// Common helper functions

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Generate an idempotency key for API requests
 */
export function generateIdempotencyKey(): string {
  return uuidv4();
}

/**
 * Check if the app is currently online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Calculate retry delay using exponential backoff
 */
export function getRetryDelay(attempts: number, baseDelay = 1000, maxDelay = 60000): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempts), maxDelay);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 1000;
  return delay + jitter;
}

/**
 * Format a date to ISO string
 */
export function toISOString(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * Truncate a token for logging (show last 4 chars only)
 */
export function truncateToken(token: string): string {
  if (token.length <= 4) return '****';
  return `****${token.slice(-4)}`;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Check if geolocation is available
 */
export function isGeolocationAvailable(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Get current position
 */
export function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationAvailable()) {
      reject(new Error('Geolocation is not available'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
