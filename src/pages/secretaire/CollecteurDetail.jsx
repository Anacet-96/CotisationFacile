import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, TrendingUp, Truck,
  CreditCard, AlertTriangle, Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMockStore, validateDay } from '../../lib/mockStore';
import { getDayAccounting } from '../../lib/secretaireHelpers';
import { formatFCFA, cx, formatDate } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

export default function CollecteurDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const store = useMockStore();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const collector = store.users.find(u => u.id === id && u.role === 'collecteur');

  const accounting = useMemo(
    () =>
      collector
        ? getDayAccounting(
            collector.id,
            todayStr,
            store.cards,
            store.cardDays,
            store.products,
            store.users
          )
        : null,
    [collector, todayStr, store.cards, store.cardDays, store.products, store.users]
  );

  const alreadyValidated = store.dailyValidations.some(
    v => v.collector_id === id && v.date === todayStr
  );

  if (!collector || !accounting) {
    return (
      <>
        <Header title="Collecteur" />
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <Link to="/secretaire/collecteurs" className="flex items-center gap-2 text-sm text-muted">
            <ArrowLeft size={16} /> Retour
          </Link>
          <div className="card text-center py-8">
            <p className="text-muted mb-4">Collecteur introuvable.</p>
            <Link to="/secretaire/collecteurs" className="btn-primary inline-flex">
              Retour à la liste
            </Link>
          </div>
        </div>
      </>
    );
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function confirmValidate() {
    // TODO Supabase : INSERT daily_validations + UPDATE card_days SET is_locked=true
    validateDay(collector.id, todayStr, user.id, accounting.grandTotal);
    setConfirmOpen(false);
    showToast(`✅ Journée validée. ${formatFCFA(accounting.grandTotal)} encaissés.`);
  }

 

  const dateLabel = new Date(todayStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <>
      <Header title={collector.name} />

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%]">
          <div className="rounded-xl bg-secondary-light dark:bg-secondary-dark text-white px-4 py-3 shadow-lg text-sm font-medium">
            {toast}
          </div>
        </div>
      )}

      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-4">

        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm text-muted">
          <ArrowLeft size={16} /> Retour
        </button>

        {/* Bandeau collecteur */}
        <div className="card">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h2 className="font-heading font-bold text-lg">{collector.name}</h2>
              <p className="text-xs text-muted font-mono">{collector.phone}</p>
            </div>
            {alreadyValidated ? (
              <Badge color="success">✅ Journée validée</Badge>
            ) : (
              <Badge color="warning">⏳ En attente</Badge>
            )}
          </div>
          <p className="text-xs text-muted">
            Comptabilité du <b className="capitalize">{dateLabel}</b>
          </p>
        </div>

        {alreadyValidated && (
          <div className="card border-2 border-secondary-light/40 dark:border-secondary-dark/40 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-secondary-light dark:text-secondary-dark shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Journée déjà validée</p>
              <p className="text-xs text-muted mt-0.5">
                Les mises sont verrouillées définitivement. Aucune modification possible.
              </p>
            </div>
          </div>
        )}

        {/* ---------- Tableau 1 : Cartes vendues ---------- */}
        <AccountTable
          icon={CreditCard}
          title="Cartes vendues"
          subtitle={`${accounting.cards.rows.length} carte${accounting.cards.rows.length > 1 ? 's' : ''}`}
          columns={['N° client', 'Nom Prénom', 'Produit', 'Durée', 'Frais']}
          rows={accounting.cards.rows.map(r => [
            <span className="font-mono text-xs">{r.client_number}</span>,
            r.client_name,
            r.product_name,
            r.duration,
            <span className="font-mono font-semibold">200 FCFA</span>,
          ])}
          total={accounting.cards.total}
          totalLabel="Total cartes"
        />

        {/* ---------- Tableau 2 : Mises reçues ---------- */}
        <AccountTable
          icon={TrendingUp}
          title="Mises reçues"
          subtitle={`${accounting.mises.rows.length} ligne${accounting.mises.rows.length > 1 ? 's' : ''}`}
          columns={['N° client', 'Nom Prénom', 'Carte (mises)', 'Total payé']}
          rows={accounting.mises.rows.map(r => [
            <span className="font-mono text-xs">{r.client_number}</span>,
            r.client_name,
            <span>
              {r.card_display}
            </span>,
            <span className="font-mono font-semibold">{formatFCFA(r.total_paid)}</span>,
          ])}
          total={accounting.mises.total}
          totalLabel="Total mises"
        />

        {/* ---------- Tableau 3 : Livraisons ---------- */}
        <AccountTable
          icon={Truck}
          title="Livraisons"
          subtitle={`${accounting.livraisons.rows.length} livraison${accounting.livraisons.rows.length > 1 ? 's' : ''}`}
          columns={['N° client', 'Nom Prénom', 'Produit', 'Montant']}
          rows={accounting.livraisons.rows.map(r => [
            <span className="font-mono text-xs">{r.client_number}</span>,
            r.client_name,
            r.product_name,
            <span className="font-mono font-semibold">1 000 FCFA</span>,
          ])}
          total={accounting.livraisons.total}
          totalLabel="Total livraisons"
        />

        {/* ---------- Total général ---------- */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-light to-indigo-700 dark:from-primary-dark dark:to-indigo-600 text-white p-5 shadow-lg">
          <p className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">
            Total général du jour
          </p>
          <p className="font-mono font-extrabold text-3xl mt-1">
            {formatFCFA(accounting.grandTotal)}
          </p>
          <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="opacity-70">Cartes</p>
              <p className="font-mono font-semibold">{formatFCFA(accounting.cards.total)}</p>
            </div>
            <div>
              <p className="opacity-70">Mises</p>
              <p className="font-mono font-semibold">{formatFCFA(accounting.mises.total)}</p>
            </div>
            <div>
              <p className="opacity-70">Livraisons</p>
              <p className="font-mono font-semibold">{formatFCFA(accounting.livraisons.total)}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
               {/* Action */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1"
            disabled={alreadyValidated || accounting.grandTotal === 0}
            onClick={() => setConfirmOpen(true)}
            title={
              alreadyValidated
                ? 'Journée déjà validée'
                : accounting.grandTotal === 0
                  ? 'Aucune activité ce jour'
                  : ''
            }
          >
            <Check size={18} /> Valider la journée
          </Button>
        </div>

        {!alreadyValidated && accounting.grandTotal === 0 && (
          <p className="text-xs text-center text-muted">
            Aucune activité enregistrée aujourd'hui pour ce collecteur.
          </p>
        )}
      </div>

      {/* ---------- Modal confirmation ---------- */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Valider la journée"
        footer={
          <>
            <Button variant="ghost" className="flex-1" onClick={() => setConfirmOpen(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={confirmValidate}>
              Confirmer
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm">
              Vous confirmez avoir reçu{' '}
              <b className="text-content-light dark:text-content-dark font-mono">
                {formatFCFA(accounting.grandTotal)}
              </b>{' '}
              du collecteur <b>{collector.name}</b> pour la journée du{' '}
              <b>{formatDate(todayStr)}</b> ?
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-700 dark:text-red-400">
          <b>Attention</b> : une fois validée, toutes les mises de cette journée seront{' '}
          <b>verrouillées définitivement</b>. Plus aucune modification ne sera possible.
        </div>
      </Modal>
    </>
  );
}

// ============================================================
function AccountTable({ icon: Icon, title, subtitle, columns, rows, total, totalLabel }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary-light/10 dark:bg-primary-dark/15 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-primary-light dark:text-primary-dark" />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading font-bold text-base leading-tight">{title}</h3>
          <p className="text-[11px] text-muted">{subtitle}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-muted py-4 text-center">Aucun élément.</p>
      ) : (
        <>
          {/* Desktop : vrai tableau */}
          <div className="hidden sm:block overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-outline/30">
                  {columns.map((c, i) => (
                    <th key={i} className="py-2 pr-3 font-semibold whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-outline/20 last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="py-2.5 pr-3 align-middle">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile : cartes empilées */}
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
          <span className="font-semibold text-sm">{totalLabel}</span>
          <span className="font-mono font-bold text-lg text-primary-light dark:text-primary-dark">
            {formatFCFA(total)}
          </span>
        </div>
      )}
    </div>
  );
}