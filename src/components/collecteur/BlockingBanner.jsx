import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function BlockingBanner({ reason, type }) {
  const isTodayValidated = type === 'today_validated';

  return (
    <div
      className={
        isTodayValidated
          ? 'rounded-2xl bg-secondary-light/10 dark:bg-secondary-dark/15 border-2 border-secondary-light/40 dark:border-secondary-dark/50 p-4 flex items-start gap-3'
          : 'rounded-2xl bg-red-500/10 border-2 border-red-500/40 p-4 flex items-start gap-3'
      }
    >
      {isTodayValidated ? (
        <CheckCircle2 size={22} className="text-secondary-light dark:text-secondary-dark shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle size={22} className="text-red-500 shrink-0 mt-0.5" />
      )}
      <div className="min-w-0">
        <p
          className={
            isTodayValidated
              ? 'font-semibold text-secondary-light dark:text-secondary-dark'
              : 'font-semibold text-red-600 dark:text-red-400'
          }
        >
          {isTodayValidated ? 'Journée terminée' : 'Journée précédente non validée'}
        </p>
        <p
          className={
            isTodayValidated
              ? 'text-sm text-secondary-light/80 dark:text-secondary-dark/80 mt-0.5'
              : 'text-sm text-red-600/80 dark:text-red-400/80 mt-0.5'
          }
        >
          {reason}
        </p>
      </div>
    </div>
  );
}