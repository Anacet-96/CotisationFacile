import { Link } from 'react-router-dom';
import { Bell, AlertTriangle, CheckCircle2, Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMockStore, markNotificationRead } from '../lib/mockStore';
import { formatDateTime } from '../lib/helpers';
import Header from '../components/layout/Header';

const ICON_BY_TYPE = {
  mise_confirmee: { icon: CheckCircle2, color: 'text-secondary-light dark:text-secondary-dark', bg: 'bg-secondary-light/10 dark:bg-secondary-dark/15' },
  modification_mise: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  adhesion_validee: { icon: CheckCircle2, color: 'text-secondary-light dark:text-secondary-dark', bg: 'bg-secondary-light/10 dark:bg-secondary-dark/15' },
  journee_validee: { icon: CheckCircle2, color: 'text-secondary-light dark:text-secondary-dark', bg: 'bg-secondary-light/10 dark:bg-secondary-dark/15' },
  default: { icon: Info, color: 'text-primary-light dark:text-primary-dark', bg: 'bg-primary-light/10 dark:bg-primary-dark/15' },
};

export default function Notifications() {
  const { user } = useAuth();
  const nav = useNavigate();

  // TODO Supabase : SELECT * FROM notifications WHERE user_id = user.id ORDER BY created_at DESC
  const store = useMockStore();
  const notifs = store.notifications
    .filter(n => n.user_id === user?.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <>
      <Header title="Notifications" />
      <div className="p-4 max-w-lg mx-auto lg:max-w-3xl space-y-4">
        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm text-muted">
          <ArrowLeft size={16} /> Retour
        </button>

        {notifs.length === 0 ? (
          <div className="card text-center py-12">
            <Bell size={32} className="mx-auto mb-3 text-muted" />
            <p className="text-muted text-sm">Aucune notification pour le moment.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {notifs.map(n => {
              const cfg = ICON_BY_TYPE[n.type] || ICON_BY_TYPE.default;
              const Icon = cfg.icon;
              return (
                <li key={n.id}>
                  <Link
                    to={n.link || '#'}
                    onClick={() => markNotificationRead(n.id)}
                    className={`block card flex items-start gap-3 hover:shadow-md transition ${!n.read ? 'border-l-4 border-l-primary-light dark:border-l-primary-dark' : ''
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={20} className={cfg.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">{n.message}</p>
                      <p className="text-xs text-muted mt-1">{formatDateTime(n.created_at)}</p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-primary-light dark:bg-primary-dark mt-2 shrink-0" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}