import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Package, ShoppingBasket, Pencil, Power, Search,
  Boxes,
} from 'lucide-react';
import {
  useMockStore, toggleProductActive, toggleKitItemActive,
  addProduct, updateProduct, addKitItem, updateKitItem,
} from '../../lib/mockStore';
import { formatFCFA, productTypeLabel, cx } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import ProductImage from '../../components/ui/ProductImage';
import KitFormModal from '../../components/admin/KitFormModal';
import KitItemFormModal from '../../components/admin/KitItemFormModal';

const TABS = [
  { key: 'produits', label: 'Produits', icon: Package },
  { key: 'kits', label: 'Kits', icon: ShoppingBasket },
  { key: 'items', label: 'Items de kit', icon: Boxes },
];

export default function Produits() {
  const store = useMockStore();
  const [tab, setTab] = useState('produits');
  const [query, setQuery] = useState('');
  const [kitModal, setKitModal] = useState({ open: false, kit: null });
  const [itemModal, setItemModal] = useState({ open: false, item: null });

  const produits = store.products.filter(p => {
    if (p.product_type === 'kit') return false;
    if (!query.trim()) return true;
    return p.name.toLowerCase().includes(query.toLowerCase());
  });

  const kits = store.products.filter(p => {
    if (p.product_type !== 'kit') return false;
    if (!query.trim()) return true;
    return p.name.toLowerCase().includes(query.toLowerCase());
  });

  const kitItems = store.kitItems.filter(i => {
    if (!query.trim()) return true;
    return i.name.toLowerCase().includes(query.toLowerCase());
  });

  function handleSaveKit(data) {
    if (kitModal.kit) {
      updateProduct(kitModal.kit.id, {
        name: data.name,
        description: data.description,
        photo_url: data.photo_url,
      });
    } else {
      addProduct({
        name: data.name,
        description: data.description,
        photo_url: data.photo_url,
        price_per_day: 0,
        duration_days: 31,
        product_type: 'kit',
        is_active: true,
      });
    }
    setKitModal({ open: false, kit: null });
  }

  function handleSaveItem(data) {
    if (itemModal.item) {
      updateKitItem(itemModal.item.id, data);
    } else {
      addKitItem({ ...data, is_active: true });
    }
    setItemModal({ open: false, item: null });
  }

  return (
    <>
      <Header title="Produits & Kits" />
      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-4">

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map(t => {
            const Icon = t.icon;
            const count =
              t.key === 'produits' ? store.products.filter(p => p.product_type !== 'kit').length
              : t.key === 'kits' ? store.products.filter(p => p.product_type === 'kit').length
              : store.kitItems.length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cx(
                  'flex-1 px-2 py-3 rounded-xl text-xs sm:text-sm font-semibold transition min-h-[48px] flex items-center justify-center gap-1.5',
                  tab === t.key
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'bg-black/5 dark:bg-white/10 text-muted'
                )}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(' ')[0]}</span>
                <span className={cx(
                  'text-[10px] font-bold rounded-full px-1.5 py-0.5',
                  tab === t.key ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Recherche */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            className="input pl-11"
            placeholder="Rechercher…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* ---------- PRODUITS ---------- */}
        {tab === 'produits' && (
          <>
            <Link to="/admin/nouveau-produit" className="btn-primary w-full">
              <Plus size={18} /> Nouveau produit
            </Link>

            {produits.length === 0 && (
              <div className="card text-center py-10">
                <Package size={32} className="mx-auto mb-3 text-muted" />
                <p className="text-muted text-sm">Aucun produit.</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {produits.map(p => (
                <div key={p.id} className={cx('card flex flex-col gap-3', !p.is_active && 'opacity-60')}>
                  <div className="flex items-start justify-between gap-2">
                    <Badge color="primary">{productTypeLabel(p.product_type)}</Badge>
                    {!p.is_active && <Badge color="danger">Désactivé</Badge>}
                  </div>

                  <ProductImage product={p} />

                  <div>
                    <h3 className="font-heading font-bold truncate">{p.name}</h3>
                    <p className="text-xs text-muted line-clamp-2 mt-1">{p.description}</p>
                  </div>

                  <p className="font-mono font-bold text-lg">
                    {formatFCFA(p.price_per_day)}
                    <span className="text-xs text-muted font-body"> / jour</span>
                  </p>

                  <div className="flex gap-2 mt-auto">
                    <Link to={`/admin/produit/${p.id}`} className="btn-ghost flex-1 text-sm">
                      <Pencil size={14} /> Modifier
                    </Link>
                    <button
                      onClick={() => toggleProductActive(p.id)}
                      className={cx(
                        'p-3 rounded-xl border min-h-[48px] min-w-[48px] flex items-center justify-center transition',
                        p.is_active
                          ? 'border-red-500/30 text-red-500 hover:bg-red-500/10'
                          : 'border-secondary-light/30 text-secondary-light hover:bg-secondary-light/10'
                      )}
                      title={p.is_active ? 'Désactiver' : 'Activer'}
                    >
                      <Power size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ---------- KITS ---------- */}
        {tab === 'kits' && (
          <>
            <button
              onClick={() => setKitModal({ open: true, kit: null })}
              className="btn-primary w-full"
            >
              <Plus size={18} /> Ajouter un kit
            </button>

            <div className="card">
              <p className="text-xs text-muted">
                Les kits apparaissent côté client avec la mention <b>Kit ravitaillement</b>.
                Le client compose ensuite son panier avec les <b>items de kit</b>.
              </p>
            </div>

            {kits.length === 0 && (
              <div className="card text-center py-10">
                <ShoppingBasket size={32} className="mx-auto mb-3 text-muted" />
                <p className="text-muted text-sm">Aucun kit. Créez-en un ci-dessus.</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kits.map(k => {
                const itemCount = store.kitItems.filter(i => i.kit_ids?.includes(k.id)).length;
                return (
                  <div key={k.id} className={cx('card flex flex-col gap-3', !k.is_active && 'opacity-60')}>
                    <div className="flex items-start justify-between gap-2">
                      <Badge color="primary">Kit</Badge>
                      {!k.is_active && <Badge color="danger">Désactivé</Badge>}
                    </div>

                    <ProductImage product={k} />

                    <div>
                      <h3 className="font-heading font-bold truncate">{k.name}</h3>
                      <p className="text-xs text-muted line-clamp-2 mt-1">{k.description}</p>
                    </div>

                    <p className="text-xs text-muted">
                      <Boxes size={12} className="inline mr-1" />
                      {itemCount} item{itemCount > 1 ? 's' : ''}
                    </p>

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => setKitModal({ open: true, kit: k })}
                        className="btn-ghost flex-1 text-sm"
                      >
                        <Pencil size={14} /> Modifier
                      </button>
                      <button
                        onClick={() => toggleProductActive(k.id)}
                        className={cx(
                          'p-3 rounded-xl border min-h-[48px] min-w-[48px] flex items-center justify-center transition',
                          k.is_active
                            ? 'border-red-500/30 text-red-500 hover:bg-red-500/10'
                            : 'border-secondary-light/30 text-secondary-light hover:bg-secondary-light/10'
                        )}
                        title={k.is_active ? 'Désactiver' : 'Activer'}
                      >
                        <Power size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ---------- ITEMS DE KIT ---------- */}
        {tab === 'items' && (
          <>
            <button
              onClick={() => setItemModal({ open: true, item: null })}
              className="btn-primary w-full"
              disabled={kits.length === 0}
              title={kits.length === 0 ? "Créez d'abord un kit" : ''}
            >
              <Plus size={18} /> Nouvel item de kit
            </button>

            {kits.length === 0 && (
              <div className="card border-2 border-amber-500/30 bg-amber-500/5">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  ⚠️ Vous devez d'abord créer au moins un <b>kit</b> dans l'onglet "Kits" avant de pouvoir ajouter des items.
                </p>
              </div>
            )}

            <div className="card">
              <p className="text-xs text-muted">
                Ces items composent les paniers dynamiques des clients. Un item peut appartenir à plusieurs kits.
              </p>
            </div>

            {kitItems.length === 0 && kits.length > 0 && (
              <div className="card text-center py-10">
                <Boxes size={32} className="mx-auto mb-3 text-muted" />
                <p className="text-muted text-sm">Aucun item. Ajoutez-en un ci-dessus.</p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {kitItems.map(item => {
                const assignedKits = (item.kit_ids || [])
                  .map(id => store.products.find(p => p.id === id))
                  .filter(Boolean);
                return (
                  <div key={item.id} className={cx('card flex flex-col gap-3', !item.is_active && 'opacity-60')}>
                    <div className="flex gap-3 items-start">
                      {/* Thumb image */}
                      <div className="w-16 h-16 rounded-xl bg-black/5 dark:bg-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.photo_url ? (
                          <img src={item.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Boxes size={22} className="text-muted" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{item.name}</p>
                        <p className="text-xs text-muted font-mono">{formatFCFA(item.price)}</p>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => setItemModal({ open: true, item })}
                          className="p-2 rounded-full text-primary-light dark:text-primary-dark hover:bg-primary-light/10"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => toggleKitItemActive(item.id)}
                          className={cx(
                            'p-2 rounded-full',
                            item.is_active ? 'text-red-500 hover:bg-red-500/10' : 'text-secondary-light hover:bg-secondary-light/10'
                          )}
                          title={item.is_active ? 'Désactiver' : 'Activer'}
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </div>

                    {assignedKits.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2 border-t border-outline/30">
                        {assignedKits.map(k => (
                          <Badge key={k.id} color="neutral">{k.name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <KitFormModal
        open={kitModal.open}
        kit={kitModal.kit}
        onClose={() => setKitModal({ open: false, kit: null })}
        onSave={handleSaveKit}
      />

      <KitItemFormModal
        open={itemModal.open}
        item={itemModal.item}
        kits={kits}
        onClose={() => setItemModal({ open: false, item: null })}
        onSave={handleSaveItem}
      />
    </>
  );
}