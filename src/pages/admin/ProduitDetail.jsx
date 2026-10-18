import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Power, Trash2, Loader2 } from 'lucide-react';
import { useMockStore, updateProduct, toggleProductActive } from '../../lib/mockStore';
import { productTypeLabel, cx } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ImageUpload from '../../components/ui/ImageUpload';
import ProductImage from '../../components/ui/ProductImage';

const TYPES = [
  { key: '1_mois', label: '1 mois' },
  { key: '1_an', label: '1 an' },
];

export default function ProduitDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const store = useMockStore();
  const product = store.products.find(p => p.id === id);

  const [form, setForm] = useState(() => ({
    name: product?.name || '',
    description: product?.description || '',
    price_per_day: product?.price_per_day || 0,
    product_type: product?.product_type || '1_mois',
    is_active: product?.is_active ?? true,
    photo_url: product?.photo_url || null,
  }));
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!product) {
    return (
      <>
        <Header title="Produit" />
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <Link to="/admin/produits" className="flex items-center gap-2 text-sm text-muted">
            <ArrowLeft size={16} /> Retour
          </Link>
          <div className="card text-center py-8">
            <p className="text-muted mb-4">Produit introuvable.</p>
            <Link to="/admin/produits" className="btn-primary inline-flex">Retour</Link>
          </div>
        </div>
      </>
    );
  }

  if (product.product_type === 'kit') {
    return (
      <>
        <Header title="Produit" />
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <Link to="/admin/produits" className="flex items-center gap-2 text-sm text-muted">
            <ArrowLeft size={16} /> Retour
          </Link>
          <div className="card text-center py-8">
            <p className="text-muted mb-4">Les kits se gèrent depuis l'onglet "Kits".</p>
            <Link to="/admin/produits" className="btn-primary inline-flex">Retour aux produits</Link>
          </div>
        </div>
      </>
    );
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function save() {
    if (loading) return;
    setLoading(true);
    await updateProduct(product.id, {
      name: form.name,
      description: form.description,
      price_per_day: parseInt(form.price_per_day, 10) || 0,
      product_type: form.product_type,
      is_active: form.is_active,
      photo_url: form.photo_url,
    });
    setLoading(false);
    showToast('✅ Produit enregistré.');
  }

  async function handleDeactivate() {
    if (loading) return;
    setLoading(true);
    await toggleProductActive(product.id);
    setLoading(false);
    nav('/admin/produits');
  }

  return (
    <>
      <Header title={product.name} />

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%]">
          <div className="rounded-xl bg-secondary-light dark:bg-secondary-dark text-white px-4 py-3 shadow-lg text-sm font-medium">
            {toast}
          </div>
        </div>
      )}

      <div className="p-4 max-w-lg mx-auto space-y-4">
        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm text-muted">
          <ArrowLeft size={16} /> Retour
        </button>

        {/* Aperçu */}
        <div className="card">
          <div className="flex items-start justify-between gap-2 mb-3">
            <Badge color={product.is_active ? 'success' : 'danger'}>
              {product.is_active ? 'Actif' : 'Désactivé'}
            </Badge>
            <Badge color="primary">{productTypeLabel(form.product_type)}</Badge>
          </div>
          <ProductImage product={form} />
        </div>

        {/* Formulaire */}
        <div className="card space-y-4">
          <ImageUpload
            label="Image du produit"
            value={form.photo_url}
            onChange={url => set('photo_url', url)}
            folder="products"
          />

          <div>
            <label className="text-xs font-semibold text-muted">Nom *</label>
            <input className="input mt-1" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted">Description *</label>
            <textarea
              className="input mt-1 min-h-[80px] resize-none"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted">Type</label>
            <div className="flex gap-2 mt-1">
              {TYPES.map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => set('product_type', t.key)}
                  className={cx(
                    'flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition border-2',
                    form.product_type === t.key
                      ? 'border-primary-light dark:border-primary-dark bg-primary-light/10 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark'
                      : 'border-outline/40 text-muted'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted">Prix/jour (FCFA)</label>
            <div className="relative mt-1">
              <input
                className="input pr-16"
                type="number"
                value={form.price_per_day}
                onChange={e => set('price_per_day', e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted font-mono">
                FCFA
              </span>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => set('is_active', e.target.checked)}
              className="w-4 h-4 accent-primary-light dark:accent-primary-dark"
            />
            <span className="text-sm">Produit actif (visible côté client)</span>
          </label>

          <Button className="w-full" onClick={save} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Enregistrer</>}
          </Button>
        </div>

        {/* Zone danger */}
        <div className="card border-2 border-red-500/30">
          <h3 className="font-heading font-bold mb-2 text-red-500">Zone dangereuse</h3>
          {confirmDelete ? (
            <div className="space-y-2">
              <p className="text-xs text-muted">
                Confirmer ? Le produit sera désactivé. Les cartes existantes continueront de fonctionner.
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setConfirmDelete(false)}>
                  Annuler
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  onClick={handleDeactivate}
                  disabled={loading}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={16} /> Désactiver</>}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full text-red-500"
              onClick={() => setConfirmDelete(true)}
            >
              <Power size={16} /> {product.is_active ? 'Désactiver' : 'Activer'}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}