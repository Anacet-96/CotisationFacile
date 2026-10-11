import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCards, mockCardDays, mockProducts } from '../../lib/mockData';
import { formatFCFA, formatDateTime, buildMisesFromCards, filterByPeriod, cx } from '../../lib/helpers';
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

  const myCards = mockCards.filter(c => c.client_id === user.id);
  const myDays = mockCardDays.filter(d => myCards.some(c => c.id === d.card_id));
  const mises = buildMisesFromCards(myCards, myDays, mockProducts);
  const filtered = filterByPeriod(mises, filtre);

  return (
    <>
      <Header title="Historique" />
      <div className="p-4 max-w-lg mx-auto space-y-4">
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

        {filtered.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-muted text-sm">Aucune cotisation sur cette période.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map(m => (
              <li key={m.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">
                        {m.product_name} · Jour #{m.day_number}
                      </p>
                      {m.was_modified && (
                        <span title="Modifié par le collecteur">
                          <AlertCircle size={16} className="text-red-500 shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {formatDateTime(m.filled_at)}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-secondary-light dark:text-secondary-dark shrink-0">
                    +{formatFCFA(m.amount)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}