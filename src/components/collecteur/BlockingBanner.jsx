import { AlertTriangle } from 'lucide-react';

export default function BlockingBanner({ reason }) {
  return (
    <div className="rounded-2xl bg-red-500/10 border-2 border-red-500/40 p-4 flex items-start gap-3">
      <AlertTriangle size={22} className="text-red-500 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="font-semibold text-red-600 dark:text-red-400">
          Journée précédente non validée
        </p>
        <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-0.5">
          {reason} Vous ne pouvez pas enregistrer de nouvelles mises aujourd'hui. Consultation
          seule.
        </p>
      </div>
    </div>
  );
}