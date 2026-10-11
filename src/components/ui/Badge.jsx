import { cx } from '../../lib/helpers';

const COLORS = {
  primary: 'bg-primary-light/10 text-primary-light dark:bg-primary-dark/20 dark:text-primary-dark',
  success: 'bg-secondary-light/10 text-secondary-light dark:bg-secondary-dark/20 dark:text-secondary-dark',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  danger: 'bg-red-500/15 text-red-700 dark:text-red-400',
  neutral: 'bg-black/5 text-muted dark:bg-white/10',
};

export default function Badge({ color = 'neutral', children, className = '' }) {
  return (
    <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', COLORS[color], className)}>
      {children}
    </span>
  );
}