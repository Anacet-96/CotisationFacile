import { Link } from 'react-router-dom';
import { Users, UserCheck, TrendingUp, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMockStore } from '../../lib/mockStore';
import { getGlobalStats, getCollectorStatusToday } from '../../lib/secretaireHelpers';
import { formatFCFA, cx } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';

export default function Dashboard() {
  const { user } = useAuth();
  const store = useMockStore();
  const firstname = (user?.name || '').split(' ')[0];

  const stats = getGlobalStats(store.users, store.cards, store.cardDays);
  const collectors = store.users.filter(u => u.role === 'collecteur');
  const clientsEnAttente = store.users.filter(
    u => u.role === 'client' && u.status === 'en_attente'
  );
  const pendingRequests = store.profileChangeRequests.filter(r => r.status === 'en_attente');

  return (
    <>
      <Header title="Vue d'ensemble" />
      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-5">

        {/* Bannière */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-light to-indigo-700 dark:from-primary-dark dark:to-indigo-600 text-white p-5 shadow-lg">
          <p className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">
            Espace secrétaire
          </p>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold mb-1">
            Bonjour, {firstname} 👋
          </h2>
          <p className="text-sm opacity-90">
            Gérez la comptabilité journalière et les comptes utilisateurs.
          </p>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={Users}
            label="Collecteurs"
            value={stats.collectorsCount}
            color="primary"
          />
          <StatCard
            icon={UserCheck}
            label="Clients actifs"
            value={stats.clientsCount - stats.clientsEnAttenteCount}
            color="success"
          />
          <StatCard
            icon={Clock}
            label="Clients à valider"
            value={stats.clientsEnAttenteCount}
            color={stats.clientsEnAttenteCount > 0 ? 'warning' : 'neutral'}
          />
          <StatCard
            icon={TrendingUp}
            label="Encaissé aujourd'hui"
            value={formatFCFA(stats.totalToday).replace(' FCFA', '')}
            suffix="FCFA"
            color="primary"
            mono
          />
        </div>

        {/* Alertes */}
        {clientsEnAttente.length > 0 && (
          <Link
            to="/secretaire/clients"
            className="card border-2 border-amber-500/40 flex items-center gap-3 hover:shadow-md transition"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">
                {clientsEnAttente.length} nouveau{clientsEnAttente.length > 1 ? 'x' : ''} client{clientsEnAttente.length > 1 ? 's' : ''} en attente
              </p>
              <p className="text-xs text-muted">
                À valider et à assigner à un collecteur
              </p>
            </div>
            <ArrowRight size={18} className="text-muted shrink-0" />
          </Link>
        )}

        {pendingRequests.length > 0 && (
          <Link
            to="/secretaire/clients"
            className="card border-2 border-primary-light/40 dark:border-primary-dark/40 flex items-center gap-3 hover:shadow-md transition"
          >
            <div className="w-10 h-10 rounded-full bg-primary-light/15 dark:bg-primary-dark/20 flex items-center justify-center shrink-0">
              <Clock size={20} className="text-primary-light dark:text-primary-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">
                {pendingRequests.length} modification{pendingRequests.length > 1 ? 's' : ''} client en attente
              </p>
              <p className="text-xs text-muted">
                Demandes de collecteurs à valider
              </p>
            </div>
            <ArrowRight size={18} className="text-muted shrink-0" />
          </Link>
        )}

        {/* Statut des collecteurs aujourd'hui */}
        <div>
          <h3 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
            <Users size={20} className="text-primary-light dark:text-primary-dark" />
            Statut des collecteurs
            <span className="text-muted font-normal text-sm">({collectors.length})</span>
          </h3>

          {collectors.length === 0 && (
            <div className="card text-center py-8">
              <p className="text-muted text-sm">Aucun collecteur enregistré.</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {collectors.map(c => {
              const status = getCollectorStatusToday(c.id, store.dailyValidations);
              const myClients = store.users.filter(u => u.collector_id === c.id && u.role === 'client');
              return (
                <Link
                  key={c.id}
                  to={`/secretaire/collecteur/${c.id}`}
                  className="card hover:shadow-md transition flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-heading font-bold truncate">{c.name}</p>
                      <p className="text-xs text-muted font-mono">{c.phone}</p>
                    </div>
                    <Badge color={status.color}>
                      {status.todayValidated ? 'Validée' : 'En attente'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {myClients.length} client{myClients.length > 1 ? 's' : ''} assigné{myClients.length > 1 ? 's' : ''}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value, suffix, color = 'primary', mono }) {
  const colors = {
    primary: 'bg-primary-light/10 dark:bg-primary-dark/15 text-primary-light dark:text-primary-dark',
    success: 'bg-secondary-light/10 dark:bg-secondary-dark/15 text-secondary-light dark:text-secondary-dark',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    neutral: 'bg-black/5 dark:bg-white/10 text-muted',
  };
  return (
    <div className="card">
      <div className={cx('w-9 h-9 rounded-full flex items-center justify-center mb-2', colors[color])}>
        <Icon size={18} />
      </div>
      <p className="text-[10px] font-semibold text-muted uppercase tracking-wide truncate">
        {label}
      </p>
      <p className={cx('font-extrabold text-xl leading-tight mt-0.5', mono && 'font-mono')}>
        {value}
        {suffix && <span className="text-xs font-normal text-muted ml-1">{suffix}</span>}
      </p>
    </div>
  );
}