import { cx } from '../../lib/helpers';

export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  };
  return (
    <button className={cx(variants[variant], className)} {...props}>
      {children}
    </button>
  );
}