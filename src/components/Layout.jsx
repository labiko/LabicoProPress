import { useAuth } from '../contexts/AuthContext';
import { TabBar } from './TabBar';
import { APP_VERSION } from '../version';

export function Layout({ children }) {
  const { user, pressing, logout } = useAuth();

  const displayName = pressing?.nom || 'LabicoProPress';
  const truncatedName = displayName.length > 18
    ? displayName.substring(0, 18) + '...'
    : displayName;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-primary-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">👔</span>
          <h1 className="font-semibold text-lg" title={displayName}>
            {truncatedName}
          </h1>
          <span className="text-white/50 text-xs">v{APP_VERSION}</span>
        </div>
        {user && (
          <button
            onClick={logout}
            className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
            title="Déconnexion"
          >
            🚪
          </button>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>

      {/* Tab bar */}
      <TabBar />
    </div>
  );
}
