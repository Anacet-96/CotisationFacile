import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ImageUpload from '../ui/ImageUpload';

export default function KitFormModal({ open, onClose, onSave, kit = null }) {
  const isEdit = !!kit;
  const [form, setForm] = useState({
    name: '',
    description: '',
    photo_url: null,
  });
  const [err, setErr] = useState('');

  // Reset quand on ouvre
  useEffect(() => {
    if (open) {
      setForm({
        name: kit?.name || '',
        description: kit?.description || '',
        photo_url: kit?.photo_url || null,
      });
      setErr('');
    }
  }, [open, kit]);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function submit() {
    setErr('');
    if (!form.name.trim()) return setErr('Le nom est obligatoire.');
    if (!form.description.trim()) return setErr('La description est obligatoire.');
    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      photo_url: form.photo_url,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier le kit' : 'Ajouter un kit'}
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button className="flex-1" onClick={submit}>
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <ImageUpload
          label="Image du kit"
          value={form.photo_url}
          onChange={url => set('photo_url', url)}
        />

        <div>
          <label className="text-xs font-semibold text-muted">Nom du kit *</label>
          <input
            className="input mt-1"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ex : Kit Ravitaillement"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted">Description *</label>
          <textarea
            className="input mt-1 min-h-[80px] resize-none"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Ex : Composez votre kit à la carte."
          />
        </div>

        {err && <p className="text-sm text-red-500">{err}</p>}
      </div>
    </Modal>
  );
}