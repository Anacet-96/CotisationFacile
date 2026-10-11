import { useState } from 'react';
import { Sparkles, Check, X, Package, Clock } from 'lucide-react';
import { useMockStore, updateCustomOrder } from '../../lib/mockStore';
import { formatDateTime, formatFCFA } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const STATUS_META = {
  en_attente: { label: 'En attente', color: 'warning' },
  acceptee: { label: 'Acceptée', color: 'success' },
  refusee: { label: 'Refusée', color: 'danger' },
  ajoutee: { label: 'Ajoutée au catalogue', color: 'primary' },
};

export default function Commandes() {
  const store = useMockStore();
  const [filterStatus, setFilterStatus] = useState('en_attente');
  const [actionModal, setActionModal] = useState(null); // { order, action: 'accept' | 'add' | 'reject' }
  const [note, setNote] = useState('');
  const [toast, setToast] = useState(null);

  const filtered = store.customOrders.filter(o => o.status === filterStatus);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function submit() {
    if (!actionModal) return;
    const { order, action } = actionModal;

    const mapping = {
      accept: { status: 'acceptee', label: 'acceptée' },
      add: { status: 'ajoutee', label: 'ajoutée au catalogue' },
      reject: { status: 'refusee', label: 'refusée' },
    };
    const m = mapping[action];
    if (!m) return;
    if (action === 'reject' && !note.trim()) return;

    // TODO Supabase : UPDATE custom_orders + INSERT notification
    updateCustomOrder(order.id, {
      status: m.status,
      adminResponse: note.trim() || null,
    });

    showToast(`✅ Commande ${m.label}`);
    setActionModal(null);
    setNote('');
  }

  return (
    <>
      <Header title="Commandes personnalisées" />

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%]">
          <div className="rounded-xl bg-secondary-light dark:bg-secondary-dark text-white px-4 py-3 shadow-lg text-sm font-medium">
            {toast}
          </div>
        </div>
      )}

      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-4">

        {/* Onglets statut */}
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {Object.entries(STATUS_META).map(([k, v]) => {
            const count = store.customOrders.filter(o => o.status === k).length;
            return (
              <button
                key={k}
                onClick={() => setFilterStatus(k)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition min-h-[40px] flex items-center gap-2 ${
                  filterStatus === k
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'bg-black/5 dark:bg-white/10 text-muted'
                }`}
              >
                {v.label}
                <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                  filterStatus === k ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="card text-center py-10">
            <Sparkles size={32} className="mx-auto mb-3 text-muted" />
            <p className="text-muted text-sm">Aucune commande dans cet état.</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(order => {
            const client = store.users.find(u => u.id === order.client_id);
            const meta = STATUS_META[order.status];
            return (
              <div key={order.id} className="card flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-heading font-bold truncate">{client?.name || '—'}</p>
                    <p className="text-xs text-muted font-mono">{client?.client_number}</p>
                  </div>
                  <Badge color={meta.color}>{meta.label}</Badge>
                </div>

                <div className="rounded-xl bg-black/5 dark:bg-white/5 p-3">
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm">{order.description}</p>
                </div>

                {order.estimated_price > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Prix estimé</span>
                    <span className="font-mono font-semibold">{formatFCFA(order.estimated_price)}</span>
                  </div>
                )}

                <p className="text-xs text-muted">{formatDateTime(order.created_at)}</p>

                {order.admin_response && (
                  <p className="text-xs text-muted italic border-l-2 border-outline/40 pl-2">
                    Réponse : {order.admin_response}
                  </p>
                )}

                {order.status === 'en_attente' && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-outline/30">
                    <button
                      onClick={() => setActionModal({ order, action: 'add' })}
                      className="p-2 rounded-lg bg-primary-light/10 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark text-xs font-semibold min-h-[48px] flex flex-col items-center justify-center gap-0.5"
                    >
                      <Package size={14} /> Ajouter
                    </button>
                    <button
                      onClick={() => setActionModal({ order, action: 'accept' })}
                      className="p-2 rounded-lg bg-secondary-light/10 dark:bg-secondary-dark/20 text-secondary-light dark:text-secondary-dark text-xs font-semibold min-h-[48px] flex flex-col items-center justify-center gap-0.5"
                    >
                      <Check size={14} /> Accepter
                    </button>
                    <button
                      onClick={() => setActionModal({ order, action: 'reject' })}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-semibold min-h-[48px] flex flex-col items-center justify-center gap-0.5"
                    >
                      <X size={14} /> Refuser
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal action */}
      {actionModal && (
        <Modal
          open
          onClose={() => { setActionModal(null); setNote(''); }}
          title={
            actionModal.action === 'add'
              ? 'Ajouter au catalogue'
              : actionModal.action === 'accept'
                ? 'Accepter la commande'
                : 'Refuser la commande'
          }
          footer={
            <>
              <Button variant="ghost" className="flex-1" onClick={() => { setActionModal(null); setNote(''); }}>
                Annuler
              </Button>
              <Button
                className={`flex-1 ${actionModal.action === 'reject' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                disabled={actionModal.action === 'reject' && !note.trim()}
                onClick={submit}
              >
                Confirmer
              </Button>
            </>
          }
        >
          <p className="text-sm text-muted mb-3">
            Commande de <b className="text-content-light dark:text-content-dark">
              {store.users.find(u => u.id === actionModal.order.client_id)?.name}
            </b> :
          </p>
          <p className="text-sm italic mb-4 p-3 rounded-xl bg-black/5 dark:bg-white/5">
            {actionModal.order.description}
          </p>

          <label className="text-xs font-semibold text-muted">
            {actionModal.action === 'reject' ? 'Raison du refus *' : 'Message (facultatif)'}
          </label>
          <textarea
            className="input mt-1 min-h-[80px] resize-none text-sm"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={actionModal.action === 'reject' ? 'Expliquez pourquoi…' : 'Message au client…'}
          />

          {actionModal.action === 'add' && (
            <p className="text-xs text-muted mt-3">
              Le produit sera créé dans le catalogue et visible par tous les clients.
              Pensez à le compléter (prix, description, type) depuis <b>Produits</b>.
            </p>
          )}
        </Modal>
      )}
    </>
  );
}