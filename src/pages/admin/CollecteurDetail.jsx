import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, TrendingUp, Truck, CreditCard,
  CheckCircle2, XCircle,
} from 'lucide-react';
import { useMockStore } from '../../lib/mockStore';
import { getAdminCollectorStats } from '../../lib/adminHelpers';
import { getCollectorStatusToday } from '../../lib/secretaireHelpers';
import { formatFCFA, cx } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';

const FILTRES = [
  { key: 'jour', label: "Aujourd'hui" },
  { key: 'semaine', label: 'Semaine' },
  { key: 'mois', label: 'Ce mois' },
  { key: 'annee', label: 'Année' },
];

export default function CollecteurDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const store = useMockStore();
  const [filtre, setFiltre] = useState('mois');

  const collector = store.users.find(u => u.id === id && u.role === 'collecteur');
  const stats = useMemo(
    () =>
      collector
        ? getAdminCollectorStats(collector.id, filtre, store.cards, store.cardDays, store.products)
        : null,
    [collector, filtre, store.cards, store.cardDays, store.products]
  );
  const status = collector ? getCollectorStatusToday(collector.id, store.dailyValidations) : null;

  if (!collector || !stats) {
    return (
      <>
        <Header title="Collecteur" />
        <div className="p-4 max-w-lg mx-auto">
          <Link to="/admin" className="flex items-center gap-2 text-sm text-muted">
            <ArrowLeft size={16} /> Retour
          </Link>
          <div className="card text-center py-8 mt-4">
            <p className="text-muted">Collecteur introuvable.</p>
          </div>
        </div>
      </>
    );
  }

  const myClients = store.users.filter(u => u.collector_id === collector.id && u.role === 'client');
  const myCards = store.cards.filter(c => c.collector_id === collector.id);
  const activeCards = myCards.filter(c => c.status === 'actif').length;

  return (
    <>
      <Header title={collector.name} />
      <div className="p-4 max-w-lg mx-auto lg:max-w-4xl space-y-4">

        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm text-muted">
          <ArrowLeft size={16} /> Retour
        </button>

        {/* Bandeau */}
        <div className="card">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="font-heading font-bold text-lg">{collector.name}</h2>
              <p className="text-xs text-muted font-mono">{collector.phone}</p>
            </div>
            <Badge color={status.color}>
              {status.todayValidated ? '✅ Validée' : '⏳ En attente'}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-muted">Clients</p>
              <p className="font-mono font-bold text-lg leading-none">{myClients.length}</p>
            </div>
            <div>
              <p className="text-muted">Cartes actives</p>
              <p className="font-mono font-bold text-lg leading-none">{activeCards}</p>
            </div>
            <div>
              <p className="text-muted">Cartes totales</p>
              <p className="font-mono font-bold text-lg leading-none">{myCards.length}</p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {FILTRES.map(f => (
            <button
              key={f.key}
              onClick={() => setFiltre(f.key)}
              className={cx(
                'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition min-h-[40px]',
                filtre === f.key
                  ? 'bg-primary-light dark:bg-primary-dark text-white'
                  : 'bg-black/5 dark:bg-white/10 text-muted'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-light to-indigo-700 dark:from-primary-dark dark:to-indigo-600 text-white p-5 shadow-lg">
          <p className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">
            Total encaissé
          </p>
          <p className="font-mono font-extrabold text-3xl mt-1">
            {formatFCFA(stats.total)}
          </p>
        </div>

        {/* Détail */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatBlock icon={CreditCard} label="Cartes vendues" count={stats.cardsCount} amount={stats.cardsAmount} />
          <StatBlock icon={TrendingUp} label="Mises collectées" count={stats.misesCount} amount={stats.misesAmount} />
          <StatBlock icon={Truck} label="Livraisons" count={stats.deliveriesCount} amount={stats.deliveriesAmount} />
        </div>

        {/* Statut du jour */}
        <div className={cx(
          'card border-2 flex items-start gap-3',
          status.todayValidated
            ? 'border-secondary-light/40 dark:border-secondary-dark/40'
            : 'border-amber-500/40'
        )}>
          {status.todayValidated ? (
            <CheckCircle2 size={22} className="text-secondary-light dark:text-secondary-dark shrink-0 mt-0.5" />
          ) : (
            <XCircle size={22} className="text-amber-500 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold text-sm">
              {status.todayValidated
                ? 'Journée validée par la secrétaire'
                : "Journée en attente de validation"}
            </p>
            <p className="text-xs text-muted mt-0.5">
              {status.todayValidated
                ? 'Les mises sont verrouillées. Aucune modification possible.'
                : 'La secrétaire doit valider cette journée.'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function StatBlock({ icon: Icon, label, count, amount }) {
  return (
    <div className="card">
      <Icon size={18} className="text-primary-light dark:text-primary-dark mb-2" />
      <p className="text-[10px] text-muted font-semibold uppercase tracking-wide">{label}</p>
      <p className="font-mono font-extrabold text-xl leading-none mt-0.5">{count}</p>
      <p className="text-xs text-muted font-mono mt-1">{formatFCFA(amount)}</p>
    </div>
  );
}