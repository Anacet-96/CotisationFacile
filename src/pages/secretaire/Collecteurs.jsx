import { Link } from 'react-router-dom';
import { Users, ArrowRight, Phone, MapPin } from 'lucide-react';
import { useMockStore } from '../../lib/mockStore';
import { getCollectorStatusToday } from '../../lib/secretaireHelpers';
import { formatFCFA, cx } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';

export default function Collecteurs() {
  const store = useMockStore();
  const collectors = store.users.filter(u => u.role === 'collecteur');

  return (
    <>
      <Header title="Mes collecteurs" />
      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-4">

        <div className="card">
          <p className="text-xs text-muted">
            Cliquez sur un collecteur pour voir sa <b>comptabilité journalière</b> et valider sa journée.
          </p>
        </div>

        {collectors.length === 0 && (
          <div className="card text-center py-8">
            <p className="text-muted text-sm">Aucun collecteur enregistré.</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collectors.map(c => {
            const status = getCollectorStatusToday(c.id, store.dailyValidations);
            const myClients = store.users.filter(u => u.collector_id === c.id && u.role === 'client');
            const myCards = store.cards.filter(card => card.collector_id === c.id);
            const activeCards = myCards.filter(card => card.status === 'actif').length;

            // Total encaissé aujourd'hui
            const todayStr = new Date().toISOString().slice(0, 10);
            const myCardIds = myCards.map(card => card.id);
            const todayMises = store.cardDays.filter(
              d =>
                myCardIds.includes(d.card_id) &&
                d.filled &&
                d.filled_at &&
                d.filled_at.slice(0, 10) === todayStr
            );
            const totalToday = todayMises.reduce((sum, d) => sum + (d.amount || 0), 0);

            return (
              <Link
                key={c.id}
                to={`/secretaire/collecteur/${c.id}`}
                className="card hover:shadow-md transition flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-heading font-bold truncate">{c.name}</p>
                    <p className="text-xs text-muted font-mono">{c.phone}</p>
                  </div>
                  <ArrowRight size={18} className="text-muted shrink-0 mt-1" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted">Clients</p>
                    <p className="font-mono font-bold text-lg leading-none">{myClients.length}</p>
                  </div>
                  <div>
                    <p className="text-muted">Cartes</p>
                    <p className="font-mono font-bold text-lg leading-none">{activeCards}</p>
                  </div>
                  <div>
                    <p className="text-muted">Aujourd'hui</p>
                    <p className="font-mono font-bold text-sm leading-none truncate">
                      {formatFCFA(totalToday).replace(' FCFA', '')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline/30">
                  <Badge color={status.color}>
                    {status.todayValidated ? 'Journée validée' : 'En attente'}
                  </Badge>
                  <span className="text-[10px] text-muted">Voir le détail</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}