import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, TrendingUp, Truck,
  CreditCard, Calendar, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMockStore } from '../../lib/mockStore';
import { getDayAccounting } from '../../lib/secretaireHelpers';
import { formatFCFA, formatDate } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';

export default function JourneeDetail() {
  const { date } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const store = useMockStore();

  // Vérifie si la journée est bien validée
  const validation = store.dailyValidations.find(
    v => v.collector_id === user.id && v.date === date
  );

  const accounting = getDayAccounting(
    user.id,
    date,
    store.cards,
    store.cardDays,
    store.products,
    store.users
  );

  const dateLabel = new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <>
      <Header title="Détail de la journée" />
      <div className="p-4 max-w-lg mx-auto lg:max-w-4xl space-y-4">

        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm text-muted">
          <ArrowLeft size={16} /> Retour
        </button>

        {/* Bandeau de confirmation */}
        <div className={validation 
          ? "card border-2 border-secondary-light/40 dark:border-secondary-dark/50 bg-secondary-light/5 dark:bg-secondary-dark/10"
          : "card border-2 border-amber-500/40 bg-amber-500/5"
        }>
          <div className="flex items-start gap-3">
            {validation ? (
              <CheckCircle2 size={24} className="text-secondary-light dark:text-secondary-dark shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={24} className="text-amber-500 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-heading font-bold text-base">
                Journée du <span className="capitalize">{dateLabel}</span>
              </p>
              <p className="text-xs text-muted mt-0.5">
                {validation 
                  ? `Validée par la secrétaire le ${formatDate(validation.validated_at)}.`
                  : "Cette journée n'a pas encore été validée par la secrétaire."}
              </p>
            </div>
          </div>
        </div>

        {/* Total de la journée */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-light to-indigo-700 dark:from-primary-dark dark:to-indigo-600 text-white p-5 shadow-lg">
          <p className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">
            Total général encaissé
          </p>
          <p className="font-mono font-extrabold text-3xl mt-1">
            {formatFCFA(accounting.grandTotal)}
          </p>
        </div>

        {/* Tableaux (identiques à la vue secrétaire) */}
        <AccountTable
          icon={CreditCard}
          title="Cartes vendues"
          columns={['N° client', 'Client', 'Produit', 'Frais']}
          rows={accounting.cards.rows.map(r => [
            <span key="1" className="font-mono text-xs">{r.client_number}</span>,
            r.client_name,
            r.product_name,
            <span key="2" className="font-mono font-semibold">200 FCFA</span>,
          ])}
          total={accounting.cards.total}
        />

        <AccountTable
          icon={TrendingUp}
          title="Mises reçues"
          columns={['N° client', 'Client', 'Carte (mises)', 'Total payé']}
          rows={accounting.mises.rows.map(r => [
            <span key="1" className="font-mono text-xs">{r.client_number}</span>,
            r.client_name,
            <span key="2">{r.card_display}</span>,
            <span key="3" className="font-mono font-semibold">{formatFCFA(r.total_paid)}</span>,
          ])}
          total={accounting.mises.total}
        />

        <AccountTable
          icon={Truck}
          title="Livraisons"
          columns={['N° client', 'Client', 'Produit', 'Montant']}
          rows={accounting.livraisons.rows.map(r => [
            <span key="1" className="font-mono text-xs">{r.client_number}</span>,
            r.client_name,
            r.product_name,
            <span key="2" className="font-mono font-semibold">1 000 FCFA</span>,
          ])}
          total={accounting.livraisons.total}
        />

      </div>
    </>
  );
}

// ============================================================
function AccountTable({ icon: Icon, title, columns, rows, total }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-muted" />
        </div>
        <h3 className="font-heading font-bold text-base leading-tight">{title}</h3>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-muted py-3 text-center">Aucune opération.</p>
      ) : (
        <>
          <div className="hidden sm:block overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-outline/30">
                  {columns.map((c, i) => (
                    <th key={i} className="py-2 pr-3 font-semibold whitespace-nowrap">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-outline/20 last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="py-2.5 pr-3 align-middle">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden space-y-2">
            {rows.map((row, i) => (
              <div key={i} className="rounded-xl bg-black/5 dark:bg-white/5 p-3 space-y-1">
                {row.map((cell, j) => (
                  <div key={j} className="flex justify-between gap-3 text-xs">
                    <span className="text-muted shrink-0">{columns[j]}</span>
                    <span className="text-right truncate">{cell}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {rows.length > 0 && (
        <div className="mt-3 pt-3 border-t border-outline/30 flex justify-between items-center">
          <span className="font-semibold text-sm">Total</span>
          <span className="font-mono font-bold text-base">
            {formatFCFA(total)}
          </span>
        </div>
      )}
    </div>
  );
}