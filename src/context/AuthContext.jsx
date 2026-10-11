import { createContext, useContext, useEffect, useState } from 'react';
import { mockUsers } from '../lib/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaure la session depuis localStorage (mock)
  useEffect(() => {
    // TODO Supabase : remplacer par supabase.auth.getSession()
    const stored = localStorage.getItem('emilio_mock_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

   // MOCK LOGIN — sera remplacé par Supabase Auth
  // TODO Supabase : remplacer par supabase.auth.signInWithPassword()
  async function signIn(email, password) {
    // ⚠️ On lit depuis le store pour tenir compte des changements de rôle
    const { getState } = await import('../lib/mockStore');
    const users = getState().users;
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      return { error: 'Email ou mot de passe incorrect.' };
    }
    const { password: _pw, ...safeUser } = found;
    setUser(safeUser);
    localStorage.setItem('emilio_mock_user', JSON.stringify(safeUser));
    return { user: safeUser };
  }

  // MOCK SIGNUP
  // TODO Supabase : remplacer par supabase.auth.signUp()
  async function signUp(payload) {
    // Simule la création d'un compte client
    const newUser = {
      id: `u-${Date.now()}`,
      role: 'client',
      client_number: `CT-${String(mockUsers.length + 1).padStart(5, '0')}`,
      ...payload,
    };
    setUser(newUser);
    localStorage.setItem('emilio_mock_user', JSON.stringify(newUser));
    return { user: newUser };
  }

  async function signOut() {
    // TODO Supabase : remplacer par supabase.auth.signOut()
    setUser(null);
    localStorage.removeItem('emilio_mock_user');
  }

  const value = {
    user,
    loading,
    role: user?.role || null,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}