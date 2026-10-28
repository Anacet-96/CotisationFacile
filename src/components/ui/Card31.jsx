import { Check, Lock } from 'lucide-react';
import { cx } from '../../lib/helpers';

/**
 * Grille 31 cases.
 * @param {Array} days - [{ day_number, filled, filled_at, is_locked }]
 * @param {Function} onToggle - (day_number) => void — null = lecture seule
 * @param {Boolean} readOnly
 * @param {Boolean} compact
 * @param {Set<number>} pendingDays - jours sélectionnés non encore validés
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
        const isFilled = !!day?.filled;
        const isPending = pending.has(n);
        const isLockedBySec = !!day?.is_locked;

        // 1. Le jour précédent est-il rempli (ou en attente de validation) ?
        const prevDay = map.get(n - 1);
        const isPrevValid = n === 1 || prevDay?.filled || pending.has(n - 1);

        // 2. Le jour suivant est-il rempli ? (empêche de créer des trous en décochant)
        const nextDay = map.get(n + 1);
        const isNextValid = nextDay?.filled || pending.has(n + 1);

        // 3. Peut-on cliquer ?
        const canCheck = !readOnly && !isLockedBySec && isPrevValid;
        const canUncheck = !readOnly && !isLockedBySec && !isNextValid;
        
        const isClickable = (isFilled || isPending) ? canUncheck : canCheck;

        // 4. Doit-on afficher un cadenas ?
        // - Soit c'est verrouillé par la secrétaire
        // - Soit on ne peut pas encore y toucher car le précédent n'est pas validé
        const showLock = !readOnly && !isFilled && !isPending && (!isPrevValid || isLockedBySec);

        return (
          <button
            key={n}
            type="button"
            disabled={!isClickable || !onToggle}
            onClick={() => isClickable && onToggle(n)}
            title={
              isLockedBySec
                ? `Jour ${n} · Verrouillé par la secrétaire`
                : isFilled || isPending
                  ? `Jour ${n} · Cliquer pour dévalider`
                  : !isPrevValid
                    ? `Jour ${n} · Validez d'abord le jour ${n - 1}`
                    : `Jour ${n}`
            }
            className={cx(
              'aspect-square rounded-full flex items-center justify-center font-mono font-semibold transition border-2',
              compact
                ? 'text-[10px] min-w-[26px] min-h-[26px]'
                : 'text-sm min-w-[40px] min-h-[40px]',
              
              // Rempli et validé
              isFilled && !isPending && 'bg-primary-light dark:bg-primary-dark text-white border-transparent shadow',
              // Sélectionné en attente
              isPending && !isFilled && 'bg-amber-400 text-white border-amber-500 shadow-md scale-105',
              // Vide et cliquable (prochain jour)
              !isFilled && !isPending && isClickable && 'bg-black/5 dark:bg-white/10 text-muted border-transparent hover:scale-105 active:scale-95 cursor-pointer',
              // Vide et bloqué (futur)
              !isFilled && !isPending && !isClickable && 'bg-black/5 dark:bg-white/10 text-muted/40 border-transparent',
              
              // Verrouillé par la secrétaire
              isLockedBySec && 'opacity-80 ring-2 ring-secondary-light/40',
            )}
          >
            {isFilled && !isPending ? (
              <Check size={compact ? 11 : 16} strokeWidth={3} />
            ) : isPending ? (
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