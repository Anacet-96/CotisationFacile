import { useState, useMemo } from 'react';
import { Search, Users, Shield, UserCheck, ArrowUp, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMockStore, changeUserRole } from '../../lib/mockStore';
import { cx } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const FILTRES = [
  { key: 'tous', label: 'Tous' },
  { key: 'client', label: 'Clients' },
  { key: 'collecteur', label: 'Collecteurs' },
];

export default function Comptes() {
  const { user } = useAuth();
  const store = useMockStore();
  const [filtre, setFiltre] = useState('tous');
  const [query, setQuery] = useState('');
  const [promoUser, setPromoUser] = useState(null); // user à promouvoir
  const [toast, setToast] = useState(null);

  // La secrétaire ne voit QUE les clients et collecteurs (jamais admin/secretaire)
  const visibleUsers = useMemo(() => {
    let list = store.users.filter(u => u.role === 'client' || u.role === 'collecteur');
    if (filtre !== 'tous') list = list.filter(u => u.role === filtre);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        u =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          u.client_number?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [store.users, filtre, query]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function confirmPromotion() {
    if (!promoUser) return;
    // TODO Supabase : UPDATE profiles SET role='collecteur' WHERE id=user.id
    changeUserRole(promoUser.id, 'collecteur');
    showToast(`✅ ${promoUser.name} est maintenant collecteur.`);
    setPromoUser(null);
  }

  return (
    <>
      <Header title="Comptes utilisateurs" />

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%]">
          <div className="rounded-xl bg-secondary-light dark:bg-secondary-dark text-white px-4 py-3 shadow-lg text-sm font-medium">
            {toast}
          </div>
        </div>
      )}

      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-4">

        {/* Bandeau explicatif */}
        <div className="card border-2 border-primary-light/30 dark:border-primary-dark/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-light/15 dark:bg-primary-dark/20 flex items-center justify-center shrink-0">
              <Shield size={18} className="text-primary-light dark:text-primary-dark" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm">Attribution de rôle</p>
              <p className="text-xs text-muted mt-0.5">
                Vous pouvez promouvoir un <b>client</b> en <b>collecteur</b>. Vous ne pouvez pas
                attribuer les rôles admin ou secrétaire (réservé à l'admin).
              </p>
            </div>
          </div>
        </div>

        {/* Recherche */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            className="input pl-11"
            placeholder="Rechercher par nom, email, téléphone…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {FILTRES.map(f => {
            const count =
              f.key === 'tous' ? store.users.filter(u => u.role === 'client' || u.role === 'collecteur').length
              : store.users.filter(u => u.role === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFiltre(f.key)}
                className={cx(
                  'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition min-h-[40px] flex items-center gap-2',
                  filtre === f.key
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'bg-black/5 dark:bg-white/10 text-muted'
                )}
              >
                {f.label}
                <span className={cx(
                  'text-[10px] font-bold rounded-full px-1.5 py-0.5',
                  filtre === f.key ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Liste */}
        {visibleUsers.length === 0 && (
          <div className="card text-center py-10">
            <Users size={32} className="mx-auto mb-3 text-muted" />
            <p className="text-muted text-sm">Aucun utilisateur trouvé.</p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleUsers.map(u => {
            const isClient = u.role === 'client';
            const isCollector = u.role === 'collecteur';
            const myClients = isCollector
              ? store.users.filter(x => x.collector_id === u.id && x.role === 'client').length
              : 0;

            return (
              <div key={u.id} className="card flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-heading font-bold truncate">{u.name}</p>
                    <p className="text-xs text-muted font-mono truncate">
                      {u.client_number || u.email}
                    </p>
                  </div>
                  <Badge color={isCollector ? 'success' : 'primary'}>
                    {isCollector ? 'Collecteur' : 'Client'}
                  </Badge>
                </div>

                <div className="text-xs text-muted space-y-0.5">
                  <p className="truncate">📧 {u.email}</p>
                  <p className="truncate">📞 {u.phone}</p>
                  <p className="truncate">📍 {u.district}, {u.city}</p>
                </div>

                {isCollector && (
                  <div className="text-xs text-muted pt-2 border-t border-outline/30">
                    <UserCheck size={12} className="inline mr-1" />
                    {myClients} client{myClients > 1 ? 's' : ''} assigné{myClients > 1 ? 's' : ''}
                  </div>
                )}

                {/* Action : promouvoir client → collecteur */}
                {isClient && (
                  <Button
                    variant="ghost"
                    className="w-full text-sm mt-auto"
                    onClick={() => setPromoUser(u)}
                  >
                    <ArrowUp size={16} /> Promouvoir en collecteur
                  </Button>
                )}

                {isCollector && (
                  <div className="pt-1 text-xs text-center text-muted italic">
                    Déjà collecteur
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal confirmation promotion */}
      <Modal
        open={!!promoUser}
        onClose={() => setPromoUser(null)}
        title="Promouvoir en collecteur"
        footer={
          <>
            <Button variant="ghost" className="flex-1" onClick={() => setPromoUser(null)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={confirmPromotion}>
              Confirmer
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary-light/15 dark:bg-primary-dark/20 flex items-center justify-center shrink-0">
            <ArrowUp size={22} className="text-primary-light dark:text-primary-dark" />
          </div>
          <p className="text-sm">
            <b>{promoUser?.name}</b> pourra désormais collecter des cotisations auprès des clients
            qui lui seront assignés.
          </p>
        </div>

        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-700 dark:text-amber-400">
          Le rôle devient définitif. Vous ne pouvez plus le repasser en client (réservé à l'admin).
        </div>
      </Modal>
    </>
  );
}