import { useState } from 'react';
import { Sparkles, Check, X, Package, Clock, Loader2 } from 'lucide-react';
import { useMockStore, updateCustomOrder } from '../../lib/mockStore';
import { formatDateTime, formatFCFA, cx } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const STATUS_META = {
  en_attente: { label: 'En attente', color: 'warning' },
  acceptee: { label: 'Acceptée', color: 'success' },
  refusee: { label: 'Refusée', color: 'danger' },
  ajoutee: { label: 'Ajoutée au catalogue', color: 'primary' },
};

const PRODUCT_TYPES = [
  { key: '1_mois', label: '1 mois' },
  { key: '1_an', label: '1 an' },
];

export default function Commandes() {
  const store = useMockStore();
  const [filterStatus, setFilterStatus] = useState('en_attente');
  const [actionModal, setActionModal] = useState(null);
  const [note, setNote] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price_per_day: '',
    product_type: '1_mois',
    photo_url: null,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const filtered = store.customOrders.filter(o => o.status === filterStatus);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function openModal(order, action) {
    setActionModal({ order, action });
    setNote('');
    setProductForm({
      name: order.description.slice(0, 60),
      description: order.description,
      price_per_day: order.estimated_price ? Math.round(order.estimated_price / 31) : '',
      product_type: '1_mois',
      photo_url: order.photos?.[0] || null,
    });
  }

  async function submit() {
    if (!actionModal || loading) return;
    const { order, action } = actionModal;

    const mapping = {
      accept: { status: 'acceptee', label: 'acceptée' },
      add: { status: 'ajoutee', label: 'ajoutée au catalogue' },
      reject: { status: 'refusee', label: 'refusée' },
    };
    const m = mapping[action];
    if (!m) return;

    if (action === 'reject' && !note.trim()) return;
    if (action === 'add' && (!productForm.name || !productForm.price_per_day)) return;

    setLoading(true);

    const productData = action === 'add' ? {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price_per_day: parseInt(productForm.price_per_day, 10),
      product_type: productForm.product_type,
      photo_url: productForm.photo_url,
    } : null;

    const res = await updateCustomOrder(order.id, {
      status: m.status,
      adminResponse: note.trim() || null,
      productData,
    });

    setLoading(false);

    if (res?.error) {
      alert('Erreur : ' + res.error);
      return;
    }

    showToast(`✅ Commande ${m.label}`);
    setActionModal(null);
    setNote('');
    setProductForm({ name: '', description: '', price_per_day: '', product_type: '1_mois', photo_url: null });
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

        {/* Filtres statut */}
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {Object.entries(STATUS_META).map(([k, v]) => {
            const count = store.customOrders.filter(o => o.status === k).length;
            return (
              <button
                key={k}
                onClick={() => setFilterStatus(k)}
                className={cx(
                  'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition min-h-[40px] flex items-center gap-2',
                  filterStatus === k
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'bg-black/5 dark:bg-white/10 text-muted'
                )}
              >
                {v.label}
                <span className={cx(
                  'text-[10px] font-bold rounded-full px-1.5 py-0.5',
                  filterStatus === k ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'
                )}>
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

                {/* Photos */}
                {order.photos?.length > 0 && (
                  <div className="flex gap-1.5 overflow-x-auto">
                    {order.photos.slice(0, 3).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover border border-outline/40 shrink-0"
                      />
                    ))}
                    {order.photos.length > 3 && (
                      <div className="w-16 h-16 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs font-mono text-muted shrink-0">
                        +{order.photos.length - 3}
                      </div>
                    )}
                  </div>
                )}

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
                      onClick={() => openModal(order, 'add')}
                      className="p-2 rounded-lg bg-primary-light/10 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark text-xs font-semibold min-h-[48px] flex flex-col items-center justify-center gap-0.5"
                    >
                      <Package size={14} /> Ajouter
                    </button>
                    <button
                      onClick={() => openModal(order, 'accept')}
                      className="p-2 rounded-lg bg-secondary-light/10 dark:bg-secondary-dark/20 text-secondary-light dark:text-secondary-dark text-xs font-semibold min-h-[48px] flex flex-col items-center justify-center gap-0.5"
                    >
                      <Check size={14} /> Accepter
                    </button>
                    <button
                      onClick={() => openModal(order, 'reject')}
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

      {/* ============================================================ */}
      {/* MODAL ACTION                                                  */}
      {/* ============================================================ */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-card-light dark:bg-card-dark w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto">
            <h2 className="font-heading font-bold text-lg mb-3">
              {actionModal.action === 'add' && 'Ajouter au catalogue'}
              {actionModal.action === 'accept' && 'Accepter la commande'}
              {actionModal.action === 'reject' && 'Refuser la commande'}
            </h2>

            <p className="text-sm text-muted mb-3">
              Commande de <b className="text-content-light dark:text-content-dark">
                {store.users.find(u => u.id === actionModal.order.client_id)?.name}
              </b>
            </p>

            {/* Formulaire produit (uniquement pour "add") */}
            {actionModal.action === 'add' && (
              <div className="space-y-3 mb-4 p-3 rounded-xl bg-primary-light/5 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/40">
                <p className="text-xs font-semibold text-primary-light dark:text-primary-dark uppercase tracking-wide">
                  Détails du nouveau produit
                </p>

                <div>
                  <label className="text-xs text-muted">Nom du produit *</label>
                  <input
                    className="input mt-1"
                    value={productForm.name}
                    onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ex : Congélateur 150L"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted">Description *</label>
                  <textarea
                    className="input mt-1 min-h-[60px] resize-none"
                    value={productForm.description}
                    onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted">Prix / jour (FCFA) *</label>
                    <input
                      className="input mt-1"
                      type="number"
                      value={productForm.price_per_day}
                      onChange={e => setProductForm(p => ({ ...p, price_per_day: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted">Type</label>
                    <select
                      className="input mt-1"
                      value={productForm.product_type}
                      onChange={e => setProductForm(p => ({ ...p, product_type: e.target.value }))}
                    >
                      {PRODUCT_TYPES.map(t => (
                        <option key={t.key} value={t.key}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {productForm.photo_url && (
                  <img
                    src={productForm.photo_url}
                    alt=""
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
              </div>
            )}

            {/* Note / Raison */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-muted">
                {actionModal.action === 'reject' ? 'Raison du refus *' : 'Message au client (facultatif)'}
              </label>
              <textarea
                className="input mt-1 min-h-[80px] resize-none text-sm"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={actionModal.action === 'reject' ? 'Expliquez pourquoi…' : 'Message au client…'}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setActionModal(null)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                className={cx('flex-1', actionModal.action === 'reject' && 'bg-red-500 hover:bg-red-600')}
                onClick={submit}
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}