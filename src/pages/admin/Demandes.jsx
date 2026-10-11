import { useState } from 'react';
import { Check, X, Clock, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMockStore, reviewProfileChangeRequest, addNotification } from '../../lib/mockStore';
import { formatDateTime } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const FILTRES = [
  { key: 'en_attente', label: 'En attente' },
  { key: 'approuvee', label: 'Approuvées' },
  { key: 'rejetee', label: 'Rejetées' },
];

export default function Demandes() {
  const { user } = useAuth();
  const store = useMockStore();
  const [filtre, setFiltre] = useState('en_attente');
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState(null);

  const requests = store.profileChangeRequests
    .filter(r => r.status === filtre)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function approve(req) {
    // TODO Supabase : UPDATE profile_change_requests + UPDATE profiles + notification collecteur
    reviewProfileChangeRequest(req.id, 'approuvee', null, user.id);

    addNotification({
      userId: req.collector_id,
      type: 'modification_approuvee',
      message: `Votre modification sur ${store.users.find(u => u.id === req.client_id)?.name} a été approuvée.`,
      link: `/collecteur/client/${req.client_id}`,
    });

    showToast('✅ Modification approuvée et appliquée.');
  }

  function reject() {
    if (!rejecting || !reason.trim()) return;
    // TODO Supabase : UPDATE profile_change_requests + notification collecteur
    reviewProfileChangeRequest(rejecting.id, 'rejetee', reason.trim(), user.id);

    addNotification({
      userId: rejecting.collector_id,
      type: 'modification_rejetee',
      message: `Votre modification sur ${store.users.find(u => u.id === rejecting.client_id)?.name} a été refusée. Raison : ${reason.trim()}`,
      link: `/collecteur/client/${rejecting.client_id}`,
    });

    showToast('❌ Modification rejetée.');
    setRejecting(null);
    setReason('');
  }

  return (
    <>
      <Header title="Demandes de modification" />

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%]">
          <div className="rounded-xl bg-secondary-light dark:bg-secondary-dark text-white px-4 py-3 shadow-lg text-sm font-medium">
            {toast}
          </div>
        </div>
      )}

      <div className="p-4 max-w-lg mx-auto lg:max-w-6xl space-y-4">

        <div className="card border-2 border-primary-light/30 dark:border-primary-dark/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-light/15 dark:bg-primary-dark/20 flex items-center justify-center shrink-0">
              <UserCog size={18} className="text-primary-light dark:text-primary-dark" />
            </div>
            <div>
              <p className="font-semibold text-sm">Approbation des modifications</p>
              <p className="text-xs text-muted mt-0.5">
                Les collecteurs peuvent proposer des modifications sur leurs clients.
                Tant qu'elles ne sont pas approuvées, les anciennes valeurs restent affichées.
              </p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {FILTRES.map(f => {
            const count = store.profileChangeRequests.filter(r => r.status === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFiltre(f.key)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition min-h-[40px] flex items-center gap-2 ${
                  filtre === f.key
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'bg-black/5 dark:bg-white/10 text-muted'
                }`}
              >
                {f.label}
                <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                  filtre === f.key ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {requests.length === 0 && (
          <div className="card text-center py-10">
            <Clock size={32} className="mx-auto mb-3 text-muted" />
            <p className="text-muted text-sm">Aucune demande dans cet état.</p>
          </div>
        )}

        <div className="space-y-3">
          {requests.map(r => {
            const client = store.users.find(u => u.id === r.client_id);
            const collector = store.users.find(u => u.id === r.collector_id);
            return (
              <div key={r.id} className="card space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">
                      {collector?.name || '—'} → {client?.name || '—'}
                    </p>
                    <p className="text-xs text-muted mt-0.5">{formatDateTime(r.created_at)}</p>
                  </div>
                  <Badge color={r.status === 'en_attente' ? 'warning' : r.status === 'approuvee' ? 'success' : 'danger'}>
                    {r.status === 'en_attente' ? 'En attente' : r.status === 'approuvee' ? 'Approuvée' : 'Rejetée'}
                  </Badge>
                </div>

                <div className="rounded-xl bg-black/5 dark:bg-white/5 p-3 text-sm">
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">
                    Champ : <span className="capitalize font-semibold text-content-light dark:text-content-dark">{r.field_name}</span>
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-muted line-through">{r.old_value || '—'}</span>
                    <span className="text-muted">→</span>
                    <span className="font-semibold">{r.new_value}</span>
                  </div>
                </div>

                {r.admin_note && (
                  <p className="text-xs text-muted italic border-l-2 border-outline/40 pl-2">
                    Note : {r.admin_note}
                  </p>
                )}

                {r.status === 'en_attente' && (
                  <div className="flex gap-2 pt-2 border-t border-outline/30">
                    <Button variant="ghost" className="flex-1 text-red-500" onClick={() => setRejecting(r)}>
                      <X size={16} /> Rejeter
                    </Button>
                    <Button className="flex-1" onClick={() => approve(r)}>
                      <Check size={16} /> Approuver
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal rejet */}
        {rejecting && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
            <div className="bg-card-light dark:bg-card-dark w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5">
              <h2 className="font-heading font-bold text-lg mb-3">Rejeter la modification</h2>
              <label className="text-xs font-semibold text-muted">Raison *</label>
              <textarea
                className="input mt-1 min-h-[100px] resize-none text-sm"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Expliquez au collecteur pourquoi la modification est refusée…"
              />
              <div className="flex gap-3 mt-4">
                <Button variant="ghost" className="flex-1" onClick={() => { setRejecting(null); setReason(''); }}>
                  Annuler
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  disabled={!reason.trim()}
                  onClick={reject}
                >
                  Confirmer le rejet
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}