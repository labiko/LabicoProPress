import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Layout } from './components/Layout';
import { InstallPrompt } from './components/InstallPrompt';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { ClientForm } from './pages/ClientForm';
import { Commandes } from './pages/Commandes';
import { CommandeForm } from './pages/CommandeForm';
import { Parametres } from './pages/Parametres';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Layout>
              <Clients />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients/nouveau"
        element={
          <ProtectedRoute>
            <Layout>
              <ClientForm />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ClientForm />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/commandes"
        element={
          <ProtectedRoute>
            <Layout>
              <Commandes />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/commandes/nouvelle"
        element={
          <ProtectedRoute>
            <Layout>
              <CommandeForm />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/commandes/:id/modifier"
        element={
          <ProtectedRoute>
            <Layout>
              <CommandeForm />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/parametres"
        element={
          <ProtectedRoute>
            <Layout>
              <Parametres />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
          <InstallPrompt />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
