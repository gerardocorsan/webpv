import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initDB } from './services/db';
import { logger } from './utils/logger';
import './index.css';

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        logger.info('Service Worker registered', {
          scope: registration.scope,
        });
      })
      .catch((error) => {
        logger.error('Service Worker registration failed', { error });
      });
  });
}

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
