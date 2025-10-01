import { describe, it, expect } from 'vitest';
import {
  generateId,
  isOnline,
  getRetryDelay,
  truncateToken,
  safeJSONParse,
  calculateDistance,
} from '../helpers';

describe('helpers', () => {
  describe('generateId', () => {
    it('should generate a valid UUID', () => {
      const id = generateId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('isOnline', () => {
    it('should return boolean', () => {
      const online = isOnline();
      expect(typeof online).toBe('boolean');
    });
  });

  describe('getRetryDelay', () => {
    it('should calculate exponential backoff', () => {
      const delay0 = getRetryDelay(0);
      const delay1 = getRetryDelay(1);
      const delay2 = getRetryDelay(2);

      expect(delay0).toBeGreaterThanOrEqual(1000);
      expect(delay0).toBeLessThan(3000);

      expect(delay1).toBeGreaterThanOrEqual(2000);
      expect(delay1).toBeLessThan(4000);

      expect(delay2).toBeGreaterThanOrEqual(4000);
      expect(delay2).toBeLessThan(6000);
    });

    it('should respect max delay', () => {
      const delay = getRetryDelay(20, 1000, 10000);
      expect(delay).toBeLessThan(12000); // max + jitter
    });
  });

  describe('truncateToken', () => {
    it('should show only last 4 characters', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const truncated = truncateToken(token);
      expect(truncated).toBe('****VCJ9');
    });

    it('should handle short tokens', () => {
      const token = 'abc';
      const truncated = truncateToken(token);
      expect(truncated).toBe('****');
    });
  });

  describe('safeJSONParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJSONParse('{"key":"value"}', {});
      expect(result).toEqual({ key: 'value' });
    });

    it('should return fallback for invalid JSON', () => {
      const fallback = { fallback: true };
      const result = safeJSONParse('invalid json', fallback);
      expect(result).toBe(fallback);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between coordinates', () => {
      // Distance between two known points (approx 111km)
      const distance = calculateDistance(0, 0, 1, 0);
      expect(distance).toBeCloseTo(111195, -2);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(19.4326, -99.1332, 19.4326, -99.1332);
      expect(distance).toBeCloseTo(0, 1);
    });
  });
});
