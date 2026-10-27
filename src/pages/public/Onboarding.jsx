import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PiggyBank, UserCheck, LineChart, ChevronLeft, ChevronRight,
  Download, CheckCircle2, Smartphone, Share, Plus,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { cx } from '../../lib/helpers';
import { usePWAInstall } from '../../hooks/usePWAInstall';

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
  const [iosModalOpen, setIosModalOpen] = useState(false);
  const nav = useNavigate();
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();

  const slide = SLIDES[step];
  const Icon = slide.icon;
  const isFirst = step === 0;
  const isLast = step === SLIDES.length - 1;

  async function handleInstall() {
    if (isIOS) {
      setIosModalOpen(true);
      return;
    }
    const res = await promptInstall();
    if (res.outcome === 'unavailable' && !isInstalled) {
      // Prompt pas encore prêt (ex: déjà installée, ou browser non compatible)
      alert("L'installation n'est pas disponible sur ce navigateur. Essayez Chrome, Edge ou Safari (iOS).");
    }
  }

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

            {/* Bouton Installer l'app */}
            {isInstalled ? (
              <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary-light/10 dark:bg-secondary-dark/15 text-secondary-light dark:text-secondary-dark text-sm font-semibold min-h-[48px]">
                <CheckCircle2 size={18} /> Application installée
              </div>
            ) : (canInstall || isIOS) ? (
              <Button variant="ghost" className="w-full" onClick={handleInstall}>
                <Download size={18} /> Installer l'app
              </Button>
            ) : (
              <div className="w-full text-center text-xs text-muted py-2 px-4 rounded-xl bg-black/5 dark:bg-white/5">
                Pour installer l'app, ouvrez ce site dans Chrome, Edge ou Safari (iOS).
              </div>
            )}

            <Link
              to="/connexion"
              className="block text-center text-sm text-muted py-2"
            >
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

      {/* Modal instructions iOS */}
      <Modal
        open={iosModalOpen}
        onClose={() => setIosModalOpen(false)}
        title="Installer sur iPhone / iPad"
        footer={<Button className="w-full" onClick={() => setIosModalOpen(false)}>Compris</Button>}
      >
        <p className="text-sm text-muted mb-4">
          Sur iOS, l'installation se fait manuellement depuis Safari :
        </p>
        <ol className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-light/10 dark:bg-primary-dark/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary-light dark:text-primary-dark">1</span>
            <span className="flex items-center gap-1.5 flex-wrap">
              Appuyez sur le bouton <Share size={14} className="inline" /> <b>Partager</b> (carré avec flèche en bas de l'écran).
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-light/10 dark:bg-primary-dark/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary-light dark:text-primary-dark">2</span>
            <span className="flex items-center gap-1.5 flex-wrap">
              Faites défiler et appuyez sur <Plus size={14} className="inline" /> <b>Sur l'écran d'accueil</b>.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-light/10 dark:bg-primary-dark/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary-light dark:text-primary-dark">3</span>
            <span>Appuyez sur <b>Ajouter</b> en haut à droite.</span>
          </li>
        </ol>
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
          <Smartphone size={14} className="shrink-0 mt-0.5" />
          L'icône Emilio apparaîtra sur votre écran d'accueil comme une vraie application.
        </div>
      </Modal>
    </div>
  );
}