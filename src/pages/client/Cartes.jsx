import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Plus, Check, Lock, CreditCard, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMockStore, deleteCard } from '../../lib/mockStore';
import { formatFCFA, cx, cardStatusLabel, getCardDaysForMonth } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Card31 from '../../components/ui/Card31';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import ProductImage from '../../components/ui/ProductImage';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export default function Cartes() {
  const { user } = useAuth();
  const store = useMockStore();
  const [cardToDelete, setCardToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const myCards = store.cards.filter(c => c.client_id === user.id);
  const collector = store.users.find(u => u.id === user?.collector_id);
  const firstname = (user?.name || '').split(' ')[0];

  async function confirmDelete() {
    if (!cardToDelete || loading) return;
    setLoading(true);
    const res = await deleteCard(cardToDelete.id);
    setLoading(false);
    if (res?.success) {
      setCardToDelete(null);
    } else {
      alert("Erreur lors de l'annulation.");
    }
  }

  return (
    <>
      <Header title="Mes cartes" />
      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-5">

        {/* Bannière */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-light to-indigo-700 dark:from-primary-dark dark:to-indigo-600 text-white p-5 shadow-lg">
          <p className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">
            Espace client
          </p>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold mb-1">
            Bonjour, {firstname} 👋
          </h2>
          <p className="text-sm opacity-90 max-w-md">
            Suivez en temps réel l'avancement de vos cartes de cotisation journalière.
          </p>

          {collector && (
            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold opacity-70 uppercase tracking-wide">
                  Votre collecteur
                </p>
                <p className="font-semibold">{collector.name}</p>
                <p className="text-xs opacity-80 font-mono">{collector.phone}</p>
              </div>
              <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
                <UserCheck size={20} />
              </div>
            </div>
          )}
        </div>

        {/* Titre section */}
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2">
            <CreditCard size={20} className="text-primary-light dark:text-primary-dark" />
            Mes cartes
            <span className="text-muted font-normal text-sm">({myCards.length})</span>
          </h3>
          <Link
            to="/client/produits"
            className="text-sm text-primary-light dark:text-primary-dark font-semibold flex items-center gap-1"
          >
            <Plus size={16} /> Nouvelle demande
          </Link>
        </div>

        {myCards.length === 0 && (
          <div className="card text-center py-10">
            <p className="text-muted text-sm mb-4">Vous n'avez aucune carte pour l'instant.</p>
            <Link to="/client/produits" className="btn-primary inline-flex">
              <Plus size={18} /> Découvrir les produits
            </Link>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myCards.map(card => (
            <CarteItem key={card.id} card={card} store={store} onDelete={() => setCardToDelete(card)} />
          ))}
        </div>
      </div>

      {/* Modal de suppression */}
      <Modal
        open={!!cardToDelete}
        onClose={() => !loading && setCardToDelete(null)}
        title="Annuler la demande"
        footer={
          <>
            <Button variant="ghost" className="flex-1" onClick={() => setCardToDelete(null)} disabled={loading}>
              Non, garder
            </Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={confirmDelete} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={16} /> Oui, supprimer</>}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <Trash2 size={22} className="text-red-500" />
          </div>
          <p className="text-sm">
            Voulez-vous vraiment supprimer définitivement la demande pour <b>{cardToDelete?.quantity > 1 ? `${cardToDelete.quantity}x ` : ''}{store.products.find(p => p.id === cardToDelete?.product_id)?.name}</b> ?
          </p>
        </div>
        <p className="text-xs text-muted">
          Cette action est irréversible. Les frais de carte n'ont pas encore été payés.
        </p>
      </Modal>
    </>
  );
}

// ============================================================
function CarteItem({ card, store, onDelete }) {
  const product = store.products.find(p => p.id === card.product_id);
  const isYear = product?.product_type === '1_an';
  const isKit = product?.product_type === 'kit';
  const currentMonth = card.current_month || 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const days = getCardDaysForMonth(card, store.cardDays, selectedMonth, isYear);
  const filledInMonth = days.filter(d => d.filled).length;

  let globalFilled, globalTotal;
  if (isYear) {
    const monthsCompleted = card.months_completed || 0;
    const totalMonths = card.total_months || 12;
    const filledCurrent = getCardDaysForMonth(card, store.cardDays, currentMonth, true).filter(d => d.filled).length;
    globalFilled = monthsCompleted * 31 + filledCurrent;
    globalTotal = totalMonths * 31;
  } else {
    globalFilled = days.filter(d => d.filled).length;
    globalTotal = days.length || 31;
  }
  const globalPercent = Math.round((globalFilled / globalTotal) * 100);

  const statusColor = card.status === 'actif' ? 'success' : card.status === 'en_attente' ? 'warning' : 'neutral';
  const statusLabel = card.status === 'actif' ? 'Carte active' : card.status === 'en_attente' ? "En attente" : cardStatusLabel(card.status);
  const durationLabel = isYear ? `1 an` : isKit ? 'Kit' : '1 mois';

  return (
    <div className="card flex flex-col gap-3">
      <ProductImage product={product} />

      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Badge color={statusColor}>{statusLabel}</Badge>
          <Badge color="neutral">{durationLabel}</Badge>
        </div>
        <div className="shrink-0 rounded-xl border border-primary-light/30 dark:border-primary-dark/40 px-2.5 py-1 text-right">
          <p className="text-[9px] font-bold uppercase text-muted tracking-wide">Mise / j</p>
          <p className="font-mono font-bold text-primary-light dark:text-primary-dark leading-none text-sm">
            {formatFCFA(card.locked_price_per_day).replace(' FCFA', '')}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-heading font-bold text-lg leading-tight truncate">
            {card.quantity > 1 ? `${card.quantity}x ` : ''}{product?.name}
          </h4>
          {isYear && (
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="shrink-0 text-xs font-semibold pl-2 pr-1 py-1 rounded-lg border border-outline bg-card-light dark:bg-card-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark cursor-pointer"
            >
              {Array.from({ length: card.total_months || 12 }, (_, i) => i + 1).map(m => {
                const done = m <= (card.months_completed || 0);
                const isCurrent = m === (card.current_month || 1);
                const suffix = done ? ' ✓' : isCurrent ? ' ●' : ' 🔒';
                return <option key={m} value={m}>Mois {m}{suffix}</option>;
              })}
            </select>
          )}
        </div>
        <p className="text-xs text-muted mt-0.5">
          <span className="font-mono">{formatFCFA(card.locked_price_per_day)}</span> / jour
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted font-semibold uppercase tracking-wide text-[10px]">
            {isYear ? `Progression (${card.total_months || 12} mois)` : 'Progression'}
          </span>
          <span className="font-mono font-bold">
            {globalFilled}/{globalTotal} ({globalPercent}%)
          </span>
        </div>
        <ProgressBar value={globalPercent} />
      </div>

      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted font-semibold uppercase tracking-wide text-[10px]">
            {isYear ? `Mois ${selectedMonth}` : 'Mises 31 j'} ({filledInMonth}/{days.length})
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted">
            <Lock size={10} /> Lecture
          </span>
        </div>
        <Card31 days={days} readOnly compact />
      </div>

      {card.status === 'en_attente' && (
        <button
          onClick={onDelete}
          className="text-xs font-semibold text-red-500 text-center py-2 hover:bg-red-500/10 rounded-lg transition"
        >
          Annuler cette demande
        </button>
      )}

      <Link to={`/client/carte/${card.id}`} className="btn-ghost w-full mt-1 text-sm">
        Voir le détail <ArrowRight size={16} />
      </Link>
    </div>
  );
}