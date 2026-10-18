import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Info } from 'lucide-react';
import { useMockStore, addProduct } from '../../lib/mockStore';
import { formatFCFA, productTypeLabel } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ImageUpload from '../../components/ui/ImageUpload';
import ProductImage from '../../components/ui/ProductImage';

const TYPES = [
  { key: '1_mois', label: '1 mois (31 jours)', hint: 'Client reçoit immédiatement, paie sur 31 jours' },
  { key: '1_an', label: '1 an (12 mois × 31 jours)', hint: 'Client paie tout avant de recevoir' },
];

export default function NouveauProduit() {
  const nav = useNavigate();
  const store = useMockStore();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price_per_day: '',
    product_type: '1_mois',
    is_active: true,
    photo_url: null,
  });
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function submit(e) {
    e.preventDefault();
    setErr('');
    if (!form.name.trim()) return setErr('Le nom est obligatoire.');
    if (!form.description.trim()) return setErr('La description est obligatoire.');
    const price = parseInt(form.price_per_day, 10);
    if (!price || price <= 0) return setErr('Prix/jour invalide.');

    // TODO Supabase : INSERT INTO products + upload photo dans Storage
    addProduct({
      name: form.name.trim(),
      description: form.description.trim(),
      price_per_day: price,
      duration_days: form.product_type === '1_an' ? 372 : 31,
      product_type: form.product_type,
      is_active: form.is_active,
      photo_url: form.photo_url,
    });

    setDone(true);
  }

  if (done) {
    return (
      <>
        <Header title="Produit créé" />
        <div className="p-6 max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-secondary-light/15 dark:bg-secondary-dark/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} className="text-secondary-light dark:text-secondary-dark" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold mb-3">Produit ajouté !</h1>
          <p className="text-muted mb-8">
            <b>{form.name}</b> est désormais visible dans le catalogue client.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => nav('/admin/produits')}>Voir tous les produits</Button>
            <Button variant="ghost" onClick={() => {
              setDone(false);
              setForm({ name: '', description: '', price_per_day: '', product_type: '1_mois', is_active: true, photo_url: null });
            }}>
              Créer un autre
            </Button>
          </div>
        </div>
      </>
    );
  }

  const previewProduct = {
    id: 'preview',
    name: form.name || 'Nom du produit',
    description: form.description || 'Description…',
    price_per_day: parseInt(form.price_per_day, 10) || 0,
    product_type: form.product_type,
    photo_url: form.photo_url,
  };

  return (
    <>
      <Header title="Nouveau produit" />
      <div className="p-4 max-w-lg mx-auto space-y-4">
        <Link to="/admin/produits" className="flex items-center gap-2 text-sm text-muted">
          <ArrowLeft size={16} /> Retour
        </Link>

        <form onSubmit={submit} className="card space-y-4">
          <ImageUpload
            label="Image du produit"
            value={form.photo_url}
            onChange={url => set('photo_url', url)}
            folder="products"
          />

          <div>
            <label className="text-xs font-semibold text-muted">Nom du produit *</label>
            <input
              className="input mt-1"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Ex : Moto 150cc"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted">Description courte *</label>
            <textarea
              className="input mt-1 min-h-[80px] resize-none"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Ex : Moto robuste pour le transport urbain."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted">Type de produit *</label>
            <div className="grid gap-2 mt-1">
              {TYPES.map(t => (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => set('product_type', t.key)}
                  className={`text-left p-3 rounded-xl border-2 transition ${form.product_type === t.key
                      ? 'border-primary-light dark:border-primary-dark bg-primary-light/10 dark:bg-primary-dark/20'
                      : 'border-outline/40 hover:border-primary-light/40'
                    }`}
                >
                  <p className="font-semibold text-sm">{t.label}</p>
                  <p className="text-xs text-muted mt-0.5">{t.hint}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted">Prix/jour (FCFA) *</label>
            <div className="relative mt-1">
              <input
                className="input pr-16"
                type="number"
                value={form.price_per_day}
                onChange={e => set('price_per_day', e.target.value)}
                placeholder="Ex : 500"
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
            <span className="text-sm">Activer immédiatement</span>
          </label>

          <div className="rounded-xl bg-primary-light/10 dark:bg-primary-dark/15 p-3">
            <div className="flex items-start gap-2 text-xs text-muted">
              <Info size={14} className="shrink-0 mt-0.5 text-primary-light dark:text-primary-dark" />
              <p>
                Les frais de carte (200 FCFA) et de livraison (1 000 FCFA pour 1 mois) sont
                automatiquement appliqués côté client.
              </p>
            </div>
          </div>

          {err && <p className="text-sm text-red-500">{err}</p>}

          <Button type="submit" className="w-full">Créer le produit</Button>
        </form>

        {/* Aperçu live */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
            Aperçu côté client
          </p>
          <div className="card">
            <ProductImage product={previewProduct} className="mb-3" />
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-heading font-bold truncate">{previewProduct.name}</h3>
              <Badge color="primary">{productTypeLabel(form.product_type)}</Badge>
            </div>
            <p className="text-xs text-muted line-clamp-2 mb-3">{previewProduct.description}</p>
            <p className="text-lg font-mono font-bold">
              {formatFCFA(previewProduct.price_per_day)}
              <span className="text-xs text-muted font-body"> / jour</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}