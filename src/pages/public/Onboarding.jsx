import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PiggyBank, UserCheck, LineChart, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { cx } from '../../lib/helpers';

const SLIDES = [
  {
    icon: PiggyBank,
    title: 'Épargnez à votre rythme',
    text: "Cotisez chaque jour une petite somme. Pas de crédit, pas d'intérêts. Vous payez progressivement.",
  },
  {
    icon: UserCheck,
    title: 'Un collecteur de confiance',
    text: "Un agent passe chez vous, encaisse votre mise et signe votre carte. Chaque paiement est tracé dans l'app.",
  },
  {
    icon: LineChart,
    title: 'Suivez votre progression',
    text: 'Consultez à tout moment votre carte, le nombre de jours payés et ce qu\'il vous reste.',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const nav = useNavigate();
  const slide = SLIDES[step];
  const Icon = slide.icon;
  const isFirst = step === 0;
  const isLast = step === SLIDES.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
        <div className="w-24 h-24 rounded-3xl bg-primary-light/10 dark:bg-primary-dark/20 flex items-center justify-center mb-8">
          <Icon size={48} className="text-primary-light dark:text-primary-dark" />
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-center mb-4">
          {slide.title}
        </h1>
        <p className="text-center text-muted leading-relaxed">{slide.text}</p>
      </div>

      {/* Dots cliquables */}
      <div className="flex justify-center gap-2 pb-6">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            aria-label={`Slide ${i + 1}`}
            className={cx(
              'h-2 rounded-full transition-all',
              i === step ? 'w-8 bg-primary-light dark:bg-primary-dark' : 'w-2 bg-outline hover:bg-muted'
            )}
          />
        ))}
      </div>

      <div className="p-6 max-w-lg mx-auto w-full space-y-3">
        {isLast ? (
          <>
            <Button className="w-full" onClick={() => nav('/inscription')}>
              Créer mon compte
            </Button>
            <Link to="/connexion" className="block text-center text-sm text-muted py-2">
              J'ai déjà un compte
            </Link>
          </>
        ) : (
          <div className="flex gap-3">
            {!isFirst && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="btn-ghost px-4 shrink-0"
                aria-label="Précédent"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <Button className="flex-1" onClick={() => setStep(s => s + 1)}>
              Suivant <ChevronRight size={18} />
            </Button>
          </div>
        )}
        {!isLast && (
          <button
            onClick={() => nav('/connexion')}
            className="block w-full text-center text-sm text-muted py-2"
          >
            Passer
          </button>
        )}
      </div>
    </div>
  );
}