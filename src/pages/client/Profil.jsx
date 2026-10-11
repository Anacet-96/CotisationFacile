import { useState } from 'react';
import { Copy, Check, Lock, LogOut, UserCheck, ShieldQuestion, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockUsers } from '../../lib/mockData';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';

export default function Profil() {
  const { user, signOut } = useAuth();
  const [copied, setCopied] = useState(false);
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState('');

  const collector = mockUsers.find(u => u.id === user?.collector_id);
  const secretaire = mockUsers.find(u => u.role === 'secretaire');

  function copyNum() {
    if (!user?.client_number) return;
    navigator.clipboard.writeText(user.client_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function changePwd(e) {
    e.preventDefault();
    setMsg('');
    if (!pwd.current || !pwd.next || !pwd.confirm) return setMsg('Tous les champs sont requis.');
    if (pwd.next.length < 6) return setMsg('Le nouveau mot de passe doit faire au moins 6 caractères.');
    if (pwd.next !== pwd.confirm) return setMsg('Les deux mots de passe ne correspondent pas.');
    // TODO Supabase : supabase.auth.updateUser({ password: pwd.next })
    setMsg('✓ Mot de passe mis à jour (mock).');
    setPwd({ current: '', next: '', confirm: '' });
  }

  return (
    <>
      <Header title="Mon profil" />
      <div className="p-4 max-w-lg mx-auto space-y-4">

        {/* Numéro client */}
        <div className="card">
          <p className="text-xs text-muted mb-1">Numéro client</p>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xl font-bold">{user?.client_number || '—'}</span>
            <button
              onClick={copyNum}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              title="Copier"
            >
              {copied ? <Check size={18} className="text-secondary-light" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        {/* Infos lecture seule */}
        <div className="card space-y-3">
          <h3 className="font-heading font-bold">Informations</h3>
          <Row label="Nom complet" value={user?.name} />
          <Row label="Téléphone" value={user?.phone} />
          <Row label="Ville" value={user?.city} />
          <Row label="Quartier" value={user?.district} />
          <Row label="Profession" value={user?.profession || '—'} />
          <p className="text-xs text-muted flex items-start gap-2 pt-2 border-t border-outline/30">
            <Lock size={14} className="shrink-0 mt-0.5" />
            Ces informations sont en lecture seule. Contactez votre collecteur pour les modifier.
          </p>
        </div>

        {/* Contact collecteur */}
        {collector && (
          <div className="card">
            <h3 className="font-heading font-bold mb-3 flex items-center gap-2">
              <UserCheck size={18} className="text-primary-light dark:text-primary-dark" />
              Mon collecteur
            </h3>
            <Row label="Nom" value={collector.name} />
            <div className="mt-2">
              <a
                href={`tel:${collector.phone.replace(/\s/g, '')}`}
                className="btn-ghost w-full mt-3 flex items-center justify-center gap-2"
              >
                <Phone size={16} /> {collector.phone}
              </a>
            </div>
          </div>
        )}

        {/* Contact secrétaire en cas de problème */}
        {secretaire && (
          <div className="card border-2 border-amber-500/30 dark:border-amber-400/30">
            <h3 className="font-heading font-bold mb-2 flex items-center gap-2">
              <ShieldQuestion size={18} className="text-amber-600 dark:text-amber-400" />
              Un problème avec votre collecteur ?
            </h3>
            <p className="text-xs text-muted mb-3">
              Contactez votre secrétaire. Elle est là pour vous assister en cas de désaccord,
              absence prolongée ou toute autre difficulté.
            </p>
            <Row label="Secrétaire" value={secretaire.name} />
            <a
              href={`tel:${secretaire.phone.replace(/\s/g, '')}`}
              className="btn-ghost w-full mt-3 flex items-center justify-center gap-2"
            >
              <Phone size={16} /> {secretaire.phone}
            </a>
          </div>
        )}

        {/* Mot de passe */}
        <form onSubmit={changePwd} className="card space-y-3">
          <h3 className="font-heading font-bold">Changer mon mot de passe</h3>
          <input className="input" type="password" placeholder="Mot de passe actuel"
            value={pwd.current} onChange={e => setPwd(p => ({ ...p, current: e.target.value }))} />
          <input className="input" type="password" placeholder="Nouveau mot de passe"
            value={pwd.next} onChange={e => setPwd(p => ({ ...p, next: e.target.value }))} />
          <input className="input" type="password" placeholder="Confirmer le nouveau"
            value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} />

          {msg && <p className={`text-xs ${msg.startsWith('✓') ? 'text-secondary-light' : 'text-red-500'}`}>{msg}</p>}

          <Button type="submit" className="w-full">Mettre à jour</Button>
        </form>

        {/* Déconnexion */}
        <Button variant="ghost" className="w-full text-red-500" onClick={signOut}>
          <LogOut size={18} /> Se déconnecter
        </Button>
      </div>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-right max-w-[60%] truncate">{value || '—'}</span>
    </div>
  );
}