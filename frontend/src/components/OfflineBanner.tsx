import { useState, useEffect } from 'react';
import { UI_TEXT } from '@/utils/constants';

/**
 * Offline status banner component
 * Shows when the app is offline to inform the user
 */
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f59e0b',
        color: 'white',
        padding: '0.75rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        fontWeight: 500,
        zIndex: 9999,
      }}
      role="alert"
      aria-live="polite"
    >
      {UI_TEXT.OFFLINE_MODE}
    </div>
  );
}
