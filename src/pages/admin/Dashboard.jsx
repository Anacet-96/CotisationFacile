import { Link } from 'react-router-dom';
import {
  Users, Package, TrendingUp, UserCheck, ArrowRight,
  Clock, Sparkles, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMockStore } from '../../lib/mockStore';
import { getGlobalAdminStats } from '../../lib/adminHelpers';
import { formatFCFA, cx, formatDateTime } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';

export default function Dashboard() {
  const { user } = useAuth();
  const store = useMockStore();
  const firstname = (user?.name || '').split(' ')[0];

  const stats = getGlobalAdminStats(store.users, store.cards, store.cardDays, store.products);
  const pendingRequests = store.profileChangeRequests.filter(r => r.status === 'en_attente');
  const pendingOrders = store.customOrders.filter(o => o.status === 'en_attente');
  const pendingClients = store.users.filter(
    u => u.role === 'client' && u.status === 'en_attente'
  );

  return (
    <>
      <Header title="Vue d'ensemble" />
      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-5">

        {/* Bannière */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-light to-indigo-700 dark:from-primary-dark dark:to-indigo-600 text-white p-5 shadow-lg">
          <p className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">
            Espace administrateur
          </p>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold mb-1">
            Bonjour, {firstname} 👋
          </h2>
          <p className="text-sm opacity-90">
            Pilotage global de la plateforme.
          </p>
        </div>

        {/* 4 stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Collecteurs" value={stats.collectorsCount} color="primary" />
          <StatCard icon={UserCheck} label="Clients" value={stats.clientsCount} color="success" />
          <StatCard icon={Package} label="Produits actifs" value={stats.productsActiveCount} color="primary" />
          <StatCard
            icon={TrendingUp}
            label="Total collecté"
            value={formatFCFA(stats.totalCollected).replace(' FCFA', '')}
            suffix="FCFA"
            color="success"
            mono
          />
        </div>

        {/* Alertes */}
        {pendingClients.length > 0 && (
          <AlertCard
            to="/admin/comptes"
            icon={UserCheck}
            color="warning"
            title={`${pendingClients.length} nouvelle(s) inscription(s)`}
            subtitle="Clients en attente de validation"
          />
        )}

        {pendingRequests.length > 0 && (
          <AlertCard
            to="/admin/demandes"
            icon={Clock}
            color="primary"
            title={`${pendingRequests.length} modification(s) client`}
            subtitle="Demandes de collecteurs à approuver"
          />
        )}

        {pendingOrders.length > 0 && (
          <AlertCard
            to="/admin/commandes"
            icon={Sparkles}
            color="success"
            title={`${pendingOrders.length} commande(s) personnalisée(s)`}
            subtitle="Demandes clients à traiter"
          />
        )}

        {/* Tableau collecteurs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-lg flex items-center gap-2">
              <Users size={20} className="text-primary-light dark:text-primary-dark" />
              Performances collecteurs
            </h3>
            <Link
              to="/admin/performances"
              className="text-sm text-primary-light dark:text-primary-dark font-semibold"
            >
              Voir tout →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {store.users
              .filter(u => u.role === 'collecteur')
              .map(c => {
                const myCards = store.cards.filter(card => card.collector_id === c.id);
                const activeCards = myCards.filter(card => card.status === 'actif').length;
                const todayStr = new Date().toISOString().slice(0, 10);
                const myCardIds = myCards.map(x => x.id);
                const todayTotal = store.cardDays
                  .filter(
                    d =>
                      myCardIds.includes(d.card_id) &&
                      d.filled &&
                      d.filled_at &&
                      d.filled_at.slice(0, 10) === todayStr
                  )
                  .reduce((s, d) => s + (d.amount || 0), 0);

                return (
                  <Link
                    key={c.id}
                    to={`/admin/collecteur/${c.id}`}
                    className="card hover:shadow-md transition flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-heading font-bold truncate">{c.name}</p>
                        <p className="text-xs text-muted font-mono">{c.phone}</p>
                      </div>
                      <ArrowRight size={18} className="text-muted shrink-0 mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted">Cartes actives</p>
                        <p className="font-mono font-bold text-lg leading-none">{activeCards}</p>
                      </div>
                      <div>
                        <p className="text-muted">Aujourd'hui</p>
                        <p className="font-mono font-bold text-sm leading-none truncate">
                          {formatFCFA(todayTotal).replace(' FCFA', '')}
                        </p>
                      </div>
                    </div>
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

function AlertCard({ to, icon: Icon, color, title, subtitle }) {
  const colors = {
    warning: 'border-amber-500/40 bg-amber-500/5',
    primary: 'border-primary-light/40 dark:border-primary-dark/40 bg-primary-light/5 dark:bg-primary-dark/10',
    success: 'border-secondary-light/40 dark:border-secondary-dark/40 bg-secondary-light/5 dark:bg-secondary-dark/10',
  };
  const iconColors = {
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    primary: 'bg-primary-light/15 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark',
    success: 'bg-secondary-light/15 dark:bg-secondary-dark/20 text-secondary-light dark:text-secondary-dark',
  };
  return (
    <Link
      to={to}
      className={cx('card border-2 flex items-center gap-3 hover:shadow-md transition', colors[color])}
    >
      <div className={cx('w-10 h-10 rounded-full flex items-center justify-center shrink-0', iconColors[color])}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>
      <ArrowRight size={18} className="text-muted shrink-0" />
    </Link>
  );
}