import { Check } from 'lucide-react';
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
        const filled = !!day?.filled;
        const locked = !!day?.is_locked;
        const isPending = pending.has(n);
        const clickable = !readOnly && !locked && !!onToggle;

        return (
          <button
            key={n}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onToggle(n)}
            title={
              filled
                ? `Jour ${n} · ${new Date(day.filled_at).toLocaleDateString('fr-FR')}`
                : isPending
                  ? `Jour ${n} · en attente de validation`
                  : `Jour ${n}`
            }
            className={cx(
              'aspect-square rounded-full flex items-center justify-center font-mono font-semibold transition border-2',
              compact
                ? 'text-[10px] min-w-[26px] min-h-[26px]'
                : 'text-sm min-w-[40px] min-h-[40px]',
              // État : rempli (déjà validé)
              filled && !isPending && 'bg-primary-light dark:bg-primary-dark text-white border-transparent shadow',
              // État : pending (sélectionné, pas encore validé)
              isPending && !filled && 'bg-amber-400 text-white border-amber-500 shadow-md scale-105',
              // État : vide
              !filled && !isPending && 'bg-black/5 dark:bg-white/10 text-muted border-transparent',
              // État : verrouillé
              locked && 'opacity-60 cursor-not-allowed ring-2 ring-secondary-light/40',
              clickable && 'hover:scale-105 active:scale-95 cursor-pointer'
            )}
          >
            {filled && !isPending ? (
              <Check size={compact ? 11 : 16} strokeWidth={3} />
            ) : isPending ? (
              <Check size={compact ? 11 : 16} strokeWidth={3} />
            ) : (
              n
            )}
          </button>
        );
      })}
    </div>
  );
}