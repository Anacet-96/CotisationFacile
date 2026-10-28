import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, Calendar, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMockStore } from '../../lib/mockStore';
import { formatFCFA, computeCardStats, formatDate, cardStatusLabel, productTypeLabel, getCardDaysForMonth } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Card31 from '../../components/ui/Card31';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProductImage from '../../components/ui/ProductImage';

export default function CarteDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const store = useMockStore();
  const card = store.cards.find(c => c.id === id && c.client_id === user.id);
  const product = store.products.find(p => p.id === card?.product_id);
  const collector = store.users.find(u => u.id === card?.collector_id);
  const isYear = product?.product_type === '1_an';
  const currentMonth = card?.current_month || 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // ⚠️ Hooks AVANT le early return pour respecter les règles React
  if (!card) {
    return (
      <>
        <Header title="Carte" />
        <div className="p-4 max-w-lg mx-auto">
          <div className="card text-center">
            <p className="text-muted mb-4">Carte introuvable.</p>
            <Link to="/client" className="btn-primary">Retour</Link>
          </div>
        </div>
      </>
    );
  }

  const days = getCardDaysForMonth(card, store.cardDays, selectedMonth, isYear);
  const filledInMonth = days.filter(d => d.filled).length;
  const monthPercent = Math.round((filledInMonth / days.length) * 100);

  // Progression globale
  let globalFilled, globalTotal, globalPercent;
  if (isYear) {
    const monthsCompleted = card.months_completed || 0;
    const totalMonths = card.total_months || 12;
    const filledCurrent = getCardDaysForMonth(card, store.cardDays, currentMonth, true).filter(d => d.filled).length;
    globalFilled = monthsCompleted * 31 + filledCurrent;
    globalTotal = totalMonths * 31;
  } else {
    const stats = computeCardStats(card, store.cardDays);
    globalFilled = stats.filled;
    globalTotal = stats.total;
  }
  globalPercent = Math.round((globalFilled / globalTotal) * 100);

  return (
    <>
      <Header title={product?.name || 'Carte'} />
      <div className="p-4 max-w-lg mx-auto lg:max-w-3xl space-y-4">

        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm text-muted">
          <ArrowLeft size={16} /> Retour
        </button>

        {/* Bloc produit compact */}
        <div className="card">
          <div className="flex gap-3 items-start">
            <div className="w-20 sm:w-24 shrink-0">
              <ProductImage product={product} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="font-heading font-bold text-base sm:text-lg leading-tight truncate">
                  {card.quantity > 1 ? `${card.quantity}x ` : ''}{product?.name}
                </h2>
                <Badge color={card.status === 'actif' ? 'success' : card.status === 'en_attente' ? 'warning' : 'neutral'}>
                  {cardStatusLabel(card.status)}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <Badge color="primary">{productTypeLabel(product?.product_type)}</Badge>
                <span className="text-[11px] text-muted">{card.period_label}</span>
              </div>

              <p className="text-xs text-muted line-clamp-2">{product?.description}</p>
            </div>
          </div>
        </div>

        {/* Infos pratiques */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="card p-3">
            <p className="text-xs text-muted mb-1 flex items-center gap-1">
              <Tag size={12} /> Mise quotidienne
            </p>
            <p className="font-mono font-semibold">{formatFCFA(card.locked_price_per_day)}</p>
          </div>
          <div className="card p-3">
            <p className="text-xs text-muted mb-1 flex items-center gap-1">
              <UserCheck size={12} /> Collecteur
            </p>
            <p className="font-semibold truncate">{collector?.name || '—'}</p>
          </div>
          {card.activated_at && (
            <div className="card p-3 col-span-2">
              <p className="text-xs text-muted mb-1 flex items-center gap-1">
                <Calendar size={12} /> Activée le
              </p>
              <p className="font-semibold">{formatDate(card.activated_at)}</p>
            </div>
          )}
        </div>

        {/* Progression globale */}
        <div className="card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted font-semibold uppercase tracking-wide text-[10px]">
              {isYear ? `Progression globale (${card.total_months || 12} mois)` : 'Progression globale'}
            </span>
            <span className="font-mono font-bold">
              {globalFilled} / {globalTotal} j ({globalPercent}%)
            </span>
          </div>
          <ProgressBar value={globalPercent} />
        </div>

        {/* Grille 31 cases + sélecteur de mois (si 1 an) */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wide">
              {isYear ? `Mois ${selectedMonth} · 31 jours` : 'Mises 31 jours'}
            </span>

            <div className="flex items-center gap-2">
              {isYear && (
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  className="text-xs font-semibold pl-2 pr-1 py-1.5 rounded-lg border border-outline bg-card-light dark:bg-card-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark cursor-pointer"
                >
                  {Array.from({ length: card.total_months || 12 }, (_, i) => i + 1).map(m => {
                    const done = m <= (card.months_completed || 0);
                    const isCurrent = m === (card.current_month || 1);
                    const suffix = done ? ' ✓' : isCurrent ? ' ●' : ' 🔒';
                    return (
                      <option key={m} value={m}>
                        Mois {m}{suffix}
                      </option>
                    );
                  })}
                </select>
              )}
              <span className="font-mono text-xs font-bold">
                {filledInMonth}/{days.length}
              </span>
            </div>
          </div>

          <Card31 days={days} readOnly compact />

          <div className="space-y-1.5 pt-1">
            <ProgressBar value={monthPercent} />
            <div className="flex justify-between text-xs text-muted">
              <span>Mois {selectedMonth}</span>
              <span>{filledInMonth}/{days.length} jours · {monthPercent}%</span>
            </div>
          </div>
        </div>

        {card.status === 'en_attente' && (
          <div className="mt-4">
            <Button
              variant="ghost"
              className="w-full text-red-500 border-red-500/30"
              onClick={async () => {
                if (!confirm("Voulez-vous vraiment annuler cette demande ?")) return;
                const { deleteCard } = await import('../../lib/mockStore');
                const res = await deleteCard(card.id);
                if (res?.success) nav('/client');
              }}
            >
              Annuler la demande
            </Button>
          </div>
        )}

      </div>
    </>
  );
}