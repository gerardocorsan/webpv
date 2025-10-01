import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isFeatureEnabled } from './utils/config';
import { logger } from './utils/logger';

// Placeholder components (to be implemented)
function LoginPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Iniciar Sesión</h1>
      <p>TODO: Implementar US-A1</p>
    </div>
  );
}

function SyncPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Sincronización Inicial</h1>
      <p>TODO: Implementar US-B1</p>
    </div>
  );
}

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
    ff_inteligencia_competencia: isFeatureEnabled('ff_inteligencia_competencia'),
    ff_geo_validacion: isFeatureEnabled('ff_geo_validacion'),
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sync" element={<SyncPage />} />
        <Route path="/daily-list" element={<DailyListPage />} />
        <Route path="/client/:id" element={<ClientDetailPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
