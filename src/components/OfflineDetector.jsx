import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function OfflineDetector() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOffline = () => {
      if (location.pathname !== '/hors-ligne') {
        // Mémorise la page actuelle pour y retourner
        sessionStorage.setItem('offline_return_path', location.pathname);
        navigate('/hors-ligne');
      }
    };

    const handleOnline = () => {
      if (location.pathname === '/hors-ligne') {
        const returnPath = sessionStorage.getItem('offline_return_path') || '/';
        sessionStorage.removeItem('offline_return_path');
        navigate(returnPath);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Vérifie l'état au chargement
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [navigate, location]);

  return null; // Composant invisible
}