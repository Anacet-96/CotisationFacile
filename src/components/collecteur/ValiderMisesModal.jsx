import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatFCFA } from '../../lib/helpers';

export default function ValiderMisesModal({ open, onClose, onConfirm, client, product, count, pricePerDay }) {
  const total = count * pricePerDay;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirmer les mises"
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button className="flex-1" onClick={onConfirm}>
            Confirmer
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted mb-4">
        Vous confirmez <b className="text-content-light dark:text-content-dark">{count} mise{count > 1 ? 's' : ''}</b> pour{' '}
        <b className="text-content-light dark:text-content-dark">{client?.name}</b> sur{' '}
        <b className="text-content-light dark:text-content-dark">{product?.name}</b> ?
      </p>

      <div className="rounded-xl bg-primary-light/10 dark:bg-primary-dark/15 p-4 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Nombre de mises</span>
          <span className="font-mono font-semibold">{count}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Prix/jour</span>
          <span className="font-mono font-semibold">{formatFCFA(pricePerDay)}</span>
        </div>
        <div className="flex justify-between text-base pt-2 border-t border-primary-light/20 dark:border-primary-dark/20">
          <span className="font-semibold">Total</span>
          <span className="font-mono font-bold text-primary-light dark:text-primary-dark">
            {formatFCFA(total)}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted mt-4">
        Une fois validées, ces mises seront verrouillées pour la comptabilité de la secrétaire.
      </p>
    </Modal>
  );
}