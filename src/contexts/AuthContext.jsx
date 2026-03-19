import { createContext, useContext, useState, useEffect } from 'react';
import { getUserFromStorage, saveUserToStorage, clearUserFromStorage } from '../lib/auth';
import { supabase } from '../lib/supabase';

// Note: On utilise notre propre systeme d'auth (telephone + mot de passe crypte)
// et non Supabase Auth

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [pressing, setPressing] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger l'utilisateur depuis le localStorage au démarrage
    const savedUser = getUserFromStorage();
    if (savedUser) {
      setUserState(savedUser);
      setIsAuthenticated(true);
      loadPressing(savedUser.pressing_id);
    }
    setLoading(false);
  }, []);

  const loadPressing = async (pressingId) => {
    if (!pressingId) return;

    try {
      const { data, error } = await supabase
        .from('pressings')
        .select('*')
        .eq('id', pressingId)
        .single();

      if (!error && data) {
        setPressing(data);
      }
    } catch (err) {
      console.error('Erreur chargement pressing:', err);
    }
  };

  const setUser = (newUser) => {
    setUserState(newUser);
    setIsAuthenticated(!!newUser);

    if (newUser) {
      saveUserToStorage(newUser);
      loadPressing(newUser.pressing_id);
    } else {
      clearUserFromStorage();
      setPressing(null);
    }
  };

  const logout = () => {
    clearUserFromStorage();
    setUserState(null);
    setPressing(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      pressing,
      isAuthenticated,
      loading,
      setUser,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
