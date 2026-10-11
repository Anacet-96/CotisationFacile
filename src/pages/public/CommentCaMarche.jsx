import { ArrowLeft, Info, ShoppingBag, Calendar, Truck, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CommentCaMarche() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <header className="sticky top-0 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur border-b border-outline/40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => nav(-1)} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-heading font-bold text-lg">Comment ça marche</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Produits 1 mois */}
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-light/10 dark:bg-primary-dark/20 flex items-center justify-center">
              <ShoppingBag size={20} className="text-primary-light dark:text-primary-dark" />
            </div>
            <h2 className="font-heading font-bold">Produits 1 mois</h2>
          </div>
          <p className="text-sm text-muted">
            Vous recevez le produit <b>immédiatement</b> et vous payez progressivement sur 31 jours.
            Le collecteur passe chaque jour encaisser votre mise.
          </p>
        </div>

        {/* Produits 1 an */}
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-light/10 dark:bg-primary-dark/20 flex items-center justify-center">
              <Calendar size={20} className="text-primary-light dark:text-primary-dark" />
            </div>
            <h2 className="font-heading font-bold">Produits 1 an</h2>
          </div>
          <p className="text-sm text-muted">
            Vous payez toute la cotisation sur <b>12 mois</b> avant de recevoir votre produit.
            Chaque mois complète une carte de 31 jours, puis bascule automatiquement sur le mois suivant.
          </p>
        </div>

        {/* Kit ravitaillement */}
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-light/10 dark:bg-primary-dark/20 flex items-center justify-center">
              <Truck size={20} className="text-primary-light dark:text-primary-dark" />
            </div>
            <h2 className="font-heading font-bold">Kit de ravitaillement</h2>
          </div>
          <p className="text-sm text-muted">
            Vous composez votre kit à la carte (riz, huile, sucre…). Vous payez <b>tout avant</b>
            de recevoir votre ravitaillement. Votre mise journalière est calculée automatiquement
            (Total ÷ 31).
          </p>
        </div>

        {/* Frais */}
        <div className="card border-2 border-primary-light/30 dark:border-primary-dark/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-light/10 dark:bg-primary-dark/20 flex items-center justify-center">
              <CreditCard size={20} className="text-primary-light dark:text-primary-dark" />
            </div>
            <h2 className="font-heading font-bold">Frais à prévoir</h2>
          </div>
          <ul className="text-sm space-y-2">
            <li className="flex justify-between">
              <span className="text-muted">Frais de carte</span>
              <span className="font-mono font-semibold">200 FCFA</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted">Frais de livraison (1 mois / kit)</span>
              <span className="font-mono font-semibold">1 000 FCFA</span>
            </li>
          </ul>
          <p className="text-xs text-muted mt-3 flex items-start gap-2">
            <Info size={14} className="shrink-0 mt-0.5" />
            Les frais de carte sont payés au collecteur avant le début de la cotisation.
          </p>
        </div>
      </div>
    </div>
  );
}