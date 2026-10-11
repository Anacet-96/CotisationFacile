import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-card-light dark:bg-card-dark w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-heading font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-5 flex gap-3">{footer}</div>}
      </div>
    </div>
  );
}