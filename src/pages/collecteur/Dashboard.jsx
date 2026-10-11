import { Link, useOutletContext } from 'react-router-dom';
import { Users, UserPlus, Phone, MapPin, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCards, mockCardDays, mockDailyValidations, mockProducts, mockUsers } from '../../lib/mockData';
import { getCollectorClients, getCollectorCards, getCollectorDayStats } from '../../lib/collectorHelpers';
import { formatFCFA, cx } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';

export default function Dashboard() {
  const { user } = useAuth();
  const { blocked } = useOutletContext() || {};
  const firstname = (user?.name || '').split(' ')[0];

  const clients = getCollectorClients(user.id, mockUsers);
  const myCards = getCollectorCards(user.id, mockCards);
  const stats = getCollectorDayStats(user.id, mockCards, mockCardDays, mockProducts, mockUsers);

  // Statut du jour : validée hier ou pas
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const yesterdayValidated = mockDailyValidations.some(
    v => v.collector_id === user.id && v.date === yesterday
  );

  return (
    <>
      <Header title="Mon activité" />
      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-5">

        {/* Bannière */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-light to-indigo-700 dark:from-primary-dark dark:to-indigo-600 text-white p-5 shadow-lg">
          <p className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">
            Espace collecteur
          </p>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold mb-1">
            Bonjour, {firstname} 👋
          </h2>
          <p className="text-sm opacity-90">
            Voici votre activité du jour.
          </p>

          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold opacity-70 uppercase tracking-wide">
                Statut journée précédente
              </p>
              <p className="text-sm font-semibold mt-0.5">
                {yesterdayValidated ? '✅ Validée par la secrétaire' : '⏳ En attente de validation'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold opacity-70 uppercase tracking-wide">
                Total encaissé aujourd'hui
              </p>
              <p className="font-mono font-extrabold text-lg">{formatFCFA(stats.total)}</p>
            </div>
          </div>
        </div>

        {/* Stats du jour */}
        <div>
          <h3 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-light dark:text-primary-dark" />
            Aujourd'hui
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Cartes vendues" value={stats.cardsCount} amount={stats.cardsAmount} />
            <StatCard label="Mises" value={stats.misesCount} amount={stats.misesAmount} />
            <StatCard label="Livraisons" value={stats.livraisonsCount} amount={stats.livraisonsAmount} />
          </div>
        </div>

        {/* Mes clients */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-lg flex items-center gap-2">
              <Users size={20} className="text-primary-light dark:text-primary-dark" />
              Mes clients
              <span className="text-muted font-normal text-sm">({clients.length})</span>
            </h3>
            <Link
              to="/collecteur/nouveau-client"
              className={cx(
                'text-sm font-semibold flex items-center gap-1 text-primary-light dark:text-primary-dark',
                blocked && 'opacity-50 pointer-events-none'
              )}
            >
              <UserPlus size={16} /> Nouveau
            </Link>
          </div>

          {clients.length === 0 && (
            <div className="card text-center py-8">
              <p className="text-muted text-sm">Aucun client assigné.</p>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {clients.map(c => {
              const cCards = mockCards.filter(card => card.client_id === c.id);
              const activeCards = cCards.filter(card => card.status === 'actif').length;
              const pendingCards = cCards.filter(card => card.status === 'en_attente').length;
              return (
                <Link
                  key={c.id}
                  to={`/collecteur/client/${c.id}`}
                  className="card hover:shadow-md transition flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-heading font-bold truncate">{c.name}</p>
                      <p className="text-xs text-muted font-mono">{c.client_number}</p>
                    </div>
                    <ArrowRight size={18} className="text-muted shrink-0 mt-1" />
                  </div>

                  <div className="text-xs text-muted space-y-1">
                    <p className="flex items-center gap-1.5 truncate">
                      <Phone size={12} /> {c.phone}
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin size={12} /> {c.district}, {c.city}
                    </p>
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    {activeCards > 0 && <Badge color="success">{activeCards} active{activeCards > 1 ? 's' : ''}</Badge>}
                    {pendingCards > 0 && <Badge color="warning">{pendingCards} en attente</Badge>}
                    {activeCards === 0 && pendingCards === 0 && <Badge color="neutral">Aucune carte</Badge>}
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

function StatCard({ label, value, amount }) {
  return (
    <div className="card p-3">
      <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1 truncate">
        {label}
      </p>
      <p className="font-mono font-extrabold text-xl leading-none">{value}</p>
      <p className="text-[10px] text-muted mt-1 font-mono">{formatFCFA(amount)}</p>
    </div>
  );
}