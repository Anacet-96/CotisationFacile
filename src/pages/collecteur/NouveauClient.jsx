import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Copy, Check, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabaseCreateUser } from '../../lib/supabaseClient';
import { useMockStore } from '../../lib/mockStore';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';

const VILLES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon'];

function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let pwd = '';
  for (let i = 0; i < 8; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd + '!';
}

export default function NouveauClient() {
  const nav = useNavigate();
  const { user } = useAuth();
  const store = useMockStore();

  const [form, setForm] = useState({
    firstname: '', lastname: '', phone: '', email: '',
    city: '', district: '', profession: '',
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setErr('');

    if (!form.firstname || !form.lastname || !form.phone || !form.email || !form.city || !form.district) {
      return setErr('Prénom, Nom, Email, Téléphone, Ville et Quartier sont obligatoires.');
    }
    if (!form.email.includes('@')) {
      return setErr('Email invalide.');
    }

    setLoading(true);
    const tempPassword = generateTempPassword();

    // TODO Supabase prod : utiliser une Edge Function avec service_role
    // pour éviter que le client puisse s'attribuer un rôle malveillant.
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
          role: 'client',
          status: 'actif',           // créé par le collecteur → validé direct
          collector_id: user.id,     // assigné au collecteur qui le crée
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

    // Se déconnecter immédiatement du client secondaire (le collecteur n'est PAS affecté)
    await supabaseCreateUser.auth.signOut().catch(() => {});

    setLoading(false);
    setCreated({
      name: `${form.firstname} ${form.lastname}`.trim(),
      email: form.email.trim(),
      password: tempPassword,
    });
  }

  function copyCredentials() {
    if (!created) return;
    const text = `Email : ${created.email}\nMot de passe : ${created.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ============================================================
  // ÉCRAN SUCCÈS
  // ============================================================
  if (created) {
    return (
      <>
        <Header title="Client créé" />
        <div className="p-6 max-w-lg mx-auto space-y-4">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-secondary-light/15 dark:bg-secondary-dark/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={44} className="text-secondary-light dark:text-secondary-dark" />
            </div>
            <h1 className="text-2xl font-heading font-extrabold mb-3">Client créé !</h1>
            <p className="text-muted text-sm">
              Communiquez ces identifiants au client. Il pourra changer son mot de passe depuis son profil.
            </p>
          </div>

          <div className="card border-2 border-primary-light/40 dark:border-primary-dark/40 space-y-3">
            <div>
              <p className="text-xs text-muted mb-1">Email</p>
              <p className="font-mono text-sm break-all">{created.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Mot de passe temporaire</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-lg font-bold flex-1 break-all">
                  {showPwd ? created.password : '•••••••••'}
                </p>
                <button
                  onClick={() => setShowPwd(s => !s)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
                  aria-label={showPwd ? 'Cacher' : 'Afficher'}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button variant="ghost" className="w-full" onClick={copyCredentials}>
              {copied ? <><Check size={16} /> Copié</> : <><Copy size={16} /> Copier</>}
            </Button>
          </div>

          <div className="card bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              ⚠️ <b>Notez ce mot de passe maintenant.</b> Il ne sera plus jamais affiché.
            </p>
          </div>

          <Button className="w-full" onClick={() => nav('/collecteur')}>
            Retour à mes clients
          </Button>
        </div>
      </>
    );
  }

  // ============================================================
  // FORMULAIRE
  // ============================================================
  return (
    <>
      <Header title="Nouveau client" />
      <div className="p-4 max-w-lg mx-auto space-y-4">
        <Link to="/collecteur" className="flex items-center gap-2 text-sm text-muted">
          <ArrowLeft size={16} /> Retour
        </Link>

        <div className="card">
          <p className="text-sm text-muted">
            Créez le compte d'un client qui n'est pas à l'aise avec la technologie. Un mot de passe temporaire
            sera généré et affiché à la fin.
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-4">
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
            <label className="text-xs font-semibold text-muted">Ville *</label>
            <select className="input mt-1" value={form.city} onChange={e => set('city', e.target.value)}>
              <option value="">— Choisir —</option>
              {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted">Quartier *</label>
            <input className="input mt-1" value={form.district} onChange={e => set('district', e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted">Profession (facultatif)</label>
            <input className="input mt-1" value={form.profession} onChange={e => set('profession', e.target.value)} />
          </div>

          {err && <p className="text-sm text-red-500 bg-red-500/10 rounded-xl p-3">{err}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Créer le compte client'}
          </Button>
        </form>
      </div>
    </>
  );
}