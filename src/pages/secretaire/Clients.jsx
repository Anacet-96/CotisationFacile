import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Check, X, UserCheck, Clock, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  useMockStore,
  approveClientRegistration,
  rejectClientRegistration,
  assignCollectorToClient,
  reviewProfileChangeRequest,
} from '../../lib/mockStore';
import { cx, formatDateTime } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const TABS = [
  { key: 'attente', label: 'Inscriptions à valider' },
  { key: 'modifications', label: 'Modifications' },
  { key: 'tous', label: 'Tous les clients' },
];

export default function Clients() {
  const { user } = useAuth();
  const store = useMockStore();
  const [tab, setTab] = useState('attente');
  const [query, setQuery] = useState('');

  const clientsEnAttente = store.users.filter(
    u => u.role === 'client' && u.status === 'en_attente'
  );
  const pendingRequests = store.profileChangeRequests.filter(r => r.status === 'en_attente');
  const allClients = store.users.filter(u => u.role === 'client');
  const collectors = store.users.filter(u => u.role === 'collecteur');

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allClients;
    return allClients.filter(
      c =>
        c.name?.toLowerCase().includes(q) ||
        c.client_number?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    );
  }, [allClients, query]);

  return (
    <>
      <Header title="Gestion des clients" />
      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-4">

        {/* Onglets */}
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {TABS.map(t => {
            const count =
              t.key === 'attente' ? clientsEnAttente.length
              : t.key === 'modifications' ? pendingRequests.length
              : allClients.length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cx(
                  'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition min-h-[40px] flex items-center gap-2',
                  tab === t.key
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'bg-black/5 dark:bg-white/10 text-muted'
                )}
              >
                {t.label}
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

        {/* ---------- ONGLET 1 : Inscriptions à valider ---------- */}
        {tab === 'attente' && (
          <>
            {clientsEnAttente.length === 0 && (
              <div className="card text-center py-10">
                <UserCheck size={32} className="mx-auto mb-3 text-muted" />
                <p className="text-muted text-sm">Aucune inscription en attente.</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clientsEnAttente.map(c => (
                <ClientCard
                  key={c.id}
                  client={c}
                  collectors={collectors}
                  onApprove={(collectorId) =>
                    approveClientRegistration(c.id, collectorId)
                  }
                  onReject={() => rejectClientRegistration(c.id)}
                  onAssign={(collectorId) => assignCollectorToClient(c.id, collectorId)}
                />
              ))}
            </div>
          </>
        )}

        {/* ---------- ONGLET 2 : Modifications en attente ---------- */}
        {tab === 'modifications' && (
          <>
            {pendingRequests.length === 0 && (
              <div className="card text-center py-10">
                <Clock size={32} className="mx-auto mb-3 text-muted" />
                <p className="text-muted text-sm">Aucune modification en attente.</p>
              </div>
            )}

            <div className="space-y-3">
              {pendingRequests.map(r => {
                const client = store.users.find(u => u.id === r.client_id);
                const collector = store.users.find(u => u.id === r.collector_id);
                return (
                  <ModificationCard
                    key={r.id}
                    request={r}
                    client={client}
                    collector={collector}
                    onApprove={(note) => reviewProfileChangeRequest(r.id, 'approuvee', note, user.id)}
                    onReject={(note) => reviewProfileChangeRequest(r.id, 'rejetee', note, user.id)}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* ---------- ONGLET 3 : Tous les clients ---------- */}
        {tab === 'tous' && (
          <>
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                className="input pl-11"
                placeholder="Rechercher par nom, n° client ou téléphone…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>

            {filteredClients.length === 0 && (
              <div className="card text-center py-8">
                <p className="text-muted text-sm">Aucun client trouvé.</p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClients.map(c => {
                const collector = store.users.find(u => u.id === c.collector_id);
                return (
                  <div key={c.id} className="card flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-heading font-bold truncate">{c.name}</p>
                        <p className="text-xs text-muted font-mono">{c.client_number}</p>
                      </div>
                      {c.status === 'en_attente' ? (
                        <Badge color="warning">En attente</Badge>
                      ) : (
                        <Badge color="success">Actif</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted space-y-0.5">
                      <p className="flex items-center gap-1.5 truncate">
                        <Phone size={12} /> {c.phone}
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin size={12} /> {c.district}, {c.city}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-outline/30 flex items-center justify-between gap-2">
                      <span className="text-xs text-muted">
                        Collecteur :
                      </span>
                      <select
                        value={c.collector_id || ''}
                        onChange={e => assignCollectorToClient(c.id, e.target.value || null)}
                        className="text-xs font-semibold rounded-lg border border-outline bg-card-light dark:bg-card-dark px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-light max-w-[60%]"
                      >
                        <option value="">— Aucun —</option>
                        {collectors.map(col => (
                          <option key={col.id} value={col.id}>{col.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ============================================================
function ClientCard({ client, collectors, onApprove, onReject, onAssign }) {
  const [assignTo, setAssignTo] = useState('');

  return (
    <div className="card flex flex-col gap-3 border-2 border-amber-500/30">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-heading font-bold truncate">{client.name}</p>
          <p className="text-xs text-muted font-mono">{client.client_number}</p>
        </div>
        <Badge color="warning">Nouveau</Badge>
      </div>

      <div className="text-xs text-muted space-y-0.5">
        <p className="flex items-center gap-1.5 truncate">
          <Phone size={12} /> {client.phone}
        </p>
        <p className="flex items-center gap-1.5 truncate">
          <MapPin size={12} /> {client.district}, {client.city}
        </p>
        {client.profession && (
          <p className="text-[11px]">Profession : {client.profession}</p>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-muted">Assigner à :</label>
        <select
          value={assignTo}
          onChange={e => setAssignTo(e.target.value)}
          className="input mt-1 text-sm"
        >
          <option value="">— Aucun —</option>
          {collectors.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          variant="ghost"
          className="flex-1 text-red-500"
          onClick={onReject}
        >
          <X size={16} /> Rejeter
        </Button>
        <Button
          className="flex-1"
          onClick={() => onApprove(assignTo || null)}
        >
          <Check size={16} /> Approuver
        </Button>
      </div>
    </div>
  );
}

// ============================================================
function ModificationCard({ request, client, collector, onApprove, onReject }) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm">
            {collector?.name || '—'} → {client?.name || '—'}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {formatDateTime(request.created_at)}
          </p>
        </div>
        <Badge color="warning">En attente</Badge>
      </div>

      <div className="rounded-xl bg-black/5 dark:bg-white/5 p-3 text-sm">
        <p className="text-xs text-muted uppercase tracking-wide mb-1">
          Champ : <span className="capitalize font-semibold text-content-light dark:text-content-dark">{request.field_name}</span>
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-muted line-through">{request.old_value || '—'}</span>
          <span className="text-muted">→</span>
          <span className="font-semibold">{request.new_value}</span>
        </div>
      </div>

      {showReject ? (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted">Raison du rejet *</label>
          <textarea
            className="input min-h-[80px] resize-none text-sm"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Expliquez au collecteur pourquoi la modification est refusée…"
          />
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => { setShowReject(false); setReason(''); }}>
              Annuler
            </Button>
            <Button
              className="flex-1"
              disabled={!reason.trim()}
              onClick={() => {
                onReject(reason.trim());
                setShowReject(false);
              }}
            >
              Confirmer le rejet
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1 text-red-500"
            onClick={() => setShowReject(true)}
          >
            <X size={16} /> Rejeter
          </Button>
          <Button className="flex-1" onClick={() => onApprove(null)}>
            <Check size={16} /> Approuver
          </Button>
        </div>
      )}
    </div>
  );
}