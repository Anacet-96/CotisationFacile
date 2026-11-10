import { Check, Lock } from 'lucide-react';
import { cx } from '../../lib/helpers';

/**
 * Grille 31 cases.
 * @param {Array} days - [{ day_number, filled, filled_at, is_locked }]
 * @param {Function} onToggle - (day_number) => void — null = lecture seule
 * @param {Boolean} readOnly
 * @param {Boolean} compact
 * @param {Set<number>} pendingDays - jours sélectionnés non encore validés (Jaune)
 */
export default function Card31({
  days = [],
  onToggle = null,
  readOnly = false,
  compact = false,
  pendingDays = null,
}) {
  const map = new Map(days.map(d => [d.day_number, d]));
  const pending = pendingDays || new Set();

  return (
    <div className={cx('grid grid-cols-7', compact ? 'gap-1' : 'gap-2 sm:gap-2.5')}>
      {Array.from({ length: 31 }, (_, i) => i + 1).map(n => {
        const day = map.get(n);
        const isFilled = !!day?.filled;      // Validé (Bleu Ciel ou Violet)
        const isPending = pending.has(n);    // Sélectionné (Jaune)
        const isLockedBySec = !!day?.is_locked; // Validé par secrétaire (Violet)

        // Le jour précédent est-il rempli ou sélectionné ?
        const prevDay = map.get(n - 1);
        const isPrevValid = n === 1 || prevDay?.filled || pending.has(n - 1);

        // RÈGLE MÉTIER : 
        // - On ne peut cliquer que sur un jour vide (pour le sélectionner) ou un jour jaune (pour le désélectionner).
        // - Les jours remplis (Bleu Ciel / Violet) sont totalement verrouillés.
        const canCheck = !readOnly && !isLockedBySec && isPrevValid && !isFilled;
        const canUncheck = !readOnly && !isLockedBySec && isPending;
        
        const isClickable = isPending ? canUncheck : canCheck;

        // Doit-on afficher un cadenas sur un jour vide ?
        const showLock = !readOnly && !isFilled && !isPending && (!isPrevValid || isLockedBySec);

        return (
          <button
            key={n}
            type="button"
            disabled={!isClickable || !onToggle}
            onClick={() => isClickable && onToggle(n)}
            title={
              isLockedBySec
                ? `Jour ${n} · Validé définitivement par la secrétaire`
                : isFilled
                  ? `Jour ${n} · Validé par vous (en attente de la secrétaire)`
                  : isPending
                    ? `Jour ${n} · Cliquer pour annuler la sélection`
                    : !isPrevValid
                      ? `Jour ${n} · Validez d'abord le jour ${n - 1}`
                      : `Jour ${n}`
            }
            className={cx(
              'aspect-square rounded-full flex items-center justify-center font-mono font-semibold transition border-2',
              compact
                ? 'text-[10px] min-w-[26px] min-h-[26px]'
                : 'text-sm min-w-[40px] min-h-[40px]',
              
              // 1. Sélection en cours (Jaune) - Cliquable pour annuler
              isPending && 'bg-amber-400 text-white border-amber-500 shadow-md scale-105 cursor-pointer',
              
              // 2. Validé par le collecteur (Bleu Ciel) - NON CLIQUABLE
              isFilled && !isLockedBySec && 'bg-sky-500 text-white border-sky-600 shadow cursor-default',
              
              // 3. Validé par la secrétaire (Violet) - NON CLIQUABLE
              isFilled && isLockedBySec && 'bg-primary-light dark:bg-primary-dark text-white border-transparent shadow cursor-default ring-2 ring-primary-light/30 dark:ring-primary-dark/30',
              
              // 4. Vide et cliquable (Prochain jour) - Curseur main
              !isFilled && !isPending && isClickable && 'bg-black/5 dark:bg-white/10 text-muted border-transparent hover:scale-105 active:scale-95 cursor-pointer',
              
              // 5. Vide et bloqué (Futur) - Curseur interdit
              !isFilled && !isPending && !isClickable && 'bg-black/5 dark:bg-white/10 text-muted/40 border-transparent cursor-not-allowed',
            )}
          >
            {isFilled || isPending ? (
              <Check size={compact ? 11 : 16} strokeWidth={3} />
            ) : showLock ? (
              <Lock size={compact ? 10 : 14} className="text-muted/60" />
            ) : (
              n
            )}
          </button>
        );
      })}
    </div>
  );
}