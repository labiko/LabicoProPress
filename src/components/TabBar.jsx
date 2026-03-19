import { NavLink } from 'react-router-dom';

const tabs = [
  { path: '/', icon: '📊', label: 'Accueil' },
  { path: '/commandes', icon: '📋', label: 'Commandes' },
  { path: '/clients', icon: '👥', label: 'Clients' },
  { path: '/parametres', icon: '⚙️', label: 'Paramètres' },
];

export function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 shadow-lg">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <span className="text-xl mb-0.5">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
