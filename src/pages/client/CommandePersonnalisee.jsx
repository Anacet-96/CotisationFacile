import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Sparkles, Image as ImageIcon, X, Upload } from 'lucide-react';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';

const MAX_PHOTOS = 5;

export default function CommandePersonnalisee() {
  const nav = useNavigate();
  const [form, setForm] = useState({ description: '', price: '', message: '' });
  const [photos, setPhotos] = useState([]); // [{ file, preview }]
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  function addPhotos(e) {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - photos.length;
    const newPhotos = files.slice(0, remaining).map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setPhotos(p => [...p, ...newPhotos]);
    e.target.value = ''; // reset input pour permettre de re-uploader
  }

  function removePhoto(idx) {
    setPhotos(p => {
      const target = p[idx];
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return p.filter((_, i) => i !== idx);
    });
  }

  function submit(e) {
    e.preventDefault();
    setErr('');
    if (!form.description.trim()) return setErr('Décrivez le produit souhaité.');
    // TODO Supabase : upload des photos dans Storage + INSERT custom_orders
    //   - bucket "custom-order-photos"
    //   - photos: [{ url, path }]
    setSent(true);
  }

  if (sent) {
    return (
      <>
        <Header title="Commande personnalisée" />
        <div className="p-6 max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-secondary-light/15 dark:bg-secondary-dark/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} className="text-secondary-light dark:text-secondary-dark" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold mb-3">Demande envoyée !</h1>
          <p className="text-muted mb-8">
            Votre commande a été transmise à l'administrateur. Vous recevrez une notification
            dès qu'elle sera traitée (acceptée, refusée, ou ajoutée au catalogue).
          </p>
          <Button onClick={() => nav('/client/produits')}>Retour au catalogue</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Commande personnalisée" />
      <div className="p-4 max-w-lg mx-auto space-y-4">
        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm text-muted">
          <ArrowLeft size={16} /> Retour
        </button>

        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-primary-light dark:text-primary-dark" />
            <h2 className="font-heading font-bold">Un produit qui n'est pas au catalogue ?</h2>
          </div>
          <p className="text-sm text-muted">
            Décrivez le produit que vous souhaitez, avec si possible son prix estimé.
            Ajoutez des photos pour mieux illustrer votre demande.
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-4">
          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-muted">Description du produit *</label>
            <textarea
              className="input mt-1 min-h-[120px] resize-none"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Ex : Un congélateur 150L pour ma boutique…"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
              <ImageIcon size={14} />
              Photos (facultatif, {photos.length}/{MAX_PHOTOS})
            </label>

            <p className="text-[11px] text-muted mt-1 mb-2">
              Ajoutez jusqu'à {MAX_PHOTOS} photos pour illustrer votre demande.
            </p>

            {/* Grille d'aperçus */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-outline/40">
                  <img src={p.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                    aria-label="Retirer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {photos.length < MAX_PHOTOS && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-outline flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary-light dark:hover:border-primary-dark transition text-muted">
                  <Upload size={20} />
                  <span className="text-[10px] font-semibold">Ajouter</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={addPhotos}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Prix estimé */}
          <div>
            <label className="text-xs font-semibold text-muted">Prix estimé (facultatif)</label>
            <div className="relative mt-1">
              <input
                className="input pr-16"
                type="text"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="Ex : 180000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted font-mono">
                FCFA
              </span>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-semibold text-muted">Message (facultatif)</label>
            <textarea
              className="input mt-1 min-h-[80px] resize-none"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Précisions, délais, préférences…"
            />
          </div>

          {err && <p className="text-sm text-red-500">{err}</p>}

          <Button type="submit" className="w-full">Envoyer ma demande</Button>
        </form>
      </div>
    </>
  );
}