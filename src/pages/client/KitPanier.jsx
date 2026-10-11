import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Minus, Plus, Boxes } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMockStore, addCard, addNotification } from '../../lib/mockStore';
import { formatFCFA } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';

export default function KitPanier() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const store = useMockStore();

  const product = store.products.find(p => p.id === id && p.product_type === 'kit');
  const [selection, setSelection] = useState({}); // { [itemId]: quantity }
  const [done, setDone] = useState(false);

  // Items appartenant à ce kit uniquement
  const items = useMemo(
    () =>
      store.kitItems.filter(
        i => i.is_active && (i.kit_ids || []).includes(id)
      ),
    [store.kitItems, id]
  );

  if (!product) {
    return (
      <>
        <Header title="Kit" />
        <div className="p-4 max-w-lg mx-auto">
          <div className="card text-center py-8">
            <p className="text-muted mb-4">Kit introuvable.</p>
            <Button onClick={() => nav(-1)}>Retour</Button>
          </div>
        </div>
      </>
    );
  }

  const total = items.reduce((sum, i) => sum + (selection[i.id] || 0) * i.price, 0);
  const miseJour = Math.ceil(total / 31);
  const cartCount = Object.values(selection).reduce((a, b) => a + b, 0);

  function add(itemId) {
    setSelection(s => ({ ...s, [itemId]: (s[itemId] || 0) + 1 }));
  }
  function remove(itemId) {
    setSelection(s => {
      const next = { ...s };
      if (next[itemId] <= 1) delete next[itemId];
      else next[itemId] -= 1;
      return next;
    });
  }

  function valider() {
    if (cartCount === 0) return;

    const collectorId = user?.collector_id;
    if (!collectorId) {
      alert('Aucun collecteur ne vous est encore assigné.');
      return;
    }

    const composition = items
      .filter(i => selection[i.id])
      .map(i => ({
        kit_item_id: i.id,
        quantity: selection[i.id],
        price: i.price,
      }));

    // TODO Supabase : INSERT card avec product_type='kit' + INSERT kit_compositions
    const newCard = addCard({
      clientId: user.id,
      product,
      collectorId,
      lockedPricePerDay: miseJour,
      kitComposition: composition,
    });

    addNotification({
      userId: collectorId,
      type: 'nouvelle_demande_client',
      message: `${user.name} a composé un ${product.name} (${cartCount} article${cartCount > 1 ? 's' : ''}, mise ${formatFCFA(miseJour)}/j). À valider.`,
      link: `/collecteur/client/${user.id}`,
    });

    setDone(true);
  }

  if (done) {
    return (
      <>
        <Header title="Kit validé" />
        <div className="p-6 max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-secondary-light/15 dark:bg-secondary-dark/20 flex items-center justify-center mx-auto mb-6">
            <Check size={44} className="text-secondary-light dark:text-secondary-dark" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold mb-3">Kit envoyé !</h1>
          <p className="text-muted mb-2">
            {cartCount} article{cartCount > 1 ? 's' : ''} · Total{' '}
            <b className="font-mono">{formatFCFA(total)}</b>
          </p>
          <p className="text-muted text-sm mb-8">
            Mise journalière : <b className="font-mono text-primary-light dark:text-primary-dark">{formatFCFA(miseJour)}</b> / jour sur 31 jours.
            Votre collecteur va vous contacter pour l'activation.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => nav('/client')}>Voir mes cartes</Button>
            <Button variant="ghost" onClick={() => nav('/client/produits')}>
              Retour au catalogue
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Composer mon kit" />
      <div className="p-4 max-w-lg mx-auto space-y-4 pb-44">
        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm text-muted">
          <ArrowLeft size={16} /> Retour au catalogue
        </button>

        <div className="card">
          <p className="text-sm font-semibold">{product.name}</p>
          <p className="text-xs text-muted mt-0.5">{product.description}</p>
        </div>

        <p className="text-sm text-muted">
          Cochez les articles souhaités. Votre mise journalière sera calculée automatiquement (Total ÷ 31).
        </p>

        {items.length === 0 && (
          <div className="card text-center py-10">
            <Boxes size={32} className="mx-auto mb-3 text-muted" />
            <p className="text-muted text-sm">
              Ce kit n'a pas encore d'items disponibles.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {items.map(item => {
            const qty = selection[item.id] || 0;
            return (
              <div key={item.id} className="card flex items-center justify-between gap-3">
                <div className="w-14 h-14 rounded-xl bg-black/5 dark:bg-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.photo_url ? (
                    <img src={item.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Boxes size={20} className="text-muted" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{item.name}</p>
                  <p className="text-xs text-muted font-mono">{formatFCFA(item.price)}</p>
                </div>

                {qty === 0 ? (
                  <button
                    onClick={() => add(item.id)}
                    className="p-3 rounded-full bg-primary-light/10 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark min-w-[48px] min-h-[48px] flex items-center justify-center shrink-0"
                  >
                    <Plus size={20} />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => remove(item.id)}
                      className="p-2 rounded-full bg-black/5 dark:bg-white/10 min-w-[40px] min-h-[40px] flex items-center justify-center"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-mono font-bold w-6 text-center">{qty}</span>
                    <button
                      onClick={() => add(item.id)}
                      className="p-2 rounded-full bg-primary-light dark:bg-primary-dark text-white min-w-[40px] min-h-[40px] flex items-center justify-center"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Récap sticky */}
      <div className="fixed bottom-4 inset-x-4 lg:left-auto lg:right-6 lg:w-96 max-w-lg mx-auto lg:mx-0 bg-card-light dark:bg-card-dark border border-outline/40 rounded-2xl p-4 shadow-2xl z-40">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted">Articles</span>
          <span className="font-mono font-semibold">{cartCount}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted">Total kit</span>
          <span className="font-mono font-semibold">{formatFCFA(total)}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-muted">Mise journalière</span>
          <span className="font-mono font-bold text-primary-light dark:text-primary-dark">
            {formatFCFA(miseJour)}/jour
          </span>
        </div>
        <Button className="w-full" disabled={cartCount === 0} onClick={valider}>
          <Check size={18} /> Valider mon kit
        </Button>
      </div>
    </>
  );
}