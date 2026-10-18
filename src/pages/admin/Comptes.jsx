import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Shield, Plus, ArrowRight, Phone, MapPin } from 'lucide-react';
import { useMockStore } from '../../lib/mockStore';
import { cx } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const FILTRES = [
  { key: 'tous', label: 'Tous' },
  { key: 'client', label: 'Clients' },
  { key: 'collecteur', label: 'Collecteurs' },
  { key: 'secretaire', label: 'Secrétaires' },
  { key: 'admin', label: 'Admins' },
];

const ROLE_LABELS = {
  client: 'Client',
  collecteur: 'Collecteur',
  secretaire: 'Secrétaire',
  admin: 'Admin',
};

const ROLE_COLORS = {
  client: 'primary',
  collecteur: 'success',
  secretaire: 'warning',
  admin: 'danger',
};

export default function Comptes() {
  const store = useMockStore();
  const [filtre, setFiltre] = useState('tous');
  const [query, setQuery] = useState('');

  const filteredUsers = useMemo(() => {
    let list = store.users;
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

  return (
    <>
      <Header title="Comptes utilisateurs" />
      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-4">

        {/* Bandeau + bouton créer */}
        <div className="card border-2 border-primary-light/30 dark:border-primary-dark/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-light/15 dark:bg-primary-dark/20 flex items-center justify-center shrink-0">
            <Shield size={18} className="text-primary-light dark:text-primary-dark" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Gestion des comptes</p>
            <p className="text-xs text-muted">
              Attribuez tous les rôles. Les nouveaux comptes clients sont créés par les collecteurs.
            </p>
          </div>
        </div>

        {/* Recherche */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            className="input pl-11"
            placeholder="Rechercher par nom, email, téléphone, n° client…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {FILTRES.map(f => {
            const count =
              f.key === 'tous'
                ? store.users.length
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
        {filteredUsers.length === 0 && (
          <div className="card text-center py-10">
            <Users size={32} className="mx-auto mb-3 text-muted" />
            <p className="text-muted text-sm">Aucun utilisateur trouvé.</p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map(u => (
            <Link
              key={u.id}
              to={`/admin/compte/${u.id}`}
              className="card hover:shadow-md transition flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-heading font-bold truncate">{u.name}</p>
                  <p className="text-xs text-muted font-mono truncate">
                    {u.client_number || u.email}
                  </p>
                </div>
                <Badge color={ROLE_COLORS[u.role] || 'neutral'}>
                  {ROLE_LABELS[u.role] || u.role}
                </Badge>
              </div>

              <div className="text-xs text-muted space-y-0.5">
                <p className="flex items-center gap-1.5 truncate">
                  <Phone size={12} /> {u.phone}
                </p>
                {u.city && (
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin size={12} /> {u.district}, {u.city}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end pt-1 text-primary-light dark:text-primary-dark text-xs font-semibold">
                Gérer <ArrowRight size={14} className="ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}