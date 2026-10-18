import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { cx } from '../../lib/helpers';

const VILLES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon'];

export default function Inscription() {
  const nav = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstname: '', lastname: '', phone: '', email: '', password: '',
    city: '', district: '', profession: '',
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  // Validation de l'étape en cours avant de passer à la suivante
  function next() {
    setErr('');
    if (step === 1) {
      if (!form.firstname || !form.lastname || !form.phone) {
        return setErr('Prénom, Nom et Téléphone sont obligatoires.');
      }
    } else if (step === 2) {
      if (!form.email || !form.password) {
        return setErr('Email et Mot de passe sont obligatoires.');
      }
      if (!form.email.includes('@')) return setErr('Adresse email invalide.');
      if (form.password.length < 6) return setErr('Le mot de passe doit faire au moins 6 caractères.');
    }
    setStep(s => s + 1);
  }

  function prev() {
    setErr('');
    setStep(s => s - 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');

    if (!form.city || !form.district) {
      return setErr('Ville et Quartier sont obligatoires.');
    }

    setLoading(true);
    const res = await signUp({
      name: `${form.firstname} ${form.lastname}`.trim(),
      firstname: form.firstname,
      lastname: form.lastname,
      phone: form.phone,
      email: form.email,
      password: form.password,
      city: form.city,
      district: form.district,
      profession: form.profession || null,
      status: 'en_attente',
    });
    setLoading(false);

    if (res.error) return setErr(res.error);
    if (res.needsConfirmation) {
      return setErr('Un email de confirmation vous a été envoyé. Vérifiez votre boîte mail.');
    }
    nav('/confirmation?type=register');
  }

  return (
    <div className="py-10 px-4 min-h-[calc(100vh-80px)] flex flex-col">
      <div className="max-w-md mx-auto w-full">
        
        <div className="text-center mb-8">
          <p className="text-sm text-muted mb-1">Créez votre compte</p>
          <h1 className="text-3xl font-heading font-extrabold">Étape {step} sur 3</h1>
        </div>

        {/* Barre de progression */}
        <div className="flex items-center justify-between mb-8 relative px-2">
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-outline/30 -z-10 rounded-full"></div>
          <div 
            className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-primary-light dark:bg-primary-dark -z-10 rounded-full transition-all duration-300" 
            style={{ width: `calc(${((step - 1) / 2) * 100}% - 1rem)` }}
          ></div>
          
          {[1, 2, 3].map(num => (
            <div key={num} className="flex flex-col items-center gap-2">
              <div className={cx(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors bg-surface-light dark:bg-surface-dark',
                step > num ? 'bg-primary-light border-primary-light text-white dark:bg-primary-dark dark:border-primary-dark' :
                step === num ? 'border-primary-light text-primary-light dark:border-primary-dark dark:text-primary-dark' :
                'border-outline/50 text-muted'
              )}>
                {step > num ? <Check size={18} /> : num}
              </div>
            </div>
          ))}
        </div>

        {/* Formulaire */}
        <form 
          onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); next(); }} 
          className="bg-card-light dark:bg-card-dark rounded-2xl border border-outline/40 p-6 shadow-sm"
        >
          {/* ÉTAPE 1 : Identité */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prénom *" value={form.firstname} onChange={v => set('firstname', v)} placeholder="Ex: Grâce" />
                <Field label="Nom *" value={form.lastname} onChange={v => set('lastname', v)} placeholder="Ex: Houngbo" />
              </div>
              <Field label="Téléphone *" type="tel" placeholder="+229 ..." value={form.phone} onChange={v => set('phone', v)} />
            </div>
          )}

          {/* ÉTAPE 2 : Connexion */}
          {step === 2 && (
            <div className="space-y-4">
              <Field label="Adresse email *" type="email" placeholder="vous@exemple.com" value={form.email} onChange={v => set('email', v)} />
              <Field label="Mot de passe *" type="password" placeholder="Au moins 6 caractères" value={form.password} onChange={v => set('password', v)} />
            </div>
          )}

          {/* ÉTAPE 3 : Localisation */}
          {step === 3 && (
            <div className="space-y-4">
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
              <Field label="Quartier *" placeholder="Ex: Akpakpa" value={form.district} onChange={v => set('district', v)} />
              <Field label="Profession (facultatif)" placeholder="Ex: Commerçante" value={form.profession} onChange={v => set('profession', v)} />
            </div>
          )}

          {/* Message d'erreur */}
          {err && (
            <div className="mt-4 p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium">
              {err}
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-outline/30">
            {step > 1 ? (
              <Button type="button" variant="ghost" onClick={prev} disabled={loading} className="px-4">
                <ArrowLeft size={18} className="mr-2" /> Retour
              </Button>
            ) : (
              <div className="w-10"></div> // Espaceur invisible
            )}

            {step < 3 ? (
              <Button type="submit" className="px-6">
                Suivant <ArrowRight size={18} className="ml-2" />
              </Button>
            ) : (
              <Button type="submit" className="px-6 bg-secondary-light hover:bg-secondary-light/90 dark:bg-secondary-dark" disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : "S'inscrire"}
              </Button>
            )}
          </div>
        </form>

        <p className="text-center text-sm text-muted mt-8">
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