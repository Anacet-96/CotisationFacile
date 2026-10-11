import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function Confirmation() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface-light dark:bg-surface-dark text-center">
      <div className="w-24 h-24 rounded-full bg-secondary-light/15 dark:bg-secondary-dark/20 flex items-center justify-center mb-6">
        <CheckCircle2 size={56} className="text-secondary-light dark:text-secondary-dark" />
      </div>
      <h1 className="text-2xl font-heading font-extrabold mb-3">Compte créé !</h1>
      <p className="text-muted max-w-sm mb-8">
        Bienvenue chez Emilio Transports. Un collecteur vous sera attribué selon votre ville et quartier. Vous serez notifié dès que votre compte est validé.
      </p>
      <Link to="/client" className="w-full max-w-xs">
        <Button className="w-full">Aller à mon espace</Button>
      </Link>
    </div>
  );
}