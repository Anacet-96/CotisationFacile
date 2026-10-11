import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ImageUpload from '../ui/ImageUpload';
import { Package } from 'lucide-react';
import { useMockStore } from '../../lib/mockStore';
import { cx } from '../../lib/helpers';

export default function KitItemFormModal({ open, onClose, onSave, item = null }) {
  const isEdit = !!item;
  const store = useMockStore();
  const [form, setForm] = useState({ name: '', price: '', photo_url: null, kit_ids: [] });
  const [err, setErr] = useState('');

  // ⚠️ LECTURE DIRECTE depuis le store — plus aucune prop à passer
  const allKits = store.products.filter(p => p.product_type === 'kit');

  // Debug console (regarde F12 → Console)
  useEffect(() => {
    if (open) {
      console.log('[KitItemFormModal] Kits détectés :', allKits.length, allKits.map(k => `${k.name} (${k.id})`));
    }
  }, [open, allKits.length]);

  useEffect(() => {
    if (open) {
      setForm({
        name: item?.name || '',
        price: item?.price ? String(item.price) : '',
        photo_url: item?.photo_url || null,
        kit_ids: item?.kit_ids || [],
      });
      setErr('');
    }
  }, [open, item]);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function toggleKit(kitId) {
    setForm(f => {
      const has = f.kit_ids.includes(kitId);
      return {
        ...f,
        kit_ids: has ? f.kit_ids.filter(k => k !== kitId) : [...f.kit_ids, kitId],
      };
    });
  }

  function submit() {
    setErr('');
    if (!form.name.trim()) return setErr('Le nom est obligatoire.');
    const price = parseInt(form.price, 10);
    if (!price || price <= 0) return setErr('Le prix doit être un nombre positif.');
    if (form.kit_ids.length === 0) return setErr('Sélectionnez au moins un kit.');
    onSave({
      name: form.name.trim(),
      price,
      photo_url: form.photo_url,
      kit_ids: form.kit_ids,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Modifier l'item" : 'Nouvel item de kit'}
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button className="flex-1" onClick={submit}>
            {isEdit ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <ImageUpload
          label="Image de l'item"
          value={form.photo_url}
          onChange={url => set('photo_url', url)}
        />

        <div>
          <label className="text-xs font-semibold text-muted">Nom de l'item *</label>
          <input
            className="input mt-1"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ex : Riz 25kg"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted">Prix unitaire (FCFA) *</label>
          <div className="relative mt-1">
            <input
              className="input pr-16"
              type="number"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="Ex : 15000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted font-mono">
              FCFA
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted flex items-center gap-1.5 mb-2">
            <Package size={14} />
            Kits contenant cet item *
            <span className="text-[10px] font-normal normal-case">
              ({allKits.length} disponible{allKits.length > 1 ? 's' : ''})
            </span>
          </label>

          {allKits.length === 0 ? (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-700 dark:text-amber-400">
              <p className="font-semibold mb-1">Aucun kit n'existe</p>
              <p>Ferme ce modal et va dans l'onglet "Kits" pour en créer un d'abord.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allKits.map(k => {
                const checked = form.kit_ids.includes(k.id);
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => toggleKit(k.id)}
                    className={cx(
                      'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left',
                      checked
                        ? 'border-primary-light dark:border-primary-dark bg-primary-light/10 dark:bg-primary-dark/20'
                        : 'border-outline/40 hover:border-primary-light/40'
                    )}
                  >
                    <div className={cx(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0',
                      checked
                        ? 'border-primary-light dark:border-primary-dark bg-primary-light dark:bg-primary-dark text-white'
                        : 'border-outline'
                    )}>
                      {checked && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{k.name}</p>
                      <p className="text-xs text-muted truncate">{k.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-[11px] text-muted mt-2">
            Un item peut apparaître dans plusieurs kits en même temps.
          </p>
        </div>

        {err && <p className="text-sm text-red-500">{err}</p>}
      </div>
    </Modal>
  );
}