export default function ProgressBar({ value = 0, className = '' }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-primary-light dark:bg-primary-dark transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}