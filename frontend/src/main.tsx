import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initDB } from './services/db';
import { setupAuthInterceptor } from './services/auth';
import { logger } from './utils/logger';
import './index.css';

// Setup auth interceptor for automatic token refresh
setupAuthInterceptor();

// Register Service Worker (handled by vite-plugin-pwa)
// The plugin will inject the registration code automatically

// Initialize IndexedDB
initDB()
  .then(() => {
    logger.info('App initialized');
  })
  .catch((error) => {
    logger.error('Failed to initialize app', { error });
  });

// Handle online/offline events
window.addEventListener('online', () => {
  logger.info('Network status: online');
  // TODO: Trigger sync
});

window.addEventListener('offline', () => {
  logger.warn('Network status: offline');
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
