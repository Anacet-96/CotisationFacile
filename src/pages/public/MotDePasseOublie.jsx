import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  function submit(e) {
    e.preventDefault();
    setErr('');
    if (!email || !email.includes('@')) return setErr('Entrez un email valide.');
    // TODO Supabase : supabase.auth.resetPasswordForEmail(email)
    setSent(true);
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-md mx-auto">
        <Link
          to="/connexion"
          className="inline-flex items-center gap-2 text-sm text-muted mb-6"
        >
          <ArrowLeft size={16} /> Retour à la connexion
        </Link>

        {!sent ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-primary-light/10 dark:bg-primary-dark/20 flex items-center justify-center mb-5">
              <Mail size={28} className="text-primary-light dark:text-primary-dark" />
            </div>
            <h1 className="text-3xl font-heading font-extrabold mb-2">
              Mot de passe oublié ?
            </h1>
            <p className="text-sm text-muted mb-8">
              Entrez l'adresse email associée à votre compte. Nous vous enverrons
              un lien pour réinitialiser votre mot de passe.
            </p>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted">Adresse email</label>
                <input
                  className="input mt-1"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                />
              </div>

              {err && <p className="text-sm text-red-500">{err}</p>}

              <Button type="submit" className="w-full">
                Envoyer le lien de réinitialisation
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-secondary-light/15 dark:bg-secondary-dark/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={44} className="text-secondary-light dark:text-secondary-dark" />
            </div>
            <h1 className="text-2xl font-heading font-extrabold mb-3">Email envoyé !</h1>
            <p className="text-muted max-w-sm mx-auto mb-8">
              Un email a été envoyé à <b className="text-content-light dark:text-content-dark">{email}</b>.
              Suivez le lien pour réinitialiser votre mot de passe.
            </p>
            <Link to="/connexion" className="btn-ghost inline-block">Retour à la connexion</Link>
          </div>
        )}
      </div>
    </div>
  );
}