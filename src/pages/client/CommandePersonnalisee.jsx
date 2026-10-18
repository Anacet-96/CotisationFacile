import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useMockStore } from '../../lib/mockStore';
import { addNotification } from '../../lib/api';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import MultiImageUpload from '../../components/ui/MultiImageUpload';

export default function CommandePersonnalisee() {
  const nav = useNavigate();
  const { user } = useAuth();
  const store = useMockStore();

  const [form, setForm] = useState({ description: '', price: '', message: '' });
  const [photos, setPhotos] = useState([]);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');

    if (!form.description.trim()) return setErr('Décrivez le produit souhaité.');

    setLoading(true);

    const { error } = await supabase.from('custom_orders').insert({
      client_id: user.id,
      description: form.description.trim(),
      estimated_price: parseInt(form.price, 10) || null,
      message: form.message.trim() || null,
      photos: photos,
      status: 'en_attente',
    });

    if (error) {
      setLoading(false);
      console.error('Commande :', error);
      return setErr(error.message);
    }

    // Notifier les admins
    const admins = store.users.filter(u => u.role === 'admin');
    for (const admin of admins) {
      await addNotification({
        userId: admin.id,
        type: 'nouvelle_commande',
        message: `${user.name} a envoyé une commande personnalisée : "${form.description.slice(0, 60)}${form.description.length > 60 ? '…' : ''}"`,
        link: '/admin/commandes',
      });
    }

    setLoading(false);
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
          <div>
            <label className="text-xs font-semibold text-muted">Description du produit *</label>
            <textarea
              className="input mt-1 min-h-[120px] resize-none"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Ex : Un congélateur 150L pour ma boutique…"
            />
          </div>

          <MultiImageUpload
            values={photos}
            onChange={setPhotos}
            max={5}
            label="Photos"
            folder="orders"
          />

          <div>
            <label className="text-xs font-semibold text-muted">Prix estimé (facultatif)</label>
            <div className="relative mt-1">
              <input
                className="input pr-16"
                type="number"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="Ex : 180000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted font-mono">
                FCFA
              </span>
            </div>
          </div>

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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Envoyer ma demande'}
          </Button>
        </form>
      </div>
    </>
  );
}