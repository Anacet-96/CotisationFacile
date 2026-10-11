import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockCards, mockCardDays, mockProducts } from '../../lib/mockData';
import { formatFCFA, formatDateTime, buildMisesFromCards, filterByPeriod, cx } from '../../lib/helpers';
import { getCollectorCards, getCollectorStats } from '../../lib/collectorHelpers';
import Header from '../../components/layout/Header';

const FILTRES = [
  { key: 'jour', label: "Aujourd'hui" },
  { key: 'semaine', label: 'Cette semaine' },
  { key: 'mois', label: 'Ce mois' },
  { key: 'tout', label: 'Tout' },
];

export default function Historique() {
  const { user } = useAuth();
  const [filtre, setFiltre] = useState('tout');

  const myCards = getCollectorCards(user.id, mockCards);
  const myCardIds = myCards.map(c => c.id);
  const myDays = mockCardDays.filter(d => myCardIds.includes(d.card_id));
  const allMises = buildMisesFromCards(myCards, myDays, mockProducts);
  const filtered = filterByPeriod(allMises, filtre);
  const total = filtered.reduce((sum, m) => sum + m.amount, 0);

  // Stats sur la période
  const stats = getCollectorStats(user.id, filtre, mockCards, mockCardDays, mockProducts);

  return (
    <>
      <Header title="Mon historique" />
      <div className="p-4 max-w-lg mx-auto space-y-4">

        {/* Total */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-light to-indigo-700 dark:from-primary-dark dark:to-indigo-600 text-white p-5 shadow-lg">
          <p className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">
            Total mises collectées
          </p>
          <p className="font-mono font-extrabold text-2xl mt-1">{formatFCFA(stats.misesAmount)}</p>
          <p className="text-xs opacity-80 mt-0.5">
            {stats.misesCount} mise{stats.misesCount > 1 ? 's' : ''} sur la période
          </p>
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

        {/* Liste */}
        {filtered.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-muted text-sm">Aucune mise sur cette période.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map(m => (
              <li key={m.id} className="card flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {m.product_name} · Jour #{m.day_number}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{formatDateTime(m.filled_at)}</p>
                </div>
                <span className="font-mono font-bold text-secondary-light dark:text-secondary-dark shrink-0">
                  +{formatFCFA(m.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Total pied */}
        {filtered.length > 0 && (
          <div className="card flex items-center justify-between sticky bottom-20 lg:bottom-4">
            <span className="text-sm font-semibold">Total période</span>
            <span className="font-mono font-bold text-lg text-primary-light dark:text-primary-dark">
              {formatFCFA(total)}
            </span>
          </div>
        )}
      </div>
    </>
  );
}