import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Info, ShoppingCart, Sparkles, Search, CheckCircle2, Loader2, Minus, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMockStore, addCard, addNotification } from '../../lib/mockStore';
import { formatFCFA, productTypeLabel, cx } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProductImage from '../../components/ui/ProductImage';

const FILTRES = [
  { key: 'tous', label: 'Tous' },
  { key: '1_mois', label: '1 mois' },
  { key: '1_an', label: '1 an' },
  { key: 'kit', label: 'Kit ravitaillement' },
];

export default function Produits() {
  const { user } = useAuth();
  const nav = useNavigate();
  const store = useMockStore();
  const [filtre, setFiltre] = useState('tous');
  const [query, setQuery] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // État pour la modale de sélection
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const produits = useMemo(() => {
    return store.products.filter(p => {
      if (!p.is_active) return false;
      if (filtre !== 'tous' && p.product_type !== filtre) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [store.products, filtre, query]);

  function openModal(product) {
    setSelectedProduct(product);
    setQuantity(1);
  }

  function closeModal() {
    if (loading) return;
    setSelectedProduct(null);
  }

  async function confirmDemande() {
    if (loading || !selectedProduct) return;

    const collectorId = user?.collector_id;
    if (!collectorId) {
      alert("Aucun collecteur ne vous est encore assigné. Patientez, la secrétaire va vous en attribuer un.");
      return;
    }

    setLoading(true);

    const newCard = await addCard({
      clientId: user.id,
      product: selectedProduct,
      collectorId,
      quantity: quantity,
      lockedPricePerDay: selectedProduct.price_per_day,
    });

    if (!newCard) {
      setLoading(false);
      alert("Erreur lors de la création. Regarde la console.");
      return;
    }

    const collector = store.users.find(u => u.id === collectorId);
    const qtyLabel = quantity > 1 ? `${quantity}x ` : '';

    await addNotification({
      userId: user.id,
      type: 'carte_creee',
      message: `Vous avez demandé ${qtyLabel}${selectedProduct.name}. Votre collecteur ${collector?.name || ''} va vous contacter.`,
      link: `/client/carte/${newCard.id}`,
    });

    await addNotification({
      userId: collectorId,
      type: 'nouvelle_demande_client',
      message: `${user.name} a demandé ${qtyLabel}${selectedProduct.name}. À valider.`,
      link: `/collecteur/client/${user.id}`,
    });

    setLoading(false);
    setSelectedProduct(null);
    setSuccess({ productName: `${qtyLabel}${selectedProduct.name}` });
  }

  if (success) {
    return (
      <>
        <Header title="Demande envoyée" />
        <div className="p-6 max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-secondary-light/15 dark:bg-secondary-dark/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} className="text-secondary-light dark:text-secondary-dark" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold mb-3">Demande envoyée !</h1>
          <p className="text-muted mb-2">
            Produit : <b className="text-content-light dark:text-content-dark">{success.productName}</b>
          </p>
          <p className="text-muted text-sm mb-8">
            Votre collecteur va vous contacter pour activer la carte (frais de carte 200 FCFA).
          </p>
          <div className="space-y-2">
            <Button className="w-full" onClick={() => nav('/client')}>
              Voir mes cartes
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setSuccess(null)}>
              Continuer à explorer
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Catalogue" />
      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-4">

        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/comment-ca-marche"
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-black/5 dark:bg-white/5 text-sm font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition min-h-[48px]"
          >
            <Info size={16} className="text-primary-light dark:text-primary-dark" />
            Comment ça marche
          </Link>
          <Link
            to="/client/commande-personnalisee"
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-light/10 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark text-sm font-semibold hover:bg-primary-light/20 dark:hover:bg-primary-dark/30 transition min-h-[48px]"
          >
            <Sparkles size={16} />
            Commander sur-mesure
          </Link>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            className="input pl-11"
            placeholder="Rechercher un produit…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {FILTRES.map(f => (
            <button
              key={f.key}
              onClick={() => setFiltre(f.key)}
              className={cx(
                'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition min-h-[40px]',
                filtre === f.key
                  ? 'bg-primary-light dark:bg-primary-dark text-white'
                  : 'bg-black/5 dark:bg-white/10 text-muted'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {produits.length === 0 && (
          <p className="text-center text-muted text-sm py-8">Aucun produit trouvé.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {produits.map(p => {
            const isKit = p.product_type === 'kit';
            const needsDelivery = p.product_type === '1_mois' || p.product_type === 'kit';
            return (
              <div key={p.id} className="card flex flex-col">
                <ProductImage product={p} className="mb-3" />

                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="font-heading font-bold truncate">{p.name}</h3>
                  <Badge color="primary">{productTypeLabel(p.product_type)}</Badge>
                </div>

                <p className="text-xs text-muted mb-3 line-clamp-2 flex-1">{p.description}</p>

                {!isKit && (
                  <p className="text-lg font-mono font-bold mb-3">
                    {formatFCFA(p.price_per_day)}
                    <span className="text-xs text-muted font-body"> / jour</span>
                  </p>
                )}

                <p className="text-xs text-muted mb-3">
                  {p.product_type === '1_mois' && 'Recevez le produit immédiatement, payez sur 31 jours.'}
                  {p.product_type === '1_an' && 'Payez sur 12 mois avant de recevoir votre produit.'}
                  {p.product_type === 'kit' && 'Composez votre kit, payez avant réception.'}
                </p>

                <div className="text-xs space-y-1 mb-3 border-t border-outline/30 pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted">Frais de carte</span>
                    <span className="font-mono font-semibold">200 FCFA</span>
                  </div>
                  {needsDelivery && (
                    <div className="flex justify-between">
                      <span className="text-muted">Frais de livraison</span>
                      <span className="font-mono font-semibold">1 000 FCFA</span>
                    </div>
                  )}
                </div>

                {isKit ? (
                  <Link to={`/client/produits/kit/${p.id}`} className="btn-primary w-full mt-auto">
                    <ShoppingCart size={18} /> Composer mon kit
                  </Link>
                ) : (
                  <Button className="w-full mt-auto" onClick={() => openModal(p)}>
                    Demander ce produit
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODALE DE SÉLECTION DE QUANTITÉ */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-card-light dark:bg-card-dark w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5">
            <h2 className="font-heading font-bold text-lg mb-1">Demander ce produit</h2>
            <p className="text-sm text-muted mb-4">{selectedProduct.name}</p>

            <div className="mb-6">
              <label className="text-xs font-semibold text-muted block mb-2">Nombre de produits</label>
              <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 rounded-xl p-2">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg bg-white dark:bg-card-dark flex items-center justify-center shadow-sm disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <Minus size={18} />
                </button>
                <span className="font-mono font-bold text-xl">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-lg bg-white dark:bg-card-dark flex items-center justify-center shadow-sm"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-primary-light/10 dark:bg-primary-dark/15 p-3 space-y-1.5 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-muted">Prix unitaire/jour</span>
                <span className="font-mono font-semibold">{formatFCFA(selectedProduct.price_per_day)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-primary-light/20 dark:border-primary-dark/20">
                <span className="font-semibold">Nouvelle mise/jour</span>
                <span className="font-mono font-bold text-primary-light dark:text-primary-dark">
                  {formatFCFA(selectedProduct.price_per_day * quantity)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={closeModal} disabled={loading}>
                Annuler
              </Button>
              <Button className="flex-1" onClick={confirmDemande} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}