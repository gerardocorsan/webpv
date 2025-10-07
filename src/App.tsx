import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './features/auth/LoginScreen';
import { SyncScreen } from './features/sync/SyncScreen';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OfflineBanner } from './components/OfflineBanner';
import { logger } from './utils/logger';
import { isFeatureEnabled } from './utils/config';

// Placeholder components (to be implemented)
function DailyListPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Lista del Día</h1>
      <p>TODO: Implementar US-C1</p>
    </div>
  );
}

function ClientDetailPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Detalle de Cliente</h1>
      <p>TODO: Implementar US-D1</p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>404 - Página no encontrada</h1>
    </div>
  );
}

function App() {
  logger.info('App rendered', {
    ff_apis_mock: isFeatureEnabled('ff_apis_mock'),
    ff_inteligencia_competencia: isFeatureEnabled('ff_inteligencia_competencia'),
    ff_geo_validacion: isFeatureEnabled('ff_geo_validacion'),
  });

  return (
    <BrowserRouter>
      <OfflineBanner />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginScreen />} />

        {/* Protected routes */}
        <Route
          path="/sync"
          element={
            <ProtectedRoute>
              <SyncScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/daily-list"
          element={
            <ProtectedRoute>
              <DailyListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/:id"
          element={
            <ProtectedRoute>
              <ClientDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Default and 404 routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
