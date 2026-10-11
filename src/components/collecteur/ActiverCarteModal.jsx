import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { CreditCard } from 'lucide-react';

export default function ActiverCarteModal({ open, onClose, onConfirm, client }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Activer la carte"
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Non, annuler
          </Button>
          <Button className="flex-1" onClick={onConfirm}>
            Oui, confirmer
          </Button>
        </>
      }
    >
      <div className="flex items-center justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-primary-light/10 dark:bg-primary-dark/15 flex items-center justify-center">
          <CreditCard size={28} className="text-primary-light dark:text-primary-dark" />
        </div>
      </div>

      <p className="text-center text-sm mb-4">
        Confirmez-vous que le client{' '}
        <b className="text-content-light dark:text-content-dark">{client?.name}</b> a bien payé
        les frais de carte de <span className="font-mono font-bold">200 FCFA</span> ?
      </p>

      <p className="text-xs text-muted text-center">
        Ce paiement sera enregistré et apparaîtra dans les tableaux de la secrétaire.
      </p>
    </Modal>
  );
}