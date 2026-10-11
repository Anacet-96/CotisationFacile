import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Phone, MapPin, Briefcase, Shield, Check,
  CreditCard, TrendingUp, Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMockStore, changeUserRole, assignCollectorToClient } from '../../lib/mockStore';
import { formatFCFA, cx } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const ROLES = [
  { key: 'client', label: 'Client', color: 'primary' },
  { key: 'collecteur', label: 'Collecteur', color: 'success' },
  { key: 'secretaire', label: 'Secrétaire', color: 'warning' },
  { key: 'admin', label: 'Admin', color: 'danger' },
];

export default function CompteDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user: me } = useAuth();
  const store = useMockStore();
  const [toast, setToast] = useState(null);

  const account = store.users.find(u => u.id === id);

  if (!account) {
    return (
      <>
        <Header title="Compte" />
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <Link to="/admin/comptes" className="flex items-center gap-2 text-sm text-muted">
            <ArrowLeft size={16} /> Retour
          </Link>
          <div className="card text-center py-8">
            <p className="text-muted mb-4">Utilisateur introuvable.</p>
            <Link to="/admin/comptes" className="btn-primary inline-flex">
              Retour aux comptes
            </Link>
          </div>
        </div>
      </>
    );
  }

  const isSelf = account.id === me.id;
  const collectors = store.users.filter(u => u.role === 'collecteur');
  const myCards = store.cards.filter(c => c.client_id === account.id);
  const myCardIds = myCards.map(c => c.id);
  const totalCollected = store.cardDays
    .filter(d => myCardIds.includes(d.card_id) && d.filled)
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  const myCollector = store.users.find(u => u.id === account.collector_id);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleRoleChange(newRole) {
    if (isSelf && newRole !== 'admin') {
      showToast("⚠️ Vous ne pouvez pas vous retirer vos propres droits admin.");
      return;
    }
    // TODO Supabase : UPDATE profiles SET role=newRole WHERE id=account.id
    changeUserRole(account.id, newRole);
    showToast(`✅ Rôle changé : ${newRole}`);
  }

  return (
    <>
      <Header title={account.name} />

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%]">
          <div className="rounded-xl bg-secondary-light dark:bg-secondary-dark text-white px-4 py-3 shadow-lg text-sm font-medium">
            {toast}
          </div>
        </div>
      )}

      <div className="p-4 max-w-lg mx-auto lg:max-w-3xl space-y-4">

        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm text-muted">
          <ArrowLeft size={16} /> Retour
        </button>

        {/* Carte identité */}
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary-light/15 dark:bg-primary-dark/20 flex items-center justify-center shrink-0">
              <span className="font-heading font-extrabold text-2xl text-primary-light dark:text-primary-dark">
                {account.name?.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="font-heading font-bold text-lg truncate">{account.name}</h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <Badge color={ROLES.find(r => r.key === account.role)?.color || 'neutral'}>
                  {ROLES.find(r => r.key === account.role)?.label || account.role}
                </Badge>
                {account.client_number && (
                  <Badge color="neutral" className="font-mono">{account.client_number}</Badge>
                )}
                {account.status === 'en_attente' && <Badge color="warning">En attente</Badge>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <InfoRow icon={Phone} label="Téléphone" value={account.phone} />
            <InfoRow icon={MapPin} label="Ville" value={account.city} />
            <InfoRow icon={MapPin} label="Quartier" value={account.district} />
            <InfoRow icon={Briefcase} label="Profession" value={account.profession || '—'} />
          </div>
        </div>

        {/* Stats (si client) */}
        {account.role === 'client' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="card">
              <CreditCard size={16} className="text-primary-light dark:text-primary-dark mb-2" />
              <p className="text-[10px] text-muted font-semibold uppercase tracking-wide">Cartes</p>
              <p className="font-mono font-extrabold text-xl">{myCards.length}</p>
            </div>
            <div className="card">
              <TrendingUp size={16} className="text-secondary-light dark:text-secondary-dark mb-2" />
              <p className="text-[10px] text-muted font-semibold uppercase tracking-wide">Total cotisé</p>
              <p className="font-mono font-extrabold text-lg truncate">
                {formatFCFA(totalCollected).replace(' FCFA', '')}
              </p>
            </div>
          </div>
        )}

        {/* Assignation collecteur (si client) */}
        {account.role === 'client' && (
          <div className="card">
            <h3 className="font-heading font-bold mb-2">Collecteur assigné</h3>
            <select
              value={account.collector_id || ''}
              onChange={e => {
                // TODO Supabase : UPDATE profiles SET collector_id=...
                assignCollectorToClient(account.id, e.target.value || null);
                showToast('✅ Collecteur mis à jour.');
              }}
              className="input"
            >
              <option value="">— Aucun —</option>
              {collectors.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
              ))}
            </select>
            {myCollector && (
              <p className="text-xs text-muted mt-2 font-mono">
                {myCollector.phone}
              </p>
            )}
          </div>
        )}

        {/* Changement de rôle */}
        <div className="card">
          <h3 className="font-heading font-bold mb-1 flex items-center gap-2">
            <Shield size={18} className="text-primary-light dark:text-primary-dark" />
            Rôle de l'utilisateur
          </h3>
          {isSelf && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-3 flex items-start gap-1.5">
              <Lock size={12} className="shrink-0 mt-0.5" />
              Vous ne pouvez pas retirer vos propres droits admin.
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            {ROLES.map(r => {
              const isActive = account.role === r.key;
              const disabled = isSelf && r.key !== 'admin';
              return (
                <button
                  key={r.key}
                  disabled={disabled}
                  onClick={() => handleRoleChange(r.key)}
                  className={cx(
                    'p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition min-h-[80px]',
                    isActive
                      ? 'border-primary-light dark:border-primary-dark bg-primary-light/10 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark'
                      : 'border-outline/40 hover:border-primary-light/40 dark:hover:border-primary-dark/40',
                    disabled && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  {isActive && <Check size={16} />}
                  <span className="text-xs font-semibold">{r.label}</span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-muted mt-3">
            ⚠️ Une fois promu, un utilisateur conserve son numéro client (s'il en a un) mais change d'espace.
          </p>
        </div>
      </div>
    </>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-muted mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
        <p className="font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}