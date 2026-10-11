import {
  Bike, Refrigerator, Tv, WashingMachine, Fan,
  ShoppingBasket, Soup, Package, Sofa, Microwave,
} from 'lucide-react';

// Icône selon le nom du produit (fallback par type)
function pickIcon(product) {
  const n = (product?.name || '').toLowerCase();
  if (n.includes('moto')) return Bike;
  if (n.includes('réfrigé') || n.includes('refrig')) return Refrigerator;
  if (n.includes('tv') || n.includes('télé') || n.includes('tele')) return Tv;
  if (n.includes('machine') || n.includes('lave')) return WashingMachine;
  if (n.includes('ventil') || n.includes('fan')) return Fan;
  if (n.includes('micro')) return Microwave;
  if (n.includes('canap') || n.includes('sofa')) return Sofa;
  if (n.includes('kit') || n.includes('ravit')) return ShoppingBasket;
  if (n.includes('riz') || n.includes('soupe')) return Soup;
  return Package;
}

// Couleurs de dégradé par type
const GRADIENTS = {
  '1_mois': 'from-indigo-500/20 via-purple-500/15 to-pink-500/20',
  '1_an': 'from-emerald-500/20 via-teal-500/15 to-cyan-500/20',
  'kit': 'from-amber-500/20 via-orange-500/15 to-red-500/20',
};

export default function ProductImage({ product, className = '' }) {
  const Icon = pickIcon(product);
  const gradient = GRADIENTS[product?.product_type] || 'from-slate-500/20 to-slate-400/20';

  if (product?.photo_url) {
    return (
      <div className={`aspect-[4/3] rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 ${className}`}>
        <img
          src={product.photo_url}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden ${className}`}>
      {/* Cercle décoratif */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 dark:bg-white/5" />
      <div className="absolute -left-4 -top-4 w-16 h-16 rounded-full bg-white/10 dark:bg-white/5" />

      <div className="relative flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-sm">
          <Icon size={34} className="text-primary-light dark:text-primary-dark" strokeWidth={1.8} />
        </div>
        <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-wider">
          {product?.name?.slice(0, 12).toUpperCase()}
        </span>
      </div>
    </div>
  );
}