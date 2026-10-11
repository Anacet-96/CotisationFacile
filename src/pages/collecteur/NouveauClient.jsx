import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import { mockUsers } from '../../lib/mockData';
import { generateClientNumber } from '../../lib/helpers';

const VILLES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon'];

export default function NouveauClient() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    firstname: '', lastname: '', phone: '', city: '', district: '', profession: '',
  });
  const [err, setErr] = useState('');
  const [created, setCreated] = useState(null);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function submit(e) {
    e.preventDefault();
    setErr('');
    if (!form.firstname || !form.lastname || !form.phone || !form.city || !form.district) {
      return setErr('Prénom, Nom, Téléphone, Ville et Quartier sont obligatoires.');
    }

    // TODO Supabase : INSERT INTO profiles (name, phone, city, district, profession, role='client', collector_id=user.id)
    //                → le trigger handle_new_user / generate_client_number s'occupe du numéro CT-XXXXX
    const next = generateClientNumber(mockUsers.filter(u => u.client_number).map(u => u.client_number));
    setCreated({ ...form, client_number: next });
  }

  if (created) {
    return (
      <>
        <Header title="Client créé" />
        <div className="p-6 max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-secondary-light/15 dark:bg-secondary-dark/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} className="text-secondary-light dark:text-secondary-dark" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold mb-3">Client créé !</h1>
          <p className="text-muted mb-2">
            <b className="text-content-light dark:text-content-dark">
              {created.firstname} {created.lastname}
            </b>
          </p>
          <p className="text-sm text-muted mb-8">
            Numéro client : <span className="font-mono font-bold">{created.client_number}</span>
          </p>
          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={() => {
                // TODO Supabase : naviguer vers le vrai id créé
                alert('Le client sera bientôt disponible dans la liste (mock).');
                nav('/collecteur');
              }}
            >
              Retour à mes clients
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Nouveau client" />
      <div className="p-4 max-w-lg mx-auto space-y-4">
        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm text-muted">
          <ArrowLeft size={16} /> Retour
        </button>

        <div className="card">
          <p className="text-sm text-muted">
            Créez le profil d'un client qui n'est pas à l'aise avec la technologie.
            Le numéro client est généré automatiquement.
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted">Prénom *</label>
              <input className="input mt-1" value={form.firstname} onChange={e => set('firstname', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted">Nom *</label>
              <input className="input mt-1" value={form.lastname} onChange={e => set('lastname', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted">Téléphone *</label>
            <input className="input mt-1" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted">Ville *</label>
            <select className="input mt-1" value={form.city} onChange={e => set('city', e.target.value)}>
              <option value="">— Choisir —</option>
              {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted">Quartier *</label>
            <input className="input mt-1" value={form.district} onChange={e => set('district', e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted">Profession (facultatif)</label>
            <input className="input mt-1" value={form.profession} onChange={e => set('profession', e.target.value)} />
          </div>

          {err && <p className="text-sm text-red-500">{err}</p>}

          <Button type="submit" className="w-full">Créer le client</Button>
        </form>
      </div>
    </>
  );
}