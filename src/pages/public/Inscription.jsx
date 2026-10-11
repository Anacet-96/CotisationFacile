import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

const VILLES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon'];

export default function Inscription() {
  const nav = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    firstname: '', lastname: '', phone: '', email: '', password: '',
    city: '', district: '', profession: '',
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!form.firstname || !form.lastname || !form.phone || !form.email || !form.password)
      return setErr('Tous les champs sont obligatoires (sauf Profession).');
    if (!form.city || !form.district)
      return setErr('Ville et Quartier sont obligatoires (pour vous attribuer un collecteur).');
    if (form.password.length < 6)
      return setErr('Le mot de passe doit faire au moins 6 caractères.');

    setLoading(true);
    // TODO Supabase : supabase.auth.signUp() + INSERT profiles
    const res = await signUp({
      name: `${form.firstname} ${form.lastname}`.trim(),
      firstname: form.firstname,
      lastname: form.lastname,
      phone: form.phone,
      email: form.email,
      city: form.city,
      district: form.district,
      profession: form.profession || null,
    });
    setLoading(false);
    if (res.error) return setErr(res.error);
    nav('/confirmation?type=register');
  }

  return (
    <div className="py-10 px-4">
      <div className="max-w-lg mx-auto border border-outline/30 rounded-xl p-6 bg-white dark:bg-surface-dark shadow-lg">
        <p className="text-sm text-muted mb-1">Créez votre compte pour commencer</p>
        <h1 className="text-3xl font-heading font-extrabold mb-8">Bienvenue 👋</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom *" value={form.firstname} onChange={v => set('firstname', v)} />
            <Field label="Nom *" value={form.lastname} onChange={v => set('lastname', v)} />
          </div>
          <Field label="Téléphone *" type="tel" placeholder="+229 ..." value={form.phone} onChange={v => set('phone', v)} />
          <Field label="Adresse email *" type="email" value={form.email} onChange={v => set('email', v)} />
          <Field label="Mot de passe *" type="password" value={form.password} onChange={v => set('password', v)} />

          <div>
            <label className="text-xs font-semibold text-muted">Ville *</label>
            <select
              className="input mt-1"
              value={form.city}
              onChange={e => set('city', e.target.value)}
            >
              <option value="">— Choisir —</option>
              {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <Field
            label="Quartier *"
            placeholder="Ex: Akpakpa"
            value={form.district}
            onChange={v => set('district', v)}
          />
          <Field
            label="Profession (facultatif)"
            value={form.profession}
            onChange={v => set('profession', v)}
          />

          {err && (
            <p className="text-sm text-red-500 bg-red-500/10 rounded-xl p-3">{err}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Création…' : "S'inscrire"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Déjà un compte ?{' '}
          <Link to="/connexion" className="text-primary-light dark:text-primary-dark font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, onChange, ...props }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted">{label}</label>
      <input
        className="input mt-1"
        onChange={e => onChange(e.target.value)}
        {...props}
      />
    </div>
  );
}