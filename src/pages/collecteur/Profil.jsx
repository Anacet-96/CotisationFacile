import { useState } from 'react';
import { Copy, Check, LogOut, Users, CreditCard, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockCards, mockCardDays, mockProducts, mockUsers } from '../../lib/mockData';
import { getCollectorClients, getCollectorCards, getCollectorStats } from '../../lib/collectorHelpers';
import { formatFCFA } from '../../lib/helpers';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';

export default function Profil() {
  const { user, signOut } = useAuth();
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState('');

  const clients = getCollectorClients(user.id, mockUsers);
  const myCards = getCollectorCards(user.id, mockCards);
  const activeCards = myCards.filter(c => c.status === 'actif').length;
  const monthStats = getCollectorStats(user.id, 'mois', mockCards, mockCardDays, mockProducts);

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

        {/* Bannière */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-light to-indigo-700 dark:from-primary-dark dark:to-indigo-600 text-white p-5 shadow-lg">
          <p className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">
            Espace collecteur
          </p>
          <h2 className="font-heading font-extrabold text-xl mt-1">{user?.name}</h2>
          <p className="text-xs opacity-80 font-mono mt-0.5">{user?.phone}</p>
        </div>

        {/* Stats personnelles */}
        <div>
          <h3 className="font-heading font-bold mb-2">Mes statistiques</h3>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat icon={Users} label="Clients" value={clients.length} />
            <MiniStat icon={CreditCard} label="Cartes actives" value={activeCards} />
            <MiniStat icon={TrendingUp} label="Ce mois" value={formatFCFA(monthStats.total).replace(' FCFA', '')} mono />
          </div>
        </div>

        {/* Infos */}
        <div className="card space-y-3">
          <h3 className="font-heading font-bold">Mes informations</h3>
          <Row label="Nom complet" value={user?.name} />
          <Row label="Téléphone" value={user?.phone} />
          <Row label="Ville" value={user?.city} />
          <Row label="Quartier" value={user?.district} />
        </div>

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

function MiniStat({ icon: Icon, label, value, mono }) {
  return (
    <div className="card p-3">
      <Icon size={16} className="text-primary-light dark:text-primary-dark mb-2" />
      <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1 truncate">
        {label}
      </p>
      <p className={`font-extrabold text-lg leading-none ${mono ? 'font-mono' : 'font-heading'}`}>
        {value}
      </p>
    </div>
  );
}