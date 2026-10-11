import { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CreditCard, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMockStore, addCard, addNotification } from '../../lib/mockStore';
import { formatFCFA, productTypeLabel } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProductImage from '../../components/ui/ProductImage';

export default function NouvelleCarte() {
  const { clientId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const store = useMockStore();

  const [picked, setPicked] = useState(null);
  const [success, setSuccess] = useState(null);

  const client = useMemo(() => {
    if (!user || !clientId) return null;
    return store.users.find(u => u.id === clientId && u.collector_id === user.id) || null;
  }, [user, clientId, store.users]);

  const produits = useMemo(
    () => store.products.filter(p => p.is_active),
    [store.products]
  );

  // ---- Session expirée ----
  if (!user) {
    return (
      <>
        <Header title="Nouvelle carte" />
        <div className="p-4 max-w-lg mx-auto">
          <div className="card text-center py-8">
            <AlertTriangle size={32} className="mx-auto mb-3 text-amber-500" />
            <p className="text-muted mb-4">Session expirée.</p>
            <Button onClick={() => nav('/connexion')}>Se reconnecter</Button>
          </div>
        </div>
      </>
    );
  }

  // ---- Client introuvable ----
  if (!client) {
    return (
      <>
        <Header title="Nouvelle carte" />
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <Link to="/collecteur" className="flex items-center gap-2 text-sm text-muted">
            <ArrowLeft size={16} /> Retour
          </Link>
          <div className="card text-center py-8">
            <p className="text-muted mb-4">Client introuvable.</p>
            <Button onClick={() => nav('/collecteur')}>Retour à mes clients</Button>
          </div>
        </div>
      </>
    );
  }

  // ---- Écran succès ----
  if (success) {
    return (
      <>
        <Header title="Carte créée" />
        <div className="p-6 max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-secondary-light/15 dark:bg-secondary-dark/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} className="text-secondary-light dark:text-secondary-dark" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold mb-3">Carte créée !</h1>
          <p className="text-muted mb-2">
            Produit : <b className="text-content-light dark:text-content-dark">{success.productName}</b>
          </p>
          <p className="text-muted mb-8 text-sm">
            Statut : <b className="text-amber-600 dark:text-amber-400">En attente d'activation</b>.
            Encaissez les frais de carte (200 FCFA) pour l'activer.
          </p>
          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={() => nav(`/collecteur/client/${client.id}`)}
            >
              Retour au client
            </Button>
          </div>
        </div>
      </>
    );
  }

  // ---- Action ----
  function handlePick(produit) {
    if (!produit) return;
    setPicked(produit);
  }

  function confirm() {
    if (!picked) return;

    // TODO Supabase : INSERT INTO cards + trigger create_card_days()
    const newCard = addCard({
      clientId: client.id,
      product: picked,
      collectorId: user.id,
      lockedPricePerDay: picked.price_per_day,
    });

    // Notification au client
    addNotification({
      userId: client.id,
      type: 'carte_creee',
      message: `Votre collecteur ${user.name} a ouvert une carte ${picked.name}. En attente d'activation (frais de carte 200 FCFA).`,
      link: `/client/carte/${newCard.id}`,
    });

    setPicked(null);
    setSuccess({ productName: picked.name, cardId: newCard.id });
  }

  // ---- Rendu principal ----
  return (
    <>
      <Header title="Ouvrir une carte" />
      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-4">

        <Link
          to={`/collecteur/client/${client.id}`}
          className="flex items-center gap-2 text-sm text-muted"
        >
          <ArrowLeft size={16} /> Retour
        </Link>

        <div className="card">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">
            Ouvrir une carte pour
          </p>
          <p className="font-heading font-bold text-lg">{client.name}</p>
          <p className="text-xs text-muted font-mono">{client.client_number}</p>
        </div>

        {produits.length === 0 && (
          <div className="card text-center py-8">
            <p className="text-muted text-sm">Aucun produit disponible.</p>
          </div>
        )}

        {/* Grille produits — 3 colonnes sur lg+ */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {produits.map(p => {
            const isKit = p.product_type === 'kit';
            return (
              <div key={p.id} className="card flex flex-col gap-3">
                {/* Image produit */}
                <ProductImage product={p} />

                <div>
                  <Badge color="primary">{productTypeLabel(p.product_type)}</Badge>
                </div>

                <div>
                  <h3 className="font-heading font-bold truncate">{p.name}</h3>
                  <p className="text-xs text-muted line-clamp-2 mt-1">{p.description}</p>
                </div>

                {!isKit && (
                  <p className="font-mono font-bold text-lg">
                    {formatFCFA(p.price_per_day)}
                    <span className="text-xs text-muted font-body"> / jour</span>
                  </p>
                )}

                <div className="text-xs space-y-1 pt-2 border-t border-outline/30">
                  <div className="flex justify-between">
                    <span className="text-muted">Frais de carte</span>
                    <span className="font-mono font-semibold">200 FCFA</span>
                  </div>
                  {(p.product_type === '1_mois' || isKit) && (
                    <div className="flex justify-between">
                      <span className="text-muted">Frais de livraison</span>
                      <span className="font-mono font-semibold">1 000 FCFA</span>
                    </div>
                  )}
                </div>

                <Button className="w-full mt-auto" onClick={() => handlePick(p)}>
                  <ShoppingCart size={16} /> Ouvrir la carte
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal confirmation */}
      {picked && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-card-light dark:bg-card-dark w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-light/10 dark:bg-primary-dark/15 flex items-center justify-center shrink-0">
                <CreditCard size={22} className="text-primary-light dark:text-primary-dark" />
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wide">Confirmer</p>
                <p className="font-semibold text-sm">
                  Ouvrir {picked.name} pour {client.name} ?
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-primary-light/10 dark:bg-primary-dark/15 p-3 space-y-1.5 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted">Prix/jour (verrouillé)</span>
                <span className="font-mono font-semibold">{formatFCFA(picked.price_per_day)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Durée</span>
                <span className="font-semibold">{productTypeLabel(picked.product_type)}</span>
              </div>
            </div>

            <p className="text-xs text-muted mb-5">
              La carte sera créée en <b>attente d'activation</b>. Vous devrez confirmer l'encaissement
              des frais de carte 200 FCFA pour l'activer.
            </p>

            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setPicked(null)}>
                Annuler
              </Button>
              <Button className="flex-1" onClick={confirm}>Confirmer</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}