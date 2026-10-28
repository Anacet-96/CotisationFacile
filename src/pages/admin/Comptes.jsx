import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Users, Shield, ArrowRight, Phone, MapPin,
  Check, X, Clock, Loader2,
} from 'lucide-react';
import {
  useMockStore,
  approveClientRegistration,
  rejectClientRegistration,
} from '../../lib/mockStore';
import { cx } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

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
  const [rejecting, setRejecting] = useState(null); // { client, reason }
  const [toast, setToast] = useState(null);

  const clientsEnAttente = useMemo(
    () => store.users.filter(u => u.role === 'client' && u.status === 'en_attente'),
    [store.users]
  );

  const collectors = useMemo(
    () => store.users.filter(u => u.role === 'collecteur'),
    [store.users]
  );

  const FILTRES = [
    { key: 'tous', label: 'Tous', count: store.users.length },
    { key: 'en_attente', label: 'En attente', count: clientsEnAttente.length },
    { key: 'client', label: 'Clients', count: store.users.filter(u => u.role === 'client').length },
    { key: 'collecteur', label: 'Collecteurs', count: store.users.filter(u => u.role === 'collecteur').length },
    { key: 'secretaire', label: 'Secrétaires', count: store.users.filter(u => u.role === 'secretaire').length },
    { key: 'admin', label: 'Admins', count: store.users.filter(u => u.role === 'admin').length },
  ];

  const filteredUsers = useMemo(() => {
    let list;
    if (filtre === 'en_attente') {
      list = clientsEnAttente;
    } else if (filtre === 'tous') {
      list = store.users;
    } else {
      list = store.users.filter(u => u.role === filtre);
    }

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
  }, [store.users, clientsEnAttente, filtre, query]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleApprove(clientId, collectorId) {
    await approveClientRegistration(clientId, collectorId || null);
    showToast('✅ Compte validé et client notifié.');
  }

  async function handleReject() {
    if (!rejecting?.reason.trim()) return;
    await rejectClientRegistration(rejecting.client.id);
    setRejecting(null);
    showToast('❌ Inscription rejetée.');
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

        {/* Bandeau */}
        <div className="card border-2 border-primary-light/30 dark:border-primary-dark/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-light/15 dark:bg-primary-dark/20 flex items-center justify-center shrink-0">
            <Shield size={18} className="text-primary-light dark:text-primary-dark" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Gestion des comptes</p>
            <p className="text-xs text-muted">
              Validez les inscriptions, attribuez les rôles et assignez les collecteurs.
            </p>
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
          {FILTRES.map(f => (
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
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Message vide */}
        {filteredUsers.length === 0 && (
          <div className="card text-center py-10">
            <Users size={32} className="mx-auto mb-3 text-muted" />
            <p className="text-muted text-sm">
              {filtre === 'en_attente'
                ? 'Aucune inscription en attente. 🎉'
                : 'Aucun utilisateur trouvé.'}
            </p>
          </div>
        )}

        {/* Liste */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map(u => {
            const isPending = u.role === 'client' && u.status === 'en_attente';

            return (
              <div key={u.id} className="card flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-heading font-bold truncate">{u.name}</p>
                    <p className="text-xs text-muted font-mono truncate">
                      {u.client_number || u.email}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge color={ROLE_COLORS[u.role] || 'neutral'}>
                      {ROLE_LABELS[u.role] || u.role}
                    </Badge>
                    {isPending && <Badge color="warning">En attente</Badge>}
                  </div>
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

                {/* Actions spéciales pour les inscriptions en attente */}
                {isPending ? (
                  <PendingActions
                    client={u}
                    collectors={collectors}
                    onApprove={handleApprove}
                    onReject={(client) => setRejecting({ client, reason: '' })}
                  />
                ) : (
                  <Link
                    to={`/admin/compte/${u.id}`}
                    className="flex items-center justify-end gap-1 pt-1 text-primary-light dark:text-primary-dark text-xs font-semibold"
                  >
                    Gérer <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de rejet */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-card-light dark:bg-card-dark w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5">
            <h2 className="font-heading font-bold text-lg mb-3">Rejeter l'inscription</h2>
            <p className="text-sm text-muted mb-3">
              Client : <b className="text-content-light dark:text-content-dark">{rejecting.client.name}</b>
            </p>
            <label className="text-xs font-semibold text-muted">Raison *</label>
            <textarea
              className="input mt-1 min-h-[100px] resize-none text-sm"
              value={rejecting.reason}
              onChange={e => setRejecting(r => ({ ...r, reason: e.target.value }))}
              placeholder="Expliquez la raison du rejet (ex: informations manquantes, doublon…)"
            />
            <div className="flex gap-3 mt-4">
              <Button variant="ghost" className="flex-1" onClick={() => setRejecting(null)}>
                Annuler
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600"
                disabled={!rejecting.reason.trim()}
                onClick={handleReject}
              >
                Confirmer le rejet
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// Sous-composant : actions sur une inscription en attente
// ============================================================
function PendingActions({ client, collectors, onApprove, onReject }) {
  const [collectorId, setCollectorId] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleApproveClick() {
    setLoading(true);
    await onApprove(client.id, collectorId || null);
    setLoading(false);
  }

  return (
    <div className="pt-2 border-t border-outline/30 space-y-2">
      <div>
        <label className="text-[10px] font-semibold text-muted uppercase tracking-wide">
          Assigner à un collecteur
        </label>
        <select
          value={collectorId}
          onChange={e => setCollectorId(e.target.value)}
          className="input mt-1 text-sm"
        >
          <option value="">— Aucun —</option>
          {collectors.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          className="flex-1 text-red-500 text-xs"
          onClick={() => onReject(client)}
          disabled={loading}
        >
          <X size={14} /> Rejeter
        </Button>
        <Button
          className="flex-1 text-xs"
          onClick={handleApproveClick}
          disabled={loading}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Approuver</>}
        </Button>
      </div>
    </div>
  );
}