import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Users, Shield, ArrowRight, Phone, MapPin,
  Check, X, Clock, Loader2, UserPlus, Copy, Eye, EyeOff, CheckCircle2,
} from 'lucide-react';
import {
  useMockStore,
  approveClientRegistration,
  rejectClientRegistration,
} from '../../lib/mockStore';
import { supabaseCreateUser } from '../../lib/supabaseClient';
import { cx } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

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

const VILLES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon'];

function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let pwd = '';
  for (let i = 0; i < 8; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd + '!';
}

export default function Comptes() {
  const store = useMockStore();
  const [filtre, setFiltre] = useState('tous');
  const [query, setQuery] = useState('');
  const [rejecting, setRejecting] = useState(null);
  const [toast, setToast] = useState(null);
  
  // États pour la création de compte
  const [createOpen, setCreateOpen] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

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
    if (filtre === 'en_attente') list = clientsEnAttente;
    else if (filtre === 'tous') list = store.users;
    else list = store.users.filter(u => u.role === filtre);

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

        {/* Bandeau + Bouton Créer */}
        <div className="card border-2 border-primary-light/30 dark:border-primary-dark/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-light/15 dark:bg-primary-dark/20 flex items-center justify-center shrink-0">
            <Shield size={18} className="text-primary-light dark:text-primary-dark" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Gestion des comptes</p>
            <p className="text-xs text-muted">
              Créez des collaborateurs, validez les inscriptions et attribuez les rôles.
            </p>
          </div>
          <Button className="shrink-0 text-sm" onClick={() => setCreateOpen(true)}>
            <UserPlus size={16} /> Créer
          </Button>
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

        {/* Liste */}
        {filteredUsers.length === 0 && (
          <div className="card text-center py-10">
            <Users size={32} className="mx-auto mb-3 text-muted" />
            <p className="text-muted text-sm">
              {filtre === 'en_attente' ? 'Aucune inscription en attente. 🎉' : 'Aucun utilisateur trouvé.'}
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map(u => {
            const isPending = u.role === 'client' && u.status === 'en_attente';
            return (
              <div key={u.id} className="card flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-heading font-bold truncate">{u.name}</p>
                    <p className="text-xs text-muted font-mono truncate">{u.client_number || u.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge color={ROLE_COLORS[u.role] || 'neutral'}>{ROLE_LABELS[u.role] || u.role}</Badge>
                    {isPending && <Badge color="warning">En attente</Badge>}
                  </div>
                </div>

                <div className="text-xs text-muted space-y-0.5">
                  <p className="flex items-center gap-1.5 truncate"><Phone size={12} /> {u.phone}</p>
                  {u.city && <p className="flex items-center gap-1.5 truncate"><MapPin size={12} /> {u.district}, {u.city}</p>}
                </div>

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

      {/* Modal création de compte */}
      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        collectors={collectors}
        onCreated={(userData) => {
          setCreateOpen(false);
          setCreatedUser(userData);
        }}
      />

      {/* Modal succès (affichage des identifiants) */}
      {createdUser && (
        <SuccessCredentialsModal
          userData={createdUser}
          onClose={() => setCreatedUser(null)}
        />
      )}

      {/* Modal de rejet */}
      {rejecting && (
        <Modal
          open
          onClose={() => setRejecting(null)}
          title="Rejeter l'inscription"
          footer={
            <>
              <Button variant="ghost" className="flex-1" onClick={() => setRejecting(null)}>Annuler</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" disabled={!rejecting.reason.trim()} onClick={handleReject}>
                Confirmer
              </Button>
            </>
          }
        >
          <p className="text-sm text-muted mb-3">
            Client : <b className="text-content-light dark:text-content-dark">{rejecting.client.name}</b>
          </p>
          <label className="text-xs font-semibold text-muted">Raison *</label>
          <textarea
            className="input mt-1 min-h-[100px] resize-none text-sm"
            value={rejecting.reason}
            onChange={e => setRejecting(r => ({ ...r, reason: e.target.value }))}
            placeholder="Expliquez la raison du rejet…"
          />
        </Modal>
      )}
    </>
  );
}

// ============================================================
// Sous-composant : actions en attente
// ============================================================
function PendingActions({ client, collectors, onApprove, onReject }) {
  const [collectorId, setCollectorId] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="pt-2 border-t border-outline/30 space-y-2">
      <div>
        <label className="text-[10px] font-semibold text-muted uppercase tracking-wide">Assigner à un collecteur</label>
        <select value={collectorId} onChange={e => setCollectorId(e.target.value)} className="input mt-1 text-sm">
          <option value="">— Aucun —</option>
          {collectors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" className="flex-1 text-red-500 text-xs" onClick={() => onReject(client)} disabled={loading}>
          <X size={14} /> Rejeter
        </Button>
        <Button className="flex-1 text-xs" onClick={async () => { setLoading(true); await onApprove(client.id, collectorId || null); setLoading(false); }} disabled={loading}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Approuver</>}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Sous-composant : Modal de création
// ============================================================
function CreateUserModal({ open, onClose, collectors, onCreated }) {
  const [form, setForm] = useState({
    firstname: '', lastname: '', phone: '', email: '',
    city: 'Cotonou', district: '', profession: '',
    role: 'client', collector_id: '',
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!form.firstname || !form.lastname || !form.email || !form.phone) {
      return setErr('Prénom, Nom, Email et Téléphone sont requis.');
    }

    setLoading(true);
    const tempPassword = generateTempPassword();

    // 1. Créer le compte dans auth.users via le client secondaire
    const { data, error } = await supabaseCreateUser.auth.signUp({
      email: form.email.trim(),
      password: tempPassword,
      options: {
        data: {
          name: `${form.firstname} ${form.lastname}`.trim(),
          phone: form.phone,
          city: form.city,
          district: form.district,
          profession: form.profession || null,
          role: form.role,
          status: 'actif', // Créé par l'admin = validé direct
          collector_id: form.role === 'client' && form.collector_id ? form.collector_id : null,
        },
      },
    });

    if (error) {
      setLoading(false);
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return setErr('Cet email est déjà utilisé.');
      }
      return setErr(error.message);
    }

    await supabaseCreateUser.auth.signOut().catch(() => {});
    setLoading(false);
    
    onCreated({
      name: `${form.firstname} ${form.lastname}`.trim(),
      email: form.email.trim(),
      password: tempPassword,
      role: form.role,
    });
    
    // Reset form
    setForm({ firstname: '', lastname: '', phone: '', email: '', city: 'Cotonou', district: '', profession: '', role: 'client', collector_id: '' });
  }

  return (
    <Modal
      open={open}
      onClose={() => !loading && onClose()}
      title="Créer un compte"
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Créer le compte'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted">Prénom *</label>
            <input className="input mt-1" value={form.firstname} onChange={e => set('firstname', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted">Nom *</label>
            <input className="input mt-1" value={form.lastname} onChange={e => set('lastname', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted">Email *</label>
          <input className="input mt-1" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted">Téléphone *</label>
          <input className="input mt-1" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted">Rôle</label>
          <select className="input mt-1" value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="client">Client</option>
            <option value="collecteur">Collecteur</option>
            <option value="secretaire">Secrétaire</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>

        {form.role === 'client' && (
          <div>
            <label className="text-xs font-semibold text-muted">Assigner à un collecteur</label>
            <select className="input mt-1" value={form.collector_id} onChange={e => set('collector_id', e.target.value)}>
              <option value="">— Aucun —</option>
              {collectors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted">Ville</label>
            <select className="input mt-1" value={form.city} onChange={e => set('city', e.target.value)}>
              {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted">Quartier</label>
            <input className="input mt-1" value={form.district} onChange={e => set('district', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted">Profession (facultatif)</label>
          <input className="input mt-1" value={form.profession} onChange={e => set('profession', e.target.value)} />
        </div>

        {err && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded-lg">{err}</p>}
      </div>
    </Modal>
  );
}

// ============================================================
// Sous-composant : Modal succès
// ============================================================
function SuccessCredentialsModal({ userData, onClose }) {
  const [showPwd, setShowPwd] = useState(false);
  const [copied, setCopied] = useState(false);

  function copy() {
    const text = `Email : ${userData.email}\nMot de passe : ${userData.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Compte créé !"
      footer={<Button className="w-full" onClick={onClose}>Terminé</Button>}
    >
      <div className="text-center mb-4">
        <div className="w-16 h-16 rounded-full bg-secondary-light/15 dark:bg-secondary-dark/20 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={32} className="text-secondary-light dark:text-secondary-dark" />
        </div>
        <p className="text-sm text-muted">
          Le compte <b>{userData.role}</b> pour <b>{userData.name}</b> a été créé avec succès.
        </p>
      </div>

      <div className="card bg-black/5 dark:bg-white/5 space-y-3 mb-4">
        <div>
          <p className="text-xs text-muted mb-1">Email</p>
          <p className="font-mono text-sm break-all">{userData.email}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Mot de passe temporaire</p>
          <div className="flex items-center gap-2">
            <p className="font-mono text-lg font-bold flex-1 break-all">
              {showPwd ? userData.password : '•••••••••'}
            </p>
            <button onClick={() => setShowPwd(s => !s)} className="p-2 rounded-full hover:bg-black/10">
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <Button variant="ghost" className="w-full" onClick={copy}>
          {copied ? <><Check size={16} /> Copié</> : <><Copy size={16} /> Copier</>}
        </Button>
      </div>

      <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-xl">
        ⚠️ Notez ce mot de passe maintenant. Il ne sera plus jamais affiché.
      </p>
    </Modal>
  );
}