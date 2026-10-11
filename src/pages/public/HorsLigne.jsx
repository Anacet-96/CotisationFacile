import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function HorsLigne() {
  const nav = useNavigate();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    if (online) nav(-1);
  }, [online, nav]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface-light dark:bg-surface-dark text-center">
      <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <WifiOff size={48} className="text-red-500" />
      </div>
      <h1 className="text-2xl font-heading font-extrabold mb-3">Vous êtes hors-ligne</h1>
      <p className="text-muted max-w-sm mb-8">
        Vérifiez votre connexion internet. Certaines données consultées récemment restent accessibles.
      </p>
      <Button onClick={() => window.location.reload()}>Réessayer</Button>
    </div>
  );
}