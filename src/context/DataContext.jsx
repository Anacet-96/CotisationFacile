import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchAllData, onDataChange } from '../lib/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState({
    products: [], kitItems: [], notifications: [],
    cards: [], cardDays: [], users: [],
    dailyValidations: [], customOrders: [], profileChangeRequests: [],
    loading: true,
  });

  const refresh = useCallback(async () => {
    if (!user) {
      setState(s => ({ ...s, loading: false }));
      return;
    }
    setState(s => ({ ...s, loading: true }));
    const data = await fetchAllData();
    setState({ ...data, loading: false });
  }, [user?.id]);

  useEffect(() => { refresh(); }, [refresh]);

  // Re-fetch automatique après chaque mutation
  useEffect(() => {
    const unsub = onDataChange(() => refresh());
    return unsub;
  }, [refresh]);

  return (
    <DataContext.Provider value={{ ...state, refresh }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData doit être utilisé dans DataProvider');
  return ctx;
}